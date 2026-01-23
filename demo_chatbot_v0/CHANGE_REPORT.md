# CHANGE REPORT: Enhancement for Impressive Interactive AI Experience

## Files Modified

### 1. `demo_chatbot_v0/worker.js`
**Changes**:
- **Strengthened usable excerpt logic**: Replaced "exists in array" with deterministic filter using MIN_SCORE (0.05) OR MIN_OVERLAP (2 tokens)
- **Added lexical overlap calculation**: Tokenizes query and chunk text/title, counts overlapping tokens
- **Added `filterUsableChunks()` function**: Filters chunks by score/overlap thresholds, returns usable count and logging data
- **Enhanced audit logging**: Added `usable_count`, `min_score_used`, `overlap_used` fields
- **Replaced system prompt**: Clean newline-formatted "Interactive Preview AI Policy" with explicit grounding rules
- **Upgraded mode descriptions**: ANSWER includes bullets, EXPAND includes key ideas, REFRAME/NOT_COVERED include targeted clarifying questions
- **Updated templates**: Greeting introduces as AI guide, reframe/not-covered include ONE targeted clarifying question + examples
- **Improved user context**: Only passes last message + active topic (not full chat history) to reduce drift

**Why**: To strengthen grounding gate, make responses feel impressive and helpful, reduce over-refusal with targeted clarifying questions.

### 2. `demo_chatbot_v0/demo_behavior_golden_tests.md`
**Changes**:
- Updated expected behaviors to reflect "impressive AI guide" style
- Added validation rules for usability filter and targeted clarifying questions
- Updated test cases to expect structured responses (bullets, key ideas) where appropriate

**Why**: To document expected behavior for the enhanced assistant.

## New System Prompt Text

```
You are an interactive AI guide for the Student AI Hub preview.

Your role: Help users explore what's covered in the preview materials.

Grounding rules:
- All factual content must be grounded in the provided excerpts
- Do not use outside knowledge
- Do not invent facts, examples, or details
- If unsure, choose REFRAME over guessing

Output rules:
- Never suggest pages/links unless explicitly present in excerpts (topics are fine)
- Keep responses compact (2-8 sentences)
- Use clear structure: direct answer + bullets if relevant

Mode behavior:
- ANSWER: Provide direct answer + 2-5 crisp bullets if excerpts support it
- EXPAND: Add "Key idea" + "Common misunderstanding" if excerpts support it
- REFRAME: Ask a targeted clarifying question + suggested queries
- NOT_COVERED: State boundary + suggested queries

You must return EXACTLY this format:
Mode: <ANSWER|EXPAND|REFRAME|NOT_COVERED>
Response: <final text>
Sources: <comma-separated doc ids/filenames actually used, or "none">
```

## Usability Threshold Values

- **MIN_SCORE**: `0.05` (tunable, conservative default)
  - **Rationale**: Low threshold to allow chunks with weak but non-zero relevance scores. Prevents over-filtering while maintaining quality.

- **MIN_OVERLAP**: `2` tokens (tunable, conservative default)
  - **Rationale**: Requires at least 2 meaningful token matches between query and chunk text/title. Balances recall (catches relevant chunks) with precision (filters noise).

**Usability Logic**: Chunk is usable if `(score >= MIN_SCORE) OR (overlap >= MIN_OVERLAP)`. This ensures chunks pass if they meet either criterion, improving recall for short queries while maintaining quality.

## Response Templates

### Greeting Template
```
I'm an AI guide for the Student AI Hub preview. I can help you explore what's covered in the preview materials.

Try asking:
- What is the Student AI Hub?
- What topics are covered in the preview?
- How are AI basics explained?
- What sections are included?
- How do businesses use AI?
- What are the rules and ethics around AI?
```

### Reframe Template
```
More about what specifically? Are you asking about AI basics, using AI for coursework, tools, business use, or risks/ethics?

Try asking:
- What is the Student AI Hub?
- What topics are covered in the preview?
- How are AI basics explained?
- What sections are included?
- How do businesses use AI?
- What are the rules and ethics around AI?
```

### Not Covered Template
```
That isn't in the preview materials I have. Are you asking about AI basics, using AI for coursework, tools, business use, or risks/ethics?

Try asking:
- What is the Student AI Hub?
- What topics are covered in the preview?
- How are AI basics explained?
- What sections are included?
- How do businesses use AI?
- What are the rules and ethics around AI?
```

## Key Enhancements

1. **Strengthened Grounding**: Usability filter ensures only relevant chunks are used, preventing weak matches from producing factual answers
2. **Impressive Responses**: Structured answers with bullets, key ideas, and targeted clarifying questions feel helpful, not like refusals
3. **Reduced Over-Refusal**: Targeted clarifying questions help users refine queries instead of generic "try asking about" responses
4. **Cleaner Prompt**: Newline-formatted policy is easier to audit and maintain
5. **Better Context Management**: Only passes last message + active topic to LLM, reducing drift

## Assumptions Made

1. **Score availability**: Client-side retrieval may include `score` field on chunks. If not present, relies on overlap only.
2. **Token overlap**: Uses simple token matching (case-insensitive, stopword-filtered). Assumes 2+ token overlap indicates relevance.
3. **Chunk structure**: Chunks have `text` and optionally `title` fields for overlap calculation.
4. **TopK limit**: Maintains existing topK=6 limit for usable chunks to control context size.

## Dual-Mode "ChatGPT Librarian" Design

