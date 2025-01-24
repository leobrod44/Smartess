package rtsp

import (
	common_rabbitmq "Smartess/go/common/rabbitmq"
	logs "Smartess/go/hub/logger"
	"bytes"
	"fmt"
	"strings"

	"os"
	"os/exec"
	"time"

	"github.com/bluenviron/gortsplib/v4"
	"github.com/streadway/amqp"
	"gopkg.in/yaml.v3"
)

type RtspProcessor struct {
	instance *common_rabbitmq.RabbitMQInstance
	client   *gortsplib.Client
	cameras  Cameras
	Logger   *logs.Logger
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
		instance: instance,
		client:   &gortsplib.Client{},
		cameras:  cameras,
		Logger:   logger,
	}, nil
}

func (rtsp *RtspProcessor) Start() {
	for _, camera := range rtsp.cameras.CameraConfigs {
		streamURL := camera.StreamURL
		rtsp.Logger.Info(fmt.Sprintf("stream url %s", streamURL))
		rtsp.Logger.Info(fmt.Sprintf("Starting RTSP stream %s", camera.Name))
		tmpDir := "/tmp/data/" + camera.Name
		err := os.MkdirAll(tmpDir, 0755)
		if err != nil {
			rtsp.Logger.Error(fmt.Sprintf("Error creating directory %v: %v", tmpDir, err))
		}
		cmd := exec.Command("ffmpeg",
			"-rtsp_transport", "tcp", // Use TCP for RTSP transport
			"-i", streamURL, // Input RTSP stream
			"-buffer_size", "1024000", // Set buffer size
			"-probesize", "50M", // Increase probe size
			"-analyzeduration", "20000000", // Increase analyze duration
			"-avoid_negative_ts", "make_zero", // Avoid negative timestamps
			"-c:v", "libx264", // Compress using H.264 codec
			"-preset", "fast", // Use fast preset for encoding
			"-crf", "23", // Control quality (lower = better)
			"-r", "15", // Force frame rate
			"-g", "30", // Set keyframe interval
			"-b:a", "64k", // Set audio bitrate
			"-f", "segment", // Enable segmentation
			"-segment_time", "10", // Segment duration
			"-reset_timestamps", "1", // Reset timestamps for each segment
			"-segment_format", "mp4", // Output format
			"-segment_list", fmt.Sprintf("%s/segments.m3u8", tmpDir), // HLS playlist
			"-segment_list_type", "m3u8", // HLS format
			"-segment_list_size", "0", // Unlimited segments
			"-segment_list_flags", "+live", // Make it a live playlist
			fmt.Sprintf("%s/segment-%%03d.mp4", tmpDir), // Segment output
		)
		time.Sleep(time.Second)

		rtsp.Logger.Info(fmt.Sprintf("Starting FFmpeg for stream %s", camera.Name))
		rtsp.Logger.Info(fmt.Sprintf("FFmpeg command: %v", cmd.String()))

		ffmpegOutput := &bytes.Buffer{}
		cmd.Stdout = ffmpegOutput
		cmd.Stderr = ffmpegOutput

		err = cmd.Start()
		if err != nil {
			rtsp.Logger.Error(fmt.Sprintf("Error starting FFmpeg for stream %s: %v", camera.Name, err))
		}

		go func(tmpDir string) {
			for {
				files, err := os.ReadDir(tmpDir)
				if err != nil {
					rtsp.Logger.Error(fmt.Sprintf("Error reading directory %v: %v", tmpDir, err))
					return
				}

				for _, file := range files {
					if file.IsDir() {
						continue
					}
					if !strings.Contains(file.Name(), "segments.m3u8") {
						rtsp.Logger.Info(fmt.Sprintf("Segment file: %v", file.Name()))
						segmentFilePath := fmt.Sprintf("%s/%s", tmpDir, file.Name())

						segmentFileContent, err := os.ReadFile(segmentFilePath)
						if err != nil {
							rtsp.Logger.Error(fmt.Sprintf("Error reading segment file %v: %v", segmentFilePath, err))
							continue
						}
						rtsp.Logger.Info((fmt.Sprintf("Publishing segment to queue: %v", segmentFilePath)))
						err = rtsp.instance.Channel.Publish(
							"videostream", // Default exchange
							fmt.Sprintf("videostream.hubid.%s", camera.Name), // Routing key (queue name)
							false, // Mandatory
							false, // Immediate
							amqp.Publishing{
								ContentType: "application/octet-stream", // Type of the content
								Body:        segmentFileContent,         // Content (segment file data)
							})
						if err != nil {
							rtsp.Logger.Error(fmt.Sprintf("Failed to publish segment to queue: %v", err))
						}
						err = os.Remove(segmentFilePath)
						if err != nil {
							rtsp.Logger.Error(fmt.Sprintf("Failed to remove segment file %v: %v", segmentFilePath, err))
							continue
						}
						rtsp.Logger.Info(fmt.Sprintf("Published segment to queue: %v", segmentFilePath))
					}
				}

				time.Sleep(time.Duration(camera.SegmentTime))
			}
		}(tmpDir)
	}
}

func (rtsp *RtspProcessor) Close() {
	rtsp.client.Close()
}
