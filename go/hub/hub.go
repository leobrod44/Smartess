package hub

import (
	"Smartess/go/common/rabbitmq"
	"Smartess/go/hub/ha"
	"Smartess/go/hub/logs"
	"encoding/json"
	"errors"
	"fmt"
	"net/url"
	"os"

	"github.com/gorilla/websocket"
	"github.com/streadway/amqp"
)

// RabbitMQ client holds the connection and channel to RabbitMQ
type SmartessHub struct {
	instance    *rabbitmq.RabbitMQInstance
	webhookConn *websocket.Conn
	Logger      *logs.Logger
}

func Init() (SmartessHub, error) {

	logger, err := logs.NewRabbitMQLogger()
	if err != nil {
		return SmartessHub{}, errors.New("Failed to initialize RabbitMQ logger: " + err.Error())
	}

	instance, err := rabbitmq.Init("/app/config/queues.yaml")
	if err != nil {
		return SmartessHub{}, errors.New("Failed to initialize RabbitMQ instance: " + err.Error())
	}

	webhookConn, err := connectWebhook(logger)
	if err != nil {
		return SmartessHub{}, errors.New("Failed to connect to Home Assistant: " + err.Error())
	}

	return SmartessHub{
		instance:    instance,
		Logger:      logger,
		webhookConn: webhookConn,
	}, nil
}

func (r *SmartessHub) Start() {
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
		r.Logger.Info(fmt.Sprintf("Received event: %s", event.Event.EventType))

	}
}

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

func (client *SmartessHub) Publish(queue string, message []byte) error {
	return client.instance.Channel.Publish(
		"", // exchange
		queue,
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
	client.webhookConn.Close()
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

	logger.Info("Connected to Mock Hub")

	token := os.Getenv("WEBHOOK_TOKEN")
	authMessage := fmt.Sprintf(`{"type": "auth", "access_token": "%s"}`, token)
	err = conn.WriteMessage(websocket.TextMessage, []byte(authMessage))
	if err != nil {
		logger.Error("Failed to authenticate with Mock Hub")
		return nil, fmt.Errorf("failed to authenticate with Mock Hub")
	}
	logger.Info("Authenticated with Mock Hub")

	subscribeMessage := `{"id": 1, "type": "subscribe_events"}`
	err = conn.WriteMessage(websocket.TextMessage, []byte(subscribeMessage))
	if err != nil {
		logger.Error("Failed to subscribe to events")
		return nil, fmt.Errorf("failed to subscribe to events")
	}
	logger.Info("Subscribed to Mock Hub events")
	return conn, nil
}
