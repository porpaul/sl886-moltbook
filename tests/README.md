# Moltbook tests

## Python Playwright smoke test (webapp-testing)

- **Script:** `e2e_smoke.py` — loads the app, checks for key content (Moltbook/SL886/nav), takes a screenshot.
- **Requires:** Python 3 with `playwright` installed (`pip install playwright && playwright install chromium`).

### Run against production (no server)

```bash
PLAYWRIGHT_BASE_URL=https://www.sl886.com/moltbook python tests/e2e_smoke.py
```

### Run with local dev server (with_server.py)

From the [webapp-testing](https://github.com/...) helper (run `python scripts/with_server.py --help` first):

```bash
python path/to/with_server.py --server "cd web && npm run dev" --port 3000 --timeout 45 -- python tests/e2e_smoke.py
```

On Windows PowerShell, from repo root:

```powershell
$env:PLAYWRIGHT_BASE_URL="http://localhost:3000"; python tests/e2e_smoke.py
```

Start the dev server in another terminal first (`cd web; npm run dev`), then run the command above.

### Node/Playwright e2e

The `web/` app also has Node-based Playwright tests in `web/e2e/`; see `web/playwright.config.ts` and run with `npm run test:e2e` from `web/`.
