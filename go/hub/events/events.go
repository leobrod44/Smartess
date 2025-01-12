package events

import (
	common_rabbitmq "Smartess/go/common/rabbitmq"
	structures "Smartess/go/common/structures"
	"Smartess/go/hub/ha"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net/url"
	"os"
	"strconv"
	"strings"

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
	case structures.MONGO_MOCK_HUB:
		webhookConn, err = connectTestMongoWebhook(logger)
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
	fmt.Print("Starting event handler")
	iterCnt := 0
	for {
		msgType, message, err := r.webhookConn.ReadMessage()
		if err != nil {
			r.Logger.Error(fmt.Sprintf("Failed to read message from WebSocket: %v", err))
			continue
		}
		r.Logger.Info(fmt.Sprintf("Type: %s\nReceived: %s", strconv.Itoa(msgType), message))

		if selectedHub == structures.MONGO_MOCK_HUB {
			err = r.PublishMongo(message)
			if err != nil {
				r.Logger.Error(fmt.Sprintf("Failed to publish Mongo-Test message to RabbitMQ: %v", err))
			}
		} else {
			var event ha.WebhookMessage
			if err := json.Unmarshal(message, &event); err != nil {
				r.Logger.Error(fmt.Sprintf("Failed to unmarshal message: %v", err))
				continue
			}
			_, err = r.checkPublishAlert(&event)
			if err != nil {
				r.Logger.Error(fmt.Sprintf("Failed to publish alert: %v", err))
				continue
			}
		}
		if iterCnt == 0 {
			err = r.PublishTopicMessages()
			r.Logger.Info("Published messages to RabbitMQ")
			if err != nil {
				r.Logger.Error(fmt.Sprintf("Failed to publish Test Topic messages to RabbitMQ: %v", err))
			}
		}
		iterCnt++
		r.Logger.Info(fmt.Sprintf("Iteration count: %d", iterCnt))

	}
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

func (client *EventHandler) Publish(queueName string, message []byte) error {
	return client.instance.Channel.Publish(
		"",        // exchange
		queueName, //key
		false,     // mandatory
		false,     // immediate
		amqp.Publishing{
			ContentType: "text/plain",
			Body:        []byte(message),
		})
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

func connectTestMongoWebhook(logger *logs.Logger) (*websocket.Conn, error) { // This is here to simulate a connection to rpi

	u := url.URL{Scheme: "ws", Host: "mock-mongo-server:9090", Path: "/ws"}
	logger.Info(fmt.Sprintf("Connecting to: %s", u.String()))

	conn, _, err := websocket.DefaultDialer.Dial(u.String(), nil)
	if err != nil {
		logger.Fatal(fmt.Sprintf("Failed to dial WebSocket: %v", err))
		return nil, fmt.Errorf("Failed to connect to Mock Mongo Server")
	}

	logger.Info("Connected to Mock Mongo Server")

	subscribeMessage := `{"id": 1, "type": "subscribe_events"}`
	err = conn.WriteMessage(websocket.TextMessage, []byte(subscribeMessage))
	if err != nil {
		logger.Error("Failed to subscribe to events")
		return nil, fmt.Errorf("failed to subscribe to events")
	}
	logger.Info("Subscribed to Mock Mongo events")
	return conn, nil
}

func (client *EventHandler) PublishMongo(message []byte) error { // This is here to simulate a connection to rpi
	return client.instance.Channel.Publish(
		"", // exchange
		"mongo-messages",
		false, // mandatory
		false, // immediate
		amqp.Publishing{
			ContentType: "text/plain",
			Body:        []byte(message),
		})
}

// TODO generalize
func (r *EventHandler) checkPublishAlert(message *ha.WebhookMessage) (bool, error) {

	if !strings.Contains(message.Event.Data.EntityID, "light") && !strings.Contains(message.Event.Data.OldState.State, "switch") {
		return false, nil
	}
	r.Logger.Info(fmt.Sprintf("Received message %v", message))

	alert := structures.Alert{
		HubIP:     os.Getenv("HUB_IP"),
		DeviceID:  message.Event.Data.EntityID,
		Message:   "Light state changed",
		State:     message.Event.Data.NewState.State,
		TimeStamp: message.Event.Data.NewState.LastChanged,
	}
	r.Logger.Info(fmt.Sprintf("Sent alert for %s", alert))

	alertJson, err := json.Marshal(alert)

	if err != nil {
		return false, errors.New("failed to marshal alert")
	}
	r.Logger.Info(fmt.Sprintf("Json alert %s", alertJson))
	return true, r.Publish(
		"alerts",
		alertJson,
	)

}
func loadTopicMessages(path string) ([]TopicMessage, error) {
	var messages []TopicMessage

	file, err := os.Open(path)
	if err != nil {
		return nil, err
	}
	// Closure (non parameter) needed to close local instance of file descritor after loadTopicMessages returns
	defer func() {
		if cerr := file.Close(); cerr != nil {
			log.Printf("failed to close file: %v", cerr)
		}
	}()

	data, err := io.ReadAll(file)
	if err != nil {
		return nil, err
	}

	if err := json.Unmarshal(data, &messages); err != nil {
		return nil, err
	}

	return messages, nil
}
func (client *EventHandler) PublishTopicMessages() error {
	var messages []TopicMessage
	var err error
	messages, err = loadTopicMessages("/app/config/test_topic_messages.json")
	if err != nil {
		log.Fatalf("Failed to load test messages: %v\n", err)
	}

	// todo CURRENTLY choosing which exchnage to publish to is done by contains, but should be changed to maybe regex???? the internal * # does not work here
	exchanges := []struct {
		Name        string
		Type        string
		RoutingKeys []string
	}{
		{
			Name:        common_rabbitmq.Test0AlertRoutingKey, // Alert exchange
			Type:        "topic",
			RoutingKeys: []string{"alerts", "notifications", "storemongo"},
		},
		{
			Name:        common_rabbitmq.Test0VideoStreamingRoutingKey, // Video exchange
			Type:        "direct",
			RoutingKeys: []string{"video.stream", "video.monitor"},
		},
	}

	// Iterate over the messages
	for _, msg := range messages {
		var exchangeName string
		// Find the matching exchange for the message's routing key
		for _, exchange := range exchanges {
			for _, key := range exchange.RoutingKeys {
				// Check if routing key matches any of the patterns (simple example, could be extended for pattern matching)
				if strings.Contains(msg.RoutingKey, key) {
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
			log.Printf("No matching exchange found for routing key %s\n", msg.RoutingKey)
			return fmt.Errorf("no matching exchange found for routing key %s", msg.RoutingKey)
		}

		err := client.instance.Channel.Publish(
			exchangeName,   // Selected exchange
			msg.RoutingKey, // Routing key
			false,          // mandatory
			false,          // immediate                                 // immediate
			amqp.Publishing{
				ContentType: "application/json",
				Body:        []byte(msg.Content),
			})

		if err != nil {
			log.Printf("Failed to publish message to exchange %s with routing key %s: %v\n", exchangeName, msg.RoutingKey, err)
			return err
		} else {
			log.Printf("Published message to exchange %s with routing key %s\n", exchangeName, msg.RoutingKey)
		}
	}
	return nil
}

type TopicMessage struct {
	RoutingKey string `json:"routing_key"`
	Content    string `json:"content"`
}
