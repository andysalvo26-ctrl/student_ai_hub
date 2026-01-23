// Build demo corpus from Canonical Knowledge Pack
// Transforms canonical pack content into student-facing page-like content

const fs = require('fs');
const path = require('path');

// Configuration
const repoRoot = path.join(__dirname, '../..');
const canonicalPackPath = path.join(repoRoot, 'canonical_pack');
const demoCorpusPath = path.join(__dirname, '../demo_corpus');
const pagesPath = path.join(demoCorpusPath, 'pages');
const metaPath = path.join(demoCorpusPath, 'meta');

// Ensure directories exist
if (!fs.existsSync(demoCorpusPath)) {
    fs.mkdirSync(demoCorpusPath, { recursive: true });
}
if (!fs.existsSync(pagesPath)) {
    fs.mkdirSync(pagesPath, { recursive: true });
}
if (!fs.existsSync(metaPath)) {
    fs.mkdirSync(metaPath, { recursive: true });
}

// Read a canonical pack file
function readCanonicalFile(filePath) {
    const fullPath = path.join(canonicalPackPath, filePath);
    try {
        return fs.readFileSync(fullPath, 'utf8');
    } catch (error) {
        console.warn(`Warning: Could not read ${filePath}: ${error.message}`);
        return null;
    }
}

// Extract main content from markdown (remove frontmatter, headers)
function extractContent(markdown) {
    if (!markdown) return '';
    
    const lines = markdown.split('\n');
    let content = [];
    let inFrontmatter = false;
    let frontmatterEnded = false;
    
    for (const line of lines) {
        // Skip frontmatter
        if (line.trim() === '---') {
            if (!inFrontmatter) {
                inFrontmatter = true;
                continue;
            } else {
                inFrontmatter = false;
                frontmatterEnded = true;
                continue;
            }
        }
        if (inFrontmatter) continue;
        
        // Skip top-level title (first # line)
        if (!frontmatterEnded && line.trim().startsWith('# ')) {
            frontmatterEnded = true;
            continue;
        }
        
        content.push(line);
    }
    
    return content.join('\n').trim();
}

// Build home page
function buildHomePage() {
    const scopeContent = readCanonicalFile('00_orientation_and_boundaries/SCOPE.md');
    const readmeContent = readCanonicalFile('00_orientation_and_boundaries/README.md');
    
    const content = `# Student AI Hub

## What this is

The Student AI Hub provides reference materials about artificial intelligence designed for students. It includes organized sections covering core concepts, practical applications, and important considerations.

## How to use the hub

The hub is organized into several main sections:

- **AI Basics** — Core concepts and definitions explaining how AI and machine learning work
- **Using AI for School and Work** — Practical guidance for students using AI in coursework and productivity
- **How Businesses Are Using AI** — High-level explanation of current business applications of AI
- **AI Tools You Might Use** — Categories of AI tools students may encounter
- **Rules, Risks, and Ethics of AI** — Ethical, legal, and governance considerations surrounding AI

You can read these sections in any order or consult them as needed. Each section provides clear, organized reference material.

## Foundational Sources

The hub includes information about the sources used to build these reference materials. See the Foundational Sources section for details.

## Process and Provenance

Information about how the hub was built and what processes were used is available in the Process and Provenance section.

---

**Preview note:** This is demo content derived from the hub materials. The full version may include additional content.

**Derived from:**
- canonical_pack/00_orientation_and_boundaries/SCOPE.md
- canonical_pack/00_orientation_and_boundaries/README.md`;

    return {
        filename: 'home.md',
        title: 'Student AI Hub',
        content: content,
        sources: [
            'canonical_pack/00_orientation_and_boundaries/SCOPE.md',
            'canonical_pack/00_orientation_and_boundaries/README.md'
        ]
    };
}

