#!/usr/bin/env python3
"""
Chunk corpus text into smaller segments for processing.
"""

import json
import re
from pathlib import Path
from collections import defaultdict


def normalize_whitespace(text):
    """Normalize whitespace but keep sentence punctuation."""
    # Replace multiple spaces with single space
    text = re.sub(r' +', ' ', text)
    # Replace multiple newlines with single newline
    text = re.sub(r'\n+', '\n', text)
    # Strip leading/trailing whitespace
    text = text.strip()
    return text


def split_into_paragraphs(text):
    """Split text into paragraphs on double newlines, fallback to single newlines."""
    # First try splitting on double newlines
    paragraphs = re.split(r'\n\n+', text)
    paragraphs = [p.strip() for p in paragraphs if p.strip()]
    
    # If we only got one paragraph, try splitting on single newlines
    if len(paragraphs) <= 1:
        paragraphs = re.split(r'\n+', text)
        paragraphs = [p.strip() for p in paragraphs if p.strip()]
    
    return paragraphs


def chunk_text(text, min_chunk_size=400, target_min=1200, target_max=1800):
    """
    Chunk text into segments of target size, respecting paragraph boundaries.
    
    Args:
        text: Text to chunk
        min_chunk_size: Minimum chunk size (except last remainder)
        target_min: Target minimum chunk size
        target_max: Target maximum chunk size
    
    Returns:
        List of (chunk_text, char_start, char_end) tuples
    """
    text = normalize_whitespace(text)
    total_length = len(text)
    
    # If text is shorter than min_chunk_size, return as single chunk
    if total_length < min_chunk_size:
        return [(text, 0, total_length)]
    
    # Split into paragraphs
    paragraphs = split_into_paragraphs(text)
    
    if not paragraphs:
        return [(text, 0, total_length)]
    
    chunks = []
    current_chunk_paras = []
    
    for para in paragraphs:
        para_length = len(para)
        
        # Calculate what the current chunk length would be with this paragraph
        if current_chunk_paras:
            current_length = len('\n\n'.join(current_chunk_paras))
            potential_length = current_length + 2 + para_length  # +2 for \n\n
        else:
            current_length = 0
            potential_length = para_length
        
        # If adding this paragraph would exceed target_max, finalize current chunk
        if current_length > 0 and potential_length > target_max:
            # Finalize current chunk
            chunk_text_content = '\n\n'.join(current_chunk_paras)
            if len(chunk_text_content) >= min_chunk_size:
                chunks.append(chunk_text_content)
                current_chunk_paras = [para]
            else:
                # Current chunk too small, add paragraph anyway (will exceed max but that's ok)
                current_chunk_paras.append(para)
        else:
            # Add paragraph to current chunk
            current_chunk_paras.append(para)
            
            # If we've reached target_min or exceeded, finalize
            if potential_length >= target_min:
                chunk_text_content = '\n\n'.join(current_chunk_paras)
                chunks.append(chunk_text_content)
                current_chunk_paras = []
    
    # Handle remaining chunk
    if current_chunk_paras:
        chunk_text_content = '\n\n'.join(current_chunk_paras)
        # If remaining chunk is too small and we have other chunks, merge with last
        if len(chunks) > 0 and len(chunk_text_content) < min_chunk_size:
            chunks[-1] = chunks[-1] + '\n\n' + chunk_text_content
        else:
            chunks.append(chunk_text_content)
    
    # Calculate accurate character positions based on original text
    final_chunks = []
    current_pos = 0
    
    for chunk_text_content in chunks:
        chunk_length = len(chunk_text_content)
        chunk_start = current_pos
        chunk_end = current_pos + chunk_length
        final_chunks.append((chunk_text_content, chunk_start, chunk_end))
        current_pos = chunk_end
    
    return final_chunks


