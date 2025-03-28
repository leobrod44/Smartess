
ffmpeg -i "rtsp://tapoadmin2:tapoadmin2@192.168.2.187:554/stream1" -rtsp_transport tcp -f null - -loglevel debug 2> timestamps.log

ffmpeg -i "rtsp://tapoadmin2:tapoadmin2@192.168.2.187:554/stream1" -rtsp_transport tcp -vf "fps=15,showinfo" -f null - 2> frames.log

ffmpeg -i "rtsp://tapoadmin2:tapoadmin2@192.168.2.187:554/stream1" -rtsp_transport tcp -vf "vfrdet" -f null - 2> vfr.log

ffmpeg -i "rtsp://tapoadmin2:tapoadmin2@192.168.2.187:554/stream1" -rtsp_transport tcp -vf "showinfo" -f null - 2> keyframes.log

ffmpeg -i "rtsp://tapoadmin2:tapoadmin2@192.168.2.187:554/stream1" -rtsp_transport tcp -buffer_size 2048000 -probesize 100M -analyzeduration 20000000 -f null - 2> stability.log


ffmpeg -i "rtsp://tapoadmin2:tapoadmin2@192.168.2.187:554/stream1" -rtsp_transport tcp -buffer_size 2048000 -probesize 100M -analyzeduration 20000000 -vf "fps=15,showinfo,vfrdet" -t 60 -f matroska test.mkv 2> diagnostic.log

#ffmpeg -re -rtsp_transport tcp -i "rtsp://tapoadmin2:tapoadmin2@192.168.2.187:554/stream1" -buffer_size 2048000 -probesize 100M -analyzeduration 20000000 -avoid_negative_ts make_zero -c:v libx264 -preset fast -crf 23 -r 15 -g 15 -vf "fps=15" -b:a 64k -f segment -segment_time 10 -segment_format mp4 -reset_timestamps 1 -segment_list segments.m3u8 -segment_list_type m3u8 segment-%03d.mp4