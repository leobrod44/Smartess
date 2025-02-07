// File: go/hub/ha/ha_test.go
package ha

import (
	"testing"
	"time"

	"github.com/streadway/amqp"
	"github.com/stretchr/testify/mock"
)

type MockRabbitMQInstance struct {
	mock.Mock
}

func (m *MockRabbitMQInstance) Publish(exchange, key string, mandatory, immediate bool, msg amqp.Publishing) error {
	args := m.Called(exchange, key, mandatory, immediate, msg)
	return args.Error(0)
}

// need to pass true in cmd/hub/main.go Init to use the mock hub before running the test
func TestRtspStream(t *testing.T) {
	// Start the services using Docker
	mockhuberr := RunCommand("docker-compose", []string{"up", "-d"}, "../cmd/mockhub")
	if mockhuberr != nil {
		t.Fatalf("Failed to start Docker containers in dir1: %v", mockhuberr)
	}
	defer func() {
		// Stop and remove the containers in dir1 after the test
		mockhuberr := RunCommand("docker-compose", []string{"down"}, "../cmd/mockhub")
		if mockhuberr != nil {
			t.Errorf("Failed to stop Docker containers in dir1: %v", mockhuberr)
		}
	}()
	t.Log("Waiting for mockhub to start...")
	err := WaitForServices(t, "../cmd/mockhub")
	if err != nil {
		t.Fatalf("Mockhub did not start properly: %v", err)
	}

	servererr := RunCommand("docker-compose", []string{"up", "-d", "server"}, "../../")
	if servererr != nil {
		t.Fatalf("Failed to start Docker containers in dir1: %v", servererr)
	}
	defer func() {
		// Stop and remove the containers in dir1 after the test
		otherserviceserr := RunCommand("docker-compose", []string{"down"}, "../../")
		if otherserviceserr != nil {
			t.Errorf("Failed to stop Docker containers in dir1: %v", otherserviceserr)
		}
	}()

	rabbitmqerr := RunCommand("docker-compose", []string{"up", "-d", "rabbitmq"}, "../../")
	if rabbitmqerr != nil {
		t.Fatalf("Failed to start Docker containers in dir1: %v", rabbitmqerr)
	}
	defer func() {
		// Stop and remove the containers in dir1 after the test
		otherserviceserr := RunCommand("docker-compose", []string{"down"}, "../../")
		if otherserviceserr != nil {
			t.Errorf("Failed to stop Docker containers in dir1: %v", otherserviceserr)
		}
	}()

	t.Log("Waiting for other services to start...")
	err = WaitForServices(t, "../../")
	if err != nil {
		t.Fatalf("Other services did not start properly: %v", err)
	}

	huberr := RunCommand("docker-compose", []string{"up", "-d"}, "../cmd/hub")
	if huberr != nil {
		t.Fatalf("Failed to start Docker containers in dir1: %v", huberr)
	}
	defer func() {
		// Stop and remove the containers in dir1 after the test
		huberr := RunCommand("docker-compose", []string{"down"}, "../cmd/hub")
		if huberr != nil {
			t.Errorf("Failed to stop Docker containers in dir1: %v", huberr)
		}
	}()
	t.Log("Waiting for hub to start...")
	err = WaitForServices(t, "../cmd/hub")
	if err != nil {
		t.Fatalf("Hub did not start properly: %v", err)
	}

	// Monitor the log file for the expected log message
	expectedLog := "frame="
	logFilePath := "../cmd/hub/logs/server.log"
	errCh := make(chan error)
	go MonitorLogFile(t, errCh, logFilePath, expectedLog)

	// Sleep for a while to allow events to be generated
	t.Log("Waiting for events to be processed...")
	time.Sleep(25 * time.Second)

	select {
	case errt := <-errCh:
		if errt != nil {
			t.Fatal(errt)
		}
	default:
	}

}
