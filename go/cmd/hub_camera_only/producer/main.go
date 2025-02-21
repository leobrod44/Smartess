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
	input      string
	options    []string
	maxRetries int
	retryDelay time.Duration
}

func newFFmpegConfig(input string) *FFmpegConfig {
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
		maxRetries: 5,
		retryDelay: 5 * time.Second,
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
	reader := bufio.NewReaderSize(stdout, 1024*1024)

	buf := make([]byte, 1024*1024) //512*1024)
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
			continue // Empty chunk, skip it
		}

		videoChunk := buf[:n]

		// Publish video chunk to the stream
		err = producer.Send(amqp.NewMessage(videoChunk))
		if err != nil {
			log.Fatalf("Failed to publish a message to the stream: %v", err)
		}
		log.Printf("Sent video chunk (%d bytes) to stream...", n)
		time.Sleep(30 * time.Millisecond) // Simulate real-time video chunk sending
	}
	if err := cmd.Wait(); err != nil {
		log.Fatalf("Error waiting for ffmpeg: %v", err)
		return err
	}
	return nil
}

func main() {
	SELECTED_CAMERA := int(MOCK_CAMERA)

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
	config := newFFmpegConfig(RTSP_STREAM_URL)

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
