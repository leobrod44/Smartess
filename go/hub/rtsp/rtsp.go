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
			} else {
				break
			}

			rtsp.Logger.Info(fmt.Sprintf("FFmpeg command: %v", cmd.String()))
		}
		// Add to WaitGroup before launching goroutines
		wg.Add(3)

		go func(cam CameraConfig, ctx *StreamContext) {
			defer wg.Done()
			rtsp.streamRTSP(&cam, ctx)
		}(camera, &ctx)

		// Special reserved queue for sending the name of camera (i.e. the name of its assigned RabbitMQ Stream)
		// This is done in parallel to other RTSP processor task once when starting everything initially
		go func(ctx *StreamContext, producer *stream.Producer) {
			defer wg.Done()

			streamName := producer.GetStreamName()
			routingKey := streamName
			if strings.HasPrefix(streamName, "video_stream.hub_id") {
				routingKey = "videostream.hubid" + streamName[len("video_stream.hub_id"):]
			}
			err = rtsp.instance.Channel.Publish(
				"videostream", // exchange
				routingKey,    //key
				true,          // mandatory
				false,         // immediate
				amqp.Publishing{
					ContentType: "text/plain",
					Body:        []byte(streamName),
				})
			if err != nil {
				rtsp.Logger.Error(fmt.Sprintf("Error publishing streamName: %v", err))
			}

			rtsp.sendData(ctx, producer)
		}(&ctx, producer)

		go func(ctx *StreamContext, camName string) {
			defer wg.Done()
			<-ctx.doneChannel
			close(ctx.dataChan)
			close(ctx.errChan)
			rtsp.Logger.Info(fmt.Sprintf("RTSP stream %s completed", camName))
		}(&ctx, camera.Name)
	}

	// Wait for all streams to finish before exiting
	wg.Wait()
	rtsp.Logger.Info("All RTSP streams have completed")
}

func (rtsp *RtspProcessor) Close() {
	rtsp.client.Close()
}

// FFmpegConfig holds the configuration for FFmpeg streaming
type FFmpegConfig struct {
	options                []string
	maxRetries             int
	retryDelay             time.Duration
	bufferPostSendInterval time.Duration
	bufferReaderSize       int
}

