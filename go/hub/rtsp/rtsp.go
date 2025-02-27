package rtsp

import (
	common_rabbitmq "Smartess/go/common/rabbitmq"
	logs "Smartess/go/hub/logger"
	"fmt"
	"log"
	"strings"

	"os"
	"os/exec"
	"time"

	"github.com/bluenviron/gortsplib/v4"
	stream_amqp "github.com/rabbitmq/rabbitmq-stream-go-client/pkg/amqp"
	"github.com/rabbitmq/rabbitmq-stream-go-client/pkg/stream"
	"gopkg.in/yaml.v3"
)

type RtspProcessor struct {
	instance *common_rabbitmq.RabbitMQInstance
	client   *gortsplib.Client
	cameras  Cameras
	Logger   *logs.Logger
}

type CameraEnum int

func (d *CameraEnum) UnmarshalYAML(unmarshal func(interface{}) error) error {
	var s string
	if err := unmarshal(&s); err != nil {
		return err
	}

	switch s {
	case "REAL":
		*d = REAL
	case "ANT":
		*d = ANT
	case "MOCK":
		*d = MOCK
	default:
		return fmt.Errorf("invalid CameraEnum value: %s", s)
	}

	return nil
}

const (
	REAL CameraEnum = iota
	ANT
	MOCK
)

func (d CameraEnum) String() string {
	return [...]string{"REAL", "ANT", "MOCK"}[d]
}

type CameraConfig struct {
	Name        string     `yaml:"name"`
	Type        CameraEnum `yaml:"type"`
	StreamURL   string     `yaml:"streamURL"`
	SegmentTime int        `yaml:"segment_time"`
}

type Cameras struct {
	CameraConfigs []CameraConfig `yaml:"cameras"`
}
type StreamContext struct {
	dataChan  chan []byte
	errChan   chan error
	retries   int
	directory string
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
	rtsp.Logger.Info("Starting RTSP Processor")
	rtsp.Logger.Info(fmt.Sprintf("Cameras: %v", rtsp.cameras))
	for _, camera := range rtsp.cameras.CameraConfigs {
		rtsp.Logger.Info(fmt.Sprintf("Starting RTSP stream %s", camera.Name))
		// Validate RTSP stream before proceeding
		rtsp.Logger.Info(fmt.Sprintf("1.11"))
		// if err := validateRTSPStream(camera.StreamURL); err != nil {
		// 	rtsp.Logger.Error(fmt.Sprintf("Failed to validate RTSP stream: %v", err))
		// }
		rtsp.Logger.Info(fmt.Sprintf("1.1"))
		// Setup RabbitMQ stream environment
		env, producer, err := setupStreamEnvironment(camera.Name, "rabbitmq-stream://admin:admin@rabbitmq:5552/") // TODO clean setupStreamEnvironment(camera.StreamURL)
		if err != nil {
			rtsp.Logger.Error(fmt.Sprintf("Failed to setup stream environment: %v", err))
			panic(err)
		}

		defer env.Close()
		defer producer.Close()
		// Configure FFmpeg
		ctx := StreamContext{
			dataChan:  make(chan []byte),
			errChan:   make(chan error),
			retries:   0,
			directory: "/tmp/data/" + camera.Name,
		}

		config, err := rtsp.newFFmpegConfig(camera)

		if err != nil {
			rtsp.Logger.Error(fmt.Sprintf("Failed to create FFmpeg config: %v", err))
			panic(err)
		}
		// Main retry loop
		for ctx.retries = 0; ctx.retries < config.maxRetries; ctx.retries++ {
			if ctx.retries > 0 {
				rtsp.Logger.Warn(fmt.Sprintf("Reconnecting RTSP stream %s (%d/%d)", camera.Name, ctx.retries+1, config.maxRetries))
				time.Sleep(config.retryDelay)
			}
			// Create the temporary directory if it doesn't exist
			err := os.MkdirAll(ctx.directory, 0755)
			if err != nil {
				// Log and return error if directory creation fails
				ctx.errChan <- fmt.Errorf("error waiting for FFmpeg: %v", err)
				return
			}

			cmd := config.buildCommand()

			rtsp.Logger.Info(fmt.Sprintf("Starting FFmpeg for stream %s", camera.Name))
			if err := cmd.Start(); err != nil {
				ctx.errChan <- fmt.Errorf("error starting FFmpeg for stream %s: %v", camera.Name, err)
			}
			rtsp.Logger.Info(fmt.Sprintf("FFmpeg command: %v", cmd.String()))
			if err := cmd.Wait(); err != nil {
				log.Fatalf("Error waiting for ffmpeg: %v", err)
				ctx.errChan <- fmt.Errorf("error waiting for FFmpeg: %v", err)
				return
			}
		}

		go rtsp.streamRTSP(&camera, &ctx)
		go rtsp.sendData(&ctx, producer)
	}

}

