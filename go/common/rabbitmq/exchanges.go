package rabbitmq

type ExchangeConfig struct {
	Name          string                 `yaml:"name"`
	ExchangeType  string                 `yaml:"type"`
	Durable       bool                   `yaml:"durable"`
	AutoDelete    bool                   `yaml:"auto_delete"`
	Description   string                 `yaml:"description,omitempty"`
	QueueBindings []ExchangeQueueBinding `yaml:"bindings,omitempty"`
}
type ExchangeQueueBinding struct {
	Queue      string `yaml:"queue"`
	RoutingKey string `yaml:"routing_key"`
}
