package handlers

import (
	"fmt"
	"os"

	"github.com/streadway/amqp"
	"go.uber.org/zap"
)

type VideoHandler struct {
}

func NewVideoHandler() *VideoHandler {
	return &VideoHandler{}
}

func (h *VideoHandler) Handle(msg amqp.Delivery, logger *zap.Logger) {
	logger.Info("Processing video segment",
		zap.String("routing_key", msg.RoutingKey),
		zap.Int("body_size", len(msg.Body)))

	if len(msg.Body) == 0 {
		logger.Warn("Received empty message body")
		return
	}

	segmentFile := "video-segments-output.mp4"
	err := appendToFile(segmentFile, msg.Body)
	if err != nil {
		logger.Error("Failed to save video segment",
			zap.String("file", segmentFile),
			zap.Error(err))
		return
	}

	logger.Info("Video segment saved successfully",
		zap.String("file", segmentFile),
		zap.Int("segment_size", len(msg.Body)))
}

func appendToFile(filename string, data []byte) error {

	f, err := os.OpenFile(filename, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		return fmt.Errorf("failed to open file: %w", err)
	}

	defer func() {
		if cerr := f.Close(); cerr != nil {
			err = fmt.Errorf("failed to close file: %w", cerr)
		}
	}()

	// Write the data to the file
	_, err = f.Write(data)
	if err != nil {
		return fmt.Errorf("failed to write data to file: %w", err)
	}

	return nil
}
