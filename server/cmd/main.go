package main

import (
	rabbitmq "Smartess/server/rabbit-mq"
	"log"
	"sync"
)

func main() {
	var wg sync.WaitGroup
	wg.Add(2)

	log.Println("Starting producer...")
	go rabbitmq.StartProducer(&wg)

	log.Println("Starting consumer...")
	go rabbitmq.StartConsumer(&wg)

	wg.Wait()
}
