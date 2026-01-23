#!/usr/bin/env python3
"""
Search chunks using simple token overlap scoring.
"""

import json
import sys
import re
from pathlib import Path


def tokenize(text):
    """Tokenize text into lowercase words."""
    # Convert to lowercase and extract words
    words = re.findall(r'\b\w+\b', text.lower())
    return set(words)


def score_chunk(chunk_text, query_tokens):
    """Score a chunk based on token overlap."""
    chunk_tokens = tokenize(chunk_text)
    # Count unique overlapping tokens
    overlap = len(query_tokens & chunk_tokens)
    return overlap


def get_snippet(text, max_length=300):
    """Get a snippet of text, truncated to max_length."""
    if len(text) <= max_length:
        return text
    
    # Try to truncate at word boundary
    snippet = text[:max_length]
    last_space = snippet.rfind(' ')
    if last_space > max_length * 0.8:  # If we found a space reasonably close
        snippet = snippet[:last_space] + '...'
    else:
        snippet = snippet + '...'
    
    return snippet


def main():
    """Main search function."""
    if len(sys.argv) < 2:
        print("Usage: python search_chunks.py <query>")
        print('Example: python search_chunks.py "academic integrity"')
        sys.exit(1)
    
    query = ' '.join(sys.argv[1:])
    query_tokens = tokenize(query)
    
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
    print(f"Loading chunks from {chunks_path}...")
    
    # Load and score chunks
    scored_chunks = []
    
    with open(chunks_path, 'r', encoding='utf-8') as f:
        for line in f:
            chunk = json.loads(line)
            chunk_text = chunk.get('text', '')
            
            # Score chunk
            score = score_chunk(chunk_text, query_tokens)
            
            if score > 0:  # Only include chunks with at least one matching token
                scored_chunks.append({
                    'score': score,
                    'chunk': chunk,
                    'length': len(chunk_text)
                })
    
    # Sort by score (descending), then by length (ascending) as tie-breaker
    scored_chunks.sort(key=lambda x: (-x['score'], x['length']))
    
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
        
        print(f"\n[{idx}] Score: {score}")
        print(f"Chunk ID: {chunk.get('chunk_id', 'N/A')}")
        print(f"Title: {chunk.get('title', 'N/A')}")
        print(f"URL: {chunk.get('url', 'N/A')}")
        print(f"Snippet: {get_snippet(chunk_text, 300)}")
        print("-"*80)


if __name__ == "__main__":
    main()
