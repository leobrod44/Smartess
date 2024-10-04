package rabbitmq

import (
	"fmt"
	"log"
	"sync"
	"time"

	"github.com/streadway/amqp"
)

func StartProducer(wg *sync.WaitGroup) {
	defer wg.Done()

	conn, ch := ConnectToRabbitMQ("amqp://guest:guest@localhost:5672/")
	defer ch.Close()
	defer conn.Close()

	q, err := ch.QueueDeclare(
		"test_queue",
		true,
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		log.Fatalf("Failed to declare a queue: %v", err)
	}

	for {
		body := fmt.Sprintf("Current time: %s", time.Now().Format(time.RFC3339))
		err = ch.Publish(
			"",
			q.Name,
			false,
			false,
			amqp.Publishing{
				ContentType: "text/plain",
				Body:        []byte(body),
			})
		if err != nil {
			log.Fatalf("Failed to publish a message: %v", err)
		}
		logToLoki(fmt.Sprintf("[x] Sent %s", body)) // Log to Loki
		time.Sleep(1 * time.Second)
	}
}

func StartConsumer(wg *sync.WaitGroup) {
	defer wg.Done()

	conn, ch := ConnectToRabbitMQ("amqp://guest:guest@localhost:5672/")
	defer ch.Close()
	defer conn.Close()

	q, err := ch.QueueDeclare(
		"test_queue",
		false,
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		log.Fatalf("Failed to declare a queue: %v", err)
	}

	msgs, err := ch.Consume(
		q.Name,
		"",
		true,
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		log.Fatalf("Failed to register a consumer: %v", err)
	}

	forever := make(chan bool)

	go func() {
		for d := range msgs {
			message := fmt.Sprintf("Received a message: %s", d.Body)
			logToLoki(message) // Log to Loki
			log.Printf(message)
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

	ch, err := conn.Channel()
	if err != nil {
		log.Fatalf("Failed to open a channel: %v", err)
	}

	return conn, ch
}
