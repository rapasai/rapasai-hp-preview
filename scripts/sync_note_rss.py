#!/usr/bin/env python3
"""Sync official note RSS metadata into the existing curated article catalogue.

The website still controls categories, recommendations, and manual article inclusion.
Existing article titles, dates, and image URLs follow the live feed when available.
RSS outages never overwrite articles.json.
"""
import argparse
import json
import os
from datetime import datetime
from email.utils import parsedate_to_datetime
from pathlib import Path
from urllib.parse import urlsplit, urlunsplit
from urllib.request import Request, urlopen
import xml.etree.ElementTree as ET

FEED = 'https://note.com/rapasai_lab/rss'
NS_MEDIA = '{http://search.yahoo.com/mrss/}thumbnail'

def canonical(url):
    u = urlsplit((url or '').strip())
    if u.scheme != 'https' or u.netloc != 'note.com' or not u.path.startswith('/rapasai_lab/n/'):
        return ''
    return urlunsplit((u.scheme, u.netloc, u.path.rstrip('/'), '', ''))

def extract(xmlbytes):
    root = ET.fromstring(xmlbytes)
    items = root.findall('./channel/item')
    if not items:
        raise ValueError('RSSに記事がありません。更新しません')
    found = {}
    for item in items:
        url = canonical(item.findtext('link'))
        if not url:
            continue
        title = (item.findtext('title') or '').strip()
        raw_date = (item.findtext('pubDate') or '').strip()
        # media:thumbnail generally stores the URL in its url attribute, not text.
        media = item.find(NS_MEDIA)
        thumb = ((media.get('url') or media.text or '') if media is not None else '').strip()
        if not thumb:
            for elt in item:
                if elt.tag.rsplit('}', 1)[-1] in ('enclosure','content'):
                    candidate = (elt.get('url') or '').strip()
                    if candidate.startswith('https://') and any(ext in candidate.lower() for ext in ('.jpg','.jpeg','.png','.webp','image')):
                        thumb=candidate
                        break
        if not title or not raw_date:
            raise ValueError(f'RSS記事のタイトルまたは日付がありません: {url}')
        dt = parsedate_to_datetime(raw_date)
        if dt.tzinfo is None:
            raise ValueError(f'RSS記事の日付にタイムゾーンがありません: {url}')
        date = dt.astimezone(__import__('datetime').timezone(__import__('datetime').timedelta(hours=9))).date().isoformat()
        if thumb and not thumb.startswith('https://'):
            raise ValueError(f'画像URLが不正です: {url}')
        if url in found:
            raise ValueError(f'RSSの同一URLが重複: {url}')
        found[url] = {'title': title, 'date': date, 'cover': thumb}
    if not found:
        raise ValueError('RSSのURLを解釈できませんでした')
    return found

def sync(data, feed):
    if not isinstance(data, list) or not data:
        raise ValueError('記事データ形式が不正です')
    updated = []
    out = []
    for original in data:
        entry = dict(original)
        url = canonical(entry.get('url'))
        if not url:
            raise ValueError(f'記事URLが不正です: {entry.get("url")}')
        incoming = feed.get(url)
        if incoming:
            old = (entry.get('title'), entry.get('published_at'), entry.get('cover'))
            entry['title'] = incoming['title']
            entry['published_at'] = incoming['date']
            if incoming['cover']:
                entry['cover'] = incoming['cover']
            if old != (entry['title'], entry['published_at'], entry['cover']):
                updated.append(url)
        out.append(entry)
    # A new note article needs editorial category/POP approval before appearing in shelves.
    existing = {canonical(x['url']) for x in out}
    pending = [{'url': url, **info} for url, info in feed.items() if url not in existing]
    pending.sort(key=lambda x:(x['date'],x['url']),reverse=True)
    return out, updated, pending

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--rss-file', help='local XML fixture (testing only)')
    ap.add_argument('--articles', default='articles.json')
    ap.add_argument('--pending', default='note_pending_articles.json')
    args = ap.parse_args()
    if args.rss_file:
        xml = Path(args.rss_file).read_bytes()
    else:
        req = Request(FEED, headers={'User-Agent':'Mozilla/5.0 (compatible; RapasAILabBookshelfSync/1.0)', 'Accept':'application/rss+xml, application/xml, text/xml'})
        with urlopen(req, timeout=25) as res:
            content_type = res.headers.get('Content-Type','')
            if 'xml' not in content_type and 'rss' not in content_type:
                raise ValueError(f'RSSではない応答です: {content_type}')
            xml = res.read(3_000_001)
            if len(xml) > 3_000_000:
                raise ValueError('RSSがサイズ上限を超えています')
    feed = extract(xml)
    articles_path = Path(args.articles)
    original = json.loads(articles_path.read_text(encoding='utf-8'))
    updated_data, changed, pending = sync(original, feed)
    # Write only AFTER every validation passed.
    if updated_data != original:
        articles_path.write_text(json.dumps(updated_data, ensure_ascii=False, indent=2)+'\n',encoding='utf-8')
    Path(args.pending).write_text(json.dumps(pending, ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(f'RSS記事={len(feed)}, 既存記事={len(original)}, 更新記事={len(changed)}, 未登録記事={len(pending)}')
    for url in changed: print('UPDATED:', url)

if __name__ == '__main__':
    main()
