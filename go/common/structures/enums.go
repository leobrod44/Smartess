package structures

type HubTypeEnum int

const (
	HA_NORMAL_HUB HubTypeEnum = iota
	LOCAL_MOCK_HUB
)
// TODO type AlertType string
const (
	AlertTypeLight   = "Light"
	AlertTypeSensor  = "Sensor"
	AlertTypeClimate = "Climate"
	AlertTypeUnknown = "Unknown"
)
// TODO type AlertSeverity string
const (
	SeverityCritical = "critical"
	SeverityWarning  = "warning"
	SeverityInfo     = "information"
)

func (d HubTypeEnum) String() string {
	return [...]string{"HA_NORMAL_HUB", "LOCAL_MOCK_HUB"}[d]
}
