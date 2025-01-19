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
func (*EventClassification) GenerateAlertRoutingKey(event *ConciseEvent) string {
	classification := classifyConciseEvent(event)
	severity := determineAlertSeverity(event)
	routingKey := "alerts." + severity + "." + classification.Class
	for _, tag := range classification.Tags {
		routingKey += "." + tag
	}
	return routingKey
}

// TODO DETERMINE SEVERITY OF ALERTS
func determineAlertSeverity(event *ConciseEvent) string {
	entityID := event.EntityID
	state := event.State
	// Base severity on the type of device and state
	if strings.HasPrefix(entityID, "sensor.smoke") || strings.HasPrefix(entityID, "sensor.water") {
		if state == "on" {
			return structures.SeverityCritical // Critical for smoke or water detected
		}
	}

	// Battery or lock alerts could be warnings
	if strings.Contains(entityID, "battery") {
		if state == "low" {
			return structures.SeverityWarning // Warning for low battery
		}
	}

	// Regular devices like lights, fans, and thermostats are informational
	if strings.HasPrefix(entityID, "light.") || strings.HasPrefix(entityID, "fan.") || strings.HasPrefix(entityID, "thermostat.") {
		if state == "off" {
			return structures.SeverityInfo // Information for lights or fans turning off
		}
	}

	// Default to warning if no other condition matches
	return structures.SeverityWarning
}
