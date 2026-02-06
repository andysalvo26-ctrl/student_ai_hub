# Agent Workflow Audit: Student AI Hub

**Date:** February 4, 2026  
**Scope:** Language artifact production across the repository  
**Primary Focus:** `student_ai_hub_contributions/` and `ai_by_smeal_major_system/`

---

## 1. Artifact Map

### File Type Counts

| Type | Count |
|------|-------|
| Markdown (`.md`) | 336 |
| JSON (`.json`) | 166 |
| PDF (`.pdf`) | 23 |
| **Total language artifacts** | ~525 |

### Top-Level Folder Map

| Folder | Purpose | Agent Involvement |
|--------|---------|-------------------|
| `student_ai_hub_contributions/` | Contribution system for "AI News That Matters" | **High** — built in Feb 4, 2026 session |
| `ai_by_smeal_major_system/` | Authorship-preserving drafting system (14 files) | **High** — systematic workflow docs |
| `ai_by_smeal_major_context_bundles/` | Per-major context bundles for ChatGPT (7 majors × 8 files each) | **High** — templated production |
| `ai_by_smeal_major/` | PackA/PackB content packs + shell + boundary pack | **Medium** — structured content |
| `canonical_pack/` | Core pillars + orientation materials | **Medium** — foundational content |
| `demo_chatbot_v0/` | Cloudflare worker chatbot demo | **Medium** — code + specs |
| `foundation/` | Data, scripts, docs, audits | **Medium** — mixed production |
| `smeal_major_canonical_pack/` | Fetched major content + extraction scripts | **Low** — mostly automated fetch |
| `site_v0/` | Wix site scaffolding | **Low** — scaffolding only |

### Top 20 Largest Language Files

| Size | File | Type |
|------|------|------|
| 1.08 MB | `foundation/scripts/sheets/node_modules/googleapis/CHANGELOG.md` | Vendor (exclude) |
| 463 KB | `smeal_major_canonical_pack/fetched_content.json` | Automated fetch |
| 124 KB | `foundation/data/indexes/chunk_index.json` | Generated index |
| 110 KB | `student_ai_hub_contributions/deliverables/ai_news_contribution_guide.pdf` | **Final deliverable** |
| 108 KB | `student_ai_hub_contributions/deliverables/system_overview.pdf` | **Final deliverable** |
| 93 KB | `foundation/data/snapshots/*.json` (multiple) | Automated snapshots |
| 49 KB | `demo_chatbot_v0/dist/dataset.json` | Generated dataset |
| 37 KB | `foundation/docs/.../how-businesses-use-ai.pdf` | Section PDF |
| 34 KB | `student_ai_hub_contributions/crawl_outputs/corpus.md` | Crawled content |
| 12 KB | `student_ai_hub_contributions/legacy/specs/contributor_workflow_spec.md` | **Rejected spec** |
| 8 KB | `ai_by_smeal_major_system/CHATGPT_STARTER_CONTEXT.md` | **Core workflow doc** |
| 7 KB | `ai_by_smeal_major_system/WITNESS_RULES.md` | **Core workflow doc** |
| 7 KB | `ai_by_smeal_major_system/STYLE_RULES.md` | **Core workflow doc** |
| 7 KB | `ai_by_smeal_major_context_bundles/finance/SECTION_PROMPTS.md` | Templated content |
| 7 KB | `student_ai_hub_contributions/voice/corpus_selected.md` | Voice grounding |

### Naming Patterns

| Pattern | Examples | Meaning |
|---------|----------|---------|
| `*_v0`, `*_v1`, `*_v2` | `demo_chatbot_v0/`, `search_chunks_v2.py` | Version iterations |
| `*_FINAL*` | `ai_news_contribution_guide_FINAL.md`, `FOUNDATION_REPOSITORY_FINAL_AUDIT` | Approved outputs |
| `legacy/` | `student_ai_hub_contributions/legacy/`, `ai_by_smeal_major_context_bundles/*/legacy/` | Deprecated versions |
| `draft*` | `ai_news_contribution_guide_draft.md` | Work in progress |
| `MAJOR_*.md` | `MAJOR_FINANCE.md`, `MAJOR_MARKETING.md` | Per-major content |
| `PACK*.md` | `PACK_GAP_REPORT.md` | System analysis |

---

## 2. Production Pattern Summary

### Pattern Type: **Convergent with Explicit Versioning**

