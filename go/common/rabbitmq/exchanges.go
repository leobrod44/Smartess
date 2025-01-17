package rabbitmq

const (
	Test0TopicExchangeName        = "smartess_topic_exchange"
	Test0NotificationRoutingKey   = "smartess.notification"
	Test0AlertRoutingKey          = "smartess.alert"
	Test0VideoStreamingRoutingKey = "smartess.videostream"
)

type ExchangeConfig struct {
	Name          string                 `yaml:"name"`
	ExchangeType  string                 `yaml:"type"`
	Durable       bool                   `yaml:"durable"`
	AutoDelete    bool                   `yaml:"auto_delete"`
	Description   string                 `yaml:"description,omitempty"`
	QueueBindings []ExchangeQueueBinding `yaml:"bindings,omitempty"`
}
type ExchangeQueueBinding struct {
	Queue         string                 `yaml:"queue"`
	RoutingKey    string                 `yaml:"routing_key"`
	Type          string                 `yaml:"type"`
	MaxSize       int                    `yaml:"max_size"`
	Passive       bool                   `yaml:"passive"`
	Durable       bool                   `yaml:"durable"`
	AutoDelete    bool                   `yaml:"auto_delete"`
	Exclusive     bool                   `yaml:"exclusive"`
	NoWait        bool                   `yaml:"no_wait"`
	Arguments     map[string]interface{} `yaml:"arguments"`
	MessageFormat MessageFormat          `yaml:"message_format"`
}
