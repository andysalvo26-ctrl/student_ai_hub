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

async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}

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

async function authenticate(options) {
  const content = await fs.readFile(CREDENTIALS_PATH);
  const credentials = JSON.parse(content);
  const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  const token = await loadSavedCredentialsIfExist();
  if (token) {
    oAuth2Client.setCredentials(token.credentials);
    return oAuth2Client;
  }

  return getNewToken(oAuth2Client, options);
}

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
 * Normalize "AI" capitalization in a title string
 * Only changes standalone "AI" acronym, not when part of another word
 */
function normalizeAICapitalization(title) {
  if (!title) return title;
  
  // Use regex to match standalone "AI" or "Ai" (not part of another word)
  // Word boundaries ensure we don't match "said", "brain", "maintain", etc.
  // Case-insensitive match, but we'll replace with "AI"
  const normalized = title.replace(/\b(Ai|ai)\b/g, 'AI');
  
  return normalized;
}

/**
 * Normalize AI capitalization in Foundational_Sources_Display_v1 tab
 */
async function normalizeAICapitalizationInSheet() {
  const auth = await authorize();
  const sheets = google.sheets({ version: 'v4', auth });
  const sheetId = process.env.SHEET_ID;
  const displayTab = 'Foundational_Sources_Display_v1';
  
  if (!sheetId) {
    throw new Error('SHEET_ID is required in .env file');
  }

  console.log(`\n📝 Normalizing "AI" capitalization in ${displayTab}...\n`);

  // Step 1: Read current data
  console.log('1. Reading current data...');
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: `${displayTab}!A:B`,
  });

  const rows = response.data.values || [];
  if (rows.length === 0) {
    throw new Error(`No data found in ${displayTab}`);
  }

  const header = rows[0];
  const dataRows = rows.slice(1);

  console.log(`   Found ${dataRows.length} data rows\n`);

  // Step 2: Normalize titles
  console.log('2. Normalizing titles...\n');
  const updates = [];
  let changeCount = 0;

  dataRows.forEach((row, index) => {
    const originalTitle = row[0] || '';
    const normalizedTitle = normalizeAICapitalization(originalTitle);
    
    if (originalTitle !== normalizedTitle) {
      changeCount++;
      console.log(`   [${index + 1}] Changed:`);
      console.log(`      Before: "${originalTitle}"`);
      console.log(`      After:  "${normalizedTitle}"`);
      console.log();
      
      // Store update: row index + 2 (1 for header, 1 for 0-based to 1-based)
      updates.push({
        rowIndex: index + 2, // 1-based row number (row 2 is first data row)
        original: originalTitle,
        normalized: normalizedTitle
      });
    }
  });

  if (changeCount === 0) {
    console.log('   ✓ No changes needed - all titles already use "AI" correctly\n');
    return;
  }

  console.log(`   Found ${changeCount} titles to update\n`);

  // Step 3: Apply updates
  console.log('3. Applying updates to sheet...');
  
  // Update each changed row individually to be safe
  for (const update of updates) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `${displayTab}!A${update.rowIndex}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[update.normalized]],
      },
    });
  }

  console.log(`   ✓ Updated ${changeCount} title(s)\n`);

  // Step 4: Verify
  console.log('4. Verifying changes...');
  const verifyResponse = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: `${displayTab}!A:B`,
  });

  const verifyRows = verifyResponse.data.values || [];
  const verifyDataRows = verifyRows.slice(1);
  
  let allCorrect = true;
  verifyDataRows.forEach((row, index) => {
    const title = row[0] || '';
    const normalized = normalizeAICapitalization(title);
    if (title !== normalized) {
      console.log(`   ⚠ Row ${index + 2} still needs normalization: "${title}"`);
      allCorrect = false;
    }
  });

  if (allCorrect) {
    console.log('   ✓ All titles normalized correctly\n');
  }

  console.log(`\n✅ Normalization complete!`);
  console.log(`\nSummary:`);
  console.log(`  - Titles updated: ${changeCount}`);
  console.log(`  - Total rows: ${dataRows.length}`);
  console.log(`  - Column modified: Title (column A)`);
  console.log(`  - Column preserved: URL (column B)`);
}

async function main() {
  try {
    await normalizeAICapitalizationInSheet();
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
