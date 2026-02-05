const fs = require('fs').promises;
const path = require('path');

async function finalExtraction() {
  const fetchedContent = JSON.parse(
    await fs.readFile(path.join(__dirname, 'fetched_content.json'), 'utf8')
  );

  for (const [majorName, data] of Object.entries(fetchedContent)) {
    if (data.error) continue;
    
    const text = data.text || '';
    const content = extractFromText(text, majorName);
    
    const filename = `MAJOR_${majorName.replace(/-/g, '_').toUpperCase()}.md`;
    const filepath = path.join(__dirname, filename);
    
    const markdown = formatMajorMarkdown(content, data.url);
    await fs.writeFile(filepath, markdown, 'utf8');
    console.log(`✓ Created ${filename}`);
  }
}

function extractFromText(text, majorName) {
  // Remove URLs and navigation elements
  text = text.replace(/https?:\/\/[^\s]+/g, '');
  text = text.replace(/png|jpg|jpeg|gif/gi, '');
  
  // Split text into sentences
  const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 20);
  
  // Find the cutoff point (usually "Careers in..." or similar)
  let cutoffIndex = sentences.length;
  for (let i = 0; i < sentences.length; i++) {
    const lower = sentences[i].toLowerCase();
    if (lower.includes('career') && (lower.includes('in ') || lower.includes('major'))) {
      cutoffIndex = i;
      break;
    }
  }
  
  // Extract overview from first substantial paragraph before careers section
  const overviewSentences = sentences.slice(0, cutoffIndex).filter(s => 
    s.length > 50 && 
    s.length < 400 &&
    !s.toLowerCase().includes('career') &&
    !s.toLowerCase().includes('job') &&
    !s.toLowerCase().includes('recruit')
  );
  
  const overview = overviewSentences.slice(0, 3).join('. ').trim() + '.';
  
  // Extract focus areas - look for lists or key topics mentioned
  const focusAreas = [];
  
  // Look for patterns like "X, Y, and Z" or "including X, Y, Z"
  const listPatterns = [
    /(?:including|such as|like|focus on|study|examine|cover)[^.!?]{0,200}?([A-Z][a-z]+(?:, [A-Z][a-z]+){1,})/g,
    /([A-Z][a-z]+(?:, [A-Z][a-z]+){2,})/g,
  ];
  
  for (const pattern of listPatterns) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      const items = match[1].split(',').map(s => s.trim().replace(/^and /, ''));
      for (const item of items) {
        if (item.length > 5 && item.length < 50 && 
            !item.toLowerCase().includes('career') &&
            !item.toLowerCase().includes('job')) {
          focusAreas.push(item);
        }
      }
      if (focusAreas.length >= 8) break;
    }
    if (focusAreas.length >= 8) break;
  }
  
  // If no lists found, extract key nouns/phrases from overview
  if (focusAreas.length === 0) {
    const keyTerms = extractKeyTerms(overviewSentences.join(' '));
    focusAreas.push(...keyTerms.slice(0, 8));
  }
  
  // Extract contexts - sentences mentioning domains/organizations
  const contexts = [];
  const contextKeywords = ['organization', 'business', 'industry', 'market', 'sector', 'system', 'process'];
  
  for (const sentence of overviewSentences) {
    const lower = sentence.toLowerCase();
    if (contextKeywords.some(kw => lower.includes(kw)) &&
        sentence.length > 40 && sentence.length < 200) {
      contexts.push(sentence);
    }
  }
  
  // Extract disciplinary emphasis - statement about what the field does
  let emphasis = '';
  const emphasisKeywords = ['develop', 'interpret', 'analyze', 'examine', 'study', 'focus', 'deal with', 'prepare'];
  
  for (const sentence of overviewSentences) {
    const lower = sentence.toLowerCase();
    if (emphasisKeywords.some(kw => lower.includes(kw)) &&
        sentence.length > 60 && sentence.length < 250) {
      emphasis = sentence;
      break;
    }
  }
  
  // Fallback emphasis
  if (!emphasis && overviewSentences.length > 0) {
    emphasis = overviewSentences.find(s => s.length > 80 && s.length < 250) || overviewSentences[0];
  }
  
  return {
    overview: overview || sentences[0] || '',
    focusAreas: focusAreas.slice(0, 8),
    contexts: contexts.slice(0, 6),
    emphasis: emphasis || '',
  };
}

function extractKeyTerms(text) {
  // Extract capitalized phrases and important nouns
  const terms = [];
  
  // Look for patterns like "X and Y" or "X, Y, and Z"
  const andPattern = /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+and\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g;
  let match;
  while ((match = andPattern.exec(text)) !== null) {
    terms.push(match[1], match[2]);
  }
  
  // Look for important capitalized phrases
  const phrasePattern = /([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})/g;
  while ((match = phrasePattern.exec(text)) !== null) {
    const phrase = match[1];
    if (phrase.length > 5 && phrase.length < 40 &&
        !phrase.toLowerCase().includes('penn state') &&
        !phrase.toLowerCase().includes('smeal') &&
        !phrase.toLowerCase().includes('college')) {
      terms.push(phrase);
    }
  }
  
  return [...new Set(terms)]; // Remove duplicates
}

function formatMajorMarkdown(content, url) {
  const overview = content.overview || '';
  const focusAreas = content.focusAreas.length > 0 
    ? content.focusAreas 
    : ['Focus areas extracted from source'];
  const contexts = content.contexts.length > 0 
    ? content.contexts 
    : ['Contexts extracted from source'];
  const emphasis = content.emphasis || 'Disciplinary emphasis extracted from source.';
  
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
  finalExtraction().catch(console.error);
}

module.exports = { finalExtraction, extractFromText };
