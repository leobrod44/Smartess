package rabbitmq

import (
	"os"

	"github.com/streadway/amqp"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

type RabbitMQServer struct {
	queues     []amqp.Queue
	logger     *zap.Logger
	channel    *amqp.Channel
	connection *amqp.Connection
}

func Init() RabbitMQServer {
	logger, err := InitializeLogger()
	if err != nil {
		panic("Failed to initialize logger: " + err.Error())
	}
	uri := os.Getenv("RABBITMQ_URI")

	conn, err := amqp.Dial(uri)
	if err != nil {
		logger.Fatal("ERROR: Failed to connect to RabbitMQ", zap.Error(err))
	}

	ch, err := conn.Channel()
	if err != nil {
		logger.Fatal("ERROR: Failed to open a channel", zap.Error(err))
	}
	sampleQueue, err := ch.QueueDeclare(
		"test-queue", // Queue name
		true,         // Durable
		false,        // Auto-delete
		false,        // Exclusive
		false,        // No-wait
		nil,          // Arguments
	)
	if err != nil {
		logger.Fatal("ERROR: Failed to declare queue", zap.Error(err))
	}
	srv := RabbitMQServer{
		queues:     []amqp.Queue{sampleQueue},
		logger:     logger,
		channel:    ch,
		connection: conn,
	}
	return srv
}

func (r *RabbitMQServer) Start() {

	defer r.connection.Close()
	defer r.channel.Close()

	for _, queue := range r.queues {
		r.logger.Info("Declared queue", zap.String("queueName", queue.Name))

	}

	// Consume messages from each queue
	for queueName, queueType := range r.queues {
		go r.consume(ch, queueName, queueType)
	}

	// Wait indefinitely
	r.logger.Println("INFO: RabbitMQ server started. Waiting for messages...")
	select {}
}

// consumeMessages processes messages from the specified queue
func (r *RabbitMQServer) consume(queue) {
	msgs, err := r.channel.Consume(
		queue.Name, // Queue name
		"",         // Consumer
		true,       // Auto-acknowledge
		false,      // Exclusive
		false,      // No-local
		false,      // No-wait
		nil,        // Arguments
	)
	if err != nil {
		r.logger.Fatal("ERROR: Failed to consume messages from %s queue: %v", queueType, err)
	}

	// Process each message
	for msg := range msgs {
		queue.Handle(msg)
	}
}

var logger *zap.Logger

func InitializeLogger() (*zap.Logger, error) {

	logFile, err := os.OpenFile("/app/logs/server.log", os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		return nil, err
	}

	fileEncoder := zapcore.NewJSONEncoder(zap.NewProductionEncoderConfig())
	consoleEncoder := zapcore.NewConsoleEncoder(zap.NewDevelopmentEncoderConfig())

	atom := zap.NewAtomicLevelAt(zap.InfoLevel)

	core := zapcore.NewTee(
		zapcore.NewCore(fileEncoder, logFile, atom),
		zapcore.NewCore(consoleEncoder, zapcore.Lock(os.Stdout), atom),
	)

	logger := zap.New(core, zap.AddCaller(), zap.AddStacktrace(zapcore.ErrorLevel))
	return logger, nil
}
