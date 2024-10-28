package fakehub

import (
	"Smartess/go/common/logging"
	"Smartess/go/common/rabbitmq"
	"Smartess/go/common/structures"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/streadway/amqp"
	"go.uber.org/zap"
)

type WebhookMessage struct {
	Event string `json:"event"`
	Data  string `json:"data"`
}

type SmartessHub struct {
	instance *rabbitmq.RabbitMQInstance
	Logger   *zap.Logger
}

func Init() (SmartessHub, error) {

	logger, err := logging.InitializeLogger("/app/logs/server.log")
	if err != nil {
		return SmartessHub{}, errors.New("Failed to initialize logger: " + err.Error())
	}

	instance, err := rabbitmq.Init("/app/config/queues.yaml")
	if err != nil {
		return SmartessHub{}, errors.New("Failed to initialize RabbitMQ instance: " + err.Error())
	}

	return SmartessHub{
		instance: instance,
		Logger:   logger,
	}, nil
}

func (r *SmartessHub) Start() {
	message := GenerateLightSwitchEventMessage()

	messageBytes, err := json.Marshal(message)
	if err != nil {
		r.Logger.Error(fmt.Sprintf("Error marshaling message to JSON: %v", err))
	}

	for {
		r.Logger.Info(fmt.Sprintf("Type: Test Lightswitch Event Message\nReceived: %s\n", messageBytes))

		err = r.Publish(messageBytes)
		if err != nil {
			r.Logger.Error(fmt.Sprintf("Failed to publish message to RabbitMQ: %v", err))
		}

		time.Sleep(2 * time.Second)
	}
}

func (client *SmartessHub) Publish(message []byte) error {
	return client.instance.Channel.Publish(
		"", // exchange
		"generic-message",
		false, // mandatory
		false, // immediate
		amqp.Publishing{
			ContentType: "text/plain",
			Body:        []byte(message),
		})
}

func (client *SmartessHub) Close() {
	client.instance.Channel.Close()
	client.instance.Conn.Close()
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
