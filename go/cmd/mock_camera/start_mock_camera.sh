#!/bin/bash

# Start MediaMTX in the background
mediamtx &

# Wait for the RTSP server to be ready
sleep 3

# Start ffmpeg to stream the video to MediaMTX
ffmpeg -re -stream_loop -1 -i /motionTest.mp4 \
    -c:v libx264 -pix_fmt yuv420p \
    -f rtsp rtsp://mock_camera:8554/live
