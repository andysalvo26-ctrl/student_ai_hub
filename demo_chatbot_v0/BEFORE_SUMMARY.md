# BEFORE Summary: Current Behavior

## Architecture

- **Worker entry point**: `demo_chatbot_v0/worker.js` - `export default { async fetch(request, env) }`
- **Retrieval**: Client-side in `demo_chatbot_v0/src/widget.js` - `retrieveChunks(query, minK=5, maxK=6)`
- **LLM call**: `worker.js` - `generateAnswer(question, retrievedChunks, env)`

## Current Flow

1. Client receives user message
2. Client calls `retrieveChunks()` locally (no server-side retrieval)
3. Client sends `{ question, retrievedChunks }` to Worker
4. Worker validates chunks (if empty, returns fallback)
5. Worker calls `generateAnswer()` which calls OpenAI API
6. Worker returns `{ answer, confidence, citations }`

## Retrieval Details

**Location**: `src/widget.js` - `retrieveChunks()`

- **Scoring**: Hybrid approach (keyword overlap 60% + TF-IDF-like 40%)
- **Selection**: Always returns top maxK=6 chunks (no threshold filter)
- **Fallback**: If < minK=5 chunks, adds chunks from home.md
- **Query normalization**: Expands shorthand (hub→student ai hub, psu→penn state)

## Refusal/Fallback Logic

**Location**: `worker.js` - main handler

1. If `retrievedChunks` is empty/null: Returns "I can't access the preview materials right now"
2. If LLM call fails: Returns "I can't find that in the preview materials yet. Try asking about..."
3. No deterministic classification of message types
4. No state management (no conversation context)

## LLM Parameters

**Location**: `worker.js` - `generateAnswer()` function

- **Model**: `gpt-4o-mini`
- **Temperature**: `0.3` (hardcoded)
- **Max tokens**: `400` (hardcoded)
- **Top_p**: Not set (defaults to 1)
- **Frequency penalty**: Not set (defaults to 0)
- **Presence penalty**: Not set (defaults to 0)

## System Prompt

**Location**: `worker.js` - `generateAnswer()` function

Current prompt instructs model to:
- Use ONLY provided context
- Not add outside information
- Return fallback message if answer not in chunks
- Write in plain, student-friendly language
- Be concise

**No structured output format** - model returns free-form text

## API Key Security

✅ **Secure**: API key (`env.OPENAI_API_KEY`) only accessed in Worker, never exposed to client
✅ **Verified**: No API key references found in `src/widget.js` (client code)

## Current Issues

1. No message classification (greetings vs questions vs follow-ups)
2. No conversation state (can't handle "tell me more")
3. No hard gate before LLM call (always calls LLM if chunks exist)
4. LLM parameters not explicit constants
5. No structured output format (model returns free-form text)
6. No audit logging of decision points
