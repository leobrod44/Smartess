package rtsp

import (
	common_rabbitmq "Smartess/go/common/rabbitmq"
	logs "Smartess/go/hub/logger"
	"bytes"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"os"
	"os/exec"
	"time"

	"github.com/bluenviron/gortsplib/v4"
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

	// Unmarshal the YAML data into the CameraConfig struct
	err = yaml.Unmarshal(data, &cameras)
	if err != nil {
		return RtspProcessor{}, fmt.Errorf("failed to unmarshal yaml: %v", err)
	}

	// Return the initialized RtspProcessor
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
			"-segment_time", "10", // Segment into 10-second chunks
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

		go func() {
			for {
				// Watch the temporary directory for new segments
				files, err := os.ReadDir(tmpDir)
				if err != nil {
					log.Printf("Error reading directory %v: %v", tmpDir, err)
					return
				}
				// Process each segment file
				for _, file := range files {
					if file.IsDir() {
						continue
					}
					if file.Name() != "segments.m3u8" {
						// Handle segment file
						segmentFilePath := fmt.Sprintf("%s/%s", tmpDir, file.Name())
						log.Printf("New segment file created: %s", segmentFilePath)

						// Open the segment file for reading
						segmentFile, err := os.Open(segmentFilePath)
						if err != nil {
							log.Printf("Error opening segment file %v: %v", segmentFilePath, err)
							continue
						}

						// Process segment bytes efficiently in larger chunks
						buf := make([]byte, 8192) // Reading 8KB at a time for better efficiency
						for {
							n, err := segmentFile.Read(buf)
							if err == io.EOF {
								break
							}
							if err != nil {
								log.Printf("Error reading segment file %v: %v", segmentFilePath, err)
								break
							}
							// Print the segment data (or process it as needed)
							log.Printf("Segment content: %s", string(buf[:n]))
						}
						segmentFile.Close()
					}
				}

				// Sleep for a short interval before checking again
				time.Sleep(500 * time.Millisecond)
			}
		}()

		// Wait for the FFmpeg command to finish
		err = cmd.Wait()
		if err != nil {
			log.Fatalf("FFmpeg command failed: %v", err)
		}
	}
}

func (rtsp *RtspProcessor) Close() {
	rtsp.client.Close()
}
