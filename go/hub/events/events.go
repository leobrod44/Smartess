package events

import (
	common_rabbitmq "Smartess/go/common/rabbitmq"
	structures "Smartess/go/common/structures"
	"Smartess/go/hub/ha"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/url"
	"os"
	"strings"
	"time"

	logs "Smartess/go/hub/logger"

	"github.com/gorilla/websocket"
	"github.com/streadway/amqp"
)

type EventHandler struct {
	instance    *common_rabbitmq.RabbitMQInstance
	webhookConn *websocket.Conn
	Logger      *logs.Logger
}

func Init(selectedHub structures.HubTypeEnum, logger *logs.Logger, instance *common_rabbitmq.RabbitMQInstance) (EventHandler, error) {

	var webhookConn *websocket.Conn
	var err error
	switch selectedHub {
	case structures.LOCAL_MOCK_HUB:
		webhookConn, err = connectMockHubWebhook(logger)
	case structures.HA_NORMAL_HUB:
		webhookConn, err = connectWebhook(logger)
	default:
		return EventHandler{}, fmt.Errorf("Invalid Hub Type: %s", selectedHub)
	}

	if err != nil {
		return EventHandler{}, errors.New("Failed to connect to WebSocket: " + err.Error())
	}

	return EventHandler{
		instance:    instance,
		Logger:      logger,
		webhookConn: webhookConn,
	}, nil
}

func (r *EventHandler) Start(selectedHub structures.HubTypeEnum) {
	for {
		_, message, err := r.webhookConn.ReadMessage()
		if err != nil {
			r.Logger.Error(fmt.Sprintf("Failed to read message from WebSocket: %v", err))
			continue
		}

		var event ha.WebhookMessage
		if err := json.Unmarshal(message, &event); err != nil {
			r.Logger.Error(fmt.Sprintf("Failed to unmarshal message: %v", err))
			continue
		}
		_, err = r.checkEvent(&event)
		if err != nil {
			r.Logger.Error(fmt.Sprintf("Failed to publish alert: %v", err))
			continue
		}
	}
}

// TODO all event parsing logic here
func (r *EventHandler) checkEvent(message *ha.WebhookMessage) (bool, error) {
	//Check if state change event
	if message.Event.EventType != "state_changed" || message.Event.Data.EntityID != "light.hue_go_2" {
		return false, nil
	}
	classification := &ha.EventClassification{}
	demoType := classification.DemoLightMapping(message, r.Logger)
	message.Event.Data.EntityID = demoType
	conciseEvent := ha.ConvertWebhookMessageToConciseEvent(message)

	parsedTime, err := time.Parse(time.RFC3339, message.Event.TimeFired)
	if err != nil {
		log.Fatalf("failed to parse time: %v", err)
	}

	//  TODO 1 NEED A BETTER AND MORE IN DEPTH WAY TO DETERMINE THE ALERT SEVERITY INFORMATION/WARNING/CRITICAL
	routeKey := classification.GenerateAlertRoutingKey(conciseEvent, message)
	//  TODO ADD MORE TYPE | sensors have many different types
	alertType := ha.DetermineAlertType(conciseEvent.EntityID)
	alert := structures.Alert{
		HubIP:    os.Getenv("HUB_IP"),
		DeviceID: message.Event.Data.EntityID,
		// TODO WHAT IS THE MESSAGE?
		Message:   *conciseEvent.Attributes.FriendlyName,
		State:     message.Event.Data.NewState.State,
		TimeStamp: parsedTime,
		Type:      alertType,
	}
	r.Logger.Info(fmt.Sprintf("%v", alert))
	alertJson, err := json.Marshal(alert)
	if err != nil {
		return false, errors.New("failed to marshal alert")
	}

	var exchangeName string
	// Find the matching exchange for the message's routing key
	for _, exchange := range r.instance.Config.Exchanges {
		for _, binding := range exchange.QueueBindings {
			parts := strings.Split(binding.RoutingKey, ".")
			if strings.Contains(routeKey, parts[0]) {
				exchangeName = exchange.Name
				break
			}
		}
		if exchangeName != "" {
			break
		}
	}
	// If no exchange found for the routing key, log an error
	if exchangeName == "" {
		log.Printf("No matching exchange found for routing key %s\n", routeKey)
		return false, fmt.Errorf("no matching exchange found for routing key %s", routeKey)
	}

	return true, r.instance.Channel.Publish(
		exchangeName, // exchange
		routeKey,     //key
		true,         // mandatory
		false,        // immediate
		amqp.Publishing{
			ContentType: "text/plain",
			Body:        []byte(alertJson),
		})
}

