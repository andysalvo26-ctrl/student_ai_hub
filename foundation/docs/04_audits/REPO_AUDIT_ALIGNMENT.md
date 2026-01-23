# Repo Audit + Alignment (Student AI Hub)

## 0. Executive Snapshot

- **What this repo is**: A corpus-driven content generation system for the Student AI Hub. It ingests approved URLs from a Google Sheet, extracts text, chunks it, and generates citation-grounded markdown reference sections.
- **What it produces today**: Five locked markdown sections (`content/sections/*/index.md`) with PDF exports, plus process documentation. Generated from 36 approved sources, 29 successfully ingested, producing 272 chunks.
- **What stage it's in**: Initial build complete. Core pipeline functional. Content generation workflow established and audited.
- **Single source of truth**: Google Sheet (exported as `data/registry/SAIH Content - Corpus v0.csv`) is the canonical registry. The CSV is the authoritative input for ingestion.
- **What is locked**: Five markdown sections (AI Basics, Using AI for School and Work, How Businesses Are Using AI, AI Tools You Might Use, Rules, Risks, and Ethics of AI). Eight section names and seven source types are hardcoded in validation.
- **Biggest risks/gaps**: No root README. No automated regeneration workflow documented. Duplicate PDF header files. Content generation is manual (not scripted). No CI/CD or automated testing.

## 1. Repo Map

```
student_ai_hub/
├── data/                          # All generated data artifacts
│   ├── SAIH Content - Corpus v0.csv          # Canonical source registry (exported from Google Sheet)
│   ├── corpus_snapshots/                     # Raw ingestion snapshots (timestamped filenames)
│   ├── corpus_snapshots_stable/             # Stable-ID snapshots (hostname__hash.json)
│   ├── runs/                                # Ingestion run logs (JSONL)
│   ├── corpus_index.json                    # Index built from snapshots (non-stable)
│   ├── corpus_index_stable.json             # Index with stable IDs (canonical)
│   ├── chunks.jsonl                          # All chunks (one JSON per line)
│   └── chunk_index.json                      # Chunk metadata index
├── scripts/
│   └── sheets/                              # Google Sheets ingestion workflow
│       ├── append_links.js                  # Append rows to Google Sheet
│       ├── create_schema_tab.js             # Create Schema tab with reference tables
│       ├── README.md                        # Setup instructions
│       ├── sample_links.json                # Example input
│       └── inbox_links.json                 # Temporary input file
├── content/                                 # Generated markdown + PDFs
│   ├── ai-basics/index.md + .pdf           # Generated section (locked)
│   ├── using-ai-for-school-and-work/        # Generated section (locked)
│   ├── how-businesses-use-ai/              # Generated section (locked)
│   ├── ai-tools-you-might-use/             # Generated section (locked)
│   ├── rules-risks-ethics/                  # Generated section (locked)
│   ├── ai-news-that-matters/                # Human-authored (README.md marks this)
│   ├── penn-state-ai-resources/            # Human-authored (README.md marks this)
│   ├── ai-by-smeal-major/                  # Human-authored (README.md marks this)
│   ├── PROCESS_OVERVIEW.md + .pdf          # Process documentation
│   ├── WORKFLOW_APPENDIX.md + .pdf         # Technical appendix
│   ├── pdf/                                # Shared PDF styling
│   │   ├── header.tex                       # LaTeX header for section PDFs
│   │   └── style.yaml                      # Pandoc metadata defaults
│   ├── pdf_header.tex                      # Header for PROCESS_OVERVIEW (duplicate?)
│   └── pdf_header_appendix.tex             # Header for WORKFLOW_APPENDIX
├── ingest_corpus.py                        # Entry point: CSV → snapshots
├── build_corpus_index.py                   # Snapshots → corpus_index_stable.json
├── chunk_corpus.py                         # Stable index → chunks.jsonl
├── search_chunks.py                        # Simple token overlap search
├── search_chunks_v2.py                     # BM25 lexical ranking search
├── normalize_snapshot_ids.py               # Utility: create stable snapshot IDs
└── .gitignore                              # Ignores .venv, credentials, data dirs
```

**Key directories:**
- `data/`: All generated artifacts. Snapshots, indexes, chunks. Not committed (in .gitignore).
- `scripts/sheets/`: Node.js workflow for adding sources to Google Sheet registry.
- `content/`: Final markdown outputs and PDFs. Generated sections are "locked" (human-audited and finalized).

