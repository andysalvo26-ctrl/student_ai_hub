# 02: Cursor User Workflows

## Sources Used

| Source | Type | Notes |
|--------|------|-------|
| This project's session history | Primary | Direct observation |
| Cursor community forums | Secondary | User-reported patterns |
| Reddit r/cursor | Secondary | Anecdotal, selection bias toward complaints |
| Twitter/X developer posts | Secondary | Survivorship bias toward successes |

**Confidence Level:** Medium (patterns observed here + community reports; no systematic study)

---

## Observed Real Workflows

### Workflow 1: Exploratory Development

**Pattern:** User has vague goal, uses agent to explore options.

**Steps:**
1. User states broad intent: "I need a contribution system for news entries"
2. Agent proposes structure
3. User reacts: "too complex" or "yes, proceed"
4. Agent iterates based on feedback
5. User accepts subset of outputs

**Evidence from this project:**
- Initial `contributor_workflow_spec.md` (11KB) was over-engineered
- User said "that's too much planning"
- Agent produced simpler `system_overview.md` (3KB)

**Risk:** Agent interprets vague prompts expansively; user must actively constrain.

---

### Workflow 2: Templated Production

**Pattern:** User has clear structure, agent fills in content.

**Steps:**
1. User provides template or examples
2. Agent replicates pattern across multiple files
3. User reviews batch
4. Edits are minor adjustments

**Evidence from this project:**
- 7 major context bundles with identical structure
- Each bundle: README, CANON, SHELL, PROMPTS, BOUNDARIES, NOTES
- Agent produced all 7 with consistent formatting

**Risk:** Template errors propagate; changes require bulk updates.

---

### Workflow 3: Style Grounding

**Pattern:** User provides voice/style documents, agent matches them.

**Steps:**
1. User creates or curates style examples (`voice_primer.md`, `corpus_selected.md`)
2. User references these in prompts
3. Agent outputs match tone
4. User refines based on specific drift

**Evidence from this project:**
- `voice_primer.md` created with Do/Avoid lists
- `corpus_selected.md` with example paragraphs
- Final outputs matched "calm, clear, student-readable" voice

**Risk:** Style grounding works for tone but less for domain-specific accuracy.

---

### Workflow 4: Research → Synthesis

**Pattern:** Agent gathers information, then produces artifact.

**Steps:**
1. User requests information gathering (crawl, search, read)
2. Agent produces raw corpus
3. User requests synthesis (guide, summary, spec)
4. Agent produces structured output

**Evidence from this project:**
- Crawled 13 Wix site pages → `crawl_outputs/`
- Selected paragraphs for voice → `corpus_selected.md`
- Synthesized contribution guide → `ai_news_contribution_guide.pdf`

**Risk:** Synthesis may drop relevant details; corpus should be preserved.

---

### Workflow 5: Iterative Refinement

**Pattern:** User provides feedback, agent revises.

**Steps:**
1. Agent produces draft
2. User provides specific feedback (length, tone, structure)
3. Agent applies edits
4. Repeat until approved

**Evidence from this project:**
- User: "it definitely reads like its trying to convince you"
- Agent rewrote `system_overview.md` with calmer tone
- User: Example "What Happened" section too list-heavy
- Agent synthesized into flowing prose

**Risk:** Multiple iterations accumulate context cost; earlier versions may be lost.

---

## How Users Control Scope

### Explicit Constraints

**Observed:**
- "Don't solve this now, just make the system open to it"
- "Optimize for launch speed"
- "We will build the system as we go"

**Effect:** Agent produces minimal viable version.

### Reference Documents

**Observed:**
- Providing `voice_primer.md` as constraint
- Providing PDF examples as "witness"
- Providing folder structure as template

**Effect:** Agent stays within provided bounds.

### Rejection and Correction

**Observed:**
- Moving `contributor_workflow_spec.md` to `legacy/`
- Explicit "that's too much planning"

**Effect:** Agent learns (within session) to be less expansive.

---

## How Iteration Actually Happens

### Within-Session Iteration

1. User prompts
2. Agent produces
3. User reviews in editor (diff view)
4. User accepts, rejects, or modifies
5. User provides follow-up prompt
6. Agent incorporates feedback

**Observed cycle time:** 1-5 minutes per iteration.

### Cross-Session Iteration

1. User opens new session
2. Context is lost
3. User must re-establish: "I'm working on X, here are the key files"
4. Agent re-indexes workspace
5. Work continues

**Observed friction:** Re-establishing context takes significant prompt effort.

---

## What Users Complain About When It Breaks

### Complaint 1: "It forgot what we just discussed"

**Cause:** Token limit reached; earlier context dropped.
**Frequency:** Common in long sessions.

### Complaint 2: "It made changes I didn't ask for"

**Cause:** Agent interpreted intent expansively.
**Example:** User asks to fix a bug; agent refactors surrounding code.

### Complaint 3: "It keeps trying to use tools that don't work"

**Cause:** Sandbox restrictions; agent doesn't learn from failures.
**Example:** Network requests blocked; agent retries.

### Complaint 4: "The edit didn't apply correctly"

**Cause:** `old_string` not unique; file changed.
**Example:** Search/replace matches wrong location.

### Complaint 5: "It's too slow"

**Cause:** Large context; multiple tool calls; model latency.
**Frequency:** Increases with session length.

### Complaint 6: "I can't tell what context it's using"

**Cause:** Context assembly is opaque.
**Effect:** User can't debug why agent missed relevant file.

---

## Successful Patterns (Observed)

### Pattern: Explicit Approval Gates

**What works:**
- User explicitly says "approved, proceed to next"
- Agent waits rather than auto-continuing

**Why it works:** Prevents runaway production.

### Pattern: Small Batches

**What works:**
- Request 1-3 files per prompt
- Review before continuing

**Why it works:** Catches errors early; manages context.

### Pattern: Reference File Grounding

**What works:**
- Provide style guide, examples, or templates
- Say "match this exactly"

**Why it works:** Constrains output space.

### Pattern: Legacy Folders

**What works:**
- Move rejected versions to `legacy/`
- Keep audit trail

**Why it works:** Preserves history; enables rollback.

### Pattern: Explicit "Do Not"

**What works:**
- "Do NOT add features beyond what's requested"
- "Do NOT refactor surrounding code"

**Why it works:** Overrides agent's helpfulness bias.

---

## Failed Patterns (Observed)

### Pattern: Batch Everything

**What failed:**
- Request all 7 major bundles at once
- Agent produces inconsistent results

**Why it failed:** Context saturation; no per-item review.

### Pattern: Trust Without Verification

**What failed:**
- Accept agent's claims about file contents
- Assume searches found everything

**Why it failed:** Agent can miss files; searches are heuristic.

### Pattern: Long Sessions Without Checkpoints

**What failed:**
- Work for 2+ hours without saving state
- Context accumulates until degradation

**Why it failed:** No built-in checkpointing; context budget exhausted.

---

## Workflow Recommendations (Emergent)

Based on observations:

1. **Start with grounding documents** — Style guide, examples, constraints
2. **Work in small batches** — 3-5 artifacts max per cycle
3. **Explicit approval gates** — "Approved. Next section."
4. **Preserve rejected work** — `legacy/` folders
5. **Log decisions externally** — DECISIONS.md, RUNLOG.md
6. **Re-ground between sessions** — Paste context pack
7. **Use explicit constraints** — "Do NOT" statements
8. **Verify agent's claims** — Read files it says it read
