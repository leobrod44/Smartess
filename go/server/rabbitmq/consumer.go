package rabbitmq

import (
	"fmt"

	"Smartess/go/common/structures"

	"github.com/streadway/amqp"
	"go.uber.org/zap"
	"gopkg.in/yaml.v3"
)

type QueueConsumer struct {
	rabbitmqQueue  amqp.Queue
	messageHandler MessageHandler
}
type MessageHandler interface {
	Handle(msg amqp.Delivery, logger *zap.Logger) error
}

type GenericMessageHandler struct{}

func (h *GenericMessageHandler) Handle(msg amqp.Delivery, logger *zap.Logger) error {
	fmt.Printf("Another handler processing: %s\n", msg.Body)
	return nil
}

type HubLogHandler struct {
	logLevel int
}

func (h *HubLogHandler) Handle(msg amqp.Delivery, logger *zap.Logger) error {
	var log structures.HubLog
	err := yaml.Unmarshal(msg.Body, &log)
	if err != nil {
		return err
	}
	logger.Info("log",
		zap.String("hub_id", log.HubID),
		zap.String("message", log.Message),
		zap.String("time_fired", log.TimeStamp.String()),
	)

	return nil
}
