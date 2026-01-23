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
 * Normalize URL for comparison (remove trailing slash, lowercase)
 */
function normalizeUrl(url) {
  if (!url) return '';
  return url.trim().toLowerCase().replace(/\/$/, '');
}

/**
 * Main audit function
 */
async function auditRegistry(auth, ingestedUrls, usedInFinalSectionsUrls) {
  const sheets = google.sheets({ version: 'v4', auth });
  const sheetId = process.env.SHEET_ID;
  const originalTab = process.env.SHEET_TAB || 'Corpus';
  
  if (!sheetId) {
    throw new Error('SHEET_ID is required in .env file');
  }

  // Normalize URLs for comparison
  const normalizedIngestedUrls = new Set(ingestedUrls.map(normalizeUrl));
  const normalizedUsedInFinalSectionsUrls = new Set(usedInFinalSectionsUrls.map(normalizeUrl));

  console.log(`\n📊 Auditing registry in sheet ${sheetId}...`);

  // Step 1: Read all data from original tab
  console.log(`\n1. Reading data from ${originalTab}...`);
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: `${originalTab}!A:E`,
  });

  const rows = response.data.values || [];
  if (rows.length === 0) {
    throw new Error(`No data found in ${originalTab}`);
  }

  const header = rows[0];
  const dataRows = rows.slice(1);

  console.log(`   Found ${dataRows.length} data rows`);

  // Step 2: Create Legacy_Collected_Links_v0 tab (copy of original)
  console.log(`\n2. Creating Legacy_Collected_Links_v0 tab...`);
  try {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: sheetId,
      requestBody: {
        requests: [{
          addSheet: {
            properties: {
              title: 'Legacy_Collected_Links_v0',
            },
          },
        }],
      },
    });
    console.log('   ✓ Created Legacy_Collected_Links_v0 tab');
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('   ⚠ Legacy_Collected_Links_v0 tab already exists, skipping creation');
    } else {
      throw error;
    }
  }

  // Copy all original data to legacy tab
  const legacyRows = [
    ['Note: This sheet reflects the originally collected link set prior to usage auditing.'],
    [],
    ...rows,
  ];

  await sheets.spreadsheets.values.update({
    spreadsheetId: sheetId,
    range: 'Legacy_Collected_Links_v0!A1',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: legacyRows,
    },
  });
  console.log('   ✓ Copied all original data to Legacy_Collected_Links_v0');

  // Step 3: Create Active_Ingested_Links_v1 tab (only ingested URLs)
  console.log(`\n3. Creating Active_Ingested_Links_v1 tab...`);
  try {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: sheetId,
      requestBody: {
        requests: [{
          addSheet: {
            properties: {
              title: 'Active_Ingested_Links_v1',
            },
          },
        }],
      },
    });
    console.log('   ✓ Created Active_Ingested_Links_v1 tab');
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('   ⚠ Active_Ingested_Links_v1 tab already exists, skipping creation');
    } else {
      throw error;
    }
  }

  // Filter to only ingested URLs
  const ingestedRows = [header];
  dataRows.forEach(row => {
    const url = row[1] || ''; // URL is in column B (index 1)
    if (normalizedIngestedUrls.has(normalizeUrl(url))) {
      ingestedRows.push(row);
    }
  });

  await sheets.spreadsheets.values.update({
    spreadsheetId: sheetId,
    range: 'Active_Ingested_Links_v1!A1',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: ingestedRows,
    },
  });
  console.log(`   ✓ Copied ${ingestedRows.length - 1} ingested URLs to Active_Ingested_Links_v1`);

  // Step 3b: Create Active_Used_In_Final_Sections_v1 tab (only URLs used in final sections)
  console.log(`\n3b. Creating Active_Used_In_Final_Sections_v1 tab...`);
  try {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: sheetId,
      requestBody: {
        requests: [{
          addSheet: {
            properties: {
              title: 'Active_Used_In_Final_Sections_v1',
            },
          },
        }],
      },
    });
    console.log('   ✓ Created Active_Used_In_Final_Sections_v1 tab');
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('   ⚠ Active_Used_In_Final_Sections_v1 tab already exists, skipping creation');
    } else {
      throw error;
    }
  }

  // Filter to only URLs used in final sections
  const usedInFinalSectionsRows = [header];
  dataRows.forEach(row => {
    const url = row[1] || ''; // URL is in column B (index 1)
    if (normalizedUsedInFinalSectionsUrls.has(normalizeUrl(url))) {
      usedInFinalSectionsRows.push(row);
    }
  });

  await sheets.spreadsheets.values.update({
    spreadsheetId: sheetId,
    range: 'Active_Used_In_Final_Sections_v1!A1',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: usedInFinalSectionsRows,
    },
  });
  console.log(`   ✓ Copied ${usedInFinalSectionsRows.length - 1} URLs used in final sections to Active_Used_In_Final_Sections_v1`);

  // Step 4: Add header note to original tab FIRST (before adding columns)
  console.log(`\n4. Adding header note to ${originalTab}...`);
  const today = new Date().toISOString().split('T')[0];
  const note = `As of ${today}, this registry distinguishes between originally collected links, those ingested into the corpus, and those used in final published foundation reference sections. See additional tabs for details.`;

  const sheetIdNum = await getSheetId(sheets, sheetId, originalTab);
  
  // Insert a new row at the top
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: sheetId,
    requestBody: {
      requests: [{
        insertDimension: {
          range: {
            sheetId: sheetIdNum,
            dimension: 'ROWS',
            startIndex: 0,
            endIndex: 1,
          },
        },
      }],
    },
  });

  // Merge cells A1:G1 for the note (A through G to accommodate two new columns)
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: sheetId,
    requestBody: {
      requests: [
        {
          mergeCells: {
            range: {
              sheetId: sheetIdNum,
              startRowIndex: 0,
              endRowIndex: 1,
              startColumnIndex: 0,
              endColumnIndex: 7, // A through G
            },
            mergeType: 'MERGE_ALL',
          },
        },
      ],
    },
  });

  // Add the note text
  await sheets.spreadsheets.values.update({
    spreadsheetId: sheetId,
    range: `${originalTab}!A1`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[note]],
    },
  });

  console.log('   ✓ Added header note');

  // Step 5: Add two status columns to original tab (header is now in row 2)
  console.log(`\n5. Adding ingested_status and final_section_use_status columns to ${originalTab}...`);
  
  // Update the header row (now in row 2) to include both status columns
  // First, get the current header row to preserve it
  const headerAfterInsert = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: `${originalTab}!A2:E2`,
  });

  const currentHeader = headerAfterInsert.data.values ? headerAfterInsert.data.values[0] : header;
  
  // Check if status columns already exist
  const headerFullResponse = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: `${originalTab}!A2:G2`,
  });

  const hasIngestedStatus = headerFullResponse.data.values && 
                            headerFullResponse.data.values[0] && 
                            headerFullResponse.data.values[0].length > 5 &&
                            headerFullResponse.data.values[0][5] === 'ingested_status';

  if (!hasIngestedStatus) {
    // Update header row to include both status columns (row 2, columns A-G)
    const updatedHeader = [...currentHeader, 'ingested_status', 'final_section_use_status'];
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `${originalTab}!A2:G2`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [updatedHeader],
      },
    });
    console.log('   ✓ Added ingested_status and final_section_use_status headers');
  } else {
    console.log('   ⚠ Status columns already exist');
  }

  // Populate both status columns for each data row (starting at row 3)
  const statusRows = [];
  dataRows.forEach((row, index) => {
    const url = row[1] || '';
    const normalizedUrl = normalizeUrl(url);
    
    const ingestedStatus = normalizedIngestedUrls.has(normalizedUrl) 
      ? 'ingested_in_corpus' 
      : 'not_ingested';
    
    const finalSectionUseStatus = normalizedUsedInFinalSectionsUrls.has(normalizedUrl)
      ? 'used_in_final_sections'
      : 'not_used_in_final_sections';
    
    statusRows.push([ingestedStatus, finalSectionUseStatus]);
  });

  await sheets.spreadsheets.values.update({
    spreadsheetId: sheetId,
    range: `${originalTab}!F3:G${dataRows.length + 2}`, // Start at row 3, columns F and G
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: statusRows,
    },
  });
  console.log(`   ✓ Populated status columns for ${dataRows.length} rows`);

  // Summary
  const ingestedCount = statusRows.filter(r => r[0] === 'ingested_in_corpus').length;
  const notIngestedCount = statusRows.filter(r => r[0] === 'not_ingested').length;
  const usedInFinalSectionsCount = statusRows.filter(r => r[1] === 'used_in_final_sections').length;
  const notUsedInFinalSectionsCount = statusRows.filter(r => r[1] === 'not_used_in_final_sections').length;

  console.log(`\n✅ Audit complete!`);
  console.log(`\nSummary:`);
  console.log(`  Total links collected: ${dataRows.length}`);
  console.log(`  Links ingested into corpus: ${ingestedCount}`);
  console.log(`  Links not ingested: ${notIngestedCount}`);
  console.log(`  Links used in final sections: ${usedInFinalSectionsCount}`);
  console.log(`  Links not used in final sections: ${notUsedInFinalSectionsCount}`);
  console.log(`\nTabs created:`);
  console.log(`  - Legacy_Collected_Links_v0: ${dataRows.length} rows (original set)`);
  console.log(`  - Active_Ingested_Links_v1: ${ingestedCount} rows (ingested into corpus)`);
  console.log(`  - Active_Used_In_Final_Sections_v1: ${usedInFinalSectionsCount} rows (used in final sections)`);
  console.log(`  - ${originalTab}: Updated with ingested_status and final_section_use_status columns`);
}

