# RTSP Core logic for real-time rabbitmq Video streaming feature

> NB: Below, are commands to run, only this works, not docker compose for reasons listed on repo

## References Wiki, documentation, etc...
- The video streaming feature itself as well as risk anaylsis and its future plan were presented during release 2 presentation. \
- For history of changes, see : https://github.com/leobrod44/Smartess/wiki/Meeting-Minutes
- For full wiki summarizing the feature and containing all the research/plans done: https://github.com/leobrod44/Smartess/wiki/Research-notes



## 1. start server
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

## 2. start video streaming
ffmpeg -f avfoundation -video_device_index 0 -framerate 30 -pixel_format yuyv422 -i "" \
 -c:v libx264 -preset veryfast -f rtsp rtsp://localhost:8554/live.stream

## 3. opt: view cam data
ffmpeg -i rtsp://localhost:8554/live.stream -c copy output.mp4

## early ideas and remarks on what to improve
right now, getting massive amounts of packets, we want to store some locally, maybe chunks, compressed, for a few minutes, and when an event occurs (maybe add motion detection pipeline)
we unpack recent, start intense processing and streaming as some sort of highlight, maybe add location based to prevent users triggering? unsure for now see research

Store video locally, when case of interest occurs, stream to rabbit

Add pipeline to wrap stream options for rabbitmq depending on case (real time, recorded bits on event consume, ml triggered stream, more research)
- magnet camera or vis on for grille
- for rest for now, see research wiki and docs
- 
## For hub, before rtsp: Raspberry Pi Hub Setup
See installation/ readme
