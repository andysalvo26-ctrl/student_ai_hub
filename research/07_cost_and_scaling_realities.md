# 07: Cost and Scaling Realities

## Sources Used

| Source | Type | Notes |
|--------|------|-------|
| OpenAI pricing page | Primary | Official rates |
| Anthropic pricing page | Primary | Official rates |
| Cursor pricing | Primary | Observable |
| This project's usage patterns | Primary | Direct observation |
| Developer cost reports | Secondary | Anecdotal |

**Confidence Level:** High for pricing; Medium for usage estimates

---

## Token Economics

### Current Pricing (as of Feb 2026)

| Model | Input (per 1M tokens) | Output (per 1M tokens) |
|-------|----------------------|------------------------|
| GPT-4 Turbo | ~$10 | ~$30 |
| GPT-4o | ~$5 | ~$15 |
| GPT-3.5 Turbo | ~$0.50 | ~$1.50 |
| Claude 3.5 Sonnet | ~$3 | ~$15 |
| Claude 3 Opus | ~$15 | ~$75 |

**Note:** Prices change. Check current rates.

### What Tokens Mean Practically

| Content Type | Approximate Tokens |
|--------------|-------------------|
| 1 page of prose | ~400-500 tokens |
| 1 source file (100 lines) | ~200-400 tokens |
| Full context pack | ~1,250 tokens |
| This project's audit document | ~3,500 tokens |
| Long conversation (50 turns) | ~20,000-50,000 tokens |

---

## Subscription vs API

### ChatGPT Plus ($20/month)

**Includes:**
- Unlimited GPT-4 conversations (with rate limits)
- Code Interpreter
- File upload/download
- Long context (128k)

**Best for:**
- Exploration
- Variable usage
- Users who don't track tokens

**Limits:**
- Rate limits on heavy usage
- No programmatic access
- No custom tools

### API (Pay-per-use)

**Best for:**
- Metered, predictable use
- Custom integrations
- High-volume batch processing

**Risks:**
- Costs can spike unexpectedly
- No spending caps by default
- Per-token charges add up with long contexts

### Cursor ($20/month or $40/month Pro)

**Includes:**
- Editor + AI integration
- Model access (Claude, GPT-4)
- Unlimited* usage

**Best for:**
- Daily development
- Codebase-aware assistance
- Iterative editing

**Note:** "Unlimited" has practical limits (rate throttling on heavy use).

---

## Hidden Costs

### 1. Context Accumulation

**Problem:** Each tool call adds to context. Long sessions become expensive.

**Example:**
- Session starts: 1,250 tokens (context pack)
- 10 file reads: +5,000 tokens
- 20 tool calls: +8,000 tokens
- Conversation: +10,000 tokens
- **Total:** 24,250 tokens input per response

**At GPT-4 Turbo rates:** ~$0.24 per response (just input)

### 2. Retries and Failures

**Problem:** Failed tool calls still consume tokens.

**Example:**
- Web search returns irrelevant results: tokens spent
- Edit fails to apply: tokens spent
- Retry with different approach: more tokens

**This project:** Web searches failed multiple times before corpus was built.

### 3. Over-Production

**Problem:** Agent generates more than needed; all output tokens are billed.

**Example:**
- Request: "Create a simple spec"
- Agent produces: 11KB comprehensive document
- User rejects, requests simpler version
- **Cost:** Both versions billed

### 4. Long Sessions Without Checkpoints

**Problem:** Context grows; each response costs more.

**Mitigation:** Start fresh sessions; paste compressed context.

---

## Where "Free" Workflows Break Down

### ChatGPT Free Tier

**Limits:**
- No GPT-4
- No Code Interpreter
- Limited file handling
- Rate limits

**Breaks down when:**
- Complex code generation needed
- File processing required
- Long context needed

### Academic/Startup Credits

**Limits:**
- Credits expire
- May not cover all models
- Usage tracking may lag

**Breaks down when:**
- Credits exhausted unexpectedly
- Project runs longer than planned

### Subscription "Unlimited"

**Limits:**
- Rate throttling
- Fair use policies
- May not cover all features

**Breaks down when:**
- Burst usage (many requests quickly)
- Automated/scripted access
- Team sharing single account

---

## Cost Modeling for This Project

### Estimated Usage (One Session, ~2 hours)

| Activity | Tokens (Input) | Tokens (Output) |
|----------|----------------|-----------------|
| Context loading | 5,000 | 0 |
| File reads (30 files) | 15,000 | 0 |
| Search/grep calls | 3,000 | 0 |
| Conversation | 10,000 | 0 |
| Agent responses | 0 | 25,000 |
| Generated files | 0 | 15,000 |
| **Total** | ~33,000 | ~40,000 |

### Cost at API Rates (GPT-4 Turbo)

- Input: 33,000 tokens × $10/1M = $0.33
- Output: 40,000 tokens × $30/1M = $1.20
- **Total: ~$1.53 for session**

### Cost at Subscription

- Cursor Pro: $40/month (unlimited within limits)
- **Cost: $0 incremental** (subscription covers it)

**Key insight:** Subscription is dramatically cheaper for regular use.

---

## Scaling Considerations

### Solo Developer

| Approach | Recommendation |
|----------|----------------|
| Occasional use | ChatGPT Plus ($20/month) |
| Daily use | Cursor Pro ($40/month) |
| Heavy automation | API with spending caps |

### Small Team (3-5)

| Approach | Recommendation |
|----------|----------------|
| Shared exploration | ChatGPT Team |
| Development work | Cursor Pro per seat |
| Shared knowledge | Context packs in repo |

### Organization

| Approach | Recommendation |
|----------|----------------|
| Enterprise features | ChatGPT Enterprise / Cursor Business |
| Custom integrations | API with governance |
| Compliance needs | Enterprise tiers |

---

## Cost Reduction Strategies

### 1. Compressed Context

**Strategy:** Paste 1,250 tokens instead of 10,000.
**Savings:** 87.5% on input tokens.

### 2. Session Limits

**Strategy:** Cap sessions at 1 hour; restart with fresh context.
**Savings:** Prevents context bloat.

### 3. Batch Approval

**Strategy:** Review 3-5 artifacts before continuing (not 1 at a time).
**Savings:** Fewer round-trips.

### 4. Model Selection

**Strategy:** Use GPT-3.5 or smaller models for drafts; GPT-4 for finals.
**Savings:** 10-20x on draft costs.

### 5. Explicit Scope

**Strategy:** "Generate exactly 3 files" prevents over-production.
**Savings:** Output tokens for unwanted content.

---

## Warning Signs

| Sign | Problem | Action |
|------|---------|--------|
| Session feels slow | Context saturation | Start fresh session |
| Agent repeating itself | Lost context | Re-ground with pack |
| Unexpectedly high bill | Runaway usage | Set spending caps |
| Quality degrading | Token fatigue | Reduce session scope |
| Retries not helping | Wrong approach | Change strategy, not retry |

---

## Conservative Estimates

For a language-first, repo-backed workflow (like this project):

| Scenario | Monthly Cost |
|----------|--------------|
| Light use (weekly sessions) | $20-40 (subscription) |
| Medium use (daily sessions) | $40-80 (subscription or low API) |
| Heavy use (continuous) | $80-200 (API or enterprise) |

**Key variables:**
- Session length
- Context size
- Output volume
- Model choice
- Retry rate