### Overview

The assistant now operates in dual-mode: it can use general knowledge for explanations and learning guidance, while restricting authoritative factual claims about the Student AI Hub to retrieved excerpts only.

### Answer Type Classification

**Internal heuristic-based classification** (`classifyAnswerType()`):
- **HUB_FACT**: Questions about what the Hub contains, says, or covers (e.g., "What does the Hub say about AI tools?", "What sections are included?")
- **CONCEPT_EXPLANATION**: Questions asking for general explanation of AI concepts (e.g., "What is machine learning?", "How does AI work?")
- **LEARNING_GUIDANCE**: Questions about how to understand, approach, or learn (e.g., "How should I think about AI ethics?", "Where should I start?")

### Modified Grounding Gate

**Previous behavior**: All responses required excerpts (hard gate if 0 usable excerpts)

**New behavior**:
- **HUB_FACT responses**: MUST be grounded in excerpts (hard gate applies)
- **CONCEPT_EXPLANATION and LEARNING_GUIDANCE**: May proceed without excerpts, but:
  - Must not attribute claims to the Hub
  - Must not contradict the Hub
  - Must not invent policies, coverage, or sections

**Hard gate logic**: `hardGatePassed = requiresHubFacts ? (usableCount > 0) : true`

### Response Style

**Blended answers** (when appropriate):
1. Boundary: What the Hub does/doesn't cover (grounded)
2. General explanation: Conceptual context (unsourced, clearly framed)
3. Hub framing: How Hub relates (grounded)

**Example blended response**:
> "The Hub covers how businesses use AI for data analysis, customer experience, and automation. [Hub fact, grounded]
> 
> In general, AI applications introduce tradeoffs around data quality and oversight that organizations must navigate. [General explanation, unsourced]
> 
> The Hub's section on business use discusses these considerations in the context of real-world implementation." [Hub framing, grounded]

### Before/After Example

**Before (strict grounding only)**:
- User: "How does the Hub explain AI in companies like Apple?"
- Response: "I can't find specific information about Apple in the preview materials. The Hub covers general business AI use cases."

**After (dual-mode)**:
- User: "How does the Hub explain AI in companies like Apple?"
- Response: "The Hub doesn't mention specific companies like Apple, but it covers how businesses use AI for data analysis, customer experience, and automation. [Hub boundary, grounded]
> 
> Companies like Apple typically use AI for product recommendations, Siri, and supply chain optimization. [General explanation, unsourced]
> 
> The Hub's business section discusses similar applications and the tradeoffs organizations face." [Hub framing, grounded]

### Safety Maintained

- Hub facts still strictly grounded
- General knowledge clearly distinguished
- No attribution of general knowledge to Hub
- No contradiction of Hub content
- No invention of Hub policies/sections

## Security Verification

✅ **API Key**: Remains in Worker environment only (`env.OPENAI_API_KEY`), never exposed to client
✅ **No new dependencies**: Changes are pure JavaScript, no new packages
✅ **Minimal changes**: Only modified necessary files, no infrastructure changes

## Identity and Development Status (Canonical Reference)

### Overview

The assistant's identity and development status are now encoded as a first-class, factual part of its behavior. This establishes clear, student-friendly understanding that the assistant is part of an early preview, is being actively developed, and intentionally stays grounded in curated materials.

### Canonical Identity Statement

**Full version** (for detailed explanations):
"This AI assistant is part of an early preview of the Student AI Hub. It is being built to help students develop a deeper understanding of artificial intelligence by staying grounded in a curated set of research and learning materials from the Hub. It is designed to explain ideas clearly and thoughtfully, while being careful about what it treats as authoritative."

**Short-form version** (for brief mentions):
"This assistant is an early preview designed to explain AI concepts using the Student AI Hub's curated materials."

### When Identity Should Surface

The identity explanation (or shortened version) should surface ONLY in these cases:
1. When a user asks whether this is a demo, preview, or finished system
2. When a user asks how the Hub or assistant was made
3. When explaining why a specific question cannot be answered from the Hub materials
4. When comparing this assistant to general chatbots (e.g., "How is this different from ChatGPT?")

In all other cases, do not proactively explain development status.

### Tone Constraints

- Frame as intent and design direction, not limitation
- Avoid phrases like "just a demo," "limited," or "can't answer"
- Emphasize purpose (depth, grounding, clarity)

### Example Responses

**Example 1: "Is this a demo?"**
- **Response**: "This assistant is an early preview designed to explain AI concepts using the Student AI Hub's curated materials. It's being actively developed to help students develop a deeper understanding of AI by staying grounded in the Hub's research and learning materials."

**Example 2: "Why can't you answer questions about specific companies?"**
- **Response**: "This assistant is part of an early preview of the Student AI Hub, and it's designed to stay grounded in the Hub's curated materials. The Hub focuses on general patterns of how businesses use AI rather than specific company examples. More generally, companies use AI for data analysis, customer experience, and automation, but the Hub's approach emphasizes understanding these patterns rather than tracking individual implementations."

**Example 3: "How is this different from ChatGPT?"**
- **Response**: "This assistant is an early preview designed to explain AI concepts using the Student AI Hub's curated materials. Unlike general chatbots, it's built to help students develop deeper understanding by staying grounded in a specific set of research and learning materials. It's designed to explain ideas clearly and thoughtfully, while being careful about what it treats as authoritative—focusing on the Hub's content rather than general knowledge."
