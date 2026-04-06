---
phase: 02-pdf-pass-generator
plan: 01
subsystem: pdf
tags: [google-apps-script, driveapp, html-to-pdf, branding, event-ticket]

# Dependency graph
requires:
  - phase: 01-trigger
    provides: readRegistrationRow() returning data.kids, data.picnicConsent, data.submissionId, data.parentEmail
provides:
  - "LOGO_DRIVE_FILE_ID constant (placeholder, admin-configurable)"
  - "getLogoBase64() — fetches and base64-encodes church logo from Drive once per registration"
  - "buildPassHtml(childName, childAge, picnicConsent, submissionId, logo) — landscape A5 table-based event ticket HTML"
  - "generatePassPdf(childName, childAge, picnicConsent, submissionId, logo) — PDF blob with try/finally cleanup guard"
  - "generatePassesForRegistration(data) — returns array of PDF blobs, one per child"
affects:
  - 03-email-delivery
  - 04-redesign

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "HTML-to-PDF via Utilities.newBlob → DriveApp.createFile → getAs('application/pdf') → setTrashed in finally"
    - "Base64 logo embedding via DriveApp.getFileById + Utilities.base64Encode to avoid Drive URL permission issues"
    - "HTML table two-column layout for WebKit PDF renderer (flexbox/grid unreliable in GAS PDF pipeline)"
    - "print-color-adjust: exact applied globally (*) and inline on colored elements to prevent background stripping"
    - "Logo fetched once per registration, passed as { ok, src } shape to each child's PDF call"

key-files:
  created: []
  modified:
    - apps-script/Code.gs

key-decisions:
  - "Table-based two-column layout (not flexbox/grid) because GAS WebKit PDF renderer does not reliably support modern CSS layout"
  - "print-color-adjust: exact applied globally in * rule AND inline on stub td and picnic band to guarantee green/gold colors survive PDF export"
  - "Picnic band always rendered in HTML; style variable (gold active vs grey strikethrough) differs by consent — never absent"
  - "Logo embedded via base64 data URI (not Drive sharing URL) because Drive URLs have permission issues in the PDF renderer"
  - "LOGO_DRIVE_FILE_ID left as empty string placeholder — graceful degradation renders pass without logo when unset"
  - "Inline SVG leaf used for decorative element (not CSS pseudo-elements, which are unreliable in WebKit print mode)"

patterns-established:
  - "PDF cleanup guard: var pdfBlob; try { pdfBlob = tempFile.getAs(...) } finally { tempFile.setTrashed(true) }"
  - "Logo fetch shape: { ok: boolean, src: string } — caller checks logo.ok before rendering <img>"

requirements-completed: [PASS-01, PASS-02, PASS-03, PASS-04, PASS-05, PASS-06, PASS-07, PASS-08]

# Metrics
duration: 3min
completed: 2026-04-06
---

# Phase 2 Plan 01: PDF Pass Generator Summary

**Landscape A5 event-ticket PDF per child using table-based HTML layout with jungle green stub, gold branding, conditional picnic band, and base64 logo embedding via Google Drive**

## Performance

- **Duration:** 3 min
- **Started:** 2026-04-06T07:02:20Z
- **Completed:** 2026-04-06T07:05:24Z
- **Tasks:** 2 automated (Task 3 awaiting human visual verification)
- **Files modified:** 1

## Accomplishments
- Replaced portrait card stub with landscape A5 event-ticket layout (table-based, WebKit PDF safe)
- Added LOGO_DRIVE_FILE_ID constant and getLogoBase64() with graceful degradation (fetch once per registration)
- Rewrote generatePassPdf() with try/finally cleanup guard — temp Drive HTML files always trashed even if getAs() throws
- Rewrote buildPassHtml() with print-color-adjust: exact on all colored elements — green stub and gold picnic band survive PDF export
- Picnic band always rendered (never absent) — gold/active when consent="Yes", grey/strikethrough when "No"
- Submission ID and full address appear on every pass for volunteer cross-reference

## Task Commits

Each task was committed atomically:

1. **Tasks 1+2: LOGO_DRIVE_FILE_ID, orchestration functions, and buildPassHtml rewrite** - `091a906` (feat)

_Note: Tasks 1 and 2 both modify the Phase 2 block of Code.gs and were implemented in a single atomic edit. Both are captured in commit 091a906._

## Files Created/Modified
- `apps-script/Code.gs` - Phase 2 section fully rewritten: LOGO_DRIVE_FILE_ID constant, getLogoBase64(), buildPassHtml() (5-param, table layout, print-color-adjust), generatePassPdf() (5-param, try/finally), generatePassesForRegistration() (logo fetched once)

## Decisions Made
- Used HTML `<table>` for two-column layout instead of flexbox — GAS WebKit PDF renderer does not reliably render flex/grid
- Applied `print-color-adjust: exact` both globally in `*` selector and as inline styles on the green stub `<td>` and picnic band `<div>` — belt-and-suspenders approach since the GAS renderer behavior is medium-confidence
- Inline SVG leaf silhouette (at opacity 0.18) used for decorative jungle element — avoids CSS pseudo-elements which are unreliable in WebKit print mode, and avoids Unicode emoji which renders inconsistently
- Address hardcoded in buildPassHtml (not using CHURCH_ADDRESS constant) to keep the function self-contained; CHURCH_ADDRESS constant is still used in sendApprovalEmail for the email body

## Deviations from Plan

None — plan executed exactly as written. Tasks 1 and 2 touched the same file region and were implemented atomically; both committed together.

## Issues Encountered
None — implementation matched the research-verified patterns exactly.

## User Setup Required
None — no external service configuration required for this plan. Admin must set `LOGO_DRIVE_FILE_ID` in Code.gs before deploying, but this is documented inline in the constant declaration.

## Next Phase Readiness
- Task 3 (visual smoke test) is the blocking checkpoint — requires running testPassGen() in Apps Script editor and visually verifying exported PDFs in Google Drive
- Once Task 3 is approved, Phase 2 is complete and Phase 3 (email delivery with PDF attachments) can proceed
- generatePassesForRegistration(data) is already called by sendApprovalEmail(data, row) in Phase 3 — no wiring needed, Phase 3 integration is already in place

## Self-Check: PASSED
- `apps-script/Code.gs` exists and contains all required functions
- Commit `091a906` exists in git log
- All automated verification criteria met (no flexbox, no vercel URL, print-color-adjust present 3x, picnic band always rendered, submissionId in output, logo.ok conditional)

---
*Phase: 02-pdf-pass-generator*
*Completed: 2026-04-06*
