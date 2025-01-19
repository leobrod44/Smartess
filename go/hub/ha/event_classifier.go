package ha

import (
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
