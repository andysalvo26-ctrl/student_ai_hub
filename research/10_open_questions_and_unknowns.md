# 10: Open Questions and Unknowns

## Sources Used

| Source | Type | Notes |
|--------|------|-------|
| All prior research documents | Primary | Gaps identified during writing |
| This project's unresolved issues | Primary | Direct observation |
| Literature gaps | Secondary | Absence of clear guidance |

**Confidence Level:** N/A (this document surfaces uncertainty, not claims)

---

## Purpose

This document is a brutally honest inventory of:
- Questions that remain unanswered
- Assumptions that need testing
- Things that are unclear or under-documented
- Where future audits should focus

**This document contains no solutions. Only clarity about what we don't know.**

---

## Category 1: Tooling Unknowns

### How does Cursor's context assembly actually work?

**What we know:**
- It uses embeddings and semantic search
- It considers open files and selection
- It has heuristics we can't inspect

**What we don't know:**
- Exact ranking algorithm
- When it drops files that should be included
- How to debug when it misses relevant context
- Whether we can influence it beyond file selection

**Why it matters:** Context assembly failures cause downstream errors.

---

### What are Cursor's actual token limits?

**What we know:**
- Models have published context windows (128k for GPT-4)
- Cursor has UI for model selection

**What we don't know:**
- How much of window is used for system prompt
- When exactly truncation occurs
- How to detect when we're near limits
- Whether limits are per-turn or cumulative

**Why it matters:** Hitting limits causes context loss.

---

### How does Codex CLI differ from ChatGPT?

**What we know:**
- Both are OpenAI products
- CLI has local file access
- CLI is sandboxed

**What we don't know:**
- Exact sandbox restrictions
- Whether it shares ChatGPT's limitations
- Pricing model (API vs subscription)
- How it integrates with existing workflows

**Why it matters:** Codex CLI may be better for some workflows.

---

## Category 2: Workflow Unknowns

### What's the optimal batch size?

**What we observe:**
- 3-5 artifacts seems reasonable
- This is a guess, not a measured optimum

**What we don't know:**
- Does optimal size vary by task type?
- Is there a point of diminishing returns?
- How does batch size interact with context limits?

**Why it matters:** Wrong batch size wastes time or causes errors.

---

### When should you start a new session?

**What we observe:**
- Long sessions seem to degrade
- Fresh sessions have cleaner context

**What we don't know:**
- At what point does degradation start?
- Is it token-based or turn-based?
- Can degradation be detected?

**Why it matters:** Starting new session too early wastes context; too late causes errors.

---

### How much context pack is enough?

**What we implemented:**
- ~1,250 tokens in this project

**What we don't know:**
- Is this too little? Too much?
- What's the quality-cost tradeoff?
- Does marginal context have diminishing returns?

**Why it matters:** Context pack is re-used every session.

---

## Category 3: Quality Unknowns

### How often do agents silently hallucinate?

**What research says:**
- 5-15% for factual claims (varies by domain)
- Higher for code logic
- Lower for structure/formatting

**What we don't know:**
- Rate for this specific use case (language docs)
- Which hallucination types are most common
- How to predict when hallucination is likely

**Why it matters:** Undetected hallucinations are dangerous.

---

### What makes voice grounding work?

**What we observe:**
- Providing `voice_primer.md` produced consistent tone
- Do/Avoid lists seemed effective

**What we don't know:**
- How many examples are enough?
- Does example quality matter more than quantity?
- Can voice be grounded with just rules (no examples)?
- How fragile is grounding to prompt variations?

**Why it matters:** Voice grounding is central to language workflows.

---

### How do we measure language artifact quality?

**What we don't have:**
- Objective metrics (beyond human judgment)
- Automated quality checks for prose
- Comparison baselines

**Why it matters:** Can't improve what we can't measure.

---

## Category 4: Scaling Unknowns

### Does this approach scale beyond solo use?

**What we implemented:**
- Works for one person, one project

**What we don't know:**
- Multi-person context synchronization
- Merge conflicts in language artifacts
- Role-based access to context packs
- Team decision logging

**Why it matters:** Projects often have multiple contributors.

---

### Does this approach scale beyond small projects?

**What we implemented:**
- Works for ~50 files, ~500KB of content