def main():
    """Main chunking function."""
    index_path = Path("data/corpus_index_stable.json")
    chunks_jsonl_path = Path("data/chunks.jsonl")
    chunk_index_path = Path("data/chunk_index.json")
    
    # Read stable index
    print(f"Reading {index_path}...")
    with open(index_path, 'r', encoding='utf-8') as f:
        index = json.load(f)
    
    sources_chunked = 0
    total_chunks = 0
    chunk_lengths = []
    section_chunk_counts = defaultdict(int)
    
    all_chunks = []
    chunk_index_entries = []
    
    print(f"Processing {len(index['sources'])} sources...")
    
    for source in index['sources']:
        # Only chunk successful sources with full text
        if source.get('scrape_status') != 'success' or not source.get('full_text_present'):
            continue
        
        stable_id = source.get('stable_id', '')
        if not stable_id:
            continue
        
        # Try to load snapshot
        snapshot_path = source.get('snapshot_path_stable')
        if not snapshot_path or not Path(snapshot_path).exists():
            snapshot_path = source.get('snapshot_path_original')
        
        if not snapshot_path or not Path(snapshot_path).exists():
            print(f"  Warning: No snapshot found for {stable_id}")
            continue
        
        # Load snapshot
        try:
            with open(snapshot_path, 'r', encoding='utf-8') as f:
                snapshot = json.load(f)
        except Exception as e:
            print(f"  Error loading {snapshot_path}: {e}")
            continue
        
        # Get full text
        full_text = snapshot.get('full_text')
        if not full_text or len(full_text.strip()) < 400:
            # Still emit one chunk if text exists but is small
            if full_text and len(full_text.strip()) > 0:
                text = normalize_whitespace(full_text)
                chunk_id = f"{stable_id}::c0000"
                chunk = {
                    'chunk_id': chunk_id,
                    'stable_id': stable_id,
                    'url': source.get('url', ''),
                    'final_url': source.get('final_url', ''),
                    'retrieved_at': source.get('retrieved_at'),
                    'title': source.get('title'),
                    'section': source.get('section', ''),
                    'source_type': source.get('source_type', ''),
                    'content_hash': snapshot.get('content_hash'),
                    'chunk_index': 0,
                    'char_start': 0,
                    'char_end': len(text),
                    'text': text
                }
                all_chunks.append(chunk)
                chunk_index_entries.append({
                    'chunk_id': chunk_id,
                    'stable_id': stable_id,
                    'section': source.get('section', ''),
                    'title': source.get('title'),
                    'url': source.get('url', ''),
                    'retrieved_at': source.get('retrieved_at'),
                    'char_start': 0,
                    'char_end': len(text)
                })
                sources_chunked += 1
                total_chunks += 1
                chunk_lengths.append(len(text))
                section_chunk_counts[source.get('section', 'Unknown')] += 1
            continue
        
        # Chunk the text
        chunks = chunk_text(full_text)
        
        if not chunks:
            continue
        
        sources_chunked += 1
        
        # Create chunk entries
        for idx, (chunk_text_content, char_start, char_end) in enumerate(chunks):
            chunk_id = f"{stable_id}::c{idx:04d}"
            
            chunk = {
                'chunk_id': chunk_id,
                'stable_id': stable_id,
                'url': source.get('url', ''),
                'final_url': source.get('final_url', ''),
                'retrieved_at': source.get('retrieved_at'),
                'title': source.get('title'),
                'section': source.get('section', ''),
                'source_type': source.get('source_type', ''),
                'content_hash': snapshot.get('content_hash'),
                'chunk_index': idx,
                'char_start': char_start,
                'char_end': char_end,
                'text': chunk_text_content
            }
            
            all_chunks.append(chunk)
            chunk_index_entries.append({
                'chunk_id': chunk_id,
                'stable_id': stable_id,
                'section': source.get('section', ''),
                'title': source.get('title'),
                'url': source.get('url', ''),
                'retrieved_at': source.get('retrieved_at'),
                'char_start': char_start,
                'char_end': char_end
            })
            
            chunk_lengths.append(len(chunk_text_content))
            section_chunk_counts[source.get('section', 'Unknown')] += 1
            total_chunks += 1
    
    # Write chunks.jsonl
    print(f"\nWriting {chunks_jsonl_path}...")
    with open(chunks_jsonl_path, 'w', encoding='utf-8') as f:
        for chunk in all_chunks:
            f.write(json.dumps(chunk, ensure_ascii=False) + '\n')
    
    # Write chunk_index.json
    print(f"Writing {chunk_index_path}...")
    avg_chunk_length = sum(chunk_lengths) / len(chunk_lengths) if chunk_lengths else 0
    
    chunk_index = {
        'generated_at': index.get('generated_at'),
        'sources_chunked': sources_chunked,
        'total_chunks': total_chunks,
        'average_chunk_length': round(avg_chunk_length, 1),
        'chunks': chunk_index_entries
    }
    
    with open(chunk_index_path, 'w', encoding='utf-8') as f:
        json.dump(chunk_index, f, indent=2, ensure_ascii=False)
    
    # Print summary
    print("\n" + "="*60)
    print("CHUNKING SUMMARY")
    print("="*60)
    
    print(f"\nSources chunked: {sources_chunked}")
    print(f"Total chunks: {total_chunks}")
    print(f"Average chunk length: {avg_chunk_length:.1f} characters")
    
    if chunk_lengths:
        print(f"Min chunk length: {min(chunk_lengths)} characters")
        print(f"Max chunk length: {max(chunk_lengths)} characters")
    
    print(f"\nChunks by Section:")
    for section, count in sorted(section_chunk_counts.items()):
        print(f"  {section}: {count}")
    
    print("\n" + "="*60)
    print(f"✓ Chunks written to {chunks_jsonl_path}")
    print(f"✓ Chunk index written to {chunk_index_path}")


if __name__ == "__main__":
    main()
