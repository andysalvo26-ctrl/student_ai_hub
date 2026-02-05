# 06: Context and Memory Strategies

## Sources Used

| Source | Type | Notes |
|--------|------|-------|
| This project's CONTEXT_PACK | Primary | Direct implementation |
| LangChain documentation | Secondary | Memory patterns |
| Prompt engineering guides | Secondary | Context strategies |
| Developer community practices | Secondary | Anecdotal patterns |
| Research on retrieval-augmented generation | Secondary | Academic approaches |

**Confidence Level:** High for patterns; Medium for effectiveness claims

---

## The Fundamental Problem

Language models have no persistent memory. Every session starts fresh. Every context window has a limit. This creates two problems:

1. **Cross-session continuity** — How do you maintain project state across conversations?
2. **Within-session coherence** — How do you keep the model grounded as context grows?

---

## Strategy 1: Context Packs

**What it is:** A set of compressed, stable documents pasted at session start.

**Structure:**
```
CONTEXT_PACK/
├── CONTEXT.md      # Identity, goals, constraints
├── STYLE.md        # Voice and formatting rules
├── DECISIONS.md    # What was chosen + why
├── RUNLOG.md       # Session logs
└── TEMPLATES/      # Reusable structures
```

**Implementation in this project:**
- Created `CONTEXT_PACK/` directory
- `CONTEXT.md` (~300 tokens): Stable facts
- `STYLE.md` (~400 tokens): Voice rules
- `DECISIONS.md` (~200 tokens per 3 entries): Choices made
- `RUNLOG.md` (~150 tokens per entry): Session history

**Why it works:**
- Compressed representation fits in context
- Human-curated = high signal/noise
- Stable facts don't need regeneration
- Decisions prevent re-litigating choices

**Where it fails:**
- User must maintain it manually
- Can become stale if not updated
- Doesn't scale to very large projects
- Requires discipline to update after each session

---

## Strategy 2: Run Logs

**What it is:** Append-only log of each agent session's intent, outputs, and outcomes.

**Format:**
```markdown
## Run: 2026-02-04 18:00

**Intent:** Create contribution guide system
**Outputs:**
- deliverables/ai_news_contribution_guide.pdf
- deliverables/system_overview.pdf
**Open Questions:**
- How often to publish?
- Who reviews long-term?
**Next Step:** Build Google Form
```

