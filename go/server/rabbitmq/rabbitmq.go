package rabbitmq

import (
	"Smartess/go/common/logging"
	"Smartess/go/common/rabbitmq"
	"errors"
	"fmt"

	"github.com/streadway/amqp"
	"go.uber.org/zap"
)

type RabbitMQServer struct {
	instance  *rabbitmq.RabbitMQInstance
	Logger    *zap.Logger
	consumers []QueueConsumer
}

func Init() (RabbitMQServer, error) {

	logger, err := logging.InitializeLogger("/app/logs/server.log")
	if err != nil {
		return RabbitMQServer{}, errors.New("Failed to initialize logger: " + err.Error())
	}

	instance, err := rabbitmq.Init("/app/config/queues.yaml")
	if err != nil {
		return RabbitMQServer{}, errors.New("Failed to initialize RabbitMQ instance: " + err.Error())
	}
	var consumers []QueueConsumer

	for _, queueConfig := range instance.Config.Queues {
		queue, err := instance.Channel.QueueDeclare(
			queueConfig.Queue,      // name of the queue
			queueConfig.Durable,    // durable
			queueConfig.AutoDelete, // delete when unused
			queueConfig.Exclusive,  // exclusive
			queueConfig.NoWait,     // no-wait
			queueConfig.Arguments,  // arguments
		)
		if err != nil {
			instance.Channel.Close()
			instance.Conn.Close() // Close connection if there's an error
			logger.Fatal("Failed to declare queue", zap.String("queue", queueConfig.Queue), zap.Error(err))
		}
		handler, err := setHandler(queue)
		if err != nil {
			return RabbitMQServer{}, errors.New("Failed to set handler: " + err.Error())
		}
		consumer := QueueConsumer{rabbitmqQueue: queue, messageHandler: handler}
		consumers = append(consumers, consumer)
	}

	// Return RabbitMQServer with consumers
	return RabbitMQServer{
		instance:  instance,
		Logger:    logger,
		consumers: consumers,
	}, nil
}

// Start starts the RabbitMQ server and begins processing messages from the queues.
func (r *RabbitMQServer) Start() {
	for _, smartessQueue := range r.consumers {
		go func(queue QueueConsumer) {
			msgs, err := r.instance.Channel.Consume(
				queue.rabbitmqQueue.Name, // Queue name
				"",                       // Consumer
				true,                     // Auto-acknowledge
				false,                    // Exclusive
				false,                    // No-local
				false,                    // No-wait
				nil,                      // Arguments
			)
			if err != nil {
				r.Logger.Error("Failed to consume messages", zap.Error(err))
			}
			for msg := range msgs {
				r.Logger.Info("Received message", zap.String("message", string(msg.Body)))
				queue.messageHandler.Handle(msg)
			}
		}(smartessQueue)
	}

	// Wait indefinitely (this will run after the goroutines above since go funcs are async (they start a thread and run concurrently))
	r.Logger.Info("RabbitMQ server started. Waiting for messages...")
	select {}
}

func setHandler(queue amqp.Queue) (MessageHandler, error) {
	switch queue.Name {
	case "generic-message":
		return &GenericMessageHandler{}, nil
	case "test-queue":
		return &GenericMessageHandler{}, nil // Add a handler for test-queue
	default:
		return nil, fmt.Errorf("no handler found for queue: %s", queue.Name)
	}
}

func (r *RabbitMQServer) Close() {
	r.instance.Channel.Close()
	r.instance.Conn.Close()
}
