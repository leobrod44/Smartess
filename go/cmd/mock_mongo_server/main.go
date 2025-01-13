package main

import (
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // Allows connections from any origin (adjust as needed for security)
	},
}

func handleWebSocket(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Failed to set WebSocket upgrade:", err)
		return
	}
	defer conn.Close()

	log.Println("Client connected")

	for {
		// Read message from client
		msgType, msg, err := conn.ReadMessage()
		if err != nil {
			log.Println("Error reading message:", err)
			break
		}

		log.Printf("Received message from client: %s", msg)

		// Respond to "subscribe_events" with a mock message
		if string(msg) == `{"id": 1, "type": "subscribe_events"}` {
			mockResponse := fmt.Sprintf(`{"event": "mock_mongo_event", "data": "Hello MongoDB! Message number: %d", "timestamp": "%s"}`,
				1, time.Now().Format(time.RFC3339))
			err = conn.WriteMessage(msgType, []byte(mockResponse))
			if err != nil {
				log.Println("Error sending message:", err)
				break
			}
			log.Println("Sent mock event data to client")
		}
	}
}

func main() {
	http.HandleFunc("/ws", handleWebSocket)

	log.Println("Mock Mongo server starting on port 9090")
	err := http.ListenAndServe(":9090", nil)
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}
