package rabbitmq

import (
	"fmt"
	"io/ioutil"
	"os"

	"github.com/streadway/amqp"
	"gopkg.in/yaml.v3"
)

type RabbitMQInstance struct {
	Conn    *amqp.Connection
	Channel *amqp.Channel
	Config  RabbitMQConfig
}

type QueueConfig struct {
	Queue         string                 `yaml:"name"`
	Type          string                 `yaml:"type"`
	MaxSize       int                    `yaml:"max_size"`
	Passive       bool                   `yaml:"passive"`
	Durable       bool                   `yaml:"durable"`
	AutoDelete    bool                   `yaml:"auto_delete"`
	Exclusive     bool                   `yaml:"exclusive"`
	NoWait        bool                   `yaml:"no_wait"`
	Arguments     map[string]interface{} `yaml:"arguments"`
	MessageFormat MessageFormat          `yaml:"message_format"`
}

type MessageFormat struct {
	Type   string                 `yaml:"type"`
	Schema map[string]interface{} `yaml:"schema"`
}

type RabbitMQConfig struct {
	Queues []QueueConfig `yaml:"queues"`
}

func UnmarshalConfig(path string) (RabbitMQConfig, error) {
	var config RabbitMQConfig

	data, err := ioutil.ReadFile(path)
	if err != nil {
		return RabbitMQConfig{}, fmt.Errorf("failed to read file: %v", err)
	}
	err = yaml.Unmarshal(data, &config)
	if err != nil {
		return RabbitMQConfig{}, fmt.Errorf("failed to unmarshal yaml: %v", err)
	}

	return config, nil
}

func Init(queuesPath string) (*RabbitMQInstance, error) {
	uri := os.Getenv("RABBITMQ_URI")
	if uri == "" {
		return nil, fmt.Errorf("RabbitMQ URI not provided in environment variables")
	}

	conn, err := amqp.Dial(uri)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to RabbitMQ: %v", err)
	}

	ch, err := conn.Channel()
	if err != nil {
		conn.Close() // Ensure the connection is closed if the channel cannot be opened
		return nil, fmt.Errorf("failed to open a channel: %v", err)
	}

	rabbitConfig, err := UnmarshalConfig(queuesPath)
	if err != nil {
		ch.Close()
		conn.Close()
		return nil, fmt.Errorf("failed to load RabbitMQ configuration: %v", err)
	}

	return &RabbitMQInstance{
		Conn:    conn,
		Channel: ch,
		Config:  rabbitConfig,
	}, nil
}
