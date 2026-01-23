// Build script for demo chatbot
// Scans demo corpus pages, chunks markdown files, creates dataset and self-contained HTML

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Configuration
const CHUNK_SIZE = 800;
const CHUNK_OVERLAP = 100;
const DEMO_CORPUS_PATH = path.join(__dirname, '../demo_corpus');
const DEMO_CORPUS_PAGES_PATH = path.join(DEMO_CORPUS_PATH, 'pages');

// Read stopwords
const stopwordsPath = path.join(__dirname, '../config/stopwords.txt');
const stopwords = new Set(
    fs.readFileSync(stopwordsPath, 'utf8')
        .split('\n')
        .map(line => line.trim().toLowerCase())
        .filter(line => line)
);

// Get file hash and stats
function getFileInfo(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const hash = crypto.createHash('sha256').update(content).digest('hex').substring(0, 16);
        const stats = fs.statSync(filePath);
        return {
            hash: hash,
            lastModified: stats.mtime.toISOString(),
            size: stats.size
        };
    } catch (error) {
        return null;
    }
}

// Extract title from markdown content
function extractTitle(content) {
    const lines = content.split('\n');
    for (const line of lines) {
        if (line.startsWith('# ')) {
            return line.substring(2).trim();
        }
    }
    return null;
}

