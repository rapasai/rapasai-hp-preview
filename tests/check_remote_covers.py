import json
import sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'scripts'))
from sync_note_rss import valid_cover_url
items=json.loads(Path('articles.json').read_text(encoding='utf-8'))
assert len(items)==22,len(items)
assert sorted(x['series_order'] for x in items if x['category']=='series')==list(range(11))
assert all((not x.get('cover')) or valid_cover_url(x['cover']) for x in items)
assert not Path('assets/covers').exists()
assert len({x['url'] for x in items})==len(items)
pending=[x for x in items if not x.get('cover')]
assert len(pending)<=1
if pending:
    assert pending[0]['id']==22
print('PASS: 22記事、連載0〜10回、ローカルcovers無し、第10回は自動同期待ち可')
