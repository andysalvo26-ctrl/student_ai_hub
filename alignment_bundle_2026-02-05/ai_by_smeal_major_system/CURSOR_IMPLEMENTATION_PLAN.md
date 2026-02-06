# Cursor Implementation Plan: Maximal System

## Overview

This plan describes how to implement the maximal system using Cursor's tools and capabilities. The maximal system enhances the MVS with automation, QA checks, and better workflow management.

## System Architecture

### Components

1. **Prompt Templates**: Repo-resident prompts for consistent generation
2. **Canon Extraction Scripts**: Organize and validate PackA/PackB content
3. **QA Check Scripts**: Automated style and compliance validation
4. **Scaffold Generator**: Create folder structure and section stubs for new majors
5. **Citation Tracker**: Maintain provenance and source references
6. **State Manager**: Track section states (draft → reviewed → rewritten → approved)

## Implementation Steps

### Phase 1: Foundation Setup

#### 1.1 Create System Directory Structure

```
ai_by_smeal_major_system/
├── prompts/
│   ├── section_generation_prompt.md
│   ├── section_revision_prompt.md
│   └── approval_prompt.md
├── scripts/
│   ├── extract_canon.py
│   ├── qa_check.py
│   ├── scaffold_major.py
│   └── track_citations.py
├── templates/
│   ├── section_template.md
│   └── major_page_template.md
└── workflows/
    └── generation_workflow.md
```

#### 1.2 Create Prompt Templates

**File**: `prompts/section_generation_prompt.md`

Template for generating one section:
```
Generate [SECTION_NAME] for [MAJOR_NAME] major.

Constraints:
- Use PackA for AI concepts (cite specific files)
- Use PackB/[MAJOR_NAME].md for major context
- Follow shell/[SECTION]/README.md structure
- No recommendations, no tools, institutional tone
- Mark output as [DRAFT - Requires Human Review]

Output format:
[DRAFT - Requires Human Review]

[Section content here]

---
Sources referenced:
- PackA: [list files]
- PackB: [major file]
```

**File**: `prompts/section_revision_prompt.md`

Template for requesting revisions:
```
Revise [SECTION_NAME] for [MAJOR_NAME] based on:
- QA check results: [list issues]
- Human feedback: [feedback text]
- Style rules: [specific rules violated]

Maintain canon compliance and institutional tone.
```

### Phase 2: Canon Management

#### 2.1 Canon Extraction Script

**File**: `scripts/extract_canon.py`

**Purpose**: Extract and organize PackA/PackB content for easy reference

**Functionality**:
- Parse PackA pillar files, extract key concepts
- Parse PackB major files, extract focus areas
- Create searchable index of concepts
- Validate canon completeness

**Output**: `canon_index.json` with structured content

**Usage**:
```bash
python scripts/extract_canon.py \
  --packa ai_by_smeal_major/PackA \
  --packb ai_by_smeal_major/PackB \
  --output canon_index.json
```

#### 2.2 Citation Tracker

**File**: `scripts/track_citations.py`

**Purpose**: Track which PackA/PackB sources are referenced in each section

**Functionality**:
- Extract citations from generated sections
- Verify citations point to valid PackA/PackB files
- Generate citation report per section
- Flag unsupported claims

**Output**: `citations/[MAJOR]_[SECTION]_citations.json`

**Usage**:
```bash
python scripts/track_citations.py \
  --section drafts/finance_where_ai_appears_draft.md \
  --packa ai_by_smeal_major/PackA \
  --packb ai_by_smeal_major/PackB
```

### Phase 3: QA Automation

#### 3.1 QA Check Script

**File**: `scripts/qa_check.py`

**Purpose**: Automated validation of style, constraints, and compliance

**Checks**:
1. Canon compliance (claims traceable to PackA/PackB)
2. Constraint violations (no tools, no recommendations)
3. Style drift (signposting, comma chains, repetitive endings)
4. Structure compliance (matches shell template)

**Output**: `qa_reports/[MAJOR]_[SECTION]_qa.json`

**Usage**:
```bash
python scripts/qa_check.py \
  --section drafts/finance_where_ai_appears_draft.md \
  --canon-index canon_index.json \
  --output qa_reports/
```

**Output format**:
```json
{
  "section": "finance_where_ai_appears",
  "status": "issues_found",
  "critical": [
    {
      "type": "constraint_violation",
      "issue": "Tool name mentioned: ChatGPT",
      "line": 5,
      "fix": "Replace with 'AI tools'"
    }
  ],
  "important": [
    {
      "type": "style_drift",
      "issue": "Signposting phrase: 'more broadly'",
      "line": 12,
      "fix": "Remove phrase"
    }
  ],
  "minor": []
}
```

### Phase 4: Scaffold Generation

#### 4.1 Scaffold Generator

**File**: `scripts/scaffold_major.py`

**Purpose**: Create folder structure and section stubs for new major

**Functionality**:
- Create major folder: `majors/[MAJOR_NAME]/`
- Create 5 section stub files (one per shell section)
- Initialize state tracking file
- Create citation tracking structure

