# URL Manifest (Foundation Build)

## What this file is

This manifest tracks URLs through three stages of the foundation build process: approval in the registry, successful ingestion (with snapshot/index evidence), and actual use in the finalized reference sections (with citation evidence). It distinguishes between what was approved, what was successfully ingested, and what was actually used in the final locked sections. URLs are marked as "Not verifiable from repo artifacts" if evidence cannot be found in the repository's data files, indexes, or section markdown files.

## Summary Counts

- Approved (Registry): 36
- Ingested (Evidence): 36
- Used in Final Sections (Evidence): 22
- Not verifiable from repo artifacts: 0

## Table: Registry vs Ingestion vs Final Use

| url | section | source_type | Approved | Ingested | Used in Final Sections | Evidence | Notes |
|-----|---------|-------------|----------|----------|----------------------|----------|-------|
| https://ai.engineering.columbia.edu/ai-vs-machine-learning/ | AI Basics | Explainer / Guide | yes | yes | yes | foundation/data/registry/SAIH Content - Corpus v0.csv; foundation/data/indexes/corpus_index_stable.json (scrape_status: success); foundation/data/chunks/chunks.jsonl (chunks present); foundation/content/sections/ai-basics/index.md (cited in: index.md) | |
| https://ai.psu.edu/guidelines/ | Rules, Risks, and Ethics of AI | University / Official | yes | yes | yes | foundation/data/registry/SAIH Content - Corpus v0.csv; foundation/data/indexes/corpus_index_stable.json (scrape_status: success); foundation/data/chunks/chunks.jsonl (chunks present); foundation/content/sections/rules-risks-ethics/index.md (cited in: index.md) | |
| https://blog.methodistcollege.edu/how-to-use-artificial-intelligence-as-a-study-tool | Using AI for School and Work | University / Official | yes | yes | yes | foundation/data/registry/SAIH Content - Corpus v0.csv; foundation/data/indexes/corpus_index_stable.json (scrape_status: success); foundation/data/chunks/chunks.jsonl (chunks present); foundation/content/sections/using-ai-for-school-and-work/index.md (cited in: index.md) | |
| https://ctl.stanford.edu/aimes/ai-learning-guide-students | Using AI for School and Work | University / Official | yes | yes | yes | foundation/data/registry/SAIH Content - Corpus v0.csv; foundation/data/indexes/corpus_index_stable.json (scrape_status: success); foundation/data/chunks/chunks.jsonl (chunks present); foundation/content/sections/using-ai-for-school-and-work/index.md (cited in: index.md) | |
| https://er.educause.edu/articles/sponsored/2025/5/shaping-the-future-of-learning-ai-in-higher-education | Using AI for School and Work | News / Update | yes | yes | yes | foundation/data/registry/SAIH Content - Corpus v0.csv; foundation/data/indexes/corpus_index_stable.json (scrape_status: success); foundation/data/chunks/chunks.jsonl (chunks present); foundation/content/sections/using-ai-for-school-and-work/index.md (cited in: index.md) | |
| https://er.educause.edu/articles/sponsored/2025/8/4-ways-ai-can-help-students-succeed-in-college | Using AI for School and Work | News / Update | yes | yes | yes | foundation/data/registry/SAIH Content - Corpus v0.csv; foundation/data/indexes/corpus_index_stable.json (scrape_status: success); foundation/data/chunks/chunks.jsonl (chunks present); foundation/content/sections/using-ai-for-school-and-work/index.md (cited in: index.md) | |
| https://guides.library.georgetown.edu/ai/tools | AI Tools You Might Use | University / Official | yes | yes | yes | foundation/data/registry/SAIH Content - Corpus v0.csv; foundation/data/indexes/corpus_index_stable.json (scrape_status: success); foundation/data/chunks/chunks.jsonl (chunks present); foundation/content/sections/ai-tools-you-might-use/index.md (cited in: index.md) | |
| https://hai.stanford.edu/ai-index/2025-ai-index-report | AI News That Matters | Research / Academic | yes | yes | no | foundation/data/registry/SAIH Content - Corpus v0.csv; foundation/data/indexes/corpus_index_stable.json (scrape_status: success); foundation/data/chunks/chunks.jsonl (chunks present) | |
| https://iep.utm.edu/ethics-of-artificial-intelligence/ | Rules, Risks, and Ethics of AI | Research / Academic | yes | yes | yes | foundation/data/registry/SAIH Content - Corpus v0.csv; foundation/data/indexes/corpus_index_stable.json (scrape_status: success); foundation/data/chunks/chunks.jsonl (chunks present); foundation/content/sections/rules-risks-ethics/index.md (cited in: index.md) | |
| https://infoguides.gmu.edu/GenArtificial-Intelligence/ethics | Rules, Risks, and Ethics of AI | University / Official | yes | yes | yes | foundation/data/registry/SAIH Content - Corpus v0.csv; foundation/data/indexes/corpus_index_stable.json (scrape_status: success); foundation/data/chunks/chunks.jsonl (chunks present); foundation/content/sections/rules-risks-ethics/index.md (cited in: index.md) | |
| https://ischool.syracuse.edu/what-is-machine-learning/ | AI Basics | Explainer / Guide | yes | yes | yes | foundation/data/registry/SAIH Content - Corpus v0.csv; foundation/data/indexes/corpus_index_stable.json (scrape_status: success); foundation/data/chunks/chunks.jsonl (chunks present); foundation/content/sections/ai-basics/index.md (cited in: index.md) | |
| https://library.educause.edu/topics/infrastructure-and-research-technologies/artificial-intelligence-ai | AI Basics | University / Official | yes | yes | yes | foundation/data/registry/SAIH Content - Corpus v0.csv; foundation/data/indexes/corpus_index_stable.json (scrape_status: success); foundation/data/chunks/chunks.jsonl (chunks present); foundation/content/sections/ai-basics/index.md (cited in: index.md) | |
| https://mitsloan.mit.edu/ideas-made-to-matter/how-digital-business-models-are-evolving-age-agentic-ai | How Businesses Are Using AI | University / Official | yes | yes | yes | foundation/data/registry/SAIH Content - Corpus v0.csv; foundation/data/indexes/corpus_index_stable.json (scrape_status: success); foundation/data/chunks/chunks.jsonl (chunks present); foundation/content/sections/how-businesses-use-ai/index.md (cited in: index.md) | |
| https://mitsloan.mit.edu/ideas-made-to-matter/machine-learning-explained | AI Basics | Explainer / Guide | yes | yes | yes | foundation/data/registry/SAIH Content - Corpus v0.csv; foundation/data/indexes/corpus_index_stable.json (scrape_status: success); foundation/data/chunks/chunks.jsonl (chunks present); foundation/content/sections/ai-basics/index.md (cited in: index.md) | |
| https://platform.openai.com/docs/concepts | AI Tools You Might Use | Tool Documentation | yes | yes | yes | foundation/data/registry/SAIH Content - Corpus v0.csv; foundation/data/indexes/corpus_index_stable.json (scrape_status: success); foundation/data/chunks/chunks.jsonl (chunks present); foundation/content/sections/ai-tools-you-might-use/index.md (cited in: index.md) | |

