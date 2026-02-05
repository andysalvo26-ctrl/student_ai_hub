# 09: Design Principles for Language Repos

## Sources Used

| Source | Type | Notes |
|--------|------|-------|
| This project's repository structure | Primary | Direct observation |
| Earlier documents in this corpus | Primary | Synthesis |
| Documentation-as-code practices | Secondary | Established patterns |
| Knowledge management literature | Secondary | Academic/industry |

**Confidence Level:** High (grounded in earlier research documents)

---

## Core Principles

These principles emerge from research in documents 01-08.

---

### Principle 1: Explicit Separation of Concerns

**What:** Keep different types of language artifacts in separate locations.

**Structure:**
```
project/
├── source/              # Working documents
├── deliverables/        # Approved outputs
├── voice/               # Style grounding
├── legacy/              # Rejected/superseded
├── CONTEXT_PACK/        # Session context
└── research/            # Research corpus
```

**Why:**
- Prevents confusion about what's authoritative
- Makes audit trails visible
- Supports different review levels per type

**Evidence:** This project's structure evolved to this pattern through iteration.

---

### Principle 2: Source-Deliverable Distinction

**What:** Keep source files (markdown, drafts) separate from deliverables (PDFs, published content).

**Pattern:**
```
source/system_overview.md    →    deliverables/system_overview.pdf
source/contribution_guide.md →    deliverables/contribution_guide.pdf
```

**Why:**
- Source is editable; deliverable is frozen
- Source shows process; deliverable is result
- Can regenerate deliverables from source

**Implementation:**
- Markdown source in `source/`
- Generated PDFs in `deliverables/`
- Command to regenerate documented

---

### Principle 3: Legacy Preservation

**What:** Keep rejected and superseded versions; don't delete them.

**Pattern:**
```
legacy/
├── drafts/
│   ├── contribution_guide_v1.md
│   └── contribution_guide_draft.md
└── specs/
    └── workflow_spec_complex.md
```

**Why:**
- Enables audit ("what did we try?")
- Captures decisions ("why was this rejected?")
- Allows recovery if needed
- Shows evolution

**Warning:** Legacy folders can grow. Periodically clean or archive.

---

### Principle 4: Voice Grounding Is Infrastructure

**What:** Treat style documents as first-class infrastructure, not afterthoughts.

**Pattern:**
```
voice/
├── voice_primer.md       # Do/Avoid rules
└── corpus_selected.md    # Example paragraphs
```

**Why:**
- Style constraints prevent drift
- Examples are more powerful than rules
- Agent outputs match when grounded

**Evidence:** This project's outputs matched desired voice when `voice_primer.md` was provided.

---

### Principle 5: Context Pack Is Portable

**What:** Maintain a compressed context pack that can be used anywhere.

**Requirements:**
- Small enough to paste (<2,000 tokens)
- Complete enough to establish context
- Tool-agnostic (works in ChatGPT, Cursor, Claude)

**Content:**
- CONTEXT.md: Identity, goals, constraints
- STYLE.md: Voice rules
- DECISIONS.md: Recent choices
- RUNLOG.md: Recent session log

**Why:**
- Sessions in different tools can share context
- New team members can onboard
- Context survives tool changes

---

### Principle 6: Naming Conventions Signal Status

**What:** Use consistent naming to indicate artifact status.

**Patterns:**
| Pattern | Meaning |
|---------|---------|
| `*_v1.md`, `*_v2.md` | Version iterations |
| `*_draft.md` | Work in progress |
| `*_FINAL.md` | Approved, ready for production |
| `legacy/*` | Superseded |
| `CAPS_SNAKE_CASE.md` | System/meta documents |
| `lowercase_snake.md` | Content documents |

**Why:**
- Status visible at glance
- Reduces confusion
- Enables automation (e.g., ignore `legacy/`)

---

### Principle 7: Acceptance Has a Gate

**What:** Artifacts move from draft to accepted through explicit approval.

