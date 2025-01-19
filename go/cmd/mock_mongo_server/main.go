package main

import (
	"fmt"
	"github.com/gorilla/websocket"
	"log"
	"net/http"
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
			// MOCK ALERT INFORMATION
			mockResponse1 := fmt.Sprintf(`{
				"attributes": {
					"friendly_name": "Kitchen Light",
					"off_brightness": null,
					"off_with_transition": false,
					"supported_color_modes": [
						"onoff"
					],
					"supported_features": 8
				},
				"context": {
					"id": "01JDN9R843GN161T321VYY0FJ7",
					"parent_id": null,
					"user_id": "288a21978a6d496b90aefec65844c6ec"
				},
				"entity_id": "light.lumi_lumi_switch_b1laus01_light_3",
				"last_changed": "2024-11-26T22:33:57.907198+00:00",
				"last_updated": "2024-11-26T22:33:57.907198+00:00",
				"state": "off"
			}`)

			err = conn.WriteMessage(msgType, []byte(mockResponse1))
			if err != nil {
				log.Println("Error sending message1:", err)
				break
			}
			log.Println("Sent mock event data1 to client")
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
