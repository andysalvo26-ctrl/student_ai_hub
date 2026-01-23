// Cloudflare Worker for Student AI Hub Site Guide Preview
// Hardened for institutional review: deterministic classification + strict grounding
// Enhanced for impressive interactive AI experience while maintaining rigor

// LLM parameters (explicit constants for auditability)
// Chosen to reduce hallucination, repetition, and chatty tone for institutional preview
const LLM_TEMPERATURE = 0.1;
const LLM_TOP_P = 1;
const LLM_MAX_TOKENS = 280;
const LLM_FREQUENCY_PENALTY = 0.2;
const LLM_PRESENCE_PENALTY = 0;

// Usability thresholds (tunable, conservative defaults)
const MIN_SCORE = 0.05; // Minimum retrieval score for usability
const MIN_OVERLAP = 2; // Minimum token overlap count for usability

// Stopwords for overlap calculation
const STOPWORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
  'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
  'to', 'was', 'were', 'will', 'with', 'this', 'these', 'those',
  'i', 'you', 'we', 'they', 'what', 'which', 'who', 'where', 'when',
  'why', 'how', 'can', 'could', 'should', 'would', 'may', 'might',
  'must', 'do', 'does', 'did', 'have', 'has', 'had', 'been', 'being'
]);

// Tokenize and filter for overlap calculation
function tokenizeForOverlap(text) {
  return text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(token => token.length > 2 && !STOPWORDS.has(token));
}

// Calculate lexical overlap between query and chunk
function calculateOverlap(normalizedQuery, chunk) {
  const queryTokens = new Set(tokenizeForOverlap(normalizedQuery));
  const chunkText = (chunk.text || '').toLowerCase();
  const chunkTitle = (chunk.title || '').toLowerCase();
  const chunkTokens = new Set([
    ...tokenizeForOverlap(chunkText),
    ...tokenizeForOverlap(chunkTitle)
  ]);
  
  let overlap = 0;
  queryTokens.forEach(token => {
    if (chunkTokens.has(token)) {
      overlap++;
    }
  });
  
  return overlap;
}

// Determine if a chunk is usable (deterministic filter)
function isChunkUsable(chunk, normalizedQuery, score = null) {
  // Check score threshold if score exists
  if (score !== null && score >= MIN_SCORE) {
    return { usable: true, reason: 'score', score: score, overlap: null };
  }
  
  // Check lexical overlap
  const overlap = calculateOverlap(normalizedQuery, chunk);
  if (overlap >= MIN_OVERLAP) {
    return { usable: true, reason: 'overlap', score: score, overlap: overlap };
  }
  
  return { usable: false, reason: 'neither', score: score, overlap: overlap };
}

// Filter and rank usable chunks
function filterUsableChunks(retrievedChunks, normalizedQuery, topK = 6) {
  const usableChunks = [];
  const usabilityResults = [];
  
  retrievedChunks.forEach((chunk, index) => {
    // Extract score if available (from client-side scoring)
    const score = chunk.score !== undefined ? chunk.score : null;
    const usability = isChunkUsable(chunk, normalizedQuery, score);
    
    usabilityResults.push({
      docId: chunk.path ? chunk.path.split('/').pop() : 'unknown',
      chunkId: chunk.chunkIndex !== undefined ? chunk.chunkIndex : index,
      usable: usability.usable,
      reason: usability.reason,
      score: usability.score,
      overlap: usability.overlap
    });
    
    if (usability.usable) {
      usableChunks.push(chunk);
    }
  });
  
  // Sort usable chunks by score (if available) or keep original order
  usableChunks.sort((a, b) => {
    const scoreA = a.score !== undefined ? a.score : 0;
    const scoreB = b.score !== undefined ? b.score : 0;
    return scoreB - scoreA;
  });
  
  return {
    usable: usableChunks.slice(0, topK),
    results: usabilityResults,
    usableCount: usableChunks.length
  };
}

