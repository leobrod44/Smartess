# Use a Go base image
FROM golang:1.23.2-alpine

# Set the working directory
WORKDIR /app

# Copy the consumer Go application code into the container
COPY . .

# Install dependencies
RUN go mod tidy

# Expose the port for WebSocket server (Frontend will connect to this)
EXPOSE 8082
#
## Run the consumer Go application
#CMD ["go", "run", "main.go"]
#WORKDIR /root/
#COPY --from=builder /app/main .

CMD ["./main"]