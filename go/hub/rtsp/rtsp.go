package rtsp

import (
	common_rabbitmq "Smartess/go/common/rabbitmq"
	logs "Smartess/go/hub/logger"
	"bytes"
	"fmt"
	"strings"
	"sync"

	"os"
	"os/exec"
	"time"

	"github.com/bluenviron/gortsplib/v4"
	stream_amqp "github.com/rabbitmq/rabbitmq-stream-go-client/pkg/amqp"
	"github.com/rabbitmq/rabbitmq-stream-go-client/pkg/stream"
	"github.com/streadway/amqp"
	"gopkg.in/yaml.v3"
)

type RtspProcessor struct {
	instance *common_rabbitmq.RabbitMQInstance
	client   *gortsplib.Client
	cameras  Cameras
	Logger   *logs.Logger
}

type CameraEnum int

func (d *CameraEnum) UnmarshalYAML(unmarshal func(interface{}) error) error {
	var s string
	if err := unmarshal(&s); err != nil {
		return err
	}

	switch s {
	case "REAL":
		*d = REAL
	case "ANT":
		*d = ANT
	case "MOCK":
		*d = MOCK
	case "ANTMOCK":
		*d = ANTMOCK
	default:
		return fmt.Errorf("invalid CameraEnum value: %s", s)
	}

	return nil
}

const (
	REAL CameraEnum = iota
	ANT
	MOCK
	ANTMOCK
)

func (d CameraEnum) String() string {
	return [...]string{"REAL", "ANT", "MOCK", "ANTMOCK"}[d]
}

type CameraConfig struct {
	Name        string     `yaml:"name"`
	Type        CameraEnum `yaml:"type"`
	StreamURL   string     `yaml:"streamURL"`
	SegmentTime int        `yaml:"segment_time"`
}

type Cameras struct {
	CameraConfigs []CameraConfig `yaml:"cameras"`
}
type StreamContext struct {
	dataChan    chan []byte
	errChan     chan error
	doneChannel chan struct{}
	retries     int
	directory   string
}

func Init(instance *common_rabbitmq.RabbitMQInstance, logger *logs.Logger) (RtspProcessor, error) {

	dir := "/app/config/hub/cameras.yaml"

	var cameras Cameras
	data, err := os.ReadFile(dir)
	if err != nil {
		return RtspProcessor{}, fmt.Errorf("failed to read file: %v", err)
	}

	err = yaml.Unmarshal(data, &cameras)
	if err != nil {
		return RtspProcessor{}, fmt.Errorf("failed to unmarshal yaml: %v", err)
	}
	return RtspProcessor{
		instance: instance,
		client:   &gortsplib.Client{},
		cameras:  cameras,
		Logger:   logger,
	}, nil
}

