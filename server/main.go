package main

import (
	rabbitmq "Smartess/server/rabbit-mq"
	"log"
	"os"
	"sync"
	"time"
)

func main() {
	// Open log file
	f, err := os.OpenFile("/app/logs/server.log", os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		log.Fatal(err)
	}
	defer f.Close()
	log.SetOutput(f)

	// Logging message
	log.Println("This is a log message!")

	var wg sync.WaitGroup
	rabbitmq.StartConsumer(&wg)
	// Run indefinitely with a sleep
	for {
		time.Sleep(10 * time.Second) // Sleep for 1 second
		log.Println("Still running...")
	}
}
