#!/usr/bin/env python3
import pathlib, re
root = pathlib.Path('/home/kerry/programming/portfolio')
favicon = '<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'%3E%3Ctext y=\'.9em\' font-size=\'90\'%3E%F0%9F%8E%A7%3C/text%3E%3C/svg%3E" />'
files = ['pages/vibe-check.html', 'pages/apk-archeologist.html',
         'pages/costars.html', 'pages/multi-agent.html',
         'pages/vibe-machine.html', 'pages/portfolio.html']
for rel in files:
    p = root / rel
    s = p.read_text(encoding='utf-8')
    if 'rel="icon"' in s:
        print('already has favicon:', rel); continue
    new = re.sub(r'(<meta name="viewport"[^>]*/?>)', r'\1\n  ' + favicon, s, count=1)
    if new == s:
        print('NO MATCH:', rel); continue
    p.write_text(new, encoding='utf-8')
    print('updated', rel)
