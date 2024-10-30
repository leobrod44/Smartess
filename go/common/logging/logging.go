package logging

import (
	"os"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

// InitializeLogger initializes the logger instance. Used for our grafana, loki, and promtail system.
func InitializeLogger(logPath string) (*zap.Logger, error) {

	logFile, err := os.OpenFile(logPath, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
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
