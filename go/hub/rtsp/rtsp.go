package rtsp

import (
	common_rabbitmq "Smartess/go/common/rabbitmq"
	"Smartess/go/common/structures"
	logs "Smartess/go/hub/logger"
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"strings"
	"sync"

	"os"
	"os/exec"
	"time"

	"github.com/bluenviron/gortsplib/v4"
	"github.com/streadway/amqp"
	"gopkg.in/yaml.v3"
)

type RtspProcessor struct {
	instance      *common_rabbitmq.RabbitMQInstance
	client        *gortsplib.Client
	cameras       Cameras
	Logger        *logs.Logger
	activeCameras map[string]struct{}
	cmdMap        map[string]*exec.Cmd
	cancelMap     map[string]context.CancelFunc
	mu            sync.Mutex
}

type CameraConfig struct {
	Name        string `yaml:"name"`
	StreamURL   string `yaml:"streamURL"`
	SegmentTime int    `yaml:"segment_time"`
}

type Cameras struct {
	CameraConfigs []CameraConfig `yaml:"cameras"`
}

func Init(instance *common_rabbitmq.RabbitMQInstance, logger *logs.Logger) (RtspProcessor, error) {

	dir := "/app/config/hub/cameras.yaml"

	var cameras Cameras
	data, err := os.ReadFile(dir)
	if err != nil {
		return RtspProcessor{}, fmt.Errorf("failed to read file: %v", err)
	}

	err = yaml.Unmarshal(data, &cameras)
	if err != nil {
		return RtspProcessor{}, fmt.Errorf("failed to unmarshal yaml: %v", err)
	}
	return RtspProcessor{
		instance:      instance,
		client:        &gortsplib.Client{},
		cameras:       cameras,
		Logger:        logger,
		activeCameras: make(map[string]struct{}),
		cmdMap:        make(map[string]*exec.Cmd),
		cancelMap:     make(map[string]context.CancelFunc),
	}, nil
}

func (r *RtspProcessor) LoadCamerasConfig() (Cameras, error) {
	dir := "/app/config/hub/cameras.yaml"

	var cameras Cameras
	data, err := os.ReadFile(dir)
	if err != nil {
		return Cameras{}, fmt.Errorf("failed to read file: %v", err)
	}

	err = yaml.Unmarshal(data, &cameras)
	if err != nil {
		return Cameras{}, fmt.Errorf("failed to unmarshal yaml: %v", err)
	}

	return cameras, nil
}

func (rtsp *RtspProcessor) Start() {
	rtsp.mu.Lock()
	for _, camera := range rtsp.cameras.CameraConfigs {
		rtsp.startCamera(camera)
	}
	rtsp.mu.Unlock()

	ticker := time.NewTicker(10 * time.Second)
	go func() {
		for range ticker.C {
			rtsp.reloadCameras()
		}
	}()
}

func (rtsp *RtspProcessor) startCamera(camera CameraConfig) {
	rtsp.mu.Lock()
	defer rtsp.mu.Unlock()

	if _, exists := rtsp.activeCameras[camera.Name]; exists {
		rtsp.Logger.Info(fmt.Sprintf("Camera %s is already active", camera.Name))
		return
	}

	streamURL := camera.StreamURL
	rtsp.Logger.Info(fmt.Sprintf("Starting RTSP stream %s", camera.Name))
	tmpDir := "/tmp/data/" + camera.Name
	err := os.MkdirAll(tmpDir, 0755)
	if err != nil {
		rtsp.Logger.Error(fmt.Sprintf("Error creating directory %v: %v", tmpDir, err))
	}

	cmd := exec.Command("ffmpeg",
		"-rtsp_transport", "tcp",
		"-i", streamURL,
		"-buffer_size", "1024000",
		"-probesize", "50M",
		"-analyzeduration", "20000000",
		"-avoid_negative_ts", "make_zero",
		"-c:v", "libx264",
		"-preset", "fast",
		"-crf", "23",
		"-r", "15",
		"-g", "30",
		"-b:a", "64k",
		"-f", "segment",
		"-segment_time", "10",
		"-reset_timestamps", "1",
		"-segment_format", "mp4",
		"-segment_list", fmt.Sprintf("%s/segments.m3u8", tmpDir),
		"-segment_list_type", "m3u8",
		"-segment_list_size", "0",
		"-segment_list_flags", "+live",
		fmt.Sprintf("%s/segment-%%03d.mp4", tmpDir),
	)

	ffmpegOutput := &bytes.Buffer{}
	cmd.Stdout = ffmpegOutput
	cmd.Stderr = ffmpegOutput

	if err := cmd.Start(); err != nil {
		rtsp.Logger.Error(fmt.Sprintf("Error starting FFmpeg for stream %s: %v", camera.Name, err))
		return
	}

	rtsp.cmdMap[camera.Name] = cmd

	ctx, cancel := context.WithCancel(context.Background())
	rtsp.cancelMap[camera.Name] = cancel

	go rtsp.processSegments(ctx, camera, tmpDir)
	rtsp.activeCameras[camera.Name] = struct{}{}

	go func() {
		err := cmd.Wait()
		rtsp.mu.Lock()
		defer rtsp.mu.Unlock()

		if _, exists := rtsp.activeCameras[camera.Name]; exists {
			rtsp.Logger.Error(fmt.Sprintf("FFmpeg for camera %s exited: %v", camera.Name, err))
			delete(rtsp.activeCameras, camera.Name)
			delete(rtsp.cmdMap, camera.Name)
			cancel()
			delete(rtsp.cancelMap, camera.Name)
		}
	}()
}

