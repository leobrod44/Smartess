package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/pion/webrtc/v3"
	"github.com/rabbitmq/rabbitmq-stream-go-client/pkg/stream"
)

var peerConnection *webrtc.PeerConnection

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
