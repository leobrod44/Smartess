package main

import (
	"Smartess/server/rabbitmq"
	"log"
	"time"

	"rabbitmq/rabbitmq"
)

func main() {

	// Initialize Zap logger
	logger, err := rabbitmq.Init()
	if err != nil {
		panic("Failed to initialize logger: " + err.Error())
	}
	defer logger.Sync() // Flush logger buffer before exiting

	logger.Info("Logger initialized and started")

	for {
		time.Sleep(10 * time.Second) // Sleep for 1 second
		log.Println("Server still running...")
	}
}
