"""Archive public source pages for this article; never access authenticated pages."""
import concurrent.futures
import datetime
import json
import sys
from pathlib import Path
import urllib.request
from html.parser import HTMLParser

class TextParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.parts = []
        self.skip = 0

    def handle_starttag(self, tag, attrs):
        if tag in ("script", "style"):
            self.skip += 1
        if tag in ("div", "p", "br", "tr", "h1", "h2", "li"):
            self.parts.append("\n")

    def handle_endtag(self, tag):
        if tag in ("script", "style"):
            self.skip = max(0, self.skip - 1)

    def handle_data(self, data):
        if not self.skip:
            self.parts.append(data)

SOURCES = {
    "v2ex-759583-p1": "https://www.v2ex.com/t/759583?p=1",
    "v2ex-759583-p2": "https://www.v2ex.com/t/759583?p=2",
    "v2ex-1241732-p1": "https://www.v2ex.com/t/1241732?p=1",
    "postgresql-everything": "https://www.raphaelbauer.com/posts/postgresql-everything",
    "kleppmann-locking": "https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html",
    "antirez-rebuttal": "https://antirez.com/news/101",
    "redis-locks": "https://redis.io/docs/latest/develop/clients/patterns/distributed-locks/",
}

SUPPORTING = {
    "contentful-search": "https://www.contentful.com/blog/contentful-faster-full-text-search/",
    "nginx-history": "https://mailman.nginx.org/pipermail/nginx/2008-May/004816.html",
    "linkedin-kafka-2011": "https://www.linkedin.com/blog/member/archive/open-source-linkedin-kafka",
    "linkedin-kafka-talk": "https://www.linkedin.com/blog/engineering/archive/come-linkedin-hear-talk-about-kafka-our-open-source-distributed-pub-sub-messaging-system",
    "solid-queue": "https://github.com/rails/solid_queue",
    "kafka-upgrade-41": "https://kafka.apache.org/41/getting-started/upgrade/",
    "kafka-introduction-41": "https://kafka.apache.org/41/getting-started/introduction/",
    "etcd-api-36": "https://etcd.io/docs/v3.6/learning/api_guarantees/",
    "etcd-why-36": "https://etcd.io/docs/v3.6/learning/why/",
}

def fetch(item):
    name, url = item
    folder = Path(__file__).parent / "sources"
    folder.mkdir(exist_ok=True)
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=45) as response:
            raw = response.read()
        parser = TextParser()
        parser.feed(raw.decode("utf-8", errors="replace"))
        body = "\n".join(line.strip() for line in "".join(parser.parts).splitlines() if line.strip())
        (folder / (name + ".html")).write_bytes(raw)
        (folder / (name + ".txt")).write_text(body, encoding="utf-8")
        return {"name": name, "url": url, "bytes": len(raw), "text_chars": len(body), "at": datetime.datetime.now(datetime.timezone.utc).isoformat()}
    except Exception as error:
        return {"name": name, "url": url, "error": str(error)}

if __name__ == "__main__":
    supporting = "--supporting" in sys.argv
    with concurrent.futures.ThreadPoolExecutor(max_workers=7) as pool:
        results = list(pool.map(fetch, (SUPPORTING if supporting else SOURCES).items()))
    manifest = "supporting-manifest.json" if supporting else "source-manifest.json"
    (Path(__file__).parent / manifest).write_text(json.dumps(results, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(results, ensure_ascii=False, indent=2))
