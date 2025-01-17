package structures

type HubTypeEnum int

const (
	HA_NORMAL_HUB HubTypeEnum = iota
	LOCAL_MOCK_HUB
	MONGO_MOCK_HUB
)

const (
	AlertTypeSmoke       = "Smoke"
	AlertTypeWater       = "Water"
	AlertTypeTemperature = "Temperature"
	AlertTypeBatteryLow  = "BatteryLow"
	AlertTypeMotion      = "Motion"
	AlertTypeDoorOpen    = "DoorOpen"
)

func (d HubTypeEnum) String() string {
	return [...]string{"HA_NORMAL_HUB", "LOCAL_MOCK_HUB", "MONGO_MOCK_HUB"}[d]
}
