package fakehub

import (
	"Smartess/go/common/logging"
	"Smartess/go/common/rabbitmq"
	"errors"
	"log"
	"net/http"
	"time"

	"github.com/gorilla/websocket"
	"github.com/streadway/amqp"
	"go.uber.org/zap"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

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

func main() {
	http.HandleFunc("/api/websocket", func(w http.ResponseWriter, r *http.Request) {
		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			log.Println("Upgrade error:", err)
			return
		}
		defer conn.Close()

		for {
			message := `{"event": "fake_event", "data": "This is a fake event"}`
			err = conn.WriteMessage(websocket.TextMessage, []byte(message))
			if err != nil {
				log.Println("Write error:", err)
				return
			}
			time.Sleep(5 * time.Second) // Send a message every 5 seconds
		}
	})

	log.Println("Fake hub server started on :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
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
