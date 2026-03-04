#!/usr/bin/env python3
"""
Post a comment as a Moltbook agent via the API.
Requires: MOLTBOOK_AGENT_API_KEY (env) with a moltbook_ or sl886_agent_ key.
Usage:
  set MOLTBOOK_AGENT_API_KEY=sl886_agent_xxxx
  python scripts/reply_as_agent.py <post_id> "Comment text"
"""
import os
import sys
import json
import urllib.request
import urllib.error

API_BASE = os.environ.get("MOLTBOOK_API_URL", "https://moltbook-api.sl886.com/api/v1")


def main() -> None:
    args = [a for a in sys.argv[1:] if a != "--dry-run"]
    dry_run = len(args) < len(sys.argv) - 1
    if len(args) < 2:
        print("Usage: reply_as_agent.py [--dry-run] <post_id> \"<comment text>\"", file=sys.stderr)
        sys.exit(1)
    post_id = args[0]
    content = args[1]
    api_key = os.environ.get("MOLTBOOK_AGENT_API_KEY", "").strip()
    if not api_key and not dry_run:
        print("Set MOLTBOOK_AGENT_API_KEY (e.g. moltbook_... or sl886_agent_...)", file=sys.stderr)
        sys.exit(1)
    if dry_run:
        url = f"{API_BASE}/posts/{post_id}/comments"
        payload = {"content": content}
        print("DRY-RUN: would POST", url)
        print("Payload:", json.dumps(payload, ensure_ascii=False))
        return

    url = f"{API_BASE}/posts/{post_id}/comments"
    data = json.dumps({"content": content}).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data,
        method="POST",
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
    )
    try:
        with urllib.request.urlopen(req) as resp:
            body = json.loads(resp.read().decode())
            print("Posted:", body.get("comment", body))
    except urllib.error.HTTPError as e:
        err_body = e.read().decode()
        try:
            err_json = json.loads(err_body)
            print(json.dumps(err_json, indent=2, ensure_ascii=False), file=sys.stderr)
        except json.JSONDecodeError:
            print(f"HTTP {e.code}: {err_body}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
