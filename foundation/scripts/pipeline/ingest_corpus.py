#!/usr/bin/env python3
"""
Ingest corpus from CSV file, fetch URLs, and extract content.
"""

import csv
import json
import hashlib
import time
import urllib.parse
import urllib.robotparser
from datetime import datetime
from pathlib import Path
import sys

try:
    import requests
    from bs4 import BeautifulSoup
    import trafilatura
    import pypdf
except ImportError as e:
    print(f"Missing required dependency: {e}")
    print("Install with: pip install requests beautifulsoup4 trafilatura pypdf")
    sys.exit(1)

try:
    import pdfplumber
    PDFPLUMBER_AVAILABLE = True
except ImportError:
    PDFPLUMBER_AVAILABLE = False

# Configuration
# Paths are relative to foundation/ directory
SCRIPT_DIR = Path(__file__).parent.parent.parent
if (SCRIPT_DIR / "foundation").exists():
    BASE_DIR = SCRIPT_DIR / "foundation"
else:
    BASE_DIR = SCRIPT_DIR

CSV_PATH = BASE_DIR / "data/registry/SAIH Content - Corpus v0.csv"
SNAPSHOTS_DIR = BASE_DIR / "data/snapshots/corpus_snapshots"
RUNS_DIR = BASE_DIR / "data/runs"
RATE_LIMIT_SECONDS = 1.25
USER_AGENT = "StudentAIHubCorpusBot/1.0"

# Create directories
SNAPSHOTS_DIR.mkdir(parents=True, exist_ok=True)
RUNS_DIR.mkdir(parents=True, exist_ok=True)


def get_robots_parser(url):
    """Get robots.txt parser for a domain."""
    parsed = urllib.parse.urlparse(url)
    robots_url = f"{parsed.scheme}://{parsed.netloc}/robots.txt"
    rp = urllib.robotparser.RobotFileParser()
    rp.set_url(robots_url)
    try:
        rp.read()
        return rp
    except Exception as e:
        # If robots.txt can't be fetched, assume allowed
        return None


def can_fetch_url(rp, url):
    """Check if URL can be fetched according to robots.txt."""
    if rp is None:
        return True, None
    if rp.can_fetch(USER_AGENT, url):
        return True, None
    return False, "Blocked by robots.txt"


def extract_html_text(html_content, url):
    """Extract text from HTML using trafilatura first, then BeautifulSoup."""
    # Try trafilatura first
    try:
        text = trafilatura.extract(html_content, url=url)
        if text and len(text.strip()) > 100:
            return text, "trafilatura"
    except Exception as e:
        pass
    
    # Fallback to BeautifulSoup
    try:
        soup = BeautifulSoup(html_content, 'html.parser')
        # Remove script and style elements
        for script in soup(["script", "style"]):
            script.decompose()
        text = soup.get_text(separator=' ', strip=True)
        return text, "beautifulsoup"
    except Exception as e:
        return None, f"beautifulsoup_error: {str(e)}"


def extract_html_headings(html_content):
    """Extract h1 and h2 headings from HTML."""
    try:
        soup = BeautifulSoup(html_content, 'html.parser')
        headings = []
        for tag in soup.find_all(['h1', 'h2']):
            headings.append({
                'level': tag.name,
                'text': tag.get_text(strip=True)
            })
        return headings
    except Exception:
        return []


def extract_pdf_text(pdf_content):
    """Extract text from PDF using pypdf first, then pdfplumber."""
    # Try pypdf first
    try:
        from io import BytesIO
        pdf_file = BytesIO(pdf_content)
        reader = pypdf.PdfReader(pdf_file)
        text_parts = []
        for page in reader.pages:
            text_parts.append(page.extract_text())
        text = '\n'.join(text_parts)
        if text and len(text.strip()) > 50:
            return text, "pypdf"
    except Exception as e:
        pass
    
    # Fallback to pdfplumber if available
    if PDFPLUMBER_AVAILABLE:
        try:
            from io import BytesIO
            pdf_file = BytesIO(pdf_content)
            with pdfplumber.open(pdf_file) as pdf:
                text_parts = []
                for page in pdf.pages:
                    text_parts.append(page.extract_text() or '')
                text = '\n'.join(text_parts)
                if text and len(text.strip()) > 50:
                    return text, "pdfplumber"
        except Exception as e:
            pass
    
    return None, "pdf_extraction_failed"


