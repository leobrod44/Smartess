package ha

// TODO Finish it to test topic exchange messages at different volumes, network volatility and with different queues
// TODO See common/configs/test_topic_messages.json for configurated template message to use in such integrating tests
//import (
//	common_rabbitmq "Smartess/go/common/rabbitmq"
//	"Smartess/go/hub/events"
//	"github.com/streadway/amqp"
//	"github.com/stretchr/testify/assert"
//	"github.com/stretchr/testify/mock"
//	"os"
//	"testing"
//)

//type MockChannel struct {
//	mock.Mock
//}
//
//func (m *MockChannel) Publish(exchange, key string, mandatory, immediate bool, msg amqp.Publishing) error {
//	args := m.Called(exchange, key, mandatory, immediate, msg)
//	return args.Error(0)
//}
//
//type MockInstance struct {
//	Channel *MockChannel
//}
//
//func TestPublishTopicMessages(t *testing.T) {
//	mockChannel := new(MockChannel)
//	mockInstance := &MockInstance{Channel: mockChannel}
//	eventHandler := &events.EventHandler{instance: mockInstance}
//
//	// Create a temporary JSON file for testing
//	fileContent := `[
//		{"routing_key": "key1", "content": "message1"},
//		{"routing_key": "key2", "content": "message2"}
//	]`
//	tmpFile, err := os.CreateTemp("", "test_topic_messages_*.json")
//	assert.NoError(t, err)
//	defer os.Remove(tmpFile.Name())
//
//	_, err = tmpFile.Write([]byte(fileContent))
//	assert.NoError(t, err)
//	err = tmpFile.Close()
//	assert.NoError(t, err)
//
//	// Mock the Publish method
//	mockChannel.On("Publish", common_rabbitmq.Test0TopicExchangeName, "key1", false, false, mock.Anything).Return(nil)
//	mockChannel.On("Publish", common_rabbitmq.Test0TopicExchangeName, "key2", false, false, mock.Anything).Return(nil)
//
//	// Call the function to test
//	err = eventHandler.PublishTopicMessages()
//	assert.NoError(t, err)
//
//	// Verify the Publish method was called with the correct arguments
//	mockChannel.AssertCalled(t, "Publish", common_rabbitmq.Test0TopicExchangeName, "key1", false, false, mock.Anything)
//	mockChannel.AssertCalled(t, "Publish", common_rabbitmq.Test0TopicExchangeName, "key2", false, false, mock.Anything)
//}