The agent operated in a **convergent** pattern:
- Started with exploratory drafts
- Iterated through user feedback
- Converged to final deliverables
- Moved rejected versions to `legacy/` folders

### Evidence of Phases

| Phase | Evidence | Files |
|-------|----------|-------|
| **1. Discovery** | Crawling external sites, gathering corpus | `crawl_outputs/`, `fetched_content.json` |
| **2. Voice Grounding** | Creating style references from corpus | `voice_primer.md`, `corpus_selected.md` |
| **3. Drafting** | Multiple versions of guides | `drafts/ai_news_contribution_guide_draft.md`, `*_v1.md` |
| **4. Refinement** | User feedback applied iteratively | `contribution_guide.md` (shorter than v1) |
| **5. Finalization** | Concatenation to `*_FINAL.md`, PDF generation | `ai_news_contribution_guide_FINAL.md` → `.pdf` |
| **6. Cleanup** | Old versions moved to `legacy/` | `legacy/specs/`, `legacy/drafts/` |

### Production Evidence

**Iterative drafting visible in file sizes:**
- `ai_news_contribution_guide_v1.md` — 5,053 bytes (longer, more verbose)
- `contribution_guide.md` — 2,057 bytes (refined, shorter)

**Rejected complexity visible in legacy:**
- `contributor_workflow_spec.md` — 11,929 bytes (over-engineered Wix integration)
- Replaced by simpler `system_overview.md` — 3,174 bytes

**Convergence pattern:**
```
drafts/ai_news_contribution_guide_draft.md → drafts/ai_news_contribution_guide_v1.md
                                                            ↓
                                              source/contribution_guide.md
                                                            ↓
                                    source/ai_news_contribution_guide_FINAL.md
                                                            ↓
                                    deliverables/ai_news_contribution_guide.pdf
```

---

## 3. Operating Rules (Inferred from Artifacts)

### Tone Constraints

| Constraint | Evidence | Citation |
|------------|----------|----------|
| **Calm, descriptive** | "The Hub's voice is calm, clear, and student-readable." | `voice_primer.md:5` |
| **No hype/superlatives** | "Avoid: Hype, superlatives, or breathless language" | `voice_primer.md:32-33` |
| **No predictions** | "Avoid: Predictions about the future of AI" | `voice_primer.md:33` |
| **No advice** | "No 'students should' or 'it's recommended'" | `STYLE_RULES.md:26` |
| **Institutional voice** | "Institutional, descriptive tone" | `BUNDLE_BOUNDARIES.md:13-14` |

### Recurring Templates

| Template | Structure | File |
|----------|-----------|------|
| **AI News Entry** | Headline → Source → What Happened → Why It Matters → What to Watch | `contribution_guide.md:19-27` |
| **Major Page** | AI in [Major] → Where AI Appears → What AI Is Expected to Do → Limits → Key Considerations | `CHATGPT_STARTER_CONTEXT.md:70-75` |
| **Bundle Structure** | README.md, MAJOR_CANON.md, SHELL.md, SECTION_PROMPTS.md, BUNDLE_BOUNDARIES.md, NOTES.md | `INDEX.md:27-34` |

### Recurring Reasoning Moves

| Move | Pattern | Evidence |
|------|---------|----------|
| **Pressure-before-technology** | Start with field problem, then connect AI | `WITNESS_RULES.md:61-73` |
| **Field-native limits** | Limitations from discipline logic, not generic AI | `WITNESS_RULES.md:84-96` |
| **Reframe, don't summarize** | Key Considerations reframe rather than recap | `WITNESS_RULES.md:97-109` |
| **Do/Avoid lists** | Binary guidance format | `voice_primer.md:19-39` |
| **Explicit "Open Questions"** | Acknowledge unknowns without solving | `system_overview.md:60-69` |

### Clarification Behavior

**Evidence of asking clarifying questions:** Unknown. Chat logs not available.

**Evidence of assuming answers:**
- User feedback indicates over-engineering was corrected: "that's too much planning" (inferred from `contributor_workflow_spec.md` being moved to legacy)
- Voice correction: "it definitely reads like its trying to convince you and it feels ai written" (inferred from `system_overview.md` rewrite)

### Source Handling

| Behavior | Evidence |
|----------|----------|
| **Quoted sources** | `article_source.md` contains full AP News article text |
| **Canon-only claims** | "All claims must trace to PackA or PackB" (`STYLE_RULES.md:105-108`) |
| **Visible uncertainty** | "Words like 'may,' 'often,' 'can,' and 'typically' appear frequently" (`voice_primer.md:16`) |

