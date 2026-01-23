# Registry Status Model (Foundation)

## Purpose

This document explains how the foundation registry distinguishes between three states: collected links, ingested links, and links used in final published reference sections. This distinction helps track which sources were selected, which were successfully processed, and which were actually used in the foundation's published materials.

## Definitions (Evidence-Based)

### Collected (36 links)

Links that were present in the registry at the time the foundation corpus v0 was created. These represent the initial set of sources that were selected and approved for use in building the foundation.

**Evidence source**: `foundation/data/registry/SAIH Content - Corpus v0.csv`

### Ingested (29 links)

Links that appear in `foundation/data/chunks/chunks.jsonl` as URLs with associated chunked content. These are links that were successfully scraped, processed, and broken into citable chunks.

**Evidence source**: `foundation/data/chunks/chunks.jsonl` (extracted via `foundation/scripts/sheets/ingested_urls.json`)

**Meaning**: The URL was successfully accessed, its content was retrieved, and it was chunked into the corpus. This does not guarantee the content was used in final sections.

### Used in Final Sections (22 links)

Links that are traceable from chunk IDs referenced in published foundation section markdown files back to URLs via chunk metadata. These are links whose chunks were actually referenced in the final locked reference sections.

**Evidence source**: 
- `foundation/content/sections/**/index.md` (chunk ID references)
- `foundation/data/chunks/chunks.jsonl` (chunk ID to URL mapping)
- Extracted via `foundation/scripts/sheets/used_in_final_sections_urls.json`

**Meaning**: The URL's chunks were referenced in at least one published foundation reference section. This is a subset of ingested links.

## Where the Evidence Comes From

The registry status is computed from these repository artifacts:

- **Registry CSV**: `foundation/data/registry/SAIH Content - Corpus v0.csv`
- **Chunks data**: `foundation/data/chunks/chunks.jsonl`
- **Published sections**: `foundation/content/sections/**/index.md`
- **Computed lists**: 
  - `foundation/scripts/sheets/ingested_urls.json`
  - `foundation/scripts/sheets/used_in_final_sections_urls.json`

## What Changed in the Google Sheet

The registry audit script (`foundation/scripts/sheets/audit_registry.js`) updates the Google Sheet with the following structure:

### New Tabs

1. **Legacy_Collected_Links_v0**
   - Contains all 36 originally collected links, unchanged
   - Includes a note explaining this is the original collection prior to auditing

2. **Active_Ingested_Links_v1**
   - Contains 29 links that were successfully ingested into the corpus
   - Filtered from the original 36 based on presence in chunks.jsonl

3. **Active_Used_In_Final_Sections_v1**
   - Contains 22 links that were used in final published reference sections
   - Filtered from ingested links based on chunk ID references in section markdown files

### New Columns in Original Corpus Tab

The original `Corpus` tab now includes two status columns:

- **ingested_status**: `ingested_in_corpus` | `not_ingested`
- **final_section_use_status**: `used_in_final_sections` | `not_used_in_final_sections`

These columns allow filtering and analysis of the registry without losing the original data.

## Relationships

- All 36 collected links are preserved in the Legacy tab
- 29 of 36 collected links were ingested (7 were not ingested)
- 22 of 29 ingested links were used in final sections (7 were ingested but not used)
- Used in final sections is a strict subset of ingested links

## Non-Goals

- This model does not explain why a link was not ingested or not used in final sections
- This model does not add new sources to the registry
- This model does not make claims about accuracy, trustworthiness, or quality of sources
- This model only documents what happened, not what should have happened
