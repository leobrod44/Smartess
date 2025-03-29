#!/bin/bash

## TODO Run this script inside the server container to debug the video streaming setup
## Copy the script into the server container
#docker cp debug-stream.sh server:/app/
#
## Enter the container
#docker exec -it server bash
#
## Run the script
#cd /app
#chmod +x debug-stream.sh
#./debug-stream.sh

## TODO Debug logs inside server docker
## Check server logs
#docker logs server
## Examine HLS segments
#docker exec -it server ls -la /tmp/data
## Look for errors in the video server log
#docker exec -it server cat /app/logs/server_video.log

#--------------------------------------------------------------------------
# This script helps debug your RTSP-to-browser video streaming setup
# Save this to a file named debug-stream.sh and run with: bash debug-stream.sh

# Colors for better readability
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}======= Smartess Video Stream Debugging Tool =======${NC}"

# Check if FFmpeg is installed
echo -e "${YELLOW}Checking for FFmpeg...${NC}"
if command -v ffmpeg &> /dev/null; then
    echo -e "${GREEN}FFmpeg is installed.${NC}"
    FFMPEG_VERSION=$(ffmpeg -version | head -n 1)
    echo -e "Version: $FFMPEG_VERSION"
else
    echo -e "${RED}FFmpeg is not installed. You will need FFmpeg for testing.${NC}"
    echo -e "Install with: apt-get install ffmpeg (Debian/Ubuntu) or your system's package manager."
    exit 1
fi

# Function to test accessing the HLS stream directly
test_hls_access() {
    local camera=$1
    local url="http://localhost:8080/hls/$camera/segments.m3u8"

    echo -e "\n${YELLOW}Testing HLS stream access for camera: $camera${NC}"
    echo -e "URL: $url"

    # Check if curl is available
    if command -v curl &> /dev/null; then
        HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" $url)
        if [ "$HTTP_CODE" == "200" ]; then
            echo -e "${GREEN}HLS playlist is accessible (HTTP 200 OK)${NC}"

            # Check playlist content
            echo -e "\nPlaylist content:"
            curl -s $url | head -n 10

            # Check if there are segment files
            SEGMENTS_DIR="/tmp/data/$camera"
            if [ -d "$SEGMENTS_DIR" ]; then
                SEGMENT_COUNT=$(ls $SEGMENTS_DIR/segment-*.ts 2>/dev/null | wc -l)
                if [ "$SEGMENT_COUNT" -gt 0 ]; then
                    echo -e "\n${GREEN}Found $SEGMENT_COUNT segment files in $SEGMENTS_DIR${NC}"
                    ls -lh $SEGMENTS_DIR/segment-*.ts | head -n 5
                else
                    echo -e "\n${RED}No segment files found in $SEGMENTS_DIR${NC}"
                fi
            else
                echo -e "\n${RED}Segment directory $SEGMENTS_DIR does not exist${NC}"
            fi
        else
            echo -e "${RED}HLS playlist is not accessible (HTTP $HTTP_CODE)${NC}"
        fi
    else
        echo -e "${RED}curl is not installed. Cannot test HLS access.${NC}"
    fi
}

# Function to test RTSP directly with FFmpeg
test_rtsp_direct() {
    local rtsp_url=$1
    local output_file="/tmp/rtsp_test_$(date +%s).mp4"

    echo -e "\n${YELLOW}Testing direct RTSP access with FFmpeg${NC}"
    echo -e "RTSP URL: $rtsp_url"
    echo -e "Will record 5 seconds to: $output_file"

    echo -e "Running FFmpeg..."
    ffmpeg -rtsp_transport tcp -i "$rtsp_url" -t 5 -c:v copy -an "$output_file" -loglevel warning

    if [ -f "$output_file" ]; then
        FILE_SIZE=$(du -h "$output_file" | cut -f1)
        echo -e "${GREEN}Recording successful. File size: $FILE_SIZE${NC}"
        echo -e "File saved to: $output_file"

        # Show file info
        echo -e "\nFile information:"
        ffprobe -v quiet -print_format json -show_format -show_streams "$output_file" | grep -E 'codec_name|width|height|r_frame_rate|duration'
    else
        echo -e "${RED}Recording failed. No output file created.${NC}"
    fi
}

# Function to test WebSocket connection
test_websocket() {
    local ws_url="ws://localhost:8080/ws"

    echo -e "\n${YELLOW}Testing WebSocket connection${NC}"
    echo -e "URL: $ws_url"

    # Check if websocat is installed
    if command -v websocat &> /dev/null; then
        echo -e "Connecting to WebSocket for 3 seconds..."
        timeout 3s websocat --binary $ws_url > /tmp/ws_test_$(date +%s).bin

        if [ $? -eq 124 ]; then  # timeout exit code
            echo -e "${GREEN}WebSocket connection successful (timed out after 3s as expected)${NC}"
        else
            echo -e "${RED}WebSocket connection failed${NC}"
        fi
    else
        echo -e "${RED}websocat is not installed. Cannot test WebSocket.${NC}"
        echo -e "Install with: cargo install websocat (requires Rust)"
    fi
}

# Function to check debug files
check_debug_files() {
    local debug_dir="/tmp/data/debug"

    echo -e "\n${YELLOW}Checking debug files${NC}"

    if [ -d "$debug_dir" ]; then
        FILE_COUNT=$(ls -1 $debug_dir | wc -l)
        if [ "$FILE_COUNT" -gt 0 ]; then
            echo -e "${GREEN}Found $FILE_COUNT files in debug directory${NC}"
            echo -e "\nRecent files:"
            ls -lht $debug_dir | head -n 5
        else
            echo -e "${RED}No files found in debug directory${NC}"
        fi
    else
        echo -e "${RED}Debug directory does not exist: $debug_dir${NC}"
    fi
}

# Main menu
while true; do
    echo -e "\n${BLUE}========== Debug Options ==========${NC}"
    echo "1) Test HLS access (specify camera name)"
    echo "2) Test RTSP directly with FFmpeg"
    echo "3) Test WebSocket connection"
    echo "4) Check debug files"
    echo "5) Exit"

    read -p "Enter choice [1-5]: " choice

    case $choice in
        1)
            read -p "Enter camera name (default if empty): " camera_name
            if [ -z "$camera_name" ]; then
                camera_name="default"
            fi
            test_hls_access "$camera_name"
            ;;
        2)
            read -p "Enter RTSP URL: " rtsp_url
            if [ -z "$rtsp_url" ]; then
                echo -e "${RED}RTSP URL cannot be empty${NC}"
            else
                test_rtsp_direct "$rtsp_url"
            fi
            ;;
        3)
            test_websocket
            ;;
        4)
            check_debug_files
            ;;
        5)
            echo -e "${BLUE}Exiting.${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}Invalid choice. Please try again.${NC}"
            ;;
    esac
done