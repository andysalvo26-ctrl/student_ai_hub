const { google } = require('googleapis');
const fs = require('fs').promises;
const path = require('path');
const https = require('https');
const http = require('http');
const { URL } = require('url');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const CREDENTIALS_PATH = path.join(__dirname, 'credentials.json');
const TOKEN_PATH = path.join(__dirname, 'token.json');

/**
 * Load or request authorization to call APIs.
 */
async function authorize() {
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    return client;
  }
  client = await authenticate({ scopes: SCOPES });
  if (client.credentials) {
    await saveCredentials(client);
  }
  return client;
}

/**
 * Reads previously authorized credentials from the save file.
 */
async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}

/**
 * Serializes credentials to a file compatible with GoogleAuth.fromJSON.
 */
async function saveCredentials(client) {
  const content = await fs.readFile(CREDENTIALS_PATH);
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: 'authorized_user',
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  await fs.writeFile(TOKEN_PATH, payload);
}

/**
 * Load client secrets from a local file.
 */
async function authenticate(options) {
  const content = await fs.readFile(CREDENTIALS_PATH);
  const credentials = JSON.parse(content);
  const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  const token = await loadSavedCredentialsIfExist();
  if (token) {
    oAuth2Client.setCredentials(token.credentials);
    return oAuth2Client;
  }

  return getNewToken(oAuth2Client, options);
}

/**
 * Get and store new token after prompting for user authorization.
 */
function getNewToken(oAuth2Client, options) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: options.scopes,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve, reject) => {
    rl.question('Enter the code from that page here: ', (code) => {
      rl.close();
      oAuth2Client.getToken(code, (err, token) => {
        if (err) return reject(err);
        oAuth2Client.setCredentials(token);
        resolve(oAuth2Client);
      });
    });
  });
}

/**
 * Fetch HTML from URL and extract title
 */
function fetchTitle(url) {
  return new Promise((resolve) => {
    const timeout = 8000; // 8 second timeout
    let resolved = false;
    let req = null;
    
    const resolveOnce = (title) => {
      if (!resolved) {
        resolved = true;
        resolve(title);
      }
    };

    // Set overall timeout
    const timeoutId = setTimeout(() => {
      if (req) {
        req.destroy();
      }
      resolveOnce(generateTitleFromUrl(url));
    }, timeout);

    try {
      const parsedUrl = new URL(url);
      const client = parsedUrl.protocol === 'https:' ? https : http;
      
      const options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
        path: parsedUrl.pathname + parsedUrl.search,
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; Student AI Hub Bot/1.0)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        timeout: timeout,
      };

      req = client.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
          // Stop reading after 100KB to avoid memory issues
          if (data.length > 100000) {
            res.destroy();
          }
        });
        
        res.on('end', () => {
          clearTimeout(timeoutId);
          // Extract title from HTML
          const titleMatch = data.match(/<title[^>]*>([^<]+)<\/title>/i);
          if (titleMatch && titleMatch[1]) {
            let title = titleMatch[1]
              .replace(/\s+/g, ' ')
              .trim();
            // Remove common suffixes (site name after dash/pipe)
            title = title.replace(/\s*[-|]\s*[^-|]+$/, '').trim();
            // Clean up HTML entities
            title = title.replace(/&nbsp;/g, ' ')
                         .replace(/&amp;/g, '&')
                         .replace(/&lt;/g, '<')
                         .replace(/&gt;/g, '>')
                         .replace(/&quot;/g, '"')
                         .replace(/&#39;/g, "'");
            resolveOnce(title || generateTitleFromUrl(url));
          } else {
            resolveOnce(generateTitleFromUrl(url));
          }
        });
      });

      req.on('error', (err) => {
        clearTimeout(timeoutId);
        resolveOnce(generateTitleFromUrl(url));
      });

      req.on('timeout', () => {
        if (req) {
          req.destroy();
        }
        clearTimeout(timeoutId);
        resolveOnce(generateTitleFromUrl(url));
      });

      req.end();
    } catch (err) {
      clearTimeout(timeoutId);
      resolveOnce(generateTitleFromUrl(url));
    }
  });
}

/**
 * Generate a readable title from URL as fallback
 */
