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

// WaitForServices waits for services to start by running a command in a loop.
func WaitForServices(t *testing.T, dir string) error {
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

func MonitorLogFile(t *testing.T, errCh chan<- error, logFilePath, expectedLog string) {
	file, err := os.Open(logFilePath)

	if err != nil {
		errCh <- fmt.Errorf("Failed to open log file: %v", err)
		return
	}
	defer func() {
		err := file.Close()
		if err != nil {
			errCh <- fmt.Errorf("Failed to close log file: %v", err)
		}
	}()

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
			errCh <- nil
			return
		}
	}
}
