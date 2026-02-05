#!/usr/bin/env python3
"""
Playwright-based crawler for Student AI Hub Wix site.
Extracts readable text from each page and saves as markdown.
"""

import json
import os
import re
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlparse

from playwright.sync_api import sync_playwright


def url_to_slug(url: str) -> str:
    """Convert URL to a filesystem-safe slug."""
    parsed = urlparse(url)
    path = parsed.path.strip("/")
    if not path:
        return "home"
    # Replace slashes and special chars with dashes
    slug = re.sub(r"[^a-zA-Z0-9]+", "-", path)
    return slug.strip("-").lower()


def extract_main_content(page) -> str:
    """
    Extract main readable text from the page.
    Uses simple heuristics to skip nav/footer elements.
    """
    # Give Wix some time to render dynamic content
    import time
    time.sleep(2)
    
    # Try to find main content areas (Wix uses various containers)
    # We'll extract text and filter out common nav/footer patterns
    
    # Get all text content
    body = page.locator("body")
    
    # Try to get text from main content areas first
    content_selectors = [
        "[data-mesh-id*='comp']",
        "main",
        "[role='main']",
        ".page-content",
        "#content",
    ]
    
    text_parts = []
    
    # Extract from body, then clean up
    try:
        all_text = body.inner_text(timeout=10000)
    except Exception:
        all_text = ""
    
    if all_text:
        lines = all_text.split("\n")
        cleaned_lines = []
        
        # Patterns to skip (nav, footer, social, etc.)
        skip_patterns = [
            r"^(Home|Learn|About|Contact|Menu|Search)$",
            r"^(Facebook|Twitter|Instagram|LinkedIn|YouTube)$",
            r"^(©|Copyright)",
            r"^(Privacy Policy|Terms|Cookie)",
            r"^(Log In|Sign Up|Subscribe)$",
            r"^\s*$",
        ]
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            # Skip very short lines that look like nav items
            if len(line) < 3:
                continue
                
            # Skip lines matching skip patterns
            skip = False
            for pattern in skip_patterns:
                if re.match(pattern, line, re.IGNORECASE):
                    skip = True
                    break
            
            if not skip:
                cleaned_lines.append(line)
        
        # Join with double newlines to preserve paragraph structure
        text_parts = cleaned_lines
    
    # Remove duplicates while preserving order
    seen = set()
    unique_lines = []
    for line in text_parts:
        if line not in seen:
            seen.add(line)
            unique_lines.append(line)
    
    return "\n\n".join(unique_lines)


def crawl_urls(input_file: str, output_dir: str):
    """Crawl all URLs from input file and save outputs."""
    
    # Read URLs
    with open(input_file, "r") as f:
        urls = [line.strip() for line in f if line.strip()]
    
    # Setup output directories
    output_path = Path(output_dir)
    pages_dir = output_path / "pages"
    pages_dir.mkdir(parents=True, exist_ok=True)
    
    manifest = []
    all_content = []
    
    print(f"Starting crawl of {len(urls)} URLs...")
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 1280, "height": 800},
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
        )
        page = context.new_page()
        
        for url in urls:
            slug = url_to_slug(url)
            print(f"  Crawling: {slug} ({url})")
            
            try:
                page.goto(url, wait_until="load", timeout=60000)
                content = extract_main_content(page)
                
                # Save individual page
                page_file = pages_dir / f"{slug}.md"
                with open(page_file, "w") as f:
                    f.write(f"# {slug.replace('-', ' ').title()}\n\n")
                    f.write(f"**Source:** {url}\n\n")
                    f.write("---\n\n")
                    f.write(content)
                
                # Track for manifest and corpus
                char_count = len(content)
                timestamp = datetime.now(timezone.utc).isoformat()
                
                manifest.append({
                    "url": url,
                    "slug": slug,
                    "char_count": char_count,
                    "timestamp": timestamp,
                    "file": f"pages/{slug}.md"
                })
                
                all_content.append(f"# {slug.replace('-', ' ').title()}\n\n**Source:** {url}\n\n---\n\n{content}")
                
                print(f"    ✓ Saved ({char_count} chars)")
                
            except Exception as e:
                print(f"    ✗ Error: {e}")
                manifest.append({
                    "url": url,
                    "slug": slug,
                    "char_count": 0,
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    "error": str(e)
                })
        
        browser.close()
    
    # Save manifest
    manifest_file = output_path / "manifest.json"
    with open(manifest_file, "w") as f:
        json.dump(manifest, f, indent=2)
    print(f"\nManifest saved to {manifest_file}")
    
    # Save corpus (all pages concatenated)
    corpus_file = output_path / "corpus.md"
    with open(corpus_file, "w") as f:
        f.write("# Student AI Hub - Crawled Corpus\n\n")
        f.write(f"Crawled on: {datetime.now(timezone.utc).isoformat()}\n\n")
        f.write("---\n\n")
        f.write("\n\n---\n\n".join(all_content))
    print(f"Corpus saved to {corpus_file}")
    
    print(f"\nCrawl complete. {len([m for m in manifest if 'error' not in m])} pages saved.")


if __name__ == "__main__":
    script_dir = Path(__file__).parent
    input_file = script_dir / "INPUT_URLS.txt"
    output_dir = script_dir / "outputs"
    
    crawl_urls(str(input_file), str(output_dir))
