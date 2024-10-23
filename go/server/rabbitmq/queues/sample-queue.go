package rabbitmq

import (
	"Smartess/go/server/rabbitmq"
	"log"
)

type AlertQueueHandler struct {
	queue rabbitmq.SmartessQueue
}

func (a AlertQueueHandler) Handle() error {
	log.Println("Handling alert queue:", a.queue)
	return nil
}
