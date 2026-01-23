#!/usr/bin/env python3
"""
Search chunks using BM25 lexical ranking.
"""

import json
import sys
import re
import math
from pathlib import Path
from collections import defaultdict


def preprocess_text(text):
    """Preprocess text: lowercase, strip punctuation except quotes, tokenize."""
    if not text:
        return []
    # Lowercase
    text = text.lower()
    # Keep quotes for phrase detection
    # Tokenize on whitespace
    tokens = text.split()
    # Strip punctuation from tokens but preserve quotes
    cleaned_tokens = []
    for token in tokens:
        # Remove punctuation except quotes
        cleaned = re.sub(r'[^\w\']', '', token)
        if cleaned:
            cleaned_tokens.append(cleaned)
    return cleaned_tokens


def extract_quoted_phrases(query):
    """Extract quoted phrases from query."""
    phrases = re.findall(r'"([^"]+)"', query)
    return phrases


def expand_query(query_tokens):
    """Apply query expansions."""
    expanded = set(query_tokens)
    query_lower = ' '.join(query_tokens).lower()
    
    if 'nist' in query_lower:
        expanded.update(['ai', 'rmf'])
    
    if 'rmf' in query_lower:
        expanded.update(['risk', 'management', 'framework'])
    
    return expanded


def compute_bm25_score(chunk_tokens, query_tokens, doc_freqs, idf, avg_doc_length, k1=1.5, b=0.75):
    """Compute BM25 score for a chunk."""
    doc_length = len(chunk_tokens)
    score = 0.0
    
    # Count term frequencies in chunk
    term_freqs = defaultdict(int)
    for token in chunk_tokens:
        term_freqs[token] += 1
    
    # Compute BM25 for each query term
    for term in query_tokens:
        if term not in idf:
            continue
        
        tf = term_freqs[term]
        if tf == 0:
            continue
        
        # BM25 formula
        numerator = idf[term] * tf * (k1 + 1)
        denominator = tf + k1 * (1 - b + b * (doc_length / avg_doc_length))
        score += numerator / denominator
    
    return score


def get_snippet(text, max_length=300):
    """Get a snippet of text, truncated to max_length."""
    if len(text) <= max_length:
        return text
    
    # Try to truncate at word boundary
    snippet = text[:max_length]
    last_space = snippet.rfind(' ')
    if last_space > max_length * 0.8:
        snippet = snippet[:last_space] + '...'
    else:
        snippet = snippet + '...'
    
    return snippet


