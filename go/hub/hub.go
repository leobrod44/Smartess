package hub

import (
	common_rabbitmq "Smartess/go/common/rabbitmq"
	"Smartess/go/common/structures"
	"Smartess/go/hub/ha"
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"log"
	"net/url"
	"os"
	"strconv"
	"strings"

	"Smartess/go/hub/logger"

	"github.com/gorilla/websocket"
	"github.com/streadway/amqp"
)

/*
a.k.a RabbitMQHub;
rabbitmq client holds config (queues &exchanges)
the connection (socket,phys,ip)
and channel(s) to rabbitmq instance
*/
type SmartessHub struct {
	instance    *common_rabbitmq.RabbitMQInstance
	webhookConn *websocket.Conn
	Logger      *logs.Logger
}

func Init() (SmartessHub, error) {

	logger, err := logs.NewRabbitMQLogger()
	if err != nil {
		return SmartessHub{}, errors.New("Failed to initialize RabbitMQ logger: " + err.Error())
	}

	instance, err := common_rabbitmq.Init("/app/config/queues.yaml") //todo test with exchanges.yaml vs queues.yaml common/config files... merge or not ?
	if err != nil {
		return SmartessHub{}, errors.New("Failed to initialize RabbitMQ instance: " + err.Error())
	}
	// Declare the topic exchange
	err = instance.Channel.ExchangeDeclare(
		common_rabbitmq.Test0TopicExchangeName, // name of the exchange
		"topic",                                // type of exchange
		true,                                   // durable
		false,                                  // auto-deleted
		false,                                  // internal
		false,                                  // no-wait
		nil,                                    // arguments
	)
	if err != nil {
		return SmartessHub{}, fmt.Errorf("Failed to declare topic exchange: %v", err)
	}
	//webhookConn, err := connectWebhook(logger)
	webhookConn, err := connectTestMongoWebhook(logger)
	if err != nil {
		return SmartessHub{}, errors.New("Failed to connect to Home Assistant: " + err.Error())
	}

	return SmartessHub{
		instance:    instance,
		Logger:      logger,
		webhookConn: webhookConn,
	}, nil
}

// TODO GIVE THIS SOME CLI ARGS TO PARSE SO THAT ONCE CAN PICK BETWEEN : RPI/HA, MONGOMOCK, MOCK
func (r *SmartessHub) Start() {
	for {
		msgType, message, err := r.webhookConn.ReadMessage()
		if err != nil {
			r.Logger.Error(fmt.Sprintf("Failed to read message from WebSocket: %v", err))
			continue
		}
		r.Logger.Info(fmt.Sprintf("Type: %s\nReceived: %s\n", strconv.Itoa(msgType), message))

		err = r.PublishMongo(message)
		if err != nil {
			r.Logger.Error(fmt.Sprintf("Failed to publish Mongo-Test message to RabbitMQ: %v", err))
		}

		err = r.PublishTopicMessages()
		if err != nil {
			r.Logger.Error(fmt.Sprintf("Failed to publish Test Topic messages to RabbitMQ: %v", err))
		}
		//var event ha.WebhookMessage
		//if err := json.Unmarshal(message, &event); err != nil {
		//	r.Logger.Error(fmt.Sprintf("Failed to unmarshal message: %v", err))
		//	continue
		//}
		//_, err = r.checkPublishAlert(&event)
		//if err != nil {
		//	r.Logger.Error(fmt.Sprintf("Failed to publish alert: %v", err))
		//	continue
		//}
		//r.Logger.Info(fmt.Sprintf("Received event: %s", event.Event.EventType))

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

func (client *SmartessHub) Publish(queueName string, message []byte) error {
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

func connectTestMongoWebhook(logger *logs.Logger) (*websocket.Conn, error) {

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

func (client *SmartessHub) PublishMongo(message []byte) error {
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
func (r *SmartessHub) checkPublishAlert(message *ha.WebhookMessage) (bool, error) {

	if !strings.Contains(message.Event.Data.EntityID, "light") && !strings.Contains(message.Event.Data.OldState.State, "switch") {
		return false, nil
	}
	r.Logger.InternalLogger.Info(fmt.Sprintf("Received message %v", message))

	alert := structures.Alert{
		HubIP:     os.Getenv("HUB_IP"),
		DeviceID:  message.Event.Data.EntityID,
		Message:   "Light state changed",
		State:     message.Event.Data.NewState.State,
		TimeStamp: message.Event.Data.NewState.LastChanged,
	}
	r.Logger.InternalLogger.Info(fmt.Sprintf("Sent alert for %s", alert))

	alertJson, err := json.Marshal(alert)

	if err != nil {
		return false, errors.New("failed to marshal alert")
	}
	r.Logger.InternalLogger.Info(fmt.Sprintf("Json alert %s", alertJson))
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
	defer file.Close()

	data, err := ioutil.ReadAll(file)
	if err != nil {
		return nil, err
	}

	if err := json.Unmarshal(data, &messages); err != nil {
		return nil, err
	}

	return messages, nil
}
func (client *SmartessHub) PublishTopicMessages() error {
	var messages []TopicMessage
	var err error
	messages, err = loadTopicMessages("/app/config/test_topic_messages.json")
	if err != nil {
		log.Fatalf("Failed to load test messages: %v\n", err)
	}

	for _, msg := range messages {
		err := client.instance.Channel.Publish(
			common_rabbitmq.Test0TopicExchangeName, // exchange
			msg.RoutingKey,                         // routing key
			false,                                  // mandatory
			false,                                  // immediate
			amqp.Publishing{
				ContentType: "application/json",
				Body:        []byte(msg.Content),
			})

		if err != nil {
			log.Printf("Failed to publish message with routing key %s: %v\n", msg.RoutingKey, err)
			return err
		} else {
			log.Printf("Published message with routing key %s\n", msg.RoutingKey)
		}
	}
	return nil
}

type TopicMessage struct {
	RoutingKey string `json:"routing_key"`
	Content    string `json:"content"`
}