function generateTitleFromUrl(url) {
  try {
    const parsedUrl = new URL(url);
    let title = parsedUrl.pathname
      .split('/')
      .filter(part => part && !part.match(/^\d+$/)) // Remove numeric-only parts
      .pop() || parsedUrl.hostname;
    
    // Decode URL encoding
    title = decodeURIComponent(title);
    
    // Replace hyphens/underscores with spaces
    title = title.replace(/[-_]/g, ' ');
    
    // Capitalize words
    title = title.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
    
    // Remove file extensions
    title = title.replace(/\.[a-z]{2,4}$/i, '');
    
    return title || parsedUrl.hostname.replace(/^www\./, '');
  } catch (err) {
    return url;
  }
}

/**
 * Create Foundational_Sources_Display_v1 sheet
 */
async function createDisplaySheet(auth) {
  const sheets = google.sheets({ version: 'v4', auth });
  const sheetId = process.env.SHEET_ID;
  const sourceTab = 'Active_Used_In_Final_Sections_v1';
  const displayTab = 'Foundational_Sources_Display_v1';
  
  if (!sheetId) {
    throw new Error('SHEET_ID is required in .env file');
  }

  console.log(`\n📊 Creating ${displayTab} from ${sourceTab}...`);

  // Step 1: Read data from source tab
  console.log(`\n1. Reading data from ${sourceTab}...`);
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: `${sourceTab}!A:E`,
  });

  const rows = response.data.values || [];
  if (rows.length === 0) {
    throw new Error(`No data found in ${sourceTab}`);
  }

  const header = rows[0];
  const dataRows = rows.slice(1);

  console.log(`   Found ${dataRows.length} data rows`);

  // Find URL column index (should be column B, index 1)
  const urlColumnIndex = header.indexOf('url');
  if (urlColumnIndex === -1) {
    throw new Error('URL column not found in source sheet');
  }

  // Step 2: Extract titles from URLs
  console.log(`\n2. Extracting titles from URLs...`);
  console.log(`   This will fetch each page to extract the HTML <title> tag.`);
  console.log(`   If fetching fails, a readable title will be generated from the URL.\n`);
  
  const displayRows = [['Title', 'URL']];
  
  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i];
    const url = row[urlColumnIndex] || '';
    
    if (!url) {
      console.warn(`  ⚠ Row ${i + 2} has no URL, skipping`);
      continue;
    }

    const urlDisplay = url.substring(0, 55) + (url.length > 55 ? '...' : '');
    process.stdout.write(`  [${i + 1}/${dataRows.length}] ${urlDisplay.padEnd(58)} `);
    
    try {
      const title = await Promise.race([
        fetchTitle(url),
        new Promise((resolve) => setTimeout(() => resolve(generateTitleFromUrl(url)), 10000))
      ]);
      
      const titleDisplay = title.substring(0, 55) + (title.length > 55 ? '...' : '');
      console.log(`"${titleDisplay}"`);
      
      displayRows.push([title, url]);
    } catch (err) {
      const fallbackTitle = generateTitleFromUrl(url);
      console.log(`"${fallbackTitle.substring(0, 55)}${fallbackTitle.length > 55 ? '...' : ''}" (fallback)`);
      displayRows.push([fallbackTitle, url]);
    }
    
    // Small delay to avoid rate limiting
    if (i < dataRows.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }

  // Step 3: Create or clear the display tab
  console.log(`\n3. Creating ${displayTab} tab...`);
  
  // Check if tab exists
  const metadata = await sheets.spreadsheets.get({
    spreadsheetId: sheetId,
  });
  
  const existingTab = metadata.data.sheets.find(s => s.properties.title === displayTab);
  
  if (existingTab) {
    console.log(`   ⚠ ${displayTab} tab already exists, clearing it...`);
    // Clear existing data
    await sheets.spreadsheets.values.clear({
      spreadsheetId: sheetId,
      range: `${displayTab}!A:Z`,
    });
  } else {
    // Create new tab
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: sheetId,
      requestBody: {
        requests: [{
          addSheet: {
            properties: {
              title: displayTab,
            },
          },
        }],
      },
    });
    console.log(`   ✓ Created ${displayTab} tab`);
  }

  // Step 4: Write data to display tab
  console.log(`\n4. Writing ${displayRows.length - 1} rows to ${displayTab}...`);
  await sheets.spreadsheets.values.update({
    spreadsheetId: sheetId,
    range: `${displayTab}!A1`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: displayRows,
    },
  });

  console.log(`\n✅ Successfully created ${displayTab} with ${displayRows.length - 1} sources!`);
  console.log(`\nColumns:`);
  console.log(`  - Title: Human-readable source title`);
  console.log(`  - URL: Direct link to source`);
}

/**
 * Main function
 */
async function main() {
  try {
    const auth = await authorize();
    await createDisplaySheet(auth);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.response) {
      console.error('Details:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
