# Full Page Screenshot Protocol

Purpose: capture a full-page PNG screenshot of any public webpage for layout and UX review.

## Assumptions

- Playwright and Chromium are already installed in `snapshots/rig`.
- If they are not installed, handle that setup separately in your own terminal workflow.

## Run a full-page screenshot (paste once)

```bash
cd /Users/andysalvo_1/Documents/GitHub/student_ai_hub/snapshots/rig
node --input-type=module <<'JS'
import { chromium } from "playwright";
import path from "path";
import fs from "fs/promises";

const url = "REPLACE_WITH_URL";
const outputPath = path.resolve(process.cwd(), "..", "visual_review", "screenshots", "REPLACE_WITH_FILENAME.png");

const viewport = { width: 1440, height: 900 };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport });

  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 120000 });
  await sleep(1200);

  await page.screenshot({ path: outputPath, fullPage: true });
  await browser.close();

  console.log("Saved:", outputPath);
})();
JS
```

## Notes

- `fullPage: true` captures the entire scroll height.
- Keep screenshots in `visual_review/screenshots/`.
- Use descriptive filenames that match the page slug.
