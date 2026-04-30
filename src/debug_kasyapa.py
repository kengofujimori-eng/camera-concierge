#!/usr/bin/env python3
"""
Kasyapa URL 検証デバッグスクリプト
実行: python3 debug_kasyapa.py
"""
import urllib.request, urllib.error

URLS = [
    'https://news.mapcamera.com/KASYAPA/sel50f14gm/',
    'https://news.mapcamera.com/KASYAPA/sel50f12gm/',
    'https://news.mapcamera.com/KASYAPA/sony-50-f12gm/',
    'https://news.mapcamera.com/KASYAPA/sel135f18gm/',
    'https://news.mapcamera.com/KASYAPA/sel2470gm2/',
]

HEADERS_VARIANTS = [
    ('最小UA', {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    }),
    ('ブラウザ風フルヘッダー', {
        'User-Agent':      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept':          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate',
        'Connection':      'keep-alive',
        'Referer':         'https://www.google.co.jp/',
    }),
    ('Referer=mapcamera', {
        'User-Agent':      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept':          'text/html,application/xhtml+xml,*/*',
        'Accept-Language': 'ja',
        'Referer':         'https://news.mapcamera.com/',
    }),
]

url = URLS[0]  # FE 50mm F1.4 GM（ユーザーが確認済みの有効URL）
print(f"テスト URL: {url}\n")

for label, headers in HEADERS_VARIANTS:
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=10) as r:
            body = r.read()
            print(f"✅ [{label}] HTTP {r.status}  ({len(body)} bytes)")
    except urllib.error.HTTPError as e:
        body_preview = e.read()[:200].decode('utf-8', errors='replace')
        print(f"❌ [{label}] HTTP {e.code} {e.reason}")
        print(f"   Body: {body_preview[:100]}")
    except Exception as e:
        print(f"❌ [{label}] {type(e).__name__}: {e}")

print()
print("HEAD テスト:")
try:
    req = urllib.request.Request(url, headers=HEADERS_VARIANTS[1][1], method='HEAD')
    with urllib.request.urlopen(req, timeout=10) as r:
        print(f"✅ HEAD HTTP {r.status}")
except urllib.error.HTTPError as e:
    print(f"❌ HEAD HTTP {e.code} {e.reason}")
except Exception as e:
    print(f"❌ HEAD {type(e).__name__}: {e}")