---

## 4. Prompt Reconstruction

### Artifact Set: `student_ai_hub_contributions/` (AI News System)

| Inferred Prompt | Evidence | Confidence |
|-----------------|----------|------------|
| **Objective:** "Create a contribution guide for 'AI News That Matters' section" | Final deliverable matches this exactly | High |
| **Constraint:** Short, no hype, student-readable | `voice_primer.md` + final output length | High |
| **Constraint:** Include sample entry based on real news article | `article_source.md` + `ai_news_example_entry.md` | High |
| **Constraint:** No over-engineering | `contributor_workflow_spec.md` rejected → simpler `system_overview.md` | High |
| **Context:** Voice grounded in existing Hub content | `corpus_selected.md` + crawl outputs | High |
| **Optimization:** Deliverables should be sendable to non-technical audience | PDFs + simplified form spec | High |

### Artifact Set: `ai_by_smeal_major_system/` (Drafting System)

| Inferred Prompt | Evidence | Confidence |
|-----------------|----------|------------|
| **Objective:** "Design an authorship-preserving system for drafting major pages" | `SYSTEM_OVERVIEW.md` title | High |
| **Constraint:** AI assists but human owns | `AUTHORSHIP_GATES.md`, "Human rewrite required" | High |
| **Constraint:** Match existing examples exactly | `WITNESS_RULES.md` extracted from PDF | High |
| **Constraint:** Section-by-section, not batch | `SECTION_GENERATION_LOOP.md`, `USAGE_CHECKLIST.md` | High |
| **Context:** PDF examples as "witness" | Repeated references to `AI by Smeal Major.pdf` | High |
| **Optimization:** Portable to ChatGPT | `CHATGPT_STARTER_CONTEXT.md` as drop-in file | High |

### Artifact Set: `ai_by_smeal_major_context_bundles/` (7 Major Bundles)

| Inferred Prompt | Evidence | Confidence |
|-----------------|----------|------------|
| **Objective:** "Create identical bundle structure for each Smeal major" | 7 directories with identical file sets | High |
| **Template:** README, CANON, SHELL, PROMPTS, BOUNDARIES, NOTES | `INDEX.md:27-34` | High |
| **Content source:** PackB major descriptions | `MAJOR_CANON.md` files trace to PackB | High |

---

## 5. Context Spine + Drift List

### Context Spine (Stable Facts Across All Artifacts)

| # | Stable Fact | Files Where Present |
|---|-------------|---------------------|
| 1 | Voice is calm, clear, student-readable | `voice_primer.md`, `STYLE_RULES.md`, `system_overview.md` |
| 2 | No recommendations/advice | `BUNDLE_BOUNDARIES.md`, `CHATGPT_STARTER_CONTEXT.md`, `contribution_guide.md` |
| 3 | No specific tool/vendor names | `STYLE_RULES.md:96-98`, `CHATGPT_STARTER_CONTEXT.md:62-64` |
| 4 | All claims trace to canon (PackA/PackB) | `STYLE_RULES.md:105-108`, `BUNDLE_BOUNDARIES.md:8` |
| 5 | Human rewrite required before finalization | `CHATGPT_STARTER_CONTEXT.md:30-35`, `AUTHORSHIP_GATES.md` |
| 6 | Sections stand alone (no cross-references) | `WITNESS_RULES.md:23`, `CHATGPT_STARTER_CONTEXT.md:77` |
| 7 | Entry structure: Headline/Source/What Happened/Why It Matters/What to Watch | `contribution_guide.md:19-27` |
| 8 | Penn State / Smeal / Applied AI Club affiliation | `system_overview.md:84`, `google_form_spec.md:32` |
| 9 | Uncertainty made visible | `voice_primer.md:5`, `contribution_guide.md:27` |
| 10 | Pressure-before-technology pattern | `WITNESS_RULES.md:61-73`, `STYLE_RULES.md:139-147` |

### Drift List (Conflicting Statements)

| Conflict | Location A | Location B | Resolution |
|----------|------------|------------|------------|
| **Workflow complexity** | `contributor_workflow_spec.md`: Wix CMS + Velo + Apps Script | `system_overview.md`: Simple Google Form + editors | Simpler version adopted; complex moved to legacy |
| **Form specification** | `google_form_spec_complex.md`: Detailed automation | `google_form_spec.md`: Manual-first, simple | Simpler version adopted |
| **Sample entry source** | Originally WSJ (paywalled) | AP News (accessible) | AP News used for final |
| **Folder structure** | Earlier: `final/` folder | Final: `deliverables/` + `source/` | `deliverables/source` structure adopted |

