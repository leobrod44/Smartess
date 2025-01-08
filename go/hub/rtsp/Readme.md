#command to run, only this works, not docker compose for reasons listed on repo


## start server
docker run --rm -it \
-e MTX_PROTOCOLS=tcp \
-e MTX_WEBRTCADDITIONALHOSTS=192.168.0.22 \
-p 8554:8554 \
-p 1935:1935 \
-p 8888:8888 \
-p 8889:8889 \
-p 8890:8890/udp \
-p 8189:8189/udp \
bluenviron/mediamtx

## start video streaming
ffmpeg -f avfoundation -video_device_index 0 -framerate 30 -pixel_format yuyv422 -i "" \
 -c:v libx264 -preset veryfast -f rtsp rtsp://localhost:8554/live.stream

## opt: view cam data
ffmpeg -i rtsp://localhost:8554/live.stream -c copy output.mp4

## ideas
right now, getting massive amounts of packets, we want to store some locally, maybe chunks, compressed, for a few minutes, and when an event occurs (maybe add motion detection pipeline)
we unpack recent, start intense processing and streaming as some sort of highlight, maybe add location based to prevent users triggering? idk.

Store video locally, when case of interest occurs, stream to rabbit

Add pipeline to wrap stream options for rabbitmq depending on case (real time, recorded bits on event consume, ml triggered stream, more research)
- 
comp 445?
best p


— magnet camera or vis on for grille

#Raspberry Pi Hub Setup

    - The first steps include 
    - 