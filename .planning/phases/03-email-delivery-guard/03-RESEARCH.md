# Phase 3: Email Delivery + Guard - Research

**Researched:** 2026-04-09
**Domain:** Google Apps Script — GmailApp, HTML email, PDF attachment naming, duplicate guard
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Email format & tone**
- HTML email — not plain text
- Warm, church-friendly tone (e.g. "We're so excited to have your children at VBS!")
- Do NOT include instructions about what to do with the passes (no "print or show on phone" copy)
- Required body fields (from spec): greeting, registration confirmation, submission ID, list of children, VBS dates/times, church address, and contact info

**Contact info in footer**
- Email: ebethelchurch@gmail.com
- Phone: 9945028989
- Both appear in the email footer

**Duplicate guard**
- Guard mechanism: Status string check only — if Status ≠ "Approved", exit early. No separate dedicated column needed.
- Manual admin reset: if an admin manually sets Status back to "Approved", the handler fires again and sends another email. This is treated as intentional.
- Duplicate detection: silent exit — no Logger.log when guard blocks a duplicate send. This is the normal no-op path.

**Attachment naming**
- Pattern: `VBS2026_Pass_[ChildName].pdf` (e.g. `VBS2026_Pass_Emma.pdf`)
- No age in filename
- Attachment order: same order as children appear in the registration row (no sorting required)

**Failure handling**
- If **email send fails**: set Status = `Error — Email Failed` (visible in sheet) AND Logger.log the error. Do NOT set to "Approved — Email Sent".
- If **any PDF generation fails** (before email is sent): abort the entire operation — send nothing. Set Status = `Error — Email Failed` and Logger.log. No partial sends.
- On success: set Status = `Approved — Email Sent`

### Claude's Discretion
- HTML email layout and styling (colors, spacing, structure) — should match VBS Jungle Safari branding
- Exact Logger.log message format
- How to handle edge case where childName contains characters invalid in a filename (e.g. slash)

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| EMAIL-01 | One email sent to parent's email address (col 5) | GmailApp.sendEmail() — confirmed working, already wired. Recipient from `data.parentEmail`. |
| EMAIL-02 | Email subject includes parent name and VBS 2026 branding | Subject string construction — trivial. Pattern: `'VBS 2026 Registration Approved — ' + data.parentName` already present, correct. |
| EMAIL-03 | Email body: greeting, confirmation, submission ID, children list, VBS dates/times, church address, contact info | Must convert existing plain-text body to HTML with warm tone, footer, no pass-handling instructions. |
| EMAIL-04 | Each child's PDF pass attached to email | `attachments: passPdfs` option in GmailApp.sendEmail() — already implemented. Blob name must change to `VBS2026_Pass_[ChildName].pdf`. |
| EMAIL-05 | Email sent using GmailApp (no external API) | Already using `GmailApp.sendEmail()` with `htmlBody` option needed. |
| GUARD-01 | After successful send, status = "Approved — Email Sent" to prevent re-send | Already implemented. Guard fires via `APPROVED_VAL = 'Approved'` check — "Approved — Email Sent" ≠ "Approved" so re-trigger is impossible. |
| GUARD-02 | If email send fails, error logged and status NOT changed to "Approved — Email Sent" | Partially implemented: error IS logged. Gap: Status must be set to `Error — Email Failed`; currently Status is left unchanged on failure. |
</phase_requirements>

---

## Summary

Phase 3 is **already substantially coded** in `apps-script/Code.gs`. The `sendApprovalEmail()` function exists and is correctly wired into `onApprovalEdit()`. GmailApp is used, the guard logic (Status string comparison) is correct, and PDF blobs are passed as attachments.

However, the existing implementation has **four concrete gaps** against the locked CONTEXT.md decisions that must be corrected:

