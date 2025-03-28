// package handlers
//
// import (
//
//	"Smartess/go/common/logging"
//	common_rabbitmq "Smartess/go/common/rabbitmq"
//	"fmt"
//	"github.com/gorilla/websocket"
//	"log"
//	"net/http"
//
//	stream_amqp "github.com/rabbitmq/rabbitmq-stream-go-client/pkg/amqp"
//	"github.com/rabbitmq/rabbitmq-stream-go-client/pkg/stream"
//	"github.com/streadway/amqp"
//	"go.uber.org/zap"
//
// )
//
//	var upgrader = websocket.Upgrader{
//		//ReadBufferSize:  1024,
//		//WriteBufferSize: 1024,
//		CheckOrigin: func(r *http.Request) bool { return true },
//	}
//
// var clients = make(map[*websocket.Conn]bool)
//
//	func (h *ControllerHandler) handleWS(w http.ResponseWriter, r *http.Request) {
//		conn, err := upgrader.Upgrade(w, r, nil)
//		if err != nil {
//			h.videoLogger.Error(fmt.Sprintf("Failed to upgrade WebSocket: %v\n\r", err))
//			return
//		}
//		defer conn.Close()
//		clients[conn] = true
//		h.videoLogger.Info("New WebSocket connection\n\r")
//
//		// Keep connection alive
//		for {
//			if _, _, err := conn.ReadMessage(); err != nil {
//				h.videoLogger.Error(fmt.Sprintf("Websocket closed: %v\n\r", err))
//				delete(clients, conn)
//				break
//			}
//		}
//	}
//
//	type ControllerHandler struct {
//		r           *common_rabbitmq.RabbitMQInstance
//		env         *stream.Environment
//		videoLogger *zap.Logger
//	}
//
//	func NewControllerHandler(instance *common_rabbitmq.RabbitMQInstance, env *stream.Environment) *ControllerHandler {
//		zapLogger, err := logging.InitializeLogger("/app/logs/server_video.log")
//		if err != nil {
//			log.Fatalf("Failed to initialize server video zap logger: %v", err)
//		}
//		return &ControllerHandler{r: instance, env: env, videoLogger: zapLogger}
//	}
//
//	func (h *ControllerHandler) Handle(msg amqp.Delivery, logger *zap.Logger) {
//		streamName := string(msg.Body)
//		logger.Info("Received stream name", zap.String("stream_name", streamName))
//
//		err := h.env.DeclareStream(streamName, &stream.StreamOptions{
//			MaxLengthBytes:      stream.ByteCapacity{}.GB(2), // Increased buffer size
//			MaxSegmentSizeBytes: stream.ByteCapacity{}.MB(50),
//		})
//		if err != nil {
//			log.Fatalf("Failed to declare a stream: %v", err)
//		}
//		h.videoLogger.Info(fmt.Sprintf("Declared stream: %s", streamName))
//
//		// Consumer handler
//		messagesHandler := func(consumerContext stream.ConsumerContext, message *stream_amqp.Message) {
//			// TODO WEBSOCKETS + CONSUMER CLOSE (MOST LOGIC FOR IT HERE)
//			var logMessage string
//
//			if message == nil {
//				logMessage = "Message is nil"
//			} else if message.Properties == nil {
//				logMessage = fmt.Sprintf("ValuePayload:%v", message.Value)
//			} else {
//				logMessage = fmt.Sprintf("MsgID: %v, UserID: %x, To: %s, Subject: %s, ReplyTo: %s",
//					message.Properties.MessageID,
//					message.Properties.UserID,
//					message.Properties.To,
//					message.Properties.Subject,
//					message.Properties.ReplyTo)
//			}
//
//			h.videoLogger.Info(fmt.Sprintf("[TEMP CONSUME] Stream:%s|%s", streamName, logMessage))
//			//TODO: broacast_gochan based "init() go func() for for" for data := range broadcast {
//			for client := range clients {
//				// Flatten the [][]byte to a single []byte
//				var flattenedData []byte
//				for _, chunk := range message.Data {
//					flattenedData = append(flattenedData, chunk...)
//				}
//				err := client.WriteMessage(websocket.BinaryMessage, flattenedData)
//				if err != nil {
//					h.videoLogger.Error(fmt.Sprintf("Error sending data to websocket: %v", err))
//					client.Close()
//					delete(clients, client)
//				}
//			}
//		}
//		// goroutine for MQ stream consumers
//		go func() {
//			consumer, err := h.env.NewConsumer(streamName, messagesHandler,
//				stream.NewConsumerOptions().SetOffset(stream.OffsetSpecification{}.First()))
//			if err != nil {
//				logger.Fatal("Failed to create consumer", zap.Error(err))
//				return
//			}
//
//			logger.Info("Consumer started", zap.String("stream_name", streamName))
//
//			// select {} // keep goroutine alive
//
//			//TODO WEBSOCKET + CLOSE CONSUMER
//			defer consumer.Close()
//
//			// WebSocket server
//			http.HandleFunc("/ws", h.handleWS)
//			h.videoLogger.Info("WebSocket server (Video consumer) started on :8080\n\r")
//			log.Fatal(http.ListenAndServe(":8080", nil))
//		}()
//
// }
package handlers

