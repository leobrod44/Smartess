package main

//import (
//	"github.com/gorilla/websocket"
//	"github.com/rabbitmq/rabbitmq-stream-go-client/pkg/amqp"
//	stream "github.com/rabbitmq/rabbitmq-stream-go-client/pkg/stream"
//	"log"
//	"net/http"
//	"os"
//	"sync"
//)
//
//var upgrader = websocket.Upgrader{
//	CheckOrigin: func(r *http.Request) bool { return true },
//}
//
//type Client struct {
//	conn *websocket.Conn
//	mu   sync.Mutex
//}
//
//var clients = make(map[*Client]bool)
//var clientsMutex sync.RWMutex
//
//func handleWS(w http.ResponseWriter, r *http.Request) {
//	conn, err := upgrader.Upgrade(w, r, nil)
//	if err != nil {
//		log.Println("Failed to upgrade WebSocket:", err)
//		return
//	}
//
//	client := &Client{conn: conn}
//	clientsMutex.Lock()
//	clients[client] = true
//	clientsMutex.Unlock()
//
//	log.Println("New WebSocket connection")
//
//	// Keep connection alive and handle cleanup
//	for {
//		if _, _, err := conn.ReadMessage(); err != nil {
//			log.Println("WebSocket closed:", err)
//			clientsMutex.Lock()
//			delete(clients, client)
//			clientsMutex.Unlock()
//			conn.Close()
//			break
//		}
//	}
//}
//
//func main() {
//	// Create static file server for frontend
//	fs := http.FileServer(http.Dir("./static"))
//	http.Handle("/", fs)
//
//	// Setup RabbitMQ Stream environment
//	env, err := stream.NewEnvironment(
//		stream.NewEnvironmentOptions().
//			SetUri(os.Getenv("RABBITMQ_STREAM_URI")),
//	)
//	if err != nil {
//		log.Fatalf("Failed to create stream environment: %v", err)
//	}
//	defer env.Close()
//
//	// Declare stream
//	err = env.DeclareStream("video_stream", &stream.StreamOptions{
//		MaxLengthBytes: stream.ByteCapacity{}.GB(1),
//	})
//	if err != nil {
//		log.Fatalf("Failed to declare a stream: %v", err)
//	}
//
//	// Handle incoming video chunks
//	messagesHandler := func(consumerContext stream.ConsumerContext, message *amqp.Message) {
//		// Flatten the message data
//		var flattenedData []byte
//		for _, chunk := range message.Data {
//			flattenedData = append(flattenedData, chunk...)
//		}
//
//		// Send to all connected clients
//		clientsMutex.RLock()
//		for client := range clients {
//			client.mu.Lock()
//			err := client.conn.WriteMessage(websocket.BinaryMessage, flattenedData)
//			client.mu.Unlock()
//
//			if err != nil {
//				log.Printf("Error sending to client: %v", err)
//				client.conn.Close()
//				clientsMutex.RUnlock()
//				clientsMutex.Lock()
//				delete(clients, client)
//				clientsMutex.Unlock()
//				clientsMutex.RLock()
//			}
//		}
//		clientsMutex.RUnlock()
//	}
//
//	// Create consumer
//	consumer, err := env.NewConsumer(
//		"video_stream",
//		messagesHandler,
//		stream.NewConsumerOptions().
//			SetOffset(stream.OffsetSpecification{}.First()).
//			SetManualCommit(),
//	)
//	if err != nil {
//		log.Fatalf("Failed to create consumer: %v", err)
//	}
//	defer consumer.Close()
//
//	// Setup WebSocket endpoint
//	http.HandleFunc("/ws", handleWS)
//
//	log.Println("Server started on :8082")
//	log.Fatal(http.ListenAndServe(":8082", nil))
//}
