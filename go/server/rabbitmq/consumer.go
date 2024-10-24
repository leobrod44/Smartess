package rabbitmq

import (
	"fmt"

	"github.com/streadway/amqp"
)

type QueueConsumer struct {
	rabbitmqQueue  amqp.Queue
	messageHandler MessageHandler
}
type MessageHandler interface {
	Handle(amqp.Delivery) error
}

type GenericMessageHandler struct{}

func (h *GenericMessageHandler) Handle(msg amqp.Delivery) error {
	fmt.Printf("Another handler processing: %s\n", msg.Body)
	return nil
}
