package main

import (
	"log"
	"os"
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

	for {
		time.Sleep(10 * time.Second) // Sleep for 1 second
		log.Println("Server still running...")
	}
}
