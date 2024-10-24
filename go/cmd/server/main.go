package main

import (
	"Smartess/go/server/rabbitmq"
)

func main() {
	rabbitmqServer, err := rabbitmq.Init()
	if err != nil {
		panic(err)
	}
	rabbitmqServer.Start()
	defer rabbitmqServer.Close()
}

// func StartProducer() {
// 	// Connect to RabbitMQ
// 	conn, ch := ConnectToRabbitMQ(os.Getenv("RABBITMQ_URI")) //"amqp://guest:guest@localhost:5672/")
// 	defer ch.Close()
// 	defer conn.Close()
// 	q, err := ch.QueueDeclare(
// 		"test-queue", // name
// 		true,         // durable (will persist through restarts)
// 		false,        // delete when unused
// 		false,        // exclusive
// 		false,        // no-wait
// 		nil,          // arguments
// 	)
// 	if err != nil {
// 		log.Fatalf("Failed to declare a queue: %v", err)
// 	}
// 	// Send a message every second
// 	for {
// 		body := fmt.Sprintf("Current time: %s", time.Now().Format(time.RFC3339))
// 		err = ch.Publish( //NB: For work queues, the routing key is queue name and exchange is empty and usually PublishContext is used
// 			"",     // exchange
// 			q.Name, // routing key
// 			false,  // mandatory
// 			false,  // immediate
// 			amqp.Publishing{
// 				ContentType: "text/plain",
// 				Body:        []byte(body),
// 			})
// 		if err != nil {
// 			log.Fatalf("Failed to publish a message: %v", err)
// 		}
// 		log.Printf(" [x] Sent %s", body)
// 		time.Sleep(1 * time.Second)
// 	}
// }
