# Use a Go base image
FROM golang:1.23.2-alpine AS builder

# Set the working directory
WORKDIR /app

COPY ../go.mod ../go.sum ./

RUN go mod download

# Copy the consumer Go application code into the container
COPY . .

# Install dependencies and build the Go application
RUN go mod tidy

#./cmd/hub_camera_only/consumer/main.go
RUN go build -o main ./consumer/main.go && ls -lah

FROM alpine:latest
WORKDIR /root/
COPY --from=builder /app/main .

# Expose the port for WebSocket server (Frontend will connect to this)
EXPOSE 8082
#
## Run the consumer Go application
#CMD ["go", "run", "main.go"]
#WORKDIR /root/
#COPY --from=builder /app/main .

CMD ["./main"]