1. **Plain text only** — `GmailApp.sendEmail()` is called with a plain-text `body` but no `htmlBody` option. CONTEXT requires HTML email with warm church tone and VBS jungle-safari branding.
2. **Attachment filename** — blobs are currently named `[childName] - VBS Pass 2026.pdf`. CONTEXT requires `VBS2026_Pass_[ChildName].pdf`. This requires changing `.setName()` in `generatePassPdf()`.
3. **Forbidden copy** — the plain-text body includes "Print and bring them on the first day." This line is explicitly banned per CONTEXT.
4. **Error Status** — on failure, the `catch` block only calls `Logger.log` and leaves Status unchanged. CONTEXT requires setting Status to `Error — Email Failed` on any failure (PDF gen or email send).

Additionally, the failure handling needs two distinct error paths: one for PDF generation failures (abort all, set `Error — Email Failed`), and one for email-send failures (same status, same log). Currently everything is one undifferentiated `try/catch`.

**Primary recommendation:** This is a surgical rewrite of `sendApprovalEmail()` plus a one-line change to `generatePassPdf()`. No new functions, no new infrastructure.

---

## Standard Stack

### Core (Google Apps Script built-ins — no npm, no installation)

| Service | Purpose | Why Standard |
|---------|---------|--------------|
| `GmailApp` | Send email with HTML body and attachments | Only GAS service that supports `htmlBody`, `from` alias, and blob attachments |
| `DriveApp` | Create temp HTML file, convert to PDF blob | Required for HTML-to-PDF conversion in GAS |
| `SpreadsheetApp` | Read row data, write Status cell | All sheet I/O |
| `Logger` | Error logging | Standard GAS logging — visible in Apps Script > Executions |

### No npm / No external libraries

This is a Google Apps Script project. There is no package manager, no `npm install`, and no external libraries involved. All APIs are GAS built-ins.

---

## Architecture Patterns

### Existing Project Structure

```
apps-script/
└── Code.gs         # Single file — all phases in one script
                    # Phase 1: Trigger handler (~lines 171-218)
                    # Phase 2: PDF pass generator (~lines 246-643)
                    # Phase 3: Email delivery (~lines 644-695)
```

All Phase 3 changes are confined to `Code.gs`. No new files.

### Pattern 1: GmailApp.sendEmail() with htmlBody

**What:** Pass `htmlBody` option to send HTML email while keeping plain-text `body` as fallback.
**When to use:** Any HTML email in GAS.

```javascript
// Source: https://developers.google.com/apps-script/reference/gmail/gmail-app
GmailApp.sendEmail(recipient, subject, plainTextBody, {
  htmlBody: '<html>...</html>',
  attachments: [pdfBlob1, pdfBlob2],
  name: 'El Bethel VBS 2026',
  from: CHURCH_EMAIL,   // must be a verified Send-As alias
});
```

The `body` (plain text) is required — it is used by clients that cannot render HTML. The `htmlBody` option overrides it on HTML-capable clients. Both must be populated.

### Pattern 2: Two-Stage Error Handling (PDF gen vs. Email send)

**What:** Separate try/catch blocks to distinguish PDF generation failures from email send failures. Both paths set `Error — Email Failed`.

```javascript
function sendApprovalEmail(data, row) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);

  // Stage 1: Generate PDFs — abort all on any failure
  var passPdfs;
  try {
    passPdfs = generatePassesForRegistration(data);
  } catch (pdfErr) {
    Logger.log('sendApprovalEmail PDF ERROR row ' + row + ': ' + pdfErr.message);
    sheet.getRange(row, STATUS_COLUMN).setValue('Error — Email Failed');
    return;
  }

  // Stage 2: Send email
  try {
    GmailApp.sendEmail(/* ... */);
    sheet.getRange(row, STATUS_COLUMN).setValue('Approved — Email Sent');
  } catch (mailErr) {
    Logger.log('sendApprovalEmail MAIL ERROR row ' + row + ': ' + mailErr.message);
    sheet.getRange(row, STATUS_COLUMN).setValue('Error — Email Failed');
  }
}
```

