#!/bin/bash
# Full render -> two-pass loudness master (-16 LUFS, -1.5 dBTP), audio fade matching the picture's end fade, then verify.
# env: PROPS=glass.json | aurum.json   COMP=PromoFilm   RENDER=out/render.mp4   OUT=out/<name>.mp4
set -e
RENDER=${RENDER:-out/render.mp4}
OUT=${OUT:-out/master.mp4}
npx remotion render src/index.ts ${COMP:-PromoFilm} "$RENDER" ${PROPS:+--props=$PROPS} --codec=h264 --crf=14 --audio-codec=mp3 --audio-bitrate=320k --enforce-audio-track --log=error
D=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$RENDER")
ST=$(python -c "print(round($D - 0.8, 3))")
M=$(ffmpeg -hide_banner -i "$RENDER" -vn -af "afade=t=out:st=$ST:d=0.8,loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json" -f null - 2>&1 | python "$(dirname "$0")/loudnorm_args.py")
if [ "$M" = "SILENT" ]; then AF="aresample=48000"; echo "note: silent soundtrack, loudnorm skipped"; else AF="afade=t=out:st=$ST:d=0.8,loudnorm=I=-16:TP=-1.5:LRA=11:linear=true:$M,aresample=48000"; fi
ffmpeg -v error -y -i "$RENDER" -map 0:v -map 0:a -c:v libx264 -preset slow -crf 17 -profile:v high -pix_fmt yuv420p \
  -colorspace bt709 -color_primaries bt709 -color_trc bt709 -movflags +faststart \
  -af "$AF" -c:a aac -b:a 320k "$OUT"
bash "$(dirname "$0")/verify.sh" "$OUT"
