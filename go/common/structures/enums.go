package structures

type HubTypeEnum int

const (
	HA_NORMAL_HUB HubTypeEnum = iota
	LOCAL_MOCK_HUB
	MONGO_MOCK_HUB
)

func (d HubTypeEnum) String() string {
	return [...]string{"HA_NORMAL_HUB", "LOCAL_MOCK_HUB", "MONGO_MOCK_HUB"}[d]
}
