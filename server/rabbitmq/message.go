package rabbitmq

import "github.com/streadway/amqp"

type Message interface {
	Parse(string) error
}

type MessageHandler interface {
	Handle(amqp.Delivery) error
}
