# AI News That Matters — Contributor Workflow System

## Problem

The current model has a "black box" between submission and publication. Contributors don't see edits before publishing, which reduces trust and ownership.

## Goal

Create a transparent workflow where:
1. Contributors submit via Google Form
2. They receive a preview of how their entry will look
3. They approve (or request changes) before publication
4. Approved entries go live on the Wix blog

---

## System Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Google Form    │────▶│  Google Sheet   │────▶│  Apps Script    │
│  (submission)   │     │  (responses)    │     │  (automation)   │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
                                                         │
                        ┌────────────────────────────────┼────────────────────────────────┐
                        │                                │                                │
                        ▼                                ▼                                ▼
              ┌─────────────────┐            ┌─────────────────┐            ┌─────────────────┐
              │  Preview PDF    │            │  Wix CMS Draft  │            │  Email to       │
              │  (generated)    │            │  (private)      │            │  Contributor    │
              └─────────────────┘            └─────────────────┘            └─────────────────┘
                        │                                │
                        └────────────────┬───────────────┘
                                         ▼
                              ┌─────────────────┐
                              │  Contributor    │
                              │  Reviews Draft  │
                              └────────┬────────┘
                                       │
                        ┌──────────────┴──────────────┐
                        ▼                             ▼
              ┌─────────────────┐           ┌─────────────────┐
              │  Approves       │           │  Requests Edit  │
              └────────┬────────┘           └────────┬────────┘
                       │                             │
                       ▼                             ▼
              ┌─────────────────┐           ┌─────────────────┐
              │  Published to   │           │  Loop back to   │
              │  Wix Blog       │           │  review         │
              └─────────────────┘           └─────────────────┘
```

---

## Wix Setup: Blog + Member Roles

### 1. Create the AI News Blog Section

In Wix:
- Add a **Blog** to the site
- Create a category: "AI News That Matters"
- Set blog post template to match entry structure:
  - Title = Headline
  - Custom fields for: Source, What Happened, Why It Matters, What to Watch Next

### 2. Create Member Roles

In Wix Members:
- **Reader** — Default site visitor (no login required)
- **Contributor** — Can view private "My Submissions" page
- **Editor** — Can approve/publish posts (your team)

### 3. Create a Private "Contributor Dashboard" Page

- **Page name:** My Submissions
- **Access:** Members only (Contributor role and above)
- **Content:**
  - List of their submitted entries
  - Status for each: Draft / Under Review / Approved / Published
  - Preview link for each entry
  - Approve/Request Changes buttons (via Wix Velo)

---

## Option A: PDF Preview (Simpler)

### How It Works

1. Contributor submits via Google Form
2. Google Apps Script generates a PDF preview using their content
3. PDF is emailed to contributor with:
   - "Here's how your entry will appear"
   - Link to approve (Google Form or Wix page)
   - Link to request changes
4. Once approved, editor publishes to Wix blog

### Pros
- Simple to build
- No Wix coding required
- PDF is a tangible artifact

### Cons
- Requires manual publish step
- Preview is static (not live on site)

### Implementation

**Google Apps Script (preview generator):**

```javascript
function onFormSubmit(e) {
  const responses = e.namedValues;
  
  const headline = responses['Headline'][0];
  const source = responses['Publication Name'][0];
  const date = responses['Publication Date'][0];
  const whatHappened = responses['What Happened'][0];
  const whyMatters = responses['Why It Matters to Students'][0];
  const whatToWatch = responses['What to Watch Next'][0];
  const email = responses['Penn State Email'][0];
  
  // Create Google Doc from template
  const templateId = 'YOUR_TEMPLATE_DOC_ID';
  const template = DriveApp.getFileById(templateId);
  const copy = template.makeCopy('Preview: ' + headline);
  const doc = DocumentApp.openById(copy.getId());
  const body = doc.getBody();
  
  // Replace placeholders
  body.replaceText('{{HEADLINE}}', headline);
  body.replaceText('{{SOURCE}}', source + ', ' + date);
  body.replaceText('{{WHAT_HAPPENED}}', whatHappened);
  body.replaceText('{{WHY_MATTERS}}', whyMatters);
  body.replaceText('{{WHAT_TO_WATCH}}', whatToWatch);
  
  doc.saveAndClose();
  
  // Convert to PDF
  const pdf = DriveApp.getFileById(copy.getId()).getAs('application/pdf');
  
  // Email to contributor
  GmailApp.sendEmail(email, 
    'Your AI News Entry Preview — Please Review',
    'Please review the attached preview of your submission.\n\n' +
    'If it looks correct, reply APPROVE.\n' +
    'If you want changes, reply with your requested edits.',
    {
      attachments: [pdf],
      name: 'Student AI Hub'
    }
  );
  
  // Clean up (optional: delete the temp doc)
  // DriveApp.getFileById(copy.getId()).setTrashed(true);
}
```

**Google Doc Template:**

Create a Google Doc with placeholders:

```
AI News That Matters — Preview

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Headline
{{HEADLINE}}

