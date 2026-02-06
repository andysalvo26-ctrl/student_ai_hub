# QA Checks: Automated and Manual Validation

## Purpose

Quality assurance checks ensure generated content meets system requirements before human review and after human rewrite. These checks catch common issues early and prevent problems from reaching publication.

## Automated Checks (Cursor Implementation)

### 1. Canon Compliance Check

**What it checks**:
- All factual claims traceable to PackA or PackB
- No unsupported statistics or facts
- No invented content

**How it works**:
- Extract factual claims from draft
- Check against PackA/PackB content (keyword/semantic matching)
- Flag claims without clear source

**Output**: List of unsupported claims requiring human review

### 2. Constraint Violation Check

**What it checks**:
- No tool/platform names (ChatGPT, Copilot, etc.)
- No recommendations ("students should," "it's recommended")
- No prescriptive language
- No advice or "best practices"

**How it works**:
- Pattern matching for prohibited phrases
- Check against blacklist of tool names
- Flag prescriptive language patterns

**Output**: List of constraint violations requiring removal

### 3. Style Drift Check

**What it checks**:
- Signposting phrases ("more broadly," "it's important to note")
- Comma chains (sentences with 3+ clauses)
- Repetitive paragraph endings
- Meta-commentary ("this section will discuss")

**How it works**:
- Pattern matching for signposting phrases
- Sentence complexity analysis (comma count, clause count)
- Paragraph ending pattern detection
- Meta-commentary phrase detection

**Output**: List of style issues requiring revision

### 4. Structure Compliance Check

**What it checks**:
- Section matches shell template structure
- Appropriate paragraph count (2-4 per section typical)
- Section purpose aligns with shell definition

**How it works**:
- Compare section content to shell README for that section
- Count paragraphs and sentences
- Verify section addresses its stated purpose

**Output**: Warnings if structure deviates significantly

### 5. Citation Traceability Check

**What it checks**:
- PackA/PackB sources cited where appropriate
- Provenance information present
- Source URLs traceable

**How it works**:
- Extract citations and references
- Verify they point to valid PackA/PackB files
- Check citation format consistency

**Output**: List of citation issues or missing citations

## Manual Checks (Human Author)

### 1. Content Accuracy Review

**Check**:
- Does content accurately reflect PackA concepts?
- Does it appropriately connect to PackB major description?
- Are connections logical and well-supported?

**Action**: Revise if inaccurate or poorly connected.

### 2. Tone and Voice Review

**Check**:
- Does it sound institutional and professional?
- Does it avoid AI voice artifacts?
- Does it read like human-authored content?

**Action**: Rewrite sections that sound AI-generated.

### 3. Completeness Review

**Check**:
- Does section address its purpose (per shell definition)?
- Are important points covered?
- Are there obvious gaps?

**Action**: Add missing content or note intentional gaps.

### 4. Flow and Readability Review

**Check**:
- Do paragraphs flow logically?
- Is sentence structure varied?
- Is it easy to read and understand?

**Action**: Restructure for better flow.

### 5. Authority and Ownership Review

**Check**:
- Do I feel ownership of this content?
- Does it reflect my judgment and expertise?
- Am I comfortable publishing this?

**Action**: Continue revising until ownership feels clear.

## QA Workflow

### After AI Generation (Draft Stage)

1. **Run automated checks** (if using Cursor system)
2. **Review automated check output**
3. **Fix obvious violations** (tool names, recommendations)
4. **Note issues for human rewrite**
5. **Proceed to human review**

### After Human Rewrite (Pre-Approval Stage)

1. **Run automated checks again**
2. **Perform manual checks**
3. **Verify all issues resolved**
4. **Confirm authorship feels clear**
5. **Approve if ready, or revise further**

### Before Publication (Final Stage)

1. **Final automated check pass**
2. **Final manual review**
3. **Verify all sections complete**
4. **Check cross-section consistency**
5. **Confirm ready for publication**

## Check Severity Levels

### Critical (Must Fix)
- Unsupported factual claims
- Tool/platform names mentioned
- Recommendations or advice provided
- Prescriptive language

### Important (Should Fix)
- Signposting phrases
- Comma chains
- Repetitive paragraph endings
- Meta-commentary

### Minor (Consider Fixing)
- Paragraph length variation
- Sentence structure variety
- Transition smoothness

## QA Checklist Template

For each section, complete this checklist:

**Automated Checks**:
- [ ] No unsupported claims flagged
- [ ] No constraint violations flagged
- [ ] No style drift issues flagged
- [ ] Structure matches shell template
- [ ] Citations traceable

**Manual Checks**:
- [ ] Content accurately reflects PackA/PackB
- [ ] Tone is institutional and professional
- [ ] Section addresses its purpose
- [ ] Flow and readability are good
- [ ] I feel ownership of this content

**Approval**:
- [ ] All critical issues resolved
- [ ] All important issues addressed
- [ ] Ready to approve and proceed

## Implementation Notes

### For MVS (ChatGPT/Copilot)
- Manual checks only
- Human author runs through checklist
- No automated tooling

### For Maximal System (Cursor)
- Automated checks run via script
- Results displayed before human review
- Human author addresses flagged issues
- System tracks check status per section

## Continuous Improvement

**Track common issues**:
- Which violations appear most often?
- Which sections need most revision?
- What patterns emerge across majors?

**Refine checks**:
- Update pattern matching based on findings
- Add new checks as issues discovered
- Improve false positive rate

**Share learnings**:
- Document common issues and fixes
- Update style rules based on QA findings
- Improve system based on experience

## Summary

QA checks ensure:
1. **Canon compliance** - All claims supported
2. **Constraint adherence** - No violations
3. **Style consistency** - No drift
4. **Structure alignment** - Matches template
5. **Human ownership** - Author feels control

Automated checks catch obvious issues early. Manual checks ensure quality and ownership. Together, they prevent problems from reaching publication.
