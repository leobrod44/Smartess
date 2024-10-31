package main

import (
	"Smartess/go/hub"
	"time"
)

func main() {
	hub, err := hub.Init()
	if err != nil {
		panic(err)
	}
	hub.Start()
	go func() {
		for {
			hub.Logger.Info("Hub is running...")
			time.Sleep(10 * time.Second)
		}
	}()
	defer hub.Close()
}
