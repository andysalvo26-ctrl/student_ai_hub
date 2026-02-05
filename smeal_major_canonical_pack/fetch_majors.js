const https = require('https');
const fs = require('fs').promises;
const path = require('path');

const majors = [
  { url: 'https://undergrad.smeal.psu.edu/majors/accounting', name: 'accounting' },
  { url: 'https://undergrad.smeal.psu.edu/majors/actuarial-science', name: 'actuarial-science' },
  { url: 'https://undergrad.smeal.psu.edu/majors/corporate-innovation-and-entrepreneurship', name: 'corporate-innovation-and-entrepreneurship' },
  { url: 'https://undergrad.smeal.psu.edu/majors/finance', name: 'finance' },
  { url: 'https://undergrad.smeal.psu.edu/majors/management-information-systems', name: 'management-information-systems' },
  { url: 'https://undergrad.smeal.psu.edu/majors/management', name: 'management' },
  { url: 'https://undergrad.smeal.psu.edu/majors/marketing', name: 'marketing' },
  { url: 'https://undergrad.smeal.psu.edu/majors/real-estate', name: 'real-estate' },
  { url: 'https://undergrad.smeal.psu.edu/majors/risk-management', name: 'risk-management' },
  { url: 'https://undergrad.smeal.psu.edu/majors/supply-chain-information-systems', name: 'supply-chain-information-systems' },
];

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    const timeout = 15000;
    let data = '';
    
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Student AI Hub Bot/1.0)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      timeout: timeout,
    }, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }
      
      res.on('data', (chunk) => {
        data += chunk;
        if (data.length > 500000) {
          res.destroy();
          reject(new Error('Response too large'));
        }
      });
      
      res.on('end', () => {
        resolve(data);
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
}

function extractText(html) {
  // Remove script and style tags
  html = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  
  // Extract main content area (common patterns for Smeal pages)
  let content = '';
  
  // Try to find main content container
  const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i) ||
                    html.match(/<article[^>]*>([\s\S]*?)<\/article>/i) ||
                    html.match(/<div[^>]*class="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/i) ||
                    html.match(/<div[^>]*id="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
  
  if (mainMatch) {
    content = mainMatch[1];
  } else {
    // Fallback: extract body content
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    if (bodyMatch) {
      content = bodyMatch[1];
    } else {
      content = html;
    }
  }
  
  // Convert HTML to text
  let text = content
    .replace(/<[^>]+>/g, ' ') // Remove HTML tags
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
  
  return text;
}

async function fetchAllMajors() {
  const results = {};
  
  for (const major of majors) {
    console.log(`Fetching ${major.name}...`);
    try {
      const html = await fetchPage(major.url);
      const text = extractText(html);
      results[major.name] = {
        url: major.url,
        html: html.substring(0, 100000), // Store first 100KB of HTML
        text: text.substring(0, 50000), // Store first 50KB of text
      };
      console.log(`  ✓ Fetched ${text.length} characters`);
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`  ✗ Error fetching ${major.name}: ${error.message}`);
      results[major.name] = {
        url: major.url,
        error: error.message,
      };
    }
  }
  
  // Save results
  await fs.writeFile(
    path.join(__dirname, 'fetched_content.json'),
    JSON.stringify(results, null, 2)
  );
  
  console.log('\n✓ Saved fetched_content.json');
  return results;
}

if (require.main === module) {
  fetchAllMajors().catch(console.error);
}

module.exports = { fetchAllMajors, extractText };
