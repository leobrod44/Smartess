package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/streadway/amqp"
)

func main() {
	// Create a Gin router
	router := gin.Default()

	_, err := amqp.Dial("amqp://guest:guest@localhost:5672/")
	if err != nil {
		panic(err)
	}
	// Define a simple GET route
	router.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "Welcome to Gin Gonic!",
		})
	})

	// Define a route for handling POST requests
	router.POST("/submit", func(c *gin.Context) {
		name := c.PostForm("name")
		c.JSON(http.StatusOK, gin.H{
			"message": "Hello " + name,
		})
	})

	// Start the server on port 8080
	router.Run(":8080")
}
