# Phase 3: Email Delivery + Guard - Context

**Gathered:** 2026-04-09
**Status:** Ready for planning

<domain>
## Phase Boundary

Send the parent exactly one branded HTML email with all children's PDF passes as attachments when a registration is approved. Prevent duplicate sends using a Status cell guard. This phase covers: email construction, GmailApp send, attachment naming, duplicate guard logic, and failure handling. Unsubscribe flows, email templates stored externally, and SMS/push notifications are out of scope.

</domain>

<decisions>
## Implementation Decisions

### Email format & tone
- HTML email — not plain text
- Warm, church-friendly tone (e.g. "We're so excited to have your children at VBS!")
- Do NOT include instructions about what to do with the passes (no "print or show on phone" copy)
- Required body fields (from spec): greeting, registration confirmation, submission ID, list of children, VBS dates/times, church address, and contact info

### Contact info in footer
- Email: ebethelchurch@gmail.com
- Phone: 9945028989
- Both appear in the email footer

### Duplicate guard
- Guard mechanism: Status string check only — if Status ≠ "Approved", exit early. No separate dedicated column needed.
- Manual admin reset: if an admin manually sets Status back to "Approved", the handler fires again and sends another email. This is treated as intentional.
- Duplicate detection: silent exit — no Logger.log when guard blocks a duplicate send. This is the normal no-op path.

### Attachment naming
- Pattern: `VBS2026_Pass_[ChildName].pdf` (e.g. `VBS2026_Pass_Emma.pdf`)
- No age in filename
- Attachment order: same order as children appear in the registration row (no sorting required)

### Failure handling
- If **email send fails**: set Status = `Error — Email Failed` (visible in sheet) AND Logger.log the error. Do NOT set to "Approved — Email Sent".
- If **any PDF generation fails** (before email is sent): abort the entire operation — send nothing. Set Status = `Error — Email Failed` and Logger.log. No partial sends.
- On success: set Status = `Approved — Email Sent`

### Claude's Discretion
- HTML email layout and styling (colors, spacing, structure) — should match VBS Jungle Safari branding
- Exact Logger.log message format
- How to handle edge case where childName contains characters invalid in a filename (e.g. slash)

</decisions>

<specifics>
## Specific Ideas

- The church sends from `ebethelchurch@gmail.com` (already configured as Gmail alias in the project)
- Footer contact: ebethelchurch@gmail.com and phone 9945028989

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 03-email-delivery-guard*
*Context gathered: 2026-04-09*
