package rabbitmq

type QueueConfig struct {
	Queue         string                 `yaml:"name"`
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

type MessageFormat struct {
	Type   string                 `yaml:"type"`
	Schema map[string]interface{} `yaml:"schema"`
}
