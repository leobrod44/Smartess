package rtsp

import (
	common_rabbitmq "Smartess/go/common/rabbitmq"
	logs "Smartess/go/hub/logger"
	"bytes"
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"os/exec"
	"strconv"
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
	Username    string `yaml:"username"`
	Password    string `yaml:"password"`
	Host        string `yaml:"host"`
	Path        string `yaml:"path"`
	SegmentTime int    `yaml:"segment_time"`
}

type Cameras struct {
	CameraConfigs []CameraConfig `yaml:"cameras"`
}

func Init(instance *common_rabbitmq.RabbitMQInstance, logger *logs.Logger) (RtspProcessor, error) {

	dir := "/app/config/hub/cameras.yaml"

	var cameras Cameras
	data, err := ioutil.ReadFile(dir)
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
		streamURL := "rtsp://" + camera.Username + ":" + camera.Password + "@" + camera.Host + "/" + camera.Path
		log.Printf("Starting stream URL: %v", streamURL)
		tmpDir := "/tmp/data" + camera.Name
		err := os.MkdirAll(tmpDir, 0755)
		if err != nil {
			log.Fatalf("Error creating temporary directory: %v", err)
		}
		cmd := exec.Command("ffmpeg",
			"-rtsp_transport", "tcp", // Use TCP for RTSP transport
			"-i", streamURL, // Input RTSP stream
			"-buffer_size", "1024000", // Set buffer size
			"-timeout", "3000000", // Set timeout
			"-c:v", "libx264", // Compress using H.264 codec
			"-preset", "fast", // Use fast preset for encoding
			"-crf", "23", // Control quality (lower = better)
			"-f", "segment", // Enable segmentation
			"-segment_time", strconv.Itoa(camera.SegmentTime), // Segment duration
			"-reset_timestamps", "1", // Reset timestamps for each segment
			"-segment_format", "mp4", // Output format
			"-segment_list", fmt.Sprintf("%s/segments.m3u8", tmpDir), // HLS playlist
			"-segment_list_type", "m3u8", // HLS format
			"-segment_list_size", "0", // Unlimited segments
			"-segment_list_flags", "+live", // Make it a live playlist
			fmt.Sprintf("%s/segment-%%03d.mp4", tmpDir)) // Segment output

		log.Printf("FFmpeg command: %v", cmd.String())

		ffmpegOutput := &bytes.Buffer{}
		cmd.Stdout = ffmpegOutput
		cmd.Stderr = ffmpegOutput

		err = cmd.Start()
		if err != nil {
			log.Fatalf("Error starting FFmpeg for stream %s: %v", camera.Name, err)
		}

		go func(tmpDir string) {
			for {
				files, err := os.ReadDir(tmpDir)
				if err != nil {
					log.Printf("Error reading directory %v: %v", tmpDir, err)
					return
				}

				for _, file := range files {
					if file.IsDir() {
						continue
					}
					if file.Name() != "segments.m3u8" {
						segmentFilePath := fmt.Sprintf("%s/%s", tmpDir, file.Name())
						log.Printf("New segment file created: %s", segmentFilePath)

						segmentFileContent, err := os.ReadFile(segmentFilePath)
						if err != nil {
							log.Printf("Error reading segment file %v: %v", segmentFilePath, err)
							continue
						}
						err = rtsp.instance.Channel.Publish(
							"video_exchange", // Default exchange
							"camera1",        // Routing key (queue name)
							false,            // Mandatory
							false,            // Immediate
							amqp.Publishing{
								ContentType: "application/octet-stream", // Type of the content
								Body:        segmentFileContent,         // Content (segment file data)
							})
						rtsp.Logger.Error(fmt.Sprintf("Failed to publish segment to queue: %v", err))
					}
				}

				time.Sleep(time.Duration(camera.SegmentTime) * time.Second)
			}
		}(tmpDir)
	}
}

func (rtsp *RtspProcessor) Close() {
	rtsp.client.Close()
}
