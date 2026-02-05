# AI News That Matters — Submission Form Specification

Use this specification to build the Google Form. Copy field names, descriptions, and validation rules exactly.

---

## Form Title

**AI News That Matters — Submission Form**

## Form Description

Submit an entry for the "AI News That Matters" section of the Student AI Hub. Before submitting, review the contribution guide and sample entry to understand the expected format and tone.

Submissions are reviewed before publication. Entries may be lightly edited for clarity.

---

## Section 1: About You

### Field 1.1: Name
- **Type:** Short answer
- **Required:** Yes
- **Description:** Your full name (for internal tracking; not published without permission)

### Field 1.2: Penn State Email
- **Type:** Short answer
- **Required:** Yes
- **Validation:** Must contain @psu.edu
- **Description:** We'll use this to follow up if needed

### Field 1.3: Major / Program
- **Type:** Short answer
- **Required:** No
- **Description:** Optional — helps us understand who's contributing

### Field 1.4: Year
- **Type:** Dropdown
- **Required:** No
- **Options:**
  - Freshman
  - Sophomore
  - Junior
  - Senior
  - Graduate Student
  - Faculty / Staff
  - Other

---

## Section 2: Source Article

### Field 2.1: Article URL
- **Type:** Short answer
- **Required:** Yes
- **Validation:** Must be a valid URL
- **Description:** Link to the article you're summarizing (must be publicly accessible)

### Field 2.2: Publication Name
- **Type:** Short answer
- **Required:** Yes
- **Description:** e.g., AP News, The Verge, MIT Technology Review

### Field 2.3: Publication Date
- **Type:** Date
- **Required:** Yes
- **Description:** When was the article published?

---

## Section 3: Your Entry

### Field 3.1: Headline
- **Type:** Short answer
- **Required:** Yes
- **Character limit:** 100
- **Description:** A short, descriptive headline that names the development without editorializing

### Field 3.2: What Happened
- **Type:** Paragraph
- **Required:** Yes
- **Description:** 2–4 sentences summarizing the facts. Synthesize rather than list. Tie to business implications where relevant.

### Field 3.3: Why It Matters to Students
- **Type:** Paragraph
- **Required:** Yes
- **Description:** 2–3 sentences explaining relevance to students studying or entering the workforce. Connect to marketing, strategy, operations, or workforce topics.

### Field 3.4: What to Watch Next
- **Type:** Paragraph
- **Required:** Yes
- **Description:** 1–2 sentences acknowledging what is not yet known or what might change.

---

## Section 4: Confirmation

### Field 4.1: AI Assistance Disclosure
- **Type:** Multiple choice
- **Required:** Yes
- **Options:**
  - I wrote this entry without AI assistance
  - I used AI as a drafting assistant and revised the output
  - Other (please specify)
- **Description:** We encourage thoughtful use of AI tools. This is for transparency, not judgment.

### Field 4.2: Course Policy Acknowledgment
- **Type:** Checkbox
- **Required:** Yes
- **Label:** I confirm that this submission follows any applicable course or assignment policies regarding AI use.

### Field 4.3: Permission to Publish
- **Type:** Checkbox
- **Required:** Yes
- **Label:** I give permission for this entry to be published on the Student AI Hub (with light editing if needed).

---

## Form Settings

- **Collect email addresses:** Yes (use Penn State login if possible)
- **Limit to 1 response:** No (allow multiple submissions)
- **Confirmation message:** "Thank you for your submission! We'll review it and follow up if we have questions."
- **Response destination:** Google Sheets (for review workflow)

---

## Recommended: Link in Form Header

Add this text at the top of the form:

> **Before you submit:** Review the [AI News Contribution Guide (PDF)](#) for examples and formatting expectations.

Replace `#` with the actual link to the PDF once hosted.

---

## Quick Build Checklist

- [ ] Create form with title and description
- [ ] Add Section 1: About You (4 fields)
- [ ] Add Section 2: Source Article (3 fields)
- [ ] Add Section 3: Your Entry (4 fields)
- [ ] Add Section 4: Confirmation (3 fields)
- [ ] Set required fields and validations
- [ ] Link to Google Sheet for responses
- [ ] Add PDF link in header
- [ ] Test with a sample submission
