const fs = require('fs').promises;
const path = require('path');

async function refineExtraction() {
  const fetchedContent = JSON.parse(
    await fs.readFile(path.join(__dirname, 'fetched_content.json'), 'utf8')
  );

  for (const [majorName, data] of Object.entries(fetchedContent)) {
    if (data.error) continue;
    
    const html = data.html || '';
    const content = extractDescriptiveContent(html, majorName);
    
    const filename = `MAJOR_${majorName.replace(/-/g, '_').toUpperCase()}.md`;
    const filepath = path.join(__dirname, filename);
    
    const markdown = formatMajorMarkdown(content, data.url);
    await fs.writeFile(filepath, markdown, 'utf8');
    console.log(`✓ Refined ${filename}`);
  }
}

function extractDescriptiveContent(html, majorName) {
  // Remove unwanted sections
  html = html.replace(/<section[^>]*class="[^"]*career[^"]*"[^>]*>[\s\S]*?<\/section>/gi, '');
  html = html.replace(/<div[^>]*class="[^"]*career[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '');
  html = html.replace(/<section[^>]*class="[^"]*job[^"]*"[^>]*>[\s\S]*?<\/section>/gi, '');
  html = html.replace(/<div[^>]*class="[^"]*job[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '');
  html = html.replace(/<section[^>]*class="[^"]*employer[^"]*"[^>]*>[\s\S]*?<\/section>/gi, '');
  html = html.replace(/<div[^>]*class="[^"]*employer[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '');
  
  // Extract main content paragraphs
  const paragraphs = [];
  const pMatches = html.matchAll(/<p[^>]*>([\s\S]{50,500}?)<\/p>/gi);
  for (const match of pMatches) {
    const text = cleanHtml(match[1]);
    // Filter out marketing/career language
    if (text.length > 50 && 
        !text.toLowerCase().includes('career') &&
        !text.toLowerCase().includes('job opportunity') &&
        !text.toLowerCase().includes('recruit') &&
        !text.toLowerCase().includes('employer') &&
        !text.toLowerCase().includes('apply now') &&
        !text.toLowerCase().includes('click here') &&
        !text.match(/https?:\/\//)) {
      paragraphs.push(text);
    }
  }
  
  // Extract overview from first substantial paragraph
  let overview = '';
  for (const para of paragraphs) {
    if (para.length > 100 && para.length < 400) {
      overview = para;
      break;
    }
  }
  
  // Extract focus areas from headings and lists
  const focusAreas = [];
  
  // Look for headings like "What You'll Study" or "Areas of Focus"
  const headingMatches = html.matchAll(/<h[23][^>]*>([^<]+)<\/h[23]>[\s\S]{0,500}?<ul[^>]*>([\s\S]*?)<\/ul>/gi);
  for (const match of headingMatches) {
    const heading = cleanHtml(match[1]).toLowerCase();
    if (heading.includes('study') || heading.includes('focus') || heading.includes('area') || 
        heading.includes('course') || heading.includes('curriculum')) {
      const listItems = match[2].matchAll(/<li[^>]*>([^<]{20,200})<\/li>/gi);
      for (const item of listItems) {
        const cleaned = cleanHtml(item[1]);
        if (cleaned.length > 15 && cleaned.length < 150) {
          focusAreas.push(cleaned);
        }
      }
    }
  }
  
  // Also extract from general list items
  if (focusAreas.length === 0) {
    const listItems = html.matchAll(/<li[^>]*>([^<]{30,200})<\/li>/gi);
    for (const item of listItems) {
      const cleaned = cleanHtml(item[1]);
      if (cleaned.length > 20 && cleaned.length < 200 &&
          !cleaned.toLowerCase().includes('career') &&
          !cleaned.toLowerCase().includes('job') &&
          !cleaned.toLowerCase().includes('employer')) {
        focusAreas.push(cleaned);
        if (focusAreas.length >= 8) break;
      }
    }
  }
  
  // Extract contexts from paragraphs mentioning domains
  const contexts = [];
  const contextKeywords = ['business', 'organization', 'industry', 'sector', 'market', 'system', 'process', 'organization'];
  
  for (const para of paragraphs.slice(0, 10)) {
    const lower = para.toLowerCase();
    if (contextKeywords.some(kw => lower.includes(kw)) &&
        para.length > 50 && para.length < 250) {
      // Extract the relevant sentence or phrase
      const sentences = para.split(/[.!?]+/).filter(s => 
        s.trim().length > 30 && 
        contextKeywords.some(kw => s.toLowerCase().includes(kw))
      );
      contexts.push(...sentences.slice(0, 2).map(s => s.trim()));
    }
  }
  
  // Extract disciplinary emphasis from paragraphs about what the field does
  let emphasis = '';
  for (const para of paragraphs) {
    const lower = para.toLowerCase();
    if ((lower.includes('develop') || lower.includes('interpret') || lower.includes('analyze') ||
         lower.includes('examine') || lower.includes('study') || lower.includes('focus')) &&
        para.length > 80 && para.length < 300) {
      emphasis = para;
      break;
    }
  }
  
  return {
    overview: overview || paragraphs[0] || '',
    focusAreas: focusAreas.slice(0, 8),
    contexts: contexts.slice(0, 6),
    emphasis: emphasis || paragraphs.find(p => p.length > 100) || '',
  };
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
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

function formatMajorMarkdown(content, url) {
  const overview = content.overview || '';
  const focusAreas = content.focusAreas.length > 0 
    ? content.focusAreas 
    : ['Focus areas to be extracted from source'];
  const contexts = content.contexts.length > 0 
    ? content.contexts 
    : ['Contexts to be extracted from source'];
  const emphasis = content.emphasis || 'Disciplinary emphasis to be extracted from source.';
  
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
  refineExtraction().catch(console.error);
}

module.exports = { refineExtraction, extractDescriptiveContent };
