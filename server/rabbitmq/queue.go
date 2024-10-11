package rabbitmq

import "github.com/streadway/amqp"

type SmartessQueue struct {
	rabbitmqQueue  amqp.Queue
	messageHandler MessageHandler
}
type QueueConfig struct {
	Queue      string
	Passive    bool
	Durable    bool
	AutoDelete bool
	Exclusive  bool
	NoWait     bool
	Arguments  amqp.Table
}

func Declare(ch *amqp.Channel, config QueueConfig) (SmartessQueue, error) {
	q, err := ch.QueueDeclare(
		config.Queue,      // queue name
		config.Durable,    // durable
		config.AutoDelete, // auto-delete
		config.Exclusive,  // exclusive
		config.NoWait,     // no-wait
		config.Arguments,  // arguments
	)
	if err != nil {
		return SmartessQueue{}, err
	}
	return SmartessQueue{rabbitmqQueue: q}, nil
}
