import json, subprocess, sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
required=[
 ROOT/'index.html', ROOT/'articles.json', ROOT/'CNAME', ROOT/'.nojekyll',
 ROOT/'scripts'/'sync_note_rss.py', ROOT/'.github'/'workflows'/'sync-note-rss.yml',
 ROOT/'README_RSS同期手順.txt'
]
missing=[str(p.relative_to(ROOT)) for p in required if not p.exists()]
if missing: raise SystemExit('FAIL missing: '+', '.join(missing))
if (ROOT/'assets'/'covers').exists(): raise SystemExit('FAIL assets/covers exists')
a=json.loads((ROOT/'articles.json').read_text(encoding='utf-8'))
if len(a)!=22: raise SystemExit(f'FAIL article count {len(a)}')
series=[x for x in a if x.get('category')=='series']
if sorted(x.get('series_order') for x in series)!=list(range(11)): raise SystemExit('FAIL series order')
if series[-1]['url']!='https://note.com/rapasai_lab/n/n1fc2989a6a7c': raise SystemExit('FAIL article10 URL')
workflow=(ROOT/'.github'/'workflows'/'sync-note-rss.yml').read_text(encoding='utf-8')
for token in ['push:', 'articles.json', 'workflow_dispatch:', 'schedule:', 'python scripts/sync_note_rss.py --write']:
    if token not in workflow: raise SystemExit('FAIL workflow token '+token)
script=(ROOT/'scripts'/'sync_note_rss.py').read_text(encoding='utf-8')
for forbidden in ['len(original) != 21','len(original) != 22','対象=21','対象=22']:
    if forbidden in script: raise SystemExit('FAIL fixed count '+forbidden)
idx=(ROOT/'index.html').read_text(encoding='utf-8')
if 'const ready=data.filter' not in idx: raise SystemExit('FAIL pending-safe index')
print('PASS: package validator')
