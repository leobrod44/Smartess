package rabbitmq

import (
	"Smartess/go/common/logging"
	common_rabbitmq "Smartess/go/common/rabbitmq"
	"Smartess/go/server/rabbitmq/handlers"
	"context"
	"errors"
	"fmt"
	"log"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"go.uber.org/zap"
)

type RabbitMQServer struct {
	instance  *common_rabbitmq.RabbitMQInstance
	Logger    *zap.Logger
	consumers []handlers.QueueConsumer
}

func Init() (RabbitMQServer, error) {

	logger, err := logging.InitializeLogger("/app/logs/server.log")
	if err != nil {
		return RabbitMQServer{}, errors.New("Failed to initialize logger: " + err.Error())
	}

	//TODO remove mongo and change to supabase, also set as param rather than var passing

	mongoClient := initMongoDB()

	instance, err := common_rabbitmq.Init("/app/config/config.yaml") //todo test with exchanges.yaml vs queues.yaml common/config files... merge or not ?
	if err != nil {
		return RabbitMQServer{}, errors.New("Failed to initialize RabbitMQ instance: " + err.Error())
	}

	var consumers []handlers.QueueConsumer

	for _, exchangeConfig := range instance.Config.Exchanges {
		for _, queueConfig := range exchangeConfig.QueueBindings {
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
			err = instance.Channel.QueueBind(
				queue.Name,             // queue name
				queueConfig.RoutingKey, // routing key
				exchangeConfig.Name,    // exchange name
				false,
				nil,
			)
			if err != nil {
				return RabbitMQServer{}, fmt.Errorf("failed to bind queue %s to exchange %s with routing key %s: %v", queue.Name,
					exchangeConfig.Name, queueConfig.RoutingKey, err)
			}
			handler, err := setHandler(exchangeConfig.Name, queue.Name, mongoClient)
			if err != nil {
				return RabbitMQServer{}, errors.New("Failed to set handler: " + err.Error())
			}
			consumer := handlers.QueueConsumer{RabbitmqQueue: queue, MessageHandler: handler}
			consumers = append(consumers, consumer)

		}
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
		go func(queueConsumer handlers.QueueConsumer) {
			msgs, err := r.instance.Channel.Consume(
				queueConsumer.RabbitmqQueue.Name, // Queue name
				"",                               // Consumer
				true,                             // Auto-acknowledge
				false,                            // Exclusive
				false,                            // No-local
				false,                            // No-wait
				nil,                              // Arguments
			)
			if err != nil {
				r.Logger.Error(fmt.Sprintf("Failed to consume messages \n\t(Current Consumer: %v)\n\t", queueConsumer),
					zap.Error(err))
			}
			for msg := range msgs {
				queueConsumer.MessageHandler.Handle(msg, r.Logger)

			}
		}(smartessQueue)
	}

	// Wait indefinitely (this will run after the goroutines above since go funcs are async (they start a thread and run concurrently))
	r.Logger.Info("RabbitMQ server started. Waiting for messages...")
	select {}
}

func setHandler(exchange string, queue string, mongoClient *mongo.Client) (handlers.MessageHandler, error) {
	switch exchange {
	case "logs":
		return handlers.NewHubLogHandler(queue), nil
	case "alerts":
		return handlers.NewAlertHandler(mongoClient), nil
	case "videostream":
		return handlers.NewVideoHandler(), nil
	default:
		return nil, fmt.Errorf("no handler found for queue: %s", queue)
	}
}

func (r *RabbitMQServer) Close() {
	r.instance.Channel.Close()
	r.instance.Conn.Close()
}

func initMongoDB() *mongo.Client {
	clientOptions := options.Client().ApplyURI(os.Getenv("MONGO_STRING"))

	client, err := mongo.Connect(context.TODO(), clientOptions)
	if err != nil {
		log.Fatalf("Failed to connect to MongoDB: %v", err)
	}

	// Ping the database to verify connection
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := client.Ping(ctx, nil); err != nil {
		log.Fatalf("Failed to ping MongoDB: %v", err)
	}

	log.Println("Connected to MongoDB")
	return client
}
