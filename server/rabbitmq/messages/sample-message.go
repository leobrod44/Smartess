package messages

import "go.uber.org/zap"

type SampleMessage struct {
	Type    string `json:"type"`
	Message string `json:"message"`
}

// Handle method for Alert
func (a *SampleMessage) Handle(logger *zap.Logger) {
	logger.Info("Handling sample message", zap.String("message", a.Message))

}
