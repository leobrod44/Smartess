package ha

import (
	"Smartess/go/common/structures"
	"encoding/json"
	"fmt"
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

func parseConciseEvent(rawJSON string) (*ConciseEvent, error) {
	var event ConciseEvent
	err := json.Unmarshal([]byte(rawJSON), &event)
	if err != nil {
		return nil, fmt.Errorf("error parsing JSON: %v", err)
	}
	return &event, nil
}
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
func ConvertAttributesToConciseAttributes(attributes map[string]interface{}) *ConciseAttributes {

	return &ConciseAttributes{
		DeviceClass:       getStringPtr(attributes, "device_class"),
		FriendlyName:      getStringPtr(attributes, "friendly_name"),
		StateClass:        getStringPtr(attributes, "state_class"),
		SupportedFeatures: attributes["supported_features"],
	}
}
func getStringPtr(attributes map[string]interface{}, key string) *string {
	if value, ok := attributes[key].(string); ok {
		return &value
	}
	return nil
}
