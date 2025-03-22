package handlers

import (
	"Smartess/go/common/logging"
	common_rabbitmq "Smartess/go/common/rabbitmq"
	"fmt"
	"github.com/gorilla/websocket"
	"log"
	"net/http"

	stream_amqp "github.com/rabbitmq/rabbitmq-stream-go-client/pkg/amqp"
	"github.com/rabbitmq/rabbitmq-stream-go-client/pkg/stream"
	"github.com/streadway/amqp"
	"go.uber.org/zap"
)

var upgrader = websocket.Upgrader{
	//ReadBufferSize:  1024,
	//WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool { return true },
}

var clients = make(map[*websocket.Conn]bool)

// var broadcast = make(chan []byte)
//
// // Broadcast MP4 segments to all connected WebSocket clients
//
//	func broadcastSegment(data []byte) {
//		broadcast <- data
//	}
//
//	func handleWS(w http.ResponseWriter, r *http.Request) {
//		conn, err := upgrader.Upgrade(w, r, nil)
//		if err != nil {
//			log.Println("Failed to upgrade WebSocket:", err)
//			return
//		}
//		defer conn.Close()
//		clients[conn] = true
//		log.Println("New WebSocket connection")
//
//		// Keep connection alive
//		for {
//			if _, _, err := conn.ReadMessage(); err != nil {
//				log.Println("WebSocket closed:", err)
//				delete(clients, conn)
//				break
//			}
//		}
//	}
func (h *ControllerHandler) handleWS(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		h.videoLogger.Error(fmt.Sprintf("Failed to upgrade WebSocket: %v\n\r", err))
		return
	}
	defer conn.Close()
	clients[conn] = true
	h.videoLogger.Info("New WebSocket connection\n\r")

	// Keep connection alive
	for {
		if _, _, err := conn.ReadMessage(); err != nil {
			h.videoLogger.Error(fmt.Sprintf("Websocket closed: %v\n\r", err))
			delete(clients, conn)
			break
		}
	}
}

type ControllerHandler struct {
	r           *common_rabbitmq.RabbitMQInstance
	env         *stream.Environment
	videoLogger *zap.Logger
}

func NewControllerHandler(instance *common_rabbitmq.RabbitMQInstance, env *stream.Environment) *ControllerHandler {
	zapLogger, err := logging.InitializeLogger("/app/logs/server_video.log")
	if err != nil {
		log.Fatalf("Failed to initialize server video zap logger: %v", err)
	}
	return &ControllerHandler{r: instance, env: env, videoLogger: zapLogger}
}

func (h *ControllerHandler) Handle(msg amqp.Delivery, logger *zap.Logger) {
	streamName := string(msg.Body)
	logger.Info("Received stream name", zap.String("stream_name", streamName))

	err := h.env.DeclareStream(streamName, &stream.StreamOptions{
		MaxLengthBytes:      stream.ByteCapacity{}.GB(2), // Increased buffer size
		MaxSegmentSizeBytes: stream.ByteCapacity{}.MB(50),
	})
	if err != nil {
		log.Fatalf("Failed to declare a stream: %v", err)
	}
	h.videoLogger.Info(fmt.Sprintf("Declared stream: %s", streamName))

	// Consumer handler
	messagesHandler := func(consumerContext stream.ConsumerContext, message *stream_amqp.Message) {
		// TODO WEBSOCKETS + CONSUMER CLOSE (MOST LOGIC FOR IT HERE)
		var logMessage string

		if message == nil {
			logMessage = "Message is nil"
		} else if message.Properties == nil {
			logMessage = fmt.Sprintf("ValuePayload:%v", message.Value)
		} else {
			logMessage = fmt.Sprintf("MsgID: %v, UserID: %x, To: %s, Subject: %s, ReplyTo: %s",
				message.Properties.MessageID,
				message.Properties.UserID,
				message.Properties.To,
				message.Properties.Subject,
				message.Properties.ReplyTo)
		}

		h.videoLogger.Info(fmt.Sprintf("[TEMP CONSUME] Stream:%s|%s", streamName, logMessage))
		//TODO: broacast_gochan based "init() go func() for for" for data := range broadcast {
		for client := range clients {
			// Flatten the [][]byte to a single []byte
			var flattenedData []byte
			for _, chunk := range message.Data {
				flattenedData = append(flattenedData, chunk...)
			}
			err := client.WriteMessage(websocket.BinaryMessage, flattenedData)
			if err != nil {
				h.videoLogger.Error(fmt.Sprintf("Error sending data to websocket: %v", err))
				client.Close()
				delete(clients, client)
			}
		}
	}
	// goroutine for MQ stream consumers
	go func() {
		consumer, err := h.env.NewConsumer(streamName, messagesHandler,
			stream.NewConsumerOptions().SetOffset(stream.OffsetSpecification{}.First()))
		if err != nil {
			logger.Fatal("Failed to create consumer", zap.Error(err))
			return
		}

		logger.Info("Consumer started", zap.String("stream_name", streamName))

		// select {} // keep goroutine alive

		//TODO WEBSOCKET + CLOSE CONSUMER
		defer consumer.Close()

		// WebSocket server
		http.HandleFunc("/ws", h.handleWS)
		h.videoLogger.Info("WebSocket server (Video consumer) started on :8080\n\r")
		log.Fatal(http.ListenAndServe(":8080", nil))
	}()

}
