---
phase: 03-email-delivery-guard
plan: 01
subsystem: email
tags: [google-apps-script, gmail, pdf, html-email, inline-css]

# Dependency graph
requires:
  - phase: 02-pdf-pass-generator
    provides: generatePassPdf(), generatePassesForRegistration(), readRegistrationRow() — PDF blob generation and sheet data extraction
provides:
  - sendApprovalEmail() with two-stage error handling, HTML body, and correct Status writes
  - buildEmailHtml(data) — inline-CSS HTML email with dark green VBS branding and footer contact info
  - generatePassPdf() naming blobs as VBS2026_Pass_[safeName].pdf with OS-invalid char sanitization
affects:
  - 04-redesign

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Two-stage try/catch: separate PDF generation errors from email send errors; both write 'Error — Email Failed' to Status cell
    - Inline-CSS HTML email: all styles as style= attributes — no <style> blocks, Gmail strips them
    - Filename sanitization: childName.replace(/[\/\\:*?"<>|]/g, '_') before .setName()

key-files:
  created: []
  modified:
    - apps-script/Code.gs

key-decisions:
  - "generatePassPdf() sanitizes childName inline — no signature change. safeName replaces OS-invalid characters with underscores."
  - "Plain-text body fallback retained for non-HTML clients — rewritten with warm tone, no 'Print and bring' copy."
  - "buildEmailHtml(data) extracted as named helper immediately after sendApprovalEmail() — keeps sendApprovalEmail() readable."

patterns-established:
  - "Two-stage error handling: PDF gen stage catches separately from email send stage — both stages write Error — Email Failed to Status cell"
  - "All email HTML uses inline style= attributes only — no <style> blocks"

requirements-completed: [EMAIL-01, EMAIL-02, EMAIL-03, EMAIL-04, EMAIL-05, GUARD-01, GUARD-02]

# Metrics
duration: 2min
completed: 2026-04-09
---

# Phase 3 Plan 01: Email Delivery Guard Summary

**HTML email with two-stage PDF+send error handling, VBS2026_Pass_ filename pattern, inline-CSS branding, and 'Error — Email Failed' Status writes in both catch blocks**

## Performance

- **Duration:** 2 min
- **Started:** 2026-04-09T07:40:17Z
- **Completed:** 2026-04-09T07:41:40Z
- **Tasks:** 2 of 3 completed (Task 3 is a live deployment checkpoint awaiting human verification)
- **Files modified:** 1

## Accomplishments
- Fixed `generatePassPdf()` — blobs now named `VBS2026_Pass_[safeName].pdf` with OS-invalid character sanitization
- Rewrote `sendApprovalEmail()` with two-stage error handling — PDF generation failure and email send failure each write `Error — Email Failed` to the Status cell
- Replaced plain-text only email with `htmlBody` option using inline-CSS HTML with dark green VBS Jungle Safari branding
- Removed forbidden "Print and bring them on the first day." copy from both plain-text and HTML bodies
- Added `buildEmailHtml(data)` helper — inline-CSS HTML with dark green header, reference ID box, children list, event details table, warm closing, footer with ebethelchurch@gmail.com and 9945028989

## Task Commits

Each task was committed atomically:

1. **Task 1: Fix generatePassPdf() — rename blob to VBS2026_Pass_[safeName].pdf** - `4744e0d` (feat)
2. **Task 2: Rewrite sendApprovalEmail() — two-stage error handling, HTML body, remove forbidden copy** - `3ecd0b8` (feat)
3. **Task 3: Live deployment test** - PENDING (checkpoint:human-verify — requires GAS editor + live sheet test)

## Files Created/Modified
- `apps-script/Code.gs` — generatePassPdf() renamed blob pattern + safeName sanitization; sendApprovalEmail() two-stage error handling + htmlBody; buildEmailHtml(data) new function

## Decisions Made
- Sanitization done inside `generatePassPdf()` directly from `childName` — no function signature change (per RESEARCH.md Open Question #2 recommendation)
- Plain-text `body` retained as required GAS fallback — rewritten with warm tone without forbidden copy
- `buildEmailHtml()` extracted as named helper (not inlined) for readability — per RESEARCH.md Open Question #1 recommendation

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None new — no external service configuration required by this plan.

Existing pending user action (from prior session): Add `ebethelchurch@gmail.com` as Send-As alias in personal Gmail and verify it before running the live test (Task 3 checkpoint).

## Next Phase Readiness

**Pending: Task 3 live deployment checkpoint.**
- Copy `apps-script/Code.gs` into Google Apps Script editor
- Run `installTrigger()` once
- Set a test row's Status to "Approved"
- Verify: one HTML email with correct branding arrives, PDFs named `VBS2026_Pass_[ChildName].pdf`, Status reads "Approved — Email Sent", re-approving same row sends no second email

Once Task 3 passes, all Phase 3 requirements are complete and the project is live.

---
*Phase: 03-email-delivery-guard*
*Completed: 2026-04-09*
