#!/bin/bash
# Stills for review: qa.sh <prefix> <frame> [frame...] -> out/qa/<prefix>_<frame>.png + out/qa/<prefix>_sheet.jpg (2 columns)
# env: PROPS=glass.json | aurum.json   COMP=<composition id, default PromoFilm>
p=$1; shift
mkdir -p out/qa
for f in "$@"; do
  npx remotion still src/index.ts ${COMP:-PromoFilm} out/qa/${p}_$f.png --frame=$f --log=error ${PROPS:+--props=$PROPS} >/dev/null 2>&1 || echo "fail $f"
done
python -I - "$p" "$@" <<'PY'
import sys
from PIL import Image
p = sys.argv[1]; fs = sys.argv[2:]
W, H = 960, 540; rows = (len(fs) + 1) // 2
s = Image.new('RGB', (2 * W, rows * H), (0, 0, 0))
for i, f in enumerate(fs):
    s.paste(Image.open(f'out/qa/{p}_{f}.png').convert('RGB').resize((W, H)), ((i % 2) * W, (i // 2) * H))
s.save(f'out/qa/{p}_sheet.jpg', quality=86)
print(f'out/qa/{p}_sheet.jpg')
PY