**Note:** Drift was corrected within session. No persistent contradictions in final deliverables.

---

## 6. Risk Register

| Issue | Location | Severity | What to Verify | Suggested Fix |
|-------|----------|----------|----------------|---------------|
| **Fabricated sample entry** | `ai_news_example_entry.md` references real AP News article | Low | Verify article exists at stated URL | ✅ Article source preserved in `article_source.md` |
| **Over-specific pricing** | Example entry mentions "$200,000 per minute" | Low | Verify figure matches source | Check against `article_source.md` |
| **Temporal claim** | "January 2026" in contribution guide v1 | Medium | Verify dates are accurate | Date is hypothetical/illustrative (acceptable) |
| **Assumed publication name** | "The Chronicle of Higher Education" in sample | Low | This is an illustrative example | Clearly labeled as sample |
| **Generic filler** | "AI tools can produce errors..." | Low | Check for substantive content | Paragraph is appropriate context-setting |
| **Internal inconsistency** | None detected in final deliverables | N/A | — | — |
| **Overwriting brief** | `contributor_workflow_spec.md` over-engineered | Resolved | User flagged, moved to legacy | Already fixed |

### Hallucination Check

| Claim | Type | Status |
|-------|------|--------|
| Google Form field specifications | Verifiable | ✅ Standard Google Forms features |
| Pandoc PDF generation commands | Verifiable | ✅ Standard pandoc usage |
| AP News article content | Verifiable | ✅ Preserved in `article_source.md` |
| "Chronicle of Higher Education" sample | Illustrative | ✅ Labeled as sample, not real |

---

## 7. Compression Plan

### Recommended Context Pack Structure

```
CONTEXT_PACK/
├── CONTEXT.md          # Stable facts, goals, voice, constraints
├── DECISIONS.md        # What was chosen + why (updated per session)
├── STYLE.md            # Tone + formatting rules (static)
├── RUNLOG.md           # Each run: intent → outputs → open questions
└── TEMPLATES/          # Reusable structures
    ├── AI_NEWS_ENTRY.md
    └── MAJOR_PAGE.md
```

### File Contents

#### CONTEXT.md (Update: Rarely)

```markdown
# Project Context: Student AI Hub

## Identity
- Penn State Smeal College of Business
- Applied AI Club partnership
- Student-facing educational resource

## Voice
- Calm, clear, student-readable
- Describes rather than instructs
- Makes uncertainty visible
- No hype, predictions, or advice

## Constraints
- No tool/vendor names
- Canon-only claims
- Human rewrite required
- Sections stand alone
```

#### DECISIONS.md (Update: Each Session)

```markdown
# Decisions Log

## 2026-02-04: AI News Contribution System
- Rejected: Wix CMS automation (too complex)
- Adopted: Simple Google Form + manual review
- Reason: Optimize for launch speed, iterate later

## [Date]: [Decision]
- Rejected: [Option A]
- Adopted: [Option B]
- Reason: [Why]
```

#### STYLE.md (Update: Rarely)

```markdown
# Style Rules

## Do
- Short paragraphs, plain language
- Acknowledge limits and uncertainty
- Ground claims in sources

## Avoid
- Signposting ("more broadly," "it's important to note")
- Comma chains (break into separate sentences)
- Prescriptive language ("students should")

## Sentence Rhythm
- 10-20 words typical
- 25 words max for complex ideas
- Periods > commas for distinct thoughts
```

#### RUNLOG.md (Update: Each Run)

```markdown
# Run Log

## Run: 2026-02-04 18:00
**Intent:** Create AI News contribution guide and system overview
**Outputs:**
- deliverables/ai_news_contribution_guide.pdf
- deliverables/system_overview.pdf
- deliverables/google_form_spec.md
**Open Questions:**
- How often will entries be published?
- Who reviews submissions long-term?
**Next Step:** Build Google Form, test with sample submission
```

### Pasting Strategy

