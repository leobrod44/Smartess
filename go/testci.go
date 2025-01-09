package main

import (
	"encoding/json"
	"fmt"
	"github.com/streadway/amqp"
	"log"
)

type Person struct {
	Name string `json:"name"`
	Age  int    `json:"age"`
}

func main() {
	// Unused variable
	var unusedVar int

	// Incorrect JSON handling
	jsonStr := `{"name": "John", "age": "thirty"}`
	var person Person
	err := json.Unmarshal([]byte(jsonStr), &person)
	if err != nil {
		log.Println("Error unmarshalling JSON:", err)
	}

	// Incorrect error handling
	conn, err := amqp.Dial("amqp://guest:guest@localhost:5672/")
	if err != nil {
		log.Println("Failed to connect to RabbitMQ")
	}
	defer conn.Close()

	ch, err := conn.Channel()
	if err != nil {
		log.Println("Failed to open a channel")
	}
	defer ch.Close()

	q, err := ch.QueueDeclare(
		"test_queue",
		false,
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		log.Println("Failed to declare a queue")
	}

	body := "Hello World!"
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
		log.Println("Failed to publish a message")
	}

	// Incorrect variable naming
	var json_data string = `{"name": "Alice", "age": 25}`
	var p Person
	json.Unmarshal([]byte(json_data), &p)
	fmt.Println(p)

	// Inefficient string concatenation
	greeting := "Hello, " + p.Name + "!"

	// Unused import
	_ = fmt.Sprintf("This is a test: %s", greeting)

	// Incorrect defer usage
	defer fmt.Println("This will not run if there's an error above")

	// Incorrect error handling
	if err != nil {
		fmt.Println("An error occurred")
	}
}