**Output**: Folder structure with stub files

**Usage**:
```bash
python scripts/scaffold_major.py \
  --major finance \
  --output majors/
```

**Generated structure**:
```
majors/finance/
├── 01_ai_in_finance_draft.md
├── 02_where_ai_appears_draft.md
├── 03_what_ai_is_expected_to_do_draft.md
├── 04_limits_and_misunderstandings_draft.md
├── 05_key_considerations_draft.md
└── state.json
```

### Phase 5: State Management

#### 5.1 State Manager

**File**: `scripts/manage_state.py`

**Purpose**: Track section states and enforce authorship gates

**States**:
- `draft`: AI-generated, not reviewed
- `reviewed`: Human reviewed, not rewritten
- `rewritten`: Human rewritten, not approved
- `approved`: Human approved, final

**Functionality**:
- Update state when human author confirms action
- Block transitions that violate gates
- Generate state report
- Prevent next section generation until current approved

**Usage**:
```bash
python scripts/manage_state.py \
  --major finance \
  --section where_ai_appears \
  --action approve
```

**State file format** (`state.json`):
```json
{
  "major": "finance",
  "sections": {
    "ai_in_finance": {
      "state": "approved",
      "approved_at": "2026-01-28T10:30:00Z",
      "approved_by": "human_author"
    },
    "where_ai_appears": {
      "state": "rewritten",
      "rewritten_at": "2026-01-28T10:25:00Z"
    }
  }
}
```

### Phase 6: Workflow Integration

#### 6.1 Generation Workflow

**File**: `workflows/generation_workflow.md`

**Step-by-step process**:
1. Run scaffold generator for new major
2. Load prompt template for section
3. Generate section using Cursor AI
4. Run QA checks automatically
5. Display QA results to human
6. Human reviews and rewrites
7. Human updates state to "rewritten"
8. Run QA checks again
9. Human approves if ready
10. Update state to "approved"
11. Generate next section (if current approved)

#### 6.2 Cursor AI Integration

**Using Cursor Composer**:
- Load prompt templates as context
- Reference canon index for PackA/PackB content
- Use QA results to guide revisions
- Track state transitions

**Cursor Rules File** (`.cursorrules`):
```
# AI by Smeal Major Generation Rules

- Always use PackA/PackB as source of truth
- Never mention specific tools or platforms
- Never provide recommendations or advice
- Maintain institutional, descriptive tone
- Mark all output as DRAFT until human approved
- Follow section generation loop workflow
- Check QA results before marking as complete
```

## File Organization

### Directory Structure

```
ai_by_smeal_major_system/
├── prompts/           # Prompt templates
├── scripts/           # Python automation scripts
├── templates/         # Markdown templates
├── workflows/         # Workflow documentation
├── canon_index.json   # Extracted canon content
├── majors/            # Generated major pages
│   └── [major_name]/
│       ├── sections/
│       ├── citations/
│       └── state.json
└── qa_reports/        # QA check results
```

## Usage Example

### Generate Finance Major Page

```bash
# 1. Scaffold
python scripts/scaffold_major.py --major finance

# 2. Generate Section 1
# (Use Cursor with prompt template)
# Output: majors/finance/01_ai_in_finance_draft.md

# 3. QA Check
python scripts/qa_check.py \
  --section majors/finance/01_ai_in_finance_draft.md

# 4. Human reviews QA report, rewrites section

# 5. Update state
python scripts/manage_state.py \
  --major finance \
  --section ai_in_finance \
  --action rewritten

# 6. QA Check again
python scripts/qa_check.py \
  --section majors/finance/01_ai_in_finance_rewritten.md

# 7. Human approves
python scripts/manage_state.py \
  --major finance \
  --section ai_in_finance \
  --action approve

# 8. Repeat for next section...
```

## Benefits Over MVS

1. **Automated QA**: Catches issues before human review
2. **State Tracking**: Enforces authorship gates automatically
3. **Citation Management**: Tracks sources automatically
4. **Consistency**: Prompt templates ensure uniform generation
5. **Scalability**: Easy to generate multiple majors
6. **Traceability**: Full audit trail of generation process

## Implementation Priority

**Phase 1 (Essential)**:
- Prompt templates
- Basic QA check script
- State management

**Phase 2 (Useful)**:
- Canon extraction
- Citation tracking
- Scaffold generator

**Phase 3 (Nice to Have)**:
- Advanced QA checks
- Workflow automation
- Reporting and analytics

## Maintenance

**Regular tasks**:
- Update prompt templates based on learnings
- Refine QA checks based on common issues
- Update canon index when PackA/PackB changes
- Review and improve state management

**Version control**:
- Track prompt template versions
- Version QA check rules
- Document changes to workflow

## Summary

The maximal system uses Cursor's capabilities to:
1. **Automate QA** - Catch issues early
2. **Track state** - Enforce authorship gates
3. **Manage canon** - Organize PackA/PackB content
4. **Generate scaffolds** - Quick setup for new majors
5. **Track citations** - Maintain provenance

This enhances the MVS while preserving human authorship and control.
