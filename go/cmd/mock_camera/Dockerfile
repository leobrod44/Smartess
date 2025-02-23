FROM ubuntu:latest

# Install dependencies
RUN apt-get update && apt-get install -y ffmpeg wget && rm -rf /var/lib/apt/lists/*

##TODO: Install dependencies and cache them in a volume
#RUN mkdir -p /cache/apt && \
#    apt-get update && \
#    apt-get install -y --no-install-recommends \
#    ffmpeg \
#    wget && \
#    rm -rf /var/lib/apt/lists/*

# Set up volume for cache
VOLUME ["/cache/apt"]

# Download and install MediaMTX
RUN wget -q -O /mediamtx.tar.gz https://github.com/bluenviron/mediamtx/releases/latest/download/mediamtx_v1.11.3_linux_arm64v8.tar.gz && \
    tar -xzf /mediamtx.tar.gz && \
    mv mediamtx /usr/local/bin/mediamtx && \
    rm /mediamtx.tar.gz

# Copy the video file
COPY bunnies.mp4 /bunnies.mp4

# Start both RTSP server and ffmpeg using a script
COPY start_mock_camera.sh /start_mock_camera.sh
RUN chmod +x /start_mock_camera.sh

#TODO: "RUN sed -i 's/\r$//' start_mock_camera.sh"  to work on non-Unix systems
#TODO "RUN sudo ufw allow 8554" to allow RTSP port of mock camera

# Expose RTSP port
EXPOSE 8554

# Run the startup script
CMD ["/bin/sh", "/start_mock_camera.sh"]
