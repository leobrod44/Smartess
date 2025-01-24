FROM ubuntu:latest

# Install dependencies
RUN apt-get update && apt-get install -y ffmpeg wget && rm -rf /var/lib/apt/lists/*

# Download and install MediaMTX
RUN wget -q -O /mediamtx.tar.gz https://github.com/bluenviron/mediamtx/releases/latest/download/mediamtx_v1.11.1_linux_arm64v8.tar.gz && \
    tar -xzf /mediamtx.tar.gz && \
    mv mediamtx /usr/local/bin/mediamtx && \
    rm /mediamtx.tar.gz

# Copy the video file
COPY bunnies.mp4 /bunnies.mp4

# Start both RTSP server and ffmpeg using a script
COPY start_mock_camera.sh /start_mock_camera.sh
RUN chmod +x /start_mock_camera.sh

# Expose RTSP port
EXPOSE 8554

# Run the startup script
CMD ["/start_mock_camera.sh"]
