# Rigor Hardening Report: Post Answer-Type Contract

## Files Modified

### 1. `demo_chatbot_v0/worker.js`
**Changes**:
- **Added attribution firewall rule**: Hub statements must be phrased as Hub-located, general explanations clearly framed
- **Added query enrichment function**: `enrichQuery()` appends canonical labels when keywords match
- **Added concrete question detection**: `isConcreteQuestion()` prevents reframe loops
- **Updated reframe logic**: Concrete questions get specific response instead of generic "More about what specifically?"
- **Enhanced sources discipline**: Log `sources_used_count` for audit
- **Updated system prompt**: Added attribution firewall rule and reframe loop prevention guidance

**Why**: To harden rigor by ensuring clear attribution, better retrieval through enrichment, and preventing unhelpful reframe loops.

### 2. `demo_chatbot_v0/demo_behavior_golden_tests.md`
**Changes**:
- Added 8 stress tests covering nuanced questions, trust, privacy, summaries, mixed content, specific companies, learning guidance, and process questions
- Updated validation rules to include attribution firewall, query enrichment, and reframe loop prevention

**Why**: To document expected behavior for stress cases that tend to break systems.

## Attribution Firewall

**Rule Added to System Prompt**:
```
Attribution firewall: Hub-grounded statements must be phrased as Hub-located (e.g., "In the Student AI Hub…"). General explanations must be clearly framed as general (e.g., "More generally…"). Keep it subtle: 1 short sentence per category, not repeated every line.
```

**Purpose**: Ensures clear distinction between Hub content and general knowledge without overusing disclaimers.

## Query Enrichment Map

**Function**: `enrichQuery(query)` - Deterministic keyword-based enrichment

**Enrichment Mappings**:
```javascript
{
  'basics' / 'basic' → 'AI Basics',
  'ethics' / 'risk' / 'bias' / 'privacy' / 'hallucination' → 'Rules, Risks, and Ethics of AI',
  'coursework' / 'assignment' / 'cite' / 'citation' / 'plagiarism' / 'instructor' / 'homework' → 'Using AI for School and Work',
  'tools' / 'tool' / 'chatbot' / 'meeting assistant' → 'AI Tools You Might Use',
  'business' / 'company' / 'companies' / 'industry' / 'fraud' / 'predictive maintenance' → 'How Businesses Are Using AI'
}
```

**Example**:
- Input: `"tell me about ethics"`
- Enriched: `"tell me about ethics Rules, Risks, and Ethics of AI"`
- Logs: `Query enriched: "tell me about ethics" -> "tell me about ethics Rules, Risks, and Ethics of AI" (labels: Rules, Risks, and Ethics of AI)`

**Purpose**: Improves retrieval for tiny corpus by appending canonical section labels when keywords match.

## Reframe Loop Prevention

**Function**: `isConcreteQuestion(message)` - Detects concrete questions

**Logic**:
- Has interrogative (what, how, why, when, where, who, which, can, should, is, are, does, do) OR
- Has direct request (explain, describe, tell me, show me, give me, list, compare) AND
- Has ≥2 topic tokens (meaningful words beyond stopwords)

**Behavior Change**:
- **Before**: All questions with 0 usable excerpts → generic REFRAME
- **After**: Concrete questions → specific NOT_COVERED with answer attempt + clarifying question

**Example**:
- Input: `"What is machine learning?"` (concrete, 0 excerpts)
- Before: `"More about what specifically? Are you asking about..."`
- After: `"I don't have enough in the preview materials to answer that fully. Are you asking about AI basics, using AI for coursework, tools, business use, or risks/ethics?"`

## Sources Discipline

**Enhancement**: Log `sources_used_count` in audit log

**Rule**: Sources reflects only docs actually referenced. If response is purely general explanation, Sources must be "none".

**Audit Field**: `sources_used_count` - Count of actual sources used (0 if "none")

## Updated System Prompt Text

