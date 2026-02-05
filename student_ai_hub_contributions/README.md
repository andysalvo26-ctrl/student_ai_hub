# AI News Contribution System

This folder contains the contribution system for "AI News That Matters" on the Student AI Hub.

---

## deliverables/

**What you send to people.**

| File | Send To | Purpose |
|------|---------|---------|
| `system_overview.pdf` | Exec board, editors | How the system works |
| `ai_news_contribution_guide.pdf` | Contributors | How to submit an entry |
| `google_form_spec.md` | Yourself | Instructions to build the Google Form |

---

## source/

**Markdown files that generate the PDFs.**

| File | Generates |
|------|-----------|
| `system_overview.md` | system_overview.pdf |
| `ai_news_contribution_guide_FINAL.md` | ai_news_contribution_guide.pdf |
| `contribution_guide.md` | Guide text (before the example) |
| `ai_news_example_entry.md` | Sample entry in the guide |
| `article_source.md` | AP News article used for the sample |

---

## voice/

**Writing style references.**

| File | Purpose |
|------|---------|
| `voice_primer.md` | Do/Avoid list + examples for Hub writing |
| `corpus_selected.md` | Sample paragraphs demonstrating the voice |

---

## tools/

**Crawler scripts.**

| File | Purpose |
|------|---------|
| `crawl_wix_playwright.py` | Playwright script to crawl the Wix site |
| `INPUT_URLS.txt` | URLs to crawl |

---

## crawl_outputs/

**Crawled content from the Student AI Hub site.**

- `corpus.md` — Full concatenated text
- `manifest.json` — Crawl metadata
- `pages/*.md` — Individual page files (13 pages)

---

## legacy/

**Old versions kept for reference.**

- `specs/contributor_workflow_spec.md` — Over-engineered workflow (not used)
- `specs/google_form_spec_complex.md` — Complex form spec (replaced by simpler version)
- `drafts/*` — Earlier draft versions

---

## Regenerate PDFs

```bash
cd source

pandoc system_overview.md -o ../deliverables/system_overview.pdf \
  --pdf-engine=pdflatex -V geometry:margin=1in -V fontsize=11pt \
  -V 'header-includes=\usepackage{parskip}'

pandoc ai_news_contribution_guide_FINAL.md -o ../deliverables/ai_news_contribution_guide.pdf \
  --pdf-engine=pdflatex -V geometry:margin=1in -V fontsize=11pt \
  -V 'header-includes=\usepackage{parskip}'
```