*[Full table available in URL_MANIFEST.csv]*

## Notes on Limitations

- **Ingestion evidence**: Ingestion status is determined from `foundation/data/indexes/corpus_index_stable.json`, which records scrape status for each URL. URLs marked as "blocked" or "error" in the index are still counted as "ingested" (evidence exists) but may not have usable content.

- **Usage evidence**: Usage in final sections is determined by scanning markdown files in `foundation/content/sections/*/index.md` for citations in the format `(Source: chunk_id)`. These chunk_ids are then mapped to URLs via `foundation/data/chunks/chunks.jsonl`. If a chunk_id cannot be mapped to a URL, or if a URL's chunks exist but are not cited in any section markdown, the URL is marked as "no" for usage.

- **Snapshot files**: Snapshot files in `foundation/data/snapshots/` are not tracked in git (per .gitignore) and may not be present locally. The manifest relies on index and chunk evidence instead.

- **Registry completeness**: All URLs in the registry CSV are marked as "Approved (Registry)=yes". URLs that appear in indexes or chunks but not in the registry are included in the manifest but marked as "Approved (Registry)=no".

- **Verification scope**: This manifest only verifies evidence present in the repository artifacts. URLs that were approved but never ingested, or ingested but never used, are clearly marked as such. No assumptions are made about URLs that cannot be traced through the available evidence.
