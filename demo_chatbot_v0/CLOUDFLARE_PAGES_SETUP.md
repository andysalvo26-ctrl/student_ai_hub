# Cloudflare Pages Setup for Student AI Hub Chatbot Widget

## What I Changed

### Files Modified

1. **`demo_chatbot_v0/dist/index.html`** (NEW)
   - Created by copying `hub-demo-chatbot.html`
   - Required for Cloudflare Pages to serve the widget at root URL (`/`)

2. **`demo_chatbot_v0/scripts/build.js`**
   - Added automatic creation of `index.html` after building `hub-demo-chatbot.html`
   - Ensures `index.html` is always generated on build

### Files Created

- `demo_chatbot_v0/dist/index.html` - Copy of `hub-demo-chatbot.html` for Pages root

## Asset Analysis

**Findings:**
- ✅ `hub-demo-chatbot.html` is **self-contained** (all CSS and JS embedded inline)
- ✅ No external asset references (no `<script src>` or `<link href>` tags)
- ✅ Dataset is embedded inline in the HTML (not loaded from external JSON)
- ✅ Worker endpoint URL is hardcoded: `https://student-ai-hub-site-guide-preview.ajs10845.workers.dev`

**Conclusion:** No asset path changes needed. All assets are embedded in the HTML file.

## Cloudflare Pages Settings

Use these exact settings in the Cloudflare Pages dashboard:

```
Framework preset:
  None (or "Static Site")

Build command:
  cd demo_chatbot_v0 && node scripts/build.js

Build output directory:
  demo_chatbot_v0/dist

Root directory:
  (leave blank, or set to: demo_chatbot_v0)

Environment variables:
  (none required)
```

## Build Process

The build script (`scripts/build.js`):
1. Scans `demo_corpus/pages/` for markdown files
2. Chunks content and creates `dataset.json`
3. Embeds dataset and stopwords into HTML
4. Generates `hub-demo-chatbot.html`
5. **Now also creates `index.html`** (for Cloudflare Pages)

## Verification

After deployment, verify:
1. ✅ Visiting `https://your-pages-url.pages.dev/` loads the widget
2. ✅ Widget can call Worker endpoint (check browser console for `[WORKER_ERROR_...]` logs)
3. ✅ No 404 errors for missing assets
4. ✅ Widget functions correctly (ask "What is this site?")

## Notes

- The widget is completely self-contained - no external dependencies
- Worker endpoint is hardcoded in `widget.js` (embedded in HTML)
- All CSS and JavaScript are inline - no separate asset files
- Dataset is embedded in HTML - no external JSON loading
- Build command must run from `demo_chatbot_v0/` directory
