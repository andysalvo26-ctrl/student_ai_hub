# Usage Checklist: How to Use Updated Packs in ChatGPT

## Quick Start

Follow these steps in order to draft a new "AI by Smeal Major" page in ChatGPT.

## Step-by-Step Process

### 1. Start Fresh ChatGPT Thread

Open a new ChatGPT conversation. Do not use an existing thread with different context.

### 2. Upload Starter Context

**Drag and drop**: `ai_by_smeal_major_system/CHATGPT_STARTER_CONTEXT.md`

This file sets all the rules, constraints, and style requirements. ChatGPT will read it and understand:
- How to draft sections
- What style to follow
- What constraints to respect
- How to handle the PDF witness

### 3. Attach PDF Witness (Critical)

**Attach**: `AI by Smeal Major.pdf`

**Tell ChatGPT**: "Read the attached PDF. These three completed examples (Accounting, Actuarial Science, Corporate Innovation and Entrepreneurship) are your style witness. Match their patterns exactly."

This ensures ChatGPT reads the PDF directly and uses it as the primary style guide.

### 4. Provide Major Canon

**Option A**: Drag the major's context bundle folder
- Example: `ai_by_smeal_major_context_bundles/finance/`
- ChatGPT can read `MAJOR_CANON.md` from this folder

**Option B**: Provide PackB major file directly
- Example: `ai_by_smeal_major/PackB/MajorBundle/MAJOR_FINANCE.md`

**Tell ChatGPT**: "Use the [MAJOR] canon file as the source of truth for major-specific content. All statements must connect to this canon."

### 5. Provide Shell Structure (Optional but Recommended)

**Drag**: `ai_by_smeal_major/shell/` folder or individual section README files

**Tell ChatGPT**: "These files define the 5-section structure. Follow this structure exactly."

### 6. Draft Section 1: AI in [Major]

**Option A**: Human author writes this section directly (recommended)

**Option B**: If ChatGPT must generate it, use general instructions from `CHATGPT_STARTER_CONTEXT.md`

**After generation**: Human reviews, rewrites, approves before proceeding.

### 7. Draft Section 2: Where AI Appears

**Copy prompt from**: `ai_by_smeal_major_system/SECTION_PROMPT_TEMPLATES.md` (Section 2)

**Replace**: `[MAJOR]` with actual major name (e.g., "Finance")

**Paste into ChatGPT**

**After generation**: 
- ChatGPT should mark output as `[DRAFT - Requires Human Review]`
- Human reviews draft
- Human rewrites section
- Human explicitly approves: "Section approved. Ready for next section."

### 8. Draft Section 3: What AI Is Expected to Do

**Copy prompt from**: `ai_by_smeal_major_system/SECTION_PROMPT_TEMPLATES.md` (Section 3)

**Replace**: `[MAJOR]` with actual major name

**Paste into ChatGPT**

**After generation**: Human reviews, rewrites, approves.

### 9. Draft Section 4: Limits and Common Misunderstandings

**Copy prompt from**: `ai_by_smeal_major_system/SECTION_PROMPT_TEMPLATES.md` (Section 4)

**Replace**: `[MAJOR]` with actual major name

**Paste into ChatGPT**

**After generation**: Human reviews, rewrites, approves.

### 10. Draft Section 5: Key Considerations

**Copy prompt from**: `ai_by_smeal_major_system/SECTION_PROMPT_TEMPLATES.md` (Section 5)

**Replace**: `[MAJOR]` with actual major name

**Paste into ChatGPT**

**After generation**: Human reviews, rewrites, approves.

## File Order Summary

**Upload in this order**:
1. `CHATGPT_STARTER_CONTEXT.md` (sets all rules)
2. `AI by Smeal Major.pdf` (style witness)
3. Major canon (from context bundle or PackB)
4. Shell structure (optional)

**Then use**: Section prompts from `SECTION_PROMPT_TEMPLATES.md` one at a time

## What Changed

### New Files Created
- `WITNESS_RULES.md` - 10 core patterns extracted from PDF examples
- `PACK_GAP_REPORT.md` - Analysis of gaps in existing packs
- `CHATGPT_STARTER_CONTEXT.md` - Single drop-in file with all rules
- `SECTION_PROMPT_TEMPLATES.md` - 4 section-specific prompts

### Files Updated
- `STYLE_RULES.md` - Added paragraph roles, pressure-before-technology pattern, field-native limits, major-specific anchoring

### Key Improvements
- **Pressure-before-technology pattern**: Sections start with field problems, then connect AI
- **Field-native limits**: Limitations must arise from discipline logic, not generic AI problems
- **Key Considerations reframing**: Section 5 reframes, doesn't summarize
- **Section independence**: No cross-references between sections
- **Paragraph roles**: Explicit guidance on opening/deepening/closing patterns
- **PDF self-scan**: ChatGPT instructed to read PDF directly as primary witness

## Quality Checks

Before approving any section, verify:
- [ ] Marked as `[DRAFT - Requires Human Review]`
- [ ] Follows pressure-before-technology pattern
- [ ] Limitations are field-native (if Section 4)
- [ ] Key Considerations reframe, don't summarize (if Section 5)
- [ ] No cross-references to other sections
- [ ] Every statement anchored in major-specific canon
- [ ] No signposting phrases
- [ ] No comma chains
- [ ] Paragraph endings varied
- [ ] Descriptive, not instructional

## Troubleshooting

### ChatGPT ignores PDF witness
**Fix**: Explicitly tell ChatGPT: "Read the attached PDF. These examples are your binding style witness. Match their patterns exactly."

### ChatGPT generates generic content
**Fix**: Remind ChatGPT: "Every statement must connect to [MAJOR]'s specific concerns from the major canon. No generic statements."

### ChatGPT adds cross-references
**Fix**: Remind ChatGPT: "Sections stand alone. No cross-references or 'as we saw' language."

### ChatGPT summarizes in Section 5
**Fix**: Remind ChatGPT: "Section 5 reframes considerations, does NOT summarize previous sections. Pattern: 'In [MAJOR], [consideration] matters because [discipline-specific reason]'."

### ChatGPT uses generic limitations
**Fix**: Remind ChatGPT: "Limitations must be field-native, rooted in [MAJOR]'s discipline logic. Not generic AI problems but field-specific concerns."

## Success Criteria

A section is ready when:
- Human author has reviewed draft
- Human author has rewritten section
- Human author explicitly approves
- Section matches witness examples in style and structure
- All content traces to canon
- No constraint violations

## Time Estimate

- **Setup** (upload files): 2-3 minutes
- **Section 1**: 10-15 minutes (human-written recommended)
- **Sections 2-5**: 8-15 minutes each (generation + review + rewrite + approval)
- **Total**: 50-90 minutes per major page
