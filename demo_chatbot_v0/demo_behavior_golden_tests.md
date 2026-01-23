# Golden Test Cases: Demo Chatbot Behavior

These are expected behaviors for the hardened preview assistant with Answer-Type Contract routing.

## Test Cases

### 1. Chat Phatic (Greeting)
**Input**: `"hey"`
**Expected**:
- Types: `CHAT_PHATIC`
- Mode: `GREETING`
- Response: Brief acknowledgment + clarifying question (e.g., "I'm an AI guide for the Student AI Hub preview. What would you like to know?")
- Sources: None
- State: Not updated

### 2. Chat Phatic (Tell me more)
**Input**: `"tell me more"` (after greeting)
**Expected**:
- Types: `CHAT_PHATIC`
- Mode: `REFRAME`
- Response: Brief acknowledgment + clarifying question OR 3 example questions
- Sources: None
- State: Not updated

### 3. Hub Content (What is the hub)
**Input**: `"what is the hub"`
**Expected**:
- Types: `HUB_CONTENT`
- Mode: `ANSWER`
- Response: Purpose-first answer (no brochure lists), grounded in excerpts
- Sources: `["home.md#chunk0", ...]` (actual sources used)
- State: Updated with topic label and query

### 4. Hub Content (Tell me about the hub)
**Input**: `"tell me about the hub"`
**Expected**:
- Types: `HUB_CONTENT`
- Mode: `ANSWER`
- Response: Purpose-first answer, not a list of sections/topics
- Sources: From home.md or relevant chunks
- State: Updated

### 5. Hub Process (How was this made)
**Input**: `"how was this made"`
**Expected**:
- Types: `HUB_PROCESS`
- Mode: `ANSWER` (even if general retrieval is thin)
- Response: Answer from governance/provenance docs
- Sources: From process_and_provenance.md or governance docs
- State: Updated

### 6. Hub Process (Where does this come from)
**Input**: `"where does this come from"`
**Expected**:
- Types: `HUB_PROCESS`
- Mode: `ANSWER`
- Response: Provenance information, grounded in excerpts
- Sources: From provenance docs
- State: Updated

### 7. Concept Explain (What is AI)
**Input**: `"what is ai"`
**Expected**:
- Types: `CONCEPT_EXPLAIN`
- Mode: `ANSWER`
- Response: General explanation + one sentence tying back to Hub framing if excerpts exist
- Sources: Excerpts if used, "none" if pure general knowledge
- State: Updated if sources exist

### 8. Concept Explain (Define machine learning)
**Input**: `"define machine learning"`
**Expected**:
- Types: `CONCEPT_EXPLAIN`
- Mode: `ANSWER`
- Response: Plain-language definition + optional Hub tie-back
- Sources: "none" or excerpts if Hub mentions it
- State: Updated if sources exist

### 9. Applied Decision (Can I use AI for homework)
**Input**: `"can i use ai for homework"`
**Expected**:
- Types: `APPLIED_DECISION`
- Mode: `ANSWER`
- Response: Considerations/questions/tradeoffs (Decision Checklist style), not prescriptive advice
- Sources: From rules_risks_ethics.md or using_ai_school_work.md if available
- State: Updated

### 10. Applied Decision (Should I use ChatGPT)
**Input**: `"should i use chatgpt"`
**Expected**:
- Types: `APPLIED_DECISION`
- Mode: `ANSWER`
- Response: Considerations about tradeoffs, instructor expectations, not "yes/no" advice
- Sources: From relevant Hub sections
- State: Updated

### 11. Comparison (Difference between X and Y)
**Input**: `"what's the difference between ai and machine learning"`
**Expected**:
- Types: `COMPARISON`
- Mode: `ANSWER`
- Response: Compare purpose/limits without superiority claims
- Sources: Excerpts if Hub covers it, "none" if general knowledge
- State: Updated if sources exist

### 12. Comparison (Compare tools)
**Input**: `"compare chatgpt and claude"`
**Expected**:
- Types: `COMPARISON`
- Mode: `ANSWER` or `NOT_COVERED`
- Response: If Hub covers tools, compare purpose/limits. Otherwise, not covered.
- Sources: From ai_tools_you_might_use.md if available, "none" otherwise
- State: Updated if sources exist

### 13. Out of Scope Fact (Latest news)
**Input**: `"what's the latest ai news this week"`
**Expected**:
- Types: `OUT_OF_SCOPE_FACT`
- Mode: `NOT_COVERED`
- Response: Say not covered + closest Hub-supported framing + one suggested reframe
- Sources: None
- State: Not updated

### 14. Out of Scope Fact (Specific company)
**Input**: `"how does apple use ai"`
**Expected**:
- Types: `OUT_OF_SCOPE_FACT`
- Mode: `NOT_COVERED`
- Response: Say not covered + offer Hub's general business AI framing + reframe
- Sources: None
- State: Not updated

### 15. Mixed Types (Hub + Concept)
**Input**: `"how does the hub explain ai in companies like apple"`
**Expected**:
- Types: `HUB_CONTENT`, `CONCEPT_EXPLAIN`
- Mode: `ANSWER`
- Response: Separate Hub content (grounded) from general explanation (unsourced)
- Sources: From Hub excerpts only
- State: Updated

