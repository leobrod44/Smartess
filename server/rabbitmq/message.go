package rabbitmq

type Message interface {
	Parse(string) error
}
