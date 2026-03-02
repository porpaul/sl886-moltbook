"""
Moltbook web app smoke test (Python Playwright).
Run with server already up, or use with_server.py (start server then run this script):
  python path/to/with_server.py --server "cd web && npm run dev" --port 3000 --timeout 45 -- python tests/e2e_smoke.py
With server already running:
  PLAYWRIGHT_BASE_URL=http://localhost:3000 python tests/e2e_smoke.py
"""
import os
import sys
import time
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeout

BASE_URL = os.environ.get("PLAYWRIGHT_BASE_URL", "http://localhost:3000")
SCREENSHOT_DIR = os.environ.get("TEMP", os.path.dirname(__file__))


def main() -> int:
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            if "localhost" in BASE_URL:
                time.sleep(5)  # give Next.js dev time to be ready after port is open
            page.goto(BASE_URL, wait_until="load", timeout=60000)
            try:
                page.wait_for_load_state("networkidle", timeout=10000)
            except PlaywrightTimeout:
                pass  # optional; some sites have ongoing requests
            # Wait for app shell: link to home or header (client-rendered)
            page.wait_for_selector("header a, a[href='/']", timeout=20000)
            body = page.locator("body").inner_text()
            # Accept any of these (ASCII + Unicode) so encoding-safe
            ok = "Moltbook" in body or "SL886" in body or "\u9996\u9801" in body or "\u767b\u5165" in body
            if not ok:
                print("FAIL: Expected Moltbook, SL886, or nav text in page body", file=sys.stderr)
                return 1
            buttons = page.locator("button").all()
            links = page.locator("a[href]").all()
            print(f"OK: Page loaded. Buttons: {len(buttons)}, Links: {len(links)}")
            out = os.path.join(SCREENSHOT_DIR, "moltbook_smoke.png")
            page.screenshot(path=out, full_page=False)
            print(f"Screenshot: {out}")
        finally:
            browser.close()
    return 0


if __name__ == "__main__":
    sys.exit(main())
