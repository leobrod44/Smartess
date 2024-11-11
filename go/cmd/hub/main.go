package main

import (
	"Smartess/go/hub"
)

func main() {
	// pass in true to use the mock hub, false to use physical hub
	hub, err := hub.Init(true)
	if err != nil {
		panic(err)
	}
	hub.Start()
	defer hub.Close()
}
