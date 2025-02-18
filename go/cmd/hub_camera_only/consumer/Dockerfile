# Use a Go base image
FROM golang:1.23.2-alpine AS builder

# Set the working directory
WORKDIR /app

# Install dependencies, including GStreamer and WebRTC plugins
RUN apk update && apk add --no-cache \
    gstreamer \
    gstreamer1.0-plugins-good \
    gstreamer1.0-plugins-bad \
    gstreamer1.0-plugins-ugly \
    gstreamer1.0-tools \
    gstreamer1.0-libav \
    ffmpeg \
    bash \
    curl \
    && rm -rf /var/cache/apk/*

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

# Install GStreamer and WebRTC plugins in the final image
RUN apk add --no-cache \
    gstreamer \
    gstreamer1.0-plugins-good \
    gstreamer1.0-plugins-bad \
    gstreamer1.0-plugins-ugly \
    gstreamer1.0-tools \
    gstreamer1.0-libav \
    ffmpeg
# Expose the port for WebSocket or WebRTC or nonraw TCP server etc... (Frontend will connect to this)
EXPOSE 8082
#
## Run the consumer Go application
#CMD ["go", "run", "main.go"]
#WORKDIR /root/
#COPY --from=builder /app/main .

CMD ["./main"]