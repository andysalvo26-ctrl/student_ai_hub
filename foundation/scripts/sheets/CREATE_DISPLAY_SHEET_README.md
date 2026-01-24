# Create Foundational Sources Display Sheet

This script creates a new Google Sheet tab `Foundational_Sources_Display_v1` from the existing `Active_Used_In_Final_Sections_v1` tab.

## Purpose

The new sheet contains only two columns suitable for public display:
- **Title**: Human-readable source title (extracted from HTML `<title>` tag)
- **URL**: Direct link to the source

All internal metadata (section labels, source type, relevance notes, dates) is excluded.

## Requirements

- Node.js installed
- Google Sheets API credentials configured (see main README.md)
- Network access (to fetch page titles from URLs)
- `.env` file with `SHEET_ID` set

## Usage

```bash
cd foundation/scripts/sheets
node create_display_sheet.js
```

## How It Works

1. **Reads** all rows from `Active_Used_In_Final_Sections_v1` tab
2. **Extracts titles** by:
   - Fetching each URL's HTML
   - Extracting the `<title>` tag content
   - Cleaning up common suffixes (site names after dash/pipe)
   - Falling back to URL-based title generation if fetch fails
3. **Creates** new tab `Foundational_Sources_Display_v1` (or clears existing)
4. **Writes** Title and URL columns only

## Title Extraction

- **Primary method**: Fetches HTML and extracts `<title>` tag
- **Fallback**: Generates readable title from URL path if fetch fails
- **Cleaning**: Removes HTML entities, normalizes whitespace, removes site name suffixes

## Notes

- The script includes a 500ms delay between requests to avoid rate limiting
- Failed fetches will use URL-based title generation (still readable)
- Existing `Foundational_Sources_Display_v1` tab will be cleared if it exists
- Original sheets are never modified

## Output

The new sheet will have:
- Header row: `Title`, `URL`
- One data row per source from `Active_Used_In_Final_Sections_v1`
- Clean, public-facing format suitable for website display
