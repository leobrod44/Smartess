package logs

import (
	"Smartess/go/common/logging"
	"Smartess/go/common/structures"
	"encoding/json"
	"fmt"
	"os"
	"time"

	"github.com/streadway/amqp"
	"go.uber.org/zap"
)

//TODO batch info logs, send errors directly

type Logger struct {
	connection     *amqp.Connection
	channel        *amqp.Channel
	infoQueue      amqp.Queue
	warnQueue      amqp.Queue
	errorQueue     amqp.Queue
	InternalLogger *zap.Logger
}

func NewRabbitMQLogger() (*Logger, error) {

	zap, err := logging.InitializeLogger("/app/logs/server.log")
	if err != nil {
		return nil, err
	}

	url := os.Getenv("RABBITMQ_URI")

	conn, err := amqp.Dial(url)
	if err != nil {
		return nil, err
	}

	ch, err := conn.Channel()
	if err != nil {
		conn.Close()
		return nil, err
	}

	infoQueue, err := declareQueue(ch, "hub-info-logs")
	if err != nil {
		ch.Close()
		return nil, err
	}

	warnQueue, err := declareQueue(ch, "hub-warn-logs")
	if err != nil {
		ch.Close()
		return nil, err
	}

	errorQueue, err := declareQueue(ch, "hub-error-logs")
	if err != nil {
		ch.Close()
		return nil, err
	}

	return &Logger{
		connection:     conn,
		channel:        ch,
		infoQueue:      infoQueue,
		warnQueue:      warnQueue,
		errorQueue:     errorQueue,
		InternalLogger: zap,
	}, nil
}

func declareQueue(ch *amqp.Channel, name string) (amqp.Queue, error) {
	return ch.QueueDeclare(
		name,
		true,  // Durable
		false, // Auto-delete
		false, // Exclusive
		false, // No-wait
		nil,   // Arguments
	)
}

func (r *Logger) logToRabbitMQ(queueName string, message string) error {

	hubIP := os.Getenv("HUB_IP")

	hubLog := structures.HubLog{
		HubID:     hubIP,
		Message:   message,
		TimeStamp: time.Now(),
	}
	hubLogJSON, err := json.Marshal(hubLog)
	if err != nil {
		return fmt.Errorf("failed to marshal hubLog to JSON: %v", err)
	}
	logMessage := amqp.Publishing{
		ContentType: "application/json",
		Body:        hubLogJSON,
		Timestamp:   time.Now(),
	}
	return r.channel.Publish(
		"",        // Exchange
		queueName, // Routing key
		false,     // Mandatory
		false,     // Immediate
		logMessage,
	)
}

func (r *Logger) Info(message string) error {
	r.InternalLogger.Info(message)
	return r.logToRabbitMQ(r.infoQueue.Name, message)
}

func (r *Logger) Warn(message string) error {
	r.InternalLogger.Warn(message)
	return r.logToRabbitMQ(r.warnQueue.Name, message)
}

func (r *Logger) Error(message string) error {
	r.InternalLogger.Error(message)
	return r.logToRabbitMQ(r.errorQueue.Name, message)
}

func (r *Logger) Close() {
	r.channel.Close()
	r.connection.Close()
}
