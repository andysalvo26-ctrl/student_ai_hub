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

async function verifyDisplaySheet() {
  const auth = await authorize();
  const sheets = google.sheets({ version: 'v4', auth });
  const sheetId = process.env.SHEET_ID;
  const displayTab = 'Foundational_Sources_Display_v1';
  
  if (!sheetId) {
    throw new Error('SHEET_ID is required in .env file');
  }

  console.log(`\n🔍 Verifying ${displayTab} tab...\n`);

  // Check if tab exists
  const metadata = await sheets.spreadsheets.get({
    spreadsheetId: sheetId,
  });
  
  const tab = metadata.data.sheets.find(s => s.properties.title === displayTab);
  
  if (!tab) {
    console.log(`❌ Tab "${displayTab}" does not exist.`);
    console.log(`\nAvailable tabs:`);
    metadata.data.sheets.forEach(s => {
      console.log(`  - ${s.properties.title}`);
    });
    return false;
  }

  console.log(`✓ Tab "${displayTab}" exists\n`);

  // Read data from the tab
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: `${displayTab}!A:Z`,
  });

  const rows = response.data.values || [];
  
  if (rows.length === 0) {
    console.log(`❌ Tab is empty`);
    return false;
  }

  const header = rows[0];
  const dataRows = rows.slice(1);

  console.log(`✓ Found ${dataRows.length} data rows\n`);

  // Verify columns
  console.log(`Columns found:`);
  header.forEach((col, i) => {
    console.log(`  ${i + 1}. ${col || '(empty)'}`);
  });
  console.log();

  if (header.length !== 2) {
    console.log(`⚠️  Warning: Expected 2 columns, found ${header.length}`);
  }

  if (header[0] !== 'Title' || header[1] !== 'URL') {
    console.log(`⚠️  Warning: Expected columns "Title" and "URL", found "${header[0]}" and "${header[1]}"`);
  } else {
    console.log(`✓ Column headers are correct: Title, URL\n`);
  }

  // Sample a few titles
  console.log(`Sample titles (first 5):`);
  dataRows.slice(0, 5).forEach((row, i) => {
    const title = row[0] || '(empty)';
    const url = row[1] || '(empty)';
    console.log(`  ${i + 1}. "${title.substring(0, 60)}${title.length > 60 ? '...' : ''}"`);
    console.log(`     ${url.substring(0, 70)}${url.length > 70 ? '...' : ''}`);
  });

  if (dataRows.length > 5) {
    console.log(`  ... and ${dataRows.length - 5} more rows`);
  }

  console.log(`\n✅ Verification complete!`);
  console.log(`\nSummary:`);
  console.log(`  - Tab exists: ✓`);
  console.log(`  - Columns: ${header.length} (${header.join(', ')})`);
  console.log(`  - Data rows: ${dataRows.length}`);
  console.log(`  - Format: ${header.length === 2 && header[0] === 'Title' && header[1] === 'URL' ? '✓ Correct' : '⚠ Check columns'}`);

  return true;
}

async function main() {
  try {
    await verifyDisplaySheet();
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
