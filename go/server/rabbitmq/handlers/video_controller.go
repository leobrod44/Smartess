package handlers

import (
	common_rabbitmq "Smartess/go/common/rabbitmq"
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
	log.Printf("Declared stream:" + streamName)

	messagesHandler := func(consumerContext stream.ConsumerContext, message *stream_amqp.Message) {
		log.Printf("TEMP CONSUME: " + streamName)
	}

	// goroutine for stream consumers
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