// Build pillar page
function buildPillarPage(pillarName, pillarFile) {
    const content = readCanonicalFile(`01_core_pillars/${pillarFile}`);
    if (!content) return null;
    
    const extracted = extractContent(content);
    
    // Map pillar files to page names
    const pageMap = {
        'PILLAR_AI_BASICS.md': {
            filename: 'ai_basics.md',
            title: 'AI Basics'
        },
        'PILLAR_USING_AI_FOR_SCHOOL_AND_WORK.md': {
            filename: 'using_ai_school_work.md',
            title: 'Using AI for School and Work'
        },
        'PILLAR_HOW_BUSINESSES_USE_AI.md': {
            filename: 'how_businesses_use_ai.md',
            title: 'How Businesses Are Using AI'
        },
        'PILLAR_AI_TOOLS_YOU_MIGHT_USE.md': {
            filename: 'ai_tools_you_might_use.md',
            title: 'AI Tools You Might Use'
        },
        'PILLAR_RULES_RISKS_AND_ETHICS.md': {
            filename: 'rules_risks_ethics.md',
            title: 'Rules, Risks, and Ethics of AI'
        }
    };
    
    const pageInfo = pageMap[pillarFile];
    if (!pageInfo) return null;
    
    // Remove the first heading if it matches the title
    let cleanedContent = extracted;
    const firstHeading = cleanedContent.split('\n')[0];
    if (firstHeading.trim().startsWith('#') && firstHeading.toLowerCase().includes(pageInfo.title.toLowerCase())) {
        cleanedContent = cleanedContent.split('\n').slice(1).join('\n').trim();
    }
    
    const pageContent = `# ${pageInfo.title}

${cleanedContent}

---

**Preview note:** This is demo content derived from the hub materials. The full version may include additional content.

**Derived from:**
- canonical_pack/01_core_pillars/${pillarFile}`;

    return {
        filename: pageInfo.filename,
        title: pageInfo.title,
        content: pageContent,
        sources: [`canonical_pack/01_core_pillars/${pillarFile}`]
    };
}

