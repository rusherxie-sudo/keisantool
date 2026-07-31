#!/usr/bin/env python3
"""IndexNow へ URL をまとめて送信する（Bing/Yandex/Seznam 等に一括反映）。
デフォルトでは dist/sitemap-0.xml の全URLを送る。特定URLだけ送りたい場合は引数で渡す。

使い方:
  python3 scripts/indexnow-submit.py                  # sitemap全件
  python3 scripts/indexnow-submit.py https://keisantool.com/foo/ https://keisantool.com/bar/
"""
import json
import re
import sys
import urllib.request
from pathlib import Path

HOST = "keisantool.com"
KEY = "bdddcbdf5763d849cfc0e7486c209c24"
KEY_LOCATION = f"https://{HOST}/{KEY}.txt"
ENDPOINT = "https://api.indexnow.org/indexnow"
SITEMAP = Path(__file__).resolve().parent.parent / "dist" / "sitemap-0.xml"


def urls_from_sitemap():
    xml = SITEMAP.read_text(encoding="utf-8")
    return re.findall(r"<loc>([^<]+)</loc>", xml)


def submit(url_list):
    payload = {
        "host": HOST,
        "key": KEY,
        "keyLocation": KEY_LOCATION,
        "urlList": url_list,
    }
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        ENDPOINT, data=data, headers={"Content-Type": "application/json; charset=utf-8"}
    )
    try:
        with urllib.request.urlopen(req) as resp:
            print(f"status={resp.status} ({len(url_list)} URLs submitted)")
    except urllib.error.HTTPError as e:
        print(f"status={e.code} body={e.read().decode('utf-8', 'ignore')}")


if __name__ == "__main__":
    urls = sys.argv[1:] if len(sys.argv) > 1 else urls_from_sitemap()
    print(f"submitting {len(urls)} URLs to {ENDPOINT} ...")
    submit(urls)
