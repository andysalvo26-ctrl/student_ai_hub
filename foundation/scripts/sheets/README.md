# Google Sheets Ingestion Workflow

This script appends link data to a Google Sheets "Corpus" tab using the Google Sheets API v4.

## Setup

1. **Install dependencies:**
   ```bash
   cd student_ai_hub/scripts/sheets
   npm install
   ```

2. **Set up OAuth credentials in Google Cloud Console:**
   
   a. Go to [Google Cloud Console](https://console.cloud.google.com/)
   
   b. Create a new project or select an existing one
   
   c. Enable the Google Sheets API:
      - Navigate to "APIs & Services" > "Library"
      - Search for "Google Sheets API"
      - Click "Enable"
   
   d. Configure OAuth consent screen:
      - Go to "APIs & Services" > "OAuth consent screen"
      - Choose "External" (unless you have a Google Workspace)
      - Fill in the required fields (App name, User support email, Developer contact)
      - Add scopes: `https://www.googleapis.com/auth/spreadsheets`
      - Add test users (your Google account email) if in testing mode
      - Save and continue
   
   e. Create OAuth Client ID:
      - Go to "APIs & Services" > "Credentials"
      - Click "Create Credentials" > "OAuth client ID"
      - Choose "Desktop app" as the application type
      - Give it a name (e.g., "Sheets Ingest")
      - Click "Create"
   
   f. Download credentials:
      - Click the download icon next to your new OAuth client
      - Save the JSON file as `credentials.json` in this directory (`scripts/sheets/`)

3. **Configure environment variables:**
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - The `.env` file should already have the correct values:
     ```
     SHEET_ID=1aF2v14wWWmUSx5gq5ZWLSMfOnoNTXumzmIzzPjuaMoc
     SHEET_TAB=Corpus
     ```
   - No changes needed unless you want to use a different sheet

## Usage

Run the script with a JSON file containing links to append:

```bash
node append_links.js ./sample_links.json
```

Or use the npm script:

```bash
npm run append
```

## First Run

On the first run, the script will:
1. Open your browser to authorize the application
2. Prompt you to enter the authorization code
3. Save the refresh token to `token.json` for future runs

Subsequent runs will use the saved token automatically.

## Input Format

The input JSON file should be an array of objects with the following structure:

```json
[
  {
    "section": "How Businesses Are Using AI",
    "url": "https://www.example.com/article",
    "source_type": "News / Update",
    "relevance_note": "Optional note about why this is relevant"
  }
]
```

**Required fields:**
- `section`: Must be one of:
  - "AI Basics"
  - "Using AI for School and Work"
  - "How Businesses Are Using AI"
  - "AI Tools You Might Use"
  - "Rules, Risks, and Ethics of AI"
  - "AI News That Matters"
  - "AI Resources at Penn State"
  - "AI by Smeal Major"
- `url`: Must start with `http://` or `https://`
- `source_type`: Must be one of:
  - "University / Official"
  - "Course / Training"
  - "Tool Documentation"
  - "Explainer / Guide"
  - "Case Study / Example"
  - "Research / Academic"
  - "News / Update"

**Optional fields:**
- `relevance_note`: String (defaults to empty string)
- `date_added`: **Ignored** - The script automatically sets `date_added` to today's date (local time) in YYYY-MM-DD format at the moment of insertion. This represents the ingestion date, not the publication date of the source.

**Validation:**
- Rows that fail validation will be skipped with a clear error message
- The script will continue processing other rows
- A summary is printed at the end showing how many rows were appended and how many were skipped

## Security Notes

- Never commit `credentials.json`, `token.json`, or `.env` to version control
- These files are already listed in `.gitignore`
- Keep your OAuth credentials secure
