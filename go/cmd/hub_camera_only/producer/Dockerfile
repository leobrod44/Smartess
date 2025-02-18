# Use a Go base image
FROM golang:1.23.2-alpine AS builder

# Set the working directory
WORKDIR /app

RUN apk add --no-cache build-base #ffmpeg netcat-openbsd


#COPY ../../../go.mod ../../../go.sum ./
COPY ../go.mod ../go.sum ./

RUN go mod download

# Copy the producer Go application code into the container
COPY . .

# Install dependencies and build the Go application
RUN go mod tidy
#./cmd/hub_camera_only/producer/main.go && ls -lah
RUN go build -o main ./producer/main.go && ls -lah

## Install FFmpeg (required to process the RTSP stream)
#RUN apk add --no-cache ffmpeg

## Expose the port (for testing, if needed)
#EXPOSE 8080

# Use a smaller image for the final stage
FROM alpine:latest

# Install ffmpeg and netcat (nc) in the final image
RUN apk add --no-cache ffmpeg netcat-openbsd

WORKDIR /root/
COPY --from=builder /app/main .

# Command to run the executable
CMD ["./main"]
## Run the producer Go application
#CMD ["go", "run", "main.go"]
