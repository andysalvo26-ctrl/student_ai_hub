# Authorship Gates: Rules Preventing Ambiguity at Commitment

## Core Principle

**Human authorship is preserved at the moment of commitment.** The system must make it impossible for AI to silently finalize content or for humans to accidentally commit unapproved drafts.

## Non-Negotiable Requirements

### 1. Explicit Separation of Exploration vs Judgment vs Commitment

**Exploration Phase**:
- AI generates draft content
- Human reviews and considers options
- Multiple revisions possible
- Content marked as **DRAFT**

**Judgment Phase**:
- Human author evaluates draft
- Human author rewrites/edits
- Human author makes content decisions
- Content remains **DRAFT** until explicit approval

**Commitment Phase**:
- Human author explicitly approves: "Section approved"
- Content marked as **APPROVED** or **FINAL**
- No further AI changes without human request
- Human author takes ownership

**Rule**: Content cannot move from DRAFT to APPROVED without explicit human action.

### 2. No Silent Finalization

**Prohibited behaviors**:
- AI marking content as "final" or "complete"
- System auto-approving after time delay
- Assuming approval from silence
- Proceeding to next section without explicit approval

**Required behaviors**:
- All drafts clearly marked **DRAFT**
- Explicit approval required before proceeding
- Human author must say "approved" or equivalent
- System waits for approval before next section

**Rule**: Silence does not equal approval. Only explicit human statement equals approval.

### 3. Section-by-Section Authority Transfer

**Process**:
1. Generate Section 1 → Human approves Section 1
2. Generate Section 2 → Human approves Section 2
3. (Continue for all 5 sections)

**Why section-by-section**:
- Prevents overwhelming human with full page
- Allows incremental commitment
- Human can stop/revise at any point
- Each section gets full attention

**Rule**: Cannot generate next section until current section explicitly approved.

### 4. Human Rewrite Requirement Prior to Freeze

**Required step**: Human author must rewrite/edit each section before approval.

**Why required**:
- Ensures human voice, not AI voice
- Adds human judgment and expertise
- Removes AI artifacts
- Preserves authorship

**What "rewrite" means**:
- Not just copy-paste
- Not just minor edits
- Substantive human revision
- Human author's own words

**Rule**: No section can be approved without human rewrite pass.

### 5. Handling Uncertainty and Canon Gaps

**When information is missing**:
- AI must ask human author
- AI must not invent content
- AI must not fill gaps with assumptions
- Human author decides how to handle

**When canon doesn't cover topic**:
- AI notes: "This is not covered in PackA/PackB"
- Human author decides: remove, generalize, or note limitation
- Cannot proceed with unsupported claims

**Rule**: Uncertainty requires human decision. AI cannot resolve gaps independently.

## Implementation in MVS (ChatGPT/Copilot)

### Draft Marking
- Every AI-generated section starts with: `[DRAFT - Requires Human Review]`
- Human author removes draft marker only after rewrite and approval

### Approval Protocol
- Human author must type: "Section approved. Ready for next section."
- AI confirms: "Section 1 approved. Ready to generate Section 2."
- AI waits for approval before proceeding

### Rewrite Verification
- Human author confirms: "I have rewritten this section."
- Or: "This section reflects my own words and judgment."
- System tracks rewrite status separately from approval

## Implementation in Maximal System (Cursor)

### File States
- `[MAJOR]_[SECTION]_draft.md` - AI-generated, not reviewed
- `[MAJOR]_[SECTION]_reviewed.md` - Human reviewed, not rewritten
- `[MAJOR]_[SECTION]_rewritten.md` - Human rewritten, not approved
- `[MAJOR]_[SECTION]_approved.md` - Human approved, final

### State Transitions
- `draft` → `reviewed`: Human marks as reviewed
- `reviewed` → `rewritten`: Human confirms rewrite
- `rewritten` → `approved`: Human explicitly approves
- No automatic transitions allowed

### Blocking Behaviors
- Cannot generate next section until current section is `approved`
- Cannot mark as `approved` without `rewritten` state
- Cannot mark as `rewritten` without `reviewed` state
- System enforces state machine

## Authority Model

**AI Authority**:
- Generate drafts based on PackA/PackB
- Suggest connections and clarity improvements
- Support human author's work

**Human Authority**:
- All content decisions
- Final wording
- Approval and commitment
- Publication decisions

**Rule**: AI supports, human decides. Human has final authority at every gate.

## Violation Detection

**Signs of authorship violation**:
- Content marked "final" without human approval
- Next section generated without approval
- No rewrite step before approval
- AI making content decisions independently

**Response to violation**:
- Stop generation immediately
- Return to last approved state
- Require explicit human approval
- Review and reinforce gates

## Summary

The authorship gates ensure:
1. **Explicit separation** of exploration, judgment, commitment
2. **No silent finalization** - only explicit approval counts
3. **Section-by-section** authority transfer
4. **Human rewrite required** before approval
5. **Human decides** on uncertainty and gaps

These gates are non-negotiable and must be enforced at every step.