// ----------------------------------------------------------------------

// streamURL := camera.StreamURL
// rtsp.Logger.Info(fmt.Sprintf("stream url %s", streamURL))
// rtsp.Logger.Info(fmt.Sprintf("Starting RTSP stream %s", camera.Name))
// tmpDir := "/tmp/data/" + camera.Name
// err := os.MkdirAll(tmpDir, 0755)
// if err != nil {
// 	rtsp.Logger.Error(fmt.Sprintf("Error creating directory %v: %v", tmpDir, err))
// }
// cmd := exec.Command("ffmpeg",
// 	"-rtsp_transport", "tcp", // Use TCP for RTSP transport
// 	"-i", streamURL, // Input RTSP stream
// 	"-buffer_size", "1024000", // Set buffer size
// 	"-probesize", "50M", // Increase probe size
// 	"-analyzeduration", "20000000", // Increase analyze duration
// 	"-avoid_negative_ts", "make_zero", // Avoid negative timestamps
// 	"-c:v", "libx264", // Compress using H.264 codec
// 	"-preset", "fast", // Use fast preset for encoding
// 	"-crf", "23", // Control quality (lower = better)
// 	"-r", "15", // Force frame rate
// 	"-g", "30", // Set keyframe interval
// 	"-b:a", "64k", // Set audio bitrate
// 	"-f", "segment", // Enable segmentation
// 	"-segment_time", "10", // Segment duration
// 	"-reset_timestamps", "1", // Reset timestamps for each segment
// 	"-segment_format", "mp4", // Output format
// 	"-segment_list", fmt.Sprintf("%s/segments.m3u8", tmpDir), // HLS playlist
// 	"-segment_list_type", "m3u8", // HLS format
// 	"-segment_list_size", "0", // Unlimited segments
// 	"-segment_list_flags", "+live", // Make it a live playlist
// 	fmt.Sprintf("%s/segment-%%03d.mp4", tmpDir), // Segment output
// )
// time.Sleep(time.Second)

// rtsp.Logger.Info(fmt.Sprintf("Starting FFmpeg for stream %s", camera.Name))
// rtsp.Logger.Info(fmt.Sprintf("FFmpeg command: %v", cmd.String()))

// ffmpegOutput := &bytes.Buffer{}
// cmd.Stdout = ffmpegOutput
// cmd.Stderr = ffmpegOutput

// err = cmd.Start()
// if err != nil {
// 	rtsp.Logger.Error(fmt.Sprintf("Error starting FFmpeg for stream %s: %v", camera.Name, err))
// }

// go func(tmpDir string) {
// 	for {
// 		files, err := os.ReadDir(tmpDir)
// 		if err != nil {
// 			rtsp.Logger.Error(fmt.Sprintf("Error reading directory %v: %v", tmpDir, err))
// 			return
// 		}

// 		for _, file := range files {
// 			if file.IsDir() {
// 				continue
// 			}
// 			if !strings.Contains(file.Name(), "segments.m3u8") {
// 				rtsp.Logger.Info(fmt.Sprintf("Segment file: %v", file.Name()))
// 				segmentFilePath := fmt.Sprintf("%s/%s", tmpDir, file.Name())