def main():
    """Main search function."""
    if len(sys.argv) < 2:
        print("Usage: python search_chunks_v2.py <query>")
        print('Example: python search_chunks_v2.py "academic integrity"')
        print('Example: python search_chunks_v2.py "NIST risk management framework"')
        sys.exit(1)
    
    query = ' '.join(sys.argv[1:])
    
    # Paths are relative to foundation/ directory
    SCRIPT_DIR = Path(__file__).parent.parent.parent
    if (SCRIPT_DIR / "foundation").exists():
        BASE_DIR = SCRIPT_DIR / "foundation"
    else:
        BASE_DIR = SCRIPT_DIR
    
    chunks_path = BASE_DIR / "data/chunks/chunks.jsonl"
    
    if not chunks_path.exists():
        print(f"Error: {chunks_path} not found!")
        sys.exit(1)
    
    print(f"Searching for: '{query}'")
    print(f"Loading and indexing chunks from {chunks_path}...")
    
    # Load all chunks
    chunks = []
    all_tokens = []  # For computing document frequencies
    
    with open(chunks_path, 'r', encoding='utf-8') as f:
        for line in f:
            chunk = json.loads(line)
            chunks.append(chunk)
            
            # Preprocess chunk text
            chunk_text = chunk.get('text', '')
            chunk_tokens = preprocess_text(chunk_text)
            all_tokens.append(chunk_tokens)
    
    print(f"Loaded {len(chunks)} chunks")
    
    # Compute document frequencies
    doc_freqs = defaultdict(int)
    for chunk_tokens in all_tokens:
        unique_tokens = set(chunk_tokens)
        for token in unique_tokens:
            doc_freqs[token] += 1
    
    # Compute IDF
    total_docs = len(chunks)
    idf = {}
    for token, df in doc_freqs.items():
        idf[token] = math.log((total_docs - df + 0.5) / (df + 0.5) + 1.0)
    
    # Compute average document length
    total_length = sum(len(tokens) for tokens in all_tokens)
    avg_doc_length = total_length / total_docs if total_docs > 0 else 1.0
    
    # Preprocess query
    query_tokens = preprocess_text(query)
    
    # Extract quoted phrases
    quoted_phrases = extract_quoted_phrases(query)
    
    # Expand query
    expanded_query_tokens = expand_query(query_tokens)
    
    print(f"Query tokens: {query_tokens}")
    if quoted_phrases:
        print(f"Quoted phrases: {quoted_phrases}")
    if len(expanded_query_tokens) > len(query_tokens):
        print(f"Expanded tokens: {expanded_query_tokens - set(query_tokens)}")
    
    # Score all chunks
    scored_chunks = []
    
    for idx, chunk in enumerate(chunks):
        chunk_text = chunk.get('text', '')
        chunk_title = chunk.get('title', '')
        chunk_tokens = all_tokens[idx]
        
        # Compute base BM25 score
        base_score = compute_bm25_score(
            chunk_tokens, 
            expanded_query_tokens, 
            doc_freqs, 
            idf, 
            avg_doc_length
        )
        
        # Title boost: multiply contribution of tokens found in title
        title_tokens = preprocess_text(chunk_title)
        title_token_set = set(title_tokens)
        
        title_boost_score = 0.0
        for term in expanded_query_tokens:
            if term in title_token_set:
                # Recompute this term's contribution with 2x multiplier
                if term in chunk_tokens:
                    term_freqs = defaultdict(int)
                    for t in chunk_tokens:
                        term_freqs[t] += 1
                    tf = term_freqs[term]
                    if tf > 0 and term in idf:
                        doc_length = len(chunk_tokens)
                        numerator = idf[term] * tf * (1.5 + 1)
                        denominator = tf + 1.5 * (1 - 0.75 + 0.75 * (doc_length / avg_doc_length))
                        term_contribution = numerator / denominator
                        # Add extra contribution (multiply by 2 means add 1x more)
                        title_boost_score += term_contribution
        
        # Phrase boost: +20 for exact quoted phrases
        phrase_boost = 0.0
        chunk_text_lower = chunk_text.lower()
        for phrase in quoted_phrases:
            if phrase.lower() in chunk_text_lower:
                phrase_boost += 20.0
        
        # Total score
        total_score = base_score + title_boost_score + phrase_boost
        
        if total_score > 0:
            scored_chunks.append({
                'score': total_score,
                'chunk': chunk
            })
    
    # Sort by score (descending)
    scored_chunks.sort(key=lambda x: -x['score'])
    
    # Get top 8
    top_chunks = scored_chunks[:8]
    
    if not top_chunks:
        print("\nNo matching chunks found.")
        return
    
    print(f"\nFound {len(scored_chunks)} matching chunks. Top 8:\n")
    print("="*80)
    
    for idx, item in enumerate(top_chunks, 1):
        chunk = item['chunk']
        score = item['score']
        chunk_text = chunk.get('text', '')
        
        print(f"\n[{idx}] Score: {score:.4f}")
        print(f"Chunk ID: {chunk.get('chunk_id', 'N/A')}")
        print(f"Title: {chunk.get('title', 'N/A')}")
        print(f"URL: {chunk.get('url', 'N/A')}")
        print(f"Snippet: {get_snippet(chunk_text, 300)}")
        print("-"*80)


if __name__ == "__main__":
    main()
