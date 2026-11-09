#!/bin/bash
# Replacement segment for a fix, without re-rendering the whole film.
# segment.sh <master.mp4> <first_frame> <last_frame> <out.mp4>
# Renders the frames with the current code, takes the audio for the same span from the master (loudness and SFX match
# exactly), encodes like master.sh, verifies, then compares the first and last frames with the master: choose a span
# that starts and ends where nothing changed, so the client can drop it straight onto the timeline.
# env: PROPS, COMP (default PromoFilm), FPS (default 25)
set -e
M="$1"; A=$2; B=$3; O="$4"; FPS=${FPS:-25}
HERE="$(dirname "$0")"
# not TMP: on Windows TMP is the exported temp-dir variable, and Node would start writing its temp files into the output path
RAW="out/_seg_${A}_${B}.mp4"
npx remotion render src/index.ts ${COMP:-PromoFilm} "$RAW" ${PROPS:+--props=$PROPS} --frames=$A-$B --codec=h264 --crf=14 --audio-codec=mp3 --log=error
SS=$(python -c "print($A / $FPS)")
LEN=$(python -c "print(($B - $A + 1) / $FPS)")
ffmpeg -v error -y -i "$RAW" -ss "$SS" -t "$LEN" -i "$M" -map 0:v -map 1:a -c:v libx264 -preset slow -crf 17 -profile:v high -pix_fmt yuv420p \
  -colorspace bt709 -color_primaries bt709 -color_trc bt709 -movflags +faststart -c:a aac -b:a 320k -ar 48000 -shortest "$O"
bash "$HERE/verify.sh" "$O"
python -I "$HERE/boundary_check.py" "$O" "$M" "$SS" "$LEN" "$FPS"
rm -f "$RAW"
python -c "s=$A/$FPS; print('timecode of first frame: %02d.%02d.%02d.%02d' % (s//3600, s%3600//60, s%60, $A%$FPS))"
