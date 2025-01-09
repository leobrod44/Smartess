package main

import (
	"fmt"
	"os"
)

func main() {
	fmt.Println("Testing CI setup")

	// Unused variable
	unusedVar := 42

	// Inefficient assignment
	var x int
	x = 1

	// Error not checked
	file, _ := os.Open("nonexistentfile.txt")
	defer file.Close()

	// Formatting issue
	fmt.Println("This line has a formatting issue")
}
