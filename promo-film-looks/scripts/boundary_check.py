"""boundary_check.py <segment.mp4> <master.mp4> <start_s> <len_s> <fps>
Compares the segment's first and last frames with the master at the same times. Mean abs diff < 3 = same picture
(compression noise only); larger means the splice point sits inside a shot that changed."""
import os, subprocess, sys, tempfile
from PIL import Image, ImageChops, ImageStat

seg, master, ss, length, fps = sys.argv[1], sys.argv[2], float(sys.argv[3]), float(sys.argv[4]), float(sys.argv[5])
tmp = tempfile.mkdtemp()


def grab(src, t, name):
    p = os.path.join(tmp, name)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{t:.4f}', '-i', src, '-frames:v', '1', p], check=True)
    return Image.open(p).convert('RGB')


for label, t in (('first', 0.0), ('last', length - 1 / fps)):
    a, b = grab(seg, t, 'a.png'), grab(master, ss + t, 'b.png')
    d = sum(ImageStat.Stat(ImageChops.difference(a, b)).mean) / 3
    print(f'{label} frame vs master: mean abs diff {d:.2f}', '(matches)' if d < 3 else '(DIFFERS: splice point is inside a changed shot)')
