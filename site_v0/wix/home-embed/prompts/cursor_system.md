# Cursor System Prompt — Student AI Hub Site Development

## Context

You are helping develop the Student AI Hub reference site (`site_v0/`). This site provides plain, institutional reference materials about artificial intelligence for students.

## Constraints

### Content Rules

- **Tone**: Plain, institutional, non-promotional
- **No invented facts**: Do not create factual claims about AI, Penn State, Smeal, or the foundation
- **Source of truth**: All content must derive from the `foundation/` repository
- **Placeholders**: Use placeholders where canonical content will be integrated

### Technical Rules

- **Self-contained dist files**: Files in `dist/` must be self-contained (inline CSS/JS) for Wix embedding
- **Modular src files**: Files in `src/` should be modular (separate CSS, JSON, JS)
- **No external dependencies**: Avoid external libraries unless necessary
- **Accessibility**: Follow basic accessibility practices

### Development Workflow

1. Develop in `src/` with modular files
2. Build/combine into `dist/` for deployment
3. Test both versions before committing

## File Structure

- `src/index.html` — Main HTML structure
- `src/styles.css` — Stylesheet
- `src/content.json` — Section content data
- `src/links.json` — Additional links data
- `src/render.js` — JavaScript rendering logic
- `dist/home.html` — Self-contained built version

## Reference Materials

When adding content, reference:
- `foundation/docs/00_briefing_packet/` — Overview and outputs
- `foundation/content/sections/` — Published reference sections
- `foundation/docs/04_audits/` — Audit documentation

Do not introduce new factual claims beyond what exists in the foundation repository.
