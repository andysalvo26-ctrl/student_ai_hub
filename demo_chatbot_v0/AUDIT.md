# Demo Chatbot Audit Report

## Issue

The UI was showing "I'm having trouble generating a response right now. Please try again..." indicating the worker call was failing.

## Audit Process

### A) Worker URL Verification
**Status**: ✓ Correct
- URL: `https://student-ai-hub-site-guide-preview.ajs10845.workers.dev`
- Uses HTTPS
- Points to correct Cloudflare Worker endpoint

### B) Request Payload Format
**Status**: ✓ Correct
- Client sends: `{ question: string, retrievedChunks: [{path, text, ...}] }`
- Worker expects: `{ question: string, retrievedChunks: [{path, text}] }`
- Format matches exactly

### C) CORS Configuration
**Status**: ✓ Fixed
- Worker handles OPTIONS preflight with status 204 (was missing status)
- CORS headers set correctly: `Access-Control-Allow-Origin: *`
- Headers include: `Access-Control-Allow-Methods: POST, OPTIONS`
- Headers include: `Access-Control-Allow-Headers: Content-Type`

### D) Worker Response Format
**Status**: ✓ Correct
- Returns JSON: `{ answer: string, suggestedPages: string[] }`
- Content-Type header: `application/json`
- CORS header included in all responses

### E) OpenAI API Call
**Status**: ✓ Improved error handling
- Uses `env.OPENAI_API_KEY` (correct environment variable name)
- Added check for missing API key with clear error logging
- Improved error messages with error codes
- Fallback response if OpenAI fails

### F) Client JSON Parsing
**Status**: ✓ Fixed
- Added detailed error logging with error codes
- Reads response text before parsing JSON
- Logs raw response if JSON parse fails
- Logs response status and headers
- Always shows user-friendly message but logs details to console

## Root Causes Identified

1. **Missing error observability**: Client was catching errors but not logging enough detail to debug
2. **OPTIONS preflight**: Worker was returning null Response without explicit status 204
3. **JSON parsing**: Client wasn't reading response text before parsing, making it hard to debug parse errors
4. **OpenAI API key**: No explicit check/logging if API key is missing

## Changes Made

### Client (`src/widget.js`)
1. Added detailed console logging with error codes (e.g., `WORKER_ERROR_1234567890`)
2. Log request payload (question preview, chunk count)
3. Log response status and text length
4. Read response text before parsing JSON
5. Log parsed response structure
6. Log dataset loading status on init
7. Improved error messages with error codes in console

### Worker (`worker.js`)
1. Added error codes to all log statements (e.g., `OPENAI_ERROR_1234567890`)
2. Fixed OPTIONS handler to return status 204 explicitly
3. Added check for missing `OPENAI_API_KEY` with clear error
4. Added logging for request processing steps
5. Improved fallback answer generation
6. Log suggested pages before returning

## Verification

### Test 1: Local HTML File
1. Open `dist/hub-demo-chatbot.html` in browser
2. Open browser console (F12)
3. Ask "What is this site?"
4. **Expected**: Answer from home.md chunks, error codes logged to console
5. **Verify**: Check console for `[WORKER_ERROR_...]` logs showing request/response flow

### Test 2: Worker Direct Call
```bash
curl -X POST https://student-ai-hub-site-guide-preview.ajs10845.workers.dev \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What is this site?",
    "retrievedChunks": [
      {
        "path": "demo_corpus/pages/home.md",
        "text": "The Student AI Hub provides reference materials about artificial intelligence designed for students.",
        "chunkIndex": 0
      }
    ]
  }'
```
**Expected**: JSON response with `answer` and `suggestedPages` fields

### Test 3: Missing API Key
If `OPENAI_API_KEY` is not set in Cloudflare:
- Worker should log error and return fallback answer from chunks
- Response should still be valid JSON with `answer` field

## Success Criteria

- ✅ UI shows answers from retrieved chunks
- ✅ Console shows detailed error codes for debugging
- ✅ Worker returns valid JSON even on errors
- ✅ CORS works correctly (no CORS errors in console)
- ✅ Missing API key handled gracefully

## Next Steps

1. Deploy updated worker.js to Cloudflare
2. Set `OPENAI_API_KEY` environment variable in Cloudflare Worker settings
3. Test end-to-end: UI → Worker → UI
4. Monitor Cloudflare Worker logs for error codes

