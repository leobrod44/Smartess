package main

import (
	amqp "github.com/rabbitmq/amqp091-go"
	//"github.com/streadway/amqp"
	//amqp "github.com/rabbitmq/rabbitmq-stream-go-client/pkg/amqp"
	stream "github.com/rabbitmq/rabbitmq-stream-go-client/pkg/stream"
	"log"
	"os"
	"os/exec"
	"time"
)

func main() {
	// Declare Stream
	env, err := stream.NewEnvironment(
		stream.NewEnvironmentOptions().
			SetUri(os.Getenv("RABBITMQ_URI")),
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

	// Connect to RabbitMQ server
	conn, err := amqp.Dial(os.Getenv("RABBITMQ_URI"))
	if err != nil {
		log.Fatalf("Failed to connect to RabbitMQ: %v", err)
	}
	defer conn.Close()

	channel, err := conn.Channel()
	if err != nil {
		log.Fatalf("Failed to open a channel: %v", err)
	}
	defer channel.Close()

	// Declare the stream
	err = channel.ExchangeDeclare(
		"video_exchange", // Exchange name
		"direct",         // Type
		true,             // Durable
		false,            // Auto-delete
		false,            // Internal
		false,            // No-wait
		nil,              // Arguments
	)
	if err != nil {
		log.Fatalf("Failed to declare an exchange: %v", err)
	}

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

	// Capture the RTSP stream (example using ffmpeg)
	rtspURL := os.Getenv("RTSP_STREAM_URL")
	cmd := exec.Command("ffmpeg", "-i", rtspURL, "-f", "mpegts", "pipe:1") // Using ffmpeg to stream RTSP to stdout
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
		err = channel.Publish(
			"video_exchange", // Exchange
			"video_key",      // Routing key
			false,            // Mandatory
			false,            // Immediate
			amqp.Publishing{
				ContentType: "application/octet-stream",
				Body:        videoChunk,
			},
		)
		if err != nil {
			log.Fatalf("Failed to publish a message: %v", err)
		}
		log.Printf("Sent video chunk to stream")
		time.Sleep(1 * time.Second) // Simulate real-time video chunk sending
	}
	if err := cmd.Wait(); err != nil {
		log.Fatalf("Error waiting for ffmpeg: %v", err)
	}
}
