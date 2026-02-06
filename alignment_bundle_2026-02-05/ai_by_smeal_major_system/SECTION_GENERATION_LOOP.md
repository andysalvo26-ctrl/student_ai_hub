# Section Generation Loop: Step-by-Step Runbook

## Overview

This is the repeatable workflow for generating one section of an "AI by Smeal Major" page. Repeat this loop 5 times (once per section) to complete a full major page.

## Prerequisites

- All packs uploaded in correct order (see `INPUTS_AND_PACK_ORDER.md`)
- Human author ready to review and rewrite
- Target major selected (e.g., Finance, Accounting, Marketing)

## The Loop: One Section at a Time

### Step 1: Issue Generation Command

**Command format**: `Generate [Major Name] — [Section Name]`

**Examples**:
- `Generate Finance — Where AI Appears`
- `Generate Accounting — AI in Accounting`
- `Generate Marketing — What AI Is Expected to Do`

**What happens**: AI generates a draft section using:
- PackA for AI concepts and limitations
- PackB for major-specific context
- Shell for section structure and purpose
- UseBoundaryPack constraints (no recommendations, institutional tone)

### Step 2: Review Draft Section

**Human author reviews**:
- Does it accurately reflect PackA concepts?
- Does it connect appropriately to PackB major description?
- Is tone institutional and descriptive (not prescriptive)?
- Are there unsupported claims?
- Are there recommendations or advice to students?
- Are specific tools/platforms mentioned (should be removed)?

**Mark clearly**: Draft remains marked as **DRAFT** until Step 4.

### Step 3: Human Rewrite Pass

**Required action**: Human author rewrites the section.

**Why required**: 
- Preserves authorship at moment of commitment
- Ensures institutional voice and accuracy
- Removes any AI artifacts or overreach
- Adds human judgment and expertise

**What to check during rewrite**:
- Remove signposting phrases ("more broadly," "it's important to note")
- Break up comma chains (sentences with multiple clauses)
- Ensure each paragraph has distinct purpose
- Verify all claims traceable to PackA/PackB
- Remove any tool names or vendor mentions
- Ensure neutral, descriptive language

### Step 4: Explicit Approval

**Human author explicitly approves**: "Section approved. Ready for next section."

**Why explicit**: Prevents silent finalization. Makes commitment moment clear.

**What approval means**:
- Content is final for this section
- Human author takes ownership
- Section can be marked as complete
- Ready to proceed to next section

### Step 5: Move to Next Section

**Repeat Steps 1-4** for next section in sequence:
1. AI in [Major Name]
2. Where AI Appears
3. What AI Is Expected to Do
4. Limits and Misunderstandings
5. Key Considerations

## Complete Page Workflow

```
[Start]
  ↓
Generate Section 1 → Review → Rewrite → Approve
  ↓
Generate Section 2 → Review → Rewrite → Approve
  ↓
Generate Section 3 → Review → Rewrite → Approve
  ↓
Generate Section 4 → Review → Rewrite → Approve
  ↓
Generate Section 5 → Review → Rewrite → Approve
  ↓
[Complete Page]
```

## Handling Issues During Loop

### Issue: AI Generated Recommendations
**Action**: Stop. Remind AI of UseBoundaryPack constraints. Request revision without recommendations.

### Issue: Missing Canon Support
**Action**: Ask AI to cite PackA/PackB sources. If no source exists, human author decides: remove claim or note it's not in canon.

### Issue: Wrong Tone or Style
**Action**: Human author rewrites in Step 3. Note style issues for future reference.

### Issue: AI Refuses to Generate
**Action**: Check that all packs are uploaded. Verify UseBoundaryPack constraints aren't preventing generation. Adjust prompt if needed.

## Time Estimates

- **Generation**: 1-2 minutes per section
- **Review**: 2-3 minutes per section
- **Rewrite**: 5-10 minutes per section
- **Approval**: 30 seconds per section

**Total per section**: 8-15 minutes
**Total per page**: 40-75 minutes (5 sections)

## Quality Gates

Before moving to next section, verify:
- [ ] Section approved by human author
- [ ] No unsupported claims
- [ ] No recommendations or advice
- [ ] No tool/platform mentions
- [ ] Institutional tone maintained
- [ ] Content traceable to PackA/PackB
- [ ] Human author feels ownership

## Completion Criteria

A major page is complete when:
- All 5 sections generated
- All 5 sections reviewed
- All 5 sections rewritten by human
- All 5 sections explicitly approved
- Human author ready to publish
