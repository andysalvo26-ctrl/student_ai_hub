# Home Page Development Prompt

## Task

Develop the home page for the Student AI Hub reference site. The home page should:

1. Provide a clear introduction to the Student AI Hub
2. Display the five reference sections with brief descriptions
3. Include links to additional resources (if any)
4. Maintain plain, institutional tone

## Content Integration

### Introduction

Replace the placeholder in the intro section with content from:
- `foundation/FOUNDATION_OVERVIEW.md`
- `foundation/docs/00_briefing_packet/01_overview/FOUNDATION_BRIEFING.md`

Use only factual statements that exist in these documents. Do not add new claims.

### Reference Sections

Populate the five sections from `foundation/content/sections/`:
- AI Basics
- Using AI for School and Work
- How Businesses Are Using AI
- AI Tools You Might Use
- Rules, Risks, and Ethics of AI

For each section:
- Extract a brief description (1-2 sentences)
- Link to the full section content (PDF or markdown)
- Maintain neutral, descriptive language

### Additional Resources

Populate from foundation documentation if applicable:
- Links to process documentation
- Links to audit materials
- Links to registry information

Only include resources that exist in the foundation repository.

## Styling Guidelines

- Clean, readable layout
- Institutional color scheme (blues, grays)
- Responsive design for mobile and desktop
- Accessible contrast ratios
- No decorative elements that distract from content

## Technical Requirements

- Update `src/content.json` with actual content
- Update `src/links.json` with actual links
- Rebuild `dist/home.html` as self-contained version
- Test rendering in both modular and self-contained versions