### 16. Vague Follow-up After Topic
**Input**: `"tell me more"` (after "what is the hub")
**Expected**:
- Types: `CHAT_PHATIC` or context-dependent
- Mode: `EXPAND` or `REFRAME`
- Response: Expands on hub topic if supported, otherwise reframes
- Sources: From previous topic if EXPAND
- State: Updated if EXPAND with sources

### 17. Zero Usable Retrieval Results
**Input**: `"tell me about quantum computing"` (not in corpus)
**Expected**:
- Types: `CONCEPT_EXPLAIN` or `OUT_OF_SCOPE_FACT`
- Hard gate: Failed if HUB_CONTENT, passed if CONCEPT_EXPLAIN
- Mode: `ANSWER` (if CONCEPT_EXPLAIN) or `NOT_COVERED` (if OUT_OF_SCOPE_FACT)
- Response: General explanation if CONCEPT_EXPLAIN, not covered if OUT_OF_SCOPE_FACT
- Sources: "none" for general explanation
- LLM: Called if CONCEPT_EXPLAIN, not called if HUB_CONTENT with 0 excerpts

## Stress Tests (Tend to Break Systems)

### 18. Nuanced Question (Bias)
**Input**: `"Is AI always biased?"`
**Expected**:
- Types: `CONCEPT_EXPLAIN` or `APPLIED_DECISION`
- Mode: `ANSWER`
- Response: Nuanced answer discussing limits and context, not overclaiming. May use general knowledge but tie to Hub if excerpts exist.
- Sources: Excerpts if Hub covers bias, "none" if pure general knowledge
- Attribution: Hub statements phrased as "In the Student AI Hub…", general statements as "More generally…"

### 19. Trust Question
**Input**: `"Can AI be trusted?"`
**Expected**:
- Types: `APPLIED_DECISION` or `CONCEPT_EXPLAIN`
- Mode: `ANSWER`
- Response: Discusses limits and considerations, not yes/no. Uses Decision Checklist tone.
- Sources: From rules_risks_ethics.md if available
- Attribution: Clear distinction between Hub content and general explanation

### 20. Privacy + Instructor Question
**Input**: `"Can I paste my assignment into an AI tool?"`
**Expected**:
- Types: `APPLIED_DECISION`
- Mode: `ANSWER`
- Response: Considerations about privacy and instructor expectations, not prescriptive advice
- Sources: From using_ai_school_work.md and rules_risks_ethics.md if available
- Attribution: Hub statements clearly attributed

### 21. Short Summary Request
**Input**: `"Summarize AI in one sentence"`
**Expected**:
- Types: `CONCEPT_EXPLAIN`
- Mode: `ANSWER`
- Response: One sentence summary, may include Hub tie-back if excerpts exist
- Sources: Excerpts if used, "none" if pure general knowledge
- Attribution: Clear framing

### 22. Grounded + General Mix
**Input**: `"Explain hallucinations and how to avoid them"`
**Expected**:
- Types: `CONCEPT_EXPLAIN`
- Mode: `ANSWER`
- Response: Explains concept (general) + Hub content if available (grounded)
- Sources: From rules_risks_ethics.md if Hub covers hallucinations
- Attribution: Separates general explanation from Hub content

### 23. Specific Company (Not Covered + Reframe)
**Input**: `"How does Apple use AI?"`
**Expected**:
- Types: `OUT_OF_SCOPE_FACT`
- Mode: `NOT_COVERED`
- Response: Not covered + closest Hub-supported framing (business AI patterns) + one reframe
- Sources: None
- Attribution: General explanation clearly framed

### 24. Learning Guidance
**Input**: `"What should I read first?"`
**Expected**:
- Types: `LEARNING_GUIDANCE` or `HUB_CONTENT`
- Mode: `ANSWER`
- Response: Learning guidance based on Hub structure if available
- Sources: From home.md or relevant sections if available
- Attribution: Hub content clearly attributed

### 25. Process/Provenance Question
**Input**: `"Is the hub updated automatically?"`
**Expected**:
- Types: `HUB_PROCESS`
- Mode: `ANSWER`
- Response: Answer from governance/provenance docs, even if general retrieval is thin
- Sources: From process_and_provenance.md if available
- Attribution: Hub process statements clearly attributed

## Validation Rules

1. **Answer-Type Routing**: Questions routed to appropriate response style based on classification
2. **Hub Grounding**: HUB_CONTENT and HUB_PROCESS must be grounded in excerpts
3. **General Knowledge**: CONCEPT_EXPLAIN, APPLIED_DECISION, COMPARISON may use general knowledge but don't attribute to Hub
4. **Sources Accuracy**: Sources includes only docs actually used; "none" for pure general knowledge
5. **Sources Discipline**: Sources reflects only docs actually referenced; log sources_used_count
6. **Attribution Firewall**: Hub statements phrased as "In the Student AI Hub…", general as "More generally…"
7. **Query Enrichment**: Queries enriched with canonical labels when keywords match
8. **Reframe Loop Prevention**: Concrete questions don't get generic "More about what specifically?"
9. **Chat Phatic**: Brief, no analysis of greetings
10. **Applied Decision**: Considerations/tradeoffs, not prescriptive advice
11. **Comparison**: No superiority claims
12. **Out of Scope**: Offer closest Hub framing + reframe
