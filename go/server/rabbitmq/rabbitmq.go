package rabbitmq

import (
	"Smartess/go/common/logging"
	common_rabbitmq "Smartess/go/common/rabbitmq"
	"Smartess/go/server/rabbitmq/handlers"
	"errors"
	"fmt"
	"os"

	"github.com/rabbitmq/rabbitmq-stream-go-client/pkg/stream"

	"go.uber.org/zap"
)

type RabbitMQServer struct {
	instance  *common_rabbitmq.RabbitMQInstance
	Logger    *zap.Logger
	consumers []handlers.QueueConsumer
	env       *stream.Environment
}

func Init() (RabbitMQServer, error) {

	logger, err := logging.InitializeLogger("/app/logs/server.log")
	if err != nil {
		return RabbitMQServer{}, errors.New("Failed to initialize logger: " + err.Error())
	}

	//TODO remove mongo and change to supabase, also set as param rather than var passing

	//mongoClient := initMongoDB()

	instance, err := common_rabbitmq.Init("/app/config/config.yaml")
	if err != nil {
		return RabbitMQServer{}, errors.New("Failed to initialize RabbitMQ instance: " + err.Error())
	}
	// Need to create a stream environment for the video stream handler the way it was done on producer side but now for consumer
	env, err := stream.NewEnvironment(
		stream.NewEnvironmentOptions().
			SetUri(os.Getenv("RABBITMQ_STREAM_URI")).
			SetMaxConsumersPerClient(10).
			SetMaxProducersPerClient(10),
	)
	if err != nil {
		logger.Error(fmt.Sprintf("failed to create stream environment: %v", err))
		panic(err)
	}

	defer func() {
		if err := env.Close(); err != nil {
			logger.Error(fmt.Sprintf("Failed to close stream environment: %v", err))
		}
	}()

	var consumers []handlers.QueueConsumer
	for _, exchangeConfig := range instance.Config.Exchanges {
		logger.Info("Exchange: ", zap.Any("exchange", exchangeConfig))
		err = instance.Channel.ExchangeDeclare(
			exchangeConfig.Name,         // name
			exchangeConfig.ExchangeType, // type
			exchangeConfig.Durable,      // durable
			exchangeConfig.AutoDelete,   // auto-deleted
			false,                       // internal
			false,                       // no-wait
			nil,
		)
		if err != nil {
			logger.Fatal("Failed to declare alert topic exchange", zap.Error(err))
		}

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
			// Ignore the website-ready queue (Need not handling, only for users to directly consume from this queue from the website)
			if queue.Name == "website.alert" {
				continue
			}
			handler, err := setHandler(exchangeConfig.Name, queue.Name, instance, env)
			if err != nil {
				return RabbitMQServer{}, errors.New("Failed to set handler: " + err.Error())
			}
			consumer := handlers.QueueConsumer{RabbitmqQueue: queue, MessageHandler: handler}
			consumers = append(consumers, consumer)

		}
	}
	logger.Info("consumers: ", zap.Any("consumers", consumers))

	// Return RabbitMQServer with consumers
	return RabbitMQServer{
		instance:  instance,
		Logger:    logger,
		consumers: consumers,
		env:       env,
	}, nil

}

// Start starts the RabbitMQ server and begins processing messages from the queues.
func (r *RabbitMQServer) Start() {
	videoHandler := handlers.NewControllerHandler(r.instance, r.env) // Assuming env is stored or passed
	go videoHandler.StartWebSocketServer()                           // Start WebSocket server once

	for _, smartessQueue := range r.consumers {
		go func(queueConsumer handlers.QueueConsumer) {
			r.Logger.Info("Starting consumer", zap.String("queue", queueConsumer.RabbitmqQueue.Name))
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
				r.Logger.Info("Received message", zap.String("routing_key", msg.RoutingKey), zap.String("message_body", string(msg.Body)))
				queueConsumer.MessageHandler.Handle(msg, r.Logger) //todo run in goroutine to avoid blocking?

			}
		}(smartessQueue)
	}

	// Wait indefinitely (this will run after the goroutines above since go funcs are async (they start a thread and run concurrently))
	r.Logger.Info("RabbitMQ server started. Waiting for messages...")
	select {}
}

func setHandler(exchange string, queue string, instance *common_rabbitmq.RabbitMQInstance, env *stream.Environment) (handlers.MessageHandler, error) {
	switch exchange {
	case "logs":
		return handlers.NewHubLogHandler(queue), nil
	case "alerts":
		return handlers.NewAlertHandler(instance), nil
	case "videostream":
		return handlers.NewControllerHandler(instance, env), nil
	default:
		return nil, fmt.Errorf("no handler found for queue: %s", queue)
	}
}

func (r *RabbitMQServer) Close() {
	r.instance.Channel.Close()
	r.instance.Conn.Close()
}

// func initMongoDB() *mongo.Client {
// 	clientOptions := options.Client().ApplyURI(os.Getenv("MONGO_STRING"))

// 	client, err := mongo.Connect(context.TODO(), clientOptions)
// 	if err != nil {
// 		log.Fatalf("Failed to connect to MongoDB: %v", err)
// 	}

// 	// Ping the database to verify connection
// 	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
// 	defer cancel()

// 	if err := client.Ping(ctx, nil); err != nil {
// 		log.Fatalf("Failed to ping MongoDB: %v", err)
// 	}

// 	log.Println("Connected to MongoDB")
// 	return client
// }
