# VBS 2026 — Automated Approval Emails

## What This Is

An automated email system built inside the existing Google Apps Script backend that sends a
branded acknowledgment email with PDF VBS passes to parents the moment a church admin changes
a registration's status from "Pending Review" to "Approved" in the Google Sheet.

## Core Value

When a church admin approves a registration, the parent immediately receives confirmation and
printable PDF passes for every child — no manual follow-up required.

## Requirements

### Validated

- ✓ Registration form captures parent name, email, kids (name + age + gender), picnic consent, submission ID — existing
- ✓ Apps Script backend writes to Google Sheet (21 columns, col 21 = Status, col 5 = Email) — existing
- ✓ Status starts as "Pending Review" on submission — existing

### Active

- [ ] `onEdit` trigger detects Status column change to "Approved"
- [ ] PDF pass generated per child: name, age, VBS dates (May 11–15 2026, 10 AM–1 PM), Day 5 full-day picnic note, church name & address
- [ ] Picnic pass section included on pass only when Picnic Consent = "Yes"
- [ ] One email sent to parent email address with all children's PDFs attached
- [ ] Email body: branded acknowledgment — confirms registration, lists children, shows submission ID, VBS details
- [ ] Guard against duplicate sends (track "Email Sent" state in sheet or row note)
- [ ] Graceful error logging if email send fails

### Out of Scope

- External email APIs (SendGrid, Resend) — Google Apps Script GmailApp is sufficient
- New infrastructure or environment variables — everything lives in Code.gs
- SMS or WhatsApp notifications — email only for v1
- Admin dashboard — status change happens directly in the Google Sheet

## Context

- **Stack**: Next.js 16 frontend → Google Apps Script Web App → Google Sheets backend
- **Sheet**: "Registrations" tab, 21 columns. Key columns: 2=Parent Name, 5=Email, 8=Num Kids,
  9=Kid Names (comma-sep), 10=Kid Ages (comma-sep), 14=Total Amount, 15=General Consent,
  16=Picnic Consent, 20=Submission ID, 21=Status
- **PDF generation**: Use Apps Script `HtmlService` to build styled HTML, then convert to PDF
  blob via `DriveApp` temp file → attach to email
- **Email send**: `GmailApp.sendEmail()` with PDF blob attachments
- **Duplicate guard**: After sending, write "Email Sent" into the Status cell (or a new col 22)
  so re-editing the cell doesn't re-send

## Constraints

- **Tech stack**: Google Apps Script only — no Node.js, no external services
- **PDF engine**: Must use Drive/HTML approach (no third-party PDF libs available in GAS)
- **Email quota**: GmailApp has a 100 emails/day limit on personal Gmail; adequate for VBS scale
- **Trigger type**: `onEdit` (simple trigger) cannot call GmailApp — must install an
  `onChange` or `installable onEdit` trigger via `ScriptApp.newTrigger`

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Installable onEdit trigger (not simple) | Simple onEdit cannot access GmailApp or DriveApp | — Pending |
| One PDF per child, all attached to one email | User confirmed: one email per family, multiple passes | — Pending |
| Picnic pass conditional on col 16 = "Yes" | User confirmed picnic pass should appear on the physical pass | — Pending |
| Duplicate guard via status value | Easiest way to prevent re-send without adding a new column | — Pending |

---
*Last updated: 2026-03-29 after initialization*
