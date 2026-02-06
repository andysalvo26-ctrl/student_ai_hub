# System Overview: AI by Smeal Major Drafting System

## What We're Building

A repeatable, authorship-preserving workflow for generating "AI by Smeal Major" pages section-by-section. The system enables efficient drafting while ensuring human authors maintain control at the moment of commitment.

## Core Principles

1. **Human authorship is preserved**: The human author makes all final decisions and owns all published content.
2. **AI supports, doesn't replace**: AI assists with drafting, clarity, and connecting ideas from canonical sources.
3. **Section-by-section authority transfer**: Each section requires explicit human review and rewrite before proceeding.
4. **No silent finalization**: Drafts remain clearly marked as drafts until human author explicitly commits.
5. **Canon-constrained**: All content must derive from PackA (AI concepts) and PackB (major descriptions).

## System Components

- **PackA**: Canonical AI content (pillars, modules, authority boundaries)
- **PackB**: Descriptive information about Smeal undergraduate majors
- **Shell**: Template structure with 5 sections per major
- **UseBoundaryPack**: Behavioral constraints for AI assistance
- **This System**: Workflow, style rules, QA checks, and implementation guidance

## How It's Used

### Minimum Viable System (MVS)
1. Upload packs to ChatGPT/Copilot in specified order
2. Issue command: "Generate Finance — Where AI Appears"
3. Review draft section
4. Rewrite/edit as needed
5. Explicitly approve before moving to next section
6. Repeat for all 5 sections

### Maximal System (Cursor-Enhanced)
- Repo-resident prompts and templates
- Automated style checks
- Canon citation tracking
- Scaffold generation for new majors
- QA validation before human review

## Output Structure

Each major page contains exactly 5 sections:
1. **AI in [Major Name]**: Brief overview of how AI relates to the major
2. **Where AI Appears**: Specific contexts, courses, or areas where students encounter AI
3. **What AI Is Expected to Do**: Role and capabilities of AI tools in the major context
4. **Limits and Misunderstandings**: Common misconceptions and important limitations
5. **Key Considerations**: Important points about AI use, academic integrity, professional expectations

## Authority Model

- **PackA + PackB**: Source of truth for factual claims
- **UseBoundaryPack**: Defines what AI can and cannot do
- **Human Author**: Makes all content decisions, final wording, publication authority
- **AI Assistant**: Supports drafting, suggests connections, helps with clarity

## Success Criteria

- Human author can generate a complete major page in 30-60 minutes
- Each section clearly marked as draft until human approval
- All content traceable to PackA/PackB sources
- Style consistent with institutional tone
- No unsupported claims or recommendations
- Human author feels ownership and control throughout