Source
{{SOURCE}}

What Happened
{{WHAT_HAPPENED}}

Why It Matters to Students
{{WHY_MATTERS}}

What to Watch Next
{{WHAT_TO_WATCH}}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This is a preview of how your entry will appear on the Student AI Hub.
If approved, it will be published to: ajs10845.wixsite.com/student-ai-hub-1/ai-news-that-matters
```

---

## Option B: Wix CMS + Velo (More Integrated)

### How It Works

1. Contributor submits via Google Form
2. Google Apps Script creates a draft entry in Wix CMS via API
3. Contributor logs into Wix (as Contributor role)
4. They view their submission on a private "My Submissions" page
5. They click "Approve" or "Request Changes"
6. Approved entries are published by editor (or auto-published)

### Pros
- Fully integrated with Wix
- Contributors see exactly how it looks on the site
- Scalable for many contributors

### Cons
- Requires Wix Velo (custom code)
- Wix API setup is more complex
- Contributors need Wix accounts

### Implementation Overview

**1. Wix CMS Collection: "AI News Submissions"**

| Field | Type | Notes |
|-------|------|-------|
| headline | Text | |
| source | Text | Publication name |
| sourceDate | Date | |
| sourceUrl | URL | |
| whatHappened | Rich Text | |
| whyMatters | Rich Text | |
| whatToWatch | Rich Text | |
| contributorEmail | Text | |
| status | Text | Draft / Under Review / Approved / Published |
| submittedAt | Date | |

**2. Wix Velo: API to Create Draft**

In Wix, create an HTTP function that Google Apps Script can call:

```javascript
// backend/http-functions.js

import wixData from 'wix-data';

export function post_submitEntry(request) {
  return request.body.json()
    .then((body) => {
      const entry = {
        headline: body.headline,
        source: body.source,
        sourceDate: new Date(body.date),
        sourceUrl: body.url,
        whatHappened: body.whatHappened,
        whyMatters: body.whyMatters,
        whatToWatch: body.whatToWatch,
        contributorEmail: body.email,
        status: 'Draft',
        submittedAt: new Date()
      };
      
      return wixData.insert('AINewsSubmissions', entry);
    })
    .then((result) => {
      return {
        status: 200,
        body: { id: result._id, status: 'Draft created' }
      };
    });
}
```

**3. Google Apps Script: Call Wix API**

```javascript
function onFormSubmit(e) {
  const responses = e.namedValues;
  
  const payload = {
    headline: responses['Headline'][0],
    source: responses['Publication Name'][0],
    date: responses['Publication Date'][0],
    url: responses['Article URL'][0],
    whatHappened: responses['What Happened'][0],
    whyMatters: responses['Why It Matters to Students'][0],
    whatToWatch: responses['What to Watch Next'][0],
    email: responses['Penn State Email'][0]
  };
  
  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload)
  };
  
  const response = UrlFetchApp.fetch(
    'https://YOUR-SITE.wixsite.com/_functions/submitEntry',
    options
  );
  
  Logger.log(response.getContentText());
}
```

**4. Wix Page: "My Submissions" (Contributor Dashboard)**

Create a Members-only page with a repeater showing the contributor's submissions:

```javascript
// Page code

import wixUsers from 'wix-users';
import wixData from 'wix-data';

$w.onReady(function () {
  const user = wixUsers.currentUser;
  const email = user.getEmail();
  
  wixData.query('AINewsSubmissions')
    .eq('contributorEmail', email)
    .descending('submittedAt')
    .find()
    .then((results) => {
      $w('#submissionsRepeater').data = results.items;
    });
});
```

---

## Recommendation

| Approach | Best For | Effort |
|----------|----------|--------|
| **Option A: PDF Preview** | Quick launch, small contributor base | Low (1–2 hours) |
| **Option B: Wix CMS + Velo** | Scalable, integrated experience | Medium (4–8 hours) |

**Start with Option A** to validate the workflow. If it works well and you want to scale, migrate to Option B.

---

## Next Steps

1. [ ] Decide: Option A (PDF) or Option B (Wix CMS)?
2. [ ] If A: Create Google Doc template, set up Apps Script
3. [ ] If B: Create Wix CMS collection, set up Velo HTTP function
4. [ ] Create contributor role in Wix Members
5. [ ] Build "My Submissions" page (if Option B)
6. [ ] Test end-to-end with a sample submission
7. [ ] Document the workflow for contributors

---

## Files in This Folder

| File | Purpose |
|------|---------|
| `ai_news_contribution_guide.pdf` | The guide contributors read before submitting |
| `google_form_spec.md` | Specification for building the Google Form |
| `contributor_workflow_spec.md` | This document — the full system design |
