# Student AI Hub — Foundation Repository

This is the frozen foundation build repository. It contains the documented methodology, scripts, source registry, and five locked reference sections that establish the credibility and audit trail for the Student AI Hub.

## What This Contains

- **Five locked reference sections**: AI Basics, Using AI for School and Work, How Businesses Are Using AI, AI Tools You Might Use, Rules, Risks, and Ethics of AI
- **Documented build process**: Complete methodology from source selection through content drafting and review
- **Source registry**: 36 approved URLs, each selected by a person and classified by section and source type
- **Scripts**: Tools for ingestion, indexing, chunking, and search
- **Process documentation**: Detailed documentation of how the foundation was built

## Where to Start

- **For an overview**: [`docs/00_briefing_packet/01_overview/FOUNDATION_BRIEFING.pdf`](docs/00_briefing_packet/01_overview/FOUNDATION_BRIEFING.pdf)
- **For scope and boundaries**: [`docs/FOUNDATION_SCOPE.md`](docs/FOUNDATION_SCOPE.md)
- **For process details**: [`docs/01_process/PROCESS_OVERVIEW.md`](docs/01_process/PROCESS_OVERVIEW.md)

## Running Scripts

Scripts should be run from the repository root (parent of `foundation/`), using paths prefixed with `foundation/`:

```bash
python foundation/scripts/pipeline/ingest_corpus.py
python foundation/scripts/pipeline/build_corpus_index.py
python foundation/scripts/pipeline/chunk_corpus.py
```

Scripts automatically detect whether they are being run from the repository root or from within the foundation directory and adjust paths accordingly.

## Important Notes

This foundation is frozen and represents the initial build methodology. It should not be modified without explicit review. All credibility, audit trail, and methodology documentation resides here.