// Message classification (deterministic heuristics)
function classifyMessage(message) {
  const msgLower = message.toLowerCase().trim();
  
  // GREETING_SMALLTALK
  const greetingPatterns = ['hey', 'hi', 'hello', 'what\'s up', 'yo', 'greetings', 'good morning', 'good afternoon', 'good evening'];
  if (greetingPatterns.some(pattern => msgLower.startsWith(pattern) || msgLower === pattern)) {
    return 'GREETING_SMALLTALK';
  }
  
  // VAGUE_FOLLOWUP (requires context to detect - will be handled with state)
  const vaguePatterns = ['tell me more', 'more', 'go on', 'can you explain', 'explain more', 'more detail', 'more about'];
  const hasVaguePattern = vaguePatterns.some(pattern => msgLower.includes(pattern));
  const meaningfulTokens = msgLower.split(/\s+/).filter(t => t.length > 2 && !['the', 'this', 'that', 'what', 'how'].includes(t));
  if (hasVaguePattern && meaningfulTokens.length < 2) {
    return 'VAGUE_FOLLOWUP';
  }
  
  // OUT_OF_SCOPE_REQUEST (patterns that clearly aren't in preview corpus)
  const outOfScopePatterns = [
    'latest.*news.*week',
    'current.*policy',
    'today.*weather',
    'tell me a joke',
    'what.*time',
    'current.*events'
  ];
  if (outOfScopePatterns.some(pattern => new RegExp(pattern, 'i').test(msgLower))) {
    return 'OUT_OF_SCOPE_REQUEST';
  }
  
  // TOPIC_QUESTION (default for anything with meaningful tokens)
  return 'TOPIC_QUESTION';
}

// Answer-type classification (deterministic heuristics)
// Routes questions to appropriate response style
function classifyAnswerTypes(message) {
  const msgLower = message.toLowerCase().trim();
  const types = new Set();
  
  // CHAT_PHATIC: Small talk, greetings, casual engagement
  const chatPatterns = [
    'what\'s up', 'whats up', 'hey', 'hi', 'hello', 'yo', 'greetings',
    'how.*going', 'how.*doing', 'tell me more', 'more', 'go on'
  ];
  if (chatPatterns.some(pattern => new RegExp(`^${pattern}|\\b${pattern}\\b`, 'i').test(msgLower))) {
    types.add('CHAT_PHATIC');
  }
  
  // HUB_PROCESS: Questions about how Hub was made, provenance, governance
  const processPatterns = [
    'how.*made', 'how.*built', 'how.*created', 'where.*come.*from',
    'where.*from', 'provenance', 'process', 'governance', 'who.*made',
    'how.*decided', 'how.*chose', 'what.*process'
  ];
  if (processPatterns.some(pattern => new RegExp(pattern, 'i').test(msgLower))) {
    types.add('HUB_PROCESS');
  }
  
  // OUT_OF_SCOPE_FACT: Current events, specific companies, latest news
  const outOfScopePatterns = [
    'latest.*news', 'current.*events', 'today.*news', 'this.*week',
    'apple', 'google', 'microsoft', 'meta', 'openai', 'chatgpt',
    'current.*policy', 'today.*weather', 'what.*time', 'tell me a joke'
  ];
  if (outOfScopePatterns.some(pattern => new RegExp(pattern, 'i').test(msgLower))) {
    types.add('OUT_OF_SCOPE_FACT');
  }
  
  // COMPARISON: Difference between, compare, vs, better than
  const comparisonPatterns = [
    'difference.*between', 'compare', 'vs\\.', 'versus', 'better.*than',
    'worse.*than', 'similar.*to', 'different.*from'
  ];
  if (comparisonPatterns.some(pattern => new RegExp(pattern, 'i').test(msgLower))) {
    types.add('COMPARISON');
  }
  
  // APPLIED_DECISION: Can I, should I, how do I decide, what should I do
  const decisionPatterns = [
    'can.*i', 'should.*i', 'may.*i', 'how.*do.*i.*decide',
    'what.*should.*i.*do', 'what.*do.*i.*do', 'how.*choose',
    'is.*ok', 'is.*allowed', 'permitted', 'acceptable'
  ];
  if (decisionPatterns.some(pattern => new RegExp(pattern, 'i').test(msgLower))) {
    types.add('APPLIED_DECISION');
  }
  
  // CONCEPT_EXPLAIN: What is, define, explain, how does X work (conceptual)
  const conceptPatterns = [
    'what.*is', 'what.*are', 'define', 'explain.*concept',
    'how.*does.*work', 'what.*means', 'what.*mean'
  ];
  if (conceptPatterns.some(pattern => new RegExp(pattern, 'i').test(msgLower))) {
    types.add('CONCEPT_EXPLAIN');
  }
  
  // HUB_CONTENT: Questions about what Hub contains, says, covers
  const hubContentPatterns = [
    'what.*hub', 'what.*site', 'what.*preview', 'what.*contains',
    'what.*covers', 'what.*says', 'what.*includes', 'what.*topics',
    'what.*sections', 'tell.*about.*hub', 'tell.*about.*site'
  ];
  if (hubContentPatterns.some(pattern => new RegExp(pattern, 'i').test(msgLower))) {
    types.add('HUB_CONTENT');
  }
  
  // Default classification if no patterns match
  if (types.size === 0) {
    // If mentions hub/site/preview, assume HUB_CONTENT
    if (msgLower.includes('hub') || msgLower.includes('site') || msgLower.includes('preview')) {
      types.add('HUB_CONTENT');
    } else {
      // Otherwise assume concept explanation
      types.add('CONCEPT_EXPLAIN');
    }
  }
  
  return Array.from(types);
}

