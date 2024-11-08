package rabbitmq

import (
	"context"
	"encoding/json"
	"fmt"
	"os"

	"Smartess/go/common/structures"
	"github.com/streadway/amqp"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.uber.org/zap"
	"log"
)

type QueueConsumer struct {
	rabbitmqQueue  amqp.Queue
	messageHandler MessageHandler
}
type MessageHandler interface {
	Handle(msg amqp.Delivery, logger *zap.Logger)
}

type HubLogHandler struct {
	logLevel int
}

func (h *HubLogHandler) Handle(msg amqp.Delivery, logger *zap.Logger) { //(err error)

	var log structures.HubLog
	err := json.Unmarshal(msg.Body, &log)
	if err != nil {
		logger.Error("Failed to unmarshal log", zap.Error(err))
		//return err
	}
	switch h.logLevel {
	case 0:
		logger.Info("log",
			zap.String("hub_id", log.HubID),
			zap.String("message", log.Message),
			zap.String("time_fired", log.TimeStamp.String()),
		)
	case 1:
		logger.Warn("log",
			zap.String("hub_id", log.HubID),
			zap.String("message", log.Message),
			zap.String("time_fired", log.TimeStamp.String()),
		)
	case 2:
		logger.Error("log",
			zap.String("hub_id", log.HubID),
			zap.String("message", log.Message),
			zap.String("time_fired", log.TimeStamp.String()),
		)
	default:
		logger.Info("log",
			zap.String("hub_id", log.HubID),
			zap.String("message", log.Message),
			zap.String("time_fired", log.TimeStamp.String()),
		)
	}
	//return nil
}

type AlertHandler struct{}

func (h *AlertHandler) Handle(msg amqp.Delivery, logger *zap.Logger) {
	var alert structures.Alert
	err := json.Unmarshal(msg.Body, &alert)
	if err != nil {
		logger.Error("Failed to unmarshal alert",
			zap.Error(err),
			zap.String("msg", string(msg.Body)),
		)
	}
	//TODO @ryan: send alert to Mongo
	logger.Info("alert",
		zap.String("hub_id", alert.HubIP),
		zap.String("device_id", alert.DeviceID),
		zap.String("state", alert.State),
		zap.String("message", alert.Message),
		zap.String("time_fired", alert.TimeStamp.String()),
	)

	ConnectToMongo()
	collection := mongoClient.Database("TestDB1").Collection(alert.HubIP) // database = building, collection = unit | where is building info???
	_, err = collection.InsertOne(context.TODO(), bson.D{
		{"_id", primitive.NewObjectID()},
		{"hub_id", alert.HubIP},
		{"device_id", alert.DeviceID},
		{"state", alert.State},
		{"message", alert.Message},
		{"time_fired", alert.TimeStamp.String()},
	})
	if err != nil {
		logger.Error("Failed to insert message into MongoDB", zap.Error(err))
	}

}

var mongoClient *mongo.Client

func ConnectToMongo() {
	clientOptions := options.Client().ApplyURI(os.Getenv("MONGO_STRING"))

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

type MongoMessageHandler struct{}

func (h *MongoMessageHandler) Handle(msg amqp.Delivery, logger *zap.Logger) {
	ConnectToMongo()
	// Process the message here
	var message structures.TestMongoMessage
	err := json.Unmarshal(msg.Body, &message)
	if err != nil {
		logger.Error("Failed to unmarshal message", zap.Error(err))
	}

	// Insert the message into MongoDB
	collection := mongoClient.Database("TestDB1").Collection("test")
	_, err = collection.InsertOne(context.TODO(), bson.D{
		{"_id", primitive.NewObjectID()},
		{"content", message.Data},
		{"timestamp", message.Timestamp},
	})
	if err != nil {
		logger.Error("Failed to insert message into MongoDB", zap.Error(err))
	}
}
