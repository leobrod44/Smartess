package handlers

import (
	"Smartess/go/common/logging"
	common_rabbitmq "Smartess/go/common/rabbitmq"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"sync"

	"github.com/gorilla/websocket"
	stream_amqp "github.com/rabbitmq/rabbitmq-stream-go-client/pkg/amqp"
	"github.com/rabbitmq/rabbitmq-stream-go-client/pkg/stream"
	"github.com/streadway/amqp"
	"go.uber.org/zap"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

// Client represents a connected WebSocket client
type Client struct {
	conn      *websocket.Conn
	stream    string // Which stream the client is subscribed to
	writeMu   sync.Mutex
	isClosing bool
}

// VideoStreamData holds information about active video streams
type VideoStreamData struct {
	streamName    string
	consumer      *stream.Consumer
	activeClients map[*Client]bool
	dataChan      chan []byte
}

type ControllerHandler struct {
	r            *common_rabbitmq.RabbitMQInstance
	env          *stream.Environment
	videoLogger  *zap.Logger
	streams      map[string]*VideoStreamData
	streamsMutex sync.RWMutex
	clientsMutex sync.RWMutex
	allClients   map[*Client]bool
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
		streams:     make(map[string]*VideoStreamData),
		allClients:  make(map[*Client]bool),
	}
	return h
}

func (h *ControllerHandler) writeDebugToFile(data []byte, prefix string) {
	// Create debug directory if it doesn't exist
	debugDir := "/tmp/data/debug"
	if err := os.MkdirAll(debugDir, 0755); err != nil {
		h.videoLogger.Error(fmt.Sprintf("Failed to create debug directory: %v", err))
		return
	}

	// Save the binary data for debugging
	filename := fmt.Sprintf("%s/%s_segment_%d.mp4", debugDir, prefix, len(data))
	if err := os.WriteFile(filename, data, 0644); err != nil {
		h.videoLogger.Error(fmt.Sprintf("Failed to write debug file: %v", err))
	} else {
		h.videoLogger.Info(fmt.Sprintf("Wrote debug file: %s (%d bytes)", filename, len(data)))
	}
}

func (h *ControllerHandler) handleWS(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		h.videoLogger.Error(fmt.Sprintf("Failed to upgrade WebSocket: %v", err))
		return
	}

	// Parse which stream to subscribe to from query parameter
	streamName := r.URL.Query().Get("stream")
	if streamName == "" {
		// If no stream specified, use "default" to match directory structure
		streamName = "default"
	}

	client := &Client{
		conn:      conn,
		stream:    streamName,
		isClosing: false,
	}

	// Add to global client list
	h.clientsMutex.Lock()
	h.allClients[client] = true
	h.clientsMutex.Unlock()

	// Subscribe client to specified stream
	h.streamsMutex.RLock()
	stream, exists := h.streams[streamName]
	h.streamsMutex.RUnlock()

	if exists {
		h.videoLogger.Info(fmt.Sprintf("Client subscribed to existing stream: %s", streamName))
		stream.activeClients[client] = true
	} else {
		h.videoLogger.Info(fmt.Sprintf("Client requested non-active stream: %s, will serve from HLS", streamName))
	}

	h.videoLogger.Info(fmt.Sprintf("New WebSocket client connected, subscribed to stream: %s", streamName))

	// Handle client disconnection
	defer func() {
		client.isClosing = true
		conn.Close()

		h.clientsMutex.Lock()
		delete(h.allClients, client)
		h.clientsMutex.Unlock()

		h.streamsMutex.RLock()
		if stream, exists := h.streams[streamName]; exists {
			delete(stream.activeClients, client)
		}
		h.streamsMutex.RUnlock()

		h.videoLogger.Info("WebSocket client disconnected")
	}()

	// Keep connection alive, handle incoming messages if needed
	for {
		if _, _, err := conn.ReadMessage(); err != nil {
			if !websocket.IsCloseError(err, websocket.CloseGoingAway, websocket.CloseNormalClosure) {
				h.videoLogger.Error(fmt.Sprintf("WebSocket read error: %v", err))
			}
			break
		}
	}
}

