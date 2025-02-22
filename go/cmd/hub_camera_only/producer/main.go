package main

import (
	"bufio"
	"fmt"
	"log"
	"os"
	"os/exec"
	"time"

	"github.com/rabbitmq/rabbitmq-stream-go-client/pkg/amqp"
	stream "github.com/rabbitmq/rabbitmq-stream-go-client/pkg/stream"
	"gopkg.in/yaml.v3"
)

type CameraEnum int

const (
	MAIN_CAMERA CameraEnum = iota
	ANT_CAMERA
	MOCK_CAMERA
)

func (d CameraEnum) String() string {
	return [...]string{"MAIN_CAMERA", "ANT_CAMERA", "MOCK_CAMERA"}[d]
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
func newFFmpegConfig(input string, selectedCameraEnum CameraEnum) *FFmpegConfig {
	switch selectedCameraEnum {
	case ANT_CAMERA, MAIN_CAMERA:
		return &FFmpegConfig{
			input: input,
			options: []string{
				// RTSP Transport settings
				"-rtsp_transport", "tcp",
				"-buffer_size", "1024000",
				"-probesize", "50M",
				"-analyzeduration", "20000000",
				"-avoid_negative_ts", "make_zero",

				// Video encoding settings
				"-c:v", "libx264",
				"-preset", "fast",
				"-crf", "23",
				"-r", "15",
				"-g", "30",

				// Audio settings
				"-b:a", "64k",

				// Output format settings
				"-f", "mp4",
				"-movflags", "frag_keyframe+empty_moov+default_base_moof",
				"-reset_timestamps", "1",
			},
			maxRetries:             5,
			retryDelay:             5 * time.Second,
			bufferPostSendInterval: 100 * time.Millisecond, // Increased interval
			bufferReaderSize:       1024000,                // Match buffer_size from ffmpeg
		}
		//return &FFmpegConfig{
		//	input: input,
		//	options: []string{
		//		// Video codec settings
		//		"-c:v", "libx264",
		//		"-preset", "ultrafast",
		//		"-tune", "zerolatency",
		//		"-profile:v", "high", // Changed from baseline to match camera's High profile
		//
		//		// Frame and buffer settings
		//		"-pix_fmt", "yuv420p",
		//		"-maxrate", "4000k", // Increased for 1080p
		//		"-bufsize", "8000k", // Doubled buffer size
		//
		//		// Frame rate settings
		//		"-r", "15", // Match camera's 15 fps
		//		"-vsync", "passthrough",
		//
		//		// GOP settings - adjusted for 15fps
		//		"-g", "15", // Changed to match fps
		//		"-keyint_min", "15", // Changed to match fps
		//		"-force_key_frames", "expr:gte(t,n_forced*2)", // Force keyframe every 2 seconds
		//
		//		// Handle audio properly
		//		"-c:a", "aac", // Changed from -an to properly handle audio
		//		"-b:a", "128k", // Reasonable audio bitrate
		//
		//		// Output format settings
		//		"-f", "mp4",
		//		"-movflags", "frag_keyframe+empty_moov+default_base_moof",
		//		"-frag_duration", "1000000",
		//
		//		// RTSP specific settings
		//		"-rtsp_transport", "tcp", // Force TCP for more reliable connection
		//		"-stimeout", "5000000", // 5 second timeout
		//	},
		//	maxRetries:             5,
		//	retryDelay:             5 * time.Second,
		//	bufferPostSendInterval: 60 * time.Millisecond,
		//	bufferReaderSize:       2 * 1024 * 1024,
		//}
	case MOCK_CAMERA:

		return &FFmpegConfig{
			input: input,
			options: []string{
				"-c:v", "libx264", // Video codec, libx264 corresponds to H.264
				"-preset", "ultrafast", //"veryfast", // Adjust tradeoff between encoding speed and compression efficiency; faster encoding comes at cost of larger file size
				"-tune", "zerolatency",
				"-profile:v", "baseline",
				"-level", "3.0",

				"-pix_fmt", "yuv420p",
				"-maxrate", "2000k", //"2000k",
				"-bufsize", "2000k", //"4000k",
				//todo "-crf", "28",                    // Balance quality and bitrate

				// Frame settings
				//todo "-r", "15",                      // Frame rate - adjust based on camera
				//todo "-vsync", "passthrough",         // Maintain timing

				//GOP settings
				"-g", "30",
				"-keyint_min", "30",

				// Forcing keyframe interval
				"-force_key_frames", "expr:gte(t,n_forced*1)", // Force keyframe every second
				"-x264-params", "keyint=30:min-keyint=30", // Set both max and min keyframe interval
				"-sc_threshold", "0",
				"-an", //"-c:a", "aac",
				"-f", "mp4",
				"-movflags", "frag_keyframe+empty_moov+default_base_moof+faststart", //+faststart",
				"-frag_duration", "1000000", // 1 second fragments
				//"-fragment_duration", "500000",
				//"-stimeout", "10000000", // 10 second timeout for RTSP
				//"-rtsp_transport", "tcp", // Force TCP for more reliable connection
			},
			maxRetries:             5,
			retryDelay:             5 * time.Second,
			bufferPostSendInterval: 30 * time.Millisecond,
			bufferReaderSize:       1024 * 1024,
		}
	default:
		log.Fatalf("Invalid camera selection: %d", selectedCameraEnum)
		return nil
	}

}

func (c *FFmpegConfig) buildCommand() *exec.Cmd {
	args := append([]string{"-i", c.input}, c.options...)
	args = append(args, "pipe:1")
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

func setupStreamEnvironment(rabbitMQURI string) (*stream.Environment, *stream.Producer, error) {
	env, err := stream.NewEnvironment(
		stream.NewEnvironmentOptions().
			SetUri(rabbitMQURI).
			SetMaxConsumersPerClient(10).
			SetMaxProducersPerClient(10),
	)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to create stream environment: %v", err)
	}

	err = env.DeclareStream("video_stream", &stream.StreamOptions{
		MaxLengthBytes:      stream.ByteCapacity{}.GB(2),
		MaxSegmentSizeBytes: stream.ByteCapacity{}.MB(50),
	})
	if err != nil {
		env.Close()
		return nil, nil, fmt.Errorf("failed to declare stream: %v", err)
	}

	producer, err := env.NewProducer("video_stream", nil)
	if err != nil {
		env.Close()
		return nil, nil, fmt.Errorf("failed to create producer: %v", err)
	}

	return env, producer, nil
}

func streamRTSP(config *FFmpegConfig, producer *stream.Producer) error {
	cmd := config.buildCommand()
	stdout, err := cmd.StdoutPipe()
	if err != nil {
		return fmt.Errorf("failed to get stdout pipe: %v", err)
	}

	if err := cmd.Start(); err != nil {
		return fmt.Errorf("failed to start ffmpeg: %v", err)
	}

	// Create a buffered reader for more efficient reading
	reader := bufio.NewReaderSize(stdout, config.bufferReaderSize) //1024*1024)

	buf := make([]byte, config.bufferReaderSize) //512*1024)
	//errorChan := make(chan error, 1)
	//
	//go func() {
	//	for {
	//		n, err := stdout.Read(buf)
	//		if err != nil {
	//			errorChan <- fmt.Errorf("error reading from RTSP stream: %v", err)
	//			return
	//		}
	//		if n == 0 {
	//			continue
	//		}
	//
	//		videoChunk := buf[:n]
	//		if err := producer.Send(amqp.NewMessage(videoChunk)); err != nil {
	//			errorChan <- fmt.Errorf("failed to publish message: %v", err)
	//			return
	//		}
	//		log.Printf("Sent video chunk (%d bytes) to stream", n)
	//		time.Sleep(50 * time.Millisecond)
	//	}
	//}()
	//
	//// Wait for either an error or the command to finish
	//select {
	//case err := <-errorChan:
	//	cmd.Process.Kill()
	//	cmd.Wait()
	//	return err
	//case err := <-func() chan error {
	//	c := make(chan error, 1)
	//	go func() { c <- cmd.Wait() }()
	//	return c
	//}():
	//	return err
	//}
	for {
		n, err := reader.Read(buf)
		if err != nil {
			log.Printf("Error reading from RTSP stream: %v", err)
			break
		}
		if n == 0 {
			log.Printf("Zero bytes read, continuing...")
			time.Sleep(10 * time.Millisecond)
			continue // Empty chunk, skip it
		}

		videoChunk := buf[:n]

		// Publish video chunk to the stream
		err = producer.Send(amqp.NewMessage(videoChunk))
		if err != nil {
			log.Fatalf("Failed to publish a message to the stream: %v", err)
		}
		log.Printf("Sent video chunk (%d bytes) to stream...", n)
		time.Sleep(config.bufferPostSendInterval) //30 * time.Millisecond) // Simulate real-time video chunk sending
	}
	if err := cmd.Wait(); err != nil {
		log.Fatalf("Error waiting for ffmpeg: %v", err)
		return err
	}
	return nil
}

func main() {
	SELECTED_CAMERA_ENUM := ANT_CAMERA // MOCK_CAMERA
	SELECTED_CAMERA := int(SELECTED_CAMERA_ENUM)

	// Read camera configuration
	dir := "/app/config/cameras.yaml"
	data, err := os.ReadFile(dir)
	if err != nil {
		log.Fatalf("failed to read camera yaml: %v", err)
	}

	var cameras map[string][]map[string]string
	if err := yaml.Unmarshal(data, &cameras); err != nil {
		log.Fatalf("failed to unmarshal yaml: %v", err)
	}

	if len(cameras["cameras"]) <= SELECTED_CAMERA {
		log.Fatalf("Invalid camera selection: %d", SELECTED_CAMERA)
	}

	RTSP_STREAM_URL := cameras["cameras"][SELECTED_CAMERA]["streamURL"]
	log.Printf("RTSP Stream URL: %s", RTSP_STREAM_URL)

	// Validate RTSP stream before proceeding
	if err := validateRTSPStream(RTSP_STREAM_URL); err != nil {
		log.Fatalf("Failed to validate RTSP stream: %v", err)
	}

	// Setup RabbitMQ stream environment
	env, producer, err := setupStreamEnvironment(os.Getenv("RABBITMQ_STREAM_URI"))
	if err != nil {
		log.Fatalf("Failed to setup stream environment: %v", err)
	}
	defer env.Close()
	defer producer.Close()

	// Configure FFmpeg
	config := newFFmpegConfig(RTSP_STREAM_URL, SELECTED_CAMERA_ENUM)

	// Main retry loop
	for retries := 0; retries < config.maxRetries; retries++ {
		if retries > 0 {
			log.Printf("Attempting reconnection (%d/%d) after %v", retries+1, config.maxRetries, config.retryDelay)
			time.Sleep(config.retryDelay)
		}

		err := streamRTSP(config, producer)
		if err != nil {
			log.Printf("Streaming error: %v", err)
			continue
		}
	}

	log.Fatalf("Max retries (%d) reached, shutting down", config.maxRetries)
}
