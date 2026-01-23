# Demo Corpus

This directory contains student-facing page-like content derived from the Canonical Knowledge Pack.

## Structure

- `pages/` — Page-like markdown files for the demo chatbot
- `meta/` — Metadata and manifest files

## Pages

- **Student AI Hub** (`home.md`) — Derived from 2 canonical file(s)
- **AI Basics** (`ai_basics.md`) — Derived from 1 canonical file(s)
- **Using AI for School and Work** (`using_ai_school_work.md`) — Derived from 1 canonical file(s)
- **How Businesses Are Using AI** (`how_businesses_use_ai.md`) — Derived from 1 canonical file(s)
- **AI Tools You Might Use** (`ai_tools_you_might_use.md`) — Derived from 1 canonical file(s)
- **Rules, Risks, and Ethics of AI** (`rules_risks_ethics.md`) — Derived from 1 canonical file(s)
- **Foundational Sources** (`foundational_sources.md`) — Derived from 2 canonical file(s)
- **Process and Provenance** (`process_and_provenance.md`) — Derived from 2 canonical file(s)
- **Glossary** (`glossary.md`) — Derived from 1 canonical file(s)
- **FAQ for Students** (`faq_students.md`) — Derived from 1 canonical file(s)
- **AI at Penn State** (`ai_at_penn_state.md`) — Derived from 0 canonical file(s)
- **AI by Smeal Major** (`ai_by_smeal_major.md`) — Derived from 0 canonical file(s)
- **AI News That Matters** (`ai_news_that_matters.md`) — Derived from 0 canonical file(s)

## Usage

These pages are used by the demo chatbot for retrieval. They are generated from canonical pack content and restructured to be student-facing.

## Regeneration

To regenerate these pages, run:
```
node demo_chatbot_v0/scripts/build_demo_corpus.js
```

## Preview Note

All pages include a preview note indicating they are demo content derived from hub materials. The full version may include additional content.
