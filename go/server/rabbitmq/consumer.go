package rabbitmq

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/streadway/amqp"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type QueueConsumer struct {
	rabbitmqQueue  amqp.Queue
	messageHandler MessageHandler
}
type MessageHandler interface {
	Handle(amqp.Delivery) error
}

type GenericMessageHandler struct{}

func (h *GenericMessageHandler) Handle(msg amqp.Delivery) error {
	fmt.Printf("Another handler processing: %s\n", msg.Body)
	return nil
}

var mongoClient *mongo.Client

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

type MongoMessageHandler struct{}

type MongoMessage struct {
	ID        primitive.ObjectID `bson:"_id,omitempty"` // MongoDB will generate this ID
	Data      string             `bson:"content"`
	Timestamp time.Time          `bson:"timestamp"`
}

func (h *MongoMessageHandler) Handle(msg amqp.Delivery) error {
	ConnectToMongo()
	// Process the message here
	var message MongoMessage
	err := json.Unmarshal(msg.Body, &message)
	if err != nil {
		log.Printf("Failed to unmarshal message: %v", err)
		return nil
	}

	// Insert the message into MongoDB
	collection := mongoClient.Database("TestDB1").Collection("test")
	_, err = collection.InsertOne(context.TODO(), bson.D{
		{"_id", primitive.NewObjectID()},
		{"content", message.Data},
		{"timestamp", message.Timestamp},
	})
	if err != nil {
		log.Printf("Failed to insert message into MongoDB: %v", err)
		return nil
	}

	fmt.Printf("Inserted message into MongoDB: %+v\n", message)
	return nil
}
