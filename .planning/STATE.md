# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-29)

**Core value:** When a church admin approves a registration, the parent immediately receives confirmation and printable PDF passes for every child — no manual follow-up required.
**Current focus:** Phase 2 — PDF Pass Generator

## Current Position

Phase: 2 of 4 (PDF Pass Generator)
Plan: 1 of 1 in current phase (awaiting Task 3 human visual checkpoint)
Status: Phase 2 Plan 01 — automated tasks complete; checkpoint:human-verify blocking
Last activity: 2026-04-06 — Plan 02-01 Tasks 1+2 complete; buildPassHtml and orchestration rewritten; visual smoke test pending

Progress: [██████░░░░] 50%

## Performance Metrics

**Velocity:**
- Total plans completed: 1
- Average duration: 5 min
- Total execution time: 0.1 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-trigger | 1 | 5 min | 5 min |
| 02-pdf-pass-generator | 1 | 3 min | 3 min |

**Recent Trend:**
- Last 5 plans: 01-01 (5 min), 02-01 (3 min)
- Trend: faster

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Installable onEdit trigger required (simple onEdit cannot access GmailApp/DriveApp)
- One email per family with all children's PDFs attached
- Picnic section on pass conditional on col 16 = "Yes"
- Duplicate guard via status value ("Approved — Email Sent") — no new column needed
- HTML table layout (not flexbox) required for GAS WebKit PDF renderer reliability
- print-color-adjust: exact required on all colored elements to prevent background stripping in PDF
- Picnic band always rendered in HTML; only style differs by consent (never absent)
- Logo embedded via base64 data URI (not Drive URL) — Drive URLs unreliable in PDF renderer

### Roadmap Evolution

- Phase 4 added: Redesign PDF pass and email template — fix age bug, polish layout, remove vercel URL, improve email formatting

### Pending Todos

- Complete Task 3 of 02-01: run testPassGen() in Apps Script editor and visually verify exported PDFs in Google Drive
- Set LOGO_DRIVE_FILE_ID in Code.gs to church logo Drive file ID before deploying

### Blockers/Concerns

None — Phase 1 complete and live-verified.

## Session Continuity

Last session: 2026-04-06
Stopped at: Plan 02-01 Tasks 1+2 complete — awaiting Task 3 checkpoint:human-verify (visual PDF smoke test in Apps Script)
Resume file: .planning/phases/02-pdf-pass-generator/02-01-SUMMARY.md