// 				segmentFileContent, err := os.ReadFile(segmentFilePath)
// 				if err != nil {
// 					rtsp.Logger.Error(fmt.Sprintf("Error reading segment file %v: %v", segmentFilePath, err))
// 					continue
// 				}
// 				rtsp.Logger.Info((fmt.Sprintf("Publishing segment to queue: %v", segmentFilePath)))
// 				err = rtsp.instance.Channel.Publish(
// 					"videostream", // Default exchange
// 					fmt.Sprintf("videostream.hubid.%s", camera.Name), // Routing key (queue name)
// 					false, // Mandatory
// 					false, // Immediate
// 					amqp.Publishing{
// 						ContentType: "application/octet-stream", // Type of the content
// 						Body:        segmentFileContent,         // Content (segment file data)
// 					})
// 				if err != nil {
// 					rtsp.Logger.Error(fmt.Sprintf("Failed to publish segment to queue: %v", err))
// 				}
// 				err = os.Remove(segmentFilePath)
// 				if err != nil {
// 					rtsp.Logger.Error(fmt.Sprintf("Failed to remove segment file %v: %v", segmentFilePath, err))
// 					continue
// 				}
// 				rtsp.Logger.Info(fmt.Sprintf("Published segment to queue: %v", segmentFilePath))
// 			}
// 		}

// 		time.Sleep(time.Duration(camera.SegmentTime))
// 	}
// }(tmpDir)

func (rtsp *RtspProcessor) Close() {
	rtsp.client.Close()
}

// FFmpegConfig holds the configuration for FFmpeg streaming
type FFmpegConfig struct {
	input                  string
	options                []string
	maxRetries             int
	retryDelay             time.Duration
	bufferPostSendInterval time.Duration
	bufferReaderSize       int
}

// TODO Turn this into docker valid Go argparse to input when running Producer container driver and/or builder
// TODO (As versatile named arguments in the main() of this producer/main.go)
func (rtsp *RtspProcessor) newFFmpegConfig(camera CameraConfig) (*FFmpegConfig, error) {
	streamURL := camera.StreamURL
	tmpDir := "/tmp/data/" + camera.Name

	// Create the temporary directory if it doesn't exist
	err := os.MkdirAll(tmpDir, 0755)
	if err != nil {
		// Log and return error if directory creation fails
		return nil, fmt.Errorf("error creating directory %v: %v", tmpDir, err)
	}

	// Return the FFmpeg configuration based on camera type
	switch camera.Type {
	case ANT, REAL:
		return &FFmpegConfig{
			input: streamURL,
			options: []string{
				// RTSP Transport settings
				"-rtsp_transport", "tcp", // Use TCP for RTSP transport
				"-buffer_size", "1024000", // Set buffer size
				"-probesize", "50M", // Increase probe size
				"-analyzeduration", "20000000", // Increase analyze duration
				"-avoid_negative_ts", "make_zero", // Avoid negative timestamps

				// Video encoding settings
				"-c:v", "libx264", // Compress using H.264 codec
				"-preset", "fast", // Use fast preset for encoding
				"-crf", "23", // Control quality (lower = better)
				"-r", "15", // Force frame rate
				"-g", "30", // Set keyframe interval

				// Audio settings
				"-b:a", "64k", // Set audio bitrate

				// Output format settings
				"-f", "segment", // Enable segmentation
				"-segment_time", "2", // Segment duration
				"-segment_format", "mp4", // Output format
				"-reset_timestamps", "1", // Reset timestamps for each segment
				"-segment_list", fmt.Sprintf("%s/segments.m3u8", tmpDir), // HLS playlist
				"-segment_list_type", "m3u8", // HLS format
				"-segment_list_size", "0", // Unlimited segments
				"-segment_list_flags", "+live", // Make it a live playlist
				fmt.Sprintf("%s/segment-%%03d.mp4", tmpDir), // Segment output
			},
			maxRetries:             5,
			retryDelay:             5 * time.Second,
			bufferPostSendInterval: 100 * time.Millisecond, // Increased interval
			bufferReaderSize:       1024000,                // Match buffer_size from ffmpeg
		}, nil
	case MOCK:
		return &FFmpegConfig{
			input: streamURL,
			options: []string{
				"-c:v", "libx264", // Video codec, libx264 corresponds to H.264
				"-preset", "ultrafast", // Adjust tradeoff between encoding speed and compression efficiency
				"-tune", "zerolatency", // Reduce latency
				"-profile:v", "baseline", // Set baseline profile
				"-level", "3.0", // Set level to 3.0

				"-pix_fmt", "yuv420p", // Pixel format
				"-maxrate", "2000k", // Maximum bitrate
				"-bufsize", "2000k", // Buffer size

				// GOP settings
				"-g", "30",
				"-keyint_min", "30", // Set minimum keyframe interval

				// Forcing keyframe interval
				"-force_key_frames", "expr:gte(t,n_forced*1)", // Force keyframe every second
				"-x264-params", "keyint=30:min-keyint=30", // Set both max and min keyframe interval
				"-sc_threshold", "0",
				"-an",       // Disable audio codec
				"-f", "mp4", // Output format
				"-movflags", "frag_keyframe+empty_moov+default_base_moof+faststart", // Enable faststart for streaming
				"-frag_duration", "1000000", // Fragment duration (1 second)
			},
			maxRetries:             5,
			retryDelay:             5 * time.Second,
			bufferPostSendInterval: 30 * time.Millisecond, // Adjusted buffer interval
			bufferReaderSize:       1024 * 1024,           // Set buffer size for reading
		}, nil
	default:
		// Return an error if the camera type is invalid
		return nil, fmt.Errorf("invalid camera selection: %d", camera.Type)
	}
}