// Extract headings from markdown content
function extractHeadings(content) {
    const headings = [];
    const lines = content.split('\n');
    for (const line of lines) {
        if (line.startsWith('#')) {
            const level = line.match(/^#+/)[0].length;
            const text = line.replace(/^#+\s*/, '').trim();
            if (text) {
                headings.push({ level, text });
            }
        }
    }
    return headings;
}

        // Extract tags/categories from file path (demo corpus pages)
        function extractTags(filePath) {
            const tags = [];
            const filename = path.basename(filePath, '.md');
            
            // Tag by page type
            if (filename === 'home') tags.push('home', 'overview');
            if (filename.includes('ai_basics')) tags.push('pillar', 'ai-basics');
            if (filename.includes('using_ai_school_work')) tags.push('pillar', 'school-work');
            if (filename.includes('how_businesses_use_ai')) tags.push('pillar', 'business');
            if (filename.includes('ai_tools')) tags.push('pillar', 'tools');
            if (filename.includes('rules_risks_ethics')) tags.push('pillar', 'ethics');
            if (filename.includes('foundational_sources')) tags.push('transparency', 'sources');
            if (filename.includes('process_and_provenance')) tags.push('transparency', 'process');
            
            return tags;
        }

// Chunk a text into ~700-900 character chunks
function chunkText(text, chunkSize = CHUNK_SIZE, overlap = CHUNK_OVERLAP) {
    const chunks = [];
    let start = 0;
    let chunkIndex = 0;
    
    while (start < text.length) {
        let end = start + chunkSize;
        let chunkText = text.substring(start, end);
        
        // Try to break at sentence boundary
        if (end < text.length) {
            const lastPeriod = chunkText.lastIndexOf('.');
            const lastNewline = chunkText.lastIndexOf('\n');
            const breakPoint = Math.max(lastPeriod, lastNewline);
            
            if (breakPoint > chunkSize * 0.7) {
                chunkText = chunkText.substring(0, breakPoint + 1);
                end = start + breakPoint + 1;
            }
        }
        
        if (chunkText.trim()) {
            chunks.push({
                text: chunkText.trim(),
                charStart: start,
                charEnd: end
            });
            chunkIndex++;
        }
        
        start = end - overlap;
    }
    
    return chunks;
}

// Scan demo corpus pages directory
function scanDemoCorpusPages() {
    const files = [];
    
    if (!fs.existsSync(DEMO_CORPUS_PAGES_PATH)) {
        console.error('\n✗ Error: demo_corpus/pages/ directory not found!');
        console.error('  Please run: node demo_chatbot_v0/scripts/build_demo_corpus.js');
        console.error('  This will generate the demo corpus pages from the Canonical Knowledge Pack.\n');
        process.exit(1);
    }
    
    const pageFiles = fs.readdirSync(DEMO_CORPUS_PAGES_PATH, { withFileTypes: true });
    pageFiles.forEach(file => {
        if (file.isFile() && file.name.endsWith('.md')) {
            // Return path relative to demo_chatbot_v0 directory
            files.push(`demo_corpus/pages/${file.name}`);
        }
    });
    
    return files.sort();
}

// Process all files
const repoRoot = path.join(__dirname, '../..');
const allFiles = scanDemoCorpusPages();
const allChunks = [];
const manifestEntries = [];

console.log(`Scanning ${allFiles.length} files from demo_corpus/pages...\n`);

allFiles.forEach(filepath => {
    // Path is relative to demo_chatbot_v0 directory
    const fullPath = path.join(__dirname, '..', filepath);
    
    try {
        if (!fs.existsSync(fullPath)) {
            console.warn(`File not found: ${filepath} (skipping)`);
            return;
        }

        const content = fs.readFileSync(fullPath, 'utf8');
        const fileInfo = getFileInfo(fullPath);
        const title = extractTitle(content);
        const headings = extractHeadings(content);
        const tags = extractTags(filepath);
        
        // Remove markdown headers and code blocks for chunking
        const lines = content.split('\n');
        const textLines = [];
        let inCodeBlock = false;
        
        for (const line of lines) {
            if (line.trim().startsWith('```')) {
                inCodeBlock = !inCodeBlock;
                continue;
            }
            if (inCodeBlock) continue;
            if (line.trim().startsWith('#')) continue;
            textLines.push(line);
        }
        
        const text = textLines.join('\n').trim();
        const chunks = chunkText(text);
        
        // Create chunks with metadata
        chunks.forEach((chunk, idx) => {
            const chunkId = `${filepath.replace(/[^a-zA-Z0-9]/g, '_')}_${idx}`;
            allChunks.push({
                id: chunkId,
                path: filepath,
                title: title || path.basename(filepath, '.md'),
                chunkIndex: idx,
                text: chunk.text,
                headings: headings.filter(h => {
                    // Include headings that appear before this chunk
                    const headingText = content.substring(0, chunk.charStart);
                    return headingText.includes(h.text);
                }),
                tags: tags
            });
        });
        
        // Add to manifest
        manifestEntries.push({
            path: filepath,
            title: title || path.basename(filepath, '.md'),
            hash: fileInfo ? fileInfo.hash : null,
            lastModified: fileInfo ? fileInfo.lastModified : null,
            size: fileInfo ? fileInfo.size : null,
            chunks: chunks.length,
            tags: tags
        });
        
        console.log(`✓ Processed ${filepath}: ${chunks.length} chunks`);
    } catch (error) {
        console.error(`✗ Error processing ${filepath}:`, error.message);
    }
});

// Create dataset
const dataset = {
    version: 'v0',
    lastUpdated: new Date().toISOString().split('T')[0],
    files: allFiles,
    chunks: allChunks,
    totalChunks: allChunks.length
};

// Create manifest
const manifest = {
    version: 'v0',
    generatedAt: new Date().toISOString(),
    files: manifestEntries,
    totalFiles: manifestEntries.length,
    totalChunks: allChunks.length
};

// Create manifest report
const manifestReport = {
    summary: {
        numberOfFiles: manifestEntries.length,
        numberOfChunks: allChunks.length,
        chunkSize: CHUNK_SIZE,
        chunkOverlap: CHUNK_OVERLAP,
        generatedAt: new Date().toISOString()
    },
    fileList: manifestEntries.map(entry => ({
        path: entry.path,
        title: entry.title,
        chunks: entry.chunks,
        tags: entry.tags
    }))
};

// Save files
const distDir = path.join(__dirname, '../dist');
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
}

// Save dataset
const datasetPath = path.join(distDir, 'dataset.json');
fs.writeFileSync(datasetPath, JSON.stringify(dataset, null, 2));
console.log(`\n✓ Created dataset with ${allChunks.length} chunks`);
console.log(`✓ Saved to ${datasetPath}`);

// Save manifest
const manifestPath = path.join(__dirname, '../config/training_manifest.json');
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
console.log(`✓ Generated training manifest: ${manifestPath}`);

// Save manifest report
const reportPath = path.join(distDir, 'manifest_report.json');
fs.writeFileSync(reportPath, JSON.stringify(manifestReport, null, 2));
console.log(`✓ Generated manifest report: ${reportPath}`);

// Read CSS and JS templates
const cssPath = path.join(__dirname, '../src/widget.css');
const jsPath = path.join(__dirname, '../src/widget.js');

let cssContent = '';
let jsContent = '';

try {
    cssContent = fs.readFileSync(cssPath, 'utf8');
} catch (error) {
    console.warn('CSS file not found, using inline styles');
    cssContent = `/* Student AI Hub — Site Guide Widget Styles */
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #F6F7F9; color: #1E3A5F; line-height: 1.6; }
.widget-container { max-width: 100%; height: 100%; display: flex; flex-direction: column; background-color: #F6F7F9; }
.widget-header { background-color: #1E3A5F; color: #fff; padding: 1rem 1.25rem; border-bottom: 2px solid #0F2440; }
.widget-header h1 { font-size: 1.25rem; font-weight: 600; margin-bottom: 0.25rem; }
.disclosure { font-size: 0.75rem; color: #E2E8F0; font-style: italic; }
.banner { background-color: #FFF3CD; border-left: 3px solid #FFC107; padding: 0.75rem 1rem; margin: 0.5rem 1.25rem; font-size: 0.85rem; color: #856404; }
.widget-content { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
.transcript-area { flex: 1; overflow-y: auto; padding: 1rem 1.25rem; background-color: #fff; border-bottom: 1px solid #E2E8F0; }
.message { margin-bottom: 1rem; }
.message-content { padding: 0.75rem 1rem; border-radius: 4px; max-width: 85%; }
.user-message .message-content { background-color: #E2E8F0; color: #1E3A5F; margin-left: auto; text-align: right; }
.bot-message .message-content { background-color: #F6F7F9; color: #1E3A5F; border: 1px solid #E2E8F0; }
.input-area { display: flex; padding: 1rem 1.25rem; background-color: #fff; border-top: 1px solid #E2E8F0; gap: 0.75rem; }
#user-input { flex: 1; padding: 0.75rem 1rem; border: 1px solid #E2E8F0; border-radius: 4px; font-size: 0.95rem; color: #1E3A5F; background-color: #F6F7F9; }
#user-input:focus { outline: none; border-color: #1E3A5F; background-color: #fff; }
#send-button { padding: 0.75rem 1.5rem; background-color: #1E3A5F; color: #fff; border: none; border-radius: 4px; font-size: 0.95rem; font-weight: 500; cursor: pointer; }
#send-button:hover { background-color: #0F2440; }
#send-button:disabled { background-color: #999; cursor: not-allowed; }
.info-section { border-top: 1px solid #E2E8F0; background-color: #fff; }
.info-toggle { width: 100%; padding: 0.75rem 1.25rem; background-color: #F6F7F9; border: none; text-align: left; font-size: 0.9rem; font-weight: 500; color: #1E3A5F; cursor: pointer; }
.info-toggle:hover { background-color: #E2E8F0; }
.info-content { display: none; padding: 1rem 1.25rem; background-color: #fff; font-size: 0.9rem; color: #1E3A5F; }
.info-content.active { display: block; }
.modal { display: none; position: fixed; z-index: 1000; left: 0; top: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.5); }
.modal.active { display: flex; align-items: center; justify-content: center; }
.modal-content { background-color: #fff; padding: 2rem; border-radius: 4px; max-width: 600px; max-height: 80vh; overflow-y: auto; position: relative; margin: 1rem; }
.modal-close { position: absolute; right: 1rem; top: 1rem; font-size: 1.5rem; font-weight: bold; color: #666; cursor: pointer; }
.materials-used { font-size: 0.85rem; color: #666; margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px solid #E2E8F0; }
.suggested-links { margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px solid #E2E8F0; }
.suggested-links a { color: #0066cc; text-decoration: none; }
`;
}

try {
    jsContent = fs.readFileSync(jsPath, 'utf8');
} catch (error) {
    console.warn('JS file not found, generating inline script');
    jsContent = '';
}

// Generate HTML with embedded dataset, CSS, and JS
const datasetJSON = JSON.stringify(dataset, null, 8);
const stopwordsArray = Array.from(stopwords);

// Replace dataset loading in JS
const embeddedJS = jsContent
    .replace(
        /function loadDataset\(\) \{[^}]*\}/s,
        `function loadDataset() {
        return ${datasetJSON};
    }`
    )
    .replace(
        /const stopwords = new Set\(\[[^\]]*\]\);/s,
        `const stopwords = new Set(${JSON.stringify(stopwordsArray)});`
    );