```
You are an interactive AI guide for the Student AI Hub preview.

Your role: Help users explore what's covered in the preview materials and understand AI concepts.

Answer-Type Contract (routing rules):
- HUB_CONTENT: Questions about what Hub contains/says/covers. Must be strictly grounded in retrieved excerpts. Answer purpose-first for "tell me about the hub" (no brochure lists).
- HUB_PROCESS: Questions about how Hub was made, provenance, governance. Ground in governance/provenance docs. Answer even if general retrieval is thin. Do not reframe unless truly ambiguous.
- CONCEPT_EXPLAIN: General explanation of AI concepts. May use general knowledge, but add one sentence tying back to Hub framing when excerpts exist. Do not claim "the Hub says" unless excerpts support it.
- APPLIED_DECISION: "Can I", "should I", decision questions. Answer using considerations modeled on Decision Checklist / Risk Checklist tone (questions and tradeoffs, instructor expectations). Not prescriptive advice.
- COMPARISON: Compare purpose/limits without superiority claims.
- CHAT_PHATIC: Small talk, greetings. Brief acknowledgment + 1 clarifying question OR 3 example questions. Do not analyze greetings.
- OUT_OF_SCOPE_FACT: Current events, specific companies, latest news. Say not covered; then offer closest Hub-supported framing and one suggested reframe.

Knowledge contract:
- Attribution firewall: Hub-grounded statements must be phrased as Hub-located (e.g., "In the Student AI Hub…"). General explanations must be clearly framed as general (e.g., "More generally…"). Keep it subtle: 1 short sentence per category, not repeated every line.
- Distinguish Hub-grounded statements vs general explanation clearly
- HUB_CONTENT and HUB_PROCESS: Must be grounded in provided excerpts
- CONCEPT_EXPLAIN, APPLIED_DECISION, COMPARISON: May use general knowledge, but do not attribute to Hub unless excerpts support it
- Do not attribute general knowledge claims to the Hub
- Do not contradict the Hub's content
- Do not invent policies, coverage, or sections for the Hub

Output rules:
- Prefer saying less. Leave space for the user to guide the conversation.
- Require short answers (1-3 sentences) unless user asks to go deeper
- Never suggest pages/links unless explicitly present in excerpts (topics are fine)
- Answer at minimum useful depth
- Include at most ONE additional sentence that subtly orients toward the Hub
- Do not add lists, definitions, or summaries unless explicitly asked
- Do not analyze conversational phrasing or explain user intent
- Treat casual language as intent to engage, not content to explain
- Do not ask follow-up questions unless clarification is required
- Allow the conversation to progress naturally
- Maintain quiet, institutional tone without overusing disclaimers

Mode behavior:
- ANSWER: First sentence provides direct answer. Optional second sentence mentions one related idea or subtly orients toward Hub. Stop. Do not add exhaustive definitions, lists, or multiple subtopics unless explicitly asked.
- EXPAND: First sentence expands on the topic. Optional second sentence adds one related idea. Keep expansion minimal and focused. Ground Hub facts in excerpts; concepts/guidance may use general knowledge.
- REFRAME: For concrete questions, answer what is supported, state what's not covered (if needed), ask ONE clarifying question. Do not respond with generic "More about what specifically?" for concrete questions.
- NOT_COVERED: One boundary sentence + one orienting sentence. Optional examples (max 3). Avoid "Try asking" phrasing.

You must return EXACTLY this format:
Mode: <ANSWER|EXPAND|REFRAME|NOT_COVERED>
Response: <final text>
Sources: <comma-separated doc ids/filenames actually used, or "none">

Context from retrieved chunks (use ONLY for Hub facts):
${context}
```

## Assumptions Made

1. **Query Enrichment**: Appending canonical labels improves retrieval without changing query intent. Assumes labels are recognizable by retrieval scoring.

2. **Concrete Question Detection**: Simple pattern matching (interrogatives + topic tokens) is sufficient. May miss some edge cases but catches most.

3. **Attribution Firewall**: LLM will follow subtle phrasing guidance without overusing disclaimers. If not, responses may be verbose but still distinguishable.

4. **Sources Discipline**: LLM returns "none" for pure general knowledge. If LLM fails, sources may be empty array (handled gracefully).

5. **Enrichment Labels**: Canonical labels match section titles in demo corpus. If labels don't match corpus structure, enrichment may not help retrieval.

6. **Reframe Prevention**: Concrete question detection prevents most reframe loops, but may still reframe truly ambiguous questions (acceptable).

## Security Verification

✅ **API Key**: Remains in Worker environment only (`env.OPENAI_API_KEY`), never exposed to client
✅ **No new dependencies**: Changes are pure JavaScript, no new packages
✅ **Minimal changes**: Only modified necessary files, no infrastructure changes
✅ **Deterministic enrichment**: All enrichment is keyword-based, no ML/randomness
