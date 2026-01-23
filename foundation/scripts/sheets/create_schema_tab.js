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

/**
 * Creates or updates the Schema tab with reference tables
 */
async function createSchemaTab(auth) {
  const sheets = google.sheets({ version: 'v4', auth });
  const sheetId = process.env.SHEET_ID;
  
  if (!sheetId) {
    throw new Error('SHEET_ID is required in .env file');
  }

  // Table 1: Sections reference (starting at A1)
  const table1Headers = ['section_name', 'description', 'when_to_use'];
  const table1Rows = [
    ['AI Basics', 'Core concepts and definitions explaining how AI and machine learning work', 'Use for foundational explanations and conceptual overviews'],
    ['Using AI for School and Work', 'Practical guidance for students using AI in academics or jobs', 'Use when content focuses on student workflows or productivity'],
    ['How Businesses Are Using AI', 'Real-world business applications of AI', 'Use for industry examples and organizational use cases'],
    ['AI Tools You Might Use', 'Specific AI tools, platforms, or services', 'Use when the resource is centered on a particular tool'],
    ['Rules, Risks, and Ethics of AI', 'Ethical, legal, and governance considerations', 'Use for policy, ethics, and responsible AI topics'],
    ['AI News That Matters', 'Major AI trends, reports, and timely updates', 'Use for newsworthy or time-sensitive content'],
    ['AI Resources at Penn State', 'Penn State–specific AI resources', 'Use only for PSU-related links'],
    ['AI by Smeal Major', 'AI applications by business discipline', 'Use for major-specific guidance']
  ];

  // Table 2: Source types reference (starting at A12)
  const table2Headers = ['source_type', 'description', 'notes'];
  const table2Rows = [
    ['University / Official', 'Official university, government, or institutional content', 'Prefer when available'],
    ['Course / Training', 'Structured educational or instructional material', 'Includes LinkedIn Learning'],
    ['Explainer / Guide', 'Plain-language educational content', 'Student-readable preferred'],
    ['Case Study / Example', 'Real-world application examples', 'Often business-oriented'],
    ['Research / Academic', 'Peer-reviewed or formal research', 'May be more technical'],
    ['News / Update', 'Reporting on recent developments', 'Ensure relevance and recency'],
    ['Tool Documentation', 'Official documentation for tools', 'Use sparingly']
  ];

  try {
    // Get spreadsheet metadata to check if Schema sheet exists
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: sheetId,
    });

    const schemaSheetExists = spreadsheet.data.sheets.some(
      sheet => sheet.properties.title === 'Schema'
    );

    if (!schemaSheetExists) {
      // Create the Schema sheet
      console.log('Creating Schema tab...');
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: sheetId,
        requestBody: {
          requests: [{
            addSheet: {
              properties: {
                title: 'Schema',
              },
            },
          }],
        },
      });
      console.log('✓ Schema tab created');
    } else {
      console.log('Schema tab already exists, updating content...');
    }

    // Write Table 1 (starting at A1)
    console.log('Writing Table 1 (Sections reference)...');
    const table1Values = [table1Headers, ...table1Rows];
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: 'Schema!A1:C9',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: table1Values,
      },
    });

    // Write Table 2 (starting at A12)
    console.log('Writing Table 2 (Source types reference)...');
    const table2Values = [table2Headers, ...table2Rows];
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: 'Schema!A12:C19',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: table2Values,
      },
    });

    console.log('\n✓ Successfully created/updated Schema tab');
    console.log('  Table 1: Sections reference (A1:C9)');
    console.log('  Table 2: Source types reference (A12:C19)');

  } catch (error) {
    console.error('Error creating Schema tab:', error.message);
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
    const auth = await authorize();
    await createSchemaTab(auth);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
