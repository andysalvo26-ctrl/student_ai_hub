#!/usr/bin/env python3
"""
Normalize snapshot IDs to stable identifiers based on URL hostname and hash.
"""

import json
import hashlib
import urllib.parse
import shutil
from pathlib import Path
import glob


def normalize_hostname(netloc):
    """Normalize hostname: lowercase and replace non-alphanumerics with underscore."""
    normalized = netloc.lower()
    # Replace non-alphanumeric characters with underscore
    normalized = ''.join(c if c.isalnum() or c == '.' else '_' for c in normalized)
    # Replace dots with underscores
    normalized = normalized.replace('.', '_')
    return normalized


def generate_stable_id(url):
    """Generate stable ID: hostname__sha256(url)[:16]."""
    parsed = urllib.parse.urlparse(url)
    hostname = normalize_hostname(parsed.netloc)
    
    # Calculate SHA256 hash of URL
    url_hash = hashlib.sha256(url.encode('utf-8')).hexdigest()[:16]
    
    stable_id = f"{hostname}__{url_hash}"
    return stable_id


def main():
    """Main normalization function."""
    index_path = Path("data/corpus_index.json")
    stable_index_path = Path("data/corpus_index_stable.json")
    snapshots_dir = Path("data/corpus_snapshots")
    stable_snapshots_dir = Path("data/corpus_snapshots_stable")
    
    # Read original index
    print(f"Reading {index_path}...")
    with open(index_path, 'r', encoding='utf-8') as f:
        index = json.load(f)
    
    # Create stable snapshots directory if needed
    stable_snapshots_created = False
    snapshot_mapping = {}
    
    # Check if we need to create stable snapshots
    if snapshots_dir.exists():
        # Build mapping from run_snapshot_id to snapshot files
        snapshot_files = glob.glob(str(snapshots_dir / "*.json"))
        for snapshot_file in snapshot_files:
            snapshot_id = Path(snapshot_file).stem
            snapshot_mapping[snapshot_id] = Path(snapshot_file)
    
    # Process each source
    missing_originals = []
    mismatches = []
    stable_snapshots_count = 0
    
    print(f"Processing {len(index['sources'])} sources...")
    
    for source in index['sources']:
        url = source.get('url', '')
        run_snapshot_id = source.get('snapshot_id', '')
        
        # Generate stable ID
        stable_id = generate_stable_id(url)
        source['stable_id'] = stable_id
        source['run_snapshot_id'] = run_snapshot_id
        
        # Track original snapshot path
        original_snapshot_path = None
        if run_snapshot_id and run_snapshot_id in snapshot_mapping:
            original_snapshot_path = str(snapshot_mapping[run_snapshot_id])
            source['snapshot_path_original'] = original_snapshot_path
        else:
            if run_snapshot_id:
                missing_originals.append({
                    'url': url,
                    'run_snapshot_id': run_snapshot_id,
                    'stable_id': stable_id
                })
            source['snapshot_path_original'] = None
        
        # Copy to stable directory if original exists
        if original_snapshot_path:
            stable_snapshots_dir.mkdir(parents=True, exist_ok=True)
            stable_snapshots_created = True
            
            stable_snapshot_path = stable_snapshots_dir / f"{stable_id}.json"
            
            # Check if file already exists with different content (mismatch)
            if stable_snapshot_path.exists():
                # Compare content hashes if available
                try:
                    with open(stable_snapshot_path, 'r') as f:
                        existing = json.load(f)
                    existing_url = existing.get('url', '')
                    if existing_url != url:
                        mismatches.append({
                            'stable_id': stable_id,
                            'existing_url': existing_url,
                            'new_url': url
                        })
                except:
                    pass
            
            # Copy file
            if not stable_snapshot_path.exists():
                shutil.copy2(original_snapshot_path, stable_snapshot_path)
                stable_snapshots_count += 1
            
            source['snapshot_path_stable'] = str(stable_snapshot_path)
        else:
            source['snapshot_path_stable'] = None
    
    # Write stable index
    print(f"\nWriting {stable_index_path}...")
    with open(stable_index_path, 'w', encoding='utf-8') as f:
        json.dump(index, f, indent=2, ensure_ascii=False)
    
    # Print summary
    print("\n" + "="*60)
    print("NORMALIZATION SUMMARY")
    print("="*60)
    
    print(f"\nTotal sources processed: {len(index['sources'])}")
    
    if stable_snapshots_created:
        print(f"\nStable snapshots created: {stable_snapshots_count}")
        print(f"  Location: {stable_snapshots_dir}")
    else:
        print("\nNo stable snapshots directory created (no originals found)")
    
    if missing_originals:
        print(f"\nMissing originals: {len(missing_originals)}")
        for item in missing_originals[:5]:  # Show first 5
            print(f"  - {item['url']}")
            print(f"    Run snapshot ID: {item['run_snapshot_id']}")
            print(f"    Stable ID: {item['stable_id']}")
        if len(missing_originals) > 5:
            print(f"  ... and {len(missing_originals) - 5} more")
    else:
        print("\nMissing originals: 0")
    
    if mismatches:
        print(f"\nMismatches (same stable_id, different URLs): {len(mismatches)}")
        for item in mismatches:
            print(f"  - Stable ID: {item['stable_id']}")
            print(f"    Existing URL: {item['existing_url']}")
            print(f"    New URL: {item['new_url']}")
    else:
        print("\nMismatches: 0")
    
    print("\n" + "="*60)
    print(f"✓ Stable index written to {stable_index_path}")


if __name__ == "__main__":
    main()
