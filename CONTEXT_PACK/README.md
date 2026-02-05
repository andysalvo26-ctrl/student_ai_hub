# Context Pack

Compressed context for AI-assisted sessions on the Student AI Hub project.

## Purpose

This pack provides stable context that can be pasted into any AI session (ChatGPT, Claude, Cursor) to maintain continuity without repeating large documents.

## Files

| File | Update Frequency | Tokens |
|------|------------------|--------|
| `CONTEXT.md` | Rarely (project-level) | ~300 |
| `STYLE.md` | Rarely (voice rules) | ~400 |
| `DECISIONS.md` | Each session | ~200 (last 3 entries) |
| `RUNLOG.md` | Each session | ~150 (last entry) |
| `TEMPLATES/*.md` | Rarely | ~200 each |

**Total per session:** ~1,250 tokens (vs ~3,500 for full source files)

## Usage

### Starting a Session

1. Copy contents of `CONTEXT.md` into chat
2. Copy contents of `STYLE.md` into chat
3. Copy last 3 entries from `DECISIONS.md`
4. Copy last entry from `RUNLOG.md`
5. State your goal: "Today I need to [X]"

### During a Session

- Reference TEMPLATES when creating that content type
- Agent marks all drafts as "[DRAFT - Requires Review]"
- Human approves before finalizing

### Ending a Session

1. Update `DECISIONS.md` with any choices made
2. Add new entry to `RUNLOG.md`
3. Move rejected drafts to appropriate `legacy/` folder

## Relationship to Other Files

This pack compresses information from:
- `student_ai_hub_contributions/voice/voice_primer.md`
- `ai_by_smeal_major_system/STYLE_RULES.md`
- `ai_by_smeal_major_system/WITNESS_RULES.md`

For full details, refer to those source files.