def get_excerpt(text, max_words=800):
    """Get first N words of text."""
    if not text:
        return ""
    words = text.split()[:max_words]
    return ' '.join(words)


def calculate_hash(text):
    """Calculate SHA256 hash of text."""
    if not text:
        return None
    return hashlib.sha256(text.encode('utf-8')).hexdigest()


def fetch_url(url, robots_parser):
    """Fetch URL and extract content."""
    snapshot = {
        'url': url,
        'final_url': url,
        'retrieved_at': None,
        'http_status': None,
        'title': None,
        'site_name': None,
        'content_type': None,
        'headings': [],
        'full_text': None,
        'excerpt': None,
        'word_count': 0,
        'content_hash': None,
        'scrape_status': 'error',
        'blocked_reason': None,
        'notes': {}
    }
    
    # Check robots.txt
    can_fetch, blocked_reason = can_fetch_url(robots_parser, url)
    if not can_fetch:
        snapshot['scrape_status'] = 'blocked'
        snapshot['blocked_reason'] = blocked_reason
        return snapshot
    
    # Fetch URL
    try:
        headers = {'User-Agent': USER_AGENT}
        response = requests.get(url, headers=headers, timeout=30, allow_redirects=True)
        snapshot['final_url'] = response.url
        snapshot['http_status'] = response.status_code
        snapshot['retrieved_at'] = datetime.utcnow().isoformat() + 'Z'
        snapshot['content_type'] = response.headers.get('Content-Type', '').split(';')[0]
        
        # Extract site name from URL
        parsed = urllib.parse.urlparse(response.url)
        snapshot['site_name'] = parsed.netloc
        
        if response.status_code != 200:
            snapshot['scrape_status'] = 'error'
            snapshot['blocked_reason'] = f"HTTP {response.status_code}"
            return snapshot
        
        # Check for paywall/blocked indicators
        content_lower = response.text[:5000].lower()
        blocked_indicators = ['paywall', 'subscription required', 'sign in', 'access denied', 
                             'blocked', 'forbidden', '403', '401']
        if any(indicator in content_lower for indicator in blocked_indicators):
            snapshot['scrape_status'] = 'blocked'
            snapshot['blocked_reason'] = "Possible paywall or access restriction detected"
            return snapshot
        
        # Extract content based on type
        if 'text/html' in snapshot['content_type']:
            # HTML extraction
            text, extraction_method = extract_html_text(response.text, response.url)
            headings = extract_html_headings(response.text)
            
            # Extract title
            try:
                soup = BeautifulSoup(response.text, 'html.parser')
                title_tag = soup.find('title')
                if title_tag:
                    snapshot['title'] = title_tag.get_text(strip=True)
            except:
                pass
            
            snapshot['headings'] = headings
            snapshot['full_text'] = text
            snapshot['excerpt'] = get_excerpt(text) if text else None
            snapshot['word_count'] = len(text.split()) if text else 0
            snapshot['content_hash'] = calculate_hash(text) if text else None
            
            if text and len(text.strip()) > 100:
                snapshot['scrape_status'] = 'success'
            elif text:
                snapshot['scrape_status'] = 'partial'
                snapshot['blocked_reason'] = f"Limited content extracted ({extraction_method})"
            else:
                snapshot['scrape_status'] = 'error'
                snapshot['blocked_reason'] = f"Failed to extract text ({extraction_method})"
        
        elif 'application/pdf' in snapshot['content_type']:
            # PDF extraction
            text, extraction_method = extract_pdf_text(response.content)
            snapshot['full_text'] = text
            snapshot['excerpt'] = get_excerpt(text) if text else None
            snapshot['word_count'] = len(text.split()) if text else 0
            snapshot['content_hash'] = calculate_hash(text) if text else None
            
            if text and len(text.strip()) > 100:
                snapshot['scrape_status'] = 'success'
            elif text:
                snapshot['scrape_status'] = 'partial'
                snapshot['blocked_reason'] = f"Limited content extracted ({extraction_method})"
            else:
                snapshot['scrape_status'] = 'error'
                snapshot['blocked_reason'] = f"Failed to extract text ({extraction_method})"
        
        else:
            snapshot['scrape_status'] = 'error'
            snapshot['blocked_reason'] = f"Unsupported content type: {snapshot['content_type']}"
    
    except requests.exceptions.RequestException as e:
        snapshot['scrape_status'] = 'error'
        snapshot['blocked_reason'] = f"Request failed: {str(e)}"
    except Exception as e:
        snapshot['scrape_status'] = 'error'
        snapshot['blocked_reason'] = f"Unexpected error: {str(e)}"
    
    return snapshot


