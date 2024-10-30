package main

import (
	"Smartess/go/common/structures"
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

func GenerateLightSwitchEventMessage() structures.LightSwitchEventMessage {
	return structures.LightSwitchEventMessage{
		ID:   1,
		Type: "light_switch_event",
		Event: structures.Event{
			EventType: "state_changed",
			Data: structures.Data{
				EntityID: "light.living_room",
				OldState: structures.State{
					EntityID: "light.living_room",
					State:    "off",
					Attributes: structures.Attributes{
						MinColorTempKelvin:  2000,
						MaxColorTempKelvin:  6500,
						MinMireds:           153,
						MaxMireds:           500,
						EffectList:          []string{"colorloop", "random"},
						SupportedColorModes: []string{"hs", "xy", "color_temp"},
						ColorMode:           "hs",
						Brightness:          0,
						HsColor:             []float64{0, 0},
						RgbColor:            []int{0, 0, 0},
						XyColor:             []float64{0, 0},
						Effect:              "",
						Mode:                "normal",
						Dynamics:            "none",
						FriendlyName:        "Living Room Light",
						SupportedFeatures:   63,
					},
					LastChanged: time.Now(),
					LastUpdated: time.Now(),
					Context: structures.Context{
						ID:       "context_id",
						ParentID: nil,
						UserID:   nil,
					},
				},
				NewState: structures.State{
					EntityID: "light.living_room",
					State:    "on",
					Attributes: structures.Attributes{
						MinColorTempKelvin:  2000,
						MaxColorTempKelvin:  6500,
						MinMireds:           153,
						MaxMireds:           500,
						EffectList:          []string{"colorloop", "random"},
						SupportedColorModes: []string{"hs", "xy", "color_temp"},
						ColorMode:           "hs",
						Brightness:          255,
						HsColor:             []float64{0, 100},
						RgbColor:            []int{255, 0, 0},
						XyColor:             []float64{0.7, 0.3},
						Effect:              "colorloop",
						Mode:                "normal",
						Dynamics:            "none",
						FriendlyName:        "Living Room Light",
						SupportedFeatures:   63,
					},
					LastChanged: time.Now(),
					LastUpdated: time.Now(),
					Context: structures.Context{
						ID:       "context_id",
						ParentID: nil,
						UserID:   nil,
					},
				},
			},
			Origin:    "LOCAL",
			TimeFired: time.Now(),
			Context: structures.Context{
				ID:       "context_id",
				ParentID: nil,
				UserID:   nil,
			},
		},
	}
}
