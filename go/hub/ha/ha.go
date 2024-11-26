package ha

import (
	"Smartess/go/common/structures"
	"time"
)

type WebhookMessage struct {
	ID    int                     `json:"id"`
	Type  string                  `json:"type"`
	Event structures.EventDetails `json:"event"`
}

// ConciseEvent represents a shortened Home Assistant event.
type ConciseEvent struct {
	Attributes  ConciseAttributes       `json:"attributes"`
	Context     structures.EventContext `json:"context"`
	EntityID    string                  `json:"entity_id"`
	LastChanged time.Time               `json:"last_changed"`
	LastUpdated time.Time               `json:"last_updated"`
	State       string                  `json:"state"`
}

// ConciseAttributes represents attributes field of a ConciseEvent
type ConciseAttributes struct {
	DeviceClass       *string     `json:"device_class,omitempty"`
	FriendlyName      *string     `json:"friendly_name,omitempty"`
	StateClass        *string     `json:"state_class,omitempty"`
	SupportedFeatures interface{} `json:"supported_features,omitempty"`
}
