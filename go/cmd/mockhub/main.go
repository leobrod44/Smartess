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

	for {
		event := GenerateEventMessage()

		log.Println("Sending event message")
		message, _ := json.Marshal(event)
		err = conn.WriteMessage(websocket.TextMessage, message)
		if err != nil {
			log.Println("Failed to send message:", err)
			return
		}
		time.Sleep(5 * time.Second)
	}
}

func main() {
	http.HandleFunc("/api/websocket", mockHub)
	log.Println("Mock hub running on :8765")
	log.Fatal(http.ListenAndServe(":8765", nil))
}

func GenerateEventMessage() ha.WebhookMessage {
	//rng := rand.New(rand.NewSource(time.Now().UnixNano()))
	//eventID := rng.Intn(11) + 1
	eventID := 2
	var event ha.WebhookMessage

	switch eventID {
	case 1:
		event = ha.WebhookMessage{
			ID:   1,
			Type: "state_changed",
			Event: structures.EventDetails{
				EventType: "state_changed",
				Data: structures.EventData{
					EntityID: "climate.sinope_technologies_th1124zb_g2_thermostat",
					OldState: structures.State{},
					NewState: structures.State{
						EntityID: "climate.sinope_technologies_th1124zb_g2_thermostat",
						State:    "heat",
						Attributes: map[string]interface{}{
							"current_temperature":         20.5,
							"friendly_name":               "Master Bedroom Thermostat",
							"hvac_action":                 "idle",
							"hvac_modes":                  []string{"off", "heat"},
							"max_temp":                    30,
							"min_temp":                    5,
							"occupancy":                   1,
							"occupied_cooling_setpoint":   2600,
							"occupied_heating_setpoint":   1950,
							"pi_heating_demand":           0,
							"preset_mode":                 "none",
							"preset_modes":                []string{"away", "none"},
							"supported_features":          17,
							"system_mode":                 "[<SystemMode.Heat: 4>]/heat",
							"temperature":                 19.5,
							"unoccupied_heating_setpoint": 1500,
						},
						LastChanged: time.Date(2024, 11, 14, 14, 26, 12, 795069000, time.UTC),
						LastUpdated: time.Date(2024, 11, 26, 22, 34, 20, 807774000, time.UTC),
						Context: structures.EventContext{
							ID:       "01JDN9RZ6HMT9PEZAMT3DHY2MB",
							ParentID: "",
							UserID:   "2cfced4b8a794ab59da3543e6feebdd7",
						},
					},
				},
				Origin:    "LOCAL",
				TimeFired: time.Now().Format(time.RFC3339),
				Context: structures.EventContext{
					ID:       "01JDN9RZ6HMT9PEZAMT3DHY2MB",
					ParentID: "",
					UserID:   "2cfced4b8a794ab59da3543e6feebdd7",
				},
			},
		}

	case 2:
		event = ha.WebhookMessage{
			ID:   2,
			Type: "state_changed",
			Event: structures.EventDetails{
				EventType: "state_changed",
				Data: structures.EventData{
					EntityID: "light.hue_go_2",
					OldState: structures.State{
						EntityID: "light.hue_go_2",
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
						EntityID: "light.hue_go_2",
						State:    "on",
						Attributes: map[string]interface{}{
							"friendly_name":         "Kitchen Light",
							"off_brightness":        nil,
							"off_with_transition":   false,
							"supported_color_modes": []string{"onoff"},
							"supported_features":    8,
							"rgb_color":             []int{238, 254, 255},
						},
						LastChanged: time.Date(2024, 11, 26, 22, 33, 57, 907198000, time.UTC),
						LastUpdated: time.Date(2024, 11, 26, 22, 33, 57, 907198000, time.UTC),
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

	case 3:
		event = ha.WebhookMessage{
			ID:   3,
			Type: "state_changed",
			Event: structures.EventDetails{
				EventType: "state_changed",
				Data: structures.EventData{
					EntityID: "sensor.sinope_technologies_th1123zb_g2_temperature",
					OldState: structures.State{},
					NewState: structures.State{
						EntityID: "sensor.sinope_technologies_th1123zb_g2_temperature",
						State:    "21.3",
						Attributes: map[string]interface{}{
							"device_class":        "temperature",
							"friendly_name":       "Sinope Technologies TH1123ZB-G2 Temperature",
							"state_class":         "measurement",
							"unit_of_measurement": "°C",
						},
						LastChanged: time.Date(2024, 11, 26, 22, 34, 43, 172305000, time.UTC),
						LastUpdated: time.Date(2024, 11, 26, 22, 34, 43, 172305000, time.UTC),
						Context: structures.EventContext{
							ID:       "01JDN9SN345HZCFMAJJG769V8K",
							ParentID: "",
							UserID:   "",
						},
					},
				},
				Origin:    "LOCAL",
				TimeFired: time.Now().Format(time.RFC3339),
				Context: structures.EventContext{
					ID:       "01JDN9SN345HZCFMAJJG769V8K",
					ParentID: "",
					UserID:   "",
				},
			},
		}

	case 4:
		event = ha.WebhookMessage{
			ID:   4,
			Type: "Light Warning",
			Event: structures.EventDetails{
				EventType: "state_changed",
				Data: structures.EventData{
					EntityID: "light.lumi_lumi_switch_b1laus01_light_3",
					OldState: structures.State{
						EntityID: "light.lumi_lumi_switch_b1laus01_light_3",
						State:    "on",
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
							"supported_features":    12,
						},
						LastChanged: time.Date(2024, 11, 26, 22, 33, 57, 907198000, time.UTC),
						LastUpdated: time.Date(2024, 11, 26, 22, 33, 57, 907198000, time.UTC),
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
	case 5:
		event = ha.WebhookMessage{
			ID:   5,
			Type: "Light Information",
			Event: structures.EventDetails{
				EventType: "state_changed",
				Data: structures.EventData{
					EntityID: "light.lumi_lumi_switch_b1laus01_light_3",
					OldState: structures.State{},
					NewState: structures.State{
						EntityID: "light.lumi_lumi_switch_b1laus01_light_3",
						State:    "on",
						Attributes: map[string]interface{}{
							"friendly_name":         "Kitchen Light",
							"off_brightness":        nil,
							"off_with_transition":   false,
							"supported_color_modes": []string{"onoff"},
							"supported_features":    12,
						},
						LastChanged: time.Date(2024, 11, 26, 22, 33, 57, 907198000, time.UTC),
						LastUpdated: time.Date(2024, 11, 26, 22, 33, 57, 907198000, time.UTC),
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
	case 6:
		event = ha.WebhookMessage{
			ID:   3,
			Type: "state_changed",
			Event: structures.EventDetails{
				EventType: "state_changed",
				Data: structures.EventData{
					EntityID: "battery.sinope_technologies_th1123zb_g2_temperature",
					OldState: structures.State{},
					NewState: structures.State{
						EntityID: "battery.sinope_technologies_th1123zb_g2_temperature",
						State:    "21.3",
						Attributes: map[string]interface{}{
							"device_class":        "temperature",
							"friendly_name":       "Sinope Technologies TH1123ZB-G2 Temperature",
							"state_class":         "measurement",
							"unit_of_measurement": "°C",
						},
						LastChanged: time.Date(2024, 11, 26, 22, 34, 43, 172305000, time.UTC),
						LastUpdated: time.Date(2024, 11, 26, 22, 34, 43, 172305000, time.UTC),
						Context: structures.EventContext{
							ID:       "01JDN9SN345HZCFMAJJG769V8K",
							ParentID: "",
							UserID:   "",
						},
					},
				},
				Origin:    "LOCAL",
				TimeFired: time.Now().Format(time.RFC3339),
				Context: structures.EventContext{
					ID:       "01JDN9SN345HZCFMAJJG769V8K",
					ParentID: "",
					UserID:   "",
				},
			},
		}

	case 7:
		event = ha.WebhookMessage{
			ID:   3,
			Type: "state_changed",
			Event: structures.EventDetails{
				EventType: "state_changed",
				Data: structures.EventData{
					EntityID: "motion.sinope_technologies_th1123zb_g2_temperature",
					OldState: structures.State{},
					NewState: structures.State{
						EntityID: "motion.sinope_technologies_th1123zb_g2_temperature",
						State:    "21.3",
						Attributes: map[string]interface{}{
							"device_class":        "temperature",
							"friendly_name":       "Sinope Technologies TH1123ZB-G2 Temperature",
							"state_class":         "measurement",
							"unit_of_measurement": "°C",
						},
						LastChanged: time.Date(2024, 11, 26, 22, 34, 43, 172305000, time.UTC),
						LastUpdated: time.Date(2024, 11, 26, 22, 34, 43, 172305000, time.UTC),
						Context: structures.EventContext{
							ID:       "01JDN9SN345HZCFMAJJG769V8K",
							ParentID: "",
							UserID:   "",
						},
					},
				},
				Origin:    "LOCAL",
				TimeFired: time.Now().Format(time.RFC3339),
				Context: structures.EventContext{
					ID:       "01JDN9SN345HZCFMAJJG769V8K",
					ParentID: "",
					UserID:   "",
				},
			},
		}
	case 8:
		event = ha.WebhookMessage{
			ID:   3,
			Type: "state_changed",
			Event: structures.EventDetails{
				EventType: "state_changed",
				Data: structures.EventData{
					EntityID: "door.sinope_technologies_th1123zb_g2_temperature",
					OldState: structures.State{},
					NewState: structures.State{
						EntityID: "door.sinope_technologies_th1123zb_g2_temperature",
						State:    "21.3",
						Attributes: map[string]interface{}{
							"device_class":        "temperature",
							"friendly_name":       "Sinope Technologies TH1123ZB-G2 Temperature",
							"state_class":         "measurement",
							"unit_of_measurement": "°C",
						},
						LastChanged: time.Date(2024, 11, 26, 22, 34, 43, 172305000, time.UTC),
						LastUpdated: time.Date(2024, 11, 26, 22, 34, 43, 172305000, time.UTC),
						Context: structures.EventContext{
							ID:       "01JDN9SN345HZCFMAJJG769V8K",
							ParentID: "",
							UserID:   "",
						},
					},
				},
				Origin:    "LOCAL",
				TimeFired: time.Now().Format(time.RFC3339),
				Context: structures.EventContext{
					ID:       "01JDN9SN345HZCFMAJJG769V8K",
					ParentID: "",
					UserID:   "",
				},
			},
		}
	case 9:
		event = ha.WebhookMessage{
			ID:   3,
			Type: "state_changed",
			Event: structures.EventDetails{
				EventType: "state_changed",
				Data: structures.EventData{
					EntityID: "smoke.sinope_technologies_th1123zb_g2_temperature",
					OldState: structures.State{},
					NewState: structures.State{
						EntityID: "smoke.sinope_technologies_th1123zb_g2_temperature",
						State:    "21.3",
						Attributes: map[string]interface{}{
							"device_class":        "temperature",
							"friendly_name":       "Sinope Technologies TH1123ZB-G2 Temperature",
							"state_class":         "measurement",
							"unit_of_measurement": "°C",
						},
						LastChanged: time.Date(2024, 11, 26, 22, 34, 43, 172305000, time.UTC),
						LastUpdated: time.Date(2024, 11, 26, 22, 34, 43, 172305000, time.UTC),
						Context: structures.EventContext{
							ID:       "01JDN9SN345HZCFMAJJG769V8K",
							ParentID: "",
							UserID:   "",
						},
					},
				},
				Origin:    "LOCAL",
				TimeFired: time.Now().Format(time.RFC3339),
				Context: structures.EventContext{
					ID:       "01JDN9SN345HZCFMAJJG769V8K",
					ParentID: "",
					UserID:   "",
				},
			},
		}
	case 10:
		event = ha.WebhookMessage{
			ID:   3,
			Type: "state_changed",
			Event: structures.EventDetails{
				EventType: "state_changed",
				Data: structures.EventData{
					EntityID: "water.sinope_technologies_th1123zb_g2_temperature",
					OldState: structures.State{},
					NewState: structures.State{
						EntityID: "water.sinope_technologies_th1123zb_g2_temperature",
						State:    "21.3",
						Attributes: map[string]interface{}{
							"device_class":        "temperature",
							"friendly_name":       "Sinope Technologies TH1123ZB-G2 Temperature",
							"state_class":         "measurement",
							"unit_of_measurement": "°C",
						},
						LastChanged: time.Date(2024, 11, 26, 22, 34, 43, 172305000, time.UTC),
						LastUpdated: time.Date(2024, 11, 26, 22, 34, 43, 172305000, time.UTC),
						Context: structures.EventContext{
							ID:       "01JDN9SN345HZCFMAJJG769V8K",
							ParentID: "",
							UserID:   "",
						},
					},
				},
				Origin:    "LOCAL",
				TimeFired: time.Now().Format(time.RFC3339),
				Context: structures.EventContext{
					ID:       "01JDN9SN345HZCFMAJJG769V8K",
					ParentID: "",
					UserID:   "",
				},
			},
		}
	case 11:
		event = ha.WebhookMessage{
			ID:   3,
			Type: "state_changed",
			Event: structures.EventDetails{
				EventType: "state_changed",
				Data: structures.EventData{
					EntityID: "temperature.sinope_technologies_th1123zb_g2_temperature",
					OldState: structures.State{},
					NewState: structures.State{
						EntityID: "temperature.sinope_technologies_th1123zb_g2_temperature",
						State:    "21.3",
						Attributes: map[string]interface{}{
							"device_class":        "temperature",
							"friendly_name":       "Sinope Technologies TH1123ZB-G2 Temperature",
							"state_class":         "measurement",
							"unit_of_measurement": "°C",
						},
						LastChanged: time.Date(2024, 11, 26, 22, 34, 43, 172305000, time.UTC),
						LastUpdated: time.Date(2024, 11, 26, 22, 34, 43, 172305000, time.UTC),
						Context: structures.EventContext{
							ID:       "01JDN9SN345HZCFMAJJG769V8K",
							ParentID: "",
							UserID:   "",
						},
					},
				},
				Origin:    "LOCAL",
				TimeFired: time.Now().Format(time.RFC3339),
				Context: structures.EventContext{
					ID:       "01JDN9SN345HZCFMAJJG769V8K",
					ParentID: "",
					UserID:   "",
				},
			},
		}
	}

	return event
}
