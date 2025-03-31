package main

import (
	"Smartess/go/hub/ha"
	"encoding/json"
	"log"
	"math/rand"
	"net/http"
	"os"
	"time"

	"github.com/gorilla/websocket"
	"gopkg.in/yaml.v3"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func mockHub(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Failed to upgrade connection:", err)
		return
	}
	defer conn.Close()

	for {
		event := GenerateEventMessage()

		log.Println("Sending event message")
		message, _ := json.Marshal(event)
		err = conn.WriteMessage(websocket.TextMessage, message)
		if err != nil {
			log.Println("Failed to send message:", err)
			return
		}
		time.Sleep(10 * time.Minute) //TODO: Usually 5 second, Temporary to test video stream and other hub features without generating alerts too much
	}
}

func main() {
	http.HandleFunc("/api/websocket", mockHub)
	log.Println("Mock hub running on :8765")
	log.Fatal(http.ListenAndServe(":8765", nil))
}

type EventsWrapper struct {
	Events []ha.WebhookMessage `yaml:"events"`
}

func GenerateEventMessage() ha.WebhookMessage {

	dir := "/app/config/mockhub/mock-events.yaml"
	data, err := os.ReadFile(dir)
	if err != nil {
		panic(err)
	}

	var eventsWrapper EventsWrapper
	err = yaml.Unmarshal(data, &eventsWrapper)
	if err != nil {
		panic(err)
	}

	rand.Seed(time.Now().UnixNano())

	randomEvent := eventsWrapper.Events[rand.Intn(len(eventsWrapper.Events))]

	//override TimeFired with the current time
	randomEvent.Event.TimeFired = time.Now().Format(time.RFC3339)

	return randomEvent
}
