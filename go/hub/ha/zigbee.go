package ha

import (
	"Smartess/go/common/utils"
	"fmt"
)

// ZigbeeDevice represents a Zigbee device
// For more information, see: https://www.home-assistant.io/integrations/zha/
type ZigbeeDevice struct {
	DeviceID     string                  `json:"device_id"`
	DeviceClass  string                  `json:"device_class"`
	AreaID       string                  `json:"area_id"`
	Name         string                  `json:"name"`
	State        string                  `json:"state"`
	LastUpdated  string                  `json:"last_updated"`
	LastChanged  string                  `json:"last_changed"`
	Manufacturer string                  `json:"manufacturer"`
	Model        string                  `json:"model"`
	Protocol     string                  `json:"protocol"`
	IEEEAddress  string                  `json:"ieee_address"`
	Endpoints    map[string]*interface{} `json:"endpoints"`
}

// ZigbeeEvent represents a Zigbee event, ZHA integration
type ZigbeeEvent struct {
	DeviceID     string            `json:"device_id"`
	ClusterID    uint16            `json:"cluster_id"`
	Manufacturer string            `json:"manufacturer"`
	Attributes   map[string]string `json:"attributes"`
	EventType    string            `json:"event_type"`
}

// ExtractRoutingKeyForZigbee standardizes Zigbee routing key extraction
func ExtractRoutingKeyForZigbee(event ZigbeeEvent) string {
	deviceType := utils.NormalizeStringToTag(event.Attributes["device_type"])
	if deviceType == "" {
		deviceType = "unknown"
	}

	manufacturer := utils.NormalizeStringToTag(event.Manufacturer)
	if manufacturer == "" {
		manufacturer = "generic"
	}

	deviceID := utils.NormalizeStringToTag(event.DeviceID)
	if deviceID == "" {
		deviceID = "generic"
	}

	eventType := utils.NormalizeStringToTag(event.EventType)
	if eventType == "" {
		eventType = "event"
	}

	return fmt.Sprintf("zigbee.%s.%s.%s.%s", deviceType, manufacturer, deviceID, eventType)

}
