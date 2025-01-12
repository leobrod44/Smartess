package rabbitmq

import (
	"Smartess/go/common/logging"
	common_rabbitmq "Smartess/go/common/rabbitmq"
	"context"
	"errors"
	"fmt"
	"log"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"github.com/streadway/amqp"
	"go.uber.org/zap"
)

type RabbitMQServer struct {
	instance  *common_rabbitmq.RabbitMQInstance
	Logger    *zap.Logger
	consumers []QueueConsumer
}

func Init() (RabbitMQServer, error) {

	logger, err := logging.InitializeLogger("/app/logs/server.log")
	if err != nil {
		return RabbitMQServer{}, errors.New("Failed to initialize logger: " + err.Error())
	}

	mongoClient := initMongoDB()

	instance, err := common_rabbitmq.Init("/app/config/queues.yaml") //todo test with exchanges.yaml vs queues.yaml common/config files... merge or not ?
	if err != nil {
		return RabbitMQServer{}, errors.New("Failed to initialize RabbitMQ instance: " + err.Error())
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
		logger.Fatal("Failed to declare topic exchange", zap.Error(err))
	}
	var consumers []QueueConsumer

	//TODO add marshals struct, or check if necessary
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

		// Bind queue to topic exchange based on the queue name
		//var routingKeys []string
		//switch queueConfig.Queue {
		//case "notifications":
		//	routingKey = common_rabbitmq.Test0NotificationRoutingKey
		//case "alerts":
		//	routingKey = common_rabbitmq.Test0AlertRoutingKey
		//default:
		//	return RabbitMQServer{}, fmt.Errorf("no valid routing key found for queue: %s", queueConfig.Queue)
		//}
		var routingKeysBinded []string
		//todo: Now only one exchange is setup, but eventually go through all exchanges
		for _, binding := range instance.Config.Exchanges[0].QueueBindings {
			if binding.Queue == queue.Name {
				err = instance.Channel.QueueBind(
					queue.Name,                             // queue name
					binding.RoutingKey,                     // routing key
					common_rabbitmq.Test0TopicExchangeName, // exchange name
					false,
					nil,
				)
				if err != nil {
					return RabbitMQServer{}, fmt.Errorf("failed to bind queue %s to exchange %s with routing key %s: %v", queue.Name,
						common_rabbitmq.Test0TopicExchangeName, binding.RoutingKey, err)
				}
				routingKeysBinded = append(routingKeysBinded, binding.RoutingKey)

			}
		}
		if len(routingKeysBinded) == 0 {
			routingKeysBinded = append(routingKeysBinded, "")
		}
		for _, routingKey := range routingKeysBinded {
			handler, err := setHandler(queue, routingKey, mongoClient)
			if err != nil {
				return RabbitMQServer{}, errors.New("Failed to set handler: " + err.Error())
			}
			consumer := QueueConsumer{rabbitmqQueue: queue, messageHandler: handler}
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
		go func(queueConsumer QueueConsumer) {
			msgs, err := r.instance.Channel.Consume(
				queueConsumer.rabbitmqQueue.Name, // Queue name
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
				queueConsumer.messageHandler.Handle(msg, r.Logger)

			}
		}(smartessQueue)
	}

	// Wait indefinitely (this will run after the goroutines above since go funcs are async (they start a thread and run concurrently))
	r.Logger.Info("RabbitMQ server started. Waiting for messages...")
	select {}
}

// TODO Consider migrating fully to exchanges here...
func setHandler(queue amqp.Queue, optionalRoutingKey string, mongoClient *mongo.Client) (MessageHandler, error) {

	if optionalRoutingKey != "" {
		return &TopicMessageHandler{RoutingKey: optionalRoutingKey, mongoClient: mongoClient}, nil
	}
	switch queue.Name {
	case "mongo-messages":
		return &MongoMessageHandler{mongoClient}, nil
	case "hub-info-logs":
		return &HubLogHandler{logLevel: 0}, nil
	case "hub-warn-logs":
		return &HubLogHandler{logLevel: 1}, nil
	case "hub-error-logs":
		return &HubLogHandler{logLevel: 2}, nil
	case "alerts":
		return &AlertHandler{mongoClient}, nil
	default:
		return nil, fmt.Errorf("no handler found for queue: %s", queue.Name)
	}
}

func (r *RabbitMQServer) Close() {
	r.instance.Channel.Close()
	r.instance.Conn.Close()
}

// TODO RYAN CONTEXT.TODO()
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
