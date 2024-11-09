// File: go/hub/ha/ha_test.go
package ha

import (
	"bufio"

	"fmt"
	"os"
	"os/exec"
	"strings"
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
	err := waitForServices(t, "../cmd/mockhub")
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
	err = waitForServices(t, "../../")
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
	err = waitForServices(t, "../cmd/hub")
	if err != nil {
		t.Fatalf("Hub did not start properly: %v", err)
	}

	// Monitor the log file for the expected log message
	expectedLog := "MOCKlight.MOCKliving_room" // Update this with the expected log message
	logFilePath := "../cmd/hub/logs/server.log"
	go monitorLogFile(t, logFilePath, expectedLog)

	// Sleep for a while to allow events to be generated
	t.Log("Waiting for events to be processed...")
	time.Sleep(10 * time.Second)
}

func waitForServices(t *testing.T, dir string) error {
	for i := 0; i < 10; i++ {
		err := RunCommand("docker", []string{"ps"}, dir)
		if err == nil {
			t.Log("Services are running.")
			return nil
		}
		t.Log("Waiting for services to start...")
		time.Sleep(2 * time.Second)
	}
	return fmt.Errorf("services did not start in time")
}

func monitorLogFile(t *testing.T, logFilePath string, expectedLog string) {
	file, err := os.Open(logFilePath)
	if err != nil {
		t.Fatalf("Failed to open log file: %v", err)
	}
	defer file.Close()

	reader := bufio.NewReader(file)

	// Continuously read the log file
	for {
		line, err := reader.ReadString('\n')
		if err != nil {
			time.Sleep(1 * time.Second) // Wait and retry
			continue
		}

		if strings.Contains(line, expectedLog) {
			t.Logf("Found expected log: %s", line)
			return
		}
	}
}

// RunCommand runs a shell command and returns any errors.
func RunCommand(cmd string, args []string, dir string) error {
	command := exec.Command(cmd, args...)
	command.Dir = dir // Set the working directory for the command
	output, err := command.CombinedOutput()
	if err != nil {
		return fmt.Errorf("failed to execute %s %v in directory %s: %v\nOutput: %s", cmd, args, dir, err, string(output))
	}
	return nil
}