def main():
    """Main ingestion function."""
    # Read CSV
    rows = []
    with open(CSV_PATH, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            rows.append(row)
    
    total = len(rows)
    print(f"Found {total} URLs to process\n")
    
    # Create run log
    run_timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    run_log_path = RUNS_DIR / f"run_{run_timestamp}.jsonl"
    
    # Track robots.txt parsers per domain
    robots_parsers = {}
    
    with open(run_log_path, 'w', encoding='utf-8') as run_log:
        for idx, row in enumerate(rows, 1):
            url = row['url']
            
            # Get robots parser for this domain
            parsed = urllib.parse.urlparse(url)
            domain = f"{parsed.scheme}://{parsed.netloc}"
            if domain not in robots_parsers:
                robots_parsers[domain] = get_robots_parser(url)
            
            # Fetch and extract
            snapshot = fetch_url(url, robots_parsers[domain])
            
            # Add CSV row data to notes
            snapshot['notes'] = {
                'section': row.get('section', ''),
                'source_type': row.get('source_type', ''),
                'relevance_note': row.get('relevance_note', ''),
                'date_added': row.get('date_added', ''),
                'url': row.get('url', '')
            }
            
            # Generate snapshot filename
            url_hash = hashlib.md5(url.encode()).hexdigest()[:12]
            snapshot_filename = f"{url_hash}_{run_timestamp}.json"
            snapshot_path = SNAPSHOTS_DIR / snapshot_filename
            
            # Save snapshot
            with open(snapshot_path, 'w', encoding='utf-8') as f:
                json.dump(snapshot, f, indent=2, ensure_ascii=False)
            
            # Write to run log
            log_entry = {
                'snapshot_id': snapshot_filename.replace('.json', ''),
                'url': snapshot['url'],
                'final_url': snapshot['final_url'],
                'retrieved_at': snapshot['retrieved_at'],
                'scrape_status': snapshot['scrape_status'],
                'http_status': snapshot['http_status'],
                'content_hash': snapshot['content_hash'],
                'snapshot_path': str(snapshot_path),
                'blocked_reason': snapshot['blocked_reason']
            }
            run_log.write(json.dumps(log_entry) + '\n')
            run_log.flush()
            
            # Console output
            status_emoji = {
                'success': '✓',
                'partial': '⚠',
                'blocked': '✗',
                'error': '✗'
            }.get(snapshot['scrape_status'], '?')
            
            status_text = snapshot['scrape_status'].upper()
            http_status = snapshot['http_status'] or '---'
            print(f"[{idx}/{total}] {status_emoji} {status_text} {http_status} {url}")
            
            if snapshot['blocked_reason']:
                print(f"      Reason: {snapshot['blocked_reason']}")
            
            # Rate limiting
            if idx < total:
                time.sleep(RATE_LIMIT_SECONDS)
    
    print(f"\n✓ Completed processing {total} URLs")
    print(f"  Snapshots: {SNAPSHOTS_DIR}")
    print(f"  Run log: {run_log_path}")


if __name__ == "__main__":
    main()