// TODO Turn this into docker valid Go argparse to input when running Producer container driver and/or builder
// TODO (As versatile named arguments in the main() of this producer/main.go)
func (rtsp *RtspProcessor) newFFmpegConfig(camera CameraConfig) (*FFmpegConfig, error) {
	tmpDir := "/tmp/data/" + camera.Name

	err := os.MkdirAll(tmpDir, 0755)
	if err != nil {
		// Log and return error if directory creation fails
		return nil, fmt.Errorf("error creating directory %v: %v", tmpDir, err)
	}

	STANDARD_OPTIONS := []string{
		// RTSP Transport settings
		"-rtsp_transport", "tcp", // Use TCP for RTSP transport
		"-i", camera.StreamURL, // Input RTSP stream
		"-buffer_size", "1024000", // Set buffer size
		"-probesize", "50M", // Increase probe size
		"-analyzeduration", "20000000", // Increase analyze duration
		"-avoid_negative_ts", "make_zero", // Avoid negative timestamps

		// Video encoding settings
		"-c:v", "libx264", // Compress using H.264 codec
		"-preset", "fast", // Use fast preset for encoding
		"-crf", "23", // Control quality (lower = better)
		"-r", "15", // Force frame rate
		"-g", "30", // Set keyframe interval

		// Audio settings
		"-b:a", "64k", // Set audio bitrate

		// Output format settings
		"-f", "segment", // Enable segmentation
		"-segment_time", fmt.Sprintf("%v", camera.SegmentTime), // Segment duration
		"-segment_format", "mp4", // Output format
		"-reset_timestamps", "1", // Reset timestamps for each segment
		"-segment_list", fmt.Sprintf("%s/segments.m3u8", tmpDir), // HLS playlist
		"-segment_list_type", "m3u8", // HLS format
		"-segment_list_size", "0", // Unlimited segments
		"-segment_list_flags", "+live", // Make it a live playlist
		fmt.Sprintf("%s/segment-%%03d.mp4", tmpDir), // Segment output
	}
	HLS_OPTIONS := []string{
		// RTSP Transport settings
		"-rtsp_transport", "tcp", // Use TCP for RTSP transport (more reliable than UDP)
		"-i", camera.StreamURL, // Input RTSP stream
		"-buffer_size", "1024000", // Set buffer size
		"-probesize", "50M", // Increase probe size for better format detection
		"-analyzeduration", "20000000", // Increase analyze duration

		// Video encoding settings
		"-c:v", "libx264", // Use H.264 codec (widely supported)
		"-preset", "ultrafast", // Prioritize speed over quality
		"-tune", "zerolatency", // Optimize for low latency
		"-profile:v", "baseline", // Use baseline profile for broader compatibility
		"-level", "3.0", // Compatibility level
		"-crf", "23", // Balance between quality and size
		"-r", "15", // 15 fps is good for surveillance
		"-g", "30", // GOP size of 30 frames
		"-keyint_min", "30", // Minimum keyframe interval

		// Force consistent keyframes for better streaming
		"-force_key_frames", "expr:gte(t,n_forced*2)",

		// HLS specific settings
		"-f", "hls", // Output format as HLS
		"-hls_time", fmt.Sprintf("%d", camera.SegmentTime), // Segment duration
		"-hls_list_size", "10", // Number of segments to keep in playlist
		"-hls_flags", "delete_segments+append_list", // Delete old segments, append to list
		"-hls_segment_type", "mpegts", // Segment format (MPEG-TS)
		"-hls_segment_filename", fmt.Sprintf("%s/segment-%%03d.ts", tmpDir), // Segment naming
		fmt.Sprintf("%s/segments.m3u8", tmpDir), // Output playlist
	}
	//LL_HLS_OPTIONS := []string{
	//	// RTSP Transport settings
	//	"-rtsp_transport", "tcp", // Use TCP for RTSP transport (more reliable than UDP)
	//	"-i", camera.StreamURL, // Input RTSP stream
	//	"-buffer_size", "1024000", // Set buffer size
	//	"-probesize", "32768", // Reduced probe size for faster startup
	//	"-analyzeduration", "1000000", // Reduced analyze duration for faster startup
	//	"-fflags", "+genpts+discardcorrupt", // Generate PTS and discard corrupt data
	//
	//	"-sws_flags", "bilinear", // Fast scaling
	//	"-avioflags", "direct", // Direct I/O for better performance
	//
	//	// Video encoding settings
	//	"-c:v", "libx264", // Use H.264 codec (widely supported)
	//	"-preset", "ultrafast", // Prioritize speed over efficiency
	//	"-tune", "zerolatency", // Optimize for low latency
	//	"-profile:v", "baseline", // Use baseline profile (lowest latency)
	//	"-level", "3.0", // Compatibility level
	//	"-crf", "28", // Balance quality/size (higher = lower quality but less data)
	//	"-maxrate", "2000k", // Limit maximum bitrate
	//	"-bufsize", "1000k", // Small buffer for lower latency
	//	"-g", "15", // Lower GOP size (keyframe every 15 frames)
	//	"-keyint_min", "15", // Minimum keyframe interval
	//	"-sc_threshold", "0", // Disable scene change detection (more predictable keyframes)
	//
	//	// Force consistent keyframes for better streaming
	//	"-force_key_frames", "expr:gte(t,n_forced*1)", // Force keyframe every 1 second
	//
	//	// HLS specific settings
	//	"-f", "hls", // Output format as HLS
	//	"-hls_time", "1", // Very short segments (1 second)
	//	"-hls_list_size", "4", // Keep only 4 segments in playlist (reduces delay)
	//	"-hls_flags", "delete_segments+append_list+program_date_time+independent_segments", // Enable LL-HLS features
	//	"-hls_segment_type", "mpegts", // Segment format (MPEG-TS)
	//	"-hls_segment_filename", fmt.Sprintf("%s/segment-%%03d.ts", tmpDir), // Segment naming
	//	"-hls_init_time", "0", // Start segments at 0 seconds
	//	"-hls_playlist_type", "event", // Event playlist for live streaming
	//	fmt.Sprintf("%s/segments.m3u8", tmpDir), // Output playlist
	//}
	switch camera.Type {
	case ANT:
		if strings.Contains(camera.Name, "duplicate") {
			options := []string{
				"-rtsp_transport", "tcp",
				"-i", camera.StreamURL,
				"-c:v", "libx264",
				"-buffer_size", "1024000", // Set buffer size
				"-probesize", "50M", // Increase probe size
				"-analyzeduration", "20000000", // Increase analyze duration
				"-preset", "fast",
				"-tune", "zerolatency",
				//"-g", "30",
				"-r", "15",
				"-crf", "23", // Control quality (lower = better)
				//"-keyint_min", "30",
				"-vf", "fps=15,showinfo,vfrdet",
				"-force_key_frames", "expr:gte(t,n_forced*1)",
				"-f", "mp4",
				"-movflags", "frag_keyframe+empty_moov+default_base_moof+faststart",
				"-frag_duration", fmt.Sprintf("%d", camera.SegmentTime*1000000), // Segment time in microseconds
				"-an", // Disable audio for simplicity
				"-",   // Output to stdout
			}
			return &FFmpegConfig{
				options:                options,
				maxRetries:             5,
				retryDelay:             5 * time.Second,
				bufferPostSendInterval: 30 * time.Millisecond,
				bufferReaderSize:       1024 * 1024,
			}, nil
		} else {

			return &FFmpegConfig{
				options:                HLS_OPTIONS,
				maxRetries:             5,
				retryDelay:             5 * time.Second,
				bufferPostSendInterval: 100 * time.Millisecond,
				bufferReaderSize:       1024000,
			}, nil
		}
	case REAL:
		return &FFmpegConfig{
			options:                HLS_OPTIONS,
			maxRetries:             6,
			retryDelay:             5 * time.Second,
			bufferPostSendInterval: 100 * time.Millisecond, // Increased interval
			bufferReaderSize:       1024000,                // Match buffer_size from ffmpeg
		}, nil
	case MOCK:
		return &FFmpegConfig{
			options:                STANDARD_OPTIONS,
			maxRetries:             5,
			retryDelay:             5 * time.Second,
			bufferPostSendInterval: 30 * time.Millisecond,
			bufferReaderSize:       1024000, // Match buffer_size from ffmpeg
		}, nil
	case ANTMOCK:
		return &FFmpegConfig{
			options: []string{
				"-rtsp_transport", "tcp", // Ensure stable RTSP stream transport
				"-i", camera.StreamURL,
				"-c:v", "libx264", // Video codec, libx264 corresponds to H.264
				"-preset", "ultrafast", // Adjust tradeoff between encoding speed and compression efficiency
				"-tune", "zerolatency", // Reduce latency
				"-profile:v", "baseline", // Set baseline profile
				"-level", "3.0", // Set level to 3.0

				"-pix_fmt", "yuv420p", // Pixel format
				"-maxrate", "2000k", // Maximum bitrate
				"-bufsize", "2000k", // Buffer size

				// GOP settings
				"-g", "30",
				"-keyint_min", "30", // Set minimum keyframe interval

				// Forcing keyframe interval
				"-force_key_frames", "expr:gte(t,n_forced*1)", // Force keyframe every second
				"-x264-params", "keyint=30:min-keyint=30", // Set both max and min keyframe interval
				"-sc_threshold", "0",
				"-an",       // Disable audio codec
				"-f", "mp4", // Output format
				"-movflags", "frag_keyframe+empty_moov+default_base_moof+faststart", // Enable faststart for streaming
				"-frag_duration", "1000000", // Fragment duration (1 second)
			},
			maxRetries:             5,
			retryDelay:             5 * time.Second,
			bufferPostSendInterval: 30 * time.Millisecond,
			bufferReaderSize:       1024 * 1024,
		}, nil
	default:
		return nil, fmt.Errorf("invalid camera selection: %d", camera.Type)
	}
}

