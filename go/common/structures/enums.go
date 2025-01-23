package structures

type HubTypeEnum int

const (
	HA_NORMAL_HUB HubTypeEnum = iota
	LOCAL_MOCK_HUB
)

const (
	AlertTypeLight   = "Light"
	AlertTypeSensor  = "Sensor"
	AlertTypeClimate = "Climate"
	AlertTypeUnknown = "Unknown"
)

const (
	SeverityCritical = "critical"
	SeverityWarning  = "warning"
	SeverityInfo     = "information"
)

func (d HubTypeEnum) String() string {
	return [...]string{"HA_NORMAL_HUB", "LOCAL_MOCK_HUB", "MONGO_MOCK_HUB"}[d]
}
