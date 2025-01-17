package handlers

import (
	"github.com/streadway/amqp"
	"go.uber.org/zap"
)

type QueueConsumer struct {
	RabbitmqQueue  amqp.Queue
	MessageHandler MessageHandler
}
type MessageHandler interface {
	Handle(msg amqp.Delivery, logger *zap.Logger)
}
