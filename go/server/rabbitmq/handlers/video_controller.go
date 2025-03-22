package handlers

import (
	common_rabbitmq "Smartess/go/common/rabbitmq"
	"fmt"
	"log"

	stream_amqp "github.com/rabbitmq/rabbitmq-stream-go-client/pkg/amqp"
	"github.com/rabbitmq/rabbitmq-stream-go-client/pkg/stream"
	"github.com/streadway/amqp"
	"go.uber.org/zap"
)

type ControllerHandler struct {
	r   *common_rabbitmq.RabbitMQInstance
	env *stream.Environment
}

func NewControllerHandler(instance *common_rabbitmq.RabbitMQInstance, env *stream.Environment) *ControllerHandler {
	return &ControllerHandler{r: instance, env: env}
}

// TODO Using log instead of zap or custom output log... cant see logs
func (h *ControllerHandler) Handle(msg amqp.Delivery, logger *zap.Logger) {
	streamName := string(msg.Body)
	logger.Info("Received stream name", zap.String("stream_name", streamName))

	err := h.env.DeclareStream(streamName, &stream.StreamOptions{
		MaxLengthBytes:      stream.ByteCapacity{}.GB(2), // Increased buffer size
		MaxSegmentSizeBytes: stream.ByteCapacity{}.MB(50),
	})
	if err != nil {
		log.Fatalf("Failed to declare a stream: %v", err)
	}
	log.Printf("Declared stream: %s", streamName)

	// Consumer handler
	messagesHandler := func(consumerContext stream.ConsumerContext, message *stream_amqp.Message) {
		// TODO WEBSOCKETS + CONSUMER CLOSE (MOST LOGIC FOR IT HERE)
		var logMessage string

		if message == nil {
			logMessage = "Message is nil"
		} else if message.Properties == nil {
			logMessage = "Message Properties is nil"
		} else {
			logMessage = fmt.Sprintf("MsgID: %v, UserID: %x, To: %s, Subject: %s, ReplyTo: %s",
				message.Properties.MessageID,
				message.Properties.UserID,
				message.Properties.To,
				message.Properties.Subject,
				message.Properties.ReplyTo)
		}

		log.Printf("[TEMP CONSUME] Stream:%s|%s", streamName, logMessage)
	}
	// goroutine for MQ stream consumers
	go func() {
		_, err := h.env.NewConsumer(streamName, messagesHandler,
			stream.NewConsumerOptions().SetOffset(stream.OffsetSpecification{}.First()))
		if err != nil {
			logger.Fatal("Failed to create consumer", zap.Error(err))
			return
		}

		logger.Info("Consumer started", zap.String("stream_name", streamName))

		select {} // keep the goroutine alive
		// TODO WEBSOCKETS + CONSUMER CLOSE
	}()

}
