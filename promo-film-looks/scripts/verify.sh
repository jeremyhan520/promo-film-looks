#!/bin/bash
# verify.sh <file.mp4>: streams, duration, frame count, full decode, loudness. Report these numbers to the user.
f="$1"
ffprobe -v error -show_entries stream=codec_name,width,height,r_frame_rate,sample_rate:format=duration,size -of default=nw=1 "$f"
echo "frames=$(ffprobe -v error -count_packets -select_streams v:0 -show_entries stream=nb_read_packets -of default=nw=1:nk=1 "$f")"
if ffmpeg -v error -i "$f" -f null -; then echo "decode=ok"; else echo "decode=FAILED"; fi
ffmpeg -hide_banner -i "$f" -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+(I:|LRA:|Peak:)"
