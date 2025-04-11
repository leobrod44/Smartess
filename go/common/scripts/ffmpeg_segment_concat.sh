sed -i '$a#EXT-X-ENDLIST' segments.m3u8
sed -i '1s/^/\xEF\xBB\xBF/' segments.m3u8
sed -i 's/\r$//' segments.m3u8
ffmpeg -f concat -safe 0 -i segments.m3u8 -c:v copy -c:a copy -map 0:v:0? -map 0:a:0? output.mp4
ffmpeg -f hls -i segments.m3u8 -c:v copy -c:a copy output.mp4

ffmpeg -f concat -safe 0 -i concat.txt -c:v libx264 -preset fast -r 15 -g 15 -vf "fps=15" -c:a aac -b:a 64k output2.mp4

# Using concat.txt
# Step 1: Create concat.txt if it doesn't exist, or clear it if it does
[ -f concat.txt ] && > concat.txt || touch concat.txt

# Step 2: Fill concat.txt based on segment files in segments.m3u8
grep -E "^segment-[0-9]{3}\.mp4$" segments.m3u8 | while read -r line; do
    echo "file '$line'" >> concat.txt
done

# Step 3: Compile the playlist using concat.txt with FFmpeg
ffmpeg -f concat -safe 0 -i concat.txt -c:v copy -c:a copy output.mp4
#ffmpeg -f concat -safe 0 -i concat.txt -c:v copy -c:a copy -map 0:v:0? -map 0:a:0? output.mp4

# Verify segments exist
ls -l segment-*.mp4

# Test first segment playback and codec compatibility
ffplay segment-000.mp4
ffprobe segment-000.mp4
ffprobe -v error -show_streams segment-000.mp4
ffprobe segment-000.mp4 -show_packets | grep pkt_dts_time

# Fix bad encoding by enforcing codec compatibility if copy failed
ffmpeg -i segments.m3u8 -c:v libx264 -c:a aac -r 15 -g 30 output.mp4

# Fix bad timestamps
ffmpeg -fflags +genpts -i segments.m3u8 -c:v copy -c:a copy output.mp4