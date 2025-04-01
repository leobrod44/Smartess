
create_concat () {
# Using concat.txt
# Step 1: Create concat.txt if it doesn't exist, or clear it if it does
[ -f concat.txt ] && > concat.txt || touch concat.txt

# Step 2: Fill concat.txt based on segment files in segments.m3u8
grep -E "^segment-[0-9]{3}\.mp4$" segments.m3u8 | while read -r line; do
    echo "file '$line'" >> concat.txt
done
}

# CONFIG V1
ffmpeg -re -rtsp_transport tcp -i rtsp://tapoadmin2:tapoadmin2@192.168.2.187:554/stream1 -buffer_size 2048000 -probesize 100M -analyzeduration 20000000 -avoid_negative_ts make_zero -c:v libx264 -preset fast -crf 23 -r 15 -vf "fps=15" -g 15 -c:a aac -b:a 64k -f segment -segment_time 10 -segment_format mp4 -reset_timestamps 1 -segment_list segments.m3u8 -segment_list_type m3u8 segment-%03d.mp4
create_concat
ffmpeg -f concat -safe 0 -i concat.txt -c:v libx264 -preset fast -crf 23 -r 15 -vf "fps=15" -g 15 -c:a aac -b:a 64k output.mp4
#ffmpeg -f concat -safe 0 -i concat.txt -fflags +genpts -c:v copy -c:a copy output.mp4 #Faster encoding, less smooth?

# CONFIG V2
ffmpeg -rtsp_transport tcp -i rtsp://tapoadmin2:tapoadmin2@192.168.2.187:554/stream1 -buffer_size 2048000 -probesize 100M -analyzeduration 20000000 -avoid_negative_ts make_zero -c:v libx264 -preset medium -crf 23 -vf "fps=15" -c:a libvorbis -f segment -segment_time 10 -segment_format mp4 -reset_timestamps 1 -segment_list segments.m3u8 -segment_list_type m3u8 segment-%03d.mp4
create_concat
ffmpeg -f concat -safe 0 -i concat.txt -c:v libx264 -preset medium -crf 23 -vf "fps=15" -c:a libvorbis output.mp4
#ffmpeg -f concat -safe 0 -i concat.txt -fflags +genpts -c:v copy -c:a copy output.mp4 #Faster encoding, less smooth?

#CONFIG V3
#ffmpeg -rtsp_transport tcp -i rtsp://tapoadmin2:tapoadmin2@192.168.2.187:554/stream1 -buffer_size 2048000 -probesize 100M -analyzeduration 20000000 -t 60 test_direct.mkv
ffmpeg -rtsp_transport tcp -i rtsp://tapoadmin2:tapoadmin2@192.168.2.187:554/stream1 -buffer_size 2048000 -probesize 100M -analyzeduration 20000000 -vf "fps=15,showinfo,vfrdet" -t 60 -f matroska test.mkv #2> diagnostic.log
