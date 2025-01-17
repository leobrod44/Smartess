package handlers

import (
	"Smartess/go/common/structures"
	"encoding/json"

	"github.com/streadway/amqp"
	"go.uber.org/zap"
)

type HubLogHandler struct {
	Level int
}

const (
	LogLevelInfo  = 0
	LogLevelWarn  = 1
	LogLevelError = 2
)

func NewHubLogHandler(queue string) *HubLogHandler {
	var level int
	switch queue {
	case "logs.info":
		level = LogLevelInfo
	case "logs.warn":
		level = LogLevelWarn
	case "logs.error":
		level = LogLevelError
	default:
		level = LogLevelInfo
	}
	return &HubLogHandler{Level: level}
}

func (h *HubLogHandler) Handle(msg amqp.Delivery, logger *zap.Logger) {

	var log structures.HubLog
	err := json.Unmarshal(msg.Body, &log)
	if err != nil {
		logger.Error("Failed to unmarshal log", zap.Error(err))
	}
	switch h.Level {
	case LogLevelInfo:
		logger.Info("log",
			zap.String("hub_id", log.HubID),
			zap.String("message", log.Message),
			zap.String("time_fired", log.TimeStamp.String()),
		)
	case LogLevelWarn:
		logger.Warn("log",
			zap.String("hub_id", log.HubID),
			zap.String("message", log.Message),
			zap.String("time_fired", log.TimeStamp.String()),
		)
	case LogLevelError:
		logger.Error("log",
			zap.String("hub_id", log.HubID),
			zap.String("message", log.Message),
			zap.String("time_fired", log.TimeStamp.String()),
		)
	default:
		logger.Info("log",
			zap.String("hub_id", log.HubID),
			zap.String("message", log.Message),
			zap.String("time_fired", log.TimeStamp.String()),
		)
	}
	//return nil
}
