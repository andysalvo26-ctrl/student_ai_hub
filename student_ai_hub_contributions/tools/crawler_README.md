# Student AI Hub Crawler

A simple Playwright-based crawler for extracting readable text from the Student AI Hub Wix site.

## Requirements

- Python 3.9+
- Playwright

## Setup

```bash
pip install playwright
playwright install chromium
```

## Usage

```bash
cd student_ai_hub_contributions/crawl_ai_hub
python crawl_wix_playwright.py
```

## Outputs

- `outputs/pages/*.md` — One markdown file per crawled page
- `outputs/corpus.md` — All pages concatenated
- `outputs/manifest.json` — Metadata about the crawl (URLs, slugs, char counts, timestamps)

## Notes

- The crawler uses a simple heuristic to extract main content and strip navigation/footer elements.
- Wix sites render dynamically, so the crawler waits for `networkidle` before extracting text.