func (c *FFmpegConfig) buildCommand() *exec.Cmd {
	args := append([]string{"-i", c.input}, c.options...)
	args = append(args, "")
	return exec.Command("ffmpeg", args...)
}

func validateRTSPStream(url string) error {
	// Use ffprobe to validate the RTSP stream
	cmd := exec.Command("ffprobe", "-v", "error", "-i", url, "-show_entries", "stream=codec_type", "-of", "default=noprint_wrappers=1:nokey=1")
	output, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Errorf("stream validation failed: %v - output: %s", err, string(output))
	}
	return nil
}

func setupStreamEnvironment(camera string, rabbitMQURI string) (*stream.Environment, *stream.Producer, error) {
	env, err := stream.NewEnvironment(
		stream.NewEnvironmentOptions().
			SetUri(rabbitMQURI).
			SetMaxConsumersPerClient(10).
			SetMaxProducersPerClient(10),
	)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to create stream environment: %v", err)
	}

	hubID := os.Getenv("HUB_ID")
	streamName := fmt.Sprintf("video_stream.hub_id.%s.%s", hubID, camera)

	err = env.DeclareStream(streamName, &stream.StreamOptions{
		MaxLengthBytes:      stream.ByteCapacity{}.GB(2),
		MaxSegmentSizeBytes: stream.ByteCapacity{}.MB(50),
	})
	if err != nil {
		env.Close()
		return nil, nil, fmt.Errorf("failed to declare stream: %v", err)
	}

	producer, err := env.NewProducer(streamName, nil)
	if err != nil {
		env.Close()
		return nil, nil, fmt.Errorf("failed to create producer: %v", err)
	}

	return env, producer, nil
}

