import importlib.util, json, tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('sync', ROOT/'scripts'/'sync_note_rss.py')
sync = importlib.util.module_from_spec(spec); spec.loader.exec_module(sync)

def test_variable_article_count():
    base = [{
        'id': i, 'title': f'old{i}', 'category': 'series',
        'cover': f'https://assets.st-note.com/x{i}.png',
        'url': f'https://note.com/rapasai_lab/n/n{i:012d}',
        'recommendation': '', 'published_at': '2026-10-01', 'series_order': i
    } for i in range(1, 31)]
    # Only newest item is in RSS. Older 29 must be preserved rather than failing.
    u = sync.canonical(base[-1]['url'])
    feed = {u: {'title':'new30','published_at':'2026-10-19','cover':'https://assets.st-note.com/new.png'}}
    out, report, failures = sync.build_sync(base, feed, live_images=False)
    assert not failures
    assert len(out) == 30
    assert out[-1]['title'] == 'new30'
    assert report[0]['status'] == 'PRESERVED_NOT_IN_RSS'

def test_pending_article_not_in_rss_fails_without_overwrite():
    base=[{'id':1,'title':'','category':'series','cover':'','url':'https://note.com/rapasai_lab/n/n123456789abc','recommendation':'','published_at':'','series_order':1}]
    out, report, failures = sync.build_sync(base, {}, live_images=False)
    assert failures
    assert out == base
    assert report[0]['status'] == 'FAIL'
