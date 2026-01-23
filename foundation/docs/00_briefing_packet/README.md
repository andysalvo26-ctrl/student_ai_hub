# Student AI Hub — Briefing Packet

**Start here**: [`01_overview/FOUNDATION_BRIEFING.pdf`](01_overview/FOUNDATION_BRIEFING.pdf) — A single-page overview of the foundation that can stand in for the entire repository.

## What This Repository Is

The Student AI Hub repository contains a corpus-driven content generation system that produces citation-grounded reference sections for students. The system ingests human-approved URLs from a Google Sheet registry, extracts and chunks text, and generates markdown sections with precise chunk-level citations. Five reference sections have been generated, audited, and locked.

## What Makes This System Defensible

- **Human-approved registry**: All sources are manually curated and classified in a Google Sheet before ingestion. Nothing is ingested that hasn't been explicitly approved.
- **Locked schema**: Section names and source types are hardcoded in validation logic, preventing drift or unauthorized additions.
- **Robots.txt and paywall compliance**: The ingestion system respects `robots.txt`, detects paywalls, and records blocked sources without attempting to bypass restrictions.
- **Auditable logs**: Every ingestion run produces timestamped logs (`foundation/data/runs/`) recording success/failure, HTTP status, and blocked reasons.
- **Chunk-level citations**: Every paragraph in generated sections cites specific `chunk_id`s that trace back to exact source text and retrieval timestamps.

## What Exists Today vs. What Is Planned

**Implemented:**
- Google Sheet registry workflow (Node.js scripts)
- URL ingestion with robots.txt compliance (`foundation/scripts/pipeline/ingest_corpus.py`)
- Text extraction (HTML via trafilatura, PDF via pypdf)
- Snapshot storage with stable IDs
- Text chunking (1,200-1,800 character segments)
- BM25 lexical search (`foundation/scripts/search/search_chunks_v2.py`)
- Five locked markdown sections with PDF exports
- Process documentation (`foundation/docs/01_process/`)

**Planned / Not Found:**
- Automated CSV export from Google Sheet
- Scripted content generation workflow (currently manual AI-assisted)
- CI/CD or automated testing
- Deployment automation

## Where to Look Next

- **Process documentation**: `foundation/docs/01_process/PROCESS_OVERVIEW.md` and `foundation/docs/01_process/WORKFLOW_APPENDIX.md`
- **Source registry**: `foundation/data/registry/SAIH Content - Corpus v0.csv` (exported from Google Sheet)
- **Technical architecture**: `foundation/docs/04_audits/REPO_AUDIT_ALIGNMENT.md`
- **Locked sections**: `foundation/content/sections/` (five markdown files with PDF exports)

## Briefing Packet Contents

### 01_overview/
Contains the primary briefing document:
- `FOUNDATION_BRIEFING.pdf` — Single-page overview of the foundation (start here)
- `FOUNDATION_BRIEFING.md` — Markdown source for the briefing PDF

### 02_outputs/
Contains the generated reference section PDFs:
- `pdfs/` — Five locked reference section PDFs (AI Basics, Using AI for School and Work, How Businesses Are Using AI, AI Tools You Might Use, Rules, Risks, and Ethics of AI) plus process documentation PDFs

### 03_sources/
Contains source lists:
- `URLS_USED_IN_FINAL_SECTIONS.txt` — URLs that were cited in the final locked sections
- `URLS_INGESTED.txt` — URLs that were successfully ingested (evidence from indexes)

### 04_audit/
Contains audit and manifest documents:
- `URL_MANIFEST.md` — Complete manifest tracking URLs through approval, ingestion, and final use
- `URL_MANIFEST.csv` — CSV version of the URL manifest
- `UNUSED_SOURCES_EXACT_REASONS.md` — Evidence-only report explaining why approved sources were not used in final sections

## PDFs in This Packet

The following PDFs demonstrate the system's rigor and outputs:

1. **PROCESS_OVERVIEW.pdf** (in `02_outputs/pdfs/`) — Executive overview of the content generation process, from human curation to locked sections.

2. **ai-basics.pdf** (in `02_outputs/pdfs/`) — "AI Basics" reference section. Core concepts and definitions explaining how AI and machine learning work. Generated from corpus chunks with citations.

3. **using-ai-for-school-and-work.pdf** (in `02_outputs/pdfs/`) — "Using AI for School and Work" reference section. Practical, responsible guidance for students using AI in coursework and productivity.

4. **how-businesses-use-ai.pdf** (in `02_outputs/pdfs/`) — "How Businesses Are Using AI" reference section. High-level explanation of current business applications of AI.

5. **ai-tools-you-might-use.pdf** (in `02_outputs/pdfs/`) — "AI Tools You Might Use" reference section. Categories of AI tools students may encounter, without endorsement.

6. **rules-risks-ethics.pdf** (in `02_outputs/pdfs/`) — "Rules, Risks, and Ethics of AI" reference section. Ethical, legal, and governance considerations surrounding AI.

All section PDFs are generated from the corpus with paragraph-level citations tracing back to approved sources.