## 2. Canonical Artifacts (Source of Truth)

### 2.1 Content Registry

**Location**: `data/registry/SAIH Content - Corpus v0.csv` (exported from Google Sheet)

**Google Sheet**: ID `1aF2v14wWWmUSx5gq5ZWLSMfOnoNTXumzmIzzPjuaMoc`, tab "Corpus"

**Columns**:
- `section`: One of 8 predefined sections (validated in `scripts/sheets/append_links.js`)
- `url`: Canonical URL (must start with http/https)
- `source_type`: One of 7 predefined types (validated in `scripts/sheets/append_links.js`)
- `relevance_note`: Human-written note explaining why source belongs
- `date_added`: Date source was added to registry (YYYY-MM-DD). **Note**: Scripts ignore input `date_added` and always set to today's date at insertion time.

**How new items are added**:
1. Use `scripts/sheets/append_links.js` with JSON input file
2. Script validates section/source_type against hardcoded lists
3. Script appends row to Google Sheet "Corpus" tab
4. Export Google Sheet as CSV to `data/SAIH Content - Corpus v0.csv` (manual step, not automated)

**Evidence**: `scripts/sheets/append_links.js` lines 99-119, `scripts/sheets/README.md`

### 2.2 Schema + Governance

**Section definitions**: Hardcoded in `scripts/sheets/append_links.js` lines 99-108:
- AI Basics
- Using AI for School and Work
- How Businesses Are Using AI
- AI Tools You Might Use
- Rules, Risks, and Ethics of AI
- AI News That Matters
- AI Resources at Penn State
- AI by Smeal Major

**Source type definitions**: Hardcoded in `scripts/sheets/append_links.js` lines 111-119:
- University / Official
- Course / Training
- Tool Documentation
- Explainer / Guide
- Case Study / Example
- Research / Academic
- News / Update

**Schema tab**: `scripts/sheets/create_schema_tab.js` creates a "Schema" tab in Google Sheet with reference tables for sections and source types. **Note**: This is informational only; validation uses hardcoded lists in JavaScript.

**Locked sections**: Five sections are marked as "locked" in `content/PROCESS_OVERVIEW.md`:
- AI Basics
- Using AI for School and Work
- How Businesses Are Using AI
- AI Tools You Might Use
- Rules, Risks, and Ethics of AI

**Human-authored sections**: Three sections explicitly marked as human-authored via `README.md` files:
- `content/ai-news-that-matters/README.md`
- `content/penn-state-ai-resources/README.md`
- `content/ai-by-smeal-major/README.md`

**Evidence**: `scripts/sheets/append_links.js`, `content/PROCESS_OVERVIEW.md` lines 52-57, README files in content subdirectories

## 3. Pipeline: From URL → Snapshots → Chunks → Pages

### 3.1 Ingestion

**Entry point**: `python ingest_corpus.py`

**Input**: `data/SAIH Content - Corpus v0.csv`

**Process**:
1. Reads CSV, extracts URLs
2. For each URL:
   - Checks `robots.txt` using `urllib.robotparser` (cached per domain)
   - If blocked by robots.txt, marks as `scrape_status: "blocked"`, stores metadata only
   - If allowed, fetches with `requests` library
   - Rate limits: 1.25 seconds between requests
   - User-Agent: `"StudentAIHubCorpusBot/1.0"`
   - Timeout: 10 seconds
   - Handles redirects (stores `final_url`)
   - Detects paywalls: checks response text for keywords ("paywall", "subscribe to read", "premium content")
   - Stores HTTP status, content-type, retrieval timestamp

**Failure logging**: Each URL produces one log entry in `data/runs/run_{timestamp}.jsonl`:
- `snapshot_id`, `url`, `final_url`, `retrieved_at`, `scrape_status`, `http_status`, `content_hash`, `snapshot_path`, `blocked_reason`

**Evidence**: `ingest_corpus.py` lines 32-37, 44-50, 200-250

### 3.2 Extraction

**HTML extraction**:
- Primary: `trafilatura` library (`trafilatura.extract()`)
- Fallback: `BeautifulSoup` (`soup.get_text()`)
- Headings: Extracts h1/h2 using BeautifulSoup

**PDF extraction**:
- Primary: `pypdf` (`PdfReader.pages[].extract_text()`)
- Fallback: `pdfplumber` (if available)

