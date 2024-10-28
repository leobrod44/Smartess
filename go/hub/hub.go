package hub

import (
	"Smartess/go/common/logging"
	"Smartess/go/common/rabbitmq"
	"errors"
	"fmt"
	"net/url"
	"os"
	"strconv"

	"github.com/gorilla/websocket"
	"github.com/streadway/amqp"
	"go.uber.org/zap"
)

type WebhookMessage struct {
	Event string `json:"event"`
	Data  string `json:"data"`
}

// RabbitMQ client holds the connection and channel to RabbitMQ
type SmartessHub struct {
	instance    *rabbitmq.RabbitMQInstance
	webhookConn *websocket.Conn
	Logger      *zap.Logger
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

	webhookConn, err := connectMockHubWebhook(logger)
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
		msgType, message, err := r.webhookConn.ReadMessage()
		if err != nil {
			r.Logger.Error(fmt.Sprintf("Error reading message from WebSocket: %v", err))
			continue
		}
		r.Logger.Info(fmt.Sprintf("Type: %s\nReceived: %s\n", strconv.Itoa(msgType), message))

		err = r.Publish(message)
		if err != nil {
			r.Logger.Error(fmt.Sprintf("Failed to publish message to RabbitMQ: %v", err))
		}

		r.Logger.Info(fmt.Sprintf("Type: %s\nReceived: %s\n", strconv.Itoa(msgType), message))
	}
}

// func connectWebhook(logger *zap.Logger) (*websocket.Conn, error) {
// 	hub_ip := os.Getenv("HUB_IP")
// 	u := url.URL{Scheme: "ws", Host: hub_ip, Path: "/api/websocket"}
// 	logger.Info(fmt.Sprintf("Connecting to: %s", u.String()))

// 	conn, _, err := websocket.DefaultDialer.Dial(u.String(), nil)
// 	if err != nil {
// 		logger.Fatal(fmt.Sprintf("Failed to dial WebSocket: %v", err))
// 		return nil, fmt.Errorf("Failed to connect to Home Assistant")
// 	}

// 	logger.Info("Connected to Home Assistant")

// 	token := os.Getenv("WEBHOOK_TOKEN")
// 	authMessage := fmt.Sprintf(`{"type": "auth", "access_token": "%s"}`, token)
// 	err = conn.WriteMessage(websocket.TextMessage, []byte(authMessage))
// 	if err != nil {
// 		logger.Error("Failed to authenticate with Home Assistant")
// 		return nil, fmt.Errorf("failed to authenticate with Home Assistant")
// 	}
// 	logger.Info("Authenticated with Home Assistant")

// 	subscribeMessage := `{"id": 1, "type": "subscribe_events"}`
// 	err = conn.WriteMessage(websocket.TextMessage, []byte(subscribeMessage))
// 	if err != nil {
// 		logger.Error("Failed to subscribe to events")
// 		return nil, fmt.Errorf("failed to subscribe to events")
// 	}
// 	logger.Info("Subscribed to Home Assistant events")
// 	return conn, nil
// }

func connectMockHubWebhook(logger *zap.Logger) (*websocket.Conn, error) {
	hub_ip := os.Getenv("HUB_IP")
	if hub_ip == "" {
		hub_ip = "localhost:8765" // Default to mock hub
	}
	u := url.URL{Scheme: "ws", Host: hub_ip, Path: "/api/websocket"}
	logger.Info(fmt.Sprintf("Connecting to: %s", u.String()))

	conn, _, err := websocket.DefaultDialer.Dial(u.String(), nil)
	if err != nil {
		logger.Fatal(fmt.Sprintf("Failed to dial WebSocket: %v", err))
		return nil, fmt.Errorf("Failed to connect to Mock Hub")
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
	client.webhookConn.Close()
}
