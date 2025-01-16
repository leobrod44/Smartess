package handlers

import (
	"Smartess/go/common/structures"
	"encoding/json"

	"github.com/streadway/amqp"
	"go.mongodb.org/mongo-driver/mongo"
	"go.uber.org/zap"
)

type AlertHandler struct {
	MongoClient *mongo.Client
}

func NewAlertHandler(mongoClient *mongo.Client) *AlertHandler {
	return &AlertHandler{MongoClient: mongoClient}
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
	logger.Info("alert",
		zap.String("hub_id", alert.HubIP),
		zap.String("device_id", alert.DeviceID),
		zap.String("state", alert.State),
		zap.String("message", alert.Message),
		zap.String("time_fired", alert.TimeStamp.String()),
	)

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
