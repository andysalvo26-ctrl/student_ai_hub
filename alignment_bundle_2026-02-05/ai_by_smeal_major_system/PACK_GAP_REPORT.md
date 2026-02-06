# Pack Gap Analysis Report

## Analysis Method

For each witness rule from `WITNESS_RULES.md`, this report identifies:
- Whether it's explicitly enforced in existing pack files
- Where it's located (if enforced)
- What needs to be added (if not enforced)

## Gap Analysis by Witness Rule

### 1. Stable Section Structure

**Status**: ✅ Partially Enforced
**Location**: 
- `shell/*/README.md` files define section purposes
- `SECTION_GENERATION_LOOP.md` describes 5-section workflow

**Gap**: 
- No explicit instruction that sections must stand alone
- No prohibition on cross-references

**Fix Needed**: Add to `CHATGPT_STARTER_CONTEXT.md`: "Each section stands alone. No cross-references or transitions between sections."

---

### 2. Paragraph Roles Per Section

**Status**: ❌ Not Enforced
**Location**: None

**Gap**: 
- No guidance on opening/deepening/closing patterns
- No instruction on how sections should end (no summaries)

**Fix Needed**: Add to `CHATGPT_STARTER_CONTEXT.md` and `SECTION_PROMPT_TEMPLATES.md`: Specific paragraph role guidance for each section.

---

### 3. Discourse Framing Rule ("How AI is discussed" vs "What AI does")

**Status**: ⚠️ Implied but Not Explicit
**Location**: 
- `UseBoundaryPack/ASSISTANT_BEHAVIOR_RULES.md` says "use PackB for how majors are described"
- Not explicitly stated as a framing rule

**Gap**: 
- No explicit instruction to frame as "how AI relates" not "what AI does"
- No requirement to anchor every statement in discipline context

**Fix Needed**: Add to `CHATGPT_STARTER_CONTEXT.md`: "Frame all content as 'how AI relates to [major]' not 'what AI does generically'. Every statement must connect to the major's specific concerns."

---

### 4. "Pressure-Before-Technology" Pattern

**Status**: ❌ Not Enforced
**Location**: None

**Gap**: 
- No instruction to start with field problems before technology
- No pattern guidance for section openings

**Fix Needed**: Add to `CHATGPT_STARTER_CONTEXT.md` and `SECTION_PROMPT_TEMPLATES.md`: "Start sections with the discipline's problems/concerns, then connect AI as a response. Not 'AI tools exist, here's how [major] uses them' but '[Major] deals with X, AI appears in contexts addressing X'."

---

### 5. Expectation vs Reality Separation

**Status**: ✅ Enforced
**Location**: 
- `shell/03_what_ai_is_expected_to_do/README.md` defines Section 3
- `shell/04_limits_and_misunderstandings/README.md` defines Section 4

**Gap**: None - structure already separates these

**Fix Needed**: None

---

### 6. Field-Native Limits

**Status**: ⚠️ Partially Enforced
**Location**: 
- `STYLE_RULES.md` mentions limitations but doesn't specify field-native requirement
- `shell/04_limits_and_misunderstandings/README.md` says "common misconceptions" but doesn't specify discipline logic

**Gap**: 
- No instruction that limitations must arise from discipline logic
- No prohibition on generic AI limitations

**Fix Needed**: Add to `CHATGPT_STARTER_CONTEXT.md` and Section 4 prompt: "Limitations must be specific to how [major] uses AI, rooted in discipline logic. Not generic AI problems but field-specific concerns."

---

### 7. "Key Considerations" Reframing Behavior

**Status**: ⚠️ Partially Enforced
**Location**: 
- `shell/05_key_considerations/README.md` defines Section 5
- Doesn't explicitly prohibit summary behavior

**Gap**: 
- No instruction that Section 5 reframes, doesn't summarize
- No pattern for "consideration because discipline-specific reason"

**Fix Needed**: Add to `CHATGPT_STARTER_CONTEXT.md` and Section 5 prompt: "Section 5 reframes important points as considerations, NOT a summary. Pattern: 'In [major], [consideration] matters because [discipline-specific reason]'."

---

### 8. Sentence Discipline

**Status**: ✅ Well Enforced
**Location**: 
- `STYLE_RULES.md` covers sentence rhythm, comma chains, signposting
- `context_bundles/*/STYLE_WITNESS.md` covers these patterns

**Gap**: 
- No explicit instruction on paragraph ending variation
- No explicit "no conclusions" rule

**Fix Needed**: Add to `CHATGPT_STARTER_CONTEXT.md`: "Vary paragraph endings. Do not end sections with summary statements or conclusions."

---

### 9. Major-Specific Anchoring

**Status**: ✅ Enforced
**Location**: 
- `UseBoundaryPack/ASSISTANT_BEHAVIOR_RULES.md` requires PackB usage
- `context_bundles/*/MAJOR_CANON.md` provides major-specific content

**Gap**: None

**Fix Needed**: Reinforce in `CHATGPT_STARTER_CONTEXT.md`: "Every statement must connect to [major]'s canon. No generic statements."

---

### 10. Descriptive, Not Instructional

**Status**: ✅ Well Enforced
**Location**: 
- `UseBoundaryPack/BOUNDARIES.md` explicitly prohibits recommendations
- `UseBoundaryPack/ASSISTANT_BEHAVIOR_RULES.md` prohibits advice
- Multiple files enforce this

**Gap**: None

**Fix Needed**: None

---

## Summary of Gaps

### Critical Gaps (Must Fix)
1. **Paragraph roles per section** - Not documented anywhere
2. **Pressure-before-technology pattern** - Not mentioned
3. **Field-native limits requirement** - Not explicit
4. **Key Considerations reframing** - Not explicit
5. **Section independence** - Not explicitly enforced

### Moderate Gaps (Should Fix)
6. **Discourse framing rule** - Implied but not explicit
7. **Paragraph ending variation** - Mentioned but not emphasized
8. **No conclusions rule** - Not explicit

### Minor Gaps (Nice to Have)
9. **Sentence length guidance** - Covered but could be more specific
10. **Major-specific anchoring** - Covered but could be reinforced

## Files That Need Updates

### New Files to Create
1. `CHATGPT_STARTER_CONTEXT.md` - Single drop-in file with all witness rules
2. `SECTION_PROMPT_TEMPLATES.md` - 4 section-specific prompts

### Files to Update
1. `STYLE_RULES.md` - Add paragraph roles, pressure-before-technology, field-native limits
2. `SECTION_GENERATION_LOOP.md` - Add witness rule references
3. `context_bundles/*/STYLE_WITNESS.md` - Add missing patterns

### Files That Are Sufficient
1. `AUTHORSHIP_GATES.md` - No changes needed
2. `UseBoundaryPack/*.md` - No changes needed (descriptive constraint already there)
3. `QA_CHECKS.md` - Could add witness rule checks but not critical

## Priority Fixes

**High Priority** (Blocks quality output):
- Create `CHATGPT_STARTER_CONTEXT.md` with all witness rules
- Create `SECTION_PROMPT_TEMPLATES.md` with section-specific guidance
- Add pressure-before-technology pattern to all prompts

**Medium Priority** (Improves consistency):
- Update `STYLE_RULES.md` with paragraph roles
- Add field-native limits requirement to Section 4 guidance
- Add reframing requirement to Section 5 guidance

**Low Priority** (Polish):
- Reinforce major-specific anchoring
- Add paragraph ending variation examples
- Add "no conclusions" examples