**Why separate stages:** If PDF generation throws (e.g. Drive quota), `generatePassesForRegistration` may have partially succeeded. Wrapping both in one `try` would not distinguish which failed. The CONTEXT spec says "abort all if any PDF fails" — catching PDF errors before the send makes this explicit.

### Pattern 3: Attachment Blob Renaming

**What:** The PDF blob name is set via `.setName()` in `generatePassPdf()`.
**Required change:** One line in the existing function.

```javascript
// CURRENT (wrong):
pdfBlob = tempFile.getAs('application/pdf').setName(childName + ' - VBS Pass 2026.pdf');

// CORRECT per CONTEXT:
pdfBlob = tempFile.getAs('application/pdf').setName('VBS2026_Pass_' + childName + '.pdf');
```

**Filename sanitization:** Per Claude's Discretion, childName may contain characters invalid in filenames (e.g. `/`). Sanitize before use:

```javascript
var safeName = childName.replace(/[\/\\:*?"<>|]/g, '_');
pdfBlob = tempFile.getAs('application/pdf').setName('VBS2026_Pass_' + safeName + '.pdf');
```

### Pattern 4: HTML Email Template (Jungle Safari branding)

**What:** Inline-CSS HTML string for the email body. GAS strips `<style>` tags from email HTML — all CSS must be inline.
**Key constraint:** No external CSS files, no `<link>` tags, no `<style>` blocks. Gmail strips them.