func (rtsp *RtspProcessor) streamRTSP(camera *CameraConfig, ctx *StreamContext) {

	for {
		files, err := os.ReadDir(ctx.directory)
		if err != nil {
			ctx.errChan <- fmt.Errorf("error reading directory %v: %v", ctx.directory, err)
			return
		}

		for _, file := range files {
			if file.IsDir() {
				continue
			}
			if !strings.Contains(file.Name(), "segments.m3u8") {
				rtsp.Logger.Info(fmt.Sprintf("Segment file: %v", file.Name()))
				segmentFilePath := fmt.Sprintf("%s/%s", ctx.directory, file.Name())

				segmentFileContent, err := os.ReadFile(segmentFilePath)
				if err != nil {
					rtsp.Logger.Error(fmt.Sprintf("Error reading segment file %v: %v", segmentFilePath, err))
					continue
				}
				rtsp.Logger.Info((fmt.Sprintf("Publishing segment to queue: %v", segmentFilePath)))
				ctx.dataChan <- segmentFileContent

				// err = rtsp.instance.Channel.Publish(
				// 	"video_stream", // Default exchange
				// 	fmt.Sprintf("video_stream.hubid.%s", camera.Name), // Routing key (queue name)
				// 	false, // Mandatory
				// 	false, // Immediate
				// 	amqp.Publishing{
				// 		ContentType: "application/octet-stream", // Type of the content
				// 		Body:        segmentFileContent,         // Content (segment file data)
				// 	})
				// if err != nil {
				// 	rtsp.Logger.Error(fmt.Sprintf("Failed to publish segment to queue: %v", err))
				// }
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
	// Create a buffered reader for more efficient reading
	// reader := bufio.NewReaderSize(stdout, config.bufferReaderSize) //1024*1024)
	// rtsp.Logger.Info(fmt.Sprintf("Starting RTSP stream: %v", cmd.String()))
	// buf := make([]byte, config.bufferReaderSize) //512*1024)
	// for {
	// 	rtsp.Logger.Info(fmt.Sprintf("Reading buffer"))
	// 	n, err := reader.Read(buf)
	// 	rtsp.Logger.Info(fmt.Sprintf("Buffer read"))
	// 	if err != nil {
	// 		rtsp.Logger.Error(fmt.Sprintf("Error reading from RTSP stream: %v", err))
	// 		break
	// 	}
	// 	if n == 0 {
	// 		rtsp.Logger.Warn("Zero bytes read, continuing...")
	// 		time.Sleep(10 * time.Millisecond)
	// 		continue // Empty chunk, skip it
	// 	}

	// 	videoChunk := buf[:n]
	// 	hubID := os.Getenv("HUB_ID")
	// 	streamName := fmt.Sprintf("video_stream.hub_id.%s.%s", hubID, "tapo C200")

	// 	// Publish video chunk to the stream
	// 	err = rtsp.instance.Channel.Publish(
	// 		"",
	// 		streamName,
	// 		false, // Mandatory
	// 		false, // Immediate
	// 		amqp.Publishing{
	// 			ContentType: "application/octet-stream", // Type of the content
	// 			Body:        videoChunk,                 // Content (segment file data)
	// 		})
	// 	if err != nil {
	// 		rtsp.Logger.Error(fmt.Sprintf("Failed to publish segment to queue: %v", err))
	// 	}
	// 	log.Printf("Sent video chunk (%d bytes) to stream...", n)
	// 	time.Sleep(config.bufferPostSendInterval) //30 * time.Millisecond) // Simulate real-time video chunk sending
	// }
	// if err := cmd.Wait(); err != nil {
	// 	log.Fatalf("Error waiting for ffmpeg: %v", err)
	// 	return err
	// }
	// return nil
}

func (rtsp *RtspProcessor) sendData(ctx *StreamContext, producer *stream.Producer) {
	for {
		select {
		case segmentFileContent := <-ctx.dataChan:
			err := producer.Send(stream_amqp.NewMessage(segmentFileContent))
			if err != nil {
				rtsp.Logger.Error(fmt.Sprintf("Failed to publish segment to queue: %Wv", err))
			}
			rtsp.Logger.Info(fmt.Sprintf("Published segment to queue: %v", segmentFileContent))
			break

		case err := <-ctx.errChan:
			rtsp.Logger.Error(fmt.Sprintf("Error streaming RTSP: %v", err))
			continue
		}
	}
}
