const fs = require('fs').promises;
const path = require('path');

async function createMajorFiles() {
  const fetchedContent = JSON.parse(
    await fs.readFile(path.join(__dirname, 'fetched_content.json'), 'utf8')
  );

  for (const [majorName, data] of Object.entries(fetchedContent)) {
    if (data.error) {
      console.error(`Skipping ${majorName}: ${data.error}`);
      continue;
    }

    const html = data.html || '';
    const text = data.text || '';
    
    // Extract structured content from HTML
    const content = extractStructuredContent(html, text, majorName);
    
    // Create filename: MAJOR_accounting.md, etc.
    const filename = `MAJOR_${majorName.replace(/-/g, '_').toUpperCase()}.md`;
    const filepath = path.join(__dirname, filename);
    
    // Format the markdown content
    const markdown = formatMajorMarkdown(content, data.url);
    
    await fs.writeFile(filepath, markdown, 'utf8');
    console.log(`✓ Created ${filename}`);
  }
}

function extractStructuredContent(html, text, majorName) {
  // Try to extract main content sections from HTML
  let overview = '';
  let focusAreas = [];
  let contexts = [];
  let emphasis = '';
  
  // Extract overview - look for first substantial paragraph
  const overviewMatch = html.match(/<p[^>]*>([^<]{100,500})<\/p>/i) ||
                         html.match(/<div[^>]*class="[^"]*intro[^"]*"[^>]*>([\s\S]{100,500})<\/div>/i);
  if (overviewMatch) {
    overview = cleanHtml(overviewMatch[1]);
  } else {
    // Fallback: use first substantial text block
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 50);
    if (sentences.length > 0) {
      overview = sentences.slice(0, 3).join('. ').trim() + '.';
    }
  }
  
  // Extract bullet points or list items
  const listMatches = html.matchAll(/<li[^>]*>([^<]{20,200})<\/li>/gi);
  const bullets = [];
  for (const match of listMatches) {
    const cleaned = cleanHtml(match[1]);
    if (cleaned.length > 20 && cleaned.length < 300) {
      bullets.push(cleaned);
    }
  }
  
  // Extract focus areas - look for headings followed by lists
  const headingMatches = html.matchAll(/<h[23][^>]*>([^<]+)<\/h[23]>/gi);
  const headings = [];
  for (const match of headingMatches) {
    headings.push(cleanHtml(match[1]));
  }
  
  // Try to identify focus areas from headings or bullet points
  focusAreas = bullets.slice(0, 8).filter(b => 
    !b.toLowerCase().includes('career') &&
    !b.toLowerCase().includes('job') &&
    !b.toLowerCase().includes('opportunity') &&
    !b.toLowerCase().includes('apply')
  );
  
  // Extract contexts - look for domain-related terms
  const contextKeywords = ['business', 'organization', 'industry', 'sector', 'market', 'system', 'process'];
  contexts = bullets.filter(b => 
    contextKeywords.some(kw => b.toLowerCase().includes(kw))
  ).slice(0, 6);
  
  // Extract emphasis - look for statements about priorities or focus
  const emphasisPatterns = [
    /emphasizes? ([^.!?]{20,150})/gi,
    /focuses? on ([^.!?]{20,150})/gi,
    /prioritizes? ([^.!?]{20,150})/gi,
  ];
  
  for (const pattern of emphasisPatterns) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      if (match[1] && match[1].length > 20) {
        emphasis = match[1].trim();
        break;
      }
    }
    if (emphasis) break;
  }
  
  // If no emphasis found, use a general statement from overview
  if (!emphasis && overview) {
    const sentences = overview.split(/[.!?]+/).filter(s => s.trim().length > 30);
    if (sentences.length > 1) {
      emphasis = sentences[1].trim();
    }
  }
  
  return {
    overview: overview || text.substring(0, 300).trim(),
    focusAreas: focusAreas.length > 0 ? focusAreas : extractFocusAreasFromText(text),
    contexts: contexts.length > 0 ? contexts : extractContextsFromText(text),
    emphasis: emphasis || extractEmphasisFromText(text),
  };
}

function extractFocusAreasFromText(text) {
  // Look for patterns like "X, Y, and Z" or bullet-like structures
  const areas = [];
  const patterns = [
    /(?:focus|study|examine|explore|cover)[^.!?]{0,100}?([A-Z][a-z]+(?:, [A-Z][a-z]+){2,})/gi,
    /(?:including|such as|like)[^.!?]{0,100}?([A-Z][a-z]+(?:, [A-Z][a-z]+){2,})/gi,
  ];
  
  for (const pattern of patterns) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      const items = match[1].split(',').map(s => s.trim());
      areas.push(...items.slice(0, 6));
      if (areas.length >= 6) break;
    }
    if (areas.length >= 6) break;
  }
  
  return areas.slice(0, 6);
}

function extractContextsFromText(text) {
  const contexts = [];
  const contextPatterns = [
    /(?:in|within|across) ([^.!?]{10,80}?)(?:\.|,|$)/gi,
    /(?:business|organization|industry|sector|market|system|process)[^.!?]{0,80}?/gi,
  ];
  
  const sentences = text.split(/[.!?]+/);
  for (const sentence of sentences) {
    if (sentence.toLowerCase().includes('business') ||
        sentence.toLowerCase().includes('organization') ||
        sentence.toLowerCase().includes('industry') ||
        sentence.toLowerCase().includes('market')) {
      const cleaned = sentence.trim().substring(0, 150);
      if (cleaned.length > 30) {
        contexts.push(cleaned);
      }
    }
  }
  
  return contexts.slice(0, 6);
}

function extractEmphasisFromText(text) {
  const emphasisKeywords = ['emphasizes', 'focuses', 'prioritizes', 'centers on', 'revolves around'];
  const sentences = text.split(/[.!?]+/);
  
  for (const sentence of sentences) {
    for (const keyword of emphasisKeywords) {
      if (sentence.toLowerCase().includes(keyword)) {
        return sentence.trim();
      }
    }
  }
  
  // Fallback: return a general statement
  const generalSentences = sentences.filter(s => 
    s.trim().length > 50 && 
    s.trim().length < 200 &&
    !s.toLowerCase().includes('career') &&
    !s.toLowerCase().includes('apply')
  );
  
  return generalSentences[0]?.trim() || '';
}

function cleanHtml(html) {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function formatMajorMarkdown(content, url) {
  const overview = content.overview || 'Overview content extracted from source page.';
  const focusAreas = content.focusAreas.length > 0 
    ? content.focusAreas 
    : ['Focus areas extracted from source page'];
  const contexts = content.contexts.length > 0 
    ? content.contexts 
    : ['Contexts extracted from source page'];
  const emphasis = content.emphasis || 'Disciplinary emphasis extracted from source page.';
  
  return `${overview}

## Core Focus Areas

${focusAreas.map(area => `- ${area}`).join('\n')}

## Common Contexts and Domains

${contexts.map(ctx => `- ${ctx}`).join('\n')}

## Disciplinary Emphasis

${emphasis}

---
*Source: ${url}*
`;
}

if (require.main === module) {
  createMajorFiles().catch(console.error);
}

module.exports = { createMajorFiles, extractStructuredContent };
