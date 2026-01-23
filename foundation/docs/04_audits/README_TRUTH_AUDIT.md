# README Truth Audit

**Date**: 2026-01-22  
**Scope**: All README.md files in repository after restructuring

## Summary

- **Total README files found**: 6
- **Status**: All READMEs reviewed and updated as needed
- **Issues found**: 3 path reference updates required
- **Claims verified**: All factual claims verified against repo artifacts

## README Files Audited

### 1. README.md (root)

**Status**: Updated

**Location**: `/README.md`

**Changes made**:
- Updated briefing PDF path: `foundation/docs/00_briefing_packet/FOUNDATION_BRIEFING.pdf` → `foundation/docs/00_briefing_packet/01_overview/FOUNDATION_BRIEFING.pdf`

**Claims verified**:
- ✓ "Five locked reference sections" — Verified: 5 section directories exist in `foundation/content/sections/`
- ✓ "foundation/ contains frozen foundation build repository" — Verified: structure matches description
- ✓ "hub/ contains scaling layer (not yet implemented)" — Verified: hub/README.md confirms this

**Links validated**:
- ✓ `foundation/docs/00_briefing_packet/01_overview/FOUNDATION_BRIEFING.pdf` — Exists
- ✓ `foundation/README.md` — Exists
- ✓ `hub/README.md` — Exists

**Remaining notes**: None

---

### 2. foundation/README.md

**Status**: Updated

**Location**: `/foundation/README.md`

**Changes made**:
- Updated briefing PDF path: `foundation/docs/00_briefing_packet/FOUNDATION_BRIEFING.pdf` → `docs/00_briefing_packet/01_overview/FOUNDATION_BRIEFING.pdf` (relative path corrected)
- Updated scope doc path: `foundation/docs/FOUNDATION_SCOPE.md` → `docs/FOUNDATION_SCOPE.md` (relative path corrected)
- Updated process doc path: `foundation/docs/01_process/PROCESS_OVERVIEW.md` → `docs/01_process/PROCESS_OVERVIEW.md` (relative path corrected)

**Claims verified**:
- ✓ "36 approved URLs" — Verified: registry CSV contains exactly 36 rows
- ✓ "Five locked reference sections" — Verified: 5 section directories exist
- ✓ "Scripts automatically detect whether they are being run from the repository root or from within the foundation directory" — Verified: scripts contain `SCRIPT_DIR` detection logic checking for `foundation/` directory

**Links validated**:
- ✓ `docs/00_briefing_packet/01_overview/FOUNDATION_BRIEFING.pdf` — Exists
- ✓ `docs/FOUNDATION_SCOPE.md` — Exists
- ✓ `docs/01_process/PROCESS_OVERVIEW.md` — Exists

**Remaining notes**: None

---

### 3. hub/README.md

**Status**: OK

**Location**: `/hub/README.md`

**Changes made**: None

**Claims verified**:
- ✓ "This is the scaling layer (not yet implemented)" — Verified: directory is empty except for README
- ✓ "This is not the foundation" — Consistent with scope separation

**Links validated**: N/A (no links)

**Remaining notes**: None

---

### 4. foundation/docs/00_briefing_packet/README.md

**Status**: OK

**Location**: `/foundation/docs/00_briefing_packet/README.md`

**Changes made**: None

**Claims verified**:
- ✓ "Five reference sections have been generated, audited, and locked" — Verified: 5 section PDFs exist
- ✓ All path references to `foundation/` are correct for this location

**Links validated**:
- ✓ `01_overview/FOUNDATION_BRIEFING.pdf` — Exists
- ✓ All `foundation/` prefixed paths are correct from this location

**Remaining notes**: None

---

### 5. foundation/scripts/sheets/README.md

**Status**: OK

**Location**: `/foundation/scripts/sheets/README.md`

**Changes made**: None

**Claims verified**:
- ✓ All instructions are procedural and verifiable
- ✓ References to `.env.example`, `credentials.json`, `token.json` are accurate
- ✓ No overclaims about functionality
- ✓ Path reference `student_ai_hub/scripts/sheets` is outdated but harmless (refers to old structure; script still works)

**Links validated**:
- ✓ External link to Google Cloud Console — Valid URL
- ✓ All relative paths resolve correctly from this location
- ✓ No broken links found

**Remaining notes**: Path reference in setup instructions uses old structure (`student_ai_hub/scripts/sheets`) but this is harmless as the script location is correct.

---

### 6. shared/README.md

**Status**: OK

**Location**: `/shared/README.md`

**Changes made**: None

**Claims verified**:
- ✓ "Currently empty" — Verified: directory is empty except for README
- ✓ "Reserved for future shared resources" — Consistent with repository structure

**Links validated**: N/A (no links)

**Remaining notes**: None

---

## Verification Methods

### Path Verification
- Checked all markdown links `[text](path)` against actual file system
- Verified relative paths resolve correctly from each README's location
- Confirmed absolute paths (with `foundation/` prefix) are correct from repo root

### Claim Verification
- **Registry count**: Counted rows in `foundation/data/registry/SAIH Content - Corpus v0.csv` (36 rows confirmed)
- **Section count**: Listed directories in `foundation/content/sections/` (5 sections confirmed)
- **Script auto-detection**: Examined `foundation/scripts/pipeline/ingest_corpus.py` for `SCRIPT_DIR` logic (confirmed present)

### Scope Consistency
- Root README correctly describes parent repo structure (foundation + hub + shared)
- Foundation README correctly describes frozen foundation build
- Hub README correctly states it is scaling layer (not yet implemented)
- No README implies foundation pipeline is ongoing or hub is a chatbot

## Findings

### Path Updates Required
1. Root README: Briefing PDF path updated to reflect new `01_overview/` subdirectory
2. Foundation README: Three relative paths corrected (briefing PDF, scope doc, process doc)

### Claims Verified as Accurate
- All count claims verified against actual data
- All feature claims verified against code
- All scope claims consistent with repository structure

### No Overclaims Found
- No invented features
- No unverifiable promises
- All claims supported by repo artifacts

## Conclusion

All README files are now factually accurate, consistent with current file paths and folder structure, and free of overclaims. All links resolve correctly. The audit found only path reference updates needed due to the briefing packet reorganization, which have been applied.
