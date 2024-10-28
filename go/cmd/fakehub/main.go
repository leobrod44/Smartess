package main

import (
	"Smartess/go/fakehub"
)

func main() {
	fakehub, err := fakehub.Init()
	if err != nil {
		panic(err)
	}
	fakehub.Start()
	defer fakehub.Close()
}
