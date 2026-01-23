#!/usr/bin/env python3
"""
Build a corpus index from snapshot files.
"""

import json
import glob
from datetime import datetime
from pathlib import Path


def get_snapshot_id(filename):
    """Extract snapshot ID from filename."""
    return Path(filename).stem


def build_corpus_index():
    """Build corpus index from snapshot files."""
    # Paths are relative to foundation/ directory
    SCRIPT_DIR = Path(__file__).parent.parent.parent
    if (SCRIPT_DIR / "foundation").exists():
        BASE_DIR = SCRIPT_DIR / "foundation"
    else:
        BASE_DIR = SCRIPT_DIR
    
    snapshots_dir = BASE_DIR / "data/snapshots/corpus_snapshots"
    index_path = BASE_DIR / "data/indexes/corpus_index.json"
    
    # Find all snapshot files
    snapshot_files = sorted(glob.glob(str(snapshots_dir / "*.json")))
    
    if not snapshot_files:
        print("No snapshot files found!")
        return
    
    print(f"Reading {len(snapshot_files)} snapshot files...")
    
    # Initialize counters
    status_counts = {
        'success': 0,
        'blocked': 0,
        'error': 0,
        'partial': 0
    }
    
    section_counts = {}
    source_type_counts = {}
    sources = []
    blocked_error_urls = []
    
    # Read all snapshots
    for snapshot_file in snapshot_files:
        with open(snapshot_file, 'r', encoding='utf-8') as f:
            snapshot = json.load(f)
        
        snapshot_id = get_snapshot_id(snapshot_file)
        scrape_status = snapshot.get('scrape_status', 'unknown')
        
        # Update status counts
        if scrape_status in status_counts:
            status_counts[scrape_status] += 1
        
        # Extract notes data
        notes = snapshot.get('notes', {})
        
        # Build source entry
        source = {
            'snapshot_id': snapshot_id,
            'url': snapshot.get('url', ''),
            'final_url': snapshot.get('final_url', ''),
            'retrieved_at': snapshot.get('retrieved_at'),
            'title': snapshot.get('title'),
            'site_name': snapshot.get('site_name'),
            'content_type': snapshot.get('content_type'),
            'section': notes.get('section', ''),
            'source_type': notes.get('source_type', ''),
            'relevance_note': notes.get('relevance_note', ''),
            'date_added': notes.get('date_added', ''),
            'scrape_status': scrape_status,
            'blocked_reason': snapshot.get('blocked_reason'),
            'http_status': snapshot.get('http_status'),
            'word_count': snapshot.get('word_count', 0),
            'content_hash': snapshot.get('content_hash'),
            'headings': snapshot.get('headings', []),
            'full_text_present': bool(snapshot.get('full_text'))
        }
        
        sources.append(source)
        
        # Update section counts
        section = source['section'] or 'Unknown'
        section_counts[section] = section_counts.get(section, 0) + 1
        
        # Update source_type counts
        source_type = source['source_type'] or 'Unknown'
        source_type_counts[source_type] = source_type_counts.get(source_type, 0) + 1
        
        # Track blocked/error URLs
        if scrape_status in ['blocked', 'error']:
            blocked_error_urls.append({
                'url': source['url'],
                'status': scrape_status,
                'reason': source['blocked_reason'] or f"HTTP {source['http_status']}"
            })
    
    # Sort sources by section, then title
    sources.sort(key=lambda x: (
        x['section'] or '',
        x['title'] or ''
    ))
    
    # Build index
    index = {
        'generated_at': datetime.utcnow().isoformat() + 'Z',
        'source_count': len(sources),
        'success_count': status_counts['success'],
        'blocked_count': status_counts['blocked'],
        'error_count': status_counts['error'],
        'partial_count': status_counts['partial'],
        'sources': sources
    }
    
    # Write index file
    with open(index_path, 'w', encoding='utf-8') as f:
        json.dump(index, f, indent=2, ensure_ascii=False)
    
    print(f"\n✓ Index written to {index_path}")
    
    # Print console summary
    print("\n" + "="*60)
    print("CORPUS INDEX SUMMARY")
    print("="*60)
    
    print(f"\nTotal Sources: {index['source_count']}")
    print(f"\nStatus Breakdown:")
    print(f"  Success: {status_counts['success']}")
    print(f"  Blocked: {status_counts['blocked']}")
    print(f"  Error: {status_counts['error']}")
    print(f"  Partial: {status_counts['partial']}")
    
    print(f"\nCounts by Section:")
    for section, count in sorted(section_counts.items()):
        print(f"  {section}: {count}")
    
    print(f"\nCounts by Source Type:")
    for source_type, count in sorted(source_type_counts.items()):
        print(f"  {source_type}: {count}")
    
    if blocked_error_urls:
        print(f"\nBlocked/Error URLs ({len(blocked_error_urls)}):")
        for item in blocked_error_urls:
            print(f"  [{item['status'].upper()}] {item['url']}")
            print(f"    Reason: {item['reason']}")
    
    print("\n" + "="*60)


if __name__ == "__main__":
    build_corpus_index()