**What we don't know:**
- Behavior at 500 files
- Behavior at 5MB of content
- Whether structure needs hierarchy
- Context pack scaling limits

**Why it matters:** Projects grow.

---

### What's the long-term maintenance burden?

**What we created:**
- CONTEXT.md, STYLE.md, DECISIONS.md, RUNLOG.md

**What we don't know:**
- How often do these need updates?
- What happens when they get stale?
- Who maintains them when leadership changes?
- How to onboard new maintainers?

**Why it matters:** Systems need ongoing care.

---

## Category 5: Cost Unknowns

### What's the actual cost of this workflow?

**What we estimate:**
- ~$1.50 per session at API rates
- $0 incremental with subscription

**What we don't know:**
- Actual token usage (not metered)
- Cost of retries and failures
- Cost comparison to manual work
- ROI calculation

**Why it matters:** Cost determines viability.

---

### When does subscription become cheaper than API?

**Breakeven analysis not done:**
- Subscription: $40/month (Cursor Pro)
- API: $X per session

**Unknown:** Number of sessions per month to reach breakeven.

---

## Category 6: Trust Unknowns

### How do we calibrate trust appropriately?

**What we implemented:**
- Approval gates, review models

**What we don't know:**
- Are current gates too strict? Too loose?
- How to measure trust calibration
- How trust should evolve over time
- How to prevent trust erosion

**Why it matters:** Over-trust causes errors; under-trust causes inefficiency.

---

### What happens when the agent is wrong and we don't catch it?

**What we assume:**
- Errors will be caught by review

**What we don't know:**
- Actual error escape rate
- Types of errors most likely to escape
- Downstream impact of escaped errors
- Detection mechanisms for escaped errors

**Why it matters:** Some errors have significant consequences.

---

## Category 7: Research Gaps

### There is no systematic literature on language-first agent workflows.

**What exists:**
- Code generation research (focused on correctness)
- Prompt engineering guides (mostly tactical)
- RAG papers (focused on retrieval)

**What's missing:**
- Workflow design patterns for language artifacts
- Empirical studies of language agent productivity
- Best practices grounded in evidence
- Failure mode catalogs

**Why it matters:** We're building on intuition, not evidence.

---

### There is no standard for context packs.

**What exists:**
- llms.txt (lightweight, content-focused)
- MCP (protocol for tool access)

**What's missing:**
- Standard for project context
- Portable formats across tools
- Versioning for context packs
- Validation for context pack completeness

**Why it matters:** Context packs are tool-specific and fragile.

---

## Category 8: Testing Needed

### Assumptions That Need Testing

| Assumption | How to Test |
|------------|-------------|
| 3-5 artifacts is optimal batch size | Vary batch size, measure quality and efficiency |
| Context pack saves 64% tokens | Measure actual usage with and without |
| Voice grounding produces consistent output | Compare outputs with/without grounding docs |
| Legacy preservation is valuable | Track how often legacy is referenced |
| Explicit gates prevent errors | Measure error rates with/without gates |

---

### Experiments That Should Be Run

| Experiment | Goal |
|------------|------|
| Context pack ablation | What's minimum effective context? |
| Batch size optimization | What's optimal for this use case? |
| Voice grounding variants | Rules only vs examples only vs both |
| Session length impact | At what point does quality degrade? |
| Cost tracking | What's actual token usage per session? |

---

## Where Future Audits Should Focus

1. **Token economics** — Measure actual usage, not estimates
2. **Error rates** — Track hallucinations, failures, escapes
3. **Voice consistency** — Measure drift over time
4. **Scaling behavior** — Test with larger projects
5. **Team dynamics** — Multi-person context management
6. **Tool comparison** — Cursor vs ChatGPT vs Codex for language work
7. **Long-term maintenance** — Context pack staleness, decision log growth

---

## Summary

**What we know:**
- Cursor/Codex can produce useful language artifacts
- Context packs help with continuity
- Approval gates prevent some errors
- Batch limits prevent sprawl

**What we don't know:**
- Optimal parameters for any of the above
- How well this scales
- True cost
- True error rate
- Whether this is better than alternatives

**Honest assessment:** This workflow is promising but unvalidated. It needs empirical testing.