func (rtsp *RtspProcessor) stopCamera(name string) {
	rtsp.mu.Lock()
	defer rtsp.mu.Unlock()

	if cancel, exists := rtsp.cancelMap[name]; exists {
		cancel()
		delete(rtsp.cancelMap, name)
	}

	if cmd, exists := rtsp.cmdMap[name]; exists {
		if err := cmd.Process.Kill(); err != nil {
			rtsp.Logger.Error(fmt.Sprintf("Error killing FFmpeg process for %s: %v", name, err))
		}
		delete(rtsp.cmdMap, name)
	}

	delete(rtsp.activeCameras, name)

	tmpDir := "/tmp/data/" + name
	if err := os.RemoveAll(tmpDir); err != nil {
		rtsp.Logger.Error(fmt.Sprintf("Error cleaning directory %s: %v", tmpDir, err))
	}
}

func (rtsp *RtspProcessor) reloadCameras() {
	newCameras, err := rtsp.LoadCamerasConfig()
	if err != nil {
		rtsp.Logger.Error(fmt.Sprintf("Failed to reload cameras: %v", err))
		return
	}

	rtsp.mu.Lock()
	defer rtsp.mu.Unlock()

	newCameraNames := make(map[string]struct{})
	for _, camera := range newCameras.CameraConfigs {
		newCameraNames[camera.Name] = struct{}{}
	}

	// Stop cameras not present in the new config
	for name := range rtsp.activeCameras {
		if _, exists := newCameraNames[name]; !exists {
			rtsp.Logger.Info(fmt.Sprintf("Stopping camera %s", name))
			rtsp.stopCamera(name)
		}
	}

	// Start new cameras
	for _, camera := range newCameras.CameraConfigs {
		if _, exists := rtsp.activeCameras[camera.Name]; !exists {
			rtsp.Logger.Info(fmt.Sprintf("Starting new camera %s", camera.Name))
			rtsp.startCamera(camera)
		}
	}

	rtsp.cameras = newCameras
}

func (rtsp *RtspProcessor) processSegments(ctx context.Context, camera CameraConfig, tmpDir string) {
	ticker := time.NewTicker(time.Duration(camera.SegmentTime) * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			rtsp.Logger.Info(fmt.Sprintf("Stopping segment processing for %s", camera.Name))
			return
		case <-ticker.C:
			files, err := os.ReadDir(tmpDir)
			if err != nil {
				rtsp.Logger.Error(fmt.Sprintf("Error reading directory %s: %v", tmpDir, err))
				continue
			}

			for _, file := range files {
				if file.IsDir() || strings.Contains(file.Name(), "segments.m3u8") {
					continue
				}

				segmentPath := fmt.Sprintf("%s/%s", tmpDir, file.Name())
				content, err := os.ReadFile(segmentPath)
				if err != nil {
					rtsp.Logger.Error(fmt.Sprintf("Error reading segment %s: %v", segmentPath, err))
					continue
				}

				videoData := structures.VideoData{
					CameraID: camera.Name,
					Content:  content,
				}

				videoJson, err := json.Marshal(videoData)
				if err != nil {
					rtsp.Logger.Error(fmt.Sprintf("Failed to marshal video data: %v", err))
					continue
				}

				err = rtsp.instance.Channel.Publish(
					"videostream",
					fmt.Sprintf("videostream.hubid.%s", camera.Name),
					false,
					false,
					amqp.Publishing{
						ContentType: "application/octet-stream",
						Body:        videoJson,
					})
				if err != nil {
					rtsp.Logger.Error(fmt.Sprintf("Failed to publish segment: %v", err))
				}

				if err := os.Remove(segmentPath); err != nil {
					rtsp.Logger.Error(fmt.Sprintf("Failed to remove segment %s: %v", segmentPath, err))
				}
			}
		}
	}
}

func (rtsp *RtspProcessor) Close() {
	rtsp.mu.Lock()
	defer rtsp.mu.Unlock()

	for name := range rtsp.activeCameras {
		rtsp.stopCamera(name)
	}

	rtsp.client.Close()
}