import (
	"Smartess/go/common/logging"
	common_rabbitmq "Smartess/go/common/rabbitmq"
	"fmt"
	"github.com/gorilla/websocket"
	"net/http"

	stream_amqp "github.com/rabbitmq/rabbitmq-stream-go-client/pkg/amqp"
	"github.com/rabbitmq/rabbitmq-stream-go-client/pkg/stream"
	"github.com/streadway/amqp"
	"go.uber.org/zap"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

type ControllerHandler struct {
	r           *common_rabbitmq.RabbitMQInstance
	env         *stream.Environment
	videoLogger *zap.Logger
	broadcast   chan []byte
	clients     map[*websocket.Conn]bool
}

func NewControllerHandler(instance *common_rabbitmq.RabbitMQInstance, env *stream.Environment) *ControllerHandler {
	zapLogger, err := logging.InitializeLogger("/app/logs/server_video.log")
	if err != nil {
		panic(fmt.Sprintf("Failed to initialize video logger: %v", err))
	}
	h := &ControllerHandler{
		r:           instance,
		env:         env,
		videoLogger: zapLogger,
		broadcast:   make(chan []byte, 100), // Buffered channel
		clients:     make(map[*websocket.Conn]bool),
	}
	go h.broadcastLoop() // Start broadcasting goroutine
	return h
}

func (h *ControllerHandler) broadcastLoop() {
	for data := range h.broadcast {
		h.videoLogger.Info(fmt.Sprintf("Broadcasting %d bytes to %d clients", len(data), len(h.clients)))
		for client := range h.clients {
			if err := client.WriteMessage(websocket.BinaryMessage, data); err != nil {
				h.videoLogger.Error(fmt.Sprintf("WebSocket write error: %v", err))
				client.Close()
				delete(h.clients, client)
			}
		}
	}
}

func (h *ControllerHandler) handleWS(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		h.videoLogger.Error(fmt.Sprintf("Failed to upgrade WebSocket: %v", err))
		return
	}
	h.clients[conn] = true
	h.videoLogger.Info("New WebSocket client connected")
	defer func() {
		conn.Close()
		delete(h.clients, conn)
		h.videoLogger.Info("WebSocket client disconnected")
	}()

	for {
		if _, _, err := conn.ReadMessage(); err != nil {
			h.videoLogger.Error(fmt.Sprintf("WebSocket read error: %v", err))
			break
		}
	}
}

func (h *ControllerHandler) Handle(msg amqp.Delivery, logger *zap.Logger) {
	streamName := string(msg.Body)
	h.videoLogger.Info("Received stream name", zap.String("stream_name", streamName))

	consumer, err := h.env.NewConsumer(
		streamName,
		func(consumerContext stream.ConsumerContext, message *stream_amqp.Message) {
			if message == nil || message.Data == nil {
				h.videoLogger.Warn("Received nil message or data")
				return
			}
			var flattenedData []byte
			for _, chunk := range message.Data {
				flattenedData = append(flattenedData, chunk...)
			}
			h.videoLogger.Info(fmt.Sprintf("Consumed %d bytes from stream %s", len(flattenedData), streamName))
			h.broadcast <- flattenedData
		},
		stream.NewConsumerOptions().SetOffset(stream.OffsetSpecification{}.First()),
	)
	if err != nil {
		h.videoLogger.Fatal("Failed to create consumer", zap.Error(err))
		return
	}
	defer consumer.Close()

	//// Start WebSocket server only once
	//http.HandleFunc("/ws", h.handleWS)
	//h.videoLogger.Info("Starting WebSocket server on :8080")
	//if err := http.ListenAndServe(":8080", nil); err != nil {
	//	h.videoLogger.Fatal("WebSocket server failed", zap.Error(err))
	//}
}

//	func (h *ControllerHandler) StartWebSocketServer() {
//		http.HandleFunc("/ws", h.handleWS)
//
//		fs := http.FileServer(http.Dir("/app/static"))
//		http.Handle("/", fs)
//
//		h.videoLogger.Info("Starting WebSocket server on :8080")
//		if err := http.ListenAndServe(":8080", nil); err != nil {
//			h.videoLogger.Fatal("WebSocket server failed", zap.Error(err))
//		}
//	}
func (h *ControllerHandler) StartWebSocketServer() {
	http.HandleFunc("/ws", h.handleWS)

	// Serve HLS files
	http.Handle("/hls/", http.StripPrefix("/hls/", http.FileServer(http.Dir("/tmp/data"))))

	fs := http.FileServer(http.Dir("/app/static"))
	http.Handle("/", fs)

	h.videoLogger.Info("Starting WebSocket and HLS server on :8080")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		h.videoLogger.Fatal("WebSocket server failed", zap.Error(err))
	}
}
