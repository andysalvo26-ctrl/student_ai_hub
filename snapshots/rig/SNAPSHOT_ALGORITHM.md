# Wix Snapshot Algorithm (Verbatim-Enough)

This document describes the algorithmic design used by the snapshot rig. It is written to be implementation-ready and auditable.

## Core Idea

Capture a Wix site “verbatim enough” by combining:
- Fully rendered DOM after hydration
- Full-page screenshot
- Network truth (HAR)
- A stitched bundle plus a forensic audit report

The system is designed to be robust when Wix never reaches true network idle.

## Named Mechanisms

**1) URL Intake Gate (UIG)**
- Input source is either a links file or a sitemap.
- Links file wins if present and non-empty.
- Input is normalized, de-duplicated, and validated.

**2) Wix Hydration Readiness Gate (WHRG)**
A multi-signal readiness gate used after `DOMContentLoaded`:
- Selector presence: `#SITE_CONTAINER` or `[data-testid='site-root']` or `main`
- Layout stability: multiple frames with stable `scrollHeight` and `innerText.length`
- Font readiness: `document.fonts.ready` when supported
- If any signal fails, capture still proceeds with reduced confidence.

**3) DOM Stability Window (DSW)**
- A short burst of frame-by-frame checks.
- Declares stability when two consecutive checks are within tolerance.
- Designed to avoid infinite waits on Wix’s background activity.

**4) Verbatim Artifact Pack (VAP)**
Each page produces:
- `page.html` (rendered DOM)
- `page.txt` (readable text extraction)
- `screenshot.png` (full-page)
- `site_container.html` (optional Wix container outerHTML)
- `capture.json` (metadata)
- HAR (run-level or per-page)
- Optional `page.mhtml`

**5) Signal-Weighted Confidence Score (SWCS)**
Confidence is computed using:
- Readiness signals (selector + stability + fonts)
- Text signals (word count, heading count)
- Extraction artifacts ("top of page"/"bottom of page")
- Placeholder language detection
- Duplicate-line ratio

**6) Institutional Forensic Audit (IFA)**
- Produces `snapshot_audit.md` from captured artifacts only.
- Makes no assumptions about the live site.
- Flags incomplete, placeholder, or structurally degraded pages.

## Algorithm Outline (High Level)

1. Load input URLs via UIG.
2. For each URL, attempt capture up to N times with backoff.
3. Use WHRG + DSW to decide when to capture.
4. Save VAP artifacts per page.
5. Build index, bundle, summary, and audit report.
6. Output a deterministic run folder.

## Determinism Guarantees

- Sitemap order (or links file order) is preserved in the bundle.
- Each run folder is timestamped to avoid overwriting previous runs.
- Outputs are path-stable and referenced explicitly in the bundle.

## Why This Works for Wix

Wix pages often keep background connections open, so `networkidle` is not reliable. The WHRG + DSW combination gives a practical definition of “ready enough” without waiting forever, while still capturing hydrated content.