func (rtsp *RtspProcessor) Start() {
	rtsp.Logger.Info("Starting RTSP Processor")
	rtsp.Logger.Info(fmt.Sprintf("Cameras: %v", rtsp.cameras))

	var wg sync.WaitGroup

	env, err := stream.NewEnvironment(
		stream.NewEnvironmentOptions().
			SetUri(os.Getenv("RABBITMQ_STREAM_URI")).
			SetMaxConsumersPerClient(10).
			SetMaxProducersPerClient(10),
	)
	if err != nil {
		rtsp.Logger.Error(fmt.Sprintf("failed to create stream environment: %v", err))
		panic(err)
	}

	defer func() {
		if err := env.Close(); err != nil {
			rtsp.Logger.Error(fmt.Sprintf("Failed to close stream environment: %v", err))
		}
	}()

	for _, camera := range rtsp.cameras.CameraConfigs {
		producer, err := setupStreams(camera.Name, env)
		if err != nil {
			rtsp.Logger.Error(fmt.Sprintf("Failed to setup stream environment: %v", err))
			panic(err)
		}

		defer func() {
			if err := producer.Close(); err != nil {
				rtsp.Logger.Error(fmt.Sprintf("Failed to close producer: %v", err))
			}
		}()

		// Configure FFmpeg
		ctx := StreamContext{
			dataChan:    make(chan []byte),
			errChan:     make(chan error),
			doneChannel: make(chan struct{}),
			retries:     0,
			directory:   "/tmp/data/" + camera.Name,
		}

		config, err := rtsp.newFFmpegConfig(camera)
		if err != nil {
			rtsp.Logger.Error(fmt.Sprintf("Failed to create FFmpeg config: %v", err))
			panic(err)
		}

		// Main retry loop
		for ctx.retries = 0; ctx.retries < config.maxRetries; ctx.retries++ {
			if ctx.retries > 0 {
				rtsp.Logger.Warn(fmt.Sprintf("Reconnecting RTSP stream %s (%d/%d)", camera.Name, ctx.retries+1, config.maxRetries))
				time.Sleep(config.retryDelay)
			}
			cmd := config.buildCommand()

			time.Sleep(time.Second)

			rtsp.Logger.Info(fmt.Sprintf("Starting FFmpeg for stream %s", camera.Name))
			rtsp.Logger.Info(fmt.Sprintf("FFmpeg command: %v", cmd.String()))

			ffmpegOutput := &bytes.Buffer{}
			cmd.Stdout = ffmpegOutput
			cmd.Stderr = ffmpegOutput

		err = cmd.Start()
		if err != nil {
			rtsp.Logger.Error(fmt.Sprintf("Error starting FFmpeg for stream %s: %v", camera.Name, err))
		}

		cmdMotion := exec.Command("ffmpeg",
			"-rtsp_transport", "tcp", // Use TCP for RTSP transport
			"-i", streamURL, // Input RTSP stream
			"-flush_packets", "1", // Flush packets
			"-vf", "select='gt(scene,0)',metadata=print:file=/motion/motion.log", // Filter: scene detection
			"-f", "null", "-", // Discard output
		)
		time.Sleep(time.Second)

		rtsp.Logger.Info(fmt.Sprintf("FFmpeg command: %v", cmdMotion.String()))

		err = cmdMotion.Start()
		if err != nil {
			rtsp.Logger.Error(fmt.Sprintf("Error starting FFmpeg for motion detection %s: %v", camera.Name, err))
		}

		go func(tmpDir string) {
			for {
				files, err := os.ReadDir(tmpDir)
				if err != nil {
					rtsp.Logger.Error(fmt.Sprintf("Error reading directory %v: %v", tmpDir, err))
					return
				}

		for _, file := range files {
			if file.IsDir() {
				continue
			}
			if !strings.Contains(file.Name(), "segments.m3u8") {
				rtsp.Logger.Info(fmt.Sprintf("Segment file: %v", file.Name()))
				segmentFilePath := fmt.Sprintf("%s/%s", ctx.directory, file.Name())

				segmentFileContent, err := os.ReadFile(segmentFilePath)
				if err != nil {
					rtsp.Logger.Error(fmt.Sprintf("Error reading segment file %v: %v", segmentFilePath, err))
					continue
				}
				filePath := fmt.Sprintf("%s/%s", ctx.directory, file.Name())
				fileInfo, err := os.Stat(filePath)
				if err != nil {
					rtsp.Logger.Error(fmt.Sprintf("Error retrieving file stats for %v: %v", filePath, err))
					continue
				}
				rtsp.Logger.Info(fmt.Sprintf("File size: %d bytes !!", fileInfo.Size()))
				ctx.dataChan <- segmentFileContent
				//err = os.Remove(segmentFilePath)
				//if err != nil {
				//	rtsp.Logger.Error(fmt.Sprintf("Failed to remove segment file %v: %v", segmentFilePath, err))
				//	continue
				//}
			}
		}

		time.Sleep(time.Duration(camera.SegmentTime))
	}

}
func (rtsp *RtspProcessor) sendData(ctx *StreamContext, producer *stream.Producer) {
	for {
		select {
		case segmentFileContent := <-ctx.dataChan:
			err := producer.Send(stream_amqp.NewMessage(segmentFileContent))
			if err != nil {
				rtsp.Logger.Error(fmt.Sprintf("Failed to publish segment to stream: %v", err)) // corrected format string
			}
			rtsp.Logger.Info(fmt.Sprintf("Published %v bytes to stream %v", len(segmentFileContent), producer.GetStreamName()))

		case err := <-ctx.errChan:
			rtsp.Logger.Error(fmt.Sprintf("Error streaming RTSP: %v", err))
		}
	}
}
