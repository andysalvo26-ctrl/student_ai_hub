# 04: Codex Practical Capabilities

## Sources Used

| Source | Type | Notes |
|--------|------|-------|
| ChatGPT Plus/Pro interface | Primary | Direct observation |
| OpenAI API documentation | Primary | Official specs |
| Cursor tool implementations | Primary | Observable via this project |
| Developer community reports | Secondary | Anecdotal |

**Confidence Level:** Medium (capabilities observable; limits often discovered through failure)

---

## What Codex Can Realistically Do Today

### Local File Access

**ChatGPT (Code Interpreter):**
- Read uploaded files (drag and drop)
- Write files to sandbox
- Download generated files
- No access to user's local filesystem

**Cursor (via tools):**
- Read any file in workspace
- Write to workspace (with approval)
- Execute terminal commands
- Access to local filesystem within workspace

**Codex CLI (if applicable):**
- Read files with explicit permission
- Write to designated directories
- Sandboxed execution

| Capability | ChatGPT | Cursor | Codex CLI |
|------------|---------|--------|-----------|
| Read local files | No (upload only) | Yes | Yes (with permission) |
| Write local files | No (sandbox) | Yes (with approval) | Yes (sandboxed) |
| Persistent changes | No | Yes | Yes |
| Git operations | No | Limited (read only by default) | Unknown |

---

### Sandboxing

**ChatGPT sandbox:**
- Ephemeral filesystem
- Python + common libraries pre-installed
- No network access (with exceptions)
- No access to external APIs
- Session clears on close

**Cursor sandbox:**
- Workspace-scoped writes
- Network blocked by default
- Git writes blocked by default
- Can request permissions (`network`, `git_write`, `all`)
- Some syscalls blocked (USB, etc.)

**Practical implication:** Sandboxing prevents:
- Installing arbitrary packages
- Making external API calls
- Modifying git state
- Accessing files outside workspace

---

### Diff / PR Workflows

**ChatGPT:**
- No native diff capability
- Can generate diff-formatted text
- No PR integration
- User must manually apply

**Cursor:**
- Native diff visualization
- Search/replace edits
- File creation/overwrite
- No direct GitHub/GitLab integration
- User approves via UI

**Codex CLI:**
- Can generate diffs
- Can propose file changes
- No direct PR creation (would require GitHub API access)

| Workflow Step | ChatGPT | Cursor | Codex CLI |
|---------------|---------|--------|-----------|
| Generate diff | Text only | Native | Yes |
| Apply diff | Manual | UI | CLI approval |
| Create PR | No | No | No (without external tool) |
| Review PR | No | No | No |

---

### Terminal Execution

**ChatGPT:**
- Python execution only
- Pre-defined environment
- No shell access

**Cursor:**
- Full shell access within sandbox
- Can run npm, python, pandoc, etc.
- Network/git blocked unless permitted
- Long-running processes can run in background

**Practical observation from this project:**
- `pandoc` commands executed successfully
- File system operations worked
- Network requests blocked (sandbox)
- Git operations blocked (sandbox)

---

## Limitations Under ChatGPT Plans

### ChatGPT Free

| Capability | Available |
|------------|-----------|
| Code generation | Yes (limited) |
| Code Interpreter | No |
| File upload | Limited |
| Long context | No |
| GPT-4 access | No |

### ChatGPT Plus ($20/month)

| Capability | Available |
|------------|-----------|
| Code generation | Yes |
| Code Interpreter | Yes |
| File upload | Yes |
| Long context | Yes (128k) |
| GPT-4 access | Yes |
| Advanced Data Analysis | Yes |

### ChatGPT Pro ($200/month)

| Capability | Available |
|------------|-----------|
| Everything in Plus | Yes |
| o1 model access | Yes |
| Extended reasoning | Yes |
| Higher rate limits | Yes |

### API (Pay-per-use)

| Capability | Available |
|------------|-----------|
| Full model access | Yes |
| Function calling | Yes |
| Custom tools | Yes |
| No sandbox | User responsibility |
| Persistent sessions | No (user implements) |

---

## Documented Capability vs Inference

### Documented (High Confidence)

| Capability | Source |
|------------|--------|
| Python execution in sandbox | OpenAI docs, observable |
| File upload/download | OpenAI docs, observable |
| Context window sizes | OpenAI docs (128k GPT-4) |
| Function calling schema | OpenAI docs |
| Rate limits | OpenAI docs |

### Inferred (Medium Confidence)

| Capability | Basis |
|------------|-------|
| No persistent memory | Observed behavior; sessions don't remember |
| No cross-conversation context | Observed behavior |
| Sandbox clears on session end | Observed behavior |
| Cost per token | API pricing page (but actual costs vary) |

### Unknown (Low Confidence)

| Capability | Why Unknown |
|------------|-------------|
| Exact sandbox restrictions | Not fully documented |
| Internal context assembly | Black box |
| Model version behind API | Sometimes undisclosed |
| Token counting methodology | Approximations only |

---

## Practical Limits Discovered

### Limit 1: No True File System

ChatGPT's sandbox is ephemeral. Generated files disappear when session ends. Users must download artifacts.

**Workaround:** Download all generated files before closing.

### Limit 2: No External Network

ChatGPT cannot:
- Fetch URLs
- Call external APIs
- Access databases
- Scrape websites

**Workaround:** User provides content via upload.

### Limit 3: Library Constraints

Sandbox has pre-installed Python libraries. Cannot install arbitrary packages.

**Workaround:** Work within available libraries or switch to local execution.

### Limit 4: Session State Loss

No memory between conversations. Each conversation starts fresh.

**Workaround:** User maintains context externally (CONTEXT.md, RUNLOG.md).

### Limit 5: Output Length

Long outputs may be truncated. Model may "summarize" rather than fully generate.

**Workaround:** Request outputs in chunks; verify completeness.

---

## What's Realistic for Language Workflows

For the kind of work in this project (language artifacts, documentation, guides):

### Realistic with ChatGPT

- Draft text based on provided context
- Reformat and restructure documents
- Generate variations
- Apply style constraints
- Simple data processing (CSV, JSON)

### Realistic with Cursor

- All of the above, plus:
- Multi-file generation
- Workspace-aware context
- Terminal command execution
- Iterative editing with diffs
- Batch operations

### Not Realistic Without Custom Tooling

- Persistent memory across sessions
- Automatic PR creation
- Real-time collaboration
- Autonomous long-running tasks
- Production deployment

---

## Cost Considerations

### ChatGPT Plus

- Fixed $20/month
- Unlimited conversations (with rate limits)
- No per-token visibility
- Good for exploration

### API

- Pay per token
- GPT-4 Turbo: ~$10/1M input, ~$30/1M output
- Can add up quickly with long contexts
- Better for controlled, metered use

### Cursor

- Subscription model (~$20/month)
- Includes model access
- Additional API costs possible with heavy use
- Pro tier for higher limits

**Practical note:** This project used Cursor Pro (or equivalent). Token costs are absorbed in subscription.
