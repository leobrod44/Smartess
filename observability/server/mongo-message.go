package messages

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
	"time"
)

type MongoMessage struct {
	ID        primitive.ObjectID `bson:"_id,omitempty"` // MongoDB will generate this ID
	Content   string             `bson:"content"`
	Timestamp time.Time          `bson:"timestamp"`
}
