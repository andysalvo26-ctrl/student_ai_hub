# Wix Site Snapshot Rig

This rig captures a Wix site “verbatim enough” for analysis by recording the fully rendered DOM, full-page screenshots, and network truth (HAR). It is designed to be resilient on Wix pages that never truly go idle.

## What “Verbatim Enough” Means

We cannot export Wix’s internal builder source. For this rig, “verbatim enough” means:
1. The **fully rendered DOM after hydration** (`page.html`).
2. A **full-page screenshot** (`screenshot.png`).
3. **Network truth** via HAR (`run.har` or `page.har`, depending on config).
4. A stitched `bundle.md` so Codex can read the site as a single, deterministic artifact.

## Copy/Paste Commands

```bash
cd snapshots/rig
npm install --no-fund --no-audit
npx playwright install chromium
npm run snapshot:check
npm run snapshot
```

## Input Modes (Links-Only or Sitemap)

By default this rig will use `snapshots/rig/links.txt` if it contains at least one URL.
If `links.txt` is empty, it falls back to the sitemap configured in `config.json`.

To use links-only input, paste one absolute URL per line in:
`snapshots/rig/links.txt`

## What Gets Produced

Each run creates: `snapshots/runs/YYYY-MM-DD_HH-mm-ss/`.

Inside each run:
- `pages/<slug>/page.html` final rendered HTML after Wix hydration
- `pages/<slug>/page.txt` extracted readable text with headings preserved
- `pages/<slug>/screenshot.png` full-page screenshot
- `pages/<slug>/capture.json` per-page capture metadata
- `pages/<slug>/site_container.html` (optional) outerHTML of Wix container
- `pages/<slug>/page.mhtml` (optional, only if enabled)
- `run.har` (default) or `pages/<slug>/page.har` (if per-page HAR mode)
- `index.json` capture index with URLs, slugs, file pointers, confidence, and errors
- `bundle.md` stitched snapshot (Codex should read this first)
- `summary.txt` quick run summary with failures and low-confidence pages
- `snapshot_audit.md` institutional audit summary based on captured artifacts

## Readiness + Confidence

Wix never truly reaches `networkidle`, so readiness uses multi-signal gating:
- DOMContentLoaded
- Wix container selector present (`#SITE_CONTAINER`, `[data-testid='site-root']`, or `main`)
- Stability check (scrollHeight + innerText length stable across frames)
- Optional font readiness (if supported)

**Capture Confidence** is computed per page:
- **High**: selector found + stability reached
- **Medium**: only one of those signals
- **Low**: neither signal or capture failed
- Missing main content (very low word count) will degrade confidence

Confidence and reasons are recorded in both `bundle.md` and `summary.txt`.

## Troubleshooting Wix Quirks

If a page still looks incomplete:
- Increase `crawl.timeoutMs` or `crawl.hydrationWaitMs` in `config.json`.
- Increase `readiness.stability.delayMs` or `tolerance`.
- Temporarily disable `blocking.enabled` if critical content is served by blocked domains.
- Switch `har.mode` to `perPage` if you want isolated HARs per page.

## Member-Only Pages Later (Cookie Auth Hook)

When member-only pages are introduced, extend this rig without rewriting the crawler:
- Set `auth.enabled` to `true` in `config.json`.
- Load cookies from `auth.cookieFilePath` into the Playwright context before crawling.
- Optionally add a headed “auth capture” command later to generate cookies once.

Auth is intentionally **not** implemented now.

## What to Send to Codex for Analysis

- `snapshots/runs/<timestamp>/bundle.md` (primary)
- `snapshots/runs/<timestamp>/snapshot_audit.md` (institutional audit)
- Optional: `snapshots/runs/<timestamp>/index.json`
- Optional: `snapshots/runs/<timestamp>/summary.txt`
- Optional: screenshots and HAR paths referenced inside `bundle.md`
