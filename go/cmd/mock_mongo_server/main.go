package main

import (
	"fmt"
	"github.com/gorilla/websocket"
	"log"
	"net/http"
	"time"
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
			  "entity_id": "light.living_room",
			  "state": "on",
			  "attributes": {
				"friendly_name": "Living Room Light",
				"brightness": 255
			  },
			  "last_changed": "%s"
			}`, time.Now().Format(time.RFC3339))

			err = conn.WriteMessage(msgType, []byte(mockResponse1))
			if err != nil {
				log.Println("Error sending message1:", err)
				break
			}
			log.Println("Sent mock event data1 to client")

			// MOCK ALERT WARNING
			mockResponse2 := fmt.Sprintf(`{
			  "entity_id": "sensor.front_door_battery",
			  "state": "15",
			  "attributes": {
				"friendly_name": "Front Door Sensor Battery",
				"unit_of_measurement": "%%",
				"battery_level": 15
			  },
			  "last_changed": "%s"
			}`, time.Now().Format(time.RFC3339))

			err = conn.WriteMessage(msgType, []byte(mockResponse2))
			if err != nil {
				log.Println("Error sending message2:", err)
				break
			}
			log.Println("Sent mock event data1 to client")

			// MOCK ALERT CRITICAL
			mockResponse3 := fmt.Sprintf(`{
			  "entity_id": "binary_sensor.smoke_detector",
			  "state": "on",
			  "attributes": {
				"friendly_name": "Kitchen Smoke Detector",
				"smoke_detected": true,
				"battery_level": 80
			  },
			  "last_changed": "%s"
			}`, time.Now().Format(time.RFC3339))

			err = conn.WriteMessage(msgType, []byte(mockResponse3))
			if err != nil {
				log.Println("Error sending message3:", err)
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
