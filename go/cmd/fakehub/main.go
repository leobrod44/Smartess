package main

import (
	"log"
	"net/http"
	"time"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func main() {
	http.HandleFunc("/api/websocket", func(w http.ResponseWriter, r *http.Request) {
		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			log.Println("Upgrade error:", err)
			return
		}
		defer conn.Close()

		for {
			message := `{"event": "fake_event", "data": "This is a fake event"}`
			err = conn.WriteMessage(websocket.TextMessage, []byte(message))
			if err != nil {
				log.Println("Write error:", err)
				return
			}
			time.Sleep(5 * time.Second) // Send a message every 5 seconds
		}
	})

	log.Println("Fake hub server started on :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
