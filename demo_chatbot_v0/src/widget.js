// Student AI Hub — Site Guide Widget (Preview)
// Simplified, embed-friendly version with improved retrieval

(function() {
    'use strict';

    // Configuration
    const WORKER_URL = "https://student-ai-hub-site-guide-preview.ajs10845.workers.dev";
    const DEBUG_MODE = false; // Set to true for debug logging

    // Stopwords will be replaced by build script
    const stopwords = new Set([
        'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
        'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
        'to', 'was', 'were', 'will', 'with', 'this', 'these', 'those',
        'i', 'you', 'we', 'they', 'what', 'which', 'who', 'where', 'when',
        'why', 'how', 'can', 'could', 'should', 'would', 'may', 'might',
        'must', 'do', 'does', 'did', 'have', 'has', 'had', 'been', 'being'
    ]);

    // Dataset will be embedded here in dist version
    let dataset = null;

    // Conversation state (minimal)
    let conversationState = {
        active_topic_label: null,
        active_topic_query: null,
        active_sources: []
    };

    // Load dataset (in dist version, this will be embedded)
    function loadDataset() {
        // In dist version, dataset is embedded in the HTML
        // This function will be replaced with the embedded dataset
        return null;
    }

    // Normalize and expand query
    function normalizeQuery(query) {
        // Normalize: lowercase, strip punctuation, collapse whitespace
        let normalized = query.toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();

        // Expand common shorthand
        const expansions = {
            'hub': 'student ai hub',
            'psu': 'penn state',
            'smeal': 'smeal college of business',
            'ai': 'artificial intelligence',
            'site': 'student ai hub site'
        };

        for (const [short, expanded] of Object.entries(expansions)) {
            const regex = new RegExp(`\\b${short}\\b`, 'gi');
            normalized = normalized.replace(regex, expanded);
        }

        // If query is very short (< 5 tokens), prepend context
        const tokens = normalized.split(/\s+/).filter(t => t.length > 0);
        if (tokens.length < 5) {
            normalized = 'Student AI Hub: ' + normalized;
        }

        return normalized;
    }

    // Tokenize text (lowercase, split, remove stopwords)
    function tokenize(text) {
        return text.toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(token => token.length > 0 && !stopwords.has(token));
    }

    // Calculate TF-IDF-like score (simple term frequency weighting)
    function calculateTFIDFScore(chunkTokens, queryTokens) {
        const chunkTokenCounts = {};
        chunkTokens.forEach(token => {
            chunkTokenCounts[token] = (chunkTokenCounts[token] || 0) + 1;
        });

        let score = 0;
        queryTokens.forEach(queryToken => {
            if (chunkTokenCounts[queryToken]) {
                // Simple TF weighting: more occurrences = higher score
                const tf = chunkTokenCounts[queryToken];
                score += tf / (1 + Math.log(chunkTokens.length)); // Normalize by chunk length
            }
        });

        return score;
    }

    // Score chunk against query (hybrid: keyword overlap + TF-IDF-like)
    function scoreChunk(chunk, queryTokens) {
        const chunkTokens = tokenize(chunk.text);
        const chunkTokenSet = new Set(chunkTokens);
        
        // Keyword overlap score (normalized)
        let overlapCount = 0;
        queryTokens.forEach(queryToken => {
            if (chunkTokenSet.has(queryToken)) {
                overlapCount++;
            }
        });
        const overlapScore = queryTokens.length > 0 ? overlapCount / queryTokens.length : 0;

        // TF-IDF-like score
        const tfidfScore = calculateTFIDFScore(chunkTokens, queryTokens);
        const normalizedTFIDF = Math.min(tfidfScore / queryTokens.length, 1.0);

        // Hybrid: combine both scores (weighted average)
        const hybridScore = (overlapScore * 0.6) + (normalizedTFIDF * 0.4);

        return hybridScore;
    }

    // Get chunks from a specific page
    function getChunksFromPage(pageFilename) {
        if (!dataset || !dataset.chunks) return [];
        return dataset.chunks.filter(chunk => chunk.path.includes(pageFilename));
    }

    // Retrieve top chunks with improved reliability
    function retrieveChunks(query, minK = 5, maxK = 6) {
        if (!dataset || !dataset.chunks) {
            if (DEBUG_MODE) console.log('[RETRIEVAL] No dataset available');
            return [];
        }

        // Normalize query
        const normalizedQuery = normalizeQuery(query);
        const queryTokens = tokenize(normalizedQuery);

        if (DEBUG_MODE) {
            console.log('[RETRIEVAL] Original query:', query);
            console.log('[RETRIEVAL] Normalized query:', normalizedQuery);
            console.log('[RETRIEVAL] Query tokens:', queryTokens);
        }

        // Score all chunks
        const scoredChunks = dataset.chunks.map(chunk => ({
            chunk: chunk,
            score: scoreChunk(chunk, queryTokens)
        }));

        // Sort by score descending
        scoredChunks.sort((a, b) => b.score - a.score);

        if (DEBUG_MODE && scoredChunks.length > 0) {
            console.log('[RETRIEVAL] Top 5 scores:', scoredChunks.slice(0, 5).map(s => ({
                path: s.chunk.path.split('/').pop(),
                score: s.score.toFixed(3)
            })));
        }

        // Always return at least minK chunks (even if scores are low)
        // Remove threshold filter - always get top chunks
        let resultChunks = scoredChunks
            .slice(0, maxK)
            .map(item => item.chunk);

        // If we still don't have enough, add chunks from home.md as fallback
        if (resultChunks.length < minK) {
            const homeChunks = getChunksFromPage('home.md');
            const existingPaths = new Set(resultChunks.map(c => c.path));
            for (const chunk of homeChunks) {
                if (!existingPaths.has(chunk.path) && resultChunks.length < minK) {
                    resultChunks.push(chunk);
                }
            }
        }

        if (DEBUG_MODE) {
            console.log('[RETRIEVAL] Selected chunks:', resultChunks.map(c => ({
                path: c.path.split('/').pop(),
                chunkId: c.chunkIndex !== undefined ? c.chunkIndex : 'unknown'
            })));
        }

        return resultChunks.slice(0, maxK);
    }

    // Call Cloudflare Worker to generate answer
    async function generateAnswerWithWorker(question, retrievedChunks) {
        const errorCode = `WORKER_ERROR_${Date.now()}`;
        
        try {
            if (DEBUG_MODE) {
                console.log(`[${errorCode}] Calling worker: ${WORKER_URL}`);
                console.log(`[${errorCode}] Request payload:`, {
                    question: question.substring(0, 50) + '...',
                    retrievedChunksCount: retrievedChunks.length
                });
            }

            const response = await fetch(WORKER_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    question: question,
                    retrievedChunks: retrievedChunks,
                    conversationState: conversationState
                })
            });

            if (DEBUG_MODE) {
                console.log(`[${errorCode}] Response status: ${response.status} ${response.statusText}`);
            }

            if (!response.ok) {
                // Try to read error text
                let errorText = '';
                try {
                    errorText = await response.text();
                    console.error(`[${errorCode}] Worker error response:`, errorText);
                } catch (e) {
                    console.error(`[${errorCode}] Could not read error response:`, e);
                }
                throw new Error(`Worker returned ${response.status}: ${errorText.substring(0, 200)}`);
            }

            // Parse JSON response
            let data;
            try {
                const responseText = await response.text();
                if (DEBUG_MODE) {
                    console.log(`[${errorCode}] Response text length:`, responseText.length);
                }
                data = JSON.parse(responseText);
                if (DEBUG_MODE) {
                    console.log(`[${errorCode}] Parsed response:`, {
                        hasAnswer: !!data.answer,
                        confidence: data.confidence,
                        citationsCount: data.citations ? data.citations.length : 0
                    });
                }
                
                // Log unexpected fields for debugging
                const expectedFields = ['answer', 'confidence', 'citations'];
                const unexpectedFields = Object.keys(data).filter(key => !expectedFields.includes(key));
                if (unexpectedFields.length > 0) {
                    console.log(`[${errorCode}] Unexpected fields in response (ignored):`, unexpectedFields);
                }
            } catch (parseError) {
                console.error(`[${errorCode}] JSON parse error:`, parseError);
                console.error(`[${errorCode}] Raw response text:`, responseText?.substring(0, 500));
                throw new Error(`Invalid JSON response: ${parseError.message}`);
            }
            
            // Handle response format: { answer, confidence?, citations? }
            // Backward compatible with string responses
            if (typeof data === 'string') {
                if (DEBUG_MODE) console.log(`[${errorCode}] Worker returned string, wrapping in object`);
                return {
                    answer: data,
                    confidence: 'low',
                    citations: []
                };
            }
            
            if (data.answer) {
                // Update conversation state if provided
                if (data.conversationState) {
                    conversationState = data.conversationState;
                }
                
                return {
                    answer: data.answer,
                    confidence: data.confidence || 'medium',
                    citations: data.citations || [],
                    mode: data.mode || 'ANSWER'
                };
            }

            throw new Error(`Worker response missing answer field. Response keys: ${Object.keys(data).join(', ')}`);
        } catch (error) {
            console.error(`[${errorCode}] Error calling worker:`, error);
            console.error(`[${errorCode}] Error details:`, {
                name: error.name,
                message: error.message,
                stack: error.stack?.substring(0, 500)
            });
            throw error;
        }
    }

    // Hide empty state when first message is sent
    function hideEmptyState() {
        const emptyState = document.getElementById('empty-state');
        if (emptyState) {
            emptyState.style.display = 'none';
        }
    }

    // Add message to transcript
    function addMessage(text, isUser, messageId = null) {
        const transcriptArea = document.getElementById('transcript-area');
        
        // Hide empty state when user sends first message
        if (isUser) {
            hideEmptyState();
        }
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
        
        if (messageId) {
            messageDiv.setAttribute('data-message-id', messageId);
        }

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';

        // Extract answer from text (string or object with answer field)
        const answerText = typeof text === 'string' ? text : (text.answer || '');
        const citations = typeof text === 'object' && text.citations ? text.citations : [];
        
        const p = document.createElement('p');
        p.textContent = answerText;
        contentDiv.appendChild(p);

        // Show citations if present (minimal, single line)
        if (citations.length > 0) {
            const citationsDiv = document.createElement('div');
            citationsDiv.className = 'citations-line';
            const citationTexts = citations.map(c => {
                if (typeof c === 'string') return c;
                return c.path ? c.path.split('/').pop() : 'unknown';
            });
            citationsDiv.textContent = 'Preview sources: ' + citationTexts.join(', ');
            contentDiv.appendChild(citationsDiv);
        }

        messageDiv.appendChild(contentDiv);
        transcriptArea.appendChild(messageDiv);
        transcriptArea.scrollTop = transcriptArea.scrollHeight;
        
        return messageDiv;
    }

    // Update message content (for replacing "Thinking..." with actual answer)
    function updateMessage(messageDiv, text) {
        const contentDiv = messageDiv.querySelector('.message-content');
        if (!contentDiv) return;

        // Extract answer from text (string or object with answer field)
        const answerText = typeof text === 'string' ? text : (text.answer || '');
        const citations = typeof text === 'object' && text.citations ? text.citations : [];
        
        contentDiv.innerHTML = '';
        const p = document.createElement('p');
        p.textContent = answerText;
        contentDiv.appendChild(p);

        // Show citations if present (minimal, single line)
        if (citations.length > 0) {
            const citationsDiv = document.createElement('div');
            citationsDiv.className = 'citations-line';
            const citationTexts = citations.map(c => {
                if (typeof c === 'string') return c;
                return c.path ? c.path.split('/').pop() : 'unknown';
            });
            citationsDiv.textContent = 'Preview sources: ' + citationTexts.join(', ');
            contentDiv.appendChild(citationsDiv);
        }
    }

    // Handle user input
    async function handleUserInput() {
        const input = document.getElementById('user-input');
        const query = input.value.trim();

        if (!query) {
            return;
        }

        // Add user message
        addMessage(query, true);
        input.value = '';

        // Disable input while processing
        const sendButton = document.getElementById('send-button');
        sendButton.disabled = true;

        // Show "Thinking..." message
        const thinkingMessage = addMessage("Thinking…", false, 'thinking');
        const errorCode = `CLIENT_ERROR_${Date.now()}`;

        try {
            // Retrieve chunks locally (improved reliability)
            let chunks = retrieveChunks(query, 5, 6);

            // If still empty, force include home.md as absolute fallback
            if (chunks.length === 0) {
                console.error(`[${errorCode}] No chunks available, dataset may be missing`);
                updateMessage(thinkingMessage, {
                    answer: "I can't access the preview materials right now. Please try again.",
                    citations: []
                });
            } else {
                // Call worker to generate answer
                try {
                    const workerResponse = await generateAnswerWithWorker(query, chunks);
                    
                    updateMessage(thinkingMessage, {
                        answer: workerResponse.answer,
                        confidence: workerResponse.confidence,
                        citations: workerResponse.citations || []
                    });
                } catch (error) {
                    // Worker error - show graceful error message with error code
                    console.error(`[${errorCode}] Worker call failed:`, error);
                    const userMessage = "I'm having trouble generating a response right now. Please try again.";
                    updateMessage(thinkingMessage, {
                        answer: userMessage,
                        citations: []
                    });
                }
            }
        } catch (error) {
            // Unexpected error
            console.error(`[${errorCode}] Unexpected error:`, error);
            updateMessage(thinkingMessage, {
                answer: "An error occurred. Please try again.",
                citations: []
            });
        } finally {
            sendButton.disabled = false;
        }
    }

    // Initialize
    function init() {
        // Detect embed mode (inside iframe)
        if (window.self !== window.top) {
            document.body.classList.add('embed');
        }
        
        // Load dataset (will be embedded in dist version)
        dataset = loadDataset();
        
        if (!dataset || !dataset.chunks) {
            console.error('Dataset not loaded. Check that dataset is embedded in HTML.');
        } else {
            console.log(`Dataset loaded: ${dataset.chunks.length} chunks from ${dataset.files.length} files`);
        }

        // Set up event listeners
        const sendButton = document.getElementById('send-button');
        const userInput = document.getElementById('user-input');

        sendButton.addEventListener('click', () => {
            handleUserInput().catch(error => {
                console.error('Error in handleUserInput:', error);
            });
        });
        
        userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleUserInput().catch(error => {
                    console.error('Error in handleUserInput:', error);
                });
            }
        });

        // Set up question chip click handlers
        const questionChips = document.querySelectorAll('.question-chip');
        questionChips.forEach(chip => {
            chip.addEventListener('click', () => {
                const question = chip.getAttribute('data-question');
                if (question) {
                    userInput.value = question;
                    // Immediately submit
                    handleUserInput().catch(error => {
                        console.error('Error in handleUserInput:', error);
                    });
                }
            });
        });
    }

    // Run initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
