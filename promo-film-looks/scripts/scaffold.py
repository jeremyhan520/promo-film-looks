"""Create a new promo-film project from the bundled template.

usage: python scaffold.py <target_dir> [--node-modules <existing node_modules to link>]

Copies template/ (engine, demo scene, configs, placeholder images), the bundled fonts, Palatino from the system
fonts when present (aurum Latin type and the glass formula chips), and the render scripts. Then: npm install
(or --node-modules to junction an existing install), npx tsc --noEmit -p ., and render stills with qa.sh.
"""
import os, shutil, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
SKILL = os.path.dirname(HERE)


def main():
    args = sys.argv[1:]
    if not args:
        sys.exit(__doc__)
    target = os.path.abspath(args[0])
    nm = args[args.index('--node-modules') + 1] if '--node-modules' in args else None
    if os.path.exists(target) and os.listdir(target):
        sys.exit(f'{target} is not empty; pick a new folder')
    shutil.copytree(os.path.join(SKILL, 'template'), target, dirs_exist_ok=True)
    fonts = os.path.join(target, 'public', 'fonts')
    os.makedirs(fonts, exist_ok=True)
    src_fonts = [f for f in os.listdir(os.path.join(SKILL, 'assets', 'fonts')) if f.lower().endswith(('.ttf', '.otf', '.woff', '.woff2'))]
    for f in src_fonts:
        shutil.copy2(os.path.join(SKILL, 'assets', 'fonts', f), fonts)
    if len(src_fonts) < 6:
        print(f'note: {len(src_fonts)} font files found; see assets/fonts/README.md for the full list and where to get them')
    # Palatino is a system font (not redistributed with the skill): copy this machine's copy if it has one
    found = 0
    for src, dst in {'pala.ttf': 'Palatino.ttf', 'palai.ttf': 'Palatino-Italic.ttf', 'palab.ttf': 'Palatino-Bold.ttf'}.items():
        p = os.path.join(os.environ.get('WINDIR', r'C:\Windows'), 'Fonts', src)
        if os.path.exists(p):
            shutil.copy2(p, os.path.join(fonts, dst))
            found += 1
    if not found:
        print('note: Palatino not found; aurum Latin type and formula chips fall back to Georgia')
    for f in ('master.sh', 'qa.sh', 'segment.sh', 'verify.sh', 'loudnorm_args.py', 'boundary_check.py'):
        shutil.copy2(os.path.join(HERE, f), target)
    os.makedirs(os.path.join(target, 'out', 'qa'), exist_ok=True)
    if nm:
        link = os.path.join(target, 'node_modules')
        if os.name == 'nt':
            subprocess.run(['cmd', '/c', 'mklink', '/J', link, os.path.abspath(nm)], check=True, capture_output=True)
        else:
            os.symlink(os.path.abspath(nm), link)
    print(f'created {target}')
    print('next: ' + ('' if nm else 'npm install && ') + 'npx tsc --noEmit -p . && PROPS=glass.json bash qa.sh demo 30 140 250 330 470')


if __name__ == '__main__':
    main()
