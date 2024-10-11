package main

import (
	"log"
	"smartess/server/rabbitmq"
	"time"
)

func main() {

	srv, err := rabbitmq.Init()

	if err != nil {
		panic("Failed to initialize logger: " + err.Error())
	}
	defer srv.Logger.Sync() // Flushes logger before exit to not have any logs lost kinda cool

	srv.Logger.Info("Logger initialized and started")

	for {
		go srv.Start()               // Start the RabbitMQ server on a separate goroutine
		time.Sleep(10 * time.Second) // Sleep for activity monitoring, not this dosen't mean the server stops since we used a goroutine!
		//TODO print still running for starting purposes, but removing this useless clutter down the line
		log.Println("Server still running...")
	}
}