// Query enrichment: append canonical labels when keywords match (deterministic)
function enrichQuery(query) {
  const queryLower = query.toLowerCase();
  let enriched = query;
  const enrichments = [];
  
  // Canonical label mappings
  const enrichmentMap = {
    'basics': 'AI Basics',
    'basic': 'AI Basics',
    'ethics': 'Rules, Risks, and Ethics of AI',
    'risk': 'Rules, Risks, and Ethics of AI',
    'bias': 'Rules, Risks, and Ethics of AI',
    'privacy': 'Rules, Risks, and Ethics of AI',
    'hallucination': 'Rules, Risks, and Ethics of AI',
    'coursework': 'Using AI for School and Work',
    'assignment': 'Using AI for School and Work',
    'cite': 'Using AI for School and Work',
    'citation': 'Using AI for School and Work',
    'plagiarism': 'Using AI for School and Work',
    'instructor': 'Using AI for School and Work',
    'homework': 'Using AI for School and Work',
    'tools': 'AI Tools You Might Use',
    'tool': 'AI Tools You Might Use',
    'chatbot': 'AI Tools You Might Use',
    'meeting assistant': 'AI Tools You Might Use',
    'business': 'How Businesses Are Using AI',
    'company': 'How Businesses Are Using AI',
    'companies': 'How Businesses Are Using AI',
    'industry': 'How Businesses Are Using AI',
    'fraud': 'How Businesses Are Using AI',
    'predictive maintenance': 'How Businesses Are Using AI'
  };
  
  // Check for keyword matches and append canonical labels
  for (const [keyword, label] of Object.entries(enrichmentMap)) {
    if (queryLower.includes(keyword) && !enriched.includes(label)) {
      enriched += ' ' + label;
      enrichments.push(label);
    }
  }
  
  return {
    original: query,
    enriched: enriched.trim(),
    labels: enrichments
  };
}

// Check if question is concrete (not vague)
function isConcreteQuestion(message) {
  const msgLower = message.toLowerCase().trim();
  
  // Interrogatives
  const interrogatives = ['what', 'how', 'why', 'when', 'where', 'who', 'which', 'can', 'should', 'is', 'are', 'does', 'do'];
  const hasInterrogative = interrogatives.some(q => msgLower.startsWith(q) || msgLower.includes(' ' + q + ' '));
  
  // Direct requests
  const directRequests = ['explain', 'describe', 'tell me', 'show me', 'give me', 'list', 'compare'];
  const hasDirectRequest = directRequests.some(r => msgLower.includes(r));
  
  // Topic tokens (meaningful words beyond stopwords)
  const stopwords = ['the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might', 'must', 'can'];
  const tokens = msgLower.split(/\s+/).filter(t => t.length > 2 && !stopwords.includes(t));
  const hasTopicTokens = tokens.length >= 2;
  
  return (hasInterrogative || hasDirectRequest) && hasTopicTokens;
}

// Chat phatic response template (brief acknowledgment + clarifying question)
const CHAT_PHATIC_RESPONSE = `I'm an AI guide for the Student AI Hub preview. What would you like to know?`;

// Reframe response template (with targeted clarifying question)
const REFRAME_RESPONSE = `More about what specifically? Are you asking about AI basics, using AI for coursework, tools, business use, or risks/ethics?`;

// Not covered response template (with targeted clarifying question)
const NOT_COVERED_RESPONSE = `That isn't in the preview materials I have. Are you asking about AI basics, using AI for coursework, tools, business use, or risks/ethics?`;