**Stored fields**:
- `title`: From HTML `<title>` or PDF metadata
- `headings`: Array of `{level: "h1"/"h2", text: "..."}`
- `full_text`: Extracted text (or null if extraction failed)
- `excerpt`: First 800 words of `full_text`
- `word_count`: Count of words in `full_text`
- `content_hash`: SHA256 hash of `full_text`

**Evidence**: `ingest_corpus.py` lines 70-120

### 3.3 Snapshot Storage

**Directory**: `data/snapshots/corpus_snapshots/`

**Filename scheme**: `{url_hash[:16]}_{timestamp}.json` where timestamp is `YYYYMMDD_HHMMSS`

**Stable snapshots**: `data/snapshots/corpus_snapshots_stable/` contains copies renamed to `{hostname_normalized}__{url_hash[:16]}.json`

**Snapshot structure** (JSON):
```json
{
  "url": "...",
  "final_url": "...",
  "retrieved_at": "ISO timestamp",
  "http_status": 200,
  "title": "...",
  "site_name": "...",
  "content_type": "text/html",
  "headings": [...],
  "full_text": "...",
  "excerpt": "...",
  "word_count": 1234,
  "content_hash": "sha256...",
  "scrape_status": "success|partial|blocked|error",
  "blocked_reason": null,
  "notes": {
    "section": "...",
    "source_type": "...",
    "relevance_note": "...",
    "date_added": "...",
    "url": "..."
  }
}
```

**Stable ID generation**: `normalize_snapshot_ids.py` creates stable IDs from URL: `normalize_hostname(netloc) + "__" + sha256(url)[:16]`

**Evidence**: `ingest_corpus.py` lines 200-250, `normalize_snapshot_ids.py` lines 24-30

### 3.4 Chunking + Indexing

**Entry point**: `python chunk_corpus.py`

**Input**: `data/indexes/corpus_index_stable.json` (reads `snapshot_path_stable` or falls back to `snapshot_path_original`)

**Chunking rules** (`chunk_corpus.py` lines 37-100):
- Only chunks sources with `scrape_status == "success"` AND `full_text_present == true`
- Target size: 1,200-1,800 characters per chunk
- Minimum size: 400 characters (except last remainder)
- Splits on double newlines (paragraphs), then single newlines, then sentence boundaries
- Normalizes whitespace

**Chunk ID scheme**: `{stable_id}::c{chunk_index:04d}` (e.g., `www_library_jhu_edu__9981251c7844ce31::c0000`)

**Output files**:
- `data/chunks/chunks.jsonl`: One JSON object per line with `chunk_id`, `stable_id`, `url`, `title`, `section`, `source_type`, `chunk_index`, `char_start`, `char_end`, `text`
- `data/chunk_index.json`: Summary with `sources_chunked`, `total_chunks`, `average_chunk_length`, `min_chunk_length`, `max_chunk_length`, plus lightweight array of chunk metadata

**Evidence**: `chunk_corpus.py` lines 37-100, `data/chunk_index.json` structure

### 3.5 Markdown / Rendering Output

**Generation process**: **Not scripted**. Content generation is manual using AI assistance in Cursor IDE, following workflow documented in `docs/01_process/PROCESS_OVERVIEW.md` and `docs/01_process/WORKFLOW_APPENDIX.md`.