func (h *ControllerHandler) Handle(msg amqp.Delivery, logger *zap.Logger) {
	streamName := string(msg.Body)
	h.videoLogger.Info("Received stream name", zap.String("stream_name", streamName))

	// Check if we're already consuming this stream
	h.streamsMutex.RLock()
	_, exists := h.streams[streamName]
	h.streamsMutex.RUnlock()

	if exists {
		h.videoLogger.Info(fmt.Sprintf("Already consuming stream: %s", streamName))
		return
	}

	// Create new video stream data structure
	streamData := &VideoStreamData{
		streamName:    streamName,
		activeClients: make(map[*Client]bool),
		dataChan:      make(chan []byte, 100),
	}

	// Store in streams map
	h.streamsMutex.Lock()
	h.streams[streamName] = streamData
	h.streamsMutex.Unlock()

	// Also create a short name for the stream (without the hub_id prefix)
	// This is to match the camera name for HLS access
	shortName := streamName
	const prefix = "video_stream.hub_id."
	if len(streamName) > len(prefix) && streamName[:len(prefix)] == prefix {
		parts := streamName[len(prefix):]
		// Find the last dot and extract the camera name
		for i := len(parts) - 1; i >= 0; i-- {
			if parts[i] == '.' {
				shortName = parts[i+1:]
				break
			}
		}
	}

	// Create a directory for HLS segments of this stream
	hlsDir := filepath.Join("/tmp/data", shortName)
	if err := os.MkdirAll(hlsDir, 0755); err != nil {
		h.videoLogger.Error(fmt.Sprintf("Failed to create HLS directory: %v", err))
	}

	// Start a goroutine to broadcast data to clients subscribed to this stream
	go func(streamData *VideoStreamData) {
		for data := range streamData.dataChan {
			// Sample debugging: occasionally save a segment to disk
			if len(data) > 1000 { // Only debug substantial data
				h.writeDebugToFile(data, shortName)
			}

			// Broadcast to all clients subscribed to this stream
			h.streamsMutex.RLock()
			clients := make([]*Client, 0, len(streamData.activeClients))
			for client := range streamData.activeClients {
				clients = append(clients, client)
			}
			h.streamsMutex.RUnlock()

			h.videoLogger.Debug(fmt.Sprintf("Broadcasting %d bytes to %d clients for stream %s",
				len(data), len(clients), streamData.streamName))

			for _, client := range clients {
				if client.isClosing {
					continue
				}
				client.writeMu.Lock()
				err := client.conn.WriteMessage(websocket.BinaryMessage, data)
				client.writeMu.Unlock()

				if err != nil {
					h.videoLogger.Error(fmt.Sprintf("Error sending to client: %v", err))

					h.clientsMutex.Lock()
					delete(h.allClients, client)
					h.clientsMutex.Unlock()

					h.streamsMutex.Lock()
					delete(streamData.activeClients, client)
					h.streamsMutex.Unlock()

					client.conn.Close()
				}
			}
		}
	}(streamData)

	// Set up the consumer handler function
	consumerHandler := func(consumerContext stream.ConsumerContext, message *stream_amqp.Message) {
		if message == nil || message.Data == nil {
			h.videoLogger.Warn("Received nil message or data")
			return
		}

		// Create a combined slice from message data chunks
		var flattenedData []byte
		for _, chunk := range message.Data {
			flattenedData = append(flattenedData, chunk...)
		}

		h.videoLogger.Debug(fmt.Sprintf("Consumed %d bytes from stream %s",
			len(flattenedData), streamName))

		// Send to the data channel for broadcasting
		streamData.dataChan <- flattenedData
	}

	// Create the RabbitMQ stream consumer
	consumer, err := h.env.NewConsumer(
		streamName,
		consumerHandler,
		stream.NewConsumerOptions().SetOffset(stream.OffsetSpecification{}.First()),
	)

	if err != nil {
		h.videoLogger.Error("Failed to create consumer", zap.Error(err))

		h.streamsMutex.Lock()
		delete(h.streams, streamName)
		h.streamsMutex.Unlock()

		close(streamData.dataChan)
		return
	}

	// Store consumer in streamData for later cleanup
	streamData.consumer = consumer

	h.videoLogger.Info(fmt.Sprintf("Successfully started consumer for stream: %s", streamName))
}