**Pattern:**
1. Agent produces draft in `source/`
2. Human reviews
3. Human approves with explicit statement
4. Approved version generates deliverable
5. Draft stays in `source/` (or moves to `legacy/` if superseded)

**Why:**
- Clear authorship
- Audit trail
- Prevents accidental publication

---

### Principle 8: Rejection Is Preserved, Not Deleted

**What:** When rejecting content, move to `legacy/`, don't delete.

**Pattern:**
```bash
# Bad
rm source/complex_workflow.md

# Good
mv source/complex_workflow.md legacy/specs/
```

**Why:**
- Decisions are captured
- Can reference later ("we tried this")
- Enables audit

---

### Principle 9: Templates Reduce Variance

**What:** Create templates for recurring artifact types.

**Pattern:**
```
CONTEXT_PACK/TEMPLATES/
├── AI_NEWS_ENTRY.md      # News entry structure
└── MAJOR_PAGE.md         # Major page structure
```

**Why:**
- Consistency across artifacts
- Faster production
- Easier review (structure is known)
- Reduces agent variance

---

### Principle 10: Sprawl Prevention Is Explicit

**What:** Define limits on what agent can produce per cycle.

**Rules:**
- Max 3-5 artifacts per batch
- Each batch requires approval before next
- Explicit scope in each prompt
- "Do NOT" statements for out-of-scope

**Why:**
- Agents naturally over-produce
- Limits catch errors early
- Prevents context saturation

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Flat Structure

**Problem:**
```
project/
├── guide.md
├── guide_v2.md
├── guide_final.md
├── guide_final_v2.md
├── old_guide.md
└── temp.md
```

**Why it's bad:**
- No clear status
- Version confusion
- No separation of concerns

**Fix:** Use structured folders with explicit status.

---

### Anti-Pattern 2: No Legacy Trail

**Problem:** Deleting rejected versions.

**Why it's bad:**
- Decisions not captured
- Can't audit history
- May repeat mistakes

**Fix:** Always move to `legacy/`, never delete.

---

### Anti-Pattern 3: Context in Comments

**Problem:** Project context lives only in code comments or scattered notes.

**Why it's bad:**
- Not portable
- Hard to find
- Can't paste to agent

**Fix:** Centralize in `CONTEXT_PACK/`.

---

### Anti-Pattern 4: Style by Feel

**Problem:** Voice/tone is implicit, not documented.

**Why it's bad:**
- Agents can't match it
- Inconsistent across authors
- Drifts over time

**Fix:** Explicit `voice_primer.md` with Do/Avoid.

---

### Anti-Pattern 5: Unbounded Production

**Problem:** Requesting "all the things" in one prompt.

**Why it's bad:**
- Quality suffers
- Context saturates
- Hard to review

**Fix:** Batch limits; explicit scope.

---

## Checklist for New Language Repos

Before starting:

- [ ] Create folder structure (source, deliverables, voice, legacy)
- [ ] Create CONTEXT.md (identity, goals, constraints)
- [ ] Create STYLE.md (voice rules)
- [ ] Create templates for recurring artifacts
- [ ] Define naming conventions
- [ ] Define approval workflow

During work:

- [ ] Produce in small batches
- [ ] Explicit approval between batches
- [ ] Update DECISIONS.md after choices
- [ ] Update RUNLOG.md after sessions
- [ ] Move rejected work to legacy/

After milestones:

- [ ] Regenerate deliverables from source
- [ ] Archive old legacy content if needed
- [ ] Update context pack if goals changed

---

## Summary Table

| Principle | One-Liner |
|-----------|-----------|
| Separation of concerns | Different artifact types in different folders |
| Source-deliverable distinction | Markdown source, generated deliverables |
| Legacy preservation | Keep rejected versions, don't delete |
| Voice grounding | Style documents are infrastructure |
| Portable context | Context pack works anywhere |
| Naming conventions | File names signal status |
| Acceptance gates | Explicit approval to accept |
| Rejection preserved | Move to legacy, don't delete |
| Templates | Reduce variance with structures |
| Sprawl prevention | Batch limits, explicit scope |
