# Answer-Type Contract Implementation Report

## Files Modified

### 1. `demo_chatbot_v0/worker.js`
**Changes**:
- **Replaced `classifyAnswerType()` with `classifyAnswerTypes()`**: New function returns array of answer types using deterministic keyword patterns
- **Added 7 answer types**: HUB_CONTENT, HUB_PROCESS, CONCEPT_EXPLAIN, APPLIED_DECISION, COMPARISON, CHAT_PHATIC, OUT_OF_SCOPE_FACT
- **Updated routing logic**: Different behavior based on answer types
- **Modified CHAT_PHATIC handling**: Brief acknowledgment + clarifying question, no greeting analysis
- **Updated HUB_PROCESS handling**: Answer even if general retrieval is thin, don't reframe unless ambiguous
- **Updated system prompt**: Encodes Answer-Type Contract with routing rules
- **Enhanced audit logging**: Logs answer types for debugging

**Why**: To route questions to appropriate response styles, increasing coverage while maintaining rigor.

### 2. `demo_chatbot_v0/demo_behavior_golden_tests.md`
**Changes**:
- Added 17-item test bank covering all answer types
- Updated expected behaviors for each type
- Added validation rules for Answer-Type Contract

**Why**: To document expected behavior for institutional review.

## Routing Rules Summary

### Answer Type → Behavior Mapping

1. **HUB_CONTENT** (what Hub contains/says/covers)
   - Requires usable excerpts (hard gate applies)
   - Answer purpose-first for "tell me about the hub" (no brochure lists)
   - Strictly grounded in retrieved excerpts

2. **HUB_PROCESS** (how Hub was made, provenance, governance)
   - Run retrieval against governance/provenance content
   - Answer even if general retrieval is thin
   - Do not reframe unless truly ambiguous
   - Grounded in governance/provenance docs

3. **CONCEPT_EXPLAIN** (what is, define, explain concepts)
   - May use general knowledge
   - Add one sentence tying back to Hub framing when excerpts exist
   - Do not claim "the Hub says" unless excerpts support it
   - Sources: "none" if pure general knowledge, excerpts if used

4. **APPLIED_DECISION** (can I, should I, decision questions)
   - Answer using considerations (Decision Checklist / Risk Checklist tone)
   - Questions and tradeoffs, instructor expectations
   - Not prescriptive advice
   - May use general knowledge but ground in Hub if available

5. **COMPARISON** (difference between, compare, vs)
   - Compare purpose/limits without superiority claims
   - May use general knowledge
   - Sources: excerpts if Hub covers it, "none" if general knowledge

6. **CHAT_PHATIC** (small talk, greetings, "tell me more")
   - Brief acknowledgment + 1 clarifying question OR 3 example questions
   - Do not analyze greetings
   - No retrieval, no LLM call

7. **OUT_OF_SCOPE_FACT** (latest news, specific companies, current events)
   - Say not covered
   - Offer closest Hub-supported framing
   - One suggested reframe
   - No retrieval, no LLM call

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
- REFRAME: One boundary sentence + one orienting sentence. Optional examples (max 3). Avoid "Try asking" phrasing.
- NOT_COVERED: One boundary sentence + one orienting sentence. Optional examples (max 3). Avoid "Try asking" phrasing.

You must return EXACTLY this format:
Mode: <ANSWER|EXPAND|REFRAME|NOT_COVERED>
Response: <final text>
Sources: <comma-separated doc ids/filenames actually used, or "none">

Context from retrieved chunks (use ONLY for Hub facts):
${context}
```

## Assumptions Made

1. **Keyword Pattern Matching**: Simple regex patterns are sufficient for deterministic classification. Patterns are checked in order, and multiple types can be detected.

2. **HUB_PROCESS Retrieval**: Assumes governance/provenance content is included in the general retrieval corpus. If not, HUB_PROCESS questions may still be answered from general retrieval if relevant.

3. **Sources Field**: LLM is instructed to return "none" for pure general knowledge responses. If LLM fails to follow this, sources may be empty array (handled gracefully).

4. **Applied Decision Tone**: Assumes Decision Checklist / Risk Checklist style is understood by LLM. If not, responses may vary but should still avoid prescriptive advice.

5. **Chat Phatic Detection**: "tell me more" is classified as CHAT_PHATIC if no meaningful tokens. This may conflict with vague follow-ups that should expand on previous topic. Current implementation prioritizes pattern matching over context.

6. **Default Classification**: If no patterns match, defaults to HUB_CONTENT if mentions hub/site/preview, otherwise CONCEPT_EXPLAIN. This ensures all questions get routed.

7. **Hard Gate Logic**: HUB_CONTENT and HUB_PROCESS require excerpts. Other types may proceed without excerpts (general knowledge allowed).

## Security Verification

✅ **API Key**: Remains in Worker environment only (`env.OPENAI_API_KEY`), never exposed to client
✅ **No new dependencies**: Changes are pure JavaScript, no new packages
✅ **Minimal changes**: Only modified necessary files, no infrastructure changes
✅ **Deterministic classification**: All routing is based on keyword patterns, no ML/randomness