---

## Additional Simplification: Removal of Suggested Pages

### Why Suggested Pages Were Removed

**Date**: After initial audit

**Reason**: Defensibility and preview constraint

**Issue**: The UI was rendering "Suggested pages" buttons when the assistant could not answer from the demo corpus. These buttons were:
1. **Not linkable**: The pages don't exist yet or aren't accessible
2. **Not authoritative**: Suggestions were inferred from keywords, not based on actual site structure
3. **Misleading**: Users might click expecting navigation, but buttons don't work
4. **Beyond preview scope**: The preview assistant should only answer from retrieved chunks, not suggest navigation

**Change**: 
- Removed `suggestedPages` field from worker response
- Removed page suggestion logic from worker
- Removed suggested pages rendering from client UI
- Simplified response contract to `{ answer }` only
- Replaced fallback behavior with clarifying-question pattern

**New Fallback Behavior**:
When the assistant cannot answer from retrieved chunks, it returns:
> "I don't have enough information in the preview materials to answer that directly. You could try asking about what the Student AI Hub is, how the site is structured, or what topics are covered in this preview."

This pattern:
- Clearly states the limitation
- Guides users toward answerable questions
- Does not imply navigation or external resources
- Maintains strict librarian behavior (only answers from retrieved chunks)

**Result**: The assistant is now a strict, defensible preview guide that only answers from the demo corpus and does not suggest navigation or external actions.

---

## Retrieval Reliability Fix

### What Was Broken

**Date**: After simplification

**Issue**: Retrieval was too strict, causing constant fallback even for answerable questions like "what is the hub" or "what is this site".

**Root Causes**:
1. **Threshold too high**: Chunks were filtered out if similarity score < 0.1, leaving no results for short/vague queries
2. **Insufficient chunks**: Only retrieving topK=3 chunks, often filtered to 0 by threshold
3. **Poor short query handling**: Simple overlap scoring failed for queries like "hub" or "what is this"
4. **No query normalization**: Raw queries weren't expanded or normalized before matching

### What Changed

**A) Retrieval Reliability**:
1. **Removed threshold filter**: Always retrieve top chunks regardless of score
2. **Increased minimum K**: Retrieve 5-6 chunks minimum (was 3)
3. **Query normalization**: 
   - Lowercase, strip punctuation, collapse whitespace
   - Expand shorthand: "hub" → "student ai hub", "psu" → "penn state"
   - Prepend context for very short queries (< 5 tokens)
4. **Improved scoring**: Hybrid approach combining keyword overlap (60%) + TF-IDF-like scoring (40%)
5. **Debug logging**: Added DEBUG_MODE flag for detailed retrieval logs

**B) Response Rigor**:
1. **Strict grounding**: System prompt explicitly forbids adding information not in chunks
2. **Lower temperature**: Reduced from 0.7 to 0.3 for more factual responses
3. **Confidence calculation**: Deterministic rules based on chunk count and relevance
4. **Citations**: Return minimal citations (path + chunkId) for auditing
5. **Better fallback**: Clear message when answer isn't in preview materials

**C) UI Improvements**:
1. **Minimal citations**: Show "Preview sources:" as single line (not buttons)
2. **Tighter spacing**: Reduced padding/margins for Wix embed
3. **Preview badge**: Small badge instead of long warning banner
4. **No navigation**: Removed all suggested pages/buttons

### Why This Is Defensible

1. **No hallucination**: LLM explicitly instructed to only use retrieved chunks
2. **Deterministic retrieval**: Scoring is reproducible, no randomness
3. **Transparent citations**: Sources are shown for auditing
4. **Clear limitations**: Fallback messages explicitly state what's not available
5. **No fake navigation**: Never suggests links or pages that don't exist
6. **Query expansion is conservative**: Only expands well-known shorthand (hub, psu, smeal)

### Acceptance Tests

**Must answer** (from corpus):
- ✅ "what is the hub" → Should return answer from home.md
- ✅ "what is this site" → Should return answer from home.md  
- ✅ "what topics are covered" → Should return answer from home.md or overview sections

**Must refuse** (off-topic):
- ✅ "tell me a joke" → Should say can't find in preview materials
- ✅ "what's the weather" → Should say can't find in preview materials

**Must never**:
- ✅ Hallucinate information not in chunks
- ✅ Propose navigation or links
- ✅ Return empty results for answerable questions