| Item | Paste Every Time? | Size |
|------|-------------------|------|
| CONTEXT.md | Yes | ~300 tokens |
| STYLE.md | Yes | ~400 tokens |
| DECISIONS.md (last 3 entries) | Yes | ~200 tokens |
| RUNLOG.md (last entry) | Yes | ~150 tokens |
| Relevant TEMPLATE | Only if creating that type | ~200 tokens |
| **Total per session** | — | **~1,250 tokens** |

### Token Savings

| Current Approach | Proposed Approach | Savings |
|------------------|-------------------|---------|
| Paste full `voice_primer.md` + `WITNESS_RULES.md` + `STYLE_RULES.md` (~3,500 tokens) | Paste compressed pack (~1,250 tokens) | **64%** |

---

## 8. Reproducible Workflow v1

### Session Startup Checklist

```
□ Load CONTEXT.md into chat
□ Load STYLE.md into chat
□ Load DECISIONS.md (last 3 entries) into chat
□ Load RUNLOG.md (last entry) into chat
□ State current goal clearly: "Today I need to [X]"
```

### Planning Phase

```
□ Agent generates 3-5 step plan with measurable outputs
□ Each step names:
    - What will be produced (file name)
    - What it depends on (inputs)
    - How to verify it's done (acceptance criteria)
□ Human approves plan before proceeding
```

### Production Phase

```
□ Produce artifacts in batches of 3-5 max per run
□ Each artifact is explicitly named and described
□ Agent marks drafts as "[DRAFT - Requires Review]"
□ No auto-finalization
```

### Gate Phase

```
□ Human reviews each batch
□ For each artifact:
    - APPROVE → Mark complete, move to next
    - REVISE → Specify what to change, agent regenerates
    - REJECT → Move to legacy folder, note why in DECISIONS.md
□ Update RUNLOG.md with outcomes
```

### Persist Phase

```
□ Update DECISIONS.md with any choices made
□ Update RUNLOG.md with:
    - Intent
    - Outputs (with file paths)
    - Open questions
    - Next step
□ If any artifacts are final, generate deliverables (PDF, etc.)
```

### Stop Rules

**Stop the session when:**
1. All planned steps complete with approved outputs
2. User explicitly says "that's enough for now"
3. Open questions exceed actionable scope (add to DECISIONS.md and stop)
4. 3+ artifacts rejected in a row (signal misalignment, pause for clarification)

**Do NOT continue if:**
- Producing more than 5 artifacts without approval gate
- Creating new categories without explicit request
- Generating "improvements" not in the plan

---

## 9. Missing Evidence + How to Recover

| Missing | Why It Matters | How to Recover |
|---------|----------------|----------------|
| **Chat logs** | Would reveal exact prompts, clarification questions, iteration cycles | Export Cursor chat history or copy/paste key exchanges |
| **Git commit history** | Would show precise edit sequence | Run `git log --oneline --since="2026-02-04"` |
| **Timestamp metadata** | Would show production order | Already partially visible via `ls -la` output |
| **User feedback messages** | Would reveal what triggered rewrites | Review chat logs if available |
| **Original WSJ/Reuters article attempts** | Would document failed access patterns | Noted in session context (not persisted in files) |

### Recovery Actions

1. **Export chat history** → Add to `RUNLOG.md` as retrospective
2. **Git commit log** → Would provide authoritative edit sequence
3. **Add timestamps to RUNLOG.md** → Future sessions should note start/end times

---

## Summary

### What the Agent Did Well

1. **Converged iteratively** — Drafts → refinement → final, with clear versioning
2. **Preserved rejected work** — `legacy/` folders maintain audit trail
3. **Grounded voice explicitly** — `voice_primer.md`, `corpus_selected.md` provide traceable style
4. **Separated source from deliverable** — `source/*.md` → `deliverables/*.pdf`
5. **Acknowledged uncertainty** — `system_overview.md` includes "Open Questions" section

### What Could Be Improved

1. **No persistent RUNLOG** — Session intent/outputs not captured in file
2. **No DECISIONS.md** — Choices (e.g., "rejected Wix automation") not formalized
3. **Context scattered** — Voice rules in `voice/`, style rules in `ai_by_smeal_major_system/`, duplicated
4. **No stop rule documentation** — Over-engineering happened before user corrected

### Recommended Next Steps

1. Create `CONTEXT_PACK/` directory with compressed files
2. Start logging sessions to `RUNLOG.md`
3. Formalize decisions in `DECISIONS.md`
4. Reference this audit when onboarding new agents/sessions

---

*Audit generated: February 4, 2026*
