package main

import (
	"encoding/json"
	"fmt"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"log"
	"os"
	"smartess/server/rabbitmq"
	"smartess/server/rabbitmq/messages"
	"strconv"
	"time"

	"github.com/streadway/amqp"
)

func main() {
	fmt.Println("main(): Starting RabbitMQ server...")
	srv, err := rabbitmq.Init()

	if err != nil {
		panic("Failed to initialize logger: " + err.Error())
	}
	defer srv.Logger.Sync() // Flushes logger before exit to not have any logs lost kinda cool

	srv.Logger.Info("Logger initialized and started")

	//Start the mock message producer

	go StartProducer()
	//go StartMongoProducer()

	// Start the RabbitMQ server (consumer)
	for {
		go srv.Start() // Start the RabbitMQ server on a separate goroutine
		//go srv.StartMongoConsumer()
		time.Sleep(10 * time.Second) // Sleep for activity monitoring, not this dosen't mean the server stops since we used a goroutine!
		//TODO print still running for starting purposes, but removing this useless clutter down the line
		log.Println("Server still running...")
	}

	//todo defer srv.Close()
}

func StartProducer() {
	// Connect to RabbitMQ
	conn, ch := ConnectToRabbitMQ(os.Getenv("RABBITMQ_URI")) //"amqp://guest:guest@localhost:5672/")
	defer ch.Close()
	defer conn.Close()
	q, err := ch.QueueDeclare(
		"test_queue", // name
		true,         // durable (will persist through restarts)
		false,        // delete when unused
		false,        // exclusive
		false,        // no-wait
		nil,          // arguments
	)
	if err != nil {
		log.Fatalf("Failed to declare a queue: %v", err)
	}
	// Send a message every second
	for {
		body := fmt.Sprintf("Current time: %s", time.Now().Format(time.RFC3339))
		err = ch.Publish( //NB: For work queues, the routing key is queue name and exchange is empty and usually PublishContext is used
			"",     // exchange
			q.Name, // routing key
			false,  // mandatory
			false,  // immediate
			amqp.Publishing{
				ContentType: "text/plain",
				Body:        []byte(body),
			})
		if err != nil {
			log.Fatalf("Failed to publish a message: %v", err)
		}
		log.Printf(" [x] Sent %s", body)
		time.Sleep(1 * time.Second)
	}
}

func ConnectToRabbitMQ(uri string) (*amqp.Connection, *amqp.Channel) {
	conn, err := amqp.Dial(uri)
	if err != nil {
		log.Fatalf("Failed to connect to RabbitMQ: %v", err)
	}
	//defer conn.Close()
	ch, err := conn.Channel()
	if err != nil {
		conn.Close()
		log.Fatalf("Failed to open a channel: %v", err)
	}
	return conn, ch
}

func StartMongoProducer() {
	conn, ch := ConnectToRabbitMQ("amqp://admin:admin@rabbitmq:5672/") //os.Getenv("RABBITMQ_URI")
	defer ch.Close()
	defer conn.Close()

	// Declare the queue
	q, err := ch.QueueDeclare(
		"mongo-queue",
		true,
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		log.Fatalf("Failed to declare a queue: %v", err)
	}

	// Send a messages
	for i := 0; i < 3; i++ {
		message := messages.MongoMessage{
			ID:        primitive.NewObjectID(), // Generate a new ObjectID
			Content:   "Hello MongoDB! Message number: " + strconv.Itoa(i),
			Timestamp: time.Now(),
		}

		body, err := json.Marshal(message)
		if err != nil {
			log.Fatalf("Failed to marshal message: %v", err)
		}

		err = ch.Publish(
			"",
			q.Name,
			false,
			false,
			amqp.Publishing{
				ContentType: "application/json",
				Body:        body,
			})
		if err != nil {
			log.Fatalf("Failed to publish a message: %v", err)
		}
		log.Printf(" [x] Sent %s", body)
		time.Sleep(1 * time.Second)
	}
}
