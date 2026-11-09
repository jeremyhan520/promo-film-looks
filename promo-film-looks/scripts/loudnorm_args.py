"""Read ffmpeg loudnorm print_format=json output on stdin, print the measured_* args for the second (linear) pass.
Prints SILENT when the track has no measurable loudness (no VO / SFX mounted yet); master.sh then skips loudnorm."""
import json, sys

t = sys.stdin.read()
d = json.loads(t[t.rindex('{'):t.rindex('}') + 1])
if 'inf' in str(d['input_i']):
    print('SILENT')
else:
    print(f"measured_I={d['input_i']}:measured_TP={d['input_tp']}:measured_LRA={d['input_lra']}:measured_thresh={d['input_thresh']}:offset={d['target_offset']}")