// Generate answer from retrieved chunks using OpenAI
async function generateAnswer(question, retrievedChunks, activeTopic, answerTypes, env) {
  const errorCode = `OPENAI_ERROR_${Date.now()}`;
  
  try {
    // Check for API key
    if (!env.OPENAI_API_KEY) {
      console.error(`[${errorCode}] OPENAI_API_KEY not found in environment`);
      throw new Error('OPENAI_API_KEY not configured');
    }

    // Build context from retrieved chunks (verbatim)
    const context = retrievedChunks.map((chunk, index) => {
      const filename = chunk.path.split('/').pop() || 'unknown.md';
      const chunkId = chunk.chunkIndex !== undefined ? chunk.chunkIndex : index;
      return `[Source: ${filename}, chunk ${chunkId}]\n${chunk.text}`;
    }).join('\n\n---\n\n');
    
    // Build user message (only last message + active topic context, not full history)
    let userContext = '';
    if (activeTopic && activeTopic.active_topic_query) {
      userContext = `\n\nPrevious context: You were discussing "${activeTopic.active_topic_label || activeTopic.active_topic_query}".`;
    }
    
    // Add answer type context for LLM
    const answerTypeContext = answerTypes && answerTypes.length > 0
      ? `\n\nAnswer type classification: ${answerTypes.join(', ')}. Follow the Answer-Type Contract: HUB_CONTENT/HUB_PROCESS must be grounded in excerpts; CONCEPT_EXPLAIN/APPLIED_DECISION/COMPARISON may use general knowledge but do not attribute to Hub unless excerpts support it.`
      : '';
    
    // Interactive Preview AI Policy (clean, newline-formatted)
    // Answer-Type Contract: routes questions to appropriate response style
    const systemPrompt = `You are an interactive AI guide for the Student AI Hub preview.

Your role: Help users explore what's covered in the preview materials and understand AI concepts.

Identity and development status (canonical reference):
This AI assistant is part of an early preview of the Student AI Hub. It is being built to help students develop a deeper understanding of artificial intelligence by staying grounded in a curated set of research and learning materials from the Hub. It is designed to explain ideas clearly and thoughtfully, while being careful about what it treats as authoritative.

When to surface identity/development status:
- When a user asks whether this is a demo, preview, or finished system
- When a user asks how the Hub or assistant was made
- When explaining why a specific question cannot be answered from the Hub materials
- When comparing this assistant to general chatbots (e.g., "How is this different from ChatGPT?")
In all other cases, do not proactively explain development status.

Short-form version (for brief mentions):
"This assistant is an early preview designed to explain AI concepts using the Student AI Hub's curated materials."

Tone constraints:
Frame identity as intent and design direction, not limitation. Avoid phrases like "just a demo," "limited," or "can't answer." Emphasize purpose (depth, grounding, clarity).

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
${context}`;

    const userPrompt = `Question: ${question}${userContext}${answerTypeContext}

Answer based on the context above. For Hub facts, use excerpts only. For concepts/guidance, you may use general knowledge but clearly distinguish from Hub content. Return the required format.`;

    console.log(`[${errorCode}] Calling OpenAI API`);
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: LLM_TEMPERATURE,
        top_p: LLM_TOP_P,
        max_tokens: LLM_MAX_TOKENS,
        frequency_penalty: LLM_FREQUENCY_PENALTY,
        presence_penalty: LLM_PRESENCE_PENALTY
      })
    });

    console.log(`[${errorCode}] OpenAI response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[${errorCode}] OpenAI API error: ${response.status} - ${errorText}`);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText.substring(0, 200)}`);
    }

    const data = await response.json();
    const rawAnswer = data.choices[0]?.message?.content?.trim();
    
    if (!rawAnswer) {
      console.error(`[${errorCode}] No answer in OpenAI response:`, data);
      throw new Error('No answer from OpenAI');
    }

    // Parse structured output
    let mode = 'REFRAME';
    let responseText = REFRAME_RESPONSE;
    let sources = [];
    
    try {
      const modeMatch = rawAnswer.match(/Mode:\s*(ANSWER|EXPAND|REFRAME|NOT_COVERED)/i);
      const responseMatch = rawAnswer.match(/Response:\s*([\s\S]*?)(?=Sources:|$)/i);
      const sourcesMatch = rawAnswer.match(/Sources:\s*([\s\S]*?)$/i);
      
      if (modeMatch) {
        mode = modeMatch[1].toUpperCase();
      }
      
      if (responseMatch) {
        responseText = responseMatch[1].trim();
      }
      
      if (sourcesMatch) {
        const sourcesStr = sourcesMatch[1].trim();
        if (sourcesStr.toLowerCase() !== 'none') {
          sources = sourcesStr.split(',').map(s => s.trim()).filter(s => s.length > 0);
        }
      }
    } catch (parseError) {
      console.warn(`[${errorCode}] Failed to parse structured output, using fallback:`, parseError);
      // Fallback: treat as REFRAME with no sources
      mode = 'REFRAME';
      responseText = REFRAME_RESPONSE;
      sources = [];
    }

    console.log(`[${errorCode}] Parsed response: mode=${mode}, sources=${sources.length}`);
    
    return {
      mode: mode,
      answer: responseText,
      sources: sources
    };
  } catch (error) {
    console.error(`[${errorCode}] Error generating answer:`, error);
    throw error;
  }
}

// Main handler
export default {
  async fetch(request, env) {
    const errorCode = `WORKER_${Date.now()}`;
    
    // Handle CORS
    if (request.method === 'OPTIONS') {
      console.log(`[${errorCode}] Handling OPTIONS preflight`);
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      });
    }

    if (request.method !== 'POST') {
      console.error(`[${errorCode}] Invalid method: ${request.method}`);
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    try {
      console.log(`[${errorCode}] Processing POST request`);
      const body = await request.json();
      const { question, retrievedChunks, conversationState } = body;

      if (!question) {
        console.error(`[${errorCode}] Missing question in request`);
        return new Response(JSON.stringify({ error: 'Missing question' }), {
          status: 400,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }

      // Initialize conversation state if not provided
      const state = conversationState || {
        active_topic_label: null,
        active_topic_query: null,
        active_sources: []
      };

      // Classify message
      const classification = classifyMessage(question);
      
      // Determine normalized query with enrichment
      let normalizedQuery = question.toLowerCase().trim();
      if (classification === 'VAGUE_FOLLOWUP' && state.active_topic_query) {
        normalizedQuery = state.active_topic_query + ' more detail / examples / common misunderstandings';
      }
      
      // Enrich query with canonical labels (deterministic)
      const enrichmentResult = enrichQuery(normalizedQuery);
      const enrichedQuery = enrichmentResult.enriched;
      
      // Log enrichment for audit
      if (enrichmentResult.labels.length > 0) {
        console.log(`[${errorCode}] Query enriched: "${enrichmentResult.original}" -> "${enrichedQuery}" (labels: ${enrichmentResult.labels.join(', ')})`);
      }

      // Classify answer types (deterministic heuristics)
      const answerTypes = classifyAnswerTypes(question);
      const requiresHubFacts = answerTypes.includes('HUB_CONTENT') || answerTypes.includes('HUB_PROCESS');
      const isChatPhatic = answerTypes.includes('CHAT_PHATIC');
      const isOutOfScope = answerTypes.includes('OUT_OF_SCOPE_FACT');
      
      // Log answer types for audit
      console.log(`[${errorCode}] Answer types: ${answerTypes.join(', ')}`);
      
      // Filter usable chunks (strengthened logic) - use enriched query for better retrieval
      const filtered = filterUsableChunks(retrievedChunks || [], enrichedQuery, 6);
      const usableChunks = filtered.usable;
      const usableCount = filtered.usableCount;
      
      // Extract min score and overlap used for logging
      const minScoreUsed = filtered.results.length > 0 
        ? Math.min(...filtered.results.filter(r => r.score !== null).map(r => r.score))
        : null;
      const overlapUsed = filtered.results.length > 0
        ? Math.max(...filtered.results.map(r => r.overlap || 0))
        : 0;

      // Log audit information
      const retrievalDocIds = retrievedChunks?.map(c => {
        const filename = c.path.split('/').pop() || 'unknown.md';
        const chunkId = c.chunkIndex !== undefined ? c.chunkIndex : 'unknown';
        return `${filename}#chunk${chunkId}`;
      }) || [];

      // Modified grounding gate: HUB_CONTENT and HUB_PROCESS require excerpts, others may proceed without
      const hardGatePassed = requiresHubFacts ? (usableCount > 0) : true;

      let finalMode = 'NOT_COVERED';
      let answer = NOT_COVERED_RESPONSE;
      let confidence = 'low';
      let citations = [];
      let updatedState = { ...state };

      // Handle CHAT_PHATIC (small talk, greetings)
      if (isChatPhatic) {
        finalMode = 'GREETING';
        answer = CHAT_PHATIC_RESPONSE;
        confidence = 'low';
        citations = [];
        // Don't update state for chat phatic
      }
      // Hard gate: 0 usable excerpts for Hub facts
      else if (!hardGatePassed && requiresHubFacts) {
        if (isOutOfScope) {
          finalMode = 'NOT_COVERED';
          answer = NOT_COVERED_RESPONSE;
        } else {
          // Prevent reframe loops for concrete questions
          const isConcrete = isConcreteQuestion(question);
          if (isConcrete) {
            // For concrete questions, answer what is supported, state what's not covered, ask ONE clarifying question
            finalMode = 'NOT_COVERED';
            answer = "I don't have enough in the preview materials to answer that fully. Are you asking about AI basics, using AI for coursework, tools, business use, or risks/ethics?";
          } else {
            finalMode = 'REFRAME';
            answer = REFRAME_RESPONSE;
          }
        }
        confidence = 'low';
        citations = [];
        // Don't update state
      }
      // LLM precedence: >=1 usable excerpt OR non-HUB_CONTENT/HUB_PROCESS question
      else {
        try {
          // Pass answer types and enriched query to LLM for context
          const llmResult = await generateAnswer(enrichedQuery, usableChunks, state, answerTypes, env);
          finalMode = llmResult.mode;
          answer = llmResult.answer;
          
          // Update state only if mode is ANSWER or EXPAND and sources exist
          if ((llmResult.mode === 'ANSWER' || llmResult.mode === 'EXPAND') && llmResult.sources.length > 0) {
            updatedState.active_topic_label = question.substring(0, 50);
            updatedState.active_topic_query = normalizedQuery;
            updatedState.active_sources = llmResult.sources;
          }
          
          // Generate citations from sources (only docs actually referenced)
          citations = llmResult.sources.map(source => {
            // Extract filename from source string
            const filename = source.split('#')[0] || source;
            const chunkId = source.split('#')[1] || 'unknown';
            return {
              path: filename,
              chunkId: chunkId
            };
          });
          
          // Log sources discipline
          const sourcesUsedCount = llmResult.sources.length > 0 && llmResult.sources[0].toLowerCase() !== 'none' 
            ? llmResult.sources.length 
            : 0;
          console.log(`[${errorCode}] Sources used count: ${sourcesUsedCount}`);
          
          // Calculate confidence based on mode and sources
          if (llmResult.mode === 'ANSWER' && llmResult.sources.length >= 2) {
            confidence = 'high';
          } else if (llmResult.mode === 'ANSWER' || llmResult.mode === 'EXPAND') {
            confidence = 'medium';
          } else {
            confidence = 'low';
          }
        } catch (error) {
          console.error(`[${errorCode}] Error generating answer, using fallback:`, error.message);
          finalMode = 'REFRAME';
          answer = REFRAME_RESPONSE;
          confidence = 'low';
          citations = [];
        }
      }

      // Structured audit log
      const sourcesUsedCount = citations.length;
      console.log(JSON.stringify({
        errorCode: errorCode,
        classification: classification,
        answer_types: answerTypes,
        requires_hub_facts: requiresHubFacts,
        normalized_query: normalizedQuery,
        enriched_query: enrichedQuery,
        enrichment_labels: enrichmentResult.labels,
        is_concrete_question: isConcreteQuestion(question),
        active_topic_label_before: state.active_topic_label,
        active_topic_label_after: updatedState.active_topic_label,
        retrieval_doc_ids: retrievalDocIds,
        usable_count: usableCount,
        min_score_used: minScoreUsed,
        overlap_used: overlapUsed,
        hard_gate_passed: hardGatePassed,
        sources_used_count: sourcesUsedCount,
        final_mode: finalMode
      }));

      // Return response
      const response = {
        answer: answer,
        confidence: confidence,
        citations: citations,
        mode: finalMode,
        conversationState: updatedState
      };
      
      return new Response(JSON.stringify(response), {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });

    } catch (error) {
      console.error(`[${errorCode}] Worker error:`, error);
      console.error(`[${errorCode}] Error stack:`, error.stack);
      
      // Backward compatible: return minimal response
      return new Response(JSON.stringify({
        answer: "I'm having trouble generating a response right now. Please try again.",
        confidence: 'low',
        citations: [],
        mode: 'REFRAME',
        conversationState: {}
      }), {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
  }
};
