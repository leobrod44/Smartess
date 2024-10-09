package rabbitmq

type Queue struct {
	Exchange   string  `yaml:"exchange"`
	RoutingKey string  `yaml:"routing_key"`
	Durable    bool    `yaml:"durable"`
	AutoDelete bool    `yaml:"auto_delete"`
	Exclusive  bool    `yaml:"exclusive"`
	NoWait     bool    `yaml:"no_wait"`
	Message    Message `yaml:"message"`
}
