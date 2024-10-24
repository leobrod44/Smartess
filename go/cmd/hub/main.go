package main

import (
	"Smartess/go/hub"
)

func main() {
	hub, err := hub.Init()
	if err != nil {
		panic(err)
	}
	hub.Start()
	defer hub.Close()
}