// Build foundational sources page
function buildFoundationalSourcesPage() {
    const provenanceContent = readCanonicalFile('00_orientation_and_boundaries/PROVENANCE.md');
    const authorityContent = readCanonicalFile('00_orientation_and_boundaries/AUTHORITY_BOUNDARIES.md');
    
    const content = `# Foundational Sources

The Student AI Hub reference materials are built from a curated set of approved sources. These sources were selected for credibility, relevance, and appropriateness for students.

## Source selection

Sources used in the hub were reviewed and approved before being included. Each source was classified by topic and source type to ensure appropriate use.

## Source registry

The hub maintains a registry of sources that were used to build the reference sections. This registry documents which sources were selected, which were successfully processed, and which were actually used in the published materials.

## Source lifecycle

Sources go through several stages:
- **Collected**: Sources selected and approved for use
- **Ingested**: Sources successfully processed and added to the corpus
- **Used**: Sources whose content was referenced in published reference sections

Not all collected sources are used in final sections. This is documented in the source registry.

---

**Preview note:** This is demo content derived from the hub materials. The full version may include additional content.

**Derived from:**
- canonical_pack/00_orientation_and_boundaries/PROVENANCE.md
- canonical_pack/00_orientation_and_boundaries/AUTHORITY_BOUNDARIES.md`;

    return {
        filename: 'foundational_sources.md',
        title: 'Foundational Sources',
        content: content,
        sources: [
            'canonical_pack/00_orientation_and_boundaries/PROVENANCE.md',
            'canonical_pack/00_orientation_and_boundaries/AUTHORITY_BOUNDARIES.md'
        ]
    };
}

    // Build glossary page
    function buildGlossaryPage() {
        const glossaryContent = readCanonicalFile('02_cross_cutting_modules/GLOSSARY.md');
        const extracted = extractContent(glossaryContent);
        
        const content = `# Glossary

${extracted}

---

**Preview note:** This is demo content derived from the hub materials. The full version may include additional content.

**Derived from:**
- canonical_pack/02_cross_cutting_modules/GLOSSARY.md`;

        return {
            filename: 'glossary.md',
            title: 'Glossary',
            content: content,
            sources: ['canonical_pack/02_cross_cutting_modules/GLOSSARY.md']
        };
    }

    // Build FAQ students page
    function buildFAQStudentsPage() {
        const faqContent = readCanonicalFile('02_cross_cutting_modules/FAQ_STUDENTS.md');
        const extracted = extractContent(faqContent);
        
        const content = `# FAQ for Students

${extracted}

---

**Preview note:** This is demo content derived from the hub materials. The full version may include additional content.

**Derived from:**
- canonical_pack/02_cross_cutting_modules/FAQ_STUDENTS.md`;

        return {
            filename: 'faq_students.md',
            title: 'FAQ for Students',
            content: content,
            sources: ['canonical_pack/02_cross_cutting_modules/FAQ_STUDENTS.md']
        };
    }

    // Build AI at Penn State page (human-authored placeholder)
    function buildAIAtPennStatePage() {
        const content = `# AI at Penn State

This section provides information about AI resources and opportunities at Penn State.

**Preview note:** This page is human-authored and maintained separately from the foundation reference sections. Content for this page is created and updated by humans, not derived from the canonical pack.

**Status:** This is a placeholder page. Content will be created and maintained by humans.

---

**Derived from:**
- Placeholder for human-authored content`;

        return {
            filename: 'ai_at_penn_state.md',
            title: 'AI at Penn State',
            content: content,
            sources: []
        };
    }

    // Build AI by Smeal Major page (human-authored placeholder)
    function buildAIBySmealMajorPage() {
        const content = `# AI by Smeal Major

This section provides information about how AI relates to different Smeal College of Business majors.

**Preview note:** This page is human-authored and maintained separately from the foundation reference sections. Content for this page is created and updated by humans, not derived from the canonical pack.

**Status:** This is a placeholder page. Content will be created and maintained by humans.

---

**Derived from:**
- Placeholder for human-authored content`;

        return {
            filename: 'ai_by_smeal_major.md',
            title: 'AI by Smeal Major',
            content: content,
            sources: []
        };
    }

    // Build AI News That Matters page (human-authored placeholder)
    function buildAINewsThatMattersPage() {
        const content = `# AI News That Matters

This section provides curated news and updates about artificial intelligence that are relevant to students.

**Preview note:** This page is human-authored and maintained separately from the foundation reference sections. Content for this page is created and updated by humans, not derived from the canonical pack.

**Status:** This is a placeholder page. Content will be created and maintained by humans.

---

**Derived from:**
- Placeholder for human-authored content`;

        return {
            filename: 'ai_news_that_matters.md',
            title: 'AI News That Matters',
            content: content,
            sources: []
        };
    }

    // Build process and provenance page
    function buildProcessAndProvenancePage() {
    const provenanceContent = readCanonicalFile('00_orientation_and_boundaries/PROVENANCE.md');
    const citationContent = readCanonicalFile('00_orientation_and_boundaries/CITATION_AND_REFERENCE_RULES.md');
    
    const content = `# Process and Provenance

## How the hub was built

The Student AI Hub was built through a documented process that ensures reference materials are grounded in approved sources. This process includes source selection, content organization, and review.

## Build steps

1. **Source selection**: Sources were selected and approved for use
2. **Content collection**: Content was gathered from approved sources
3. **Content organization**: Content was organized into clear sections
4. **Content drafting**: Reference sections were drafted from organized content
5. **Review and revision**: Drafts were reviewed and revised as needed
6. **Finalization**: Sections were finalized and marked as complete

## Citation and reference rules

The hub follows specific rules for citing sources and referencing materials. All content is traceable to its source, and citations are included where appropriate.

## Documentation

The build process is documented in detail. This documentation explains how sources were selected, how content was organized, and how reference sections were created and reviewed.

---

**Preview note:** This is demo content derived from the hub materials. The full version may include additional content.

**Derived from:**
- canonical_pack/00_orientation_and_boundaries/PROVENANCE.md
- canonical_pack/00_orientation_and_boundaries/CITATION_AND_REFERENCE_RULES.md`;

    return {
        filename: 'process_and_provenance.md',
        title: 'Process and Provenance',
        content: content,
        sources: [
            'canonical_pack/00_orientation_and_boundaries/PROVENANCE.md',
            'canonical_pack/00_orientation_and_boundaries/CITATION_AND_REFERENCE_RULES.md'
        ]
    };
}

