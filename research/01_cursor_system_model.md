# 01: Cursor System Model

## Sources Used

| Source | Type | Notes |
|--------|------|-------|
| Cursor documentation (cursor.com/docs) | Primary | Official docs, may lag features |
| Cursor GitHub discussions | Primary | User-reported behaviors |
| VS Code extension architecture | Primary | Cursor forks VS Code |
| Direct observation in this project | Primary | First-hand usage evidence |

**Confidence Level:** Medium-High (architecture is observable; internal details are inferred)

---

## What Cursor Actually Is

Cursor is a fork of Visual Studio Code that integrates language model capabilities directly into the editor. It is not a plugin or extension—it is a standalone application built on VS Code's codebase with proprietary AI integration.

### Core Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Cursor Application                      │
├─────────────────────────────────────────────────────────────┤
│  VS Code Core          │  Cursor AI Layer                   │
│  - File system access  │  - Model routing                   │
│  - Editor primitives   │  - Context assembly                │
│  - Extension host      │  - Tool execution                  │
│  - Terminal            │  - Diff application                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Indexing Layer                            │
│  - Codebase embeddings                                       │
│  - Symbol graph                                              │
│  - File content cache                                        │
│  - Git state awareness                                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Model Provider                            │
│  - Claude (Anthropic)                                        │
│  - GPT-4 / GPT-4o (OpenAI)                                   │
│  - Custom models (API key)                                   │
└─────────────────────────────────────────────────────────────┘
```

### Indexing System

Cursor builds a local index of the codebase:

1. **File content embeddings** — Semantic vectors for code chunks
2. **Symbol extraction** — Functions, classes, variables, imports
3. **Dependency graph** — Import/export relationships
4. **Git state** — Modified files, branch context

**How indexing works:**
- Runs on workspace open
- Updates incrementally on file save
- Stored locally (not sent to server until query)
- Size limits apply (large repos may be partially indexed)

**Observed limit:** Indexing can fail or be incomplete on very large monorepos (>100k files). The system does not clearly surface when this happens.

---

## Three Modes of Operation

### 1. Autocomplete (Tab)

**What it is:** Inline code suggestions as you type.

**How it works:**
- Uses file context (current file, recent edits)
- Does not use full codebase index
- Low latency priority
- Typically uses smaller/faster models

**Limits:**
- Context window is small (~1-4k tokens)
- No multi-file awareness
- Cannot reason about architecture

### 2. Chat (Cmd+L)

**What it is:** Conversational interface with codebase context.

**How it works:**
- Retrieves relevant files using semantic search
- Assembles context from index + open files + selection
- Sends to model with system prompt
- Returns markdown response

**Limits:**
- Context is assembled heuristically—may miss relevant files
- User has limited visibility into what context was included
- Long conversations accumulate context cost
- No persistent memory between sessions

### 3. Agent (Cmd+I / Composer / Agent mode)

**What it is:** Autonomous multi-step execution with tool access.

**How it works:**
1. User states intent
2. Agent reasons about plan
3. Agent calls tools: `read_file`, `write`, `search`, `run_terminal_cmd`, `grep`, etc.
4. Agent applies changes via diff
5. User approves or rejects changes
6. Loop continues until agent declares done or user stops

**Tool palette (observed):**
- `read_file` — Read file contents
- `write` — Create/overwrite file
- `search_replace` — Surgical edit
- `grep` — Pattern search
- `codebase_search` — Semantic search
- `run_terminal_cmd` — Shell execution
- `list_dir` — Directory listing
- `glob_file_search` — Find files by pattern
- `web_search` — External search (limited)

**Limits:**
- No persistent state between agent sessions
- Context accumulates within session (can hit token limits)
- Tool errors may not surface clearly
- Agent may "forget" earlier context in long sessions
- No built-in checkpointing or rollback

---

## Where "Magic" Is UX vs Model

### UX Magic (Not Model)

| Feature | Implementation |
|---------|----------------|
| Diff visualization | Editor primitives, not model output |
| File tree navigation | VS Code core |
| Git integration | VS Code + libgit2 |
| Syntax highlighting | TextMate grammars |
| Inline suggestions UI | Custom VS Code extension |
| Accept/reject buttons | Editor UI layer |

### Model Magic (Actually LLM)

| Feature | Implementation |
|---------|----------------|
| Understanding intent | Prompt engineering + model reasoning |
| Generating code | Model output |
| Multi-file edits | Model plans, tools execute |
| Semantic search | Embeddings + retrieval |
| Error diagnosis | Model reasoning on error messages |

### Hybrid (UX + Model)

| Feature | Implementation |
|---------|----------------|
| Context assembly | Heuristics + embeddings + model reranking |
| Diff application | Model generates diff, editor applies |
| Tool routing | Model decides, system executes |

---

## Limits and Failure Modes

### 1. Context Assembly Failures

**Problem:** Agent may not find relevant files.
**Cause:** Semantic search misses; file not indexed; query mismatch.
**Symptom:** Agent makes changes that conflict with existing code.

### 2. Token Exhaustion

**Problem:** Long sessions hit context limits.
**Cause:** Accumulated tool calls, file reads, conversation history.
**Symptom:** Agent "forgets" earlier context; responses become generic.

### 3. Diff Application Errors

**Problem:** Agent's edit doesn't apply cleanly.
**Cause:** File changed between read and write; incorrect match string.
**Symptom:** Edit fails silently or applies to wrong location.

### 4. Silent Assumption

**Problem:** Agent assumes information without verification.
**Cause:** Training data patterns; insufficient grounding.
**Symptom:** Generated code uses non-existent APIs or wrong patterns.

### 5. Tool Errors Obscured

**Problem:** Terminal commands fail in sandbox.
**Cause:** Network, git write, or filesystem restrictions.
**Symptom:** Agent retries or proceeds without acknowledgment.

### 6. Over-Production

**Problem:** Agent generates more than requested.
**Cause:** Model's tendency to be "helpful"; unclear scope.
**Symptom:** Unnecessary files, features, or refactoring.

---

## What Cursor Does Not Provide

| Missing Feature | Implication |
|-----------------|-------------|
| Persistent memory | Each session starts fresh |
| Cross-session context | Must re-establish context manually |
| Explicit decision logging | No built-in DECISIONS.md or RUNLOG.md |
| Rollback mechanism | Git is only safety net |
| Cost visibility | Token usage not surfaced to user |
| Confidence indicators | No signal when agent is uncertain |

---

## Observed Patterns in This Project

From the `AGENT_WORKFLOW_AUDIT.md` created earlier:

1. **Convergent production** — Agent iterated drafts, moved rejected versions to `legacy/`
2. **Voice grounding worked** — Providing `voice_primer.md` produced consistent tone
3. **User correction required** — Agent over-engineered until user said "too much planning"
4. **Folder organization emerged** — Agent created structure (`deliverables/`, `source/`, `legacy/`)
5. **PDF generation worked** — Terminal tools (`pandoc`) executed successfully

**Key insight:** Cursor's agent mode is powerful but requires explicit human gates to prevent sprawl and over-production.
