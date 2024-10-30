package structures

import "time"

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

type GenericMessage struct {
	HubID     int       `json:"id"`         // ID of the sender
	Content   string    `json:"json"`       // The message content
	TimeStamp time.Time `json:"time_fired"` // Timestamp for when the message was created
}
