const { google } = require('googleapis');
const fs = require('fs').promises;
const path = require('path');
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

// Valid section values
const VALID_SECTIONS = [
  "AI Basics",
  "Using AI for School and Work",
  "How Businesses Are Using AI",
  "AI Tools You Might Use",
  "Rules, Risks, and Ethics of AI",
  "AI News That Matters",
  "AI Resources at Penn State",
  "AI by Smeal Major"
];

// Valid source_type values
const VALID_SOURCE_TYPES = [
  "University / Official",
  "Course / Training",
  "Tool Documentation",
  "Explainer / Guide",
  "Case Study / Example",
  "Research / Academic",
  "News / Update"
];

/**
 * Validates a link object has required fields and valid values
 */
function validateLink(link, index) {
  const errors = [];
  
  // Validate section
  if (!link.section || typeof link.section !== 'string' || link.section.trim() === '') {
    errors.push('section is required and must be a non-empty string');
  } else if (!VALID_SECTIONS.includes(link.section.trim())) {
    errors.push(`section must be one of: ${VALID_SECTIONS.join(', ')}`);
  }
  
  // Validate URL
  if (!link.url || typeof link.url !== 'string' || link.url.trim() === '') {
    errors.push('url is required and must be a non-empty string');
  } else if (!link.url.trim().toLowerCase().startsWith('http')) {
    errors.push('url must start with http (http:// or https://)');
  }
  
  // Validate source_type
  if (!link.source_type || typeof link.source_type !== 'string' || link.source_type.trim() === '') {
    errors.push('source_type is required and must be a non-empty string');
  } else if (!VALID_SOURCE_TYPES.includes(link.source_type.trim())) {
    errors.push(`source_type must be one of: ${VALID_SOURCE_TYPES.join(', ')}`);
  }
  
  return errors;
}

/**
 * Formats a link object into a row array for Google Sheets
 * date_added is always set to today's date (local time) in YYYY-MM-DD format
 */
function formatLinkAsRow(link) {
  // Always use today's date (local time) in YYYY-MM-DD format
  // Ignore any date_added value from input JSON
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const dateAdded = `${year}-${month}-${day}`;
  
  return [
    link.section || '',
    link.url || '',
    link.source_type || '',
    link.relevance_note || '',
    dateAdded
  ];
}

/**
 * Appends links to Google Sheets
 */
async function appendLinks(auth, links) {
  const sheets = google.sheets({ version: 'v4', auth });
  
  const sheetId = process.env.SHEET_ID;
  const sheetTab = process.env.SHEET_TAB || 'Corpus';
  const range = process.env.RANGE || 'A:E';
  
  if (!sheetId) {
    throw new Error('SHEET_ID is required in .env file');
  }
  
  const validRows = [];
  const skippedRows = [];
  
  // Validate and format links
  links.forEach((link, index) => {
    const errors = validateLink(link, index);
    if (errors.length > 0) {
      skippedRows.push({
        index: index + 1,
        link,
        reason: errors.join('; ')
      });
    } else {
      validRows.push(formatLinkAsRow(link));
    }
  });
  
  if (validRows.length === 0) {
    console.log('\n❌ No valid rows to append. All rows were skipped.');
    if (skippedRows.length > 0) {
      console.log('\nSkipped rows:');
      skippedRows.forEach(({ index, link, reason }) => {
        console.log(`  Row ${index} (${link.url || 'no URL'}): ${reason}`);
      });
    }
    console.log(`\nSummary: Appended 0 row(s), skipped ${skippedRows.length} row(s)`);
    return;
  }
  
  // Append to sheet
  const fullRange = `${sheetTab}!${range}`;
  
  try {
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: fullRange,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: validRows,
      },
    });
    
    console.log(`\n✓ Successfully appended ${validRows.length} row(s) to ${sheetTab}`);
    console.log(`  Updated range: ${response.data.updates.updatedRange}`);
    
    // Show detailed summary of appended rows
    console.log('\nAppended row(s):');
    validRows.forEach((row, index) => {
      console.log(`  Row ${index + 1}:`);
      console.log(`    Section: ${row[0]}`);
      console.log(`    URL: ${row[1]}`);
      console.log(`    Source Type: ${row[2]}`);
      console.log(`    Relevance Note: ${row[3] || '(empty)'}`);
      console.log(`    Date Added: ${row[4]}`);
    });
    
    if (skippedRows.length > 0) {
      console.log(`\n⚠ Skipped ${skippedRows.length} row(s):`);
      skippedRows.forEach(({ index, link, reason }) => {
        console.log(`  Row ${index} (${link.url || 'no URL'}): ${reason}`);
      });
    }
    
    console.log(`\nSummary: Appended ${validRows.length} row(s), skipped ${skippedRows.length} row(s)`);
  } catch (error) {
    console.error('Error appending to sheet:', error.message);
    if (error.response) {
      console.error('Details:', error.response.data);
    }
    throw error;
  }
}

/**
 * Main function
 */
async function main() {
  try {
    // Get input file path from CLI args
    const inputFile = process.argv[2];
    if (!inputFile) {
      console.error('Usage: node append_links.js <path_to_json_file>');
      process.exit(1);
    }
    
    // Read and parse input JSON
    const inputPath = path.resolve(inputFile);
    const fileContent = await fs.readFile(inputPath, 'utf8');
    const links = JSON.parse(fileContent);
    
    if (!Array.isArray(links)) {
      throw new Error('Input JSON must be an array of link objects');
    }
    
    console.log(`Loading ${links.length} link(s) from ${inputFile}...`);
    
    // Authorize and append
    const auth = await authorize();
    await appendLinks(auth, links);
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
