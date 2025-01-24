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

	if strings.HasPrefix(entityID, "light") { // LIGHT EVENTS
		return getLightSeverity(event)
	} else if strings.HasPrefix(entityID, "climate") { // CLIMATE EVENTS
		return getClimateSeverity(event)
	} else if strings.HasPrefix(entityID, "sensor") { // SENSOR EVENTS | IMPORTANT THERE ARE DIFFERENT TYPES OF SENSORS
		return getSensorSeverity(event)
	} else {
		return structures.SeverityWarning
	}
}

func getClimateSeverity(event *WebhookMessage) string {
	oldState := event.Event.Data.OldState
	newState := event.Event.Data.NewState

	oldStateValue := oldState.State
	newStateValue := newState.State

	// NEW DEVICE
	if (oldStateValue == "" && newStateValue != "") || (utils.IsStructEmpty(oldState) && !utils.IsStructEmpty(newState)) {
		return structures.SeverityInfo
	}

	// CRITICAL
	if newStateValue == "unavailable" {
		return structures.SeverityCritical
	}

	// CRITICAL: Temperature Stuck at Extreme Value (Critical Alert)
	if newState.Attributes["temperature"] != nil {
		newTemp := newState.Attributes["temperature"].(float64)

		if newTemp <= 0 || newTemp >= 40 {
			return structures.SeverityCritical
		}
	}

	// CRITICAL: HVAC Mode Stuck
	if newState.Attributes["hvac_action"] != nil {
		hvacAction := newState.Attributes["hvac_action"].(string)

		if hvacAction == "heating" || hvacAction == "cooling" {
			if oldStateValue == newStateValue {
				return structures.SeverityCritical
			}
		}
	}

	// WARNING: Temperature Exceeds Limits
	if newState.Attributes["temperature"] != nil {
		newTemp := newState.Attributes["temperature"].(float64)
		if newTemp > newState.Attributes["max_temp"].(float64) {
			return structures.SeverityWarning
		}
		if newTemp < newState.Attributes["min_temp"].(float64) {
			return structures.SeverityWarning
		}
	}

	// WARNING: System Efficiency Concerns
	if newState.Attributes["occupancy"] != nil && newState.Attributes["hvac_action"] != nil {
		occupancy := newState.Attributes["occupancy"].(int)
		hvacAction := newState.Attributes["hvac_action"].(string)

		if occupancy == 0 && (hvacAction == "heating" || hvacAction == "cooling") {
			return structures.SeverityWarning
		}
	}

	// Information Alert: Temperature Change
	if oldState.Attributes["temperature"] != nil && newState.Attributes["temperature"] != nil {
		oldTemp := oldState.Attributes["temperature"].(float64)
		newTemp := newState.Attributes["temperature"].(float64)

		// If the temperature has changed, it's an informational alert
		if oldTemp != newTemp {
			return structures.SeverityInfo // Temperature change detected
		}
	}

	// Information Alert: HVAC Mode Change
	if oldState.Attributes["hvac_action"] != nil && newState.Attributes["hvac_action"] != nil {
		oldHvacAction := oldState.Attributes["hvac_action"].(string)
		newHvacAction := newState.Attributes["hvac_action"].(string)

		// If the HVAC action has changed, it's an informational alert
		if oldHvacAction != newHvacAction {
			return structures.SeverityInfo // HVAC mode change detected
		}
	}

	return structures.SeverityWarning
}

func getSensorSeverity(event *WebhookMessage) string {
	oldState := event.Event.Data.OldState
	newState := event.Event.Data.NewState

	oldStateValue := oldState.State
	newStateValue := newState.State

	// NEW DEVICE
	if (oldStateValue == "" && newStateValue != "") || (utils.IsStructEmpty(oldState) && !utils.IsStructEmpty(newState)) {
		return structures.SeverityInfo
	}

	// CRITICAL
	if newStateValue == "unavailable" {
		return structures.SeverityCritical
	}

	return structures.SeverityWarning
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

	// CRITICAL
	if newStateValue == "unavailable" {
		return structures.SeverityCritical
	}

	// NEW DEVICE
	if (oldStateValue == "" && newStateValue != "") || (utils.IsStructEmpty(oldState) && !utils.IsStructEmpty(newState)) {
		return structures.SeverityInfo
	}

	// WARNING: Changes in device capabilities
	if oldSupportedFeatures != newSupportedFeatures {
		return structures.SeverityWarning
	}

	// INFORMATION: General state or attribute changes
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
