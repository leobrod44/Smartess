package ha

import (
	"Smartess/go/common/structures"
	"Smartess/go/common/utils"
	"time"
)

// HomeAssistantInstance is the Hass object represents a Home Assistant instance.
// For more information, see: https://developers.home-assistant.io/docs/dev_101_hass
type HomeAssistantInstance struct {
	HassAPI struct {
		Url         string
		AccessToken string
		Endpoints   map[string]string
	}
	Services    map[string]*structures.Service    `json:"services"`
	Automations map[string]*structures.Automation `json:"automations"`
	States      map[string]*structures.State      `json:"states"`

	CoreConfig     interface{}
	EventBus       interface{}
	EntityRegistry interface{}
}
type WebhookMessage struct {
	ID    int                     `json:"id" yaml:"id"`
	Type  string                  `json:"type" yaml:"type"`
	Event structures.EventDetails `json:"event" yaml:"event"`
}

// ConciseEvent represents a shortened Home Assistant event.
type ConciseEvent struct {
	Attributes  ConciseAttributes       `json:"attributes" yaml:"attributes"`
	Context     structures.EventContext `json:"context" yaml:"context"`
	EntityID    string                  `json:"entity_id" yaml:"entity_id"`
	LastChanged time.Time               `json:"last_changed" yaml:"last_changed"`
	LastUpdated time.Time               `json:"last_updated" yaml:"last_updated"`
	State       string                  `json:"state" yaml:"state"`
}

// ConciseAttributes represents attributes field of a ConciseEvent
type ConciseAttributes struct {
	DeviceClass       *string     `json:"device_class,omitempty" yaml:"device_class,omitempty"`
	FriendlyName      *string     `json:"friendly_name,omitempty" yaml:"friendly_name,omitempty"`
	StateClass        *string     `json:"state_class,omitempty" yaml:"state_class,omitempty"`
	SupportedFeatures interface{} `json:"supported_features,omitempty" yaml:"supported_features,omitempty"`
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

// Converts WebhookMessage(from hub) to a home assitance concise event
func ConvertWebhookMessageToConciseEvent(message *WebhookMessage) *ConciseEvent {
	var conciseAttributes *ConciseAttributes
	if message.Event.Data.NewState.Attributes != nil {
		conciseAttributes = ConvertAttributesToConciseAttributes(message.Event.Data.NewState.Attributes)
	} else {
		conciseAttributes = &ConciseAttributes{}
	}

	return &ConciseEvent{
		Attributes:  *conciseAttributes,
		Context:     message.Event.Context,
		EntityID:    message.Event.Data.EntityID,
		LastChanged: message.Event.Data.NewState.LastChanged,
		LastUpdated: message.Event.Data.NewState.LastUpdated,
		State:       message.Event.Data.NewState.State,
	}
}
