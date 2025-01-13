package main

import (
	"Smartess/go/common/structures"
	"Smartess/go/hub"
)

func main() {
	// Select between Local Host Hub, Physical HA RPI Hub and Mongo Atlas Hub
	SELECTED_HUB := structures.MONGO_MOCK_HUB

	hub, err := hub.Init(SELECTED_HUB)
	if err != nil {
		panic(err)
	}
	hub.Start(SELECTED_HUB)
}
