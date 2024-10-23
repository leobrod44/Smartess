package rabbitmq

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"github.com/streadway/amqp"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
	"log"
	"os"
	"smartess/server/rabbitmq/messages"
)

// RabbitMQServer represents a RabbitMQ server instance.
type RabbitMQServer struct {
	smartessQueues []SmartessQueue  // List of queues to be processed
	Logger         *zap.Logger      // Logger instance for logging
	channel        *amqp.Channel    // AMQP channel for communication with RabbitMQ
	connection     *amqp.Connection // AMQP connection to RabbitMQ
}

// Init initializes a RabbitMQServer instance.
func Init() (RabbitMQServer, error) {
	logger, err := InitializeLogger()
	if err != nil {
		return RabbitMQServer{}, errors.New("Failed to initialize logger: " + err.Error())
	}

	uri := os.Getenv("RABBITMQ_URI") //"amqp://????:????@localhost:5672/"
	fmt.Println("URI: ", uri)
	//
	//// Parse the URI
	//u, err := url.Parse(uri)
	//if err != nil {
	//	return RabbitMQServer{}, errors.New("Invalid RabbitMQ URI: " + err.Error())
	//}
	//
	//// Check if the scheme is valid
	//if u.Scheme != "amqp" && u.Scheme != "amqps" {
	//	return RabbitMQServer{}, errors.New("AMQP scheme must be either 'amqp://' or 'amqps://'")
	//}

	// Log the connection attempt
	fmt.Println("Connecting to RabbitMQ at", uri)
	conn, err := amqp.Dial(uri)
	if err != nil {
		return RabbitMQServer{}, errors.New("Failed to connect to RabbitMQ: " + err.Error())
	}

	ch, err := conn.Channel()
	if err != nil {
		return RabbitMQServer{}, errors.New("Failed to open a channel: " + err.Error())
	}

	//TODO add all necessary queues based on configuration, ex is all true for sake of example
	sampleQueue, err := Declare(ch, QueueConfig{
		"test-queue", // Queue name
		false,        // Durable
		true,         // Auto-delete
		false,        // Exclusive
		false,        // No-wait
		false,        // Passive
		nil,          // Arguments
	})

	if err != nil {
		logger.Fatal("ERROR: Failed to declare queue", zap.Error(err))
	}

	mongoQueue, err := Declare(ch, QueueConfig{
		"mongo-queue",
		false,
		true,
		false,
		false,
		false,
		nil,
	})

	if err != nil {
		logger.Fatal("ERROR: Failed to declare queue", zap.Error(err))
	}

	srv := RabbitMQServer{
		smartessQueues: []SmartessQueue{sampleQueue, mongoQueue},
		Logger:         logger,
		channel:        ch,
		connection:     conn,
	}
	return srv, nil
}

// Start starts the RabbitMQ server and begins processing messages from the queues.
func (r *RabbitMQServer) Start() {

	defer r.connection.Close()
	defer r.channel.Close()
	//Start consuming messages from each queue
	//TODO: Add neccessary consumption configs for each queue (if we have multiple queues
	//		we could have an array of different consumption configs and listen for each)
	for _, smartessQueue := range r.smartessQueues {
		go func(queue SmartessQueue) {
			msgs, err := r.channel.Consume(
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
				//r.messageHandler.MessageHandler(msg)
				//_ = msg
				fmt.Printf("Received a message: %s\n", msg.Body)
			}
		}(smartessQueue)
	}

	// Wait indefinitely (this will run after the goroutines above since go funcs are async (they start a thread and run concurrently))
	r.Logger.Info("RabbitMQ server started. Waiting for messages...")
	select {}
}

// InitializeLogger initializes the logger instance. Used for our grafana, loki, and promtail system.
func InitializeLogger() (*zap.Logger, error) {

	logFile, err := os.OpenFile("/app/logs/server.log", os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		return nil, err
	}

	fileEncoder := zapcore.NewJSONEncoder(zap.NewProductionEncoderConfig())
	consoleEncoder := zapcore.NewConsoleEncoder(zap.NewDevelopmentEncoderConfig())

	atom := zap.NewAtomicLevelAt(zap.InfoLevel)

	core := zapcore.NewTee(
		zapcore.NewCore(fileEncoder, logFile, atom),
		zapcore.NewCore(consoleEncoder, zapcore.Lock(os.Stdout), atom),
	)

	logger := zap.New(core, zap.AddCaller(), zap.AddStacktrace(zapcore.ErrorLevel))
	return logger, nil
}

var mongoClient *mongo.Client

// ConnectToMongo initializes the MongoDB client.
func ConnectToMongo() {
	clientOptions := options.Client().ApplyURI("mongodb+srv://cluster0admin:cluster0admin@cluster0.yko5a.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")

	var err error
	mongoClient, err = mongo.Connect(context.TODO(), clientOptions)
	if err != nil {
		log.Fatalf("Failed to connect to MongoDB: %v", err)
	}

	// Check the connection
	err = mongoClient.Ping(context.TODO(), nil)
	if err != nil {
		log.Fatalf("Failed to ping MongoDB: %v", err)
	}
	fmt.Println("Connected to MongoDB!")
}

func (r *RabbitMQServer) StartMongoConsumer() {

	ConnectToMongo()

	defer r.connection.Close()
	defer r.channel.Close()

	for _, smartessQueue := range r.smartessQueues {
		go func(queue SmartessQueue) {
			msgs, err := r.channel.Consume(
				"mongo-queue",
				"",
				true,
				false,
				false,
				false,
				nil,
			)
			if err != nil {
				r.Logger.Error("Failed to consume messages", zap.Error(err))
			}
			for msg := range msgs {
				var message messages.MongoMessage
				err := json.Unmarshal(msg.Body, &message)
				if err != nil {
					log.Printf("Failed to unmarshal message: %v", err)
					continue
				}

				// Insert the message into MongoDB
				collection := mongoClient.Database("TestDB1").Collection("test")
				_, err = collection.InsertOne(context.TODO(), bson.D{
					{"_id", message.ID},
					{"content", message.Content},
					{"timestamp", message.Timestamp},
				})
				if err != nil {
					log.Printf("Failed to insert message into MongoDB: %v", err)
					continue
				}

				fmt.Printf("Inserted message into MongoDB: %+v\n", message)
			}
		}(smartessQueue)
	}

	// Wait indefinitely (this will run after the goroutines above since go funcs are async (they start a thread and run concurrently))
	r.Logger.Info("RabbitMQ server started. Waiting for messages...")
	select {}
}
