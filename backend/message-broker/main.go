package main

import (
	"fmt"
	"log"
	"sync"
	"time"

	"github.com/streadway/amqp"
)

func main() {

	var wg sync.WaitGroup

	wg.Add(2)

	log.Println("Starting producer...")
	go func() {
		defer wg.Done()
		StartProducer()
	}()

	log.Println("Starting consumer...")
	go func() {
		defer wg.Done()
		StartConsumer()
	}()

	wg.Wait()
}

func StartProducer() {

	// Connect to RabbitMQ
	conn, ch := ConnectToRabbitMQ("amqp://guest:guest@localhost:5672/")
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
		err = ch.Publish(
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

func StartConsumer() {
	conn, ch := ConnectToRabbitMQ("amqp://guest:guest@localhost:5672/")
	defer ch.Close()
	defer conn.Close()

	// Declare a queue to consume from
	q, err := ch.QueueDeclare(
		"test_queue", // name
		false,        // durable
		false,        // delete when unused
		false,        // exclusive
		false,        // no-wait
		nil,          // arguments
	)
	if err != nil {
		log.Fatalf("Failed to declare a queue: %v", err)
	}

	// Start receiving messages
	msgs, err := ch.Consume(
		q.Name, // queue
		"",     // consumer
		true,   // auto-ack
		false,  // exclusive
		false,  // no-local
		false,  // no-wait
		nil,    // args
	)
	if err != nil {
		log.Fatalf("Failed to register a consumer: %v", err)
	}

	forever := make(chan bool)

	// Listen for messages and print them
	go func() {
		for d := range msgs {
			log.Printf("Received a message: %s", d.Body)
		}
	}()

	log.Printf(" [*] Waiting for messages. To exit press CTRL+C")
	<-forever
}

func ConnectToRabbitMQ(uri string) (*amqp.Connection, *amqp.Channel) {
	conn, err := amqp.Dial(uri)

	if err != nil {
		log.Fatalf("Failed to connect to RabbitMQ: %v", err)
	}

	defer conn.Close()

	ch, err := conn.Channel()
	if err != nil {
		log.Fatalf("Failed to open a channel: %v", err)
	}
	return conn, ch
}