// Generate manifest list HTML (show page names, not full paths)
const manifestListHTML = manifestEntries.map(entry => {
    const pageName = path.basename(entry.path, '.md');
    const displayName = pageName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    return `<li><strong>${displayName}</strong> (${entry.chunks} chunks)<br><code>${pageName}.md</code></li>`;
}).join('\n                    ');

// Read template HTML
const templatePath = path.join(__dirname, '../src/hub-demo-chatbot.template.html');
let templateContent = '';
try {
    templateContent = fs.readFileSync(templatePath, 'utf8');
} catch (error) {
    console.error('Error reading template file:', error.message);
    process.exit(1);
}

// Replace template placeholders
const htmlContent = templateContent
    .replace('{{CSS_CONTENT}}', cssContent)
    .replace('{{EMBEDDED_JS}}', embeddedJS);

// Save HTML file
const htmlPath = path.join(distDir, 'hub-demo-chatbot.html');
fs.writeFileSync(htmlPath, htmlContent);
console.log(`✓ Generated self-contained HTML: ${htmlPath}`);

// Create index.html for Cloudflare Pages (copy of hub-demo-chatbot.html)
const indexPath = path.join(distDir, 'index.html');
fs.writeFileSync(indexPath, htmlContent);
console.log(`✓ Created index.html for Cloudflare Pages: ${indexPath}`);

console.log(`\n✓ Build complete!`);
