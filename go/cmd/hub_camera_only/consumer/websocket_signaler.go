package main

//var upgrader = websocket.Upgrader{
//	CheckOrigin: func(r *http.Request) bool {
//		return true
//	},
//}
//
//// var peerConnection *webrtc.PeerConnection
//
//// TODO Add a global variable to store the WebRTC peer connections configs
//// websocket signaling using WebSocket handshake/init conn + read/write messages
//func handleWebRTCSignal(w http.ResponseWriter, r *http.Request) {
//	// TODO Mix Http peer connection API stuff with WebSocket signaling for WebRTC conn init and bidirectional signals ????
//	//	var req struct {
//	//		Offer webrtc.SessionDescription `json:"offer"`
//	//	}
//	//	json.NewDecoder(r.Body).Decode(&req)
//	//
//	//	peerConnection, _ = webrtc.NewPeerConnection(webrtc.Configuration{})
//	//	track, _ := peerConnection.NewTrack(webrtc.DefaultPayloadTypeVP8, 1234, "video", "stream")
//	//	peerConnection.AddTrack(track)
//	//
//	//	peerConnection.SetRemoteDescription(req.Offer)
//	//	answer, _ := peerConnection.CreateAnswer(nil)
//	//	peerConnection.SetLocalDescription(answer)
//	//
//	//	json.NewEncoder(w).Encode(map[string]webrtc.SessionDescription{"answer": answer})
//	conn, err := upgrader.Upgrade(w, r, nil)
//	if err != nil {
//		log.Println("Failed to upgrade WebSocket:", err)
//		return
//	}
//	defer conn.Close()
//
//	for {
//		messageType, p, err := conn.ReadMessage()
//		if err != nil {
//			log.Println("Failed to read message:", err)
//			break
//		}
//
//		// Process WebRTC signaling (SDP, ICE candidates, etc.)
//		// Send response or broadcast to all connected clients
//		err = conn.WriteMessage(messageType, p)
//		if err != nil {
//			log.Println("Failed to send message:", err)
//		}
//	}
//}
//
//func main() {
//	http.HandleFunc("/webrtc", handleWebRTCSignal)
//	log.Fatal(http.ListenAndServe(":8082", nil)) // WebSocket server on port 8082
//}
