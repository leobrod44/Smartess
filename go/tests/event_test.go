// File: go/hub/ha/ha_test.go
package ha

import (
	"testing"
	"time"
)

// need to pass true in cmd/hub/main.go Init to use the mock hub before running the test
func TestSmartessHubWithDocker(t *testing.T) {
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

	otherserviceserr := RunCommand("docker-compose", []string{"up", "-d"}, "../../")
	if otherserviceserr != nil {
		t.Fatalf("Failed to start Docker containers in dir1: %v", otherserviceserr)
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
	expectedLog := "MOCKlight.MOCKliving_room" // Update this with the expected log message
	logFilePath := "../cmd/hub/logs/server.log"
	// Unbuffered error/fatal channel
	// Instead of doing Fail or Fatalf here within a non-testing goroutine
	errCh := make(chan error)
	go MonitorLogFile(t, errCh, logFilePath, expectedLog)

	// Sleep for a while to allow events to be generated
	t.Log("Waiting for events to be processed...")
	time.Sleep(10 * time.Second)

	select {
	case errt := <-errCh:
		if errt != nil {
			t.Fatal(errt)
		}
	default:
	}
}
