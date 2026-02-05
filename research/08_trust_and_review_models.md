# 08: Trust and Review Models

## Sources Used

| Source | Type | Notes |
|--------|------|-------|
| This project's approval patterns | Primary | Direct observation |
| Software code review practices | Secondary | Established patterns |
| AI safety research | Secondary | Academic literature |
| Enterprise AI governance | Secondary | Industry practices |

**Confidence Level:** High for patterns; Medium for effectiveness

---

## The Trust Problem

Language agents produce output that:
- Looks correct even when wrong
- Is confident without basis
- Can be verified only with effort
- May drift from intent over time

**Core question:** How do humans maintain appropriate trust—neither over-trusting nor under-trusting?

---

## Trust Spectrum

| Trust Level | Human Effort | Risk | When Appropriate |
|-------------|--------------|------|------------------|
| **Blind trust** | None | High | Never for important work |
| **Spot check** | Low | Medium | Trivial, reversible changes |
| **Review all** | High | Low | Important, irreversible work |
| **Human writes, AI assists** | Highest | Lowest | Critical, authoritative content |

**This project's position:** Between "Review all" and "Human writes, AI assists" for deliverables.

---

## Trust Model 1: Proposal-First

**Pattern:** Agent proposes; human approves or rejects.

**How it works:**
1. Agent generates proposal (diff, document, plan)
2. Human reviews proposal
3. Human approves, rejects, or requests modification
4. Only approved proposals are applied

**Implementation in Cursor:**
- Diff view shows proposed changes
- User clicks Accept or Reject per file
- Terminal commands require explicit run

**Strengths:**
- Clear approval gate
- Human sees before commit
- Easy to reject bad proposals

**Weaknesses:**
- Human fatigue (approving becomes routine)
- Partial understanding (user may not fully review)
- Approval != understanding

---

## Trust Model 2: Human Rewrite Required

**Pattern:** Agent produces draft; human rewrites before commitment.

**How it works:**
1. Agent generates draft (marked as draft)
2. Human reads draft
3. Human rewrites in their own words
4. Rewritten version becomes authoritative

**Implementation in this project:**
- `[DRAFT - Requires Human Review]` markers
- Style rules state "Human rewrite required"
- Final version reflects human ownership

**Strengths:**
- Human deeply engages with content
- Catches errors through reprocessing
- Establishes clear authorship

**Weaknesses:**
- High effort
- Not scalable for high volume
- Requires domain expertise

---

## Trust Model 3: Explicit Gates

**Pattern:** Workflow has defined checkpoints where human must approve.

**How it works:**
1. Define gates: plan approval, draft approval, final approval
2. Agent stops at each gate
3. Human explicitly approves to continue
4. Proceeding without approval is blocked

**Implementation in this project:**
- User says "approved, proceed to next section"
- Agent waits for explicit approval
- No auto-continuation

**Strengths:**
- Prevents runaway production
- Clear boundaries
- Audit trail of approvals

**Weaknesses:**
- Slows workflow
- Requires user attention
- Can become rubber-stamp

---

## Trust Model 4: Audit Trail

**Pattern:** All actions are logged; can be reviewed post-hoc.

**How it works:**
1. Agent logs every action (file read, write, command)
2. Logs are preserved
3. Human can review trail at any time
4. Anomalies can be detected retroactively

**Implementation in this project:**
- `RUNLOG.md` captures session outputs
- `DECISIONS.md` captures choices
- `legacy/` preserves rejected versions

**Strengths:**
- Non-blocking (audit is async)
- Catches issues later
- Enables learning

**Weaknesses:**
- Problems discovered after damage
- Requires someone to review logs
- Logs can be overwhelming

---

## Trust Model 5: Reversibility

**Pattern:** All changes are reversible; mistakes can be undone.

**How it works:**
1. Changes are made to version-controlled repository
2. Commits are granular and descriptive
3. Any change can be reverted
4. Risk tolerance is higher because damage is undoable

**Implementation:**
- Git is the safety net
- Commits after each approved batch
- Revert possible at any point

**Strengths:**
- Reduces fear of agent errors
- Enables experimentation
- Provides recovery path

**Weaknesses:**
- Requires Git discipline
- Some changes are hard to revert (deployments)
- Doesn't help with lost time

---

## Combining Models

**Recommended layered approach:**

| Layer | Model | Purpose |
|-------|-------|---------|
| 1 | Proposal-first | See before commit |
| 2 | Explicit gates | Control batch size |
| 3 | Audit trail | Capture history |
| 4 | Reversibility | Enable recovery |
| 5 | Human rewrite | For authoritative content |

**This project used all 5 layers:**
- Diff approval for each edit
- Section-by-section gates
- RUNLOG and DECISIONS for audit
- Git for reversibility
- Human voice enforcement for deliverables

---

## Trust Calibration

### When to Trust More

| Signal | Meaning |
|--------|---------|
| Task is reversible | Low-risk experimentation |
| Agent has grounding docs | Constrained output space |
| Output is verifiable | Can check correctness |
| Task is repetitive | Pattern is established |
| Small scope | Less to go wrong |

### When to Trust Less

| Signal | Meaning |
|--------|---------|
| Task is irreversible | High stakes |
| Novel domain | Agent may hallucinate |
| Output is hard to verify | Errors hide |
| Large scope | More failure points |
| No grounding | Output unconstrained |

---

## Red Flags

| Behavior | Risk | Response |
|----------|------|----------|
| Agent says "I've completed the task" | May not be accurate | Verify completion criteria |
| Agent produces much more than asked | Scope creep | Reject and restate scope |
| Agent is very confident | May be misplaced | Verify claims |
| Agent doesn't ask clarifying questions | Assumed understanding | Probe assumptions |
| Output looks polished | False coherence | Check substance, not style |

---

## Trust for Language Work

Language artifacts have unique trust challenges:

| Challenge | Why It's Hard |
|-----------|---------------|
| **Correctness** | No compiler; errors hide in prose |
| **Tone** | Subjective; hard to specify |
| **Completeness** | Missing content not obvious |
| **Consistency** | Contradictions subtle |
| **Authorship** | Who "owns" AI-drafted content? |

### Trust Strategies for Language

| Strategy | Implementation |
|----------|----------------|
| Voice grounding | `voice_primer.md` with Do/Avoid |
| Style checklist | Explicit items to verify |
| Section-by-section | Review each before continuing |
| Human rewrite | Rephrase before publishing |
| Attribution | Clear credit for AI assistance |

---

## Organizational Trust

For teams and organizations:

| Need | Solution |
|------|----------|
| Who can approve? | Define approval roles (Editor, Lead) |
| What's the workflow? | Document stages and gates |
| How is AI use disclosed? | Attribution policy |
| What's auditable? | Preserve drafts, logs, decisions |
| How do we improve? | Review failures; update constraints |

**This project's structure:**
- Contributor → Editor → Lead Editor (roles defined)
- Form → Review → Publish (workflow defined)
- AI use disclosed in guide ("use assistant as collaborator")
- `legacy/` folder preserves history

---

## Trust Anti-Patterns

| Anti-Pattern | Problem | Fix |
|--------------|---------|-----|
| **Blind approval** | Approve without reading | Require engagement before approval |
| **Rubber stamp** | Gate exists but always passes | Rotate reviewers; track reject rate |
| **Trust decay** | Initial care; later carelessness | Regular trust recalibration |
| **Over-trust** | Agent is always right | Document failures; maintain skepticism |
| **Under-trust** | Review everything forever | Identify low-risk patterns; reduce friction |
