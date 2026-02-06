# Next Actions: Implementing the System

## Immediate Next Steps

### 1. Test Minimum Viable System (MVS)
**Action**: Run the MVS workflow with one major (e.g., Finance)
- [ ] Upload packs to ChatGPT/Copilot in correct order
- [ ] Generate Section 1: "Generate Finance — AI in Finance"
- [ ] Review draft, rewrite, approve
- [ ] Generate Section 2: "Generate Finance — Where AI Appears"
- [ ] Complete all 5 sections
- [ ] Document any issues or improvements needed

**Time estimate**: 1-2 hours
**Outcome**: Validated workflow, identified pain points

### 2. Refine Style Rules Based on PDF Examples
**Action**: If PDF with completed examples becomes available
- [ ] Extract style patterns from Accounting example
- [ ] Extract style patterns from Actuarial Science example
- [ ] Extract style patterns from Corporate Innovation & Entrepreneurship example
- [ ] Update `STYLE_RULES.md` with specific patterns found
- [ ] Add examples of good vs. bad writing from PDF

**Time estimate**: 1 hour
**Outcome**: More precise style rules

### 3. Create Prompt Templates (For MVS)
**Action**: Create reusable prompt templates for ChatGPT/Copilot
- [ ] Create `prompts/section_generation_prompt.md` template
- [ ] Create `prompts/section_revision_prompt.md` template
- [ ] Test templates with one section generation
- [ ] Refine based on results

**Time estimate**: 30 minutes
**Outcome**: Faster, more consistent generation

## Short-Term Implementation (Maximal System)

### 4. Implement Basic QA Check Script
**Action**: Create Python script for automated QA checks
- [ ] Create `scripts/qa_check.py` with constraint violation checks
- [ ] Add style drift detection (signposting, comma chains)
- [ ] Test on sample generated sections
- [ ] Integrate into workflow

**Time estimate**: 2-3 hours
**Outcome**: Automated detection of common issues

### 5. Implement State Management
**Action**: Create system to track section states
- [ ] Create `scripts/manage_state.py`
- [ ] Define state file format (`state.json`)
- [ ] Implement state transitions (draft → reviewed → rewritten → approved)
- [ ] Add blocking logic (can't proceed without approval)

**Time estimate**: 2 hours
**Outcome**: Enforced authorship gates

### 6. Create Scaffold Generator
**Action**: Script to set up new major folder structure
- [ ] Create `scripts/scaffold_major.py`
- [ ] Generate folder structure with section stubs
- [ ] Initialize state tracking file
- [ ] Test with new major

**Time estimate**: 1 hour
**Outcome**: Quick setup for new majors

## Medium-Term Enhancements

### 7. Implement Canon Extraction
**Action**: Create script to extract and index PackA/PackB content
- [ ] Create `scripts/extract_canon.py`
- [ ] Parse PackA pillar files, extract key concepts
- [ ] Parse PackB major files, extract focus areas
- [ ] Create searchable index (`canon_index.json`)
- [ ] Use index for QA compliance checking

**Time estimate**: 3-4 hours
**Outcome**: Automated canon compliance validation

### 8. Implement Citation Tracking
**Action**: Track which PackA/PackB sources are referenced
- [ ] Create `scripts/track_citations.py`
- [ ] Extract citations from generated sections
- [ ] Verify citations point to valid PackA/PackB files
- [ ] Generate citation reports
- [ ] Flag unsupported claims

**Time estimate**: 2-3 hours
**Outcome**: Full provenance tracking

### 9. Create Cursor Rules File
**Action**: Define `.cursorrules` for consistent AI behavior
- [ ] Create `.cursorrules` in repo root
- [ ] Define rules based on UseBoundaryPack constraints
- [ ] Add style rules
- [ ] Test with Cursor Composer

**Time estimate**: 30 minutes
**Outcome**: Consistent AI behavior in Cursor

## Long-Term Improvements

### 10. Build Workflow Dashboard
**Action**: Create visual dashboard for tracking progress
- [ ] Track major completion status
- [ ] Show section states
- [ ] Display QA check results
- [ ] Generate progress reports

**Time estimate**: 4-6 hours
**Outcome**: Better visibility into workflow

### 11. Implement Advanced QA Checks
**Action**: Enhance QA with more sophisticated checks
- [ ] Semantic similarity checking (claims vs. canon)
- [ ] Paragraph ending pattern detection
- [ ] Sentence complexity analysis
- [ ] Cross-section consistency checking

**Time estimate**: 4-6 hours
**Outcome**: More comprehensive quality assurance

### 12. Create Reporting System
**Action**: Generate reports on system usage and quality
- [ ] Track common QA issues across majors
- [ ] Measure time per section
- [ ] Identify style patterns that need refinement
- [ ] Generate usage statistics

**Time estimate**: 3-4 hours
**Outcome**: Data-driven system improvement

## Validation and Testing

### 13. Generate Test Major Pages
**Action**: Use system to generate 2-3 complete major pages
- [ ] Finance (test case)
- [ ] Accounting (test case)
- [ ] Marketing (test case)
- [ ] Compare quality and consistency
- [ ] Document learnings

**Time estimate**: 4-6 hours
**Outcome**: Validated system, refined workflow

### 14. Create User Guide
**Action**: Write comprehensive guide for human authors
- [ ] Step-by-step instructions
- [ ] Common issues and solutions
- [ ] Best practices
- [ ] Troubleshooting guide

**Time estimate**: 2-3 hours
**Outcome**: Easy-to-use system documentation

## Priority Order

**Phase 1 (Essential - Do First)**:
1. Test MVS workflow
2. Create prompt templates
3. Implement basic QA checks
4. Implement state management

**Phase 2 (Useful - Do Next)**:
5. Create scaffold generator
6. Implement canon extraction
7. Implement citation tracking
8. Create Cursor rules file

**Phase 3 (Enhancements - Do Later)**:
9. Build workflow dashboard
10. Implement advanced QA checks
11. Create reporting system
12. Generate test major pages
13. Create user guide

## Success Metrics

**MVS Success**:
- Human author can generate complete major page in 30-60 minutes
- All sections meet quality standards
- Human author feels ownership and control

**Maximal System Success**:
- QA checks catch 80%+ of issues before human review
- State management prevents unauthorized transitions
- Citation tracking provides full provenance
- System scales to all 10 majors

## Notes

- Start with MVS to validate core workflow
- Add automation incrementally based on pain points
- Keep system simple and human-usable
- Document learnings and refine based on experience
- Focus on preserving authorship, not replacing it
