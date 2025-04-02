package utils

// import (
// 	"fmt"
// 	"os/exec"
// 	"time"
// )

// type FFmpegArgument struct {
// 	Keyword string
// 	Value   string
// 	Desc    string
// }

// type FFmpegConfig struct {
// 	Input      string
// 	Arguments  []FFmpegArgument
// 	MaxRetries int
// 	RetryDelay time.Duration
// }

// func (c *FFmpegConfig) toString() string {
// 	for _, arg := range c.Arguments {
// 		fmt.Printf("Argument: %s, Description: %s\n", arg.Keyword, arg.Desc)
// 	}
// 	return ""
// }
// func newFFmpegConfig(input string) *FFmpegConfig {
// 	return &FFmpegConfig{
// 		Input: input,
// 		Arguments: []FFmpegArgument{
// 			{Keyword: "-c:v", Value: "libx264", Desc: "Specifies the video codec (H.264, a widely supported and efficient codec)."},
// 			{Keyword: "-preset", Value: "veryfast", Desc: "Sets the encoding speed and compression efficiency (balance between speed and file size)."},
// 			{Keyword: "-tune", Value: "zerolatency", Desc: "Optimizes for low-latency streaming, ideal for real-time applications."},
// 			{Keyword: "-profile:v", Value: "baseline", Desc: "Sets the video profile for H.264, baseline for broad compatibility."},
// 			{Keyword: "-level", Value: "3.0", Desc: "Sets the H.264 level, determining supported resolution and bitrate (level 3.0 for 720p)."},
// 			{Keyword: "-maxrate", Value: "2000k", Desc: "Sets the maximum bitrate for encoding to control bandwidth usage."},
// 			{Keyword: "-bufsize", Value: "4000k", Desc: "Sets the buffer size to smooth out bitrate fluctuations during encoding."},
// 			{Keyword: "-g", Value: "20", Desc: "Defines the Group of Pictures (GOP) size; keyframes are inserted every 20 frames."},
// 			{Keyword: "-keyint_min", Value: "20", Desc: "Sets the minimum interval for keyframes, ensuring keyframes are inserted every 20 frames."},
// 			{Keyword: "-sc_threshold", Value: "0", Desc: "Disables scene change detection for keyframes."},
// 			{Keyword: "-f", Value: "mp4", Desc: "Sets the output format to MP4, commonly used for streaming."},
// 			{Keyword: "-an", Value: "", Desc: "Disables audio in the output, useful for video-only streams."},
// 			{Keyword: "-movflags", Value: "frag_keyframe+empty_moov+default_base_moof+faststart",
// 				Desc: "Optimizes the MP4 file for streaming (fast start and fragmented)."},
// 			{Keyword: "pipe:1", Value: "", Desc: "Sends output to standard output (useful for piping data to another process)."},
// 			{Keyword: "-rtsp_transport", Value: "tcp", Desc: "Force TCP for more reliable RTSP connection."},
// 			{Keyword: "-stimeout", Value: "10000000", Desc: "Sets the timeout for RTSP connections to 10 seconds."},
// 			{Keyword: "-rtsp_flags", Value: "prefer_tcp", Desc: "Prefer TCP for RTSP connections."},
// 			{Keyword: "-frag_duration", Value: "500000", Desc: "Sets the fragment duration for HLS segments to 500 milliseconds."},
// 		},
// 		MaxRetries: 5,
// 		RetryDelay: 5 * time.Second,
// 	}
// }

// func (c *FFmpegConfig) buildCommand() *exec.Cmd {
// 	args := []string{"-i", c.Input}

// 	for _, arg := range c.Arguments {
// 		if arg.Value != "" {
// 			args = append(args, arg.Keyword, arg.Value)
// 		} else {
// 			args = append(args, arg.Keyword)
// 		}
// 	}

// 	return exec.Command("ffmpeg", args...)
// }
// func validateRTSPStream(url string) error {
// 	// Use ffprobe to validate the RTSP stream
// 	cmd := exec.Command("ffprobe", "-v", "error", "-i", url, "-show_entries", "stream=codec_type", "-of", "default=noprint_wrappers=1:nokey=1")
// 	output, err := cmd.CombinedOutput()
// 	if err != nil {
// 		return fmt.Errorf("stream validation failed: %v - output: %s", err, string(output))
// 	}
// 	return nil
// }
