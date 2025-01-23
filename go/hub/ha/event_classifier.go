package ha

import (
	"Smartess/go/common/structures"
	"Smartess/go/common/utils"
	"strings"
)

type RoutingKeyGenerator interface {
	GenerateRoutingKey(event *ConciseEvent) string
}
type EventClassification struct {
	Class string
	Tags  []string
}

func classifyConciseEvent(event *ConciseEvent) EventClassification {
	classification := EventClassification{Class: "", Tags: []string{}}

	// Determine the class
	if event.Attributes.DeviceClass != nil {
		classification.Class = *event.Attributes.DeviceClass
	} else {
		// Extract the domain from entity_id (e.g., light, switch, sensor)
		parts := strings.Split(event.EntityID, ".")
		if len(parts) > 0 {
			classification.Class = parts[0]
		} else {
			classification.Class = "unknown"
		}
	}

	// Collect tags
	if event.Attributes.FriendlyName != nil {
		classification.Tags = append(classification.Tags, utils.NormalizeStringToTag(*event.Attributes.FriendlyName))
	}

	if event.Attributes.StateClass != nil {
		classification.Tags = append(classification.Tags, utils.NormalizeStringToTag(*event.Attributes.StateClass))
	}
	if event.Attributes.DeviceClass != nil {
		classification.Tags = append(classification.Tags, utils.NormalizeStringToTag(*event.Attributes.DeviceClass))
	}

	//TODO: Additional tags can be added here based on other attributes + context conditionals

	return classification
}

// TODO Expand and add edge cases
func (*EventClassification) GenerateRoutingKey(event *ConciseEvent) string {
	classification := classifyConciseEvent(event)
	// Simple routing key format: class.tag1.tag2
	routingKey := classification.Class
	for _, tag := range classification.Tags {
		routingKey += "." + tag
	}
	return routingKey
}

// TODO TEMP ALERT ROUTING KEY ONLY
func (*EventClassification) GenerateAlertRoutingKey(consiseEvent *ConciseEvent, webMessage *WebhookMessage) string {
	classification := classifyConciseEvent(consiseEvent)
	severity := determineAlertSeverity(webMessage)
	routingKey := "alerts." + severity + "." + classification.Class
	for _, tag := range classification.Tags {
		routingKey += "." + tag
	}
	return routingKey
}

// TODO DETERMINE SEVERITY OF ALERTS
func determineAlertSeverity(event *WebhookMessage) string {
	entityID := event.Event.Data.EntityID

	var severity string
	// LIGHT EVENTS
	if strings.HasPrefix(entityID, "light") {
		severity = getLightSeverity(event)
	}

	// TODO CLIMATE

	// TODO SENSOR

	// Default to warning if no other condition matches
	return severity
}

// CHECK SEVERITY OF LIGHT EVENT
func getLightSeverity(event *WebhookMessage) string {
	oldState := event.Event.Data.OldState
	newState := event.Event.Data.NewState

	oldStateValue := oldState.State
	newStateValue := newState.State

	oldOffBrightness := oldState.Attributes["off_brightness"]
	newOffBrightness := newState.Attributes["off_brightness"]

	oldSupportedColorModes := oldState.Attributes["supported_color_modes"]
	newSupportedColorModes := newState.Attributes["supported_color_modes"]

	oldSupportedFeatures := oldState.Attributes["supported_features"]
	newSupportedFeatures := newState.Attributes["supported_features"]

	// CRITICAL SECTION
	if newStateValue == "unavailable" {
		return structures.SeverityCritical
	}

	// NEW DEVICE
	if (oldStateValue == "" && newStateValue != "") || (utils.IsStructEmpty(oldState) && utils.IsStructEmpty(newState) == false) {
		return structures.SeverityInfo
	}

	// WARNING SECTION
	if oldSupportedFeatures != newSupportedFeatures {
		return structures.SeverityWarning
	}

	// INFORMATION SECTION
	if oldStateValue != newStateValue {
		return structures.SeverityInfo
	}
	if oldOffBrightness != newOffBrightness {
		return structures.SeverityInfo
	}
	if oldSupportedColorModes != newSupportedColorModes {
		return structures.SeverityInfo
	}

	return structures.SeverityWarning
}
