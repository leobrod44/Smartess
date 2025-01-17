# Use the official Go image
FROM golang:1.23.2-alpine AS builder
WORKDIR /app

# Install necessary build tools in the builder stage
RUN apk add --no-cache build-base

# Copy go.mod and go.sum files from the parent directory
COPY ../../go.mod ../../go.sum ./

# Download all dependencies
RUN go mod download

# Copy the entire application code from the current directory (cmd/hub)
COPY . .

# Build the Go app
RUN go build -o main ./cmd/hub/main.go

# Use a smaller image for the final stage
FROM alpine:latest

# Install ffmpeg and netcat (nc) in the final image
RUN apk add --no-cache ffmpeg netcat-openbsd

WORKDIR /root/
COPY --from=builder /app/main .

# Command to run the executable
CMD ["./main"]