func (c *FFmpegConfig) buildCommand() *exec.Cmd {
	return exec.Command("ffmpeg", c.options...)
}

func setupStreams(camera string, env *stream.Environment) (*stream.Producer, error) {
	hubID := os.Getenv("HUB_IP")
	streamName := fmt.Sprintf("video_stream.hub_id.%s.%s", hubID, camera)

	err := env.DeclareStream(streamName, &stream.StreamOptions{
		MaxLengthBytes:      stream.ByteCapacity{}.GB(2),
		MaxSegmentSizeBytes: stream.ByteCapacity{}.MB(50),
	})
	if err != nil {
		err := env.Close()
		if err != nil {
			return nil, fmt.Errorf("failed to close stream environment: %v", err)
		}
		return nil, fmt.Errorf("failed to declare stream: %v", err)
	}

	producer, err := env.NewProducer(streamName, nil)
	if err != nil {
		err := env.Close()
		if err != nil {
			return nil, fmt.Errorf("failed to close stream environment: %v", err)
		}
		return nil, fmt.Errorf("failed to create producer: %v", err)
	}

	return producer, nil
}

// TODO HLS 1: If the stream abruptly stops and so segments.m3u8 playlist is not getting updated anymore, append at its EOF a "#EXT-X-ENDLIST" tag

