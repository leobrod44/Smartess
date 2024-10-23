package main

import (
	"fmt"
	"log"
	"net/url"
	"os"

	"github.com/gorilla/websocket"
)

func main() {
	// Replace with your Home Assistant URL and port (default is 8123)
	hub_ip := os.Getenv("HUB_IP")
	u := url.URL{Scheme: "ws", Host: hub_ip, Path: "/api/websocket"}
	fmt.Println("Connecting to:", u.String())

	// Connect to the WebSocket
	conn, _, err := websocket.DefaultDialer.Dial(u.String(), nil)
	if err != nil {
		log.Fatal("dial:", err)
	}

	fmt.Println("Connected to Home Assistant")
	defer conn.Close()

	token := os.Getenv("WEBHOOK_TOKEN")
	fmt.Println("Token:", token)
	// Authenticate the WebSocket connection
	authMessage := fmt.Sprintf(`{"type": "auth", "access_token": "%s"}`, token)
	err = conn.WriteMessage(websocket.TextMessage, []byte(authMessage))
	if err != nil {
		log.Fatal("auth failed:", err)
	}
	fmt.Println("Authenticated with Home Assistant")

	// Listen for all events
	subscribeMessage := `{"id": 1, "type": "subscribe_events"}`
	err = conn.WriteMessage(websocket.TextMessage, []byte(subscribeMessage))
	if err != nil {
		log.Fatal("subscribe failed:", err)
	}

	// Loop to read and handle incoming messages
	log.Printf("Connected to Home Assistant")
	for {
		_, message, err := conn.ReadMessage()
		if err != nil {
			log.Fatal("read:", err)
		}
		fmt.Printf("Received: %s\n", message)
	}
}
