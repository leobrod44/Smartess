package main

import (
	"Smartess/go/common/structures"
	"Smartess/go/hub/ha"
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func mockHub(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Failed to upgrade connection:", err)
		return
	}
	defer conn.Close()

	event := GenerateLightSwitchEventMessage()

	for {
		log.Println("Sending light switch event message")
		message, _ := json.Marshal(event)
		err := conn.WriteMessage(websocket.TextMessage, message)
		if err != nil {
			if websocket.IsCloseError(err, websocket.CloseNormalClosure, websocket.CloseGoingAway) {
				log.Println("Client closed connection")
			} else {
				log.Println("Failed to send message:", err)
			}
			return
		}
		time.Sleep(1 * time.Second)
	}
}

func main() {
	http.HandleFunc("/api/websocket", mockHub)
	log.Println("Mock hub running on :8765")
	err := http.ListenAndServe(":8765", nil)
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}

func GenerateLightSwitchEventMessage() ha.WebhookMessage {
	return ha.WebhookMessage{
		ID:   1,
		Type: "light_switch_event",
		Event: structures.EventDetails{
			EventType: "state_changed",
			Data: structures.EventData{
				EntityID: "light.lumi_lumi_switch_b1laus01_light_3",
				OldState: structures.State{
					EntityID: "light.lumi_lumi_switch_b1laus01_light_3",
					State:    "off",
					Attributes: map[string]interface{}{
						"friendly_name":         "Kitchen Light",
						"off_brightness":        nil,
						"off_with_transition":   false,
						"supported_color_modes": []string{"onoff"},
						"supported_features":    8,
					},
					LastChanged: time.Date(2024, 11, 26, 22, 33, 57, 907198000, time.UTC),
					LastUpdated: time.Date(2024, 11, 26, 22, 33, 57, 907198000, time.UTC),
					Context: structures.EventContext{
						ID:       "01JDN9R843GN161T321VYY0FJ7",
						ParentID: "",
						UserID:   "288a21978a6d496b90aefec65844c6ec",
					},
				},
				NewState: structures.State{
					EntityID: "light.lumi_lumi_switch_b1laus01_light_3",
					State:    "on",
					Attributes: map[string]interface{}{
						"friendly_name":         "Kitchen Light",
						"off_brightness":        nil,
						"off_with_transition":   false,
						"supported_color_modes": []string{"onoff"},
						"supported_features":    8,
					},
					LastChanged: time.Date(2024, 11, 26, 22, 34, 57, 907198000, time.UTC),
					LastUpdated: time.Date(2024, 11, 26, 22, 34, 57, 907198000, time.UTC),
					Context: structures.EventContext{
						ID:       "01JDN9R843GN161T321VYY0FJ7",
						ParentID: "",
						UserID:   "288a21978a6d496b90aefec65844c6ec",
					},
				},
			},
			Origin:    "LOCAL",
			TimeFired: time.Now().Format(time.RFC3339),
			Context: structures.EventContext{
				ID:       "01JDN9R843GN161T321VYY0FJ7",
				ParentID: "",
				UserID:   "288a21978a6d496b90aefec65844c6ec",
			},
		},
	}
}