// TODO add with options which are dynamic with type of config, generic with event type, condition?

// TODO check for all valid events for a message

func connectWebhook(logger *logs.Logger) (*websocket.Conn, error) {
	hub_ip := os.Getenv("HUB_IP")
	u := url.URL{Scheme: "ws", Host: hub_ip, Path: "/api/websocket"}
	logger.Info(fmt.Sprintf("Connecting to: %s", u.String()))

	conn, _, err := websocket.DefaultDialer.Dial(u.String(), nil)
	if err != nil {
		logger.Error(fmt.Sprintf("Failed to dial WebSocket: %v", err))
		return nil, fmt.Errorf("failed to connect to Home Assistant")
	}

	logger.Info("Connected to Home Assistant")

	token := os.Getenv("WEBHOOK_TOKEN")
	authMessage := fmt.Sprintf(`{"type": "auth", "access_token": "%s"}`, token)
	err = conn.WriteMessage(websocket.TextMessage, []byte(authMessage))
	if err != nil {
		logger.Error("Failed to authenticate with Home Assistant")
		return nil, fmt.Errorf("failed to authenticate with Home Assistant")
	}
	logger.Info("Authenticated with Home Assistant")

	subscribeMessage := `{"id": 1, "type": "subscribe_events"}`
	err = conn.WriteMessage(websocket.TextMessage, []byte(subscribeMessage))
	if err != nil {
		logger.Error("Failed to subscribe to events")
		return nil, fmt.Errorf("failed to subscribe to events")
	}
	logger.Info("Subscribed to Home Assistant events")
	return conn, nil
}

func (client *EventHandler) Close() {
	closeWithErrorLog := func(closeFunc func() error, errMsg string) {
		if err := closeFunc(); err != nil {
			client.Logger.Error(fmt.Sprintf("%s: %v", errMsg, err))
		}
	}
	closeWithErrorLog(client.instance.Channel.Close, "Failed to close RabbitMQ Instance channel(s)")
	closeWithErrorLog(client.instance.Conn.Close, "Failed to close RabbitMQ Instance actual connection")
	closeWithErrorLog(client.webhookConn.Close, "Failed to close WebSocket connection")

}

func connectMockHubWebhook(logger *logs.Logger) (*websocket.Conn, error) {

	hub_ip := "mockhub:8765" // Default to mock hub

	u := url.URL{Scheme: "ws", Host: hub_ip, Path: "/api/websocket"}
	logger.Info(fmt.Sprintf("Connecting to: %s", u.String()))

	conn, _, err := websocket.DefaultDialer.Dial(u.String(), nil)
	if err != nil {
		logger.Error(fmt.Sprintf("Failed to dial WebSocket: %v", err))
		return nil, fmt.Errorf("failed to connect to Mock Hub")
	}

	logger.Info("Connected to Home Assistant")

	token := os.Getenv("WEBHOOK_TOKEN")
	authMessage := fmt.Sprintf(`{"type": "auth", "access_token": "%s"}`, token)
	err = conn.WriteMessage(websocket.TextMessage, []byte(authMessage))
	if err != nil {
		logger.Error("Failed to authenticate with Home Assistant")
		return nil, fmt.Errorf("failed to authenticate with Home Assistant")
	}
	logger.Info("Authenticated with Home Assistant")

	subscribeMessage := `{"id": 1, "type": "subscribe_events"}`
	err = conn.WriteMessage(websocket.TextMessage, []byte(subscribeMessage))
	if err != nil {
		logger.Error("Failed to subscribe to events")
		return nil, fmt.Errorf("failed to subscribe to events")
	}
	logger.Info("Subscribed to Home Assistant events")
	return conn, nil
}