// Build all pages
function buildAllPages() {
    const pages = [];
    
    // Check if canonical pack exists
    if (!fs.existsSync(canonicalPackPath)) {
        console.error(`Error: canonical_pack directory not found at ${canonicalPackPath}`);
        process.exit(1);
    }
    
    console.log('Building demo corpus pages...\n');
    
    // Build home page
    const homePage = buildHomePage();
    pages.push(homePage);
    console.log(`✓ Created ${homePage.filename}`);
    
    // Build pillar pages
    const pillarFiles = [
        'PILLAR_AI_BASICS.md',
        'PILLAR_USING_AI_FOR_SCHOOL_AND_WORK.md',
        'PILLAR_HOW_BUSINESSES_USE_AI.md',
        'PILLAR_AI_TOOLS_YOU_MIGHT_USE.md',
        'PILLAR_RULES_RISKS_AND_ETHICS.md'
    ];
    
    pillarFiles.forEach(pillarFile => {
        const page = buildPillarPage(null, pillarFile);
        if (page) {
            pages.push(page);
            console.log(`✓ Created ${page.filename}`);
        }
    });
    
    // Build foundational sources page
    const foundationalSourcesPage = buildFoundationalSourcesPage();
    pages.push(foundationalSourcesPage);
    console.log(`✓ Created ${foundationalSourcesPage.filename}`);
    
    // Build process and provenance page
    const processPage = buildProcessAndProvenancePage();
    pages.push(processPage);
    console.log(`✓ Created ${processPage.filename}`);
    
    // Build glossary page
    const glossaryPage = buildGlossaryPage();
    pages.push(glossaryPage);
    console.log(`✓ Created ${glossaryPage.filename}`);
    
    // Build FAQ students page
    const faqPage = buildFAQStudentsPage();
    pages.push(faqPage);
    console.log(`✓ Created ${faqPage.filename}`);
    
    // Build human-authored placeholder pages
    const aiAtPennStatePage = buildAIAtPennStatePage();
    pages.push(aiAtPennStatePage);
    console.log(`✓ Created ${aiAtPennStatePage.filename} (placeholder)`);
    
    const aiBySmealMajorPage = buildAIBySmealMajorPage();
    pages.push(aiBySmealMajorPage);
    console.log(`✓ Created ${aiBySmealMajorPage.filename} (placeholder)`);
    
    const aiNewsPage = buildAINewsThatMattersPage();
    pages.push(aiNewsPage);
    console.log(`✓ Created ${aiNewsPage.filename} (placeholder)`);
    
    return pages;
}

// Write pages to disk
function writePages(pages) {
    pages.forEach(page => {
        const filePath = path.join(pagesPath, page.filename);
        fs.writeFileSync(filePath, page.content, 'utf8');
    });
}

// Create manifest
function createManifest(pages) {
    const manifest = {
        version: 'v0',
        generatedAt: new Date().toISOString(),
        pages: pages.map(page => ({
            filename: page.filename,
            title: page.title,
            sources: page.sources
        })),
        totalPages: pages.length
    };
    
    const manifestPath = path.join(metaPath, 'manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    console.log(`\n✓ Created manifest: ${manifestPath}`);
    
    return manifest;
}

// Create README
function createREADME(manifest) {
    const readmeContent = `# Demo Corpus

This directory contains student-facing page-like content derived from the Canonical Knowledge Pack.

## Structure

- \`pages/\` — Page-like markdown files for the demo chatbot
- \`meta/\` — Metadata and manifest files

## Pages

${manifest.pages.map(p => `- **${p.title}** (\`${p.filename}\`) — Derived from ${p.sources.length} canonical file(s)`).join('\n')}

## Usage

These pages are used by the demo chatbot for retrieval. They are generated from canonical pack content and restructured to be student-facing.

## Regeneration

To regenerate these pages, run:
\`\`\`
node demo_chatbot_v0/scripts/build_demo_corpus.js
\`\`\`

## Preview Note

All pages include a preview note indicating they are demo content derived from hub materials. The full version may include additional content.
`;

    const readmePath = path.join(metaPath, 'README.md');
    fs.writeFileSync(readmePath, readmeContent, 'utf8');
    console.log(`✓ Created README: ${readmePath}`);
}

// Main execution
function main() {
    console.log('Building demo corpus from Canonical Knowledge Pack...\n');
    
    const pages = buildAllPages();
    writePages(pages);
    const manifest = createManifest(pages);
    createREADME(manifest);
    
    console.log(`\n✓ Demo corpus build complete!`);
    console.log(`  Created ${pages.length} pages in ${pagesPath}`);
    console.log(`  Manifest saved to ${path.join(metaPath, 'manifest.json')}`);
}

main();
