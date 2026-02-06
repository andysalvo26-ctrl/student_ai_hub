# Inputs and Pack Order

## Required Materials

Before starting, gather these folders/files:

1. **PackA** (`ai_by_smeal_major/PackA/`)
2. **PackB** (`ai_by_smeal_major/PackB/`)
3. **Shell** (`ai_by_smeal_major/shell/`)
4. **UseBoundaryPack** (`ai_by_smeal_major/UseBoundaryPack/`)

## Upload Order (Critical)

Upload materials in this exact order to establish context and constraints:

### Step 1: Authority and Boundaries (Foundation)
Upload **UseBoundaryPack** folder first:
- `README.md`
- `INTENT_AND_SCOPE.md`
- `ASSISTANT_BEHAVIOR_RULES.md`

**Why first**: Establishes behavioral constraints before AI sees any content. Sets the "rules of engagement."

### Step 2: Canonical AI Content (PackA)
Upload **PackA** folder:
- `01_authority_and_pillars/` (all files)
  - `AUTHORITY_BOUNDARIES.md`
  - `SCOPE.md`
  - `PROVENANCE.md`
  - `CITATION_AND_REFERENCE_RULES.md`
  - `PILLAR_AI_BASICS.md`
  - `PILLAR_AI_TOOLS_YOU_MIGHT_USE.md`
  - `PILLAR_HOW_BUSINESSES_USE_AI.md`
  - `PILLAR_RULES_RISKS_AND_ETHICS.md`
  - `PILLAR_USING_AI_FOR_SCHOOL_AND_WORK.md`
- `02_modules/` (all files)
  - `GLOSSARY.md`
  - `FAQ_STUDENTS.md`
  - `FAQ_BUSINESS_CONTEXT.md`
  - `DECISION_CHECKLIST.md`
  - `RISK_CHECKLIST.md`
- `03_site_guidance_optional/` (optional, but recommended)
  - `PAGE_COMPOSITION_GUIDE.md`
  - `HUMAN_AUTHORED_PAGES_BOUNDARY.md`

**Why second**: Provides canonical AI concepts and limitations. This is what AI can reference for factual claims.

### Step 3: Major Descriptions (PackB)
Upload **PackB** folder:
- `Bundle1/`
  - `SCOPE.md`
  - `PROVENANCE.md`
- `MajorBundle/`
  - `MAJOR_[MAJOR_NAME].md` files (all majors)

**Why third**: Provides descriptive context about each major. This is what AI uses to understand disciplinary focus.

### Step 4: Template Structure (Shell)
Upload **Shell** folder:
- `01_ai_in_major/README.md`
- `02_where_ai_appears/README.md`
- `03_what_ai_is_expected_to_do/README.md`
- `04_limits_and_misunderstandings/README.md`
- `05_key_considerations/README.md`

**Why last**: Provides the target structure. AI now knows what to generate and how to organize it.

## Why Order Matters

1. **Constraints before content**: UseBoundaryPack prevents AI from overstepping before it sees what it's working with.
2. **Canon before context**: PackA establishes what AI "knows" before PackB provides major-specific context.
3. **Structure last**: Shell provides the target format after AI understands constraints and content.

## Verification Checklist

Before issuing generation commands, verify:
- [ ] UseBoundaryPack uploaded (3 files)
- [ ] PackA uploaded (all pillar files + modules)
- [ ] PackB uploaded (all major description files)
- [ ] Shell uploaded (all 5 section README files)
- [ ] AI acknowledges constraints from UseBoundaryPack
- [ ] AI can reference PackA content when asked
- [ ] AI can reference PackB major descriptions when asked

## Common Mistakes

- **Uploading Shell first**: AI may generate structure without understanding constraints
- **Skipping UseBoundaryPack**: AI may provide recommendations or advice
- **Partial PackA upload**: Missing pillars means incomplete canonical knowledge
- **Wrong PackB major**: Ensure correct major file is accessible

## Alternative: Single Upload

If your platform supports it, you can upload all folders at once, but ensure UseBoundaryPack is explicitly referenced first in your initial prompt.
