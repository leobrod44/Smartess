package handlers

import (
	common_rabbitmq "Smartess/go/common/rabbitmq"
	"Smartess/go/common/structures"
	"encoding/json"

	"github.com/streadway/amqp"
	"go.mongodb.org/mongo-driver/mongo"
	"go.uber.org/zap"
)

type AlertHandler struct {
	MongoClient *mongo.Client
	r           *common_rabbitmq.RabbitMQInstance
}

func NewAlertHandler(mongoClient *mongo.Client, instance *common_rabbitmq.RabbitMQInstance) *AlertHandler {
	return &AlertHandler{MongoClient: mongoClient, r: instance}
}

func (h *AlertHandler) Handle(msg amqp.Delivery, logger *zap.Logger) {
	var alert structures.Alert
	err := json.Unmarshal(msg.Body, &alert)
	if err != nil {
		logger.Error("Failed to unmarshal alert",
			zap.Error(err),
			zap.String("msg", string(msg.Body)),
		)
	}

	switch alert.Type {
	case structures.AlertTypeLight:
		logger.Info("Light alert")
	case structures.AlertTypeSensor:
		logger.Info("Sensor alert")
	case structures.AlertTypeClimate:
		logger.Info("Climate alert")
	case structures.AlertTypeBatteryLow:
		logger.Info("Battery low alert")
	case structures.AlertTypeMotion:
		logger.Info("Motion alert")
	case structures.AlertTypeDoorOpen:
		logger.Info("Door open alert")
	case structures.AlertTypeSmoke:
		logger.Info("Smoke alert")
	case structures.AlertTypeWater:
		logger.Info("Water alert")
	case structures.AlertTypeTemperature:
		logger.Info("Temperature alert")
	default:
		logger.Info("Unknown alert type")
	}

	alertJson, err := json.Marshal(alert)
	if err != nil {
		logger.Error("Failed to marshal alert",
			zap.Error(err),
			zap.String("msg", string(msg.Body)),
		)
	}

	err = h.r.Channel.Publish(
		"website",        // exchange
		"website.alerts", //key
		true,             // mandatory
		false,            // immediate
		amqp.Publishing{
			ContentType: "text/plain",
			Body:        []byte(alertJson),
		})
	if err != nil {
		logger.Error("Failed to send alert to website alert queue",
			zap.Error(err),
			zap.String("msg", string(msg.Body)),
		)
	}

	// collection := h.MongoClient.Database("TestDB1").Collection(alert.HubIP) // database = building, collection = unit | where is building info???
	// _, err = collection.InsertOne(context.TODO(), bson.D{
	// 	{"_id", primitive.NewObjectID()},
	// 	{"hub_id", alert.HubIP},
	// 	{"device_id", alert.DeviceID},
	// 	{"state", alert.State},
	// 	{"message", alert.Message},
	// 	{"time_fired", alert.TimeStamp.String()},
	// })
	// if err != nil {
	// 	logger.Error("Failed to insert message into MongoDB", zap.Error(err))
	// }

}
