package ha

import (
	"Smartess/go/common/structures"
	"Smartess/go/common/utils"
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

// Converts any structures.State struct to a ConciseEvent struct.
func ConvertEventToConciseEvent(event *structures.State) *ConciseEvent {
	return &ConciseEvent{
		Attributes:  *ConvertAttributesToConciseAttributes(event.Attributes),
		Context:     event.Context,
		EntityID:    event.EntityID,
		LastChanged: event.LastChanged,
		LastUpdated: event.LastUpdated,
		State:       event.State,
	}
}

// Converts any attributes []interface{} generic into a ConciseAttributes struct (Field type of ConciseEvent).
func ConvertAttributesToConciseAttributes(attributes map[string]interface{}) *ConciseAttributes {

	return &ConciseAttributes{
		DeviceClass:       utils.GetStringPtrNilSafe(attributes, "device_class"),
		FriendlyName:      utils.GetStringPtrNilSafe(attributes, "friendly_name"),
		StateClass:        utils.GetStringPtrNilSafe(attributes, "state_class"),
		SupportedFeatures: attributes["supported_features"],
	}
}