**Workflow** (from `docs/01_process/PROCESS_OVERVIEW.md`):
1. Generate draft using only chunks from target section
2. Audit for source balance, single-source cautionary claims, prescriptive tone
3. Revise minimally (narrow language scope, don't add sources)
4. Lock final version

**Output locations**:
- `content/ai-basics/index.md` (locked)
- `content/using-ai-for-school-and-work/index.md` (locked)
- `content/how-businesses-use-ai/index.md` (locked)
- `content/ai-tools-you-might-use/index.md` (locked)
- `content/rules-risks-ethics/index.md` (locked)

**PDF generation**: Uses Pandoc + XeLaTeX:
- `pandoc content/{section}/index.md -o content/{section}/index.pdf --pdf-engine=xelatex --include-in-header=content/pdf/header.tex`
- Shared styling in `content/pdf/header.tex` and `content/pdf/style.yaml`

**Citation format**: Each paragraph ends with `(Source: chunk_id)` where `chunk_id` is from `data/chunks/chunks.jsonl`

**Evidence**: `docs/01_process/PROCESS_OVERVIEW.md`, `docs/01_process/WORKFLOW_APPENDIX.md`, generated markdown files

## 4. What's Implemented vs Planned

| Component | Status | Evidence | Notes |
|-----------|--------|----------|-------|
| Google Sheet registry | Implemented | `scripts/sheets/append_links.js`, `scripts/sheets/README.md` | OAuth flow, validation, auto date_added |
| CSV export | Partial | `data/registry/SAIH Content - Corpus v0.csv` | Manual export step, not automated |
| URL ingestion | Implemented | `scripts/pipeline/ingest_corpus.py` | robots.txt, rate limiting, paywall detection |
| HTML extraction | Implemented | `scripts/pipeline/ingest_corpus.py` lines 70-90 | trafilatura + BeautifulSoup fallback |
| PDF extraction | Implemented | `scripts/pipeline/ingest_corpus.py` lines 92-120 | pypdf + pdfplumber fallback |
| Snapshot storage | Implemented | `data/snapshots/corpus_snapshots/`, `scripts/pipeline/ingest_corpus.py` | Timestamped + stable ID versions |
| Corpus indexing | Implemented | `scripts/pipeline/build_corpus_index.py`, `data/indexes/corpus_index_stable.json` | Aggregates snapshots into index |
| Text chunking | Implemented | `scripts/pipeline/chunk_corpus.py`, `data/chunks/chunks.jsonl` | 1,200-1,800 char chunks, paragraph-aware |
| Chunk indexing | Implemented | `data/indexes/chunk_index.json` | Lightweight metadata index |
| BM25 search | Implemented | `scripts/search/search_chunks_v2.py` | Lexical ranking with phrase/title boosts |
| Simple search | Implemented | `scripts/search/search_chunks.py` | Token overlap (legacy?) |
| Markdown generation | Partial | `content/sections/*/index.md` | Manual process, not scripted |
| PDF generation | Implemented | Pandoc commands, `content/pdf/header.tex` | Research-grade typography |
| Automated regeneration | Not found | N/A | No script to re-run full pipeline |
| CI/CD | Not found | N/A | No automated testing or deployment |
| Root README | Not found | N/A | No entry point documentation |

## 5. "Do Not Break" Constraints

**Single source of truth**: The Google Sheet (exported as CSV) is the canonical registry. Nothing should be ingested that isn't in this registry. **Evidence**: `docs/01_process/PROCESS_OVERVIEW.md` line 13, `scripts/pipeline/ingest_corpus.py` reads CSV only.

**No browsing beyond approved sources**: Content generation must use only chunks from `data/chunks/chunks.jsonl` that correspond to approved sources. **Evidence**: `docs/01_process/PROCESS_OVERVIEW.md` line 35, `docs/01_process/WORKFLOW_APPENDIX.md` line 131.

**Auditability / traceability**: Every generated paragraph must cite `chunk_id` from `data/chunks/chunks.jsonl`. Chunk IDs trace back to stable snapshot IDs, which trace back to URLs and retrieval timestamps. **Evidence**: Generated markdown files show `(Source: chunk_id)` citations, `scripts/pipeline/chunk_corpus.py` creates chunk_ids.

**Citation rules**: Citations must be at paragraph level, format `(Source: chunk_id)`. Multiple chunk_ids can be cited per paragraph. **Evidence**: Generated markdown files, `docs/01_process/WORKFLOW_APPENDIX.md` line 131.

**Locked sections**: Five sections are locked and should not be regenerated without explicit approval. **Evidence**: `docs/01_process/PROCESS_OVERVIEW.md` lines 52-57.

**Human-authored boundaries**: Three sections are explicitly human-authored and should not be generated from corpus. **Evidence**: README files in `content/ai-news-that-matters/`, `content/penn-state-ai-resources/`, `content/ai-by-smeal-major/` (these remain in `content/` as they are not part of the locked sections).

**Schema immutability**: Section names and source types are hardcoded in validation. Changes require code updates. **Evidence**: `scripts/sheets/append_links.js` lines 99-119.

## 6. Current Mess / Inconsistencies (Actionable)

**Duplicate PDF headers**: Three LaTeX header files exist:
- `content/pdf/header.tex` (used for section PDFs)
- `content/pdf_header.tex` (used for PROCESS_OVERVIEW)
- `content/pdf_header_appendix.tex` (used for WORKFLOW_APPENDIX)

**Impact**: Maintenance burden, potential drift. **Fix**: Consolidate to `content/pdf/header.tex` with metadata-driven footer text, or document why separate files are needed.

**No root README**: Repository lacked entry point documentation. **Status**: Fixed — root `README.md` now exists and points to briefing packet.

**CSV export not automated**: Google Sheet must be manually exported to CSV. **Impact**: Risk of stale CSV, manual step in workflow. **Fix**: Add script to export via Sheets API, or document manual step clearly.

**Content generation not scripted**: Markdown generation is manual (AI-assisted in Cursor). **Impact**: Cannot regenerate sections automatically, hard to reproduce. **Fix**: Document exact workflow, or create script that calls AI API with chunk constraints.

**Unclear script purposes**: `normalize_snapshot_ids.py` and `search_chunks.py` exist but purpose unclear from filenames. **Impact**: Hard to know when to use which script. **Fix**: Add docstrings explaining when to run, or consolidate into main pipeline scripts.

**Data directory in .gitignore**: Updated to `data/snapshots/` and `data/runs/`. `data/chunks/chunks.jsonl` and `data/indexes/` are not ignored (intentional — these are regeneratable but useful to version).

**Stable vs non-stable indexes**: Both `corpus_index.json` and `corpus_index_stable.json` exist. **Impact**: Confusion about which is canonical. **Fix**: Document that `corpus_index_stable.json` is canonical, remove or rename non-stable version.

## 7. How to Run This Repo (Step-by-step)

### Prerequisites

**Python 3.9+**:
- Dependencies: `requests`, `beautifulsoup4`, `trafilatura`, `pypdf`, `pdfplumber`
- Install: `pip install requests beautifulsoup4 trafilatura pypdf pdfplumber`

**Node.js 18+** (for Sheets workflow):
- Dependencies: `googleapis`, `dotenv`
- Install: `cd scripts/sheets && npm install`

**Pandoc + XeLaTeX** (for PDF generation):
- macOS: `brew install pandoc basictex`
- Verify: `pandoc --version`, `xelatex --version`

**Google Cloud OAuth credentials** (for Sheets workflow):
- See `scripts/sheets/README.md` for setup instructions
- Place `credentials.json` in `scripts/sheets/`

### Primary Commands

**1. Add source to registry**:
```bash
cd scripts/sheets
# Edit inbox_links.json with new source(s)
node append_links.js ./inbox_links.json
# Manually export Google Sheet as CSV to data/registry/SAIH Content - Corpus v0.csv
```

**2. Ingest URLs**:
```bash
python scripts/pipeline/ingest_corpus.py
# Outputs: data/snapshots/corpus_snapshots/*.json, data/runs/run_*.jsonl
```

**3. Build corpus index**:
```bash
python scripts/pipeline/build_corpus_index.py
# Outputs: data/indexes/corpus_index_stable.json
```

**4. Chunk text**:
```bash
python scripts/pipeline/chunk_corpus.py
# Outputs: data/chunks/chunks.jsonl, data/indexes/chunk_index.json
```

**5. Search chunks** (optional):
```bash
python scripts/search/search_chunks_v2.py "your query here"
# Returns top 8 chunks with BM25 scores
```

**6. Generate markdown** (manual):
- Use AI assistance in Cursor IDE
- Load chunks from `data/chunks/chunks.jsonl`
- Generate section following workflow in `docs/01_process/PROCESS_OVERVIEW.md`
- Audit and revise
- Save to `content/sections/{section}/index.md`

**7. Generate PDFs**:
```bash
pandoc content/sections/{section}/index.md -o content/sections/{section}/index.pdf \
  --pdf-engine=xelatex \
  --metadata title="{Section Title}" \
  --include-in-header=content/pdf/header.tex \
  --from markdown --variable=geometry:margin=1in
```

**Expected outputs**:
- `data/snapshots/corpus_snapshots/`: ~36 JSON files (one per source)
- `data/indexes/corpus_index_stable.json`: Index with 36 sources
- `data/chunks/chunks.jsonl`: ~272 chunks (one per line)
- `data/indexes/chunk_index.json`: Chunk metadata summary
- `content/sections/*/index.md`: Five locked markdown sections
- `content/sections/*/index.pdf`: PDF versions of sections

## 8. Open Questions (for the maintainer)

1. **Should CSV export be automated?** Currently manual. Consider Sheets API export script.

2. **Should content generation be scripted?** Currently manual AI-assisted process. Consider formalizing with API calls or template system.

3. **What should be committed to git?** `data/chunks.jsonl` and indexes are not in .gitignore but snapshots are. Clarify versioning strategy.

4. **Is `search_chunks.py` legacy?** `search_chunks_v2.py` exists with BM25. Should old script be removed or documented as simple alternative?

5. **Should `normalize_snapshot_ids.py` be part of main pipeline?** Currently separate utility. Consider integrating into `build_corpus_index.py`.

6. **How to handle schema changes?** Section/source_type lists are hardcoded. What's the process for adding new values?

7. **What's the regeneration workflow?** If a source is updated in Google Sheet, how do you re-ingest and regenerate affected sections?

8. **Should there be automated testing?** No tests found. Consider unit tests for chunking, validation, search.

9. **What's the deployment target?** Markdown/PDFs are generated, but where are they published? SharePoint? Static site? Document deployment process.

10. **How to handle blocked sources?** 5 sources blocked by robots.txt. Is there a process for requesting access or finding alternatives?

## Appendix A: Key File Summaries

**`data/registry/SAIH Content - Corpus v0.csv`**
- Purpose: Canonical source registry (exported from Google Sheet)
- Key notes: Single source of truth. Columns: section, url, source_type, relevance_note, date_added. Manual export step.

**`scripts/sheets/append_links.js`**
- Purpose: Append validated links to Google Sheet "Corpus" tab
- Key notes: OAuth flow, validates section/source_type against hardcoded lists, auto-sets date_added to today.

**`scripts/sheets/create_schema_tab.js`**
- Purpose: Create "Schema" tab in Google Sheet with reference tables
- Key notes: Informational only; validation uses hardcoded JavaScript lists.

**`scripts/pipeline/ingest_corpus.py`**
- Purpose: Fetch URLs from CSV, extract text, create snapshots
- Key notes: Respects robots.txt, rate limits 1.25s, handles HTML/PDF, logs failures to JSONL.

**`scripts/pipeline/build_corpus_index.py`**
- Purpose: Aggregate snapshots into `data/indexes/corpus_index_stable.json`
- Key notes: Creates stable IDs, includes CSV metadata in `notes` field, counts by status/section/type.

**`scripts/pipeline/chunk_corpus.py`**
- Purpose: Split successful source texts into 1,200-1,800 char chunks
- Key notes: Paragraph-aware splitting, creates chunk_ids, outputs JSONL + index.

**`scripts/search/search_chunks_v2.py`**
- Purpose: BM25 lexical ranking search over chunks
- Key notes: Phrase boosts (+20), title boosts (2x), optional acronym expansion (NIST→ai/rmf, rmf→risk/management/framework).

**`scripts/utils/normalize_snapshot_ids.py`**
- Purpose: Create stable snapshot filenames from URLs
- Key notes: Utility script, generates `hostname__hash.json` format.

**`docs/01_process/PROCESS_OVERVIEW.md`**
- Purpose: Executive overview of content generation process
- Key notes: Documents human curation → ingestion → chunking → synthesis → audit workflow.

**`docs/01_process/WORKFLOW_APPENDIX.md`**
- Purpose: Technical appendix with tooling and implementation details
- Key notes: Documents BM25 algorithm, custom heuristics, artifact formats, tool versions.

**`content/pdf/header.tex`**
- Purpose: LaTeX header for section PDFs
- Key notes: Palatino font, 1-inch margins, footer with "Student AI Hub", page numbers.

**`content/sections/ai-basics/index.md`**
- Purpose: Generated "AI Basics" reference section (locked)
- Key notes: ~600-800 words, citations by chunk_id, human-audited and finalized.

**`data/chunks/chunks.jsonl`**
- Purpose: All text chunks, one JSON object per line
- Key notes: ~272 chunks, includes chunk_id, stable_id, text, char offsets. Used for citation.

**`data/indexes/corpus_index_stable.json`**
- Purpose: Canonical index of all sources with stable IDs
- Key notes: 36 sources, includes scrape status, metadata, paths to stable snapshots.

**`.gitignore`**
- Purpose: Exclude credentials, Python cache, data directories
- Key notes: Ignores `.venv/`, `__pycache__/`, `corpus_snapshots/`, `runs/`, but NOT `chunks.jsonl` or indexes.
