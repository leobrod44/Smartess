package main

import (
	"fmt"
	"log"
	"os"
	"os/exec"
	"time"

	"github.com/rabbitmq/rabbitmq-stream-go-client/pkg/amqp"
	//"github.com/streadway/amqp"
	//amqp "github.com/rabbitmq/rabbitmq-stream-go-client/pkg/amqp"
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

func main() {
	SELECTED_CAMERA := int(MOCK_CAMERA)

	dir := "/app/config/cameras.yaml"
	data, err := os.ReadFile(dir)
	if err != nil {
		log.Fatalf("failed to read camera yaml: %v", err)
	}
	var cameras map[string][]map[string]string
	err = yaml.Unmarshal(data, &cameras)
	if err != nil {
		log.Fatalf("failed to unmarshal yaml: %v", err)
	}
	var RTSP_STREAM_URL string
	if len(cameras["cameras"]) > SELECTED_CAMERA {
		RTSP_STREAM_URL = cameras["cameras"][SELECTED_CAMERA]["streamURL"]
		fmt.Println("RTSP Stream URL:", RTSP_STREAM_URL)
	} else {
		log.Fatalf("Invalid camera selection: %d", SELECTED_CAMERA)
	}

	// Declare Stream
	env, err := stream.NewEnvironment(
		stream.NewEnvironmentOptions().
			SetUri(os.Getenv("RABBITMQ_STREAM_URI")),
	)
	if err != nil {
		log.Fatalf("Failed to create stream environment: %v", err)
	}
	defer env.Close()

	err = env.DeclareStream("video_stream", &stream.StreamOptions{
		MaxLengthBytes: stream.ByteCapacity{}.GB(1),
	})
	if err != nil {
		log.Fatalf("Failed to declare a stream: %v", err)
	}

	//todo defer stream.Close()

	producer, err := env.NewProducer("video_stream", nil)
	if err != nil {
		log.Fatalf("Failed to create stream producer: %v", err)
	}
	defer producer.Close()

	//// Connect to RabbitMQ server
	//conn, err := amqp.Dial(os.Getenv("RABBITMQ_URI"))
	//if err != nil {
	//	log.Fatalf("Failed to connect to RabbitMQ: %v", err)
	//}
	//defer conn.Close()
	//
	//channel, err := conn.Channel()
	//if err != nil {
	//	log.Fatalf("Failed to open a channel: %v", err)
	//}
	//defer channel.Close()
	//
	//// Declare the stream
	//err = channel.ExchangeDeclare(
	//	"video_exchange", // Exchange name
	//	"direct",         // Type
	//	true,             // Durable
	//	false,            // Auto-delete
	//	false,            // Internal
	//	false,            // No-wait
	//	nil,              // Arguments
	//)
	//if err != nil {
	//	log.Fatalf("Failed to declare an exchange: %v", err)
	//}

	//// Declare Stream
	//err = channel.StreamDeclare(
	//	"video_stream", // Stream name
	//	amqp.StreamDeclareOptions{
	//		Consumers: 1,
	//		Messages:  1000,
	//	},
	//)
	//if err != nil {
	//	log.Fatalf("Failed to declare a stream: %v", err)
	//}
	RTSP_STREAM_URL = "rtsp://localhost:8554/live" //TODO remove this line
	// Capture the RTSP stream (example using ffmpeg)
	cmd := exec.Command("ffmpeg", "-i", RTSP_STREAM_URL, "-f", "mpegts", "pipe:1") // Using ffmpeg to stream RTSP to stdout
	//cmd := exec.Command("ffmpeg", "-i", RTSP_STREAM_URL, "-c:v", "libx264", "-c:a", "aac", "-f", "mp4", "pipe:1")
	//cmd := exec.Command("ffmpeg", "-i", RTSP_STREAM_URL, "-f", "mp4", "pipe:1")
	stdout, err := cmd.StdoutPipe()
	if err != nil {
		log.Fatalf("Failed to get stdout pipe: %v", err)
	}
	if err := cmd.Start(); err != nil {
		log.Fatalf("Failed to start ffmpeg: %v", err)
	}

	// Read the video data chunk by chunk
	buf := make([]byte, 1024*1024) // buffer to hold video data (1MB chunk)
	for {
		n, err := stdout.Read(buf)
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
		log.Printf("Sent video chunk to stream")
		time.Sleep(1 * time.Second) // Simulate real-time video chunk sending
	}
	if err := cmd.Wait(); err != nil {
		log.Fatalf("Error waiting for ffmpeg: %v", err)
	}
}
