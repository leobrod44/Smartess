package main

import (
	"github.com/gorilla/websocket"
	"github.com/rabbitmq/rabbitmq-stream-go-client/pkg/amqp"
	"log"
	"net/http"
	"os"

	//"github.com/streadway/amqp"
	//amqp "github.com/rabbitmq/rabbitmq-stream-go-client/pkg/amqp"
	stream "github.com/rabbitmq/rabbitmq-stream-go-client/pkg/stream"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

var clients = make(map[*websocket.Conn]bool)

func handleWS(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Failed to upgrade WebSocket:", err)
		return
	}
	defer conn.Close()
	clients[conn] = true
	log.Println("New WebSocket connection")

	// Keep connection alive
	for {
		if _, _, err := conn.ReadMessage(); err != nil {
			log.Println("WebSocket closed:", err)
			delete(clients, conn)
			break
		}
	}
}
func main() {
	env, err := stream.NewEnvironment(
		stream.NewEnvironmentOptions().
			SetUri(os.Getenv("RABBITMQ_STREAM_URI")).
			SetMaxConsumersPerClient(10).
			SetMaxProducersPerClient(10),
	)
	if err != nil {
		log.Fatalf("Failed to create stream environment: %v", err)
	}
	log.Printf("Created stream environment")
	defer env.Close()

	err = env.DeclareStream("video_stream", &stream.StreamOptions{
		MaxLengthBytes:      stream.ByteCapacity{}.GB(2), // Increased buffer size
		MaxSegmentSizeBytes: stream.ByteCapacity{}.MB(50),
	})
	if err != nil {
		log.Fatalf("Failed to declare a stream: %v", err)
	}
	log.Printf("Declared a stream")
	// Connect to RabbitMQ server
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

	//messagesHandler := func(consumerContext stream.ConsumerContext, message *amqp.Message) {
	//	fmt.Printf("Stream: %s - Received message\n", consumerContext.Consumer.GetStreamName())
	//}
	messagesHandler := func(consumerContext stream.ConsumerContext, message *amqp.Message) {
		for client := range clients {
			// Flatten the [][]byte to a single []byte
			var flattenedData []byte
			for _, chunk := range message.Data {
				flattenedData = append(flattenedData, chunk...)
			}
			err := client.WriteMessage(websocket.BinaryMessage, flattenedData)
			if err != nil {
				log.Println("Error sending data to WebSocket:", err)
				client.Close()
				delete(clients, client)
			}
		}
	}
	consumer, err := env.NewConsumer("video_stream", messagesHandler,
		stream.NewConsumerOptions().SetOffset(stream.OffsetSpecification{}.First()))
	if err != nil {
		log.Fatalf("Failed to create consumer: %v", err)
	}
	defer consumer.Close()

	// select {}
	// WebSocket server
	http.HandleFunc("/ws", handleWS)
	log.Println("WebSocket server started on :8082")
	log.Fatal(http.ListenAndServe(":8082", nil))
}

////// WebSocket setup for frontend connection
//upgrader := websocket.Upgrader{
//CheckOrigin: func(r *http.Request) bool {
//return true
//},
//}
//
//http.HandleFunc("/video", func(w http.ResponseWriter, r *http.Request) {
//	conn, err := upgrader.Upgrade(w, r, nil)
//	if err != nil {
//		log.Printf("WebSocket upgrade failed: %v", err)
//		return
//	}
//	log.Printf("WebSocket upgraded")
//	defer conn.Close()
//
//	// Start consuming from the stream (from the declared "video_stream")
//	//msgs, err := channel.Consume(
//	//	"video_stream", // Queue name
//	//	"",             // Consumer
//	//	true,           // Auto-Ack
//	//	false,          // Exclusive
//	//	false,          // No-local
//	//	false,          // No-Wait
//	//	nil,            // Args
//	//)
//	//if err != nil {
//	//	log.Fatalf("Failed to start consuming stream: %v", err)
//	//}
//
//	//
//	//for msg := range msgs {
//	//	// Send video data to frontend via WebSocket
//	//	if err := conn.WriteMessage(websocket.TextMessage, msg.Body); err != nil {
//	//		log.Printf("Failed to send video data: %v", err)
//	//		break
//	//	}
//	//	log.Printf("Sent video segment to frontend: %s", msg.Body)
//	//}
//})
//
//// Start HTTP server for WebSocket
//log.Println("WebSocket server running on :8082")
//log.Fatal(http.ListenAndServe(":8082", nil))
