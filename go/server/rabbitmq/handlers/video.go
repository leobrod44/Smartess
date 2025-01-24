package handlers

import (
	"github.com/streadway/amqp"
	"go.uber.org/zap"
)

type VideoHandler struct {
}

func NewVideoHandler() *VideoHandler {
	return &VideoHandler{}
}

func (h *VideoHandler) Handle(msg amqp.Delivery, logger *zap.Logger) {}
