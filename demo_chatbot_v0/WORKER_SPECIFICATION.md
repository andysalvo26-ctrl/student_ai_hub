# Cloudflare Worker Specification

## Overview

The Cloudflare Worker at `https://student-ai-hub-site-guide-preview.ajs10845.workers.dev` should be updated to support structured JSON responses and optional query rewriting.

## Request Format

The worker receives POST requests with JSON body:

```json
{
  "question": "string",
  "retrievedChunks": [
    {
      "id": "string",
      "path": "string",
      "title": "string",
      "chunkIndex": number,
      "text": "string",
      "headings": [...],
      "tags": [...]
    }
  ]
}
```

## Response Format

The worker should return JSON:

```json
{
  "answer": "string",
  "suggestedPages": [
    {
      "title": "string",
      "slug": "string",
      "reason": "string"
    }
  ],
  "confidence": "high" | "medium" | "low",
  "citations": ["string"]
}
```

### Field Descriptions

- **answer**: The main answer text generated from retrievedChunks
- **suggestedPages**: Array of page suggestions with:
  - **title**: Display name (e.g., "AI Basics")
  - **slug**: URL-friendly identifier (e.g., "ai-basics")
  - **reason**: Brief explanation why this page is suggested
- **confidence**: How confident the model is in the answer
- **citations**: Array of page paths referenced (e.g., ["demo_corpus/pages/home.md"])

## Query Rewrite (Optional)

The worker can optionally implement query rewriting:

1. First call: Rewrite the user question into a better retrieval query
2. Return rewritten query to client
3. Client uses rewritten query for retrieval
4. Second call: Generate answer from retrieved chunks

Alternatively, the worker can handle query rewriting internally before generating the answer.

## Instructions for Model

The model should be instructed to:

1. **Answer from retrieved chunks only**: Do not add information not present in retrievedChunks
2. **Be student-facing**: Write for students, use plain language
3. **Suggest relevant pages**: Based on the question, suggest 1-3 relevant pages from the demo corpus
4. **Cite sources**: List which pages were referenced in generating the answer
5. **Assess confidence**: Set confidence based on how well retrievedChunks answer the question

## Example Response

```json
{
  "answer": "The Student AI Hub provides reference materials about artificial intelligence designed for students. It includes organized sections covering core concepts, practical applications, and important considerations.",
  "suggestedPages": [
    {
      "title": "AI Basics",
      "slug": "ai-basics",
      "reason": "Learn core AI concepts and definitions"
    },
    {
      "title": "Using AI for School and Work",
      "slug": "using-ai-school-work",
      "reason": "Practical guidance for students"
    }
  ],
  "confidence": "high",
  "citations": ["demo_corpus/pages/home.md"]
}
```

## Backward Compatibility

The client handles both:
- New structured format (with suggestedPages, citations, confidence)
- Old string format (just answer text)

If the worker returns a string, the client will wrap it in the structured format.