// TODO HLS 2: segments.m3u8 should be utf8-standard encoded... to ensure this, use the following command:
// TODO	"iconv -f ISO-8859-1 -t utf-8 -c segments.m3u8 > segments.m3u8.tmp && mv segments.m3u8.tmp segments.m3u8"
// TODO	OR "iconv -f US-ASCII -t UTF-8 segments.m3u8 > utf8_segments.m3u8" OR "sed -i '1s/^/\xEF\xBB\xBF/' segments.m3u8" "sed 's/\r$//' segments.m3u8 > segments2.m3u8"
// func (rtsp *RtspProcessor) streamRTSP(camera *CameraConfig, ctx *StreamContext) {
//
//	for {
//		files, err := os.ReadDir(ctx.directory)
//		if err != nil {
//			ctx.errChan <- fmt.Errorf("error reading directory %v: %v", ctx.directory, err)
//			return
//		}
//
//		for _, file := range files {
//			if file.IsDir() {
//				continue
//			}
//			if !strings.Contains(file.Name(), "segments.m3u8") {
//				rtsp.Logger.Info(fmt.Sprintf("Segment file: %v", file.Name()))
//				segmentFilePath := fmt.Sprintf("%s/%s", ctx.directory, file.Name())
//
//				segmentFileContent, err := os.ReadFile(segmentFilePath)
//				if err != nil {
//					rtsp.Logger.Error(fmt.Sprintf("Error reading segment file %v: %v", segmentFilePath, err))
//					continue
//				}
//				filePath := fmt.Sprintf("%s/%s", ctx.directory, file.Name())
//				fileInfo, err := os.Stat(filePath)
//				if err != nil {
//					rtsp.Logger.Error(fmt.Sprintf("Error retrieving file stats for %v: %v", filePath, err))
//					continue
//				}
//				rtsp.Logger.Info(fmt.Sprintf("File size: %d bytes !!", fileInfo.Size()))
//				ctx.dataChan <- segmentFileContent
//				//err = os.Remove(segmentFilePath)
//				//if err != nil {
//				//	rtsp.Logger.Error(fmt.Sprintf("Failed to remove segment file %v: %v", segmentFilePath, err))
//				//	continue
//				//}
//			}
//		}
//
//		time.Sleep(time.Duration(camera.SegmentTime))
//	}
//
// }
//

func (rtsp *RtspProcessor) streamRTSP(camera *CameraConfig, ctx *StreamContext) {
	config, err := rtsp.newFFmpegConfig(*camera)
	if err != nil {
		rtsp.Logger.Error(fmt.Sprintf("Failed to create FFmpeg config: %v", err))
		return
	}
	cmd := config.buildCommand()
	stdout, err := cmd.StdoutPipe()
	if err != nil {
		rtsp.Logger.Error(fmt.Sprintf("Failed to get stdout pipe: %v", err))
		return
	}
	cmd.Stderr = os.Stderr // Log FFmpeg errors to stderr
	if err := cmd.Start(); err != nil {
		rtsp.Logger.Error(fmt.Sprintf("Failed to start FFmpeg: %v", err))
		return
	}
	defer cmd.Wait()

	buffer := make([]byte, config.bufferReaderSize)
	for {
		n, err := stdout.Read(buffer)
		if err != nil {
			ctx.errChan <- fmt.Errorf("error reading FFmpeg output: %v", err)
			return
		}
		ctx.dataChan <- buffer[:n]
	}
}
func (rtsp *RtspProcessor) sendData(ctx *StreamContext, producer *stream.Producer) {
	for {
		select {
		case segment := <-ctx.dataChan:
			msg := stream_amqp.NewMessage(segment)
			if err := producer.Send(msg); err != nil {
				rtsp.Logger.Error(fmt.Sprintf("Failed to send segment: %v", err))
			} else {
				rtsp.Logger.Info(fmt.Sprintf("Sent %d bytes to stream %s", len(segment), producer.GetStreamName()))
			}
		case err := <-ctx.errChan:
			rtsp.Logger.Error(fmt.Sprintf("MQ Stream RTSP error: %v", err))

			//TODO Leave return statement here or not?
			return
		}
	}
}
