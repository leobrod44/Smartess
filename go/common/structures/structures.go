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

// Sample light switch event message:
type EventMessage struct {
	ID    int    `json:"id"`
	Type  string `json:"type"`
	Event Event  `json:"event"`
}

type Event struct {
	EventType string    `json:"event_type"`
	Data      Data      `json:"data"`
	Origin    string    `json:"origin"`
	TimeFired time.Time `json:"time_fired"`
	Context   Context   `json:"context"`
}

type Data struct {
	EntityID string `json:"entity_id"`
	OldState State  `json:"old_state"`
	NewState State  `json:"new_state"`
}

type State struct {
	EntityID    string     `json:"entity_id"`
	State       string     `json:"state"`
	Attributes  Attributes `json:"attributes"`
	LastChanged time.Time  `json:"last_changed"`
	LastUpdated time.Time  `json:"last_updated"`
	Context     Context    `json:"context"`
}

type Attributes struct {
	MinColorTempKelvin  int       `json:"min_color_temp_kelvin"`
	MaxColorTempKelvin  int       `json:"max_color_temp_kelvin"`
	MinMireds           int       `json:"min_mireds"`
	MaxMireds           int       `json:"max_mireds"`
	EffectList          []string  `json:"effect_list"`
	SupportedColorModes []string  `json:"supported_color_modes"`
	ColorMode           string    `json:"color_mode,omitempty"`
	Brightness          int       `json:"brightness,omitempty"`
	HsColor             []float64 `json:"hs_color,omitempty"`
	RgbColor            []int     `json:"rgb_color,omitempty"`
	XyColor             []float64 `json:"xy_color,omitempty"`
	Effect              string    `json:"effect,omitempty"`
	Mode                string    `json:"mode"`
	Dynamics            string    `json:"dynamics"`
	FriendlyName        string    `json:"friendly_name"`
	SupportedFeatures   int       `json:"supported_features"`
}

type Context struct {
	ID       string  `json:"id"`
	ParentID *string `json:"parent_id"`
	UserID   *string `json:"user_id"`
}

//End of light switch event message
