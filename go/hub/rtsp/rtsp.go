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

// func (rtsp *RtspProcessor) Start() {
// 	for _, stream := range rtsp.streams {
// 		// FFmpeg command for compression and segmentation
// 		username := stream.User.Username()
// 		password, _ := stream.User.Password()
// 		host := stream.Host
// 		path := stream.Path
// 		streamURL := "rtsp://" + username + ":" + password + "@" + host + path
// 		log.Printf("Starting stream URL: %v", streamURL)

// 		cmd := exec.Command("ffmpeg",
// 			"-i", streamURL, // Input RTSP stream
// 			"-c:v", "libx264", // Compress using H.264 codec
// 			"-preset", "fast", // Use fast preset for encoding
// 			"-crf", "23", // Control quality (lower = better)
// 			"-f", "segment", // Enable segmentation
// 			"-segment_time", "10", // Segment into 10-second chunks
// 			"-reset_timestamps", "1", // Reset timestamps for each segment
// 			"-segment_format", "mp4") // Output format
// 		// 	"-loglevel", "debug", // Add debug logging
// 		// 	"pipe:1") // Output to stdout

// 		log.Printf("FFmpeg command: %v", cmd.String())

// 		// Create a buffer to read FFmpeg's stdout
// 		ffmpegOutput := &bytes.Buffer{}
// 		cmd.Stdout = ffmpegOutput
// 		cmd.Stderr = ffmpegOutput // Capture errors for debugging

// 		// Start FFmpeg
// 		err := cmd.Start()
// 		if err != nil {
// 			log.Fatalf("Error starting FFmpeg for stream %s: %v", stream.String(), err)
// 		}
// Process FFmpeg output in a goroutine

// go func() {
// 	for {

// 		// Read chunk from FFmpeg's output
// 		chunk := make([]byte, 1024*1024) // Read 1 MB chunks
// 		n, err := ffmpegOutput.Read(chunk)
// 		if err != nil {
// 			log.Printf("Error reading FFmpeg output: %v", err)
// 			break
// 		}
// 		// Publish chunk to RabbitMQ
// 		log.Print("chunk read: %v", chunk[:n])
// 		err = rtsp.instance.Channel.Publish(
// 			"video_exchange", // Exchange name
// 			"video_stream",   // Routing key
// 			false,            // Mandatory
// 			false,            // Immediate
// 			amqp.Publishing{
// 				ContentType: "application/octet-stream",
// 				Body:        chunk[:n],
// 			},
// 		)
// 		if err != nil {
// 			log.Printf("Error publishing chunk to RabbitMQ: %v", err)
// 			break
// 		}

// 		log.Printf("Published %d bytes to RabbitMQ", n)
// 	}

//		// Wait for FFmpeg to exit
//		err = cmd.Wait()
//		if err != nil {
//			log.Printf("FFmpeg exited with error for stream %s: %v", stream.Host, err)
//		} else {
//			log.Printf("FFmpeg finished processing for stream %s", stream.Host)
//		}
//		log.Print("FFmpeg output: %v", ffmpegOutput.String())
//	}()
//
//		}
//	}
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