/**
 * Get sheet ID by name
 */
async function getSheetId(sheets, spreadsheetId, sheetName) {
  const metadata = await sheets.spreadsheets.get({
    spreadsheetId: spreadsheetId,
  });
  const sheet = metadata.data.sheets.find(s => s.properties.title === sheetName);
  return sheet ? sheet.properties.sheetId : null;
}

/**
 * Main function
 */
async function main() {
  try {
    // Get two JSON files from command line arguments
    const ingestedUrlsFile = process.argv[2];
    const usedInFinalSectionsUrlsFile = process.argv[3];
    
    if (!ingestedUrlsFile || !usedInFinalSectionsUrlsFile) {
      console.error('Usage: node audit_registry.js <path_to_ingested_urls_json> <path_to_used_in_final_sections_urls_json>');
      console.error('Expected JSON format: ["url1", "url2", ...]');
      process.exit(1);
    }

    // Load ingested URLs
    const ingestedFileContent = await fs.readFile(ingestedUrlsFile, 'utf8');
    const ingestedUrls = JSON.parse(ingestedFileContent);

    if (!Array.isArray(ingestedUrls)) {
      throw new Error('Ingested URLs JSON must be an array of URLs');
    }

    // Load used in final sections URLs
    const usedInFinalSectionsFileContent = await fs.readFile(usedInFinalSectionsUrlsFile, 'utf8');
    const usedInFinalSectionsUrls = JSON.parse(usedInFinalSectionsFileContent);

    if (!Array.isArray(usedInFinalSectionsUrls)) {
      throw new Error('Used in final sections URLs JSON must be an array of URLs');
    }

    console.log(`Loaded ${ingestedUrls.length} ingested URLs from ${ingestedUrlsFile}`);
    console.log(`Loaded ${usedInFinalSectionsUrls.length} URLs used in final sections from ${usedInFinalSectionsUrlsFile}`);

    // Validate that used_in_final_sections is a subset of ingested
    const normalizedIngested = new Set(ingestedUrls.map(url => url.trim().toLowerCase().replace(/\/$/, '')));
    const normalizedUsed = new Set(usedInFinalSectionsUrls.map(url => url.trim().toLowerCase().replace(/\/$/, '')));
    
    const notInIngested = [...normalizedUsed].filter(url => !normalizedIngested.has(url));
    if (notInIngested.length > 0) {
      console.warn(`\n⚠ Warning: ${notInIngested.length} URLs in used_in_final_sections are not in ingested list:`);
      notInIngested.forEach(url => console.warn(`  - ${url}`));
    } else {
      console.log(`\n✓ Validation: All URLs used in final sections are also ingested`);
    }

    // Authorize and audit
    const auth = await authorize();
    await auditRegistry(auth, ingestedUrls, usedInFinalSectionsUrls);

  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Details:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
