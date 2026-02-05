# 05: Language Agent Failure Modes

## Sources Used

| Source | Type | Notes |
|--------|------|-------|
| This project's session history | Primary | Direct observation of failures |
| Academic research on LLM reliability | Secondary | arXiv papers, conference proceedings |
| OpenAI system card | Primary | Documented limitations |
| Anthropic model card | Primary | Documented limitations |
| Developer community post-mortems | Secondary | Selection bias toward failures |

**Confidence Level:** High for categories; Medium for specific rates

---

## Taxonomy of Failure Modes

### 1. Hallucinated Structure

**Definition:** Agent generates organizational patterns, file structures, or architectural elements that don't exist or aren't appropriate.

**Examples:**
- Creating folders that duplicate existing structure
- Proposing APIs that don't exist in the codebase
- Generating import statements for non-existent modules
- Inventing database schemas

**Evidence from this project:**
- Initial `contributor_workflow_spec.md` proposed Wix Velo integration with code that assumed APIs not verified to exist
- Agent proposed Google Apps Script with assumed trigger mechanisms

**Root cause:** Training data contains many similar-looking structures; model generalizes patterns without grounding.

**Detection:** Compare generated structure against actual filesystem; verify imports compile.

---

### 2. False Coherence

**Definition:** Agent produces output that reads as logical and well-structured but contains contradictions, non-sequiturs, or mismatched assumptions.

**Examples:**
- Document that introduces a concept, then uses it incorrectly
- Code that handles an error case that can't occur
- Step-by-step guide with steps in wrong order
- Claims that contradict earlier statements in same output

**Evidence from this project:**
- Earlier draft of `system_overview.md` had promotional tone that contradicted stated "calm, descriptive" voice
- Agent produced consistent-sounding prose that user flagged as "reads like its trying to convince you"

**Root cause:** Language models optimize for fluency and local coherence; global consistency is harder.

**Detection:** Human review for logical flow; explicit consistency checks.

---

### 3. Silent Assumption Drift

**Definition:** Agent makes assumptions about context, intent, or constraints that were not stated, and proceeds as if they were established.

**Examples:**
- Assuming a database exists when none was mentioned
- Treating a draft as final without explicit approval
- Expanding scope beyond what was requested
- Using a specific framework without being asked

**Evidence from this project:**
- Agent initially built complex Wix CMS integration when simple Google Form was sufficient
- Agent assumed automated workflow when manual was acceptable

**Root cause:** Models trained on "helpful" responses tend to fill in gaps proactively.

**Detection:** Explicit verification of assumptions; "show me what you assumed" prompts.

---

### 4. Over-Production

**Definition:** Agent generates more artifacts, features, or content than requested.

**Examples:**
- Creating 10 files when 2 were requested
- Adding error handling for impossible cases
- Generating comprehensive documentation for trivial features
- Building abstraction layers for one-time operations

**Evidence from this project:**
- `contributor_workflow_spec.md` (11KB) when simpler overview (3KB) was sufficient
- Agent tendency to add "helpful" features not in scope

**Root cause:** Training reward for comprehensive, thorough responses.

**Detection:** Count outputs; compare to explicit request; enforce stop rules.

---

### 5. Misplaced Confidence

**Definition:** Agent states uncertain information as fact, or proceeds with high certainty on unverified claims.

**Examples:**
- "This API accepts the following parameters..." (when not verified)
- "The file is located at..." (when not checked)
- "This will work because..." (when not tested)
- No hedging language on uncertain claims

**Evidence from this project:**
- Agent's claims about file structure were generally accurate (due to tool use)
- But initial assumptions about what user wanted were made with too much confidence

**Root cause:** Fluency training; lack of uncertainty quantification in outputs.

**Detection:** Explicit "verify this" prompts; hedging language enforcement.

---

### 6. Context Window Overflow

**Definition:** Agent loses earlier context as conversation or session extends, leading to contradictions or forgotten constraints.