func (h *ControllerHandler) StartWebSocketServer() {
	// Create debug routes
	http.HandleFunc("/debug", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/html")
		fmt.Fprintf(w, "<h1>Debug Info</h1>")

		h.streamsMutex.RLock()
		streamCount := len(h.streams)
		var streamNames []string
		for name := range h.streams {
			streamNames = append(streamNames, name)
		}
		h.streamsMutex.RUnlock()

		h.clientsMutex.RLock()
		clientCount := len(h.allClients)
		h.clientsMutex.RUnlock()

		fmt.Fprintf(w, "<p>Active streams: %d</p>", streamCount)
		fmt.Fprintf(w, "<p>Connected clients: %d</p>", clientCount)

		fmt.Fprintf(w, "<h2>Stream Names</h2><ul>")
		for _, name := range streamNames {
			fmt.Fprintf(w, "<li>%s</li>", name)
		}
		fmt.Fprintf(w, "</ul>")

		fmt.Fprintf(w, "<h2>Debug Files</h2>")
		debugDir := "/tmp/data/debug"
		files, err := os.ReadDir(debugDir)
		if err != nil {
			fmt.Fprintf(w, "<p>Error reading debug directory: %v</p>", err)
		} else {
			fmt.Fprintf(w, "<ul>")
			for _, file := range files {
				fmt.Fprintf(w, "<li><a href='/debug/%s' target='_blank'>%s</a></li>",
					file.Name(), file.Name())
			}
			fmt.Fprintf(w, "</ul>")
		}
	})

	// Serve debug files
	http.Handle("/debug/", http.StripPrefix("/debug/", http.FileServer(http.Dir("/tmp/data/debug"))))

	// WebSocket endpoint
	http.HandleFunc("/ws", h.handleWS)

	// Serve HLS files
	http.Handle("/hls/", http.StripPrefix("/hls/", http.FileServer(http.Dir("/tmp/data"))))

	// TODO OPTIONAL: Add low-latency optimized headers
	//http.HandleFunc("/hls/", func(w http.ResponseWriter, r *http.Request) {
	//	if strings.HasSuffix(r.URL.Path, ".m3u8") {
	//		w.Header().Set("Cache-Control", "no-cache, no-store, must-revalidate")
	//		w.Header().Set("Pragma", "no-cache")
	//		w.Header().Set("Expires", "0")
	//		w.Header().Set("Access-Control-Allow-Origin", "*")
	//		w.Header().Set("X-Accel-Buffering", "no") // Disable proxy buffering
	//	} else if strings.HasSuffix(r.URL.Path, ".ts") {
	//		w.Header().Set("Cache-Control", "max-age=600") // Cache segments for 10 minutes
	//	}
	//
	//	// Serve the file
	//	//http.FileServer(http.Dir("/tmp/data")).ServeHTTP(w, r)
	//	http.StripPrefix("/hls/", http.FileServer(http.Dir("/tmp/data"))).ServeHTTP(w, r)
	//})

	// Serve static files (inc. index.html)
	fs := http.FileServer(http.Dir("/app/static"))
	http.Handle("/", fs)

	// Download endpoint to get the raw video segments
	http.HandleFunc("/download/", func(w http.ResponseWriter, r *http.Request) {
		filePath := r.URL.Path[len("/download/"):]
		fullPath := filepath.Join("/tmp/data", filePath)

		// Set headers for download
		w.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=%s",
			filepath.Base(fullPath)))
		w.Header().Set("Content-Type", "application/octet-stream")

		// Open and serve the file
		file, err := os.Open(fullPath)
		if err != nil {
			http.Error(w, fmt.Sprintf("Failed to open file: %v", err), http.StatusNotFound)
			return
		}
		defer file.Close()

		_, err = io.Copy(w, file)
		if err != nil {
			h.videoLogger.Error(fmt.Sprintf("Failed to send file: %v", err))
		}
	})

	h.videoLogger.Info("Starting WebSocket, HLS, and debug server on :8080")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		h.videoLogger.Fatal("Web server failed", zap.Error(err))
	}
}
