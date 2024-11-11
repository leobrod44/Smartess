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
		err = conn.WriteMessage(websocket.TextMessage, message)
		if err != nil {
			log.Println("Failed to send message:", err)
			return
		}
		time.Sleep(1 * time.Second)
	}
}

func main() {
	http.HandleFunc("/api/websocket", mockHub)
	log.Println("Mock hub running on :8765")
	log.Fatal(http.ListenAndServe(":8765", nil))
}

func GenerateLightSwitchEventMessage() ha.WebhookMessage {
	return ha.WebhookMessage{
		ID:   1,
		Type: "light_switch_event",
		Event: structures.EventDetails{
			EventType: "state_changed",
			Data: structures.EventData{
				EntityID: "MOCKlight.MOCKliving_room",
				OldState: structures.State{
					EntityID: "MOCKlight.MOCKliving_room",
					State:    "off",
					Attributes: map[string]interface{}{
						"min_color_temp_kelvin": 2000,
						"max_color_temp_kelvin": 6500,
						"min_mireds":            153,
						"max_mireds":            500,
						"effect_list":           []string{"colorloop", "random"},
						"supported_color_modes": []string{"hs", "xy", "color_temp"},
						"color_mode":            "hs",
						"brightness":            0,
						"hs_color":              []float64{0, 0},
						"rgb_color":             []int{0, 0, 0},
						"xy_color":              []float64{0, 0},
						"effect":                "",
						"mode":                  "normal",
						"dynamics":              "none",
						"friendly_name":         "Living Room Light",
						"supported_features":    63,
					},
					LastChanged: time.Now(),
					LastUpdated: time.Now(),
					Context: structures.EventContext{
						ID:       "context_id",
						ParentID: "",
						UserID:   "",
					},
				},
				NewState: structures.State{
					EntityID: "light.living_room",
					State:    "on",
					Attributes: map[string]interface{}{
						"min_color_temp_kelvin": 2000,
						"max_color_temp_kelvin": 6500,
						"min_mireds":            153,
						"max_mireds":            500,
						"effect_list":           []string{"colorloop", "random"},
						"supported_color_modes": []string{"hs", "xy", "color_temp"},
						"color_mode":            "hs",
						"brightness":            255,
						"hs_color":              []float64{0, 100},
						"rgb_color":             []int{255, 0, 0},
						"xy_color":              []float64{0.7, 0.3},
						"effect":                "colorloop",
						"mode":                  "normal",
						"dynamics":              "none",
						"friendly_name":         "Living Room Light",
						"supported_features":    63,
					},
					LastChanged: time.Now(),
					LastUpdated: time.Now(),
					Context: structures.EventContext{
						ID:       "context_id",
						ParentID: "",
						UserID:   "",
					},
				},
			},
			Origin:    "LOCAL",
			TimeFired: time.Now().Format(time.RFC3339),
			Context: structures.EventContext{
				ID:       "context_id",
				ParentID: "",
				UserID:   "",
			},
		},
	}
}