**Examples:**
- Forgetting style constraints from early in conversation
- Repeating information already provided
- Contradicting earlier decisions
- "What file was that?" after discussing it earlier

**Evidence from this project:**
- Not directly observed (session was moderate length)
- But known risk for longer sessions

**Root cause:** Context window has fixed size; earlier tokens are dropped or compressed.

**Detection:** Explicit re-grounding; context pack at session start.

---

### 7. Tool Misuse

**Definition:** Agent uses tools incorrectly, inefficiently, or unnecessarily.

**Examples:**
- Reading entire file when grep would suffice
- Running terminal commands that fail silently
- Retrying failed operations without changing approach
- Using wrong tool for task

**Evidence from this project:**
- Web searches returned irrelevant results (query contamination)
- Agent retried searches rather than adjusting approach

**Root cause:** Tool selection is heuristic; error handling is limited.

**Detection:** Monitor tool call patterns; surface failures clearly.

---

### 8. Edit Misapplication

**Definition:** Agent's proposed edits don't apply correctly to target files.

**Examples:**
- `old_string` not found (file changed or wrong string)
- Edit applies to wrong location (non-unique match)
- Partial edit (only part of change applied)
- Syntax errors in generated code

**Evidence from this project:**
- Not directly observed (edits applied correctly)
- But this is a documented risk

**Root cause:** Diffs are generated speculatively; file state may change.

**Detection:** Verify edits; run linters; use file checksums.

---

### 9. Voice Drift

**Definition:** Agent's writing style changes over course of session, deviating from established voice.

**Examples:**
- Starting formal, becoming casual
- Starting neutral, becoming promotional
- Starting concise, becoming verbose
- Introducing "AI voice" patterns mid-stream

**Evidence from this project:**
- Agent maintained voice well when `voice_primer.md` was provided
- But initial drafts had promotional tone until corrected

**Root cause:** Style is a "soft" constraint; can be overridden by task pressure.

**Detection:** Style checklist; explicit voice grounding documents.

---

### 10. Scope Creep

**Definition:** Agent interprets requests broadly, adding features or content not explicitly requested.

**Examples:**
- "Fix this bug" → refactors entire file
- "Write a guide" → creates comprehensive documentation system
- "Add a button" → redesigns UI

**Evidence from this project:**
- User had to explicitly say "that's too much planning" to constrain scope
- Agent defaulted to comprehensive when minimal was appropriate

**Root cause:** Training on "helpful" responses; model lacks "good enough" heuristic.

**Detection:** Explicit scope statements; "do NOT" constraints; batch size limits.

---

## Research-Backed Failure Rates

(Based on academic literature and documented incidents)

| Failure Mode | Estimated Frequency | Severity |
|--------------|---------------------|----------|
| Hallucinated facts | 5-15% of claims (domain dependent) | High |
| Code syntax errors | 10-30% of generations | Medium (detectable) |
| Logic errors in code | 20-40% of non-trivial functions | High |
| Style drift | Common without grounding | Low |
| Over-production | Very common | Medium |
| Scope creep | Common without constraints | Medium |

**Note:** Rates are approximate and vary significantly by:
- Model (GPT-4 vs 3.5 vs Claude)
- Domain complexity
- Context quality
- Prompt specificity

---

## Mitigation Strategies

| Failure Mode | Mitigation |
|--------------|------------|
| Hallucinated structure | Verify against filesystem; use tools not memory |
| False coherence | Human review; explicit consistency checks |
| Silent assumptions | Ask "what did you assume?"; verify before proceeding |
| Over-production | Batch limits; explicit stop rules |
| Misplaced confidence | Require hedging; verify claims |
| Context overflow | Context packs; session limits |
| Tool misuse | Monitor tool calls; surface errors |
| Edit misapplication | Lint after edit; verify diffs |
| Voice drift | Voice grounding documents; style checklists |
| Scope creep | Explicit scope; "do NOT" constraints |
