package structures

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type ChatMessage struct {
	MessageID   string    `json:"message_id"`  // Unique identifier for the message
	ChatID      string    `json:"chat_id"`     // ID of the chat or conversation
	SenderID    string    `json:"sender_id"`   // ID of the sender
	ReceiverID  string    `json:"receiver_id"` // ID of the receiver
	Content     string    `json:"content"`     // The message content
	CreatedAt   time.Time `json:"created_at"`  // Timestamp for when the message was created
	IsRead      bool      `json:"is_read"`     // Flag indicating if the message has been read
	Attachments []string  `json:"attachments"` // List of attachment URLs if any
}

type ForumComment struct {
	CommentID string    `json:"comment_id"` // Unique identifier for the comment
	PostID    string    `json:"post_id"`    // ID of the forum post
	UserID    string    `json:"user_id"`    // ID of the user who posted the comment
	Content   string    `json:"content"`    // The comment content
	CreatedAt time.Time `json:"created_at"` // Timestamp for when the comment was created
	ParentID  *string   `json:"parent_id"`  // ID of the parent comment, for nested replies
}

type Announcement struct {
	AnnouncementID string     `json:"announcement_id"` // Unique identifier for the announcement
	Title          string     `json:"title"`           // Title of the announcement
	Content        string     `json:"content"`         // The announcement content
	SenderID       string     `json:"sender_id"`       // ID of the user or system sending the announcement
	TargetAudience []string   `json:"target_audience"` // Array of user or group IDs to whom the announcement is targeted
	CreatedAt      time.Time  `json:"created_at"`      // Timestamp for when the announcement was created
	ExpiryDate     *time.Time `json:"expiry_date"`     // Optional expiry date of the announcement
	Attachments    []string   `json:"attachments"`     // List of attachment URLs if any
	Priority       string     `json:"priority"`        // Priority level (e.g., "low", "normal", "high")
}

type StateEvent struct {
	HubID     int       `json:"id" yaml:"id"`                 // ID of the sender
	DeviceID  string    `json:"device" yaml:"device"`         // ID of the device
	State     State     `json:"state" yaml:"state"`           // The message content
	TimeStamp time.Time `json:"time_fired" yaml:"time_fired"` // Timestamp for when the message was created
}

type HubLog struct {
	HubID     string    `json:"id" yaml:"id"`
	Message   string    `json:"message" yaml:"message"`
	TimeStamp time.Time `json:"time_fired" yaml:"time_fired"`
}

type EventDetails struct {
	EventType string       `json:"event_type" yaml:"event_type"`
	Data      EventData    `json:"data" yaml:"data"`
	Origin    string       `json:"origin" yaml:"origin"`
	TimeFired string       `json:"time_fired" yaml:"time_fired"`
	Context   EventContext `json:"context" yaml:"context"`
}

type EventData struct {
	EntityID string `json:"entity_id" yaml:"entity_id"`
	OldState State  `json:"old_state" yaml:"old_state"`
	NewState State  `json:"new_state" yaml:"new_state"`
}

type State struct {
	EntityID    string                 `json:"entity_id" yaml:"entity_id"`
	State       string                 `json:"state" yaml:"state"`
	Attributes  map[string]interface{} `json:"attributes" yaml:"attributes"`     // Added to capture dynamic attributes
	LastChanged time.Time              `json:"last_changed" yaml:"last_changed"` // Added to capture last changed time
	LastUpdated time.Time              `json:"last_updated" yaml:"last_updated"` // Added to capture last updated time
	Context     EventContext           `json:"context" yaml:"context"`           // Added to include context information
}

// TODO: SHOULD MAKE A GENERIC "EVENT" HA ENTITY STRUCT, SIMILAR TO "State" BUT NOT THE SAME
// https://developers.home-assistant.io/docs/dev_101_events/
// https://developers.home-assistant.io/docs/dev_101_states/
// https://developers.home-assistant.io/docs/core/entity/
type EventContext struct {
	ID       string `json:"id" yaml:"id"`
	ParentID string `json:"parent_id" yaml:"parent_id"`
	UserID   string `json:"user_id" yaml:"user_id"`
}
type Service struct {
	ServiceID   string                 `json:"service_id" yaml:"service_id"` // Important for service calls
	Domain      string                 `json:"domain" yaml:"domain"`
	Description string                 `json:"description" yaml:"description"`
	ServiceData map[string]interface{} `json:"service_data" yaml:"service_data"`
}

// Automation represents an automation in Home Assistant.
type Automation struct {
	Alias     string `json:"alias"`
	Trigger   string `json:"trigger"`
	Condition string `json:"condition"`
	Action    string `json:"action"`
}

type HARegistry interface {
	Register(id string, item interface{}) error
	Remove(id string) (interface{}, error)
	Get(id string) (interface{}, error)
}

type Alert struct {
	Type      string    `json:"type" yaml:"type"`
	HubIP     string    `json:"hub_ip" yaml:"hub_ip"`
	DeviceID  string    `json:"device" yaml:"device"`
	State     string    `json:"state" yaml:"state"`
	Message   string    `json:"message" yaml:"message"`
	TimeStamp time.Time `json:"time_fired" yaml:"time_fired"`
}

type TestMongoMessage struct {
	ID        primitive.ObjectID `bson:"_id,omitempty"` // MongoDB will generate this ID
	Data      string             `bson:"content"`
	Timestamp time.Time          `bson:"timestamp"`
}
