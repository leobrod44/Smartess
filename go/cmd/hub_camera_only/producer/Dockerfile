# Use a Go base image
FROM golang:1.23.2-alpine

# Set the working directory
WORKDIR /app
RUN apk add --no-cache build-base


#COPY ../../../go.mod ../../../go.sum ./
COPY ../go.mod ../go.sum ./



# Copy the producer Go application code into the container
COPY . .

# Install dependencies
RUN go mod tidy

# Install FFmpeg (required to process the RTSP stream)
RUN apk add --no-cache ffmpeg

## Expose the port (for testing, if needed)
#EXPOSE 8080

#WORKDIR /root/
#COPY --from=builder /app/main .

CMD ["./main"]
## Run the producer Go application
#CMD ["go", "run", "main.go"]
