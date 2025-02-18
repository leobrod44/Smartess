package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/exec"

	"github.com/pion/webrtc/v3"
	"github.com/rabbitmq/rabbitmq-stream-go-client/pkg/stream"
)

//var peerConnection *webrtc.PeerConnection

// TODO Add a global variable to store the WebRTC peer connection
// TODO Make configs and setups for specific exchange-mqstreams setups as well as env vars, docker vars, urls/locations (user+pwd+host+port+exchange+stream)
func startWebRTCStream() {
	// Build the GStreamer pipeline
	cmd := exec.Command("gst-launch-1.0",
		"rtmpsrc", "location=rabbitmq-stream://admin:admin@rabbitmq:5552/mqstream_video_test", //tcp://rabbitmq-server:5555/live_video",
		"!",
		"decodebin", "!",
		"videoconvert", "!",
		"vp8enc", "deadline=1", "!",
		"rtpvp8pay", "!",
		"webrtcbin", "name=peer")

	// Log the command output for debugging purposes
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	// Run the command
	err := cmd.Run()
	if err != nil {
		fmt.Printf("Error running GStreamer: %v\n", err)
	}
	////TODO Start the GStreamer process
	//err = cmd.Start()
	//if err != nil {
	//	log.Fatalf("Failed to start GStreamer process: %s", err)
	//}
	//// TODO: CONSUME HERE

	////TODO Wait for the GStreamer process to finish
	//err = cmd.Wait()
	//if err != nil {
	//	log.Fatalf("Failed to run GStreamer: %s", err)
	//}
}

//func main() {
//	env, err := stream.NewEnvironment(stream.NewEnvironmentOptions().SetHost("localhost").SetPort(5555))
//	if err != nil {
//		log.Fatal(err)
//	}
//
//	consumer, err := env.NewConsumer("live_video", func(consumerContext stream.ConsumerContext, message *stream.Message) {
//		if peerConnection != nil {
//			// Send video packet to WebRTC peer
//			track := peerConnection.GetSenders()[0].Track()
//			track.Write(message.GetData())
//		}
//	}, nil)
//
//	if err != nil {
//		log.Fatal(err)
//	}
//
//	http.HandleFunc("/signal", handleWebRTCSignal)
//	fmt.Println("WebRTC signaling server started on :8080")
//	log.Fatal(http.ListenAndServe(":8080", nil))
//}
//
//func handleWebRTCSignal(w http.ResponseWriter, r *http.Request) {
//	var req struct {
//		Offer webrtc.SessionDescription `json:"offer"`
//	}
//	json.NewDecoder(r.Body).Decode(&req)
//
//	peerConnection, _ = webrtc.NewPeerConnection(webrtc.Configuration{})
//	track, _ := peerConnection.NewTrack(webrtc.DefaultPayloadTypeVP8, 1234, "video", "stream")
//	peerConnection.AddTrack(track)
//
//	peerConnection.SetRemoteDescription(req.Offer)
//	answer, _ := peerConnection.CreateAnswer(nil)
//	peerConnection.SetLocalDescription(answer)
//
//	json.NewEncoder(w).Encode(map[string]webrtc.SessionDescription{"answer": answer})
//}
