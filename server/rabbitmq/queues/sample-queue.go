package rabbitmq

import (
	"log"
	"smartess/server/rabbitmq"
)

type AlertQueueHandler struct {
	queue rabbitmq.SmartessQueue
}

func (a AlertQueueHandler) Handle() error {
	log.Println("Handling alert queue:", a.queue)
	return nil
}
