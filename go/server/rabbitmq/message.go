package rabbitmq

import amqp "github.com/rabbitmq/amqp091-go"

type Message interface {
	Parse(string) error
}

type MessageHandler interface {
	Handle(amqp.Delivery) error
}
