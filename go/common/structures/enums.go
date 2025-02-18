package structures

type HubTypeEnum int

const (
	HA_NORMAL_HUB HubTypeEnum = iota
	LOCAL_MOCK_HUB
)

// TODO type AlertType string
const (
	AlertTypeLight       = "Light"
	AlertTypeSensor      = "Sensor"
	AlertTypeClimate     = "Climate"
	AlertTypeBatteryLow  = "BatteryLow"
	AlertTypeMotion      = "Motion"
	AlertTypeDoorOpen    = "DoorOpen"
	AlertTypeSmoke       = "Smoke"
	AlertTypeWater       = "Water"
	AlertTypeTemperature = "Temperature"
	AlertTypeUnknown     = "Unknown"
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

type CameraEnum int

const (
	MAIN_CAMERA CameraEnum = iota
	ANT_CAMERA
	MOCK_CAMERA
)

func (d CameraEnum) String() string {
	return [...]string{"MAIN_CAMERA", "ANT_CAMERA", "MOCK_CAMERA"}[d]
}
