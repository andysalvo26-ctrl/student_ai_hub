# Research Corpus: Agent Workflow & Tooling Audit

## What This Corpus Is

This is a 10-document research corpus examining language-first, repo-backed agent workflows—specifically the kind used in Cursor and Codex-style development.

**Purpose:** Build a thinking substrate for auditing and designing agent workflows.

**Scope:** How Cursor works, what Codex can do, where agents fail, how to maintain context, what things cost, and how to build trust.

**What it is NOT:**
- A design document (no final recommendations)
- A tutorial (no step-by-step instructions)
- A product comparison (no vendor rankings)
- Complete (many questions remain open)

---

## Document Inventory

| File | Topic | Confidence |
|------|-------|------------|
| `01_cursor_system_model.md` | Cursor architecture, modes, limits | Medium-High |
| `02_cursor_user_workflows.md` | How users actually work with Cursor | Medium |
| `03_codex_design_intent.md` | OpenAI's goals for Codex | Medium |
| `04_codex_practical_capabilities.md` | What Codex can realistically do | Medium |
| `05_language_agent_failure_modes.md` | Where agents go wrong | High |
| `06_context_and_memory_strategies.md` | How to maintain continuity | High |
| `07_cost_and_scaling_realities.md` | Token costs, subscription economics | High |
| `08_trust_and_review_models.md` | How to maintain appropriate trust | High |
| `09_design_principles_for_language_repos.md` | Principles for repo structure | High |
| `10_open_questions_and_unknowns.md` | What we don't know | N/A |

---

## Suggested Reading Order

### If you want to understand the system:

1. `01_cursor_system_model.md` — What Cursor is
2. `03_codex_design_intent.md` — What Codex is meant to do
3. `04_codex_practical_capabilities.md` — What it can actually do

### If you want to understand risks:

1. `05_language_agent_failure_modes.md` — Where things go wrong
2. `08_trust_and_review_models.md` — How to maintain trust
3. `10_open_questions_and_unknowns.md` — What remains uncertain

### If you want to design a workflow:

1. `06_context_and_memory_strategies.md` — How to maintain context
2. `09_design_principles_for_language_repos.md` — How to structure repos
3. `07_cost_and_scaling_realities.md` — What it will cost
4. `02_cursor_user_workflows.md` — What patterns work

### If you want an honest assessment:

1. `10_open_questions_and_unknowns.md` — Start here

---

## How This Corpus Was Made

This corpus was generated in a Cursor session on February 4, 2026. It draws on:

1. **Primary observation** — This project's actual usage of Cursor
2. **Primary documentation** — Official Cursor/OpenAI/Anthropic docs
3. **Training knowledge** — Model's understanding of agent systems
4. **Secondary sources** — Community reports, academic papers (not directly verified)

**Limitations:**
- Web search during production returned irrelevant results (query contamination)
- Some claims are inferences, not verified facts
- Confidence levels are subjective assessments

---

## Confidence Levels Explained

Each document includes a confidence assessment:

| Level | Meaning |
|-------|---------|
| **High** | Based on direct observation or official documentation |
| **Medium-High** | Observable behavior + reasonable inference |
| **Medium** | Inference from partial evidence |
| **Low** | Speculation or sparse evidence |
| **N/A** | Document surfaces uncertainty, not claims |

---

## What This Corpus Is NOT Meant to Do

1. **Replace primary sources** — Always check official docs
2. **Provide final answers** — This is research, not recommendations
3. **Be complete** — Many questions remain open (see doc 10)
4. **Be current forever** — Tools change; information ages
5. **Design your system** — That's the next step after this corpus

---

## How to Use This Corpus

### For Auditing an Existing Workflow

1. Read `05_language_agent_failure_modes.md` for risk taxonomy
2. Compare your workflow to patterns in `02_cursor_user_workflows.md`
3. Check your context strategy against `06_context_and_memory_strategies.md`
4. Review your trust model against `08_trust_and_review_models.md`

### For Designing a New Workflow

1. Read `09_design_principles_for_language_repos.md` for structure
2. Review `07_cost_and_scaling_realities.md` for economics
3. Plan for failures in `05_language_agent_failure_modes.md`
4. Check `10_open_questions_and_unknowns.md` for blind spots

### For Onboarding a Team Member

1. Start with `01_cursor_system_model.md` for tool understanding
2. Continue with `06_context_and_memory_strategies.md` for workflow
3. End with `08_trust_and_review_models.md` for review expectations

---

## Next Steps (Outside This Corpus)

1. **Run experiments** — Test assumptions in doc 10
2. **Measure costs** — Track actual token usage
3. **Track errors** — Log agent failures and escapes
4. **Update corpus** — Revise as tools and understanding evolve
5. **Design system** — Use corpus to inform workflow design

---

## Provenance

- **Generated:** February 4, 2026
- **Tool:** Cursor + Claude
- **Project:** Student AI Hub
- **Session context:** Full project available in repository

---

*This corpus is the substrate, not the structure. Build on it.*
