# Registry Audit Instructions

## Summary

The registry audit distinguishes between three states:

- **Total links collected**: 36 (present in registry CSV / Google Sheet)
- **Links ingested into corpus**: 29 (appear in `foundation/data/chunks/chunks.jsonl`)
- **Links used in final sections**: 22 (traceable from chunk IDs in `foundation/content/sections/**/index.md`)

## Evidence Sources

### Ingested URLs (29)
URLs are considered "ingested" if they appear in:
- `foundation/data/chunks/chunks.jsonl` — URLs that were successfully scraped and chunked

### Used in Final Sections URLs (22)
URLs are considered "used in final sections" if they are:
- Traceable from chunk IDs referenced in `foundation/content/sections/**/index.md` back to a URL via chunk metadata
- This means the URL's chunks were actually used in the published reference sections

**Note**: All URLs used in final sections are also ingested (subset relationship).

## Script Ready

The audit script `audit_registry.js` is ready to update the Google Sheet. It will:

1. Create `Legacy_Collected_Links_v0` tab with all 36 original links (unchanged)
2. Create `Active_Ingested_Links_v1` tab with 29 ingested URLs
3. Create `Active_Used_In_Final_Sections_v1` tab with 22 URLs used in final sections
4. Add two status columns to the original `Corpus` tab:
   - `ingested_status`: `ingested_in_corpus` | `not_ingested`
   - `final_section_use_status`: `used_in_final_sections` | `not_used_in_final_sections`
5. Add a header note explaining the audit

## To Run the Audit Script

1. **Ensure you have credentials set up:**
   - `credentials.json` must exist in `foundation/scripts/sheets/`
   - `token.json` should exist (or will be created on first run)
   - `.env` file must have `SHEET_ID` set

2. **Run the script with two JSON files:**
   ```bash
   cd foundation/scripts/sheets
   node audit_registry.js ingested_urls.json used_in_final_sections_urls.json
   ```

3. **The script will:**
   - Read ingested URLs from `ingested_urls.json`
   - Read used-in-final-sections URLs from `used_in_final_sections_urls.json`
   - Validate that used-in-final-sections is a subset of ingested
   - Connect to Google Sheets
   - Create the three new tabs
   - Update the original tab with two status columns
   - Print a summary

## Expected Output

After running, the Google Sheet will have:

- **Corpus tab**: Original data + `ingested_status` column + `final_section_use_status` column + header note
- **Legacy_Collected_Links_v0 tab**: All 36 original links (unchanged)
- **Active_Ingested_Links_v1 tab**: 29 ingested URLs
- **Active_Used_In_Final_Sections_v1 tab**: 22 URLs used in final sections

## Validation

After running the script, verify:

- ✓ Count of "ingested_in_corpus" links equals 29
- ✓ Count of "used_in_final_sections" links equals 22
- ✓ Legacy tab contains all 36 original links unchanged
- ✓ Active_Ingested_Links_v1 contains exactly 29 URLs
- ✓ Active_Used_In_Final_Sections_v1 contains exactly 22 URLs
- ✓ All URLs in Active_Used_In_Final_Sections_v1 also appear in Active_Ingested_Links_v1 (subset relationship)
- ✓ No URLs appear in tabs without evidence