Structure recommended (matching VBS branding — Claude's Discretion):
- Green header bar with church name and "VBS 2026 — Jungle Safari" title
- Greeting paragraph
- Registration confirmation box (submission ID)
- Children list
- Event details section (dates, times, venue)
- Church address
- Footer with ebethelchurch@gmail.com and phone 9945028989
- Warm closing, no pass-handling instructions

### Pattern 5: Duplicate Guard (already correct)

**What:** The guard is already correctly implemented. `onApprovalEdit()` fires only when `e.value === 'Approved'`. After a successful send, Status becomes `'Approved — Email Sent'` which never equals `'Approved'`, so the trigger never re-fires on that row unless an admin manually resets it to `'Approved'`.

**The guard is the trigger condition itself** — no additional check is needed inside `sendApprovalEmail()`. The CONTEXT spec of "silent exit" is already satisfied: if Status ≠ "Approved", the trigger simply doesn't fire.

### Anti-Patterns to Avoid

- **Inline `<style>` or `<link>` in htmlBody:** Gmail strips stylesheet blocks. Use only inline `style="..."` attributes.
- **One try/catch for both PDF gen and send:** Hides which step failed, makes the `Error — Email Failed` status ambiguous. Use two-stage error handling.
- **Not providing plain-text `body` fallback:** Required parameter — GAS will throw if omitted even when `htmlBody` is provided.
- **Using `MailApp` instead of `GmailApp`:** `MailApp` does not support the `from` alias parameter. Only `GmailApp.sendEmail()` supports `from`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| HTML-to-PDF conversion | Custom renderer | `DriveApp.createFile().getAs('application/pdf')` | Already implemented, proven working in Phase 2 |
| Email sending | Custom SMTP / Fetch to external API | `GmailApp.sendEmail()` | Explicitly required by EMAIL-05; already authorized |
| Filename sanitization | Complex regex library | Simple inline `.replace(/[\/\\:*?"<>|]/g, '_')` | One-liner covers all OS-invalid characters |

---

## Common Pitfalls

### Pitfall 1: Gmail Strips `<style>` Tags

**What goes wrong:** Developer writes clean CSS in a `<style>` block inside `htmlBody`. All styling vanishes in Gmail/most email clients.
**Why it happens:** Email clients sanitize `<style>` and `<link>` tags for security.
**How to avoid:** Use only inline `style="..."` on every element — same technique already used in the PDF pass HTML.
**Warning signs:** Email looks unstyled in Gmail even though it looks fine in browser preview.

### Pitfall 2: `from` Alias Not Verified

**What goes wrong:** `GmailApp.sendEmail()` throws "Invalid argument" or sends from the wrong address.
**Why it happens:** The `from` parameter must exactly match a verified Send-As alias in Gmail settings.
**How to avoid:** User must complete "Add ebethelchurch@gmail.com as Send-As alias → verify" (already noted as pending user action in STATE.md).
**Warning signs:** Script throws on `.sendEmail()` with a message referencing "alias" or "sender".

### Pitfall 3: PDF Generation Leaves Temp Files on Error

**What goes wrong:** If `generatePassPdf()` throws after creating the temp HTML file but before trashing it, an orphaned `.html` file is left in Drive root.
**Why it happens:** The existing code uses `try/finally` which handles the happy path. But if `Utilities.newBlob()` or `DriveApp.createFile()` throws, no temp file exists to trash.
**How to avoid:** The existing `try/finally` in `generatePassPdf()` already handles this correctly — `tempFile.setTrashed(true)` runs in `finally`. No change needed here.
**Warning signs:** Drive root accumulates `.html` files named like child names.

### Pitfall 4: Status Cell Write After Email Send Failure

**What goes wrong:** Current implementation — on catch, Status is left as "Approved" (not changed). CONTEXT requires `Error — Email Failed`.
**Why it happens:** Original implementation was written before the CONTEXT.md decision was finalized.
**How to avoid:** In both catch blocks, write `Error — Email Failed` to the Status cell before returning.

### Pitfall 5: `generatePassesForRegistration` Uses `.map()` — First Failure Doesn't Stop Others

**What goes wrong:** If kid[0] PDF generates fine but kid[1] throws, `Array.map()` will throw on the second iteration, but kid[0]'s temp file was already trashed. The outer catch in `sendApprovalEmail()` catches the error. This is actually fine — `map()` throws on the first failure and the remaining kids are never processed.
**Why it happens:** JavaScript's `Array.map()` is not lazy — but it does throw synchronously on first error.
**How to avoid:** No change needed. The throw propagates naturally. The two-stage error pattern in `sendApprovalEmail()` catches it before any send.

### Pitfall 6: Plain-Text `body` Contains Forbidden Copy

**What goes wrong:** Even if `htmlBody` is correct, the fallback `body` string still contains "Print and bring them on the first day." which is explicitly banned.
**Why it happens:** The plain-text `body` is a fallback for non-HTML clients and is also displayed in email previews/notifications.
**How to avoid:** Rewrite both `body` and `htmlBody` in the same pass. Remove the forbidden copy from both.

---

## Code Examples

### Complete Revised `sendApprovalEmail()` Skeleton

```javascript
// Source: verified against GAS docs + CONTEXT.md decisions
function sendApprovalEmail(data, row) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);

  // Stage 1: Generate all PDFs — abort everything if any fail
  var passPdfs;
  try {
    passPdfs = data.kids.map(function(kid) {
      var safeName = kid.name.replace(/[\/\\:*?"<>|]/g, '_');
      return generatePassPdf(kid.name, kid.age, data.picnicConsent, data.submissionId, safeName);
    });
  } catch (pdfErr) {
    Logger.log('sendApprovalEmail PDF ERROR row ' + row + ': ' + pdfErr.message);
    sheet.getRange(row, STATUS_COLUMN).setValue('Error — Email Failed');
    return;
  }

  // Stage 2: Build and send HTML email
  var subject = 'VBS 2026 Registration Approved — ' + data.parentName;
  var htmlBody = buildEmailHtml(data);      // new helper function
  var plainBody = buildEmailPlain(data);    // fallback, no forbidden copy

  try {
    GmailApp.sendEmail(data.parentEmail, subject, plainBody, {
      htmlBody: htmlBody,
      attachments: passPdfs,
      name: 'El Bethel VBS 2026',
      from: CHURCH_EMAIL,
    });
    sheet.getRange(row, STATUS_COLUMN).setValue('Approved — Email Sent');
    Logger.log('sendApprovalEmail: sent to ' + data.parentEmail + ' [' + data.submissionId + ']');
  } catch (mailErr) {
    Logger.log('sendApprovalEmail MAIL ERROR row ' + row + ': ' + mailErr.message);
    sheet.getRange(row, STATUS_COLUMN).setValue('Error — Email Failed');
  }
}
```

### Attachment Naming Fix in `generatePassPdf()`

```javascript
// Source: CONTEXT.md locked decision — pattern VBS2026_Pass_[ChildName].pdf
// Change .setName() call only; everything else in generatePassPdf() stays the same
function generatePassPdf(childName, childAge, picnicConsent, submissionId, safeName) {
  var safeFilename = (safeName || childName).replace(/[\/\\:*?"<>|]/g, '_');
  var html = buildPassHtml(childName, childAge, picnicConsent, submissionId);
  var tempFile = DriveApp.createFile(
    Utilities.newBlob(html, 'text/html', safeFilename + '-pass.html')
  );
  var pdfBlob;
  try {
    pdfBlob = tempFile.getAs('application/pdf').setName('VBS2026_Pass_' + safeFilename + '.pdf');
  } finally {
    tempFile.setTrashed(true);
  }
  return pdfBlob;
}
```

### HTML Email Body Template Pattern

```javascript
// Source: GAS docs — inline CSS required; no <style> blocks
// Colors: dark green (#2d5a27) matches VBS jungle safari theme
function buildEmailHtml(data) {
  var kidListHtml = data.kids.map(function(k, i) {
    return '<li>' + (i + 1) + '. ' + k.name + ' (Age ' + k.age + ')</li>';
  }).join('');

  return '<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;color:#222;margin:0;padding:0;">'
    + '<table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;">'
    + '<tr><td style="background:#2d5a27;padding:24px 32px;">'
    + '<h1 style="color:#fff;margin:0;font-size:22px;">El Bethel AG International Church</h1>'
    + '<p style="color:#c8e6c9;margin:4px 0 0 0;font-size:14px;">VBS 2026 — Jungle Safari</p>'
    + '</td></tr>'
    + '<tr><td style="padding:32px;">'
    + '<p>Dear ' + data.parentName + ',</p>'
    + '<p>We\'re so excited to have your children at VBS 2026 — Jungle Safari! '
    + 'Your registration has been approved.</p>'
    + '<table width="100%" style="background:#f9f9f9;border:1px solid #ddd;border-radius:4px;padding:16px;margin:16px 0;">'
    + '<tr><td><strong>Reference ID:</strong></td><td>' + data.submissionId + '</td></tr>'
    + '</table>'
    + '<p><strong>Registered Children:</strong></p>'
    + '<ul style="margin:8px 0;">' + kidListHtml + '</ul>'
    + '<p><strong>Event Details:</strong></p>'
    + '<table style="line-height:1.8;">'
    + '<tr><td style="padding-right:16px;color:#555;">Dates</td><td>May 11 – 15, 2026 (Monday to Friday)</td></tr>'
    + '<tr><td style="color:#555;">Time</td><td>10:00 AM – 1:00 PM</td></tr>'
    + (data.picnicConsent === 'Yes' ? '<tr><td style="color:#555;">Day 5</td><td>Full Day Picnic (May 15, 2026)</td></tr>' : '')
    + '<tr><td style="color:#555;">Venue</td><td>El Bethel AG International Church</td></tr>'
    + '<tr><td style="color:#555;">Address</td><td>' + CHURCH_ADDRESS + '</td></tr>'
    + '</table>'
    + '<p style="margin-top:24px;">God bless you! We look forward to a wonderful week with your children.</p>'
    + '<p>Warm regards,<br><strong>El Bethel VBS 2026 Team</strong></p>'
    + '</td></tr>'
    + '<tr><td style="background:#f0f4f0;border-top:1px solid #ddd;padding:16px 32px;font-size:12px;color:#555;">'
    + '<p style="margin:0;">El Bethel AG International Church<br>'
    + CHURCH_ADDRESS + '</p>'
    + '<p style="margin:8px 0 0 0;">Email: ebethelchurch@gmail.com &nbsp;|&nbsp; Phone: 9945028989</p>'
    + '</td></tr>'
    + '</table>'
    + '</body></html>';
}
```

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| Plain-text email body | HTML `htmlBody` option in GmailApp | Rich formatting, church branding, warm tone |
| `[name] - VBS Pass 2026.pdf` blob name | `VBS2026_Pass_[name].pdf` | Matches CONTEXT.md spec |
| Single try/catch (no status on failure) | Two-stage try/catch, sets `Error — Email Failed` | Admins see failure in sheet; no silent errors |

**Current gaps in Code.gs (what Phase 3 must fix):**
- `sendApprovalEmail()` uses plain text only — no `htmlBody`
- `sendApprovalEmail()` catch block does not set Status to `Error — Email Failed`
- `generatePassPdf()` names blob `[childName] - VBS Pass 2026.pdf` (wrong pattern)
- Plain-text body contains "Print and bring them on the first day." (forbidden copy)
- No filename sanitization for special characters in child names

---

## Open Questions

1. **`buildEmailPlain()` — separate function or inline?**
   - What we know: Both `body` (plain text fallback) and `htmlBody` must be provided to `GmailApp.sendEmail()`
   - What's unclear: Whether to extract to a named helper or keep inline in `sendApprovalEmail()`
   - Recommendation: Inline for plain text (short), named helper `buildEmailHtml()` for HTML (long) — keeps `sendApprovalEmail()` readable

2. **`generatePassPdf()` signature change**
   - What we know: The filename sanitization can be done inside `generatePassPdf()` directly from `childName`
   - What's unclear: Whether to add a `safeName` parameter or just sanitize inside the function
   - Recommendation: Sanitize inside `generatePassPdf()` using `childName.replace(...)` — no signature change, minimal impact

3. **Age rendering in live test (existing known bug)**
   - What we know: STATE.md notes "Verify age renders as number (not date string) — col 10 may be Date object"
   - What's unclear: Whether this manifests in the email children list as well as the PDF
   - Recommendation: The email lists `k.age` from `data.kids`. If age is a Date object in the sheet, it will render as a date string in the email too. The fix belongs in `readRegistrationRow()` in Phase 2's scope, but should be verified in the Phase 3 live test.

---

## Sources

### Primary (HIGH confidence)
- https://developers.google.com/apps-script/reference/gmail/gmail-app — `sendEmail()` options: `htmlBody`, `from`, `attachments`, `name`
- https://developers.google.com/apps-script/guides/services/quotas — Daily email quota: 100/day consumer, 1500/day Workspace; attachment limit: 25 MB/msg
- Direct code inspection of `apps-script/Code.gs` lines 624–695 — existing Phase 3 implementation

### Secondary (MEDIUM confidence)
- GAS community consensus (multiple Stack Overflow threads, verified against official docs): Gmail clients strip `<style>` tags from HTML email — inline CSS required
- GAS docs `from` parameter: must match verified Send-As alias per `getAliases()` return values

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — GAS built-ins, verified via official docs
- Architecture: HIGH — code inspection of existing implementation, gaps clearly identified
- Pitfalls: HIGH — verified against official GAS docs and direct code reading
- HTML email template: MEDIUM — structure verified, exact styling is Claude's Discretion

**Research date:** 2026-04-09
**Valid until:** 2026-05-09 (GAS APIs are stable; 30-day window)
