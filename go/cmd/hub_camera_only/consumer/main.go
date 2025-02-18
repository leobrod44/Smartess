package main

import (
	"log"
	"net/http"
	"os"

	"github.com/gorilla/websocket"
	amqp "github.com/rabbitmq/amqp091-go"

	//"github.com/streadway/amqp"
	//amqp "github.com/rabbitmq/rabbitmq-stream-go-client/pkg/amqp"
	stream "github.com/rabbitmq/rabbitmq-stream-go-client/pkg/stream"
)

func main() {
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

	//// Declare the stream (same as the producer)
	//err = channel.StreamDeclare(
	//	"video_stream", // Stream name
	//	amqp091.StreamDeclareOptions{
	//		Consumers: 1,
	//		Messages:  1000,
	//	},
	//)
	//if err != nil {
	//	log.Fatalf("Failed to declare a stream: %v", err)
	//}

	// WebSocket setup for frontend connection
	upgrader := websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool {
			return true
		},
	}

	http.HandleFunc("/video", func(w http.ResponseWriter, r *http.Request) {
		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			log.Printf("WebSocket upgrade failed: %v", err)
			return
		}
		defer conn.Close()

		// Start consuming from the stream (from the declared "video_stream")
		msgs, err := channel.Consume(
			"video_stream", // Queue name
			"",             // Consumer
			true,           // Auto-Ack
			false,          // Exclusive
			false,          // No-local
			false,          // No-Wait
			nil,            // Args
		)
		if err != nil {
			log.Fatalf("Failed to start consuming stream: %v", err)
		}

		for msg := range msgs {
			// Send video data to frontend via WebSocket
			if err := conn.WriteMessage(websocket.TextMessage, msg.Body); err != nil {
				log.Printf("Failed to send video data: %v", err)
				break
			}
			log.Printf("Sent video segment to frontend: %s", msg.Body)
		}
	})

	// Start HTTP server for WebSocket
	log.Fatal(http.ListenAndServe(":8082", nil))
}
