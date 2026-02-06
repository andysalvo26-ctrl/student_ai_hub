# Folder Inventory and Map

## Purpose

This document maps the existing folders and files to their roles in the authorship-preserving drafting system.

## Folder Structure

### `ai_by_smeal_major/PackA/`
**Role**: Canonical AI content (source of truth for AI concepts)

**Contents**:
- `01_authority_and_pillars/`: Authority boundaries, scope, provenance, citation rules, and 5 pillar files
  - **Authority/Boundary**: `AUTHORITY_BOUNDARIES.md`, `SCOPE.md`
  - **Canon Content**: `PILLAR_AI_BASICS.md`, `PILLAR_AI_TOOLS_YOU_MIGHT_USE.md`, `PILLAR_HOW_BUSINESSES_USE_AI.md`, `PILLAR_RULES_RISKS_AND_ETHICS.md`, `PILLAR_USING_AI_FOR_SCHOOL_AND_WORK.md`
  - **Workflow**: `CITATION_AND_REFERENCE_RULES.md`
- `02_modules/`: Cross-cutting modules (glossary, FAQs, checklists)
  - **Canon Content**: `GLOSSARY.md`, `FAQ_STUDENTS.md`, `FAQ_BUSINESS_CONTEXT.md`, `DECISION_CHECKLIST.md`, `RISK_CHECKLIST.md`
- `03_site_guidance_optional/`: Site structure and composition guidance
  - **Workflow**: `PAGE_COMPOSITION_GUIDE.md`, `HUMAN_AUTHORED_PAGES_BOUNDARY.md`, `SITE_STRUCTURE_OPTIONS.md`

**Use**: Provides canonical AI concepts, limitations, and foundational content. AI must reference PackA for all factual claims about AI.

### `ai_by_smeal_major/PackB/`
**Role**: Descriptive information about Smeal undergraduate majors (disciplinary context)

**Contents**:
- `Bundle1/`: Scope and provenance for PackB
  - **Authority/Boundary**: `SCOPE.md`, `PROVENANCE.md`
- `MajorBundle/`: Individual major description files
  - **Canon Content**: `MAJOR_ACCOUNTING.md`, `MAJOR_ACTUARIAL_SCIENCE.md`, `MAJOR_CORPORATE_INNOVATION_AND_ENTREPRENEURSHIP.md`, `MAJOR_FINANCE.md`, `MAJOR_MANAGEMENT_INFORMATION_SYSTEMS.md`, `MAJOR_MANAGEMENT.md`, `MAJOR_MARKETING.md`, `MAJOR_REAL_ESTATE.md`, `MAJOR_RISK_MANAGEMENT.md`, `MAJOR_SUPPLY_CHAIN_INFORMATION_SYSTEMS.md`

**Use**: Provides descriptive context about each major's focus, core areas, contexts, and disciplinary emphasis. AI uses PackB to understand how to connect AI concepts to specific majors.

### `ai_by_smeal_major/shell/`
**Role**: Template structure for "AI by Smeal Major" pages (target format)

**Contents**:
- `01_ai_in_major/README.md`: Section 1 template (brief overview)
- `02_where_ai_appears/README.md`: Section 2 template (specific contexts)
- `03_what_ai_is_expected_to_do/README.md`: Section 3 template (AI's role)
- `04_limits_and_misunderstandings/README.md`: Section 4 template (limitations)
- `05_key_considerations/README.md`: Section 5 template (important points)

**Use**: Defines the 5-section structure and purpose of each section. AI uses shell to understand what to generate and how to organize content.

### `ai_by_smeal_major/UseBoundaryPack/`
**Role**: Behavioral constraints for AI assistance (authority/boundary)

**Contents**:
- `README.md`: Explains pack purpose and intended use
- `INTENT_AND_SCOPE.md`: Defines purpose, scope, and exclusions
- `ASSISTANT_BEHAVIOR_RULES.md`: Behavioral constraints for AI

**Use**: Establishes what AI can and cannot do. Prevents AI from providing recommendations, advice, or unsupported claims. Must be uploaded first to set constraints.

### `canonical_pack/`
**Role**: Alternative/original canonical pack structure (may overlap with PackA)

**Contents**:
- Similar structure to PackA but organized differently
- Contains same pillar and module content
- Includes `99_upload_bundles/` for batch upload organization

**Use**: May be used as alternative source for PackA content. Check which version is current/authoritative.

## Document Classification

### Authority/Boundary Documents
- `PackA/01_authority_and_pillars/AUTHORITY_BOUNDARIES.md`
- `PackA/01_authority_and_pillars/SCOPE.md`
- `PackB/Bundle1/SCOPE.md`
- `UseBoundaryPack/INTENT_AND_SCOPE.md`
- `UseBoundaryPack/ASSISTANT_BEHAVIOR_RULES.md`

**Purpose**: Define what can and cannot be done, establish boundaries, prevent overreach.

### Canon Content Documents
- `PackA/01_authority_and_pillars/PILLAR_*.md` (5 files)
- `PackA/02_modules/*.md` (glossary, FAQs, checklists)
- `PackB/MajorBundle/MAJOR_*.md` (10 files)

**Purpose**: Source of truth for factual claims. AI must reference these for all content.

### Workflow Documents
- `PackA/01_authority_and_pillars/CITATION_AND_REFERENCE_RULES.md`
- `PackA/03_site_guidance_optional/PAGE_COMPOSITION_GUIDE.md`
- `shell/*/README.md` (5 files)

**Purpose**: Guide how to use canon content, how to structure pages, how to cite sources.

### Style Witness Documents
- Completed major examples (referenced in PDF, not in repo)
- PackA pillar files (show institutional tone)
- PackB major files (show descriptive, neutral language)

**Purpose**: Demonstrate desired style, tone, and structure. Used to infer style rules.

## Key Relationships

1. **UseBoundaryPack** → Constrains AI behavior before it sees content
2. **PackA** → Provides AI concepts and limitations (canon)
3. **PackB** → Provides major descriptions (canon)
4. **Shell** → Provides target structure (workflow)
5. **System Design** → Provides workflow, style rules, QA checks (this folder)

## Usage Flow

1. Upload UseBoundaryPack (sets constraints)
2. Upload PackA (provides AI canon)
3. Upload PackB (provides major canon)
4. Upload Shell (provides structure)
5. Generate sections using system workflow
6. Human reviews, rewrites, approves
7. Complete page ready for publication

## Notes

- PackA and `canonical_pack/` may overlap; verify which is authoritative
- PDF with completed examples mentioned but not in repo; style rules inferred from structure
- All major files in PackB follow same structure (overview, core focus areas, contexts, disciplinary emphasis)
- Shell provides minimal structure; actual content comes from PackA/PackB connections