**Why it works:**
- Explicit record of what was done
- Captures intent (which files don't show)
- Identifies open questions
- Enables session handoff

**Where it fails:**
- Requires manual logging
- Can become verbose
- Only as good as human discipline
- Doesn't capture rejected work (unless noted)

---

## Strategy 3: Decision Logs

**What it is:** Record of choices made and why alternatives were rejected.

**Format:**
```markdown
## 2026-02-04: Workflow Complexity

**Rejected:** Wix CMS + Velo automation
**Adopted:** Simple Google Form + manual review
**Reason:** Optimize for launch speed; iterate later
```

**Why it works:**
- Prevents re-litigating decisions
- Captures rationale (often lost)
- Helps new team members understand history
- Can be referenced in prompts

**Where it fails:**
- Decisions not always clear-cut
- Rationale can be post-hoc rationalization
- Requires active curation

---

## Strategy 4: Retrieval-Augmented Generation (RAG)

**What it is:** Embed documents in vector store; retrieve relevant chunks at query time.

**How it works:**
1. Documents are chunked and embedded
2. User query is embedded
3. Similar chunks are retrieved
4. Retrieved chunks are added to prompt
5. Model generates with augmented context

**When it's appropriate:**
- Large document collections
- Knowledge base queries
- When context is too large to paste

**When it's not appropriate:**
- Small projects (overhead not worth it)
- Highly interdependent content (chunking loses structure)
- When full document context matters

**This project's situation:** Not used. Project is small enough that curated context packs suffice.

---

## Strategy 5: Prompt Memory

**What it is:** Include memory-like content directly in the prompt.

**Approaches:**

| Approach | Method | Limit |
|----------|--------|-------|
| Full history | Include all prior conversation | Context overflow |
| Summarized history | LLM summarizes prior turns | Lossy |
| Key points only | Human-curated summary | Manual effort |
| Rolling window | Keep last N turns | Loses early context |

**This project's approach:** Key points only (via CONTEXT_PACK).

---

## Strategy 6: External Memory Systems

**What it is:** Store state outside the model; reference by ID or query.

**Examples:**
- Database with session state
- Git repository as "memory"
- Task management system (JIRA, Linear)
- Custom memory stores (LangChain, etc.)

**Why it works:**
- Unlimited storage
- Structured access
- Persistent across any tool

**Where it fails:**
- Requires infrastructure
- Model can't directly access (needs tools)
- Added complexity

**This project's approach:** Git repository is implicit memory. Files are the state.

---

## What Actually Works (Observed)

Based on this project:

### Works Well

| Strategy | Evidence |
|----------|----------|
| Context pack at session start | Maintained voice, constraints |
| Style grounding documents | `voice_primer.md` produced consistent tone |
| Explicit templates | Major bundles all followed same structure |
| Decision log | Would have helped avoid re-discussing Wix complexity |
| Legacy folders | Preserved history; enabled audit |

### Works Partially

| Strategy | Evidence |
|----------|----------|
| Run log | Created retroactively; would have been valuable throughout |
| Batch production | Worked, but user had to enforce limits |

### Not Used / Unclear

| Strategy | Why |
|----------|-----|
| RAG | Project too small |
| External memory | Not needed for scope |
| Rolling window | Session not long enough to need |

---

## Token Cost of Memory Strategies

| Strategy | Token Cost | Maintenance |
|----------|------------|-------------|
| Full context pack | ~1,250 tokens/session | Low (stable docs) |
| Run log (last entry) | ~150 tokens | Per session |
| Decision log (3 entries) | ~200 tokens | As needed |
| Full conversation history | Grows unbounded | None |
| RAG | Varies by retrieval count | Infrastructure |

**Key insight:** Compressed, curated context is much cheaper than full history.

---

## Where Memory Strategies Break Down

### 1. Context Pack Staleness

**Problem:** Pack not updated; model works from outdated assumptions.
**Mitigation:** Update after each session; date-stamp entries.

### 2. Decision Log Gaps

**Problem:** Important decisions not logged; rationale lost.
**Mitigation:** Log immediately after decision; make it a habit.

### 3. Run Log Overhead

**Problem:** Logging feels like overhead; gets skipped.
**Mitigation:** Make it minimal; template-based.

### 4. Cross-Tool State

**Problem:** State in Cursor doesn't transfer to ChatGPT.
**Mitigation:** Context pack is portable text; paste anywhere.

### 5. Large Project Scale

**Problem:** Context pack can't cover everything.
**Mitigation:** Hierarchical packs (project → domain → task).

---

## Recommended Memory Architecture

For language-first, repo-backed workflows:

```
CONTEXT_PACK/                    # Paste at session start
├── CONTEXT.md                   # ~300 tokens, stable
├── STYLE.md                     # ~400 tokens, stable
├── DECISIONS.md                 # Update after decisions
├── RUNLOG.md                    # Update after each session
└── TEMPLATES/                   # Reference as needed

Repository (Git)                 # Implicit memory
├── source/                      # Current work
├── deliverables/                # Approved outputs
└── legacy/                      # Rejected/superseded

External (Optional)
├── Issue tracker                # Tasks and status
├── Wiki/docs                    # Extended documentation
└── CI/CD                        # Automation state
```

**Pasting strategy:**
- Always: CONTEXT.md + STYLE.md
- Usually: DECISIONS.md (last 3) + RUNLOG.md (last entry)
- As needed: Relevant templates
- Never: Full history (too expensive)
