# Roadmap: VBS 2026 Automated Approval Emails

## Overview

Three phases deliver the complete automated approval flow. Phase 1 installs the trigger and
validates it fires correctly on Status changes. Phase 2 builds the PDF pass generator for all
children in a registration. Phase 3 wires the email send, attachments, and duplicate guard so
the full loop works end-to-end without manual intervention.

## Phases

- [x] **Phase 1: Trigger** - Install the installable onEdit trigger and validate it fires only on correct sheet/column/value (completed 2026-03-30)
- [ ] **Phase 2: PDF Pass Generator** - Generate branded, per-child PDF passes with conditional picnic section
- [ ] **Phase 3: Email Delivery + Guard** - Send the approval email with PDF attachments and prevent duplicate sends

## Phase Details

### Phase 1: Trigger
**Goal**: The Apps Script detects when a registration row is approved and hands off clean data for downstream use
**Depends on**: Nothing (first phase)
**Requirements**: TRIG-01, TRIG-02, TRIG-03
**Success Criteria** (what must be TRUE):
  1. Changing Status (col 21) to "Approved" in the Registrations sheet fires the handler function
  2. Editing any other column does not fire the handler
  3. Editing Status on a sheet other than "Registrations" does not fire the handler
  4. The handler correctly reads parent name, email, child data, picnic consent, and submission ID from the edited row
**Plans**: 1 plan

Plans:
- [x] 01-01-PLAN.md — Install installable trigger and approval handler with row data reader

### Phase 2: PDF Pass Generator
**Goal**: A branded, printable PDF pass exists for every child in a registration, with picnic section shown conditionally
**Depends on**: Phase 1
**Requirements**: PASS-01, PASS-02, PASS-03, PASS-04, PASS-05, PASS-06, PASS-07, PASS-08
**Success Criteria** (what must be TRUE):
  1. One PDF pass is produced per child in the registration (e.g., 3 children = 3 PDF files)
  2. Each pass shows the child's name, age, VBS dates (May 11-15 2026, 10 AM-1 PM), church name, and address
  3. The "Day 5 Full Day Picnic" section appears on a pass only when Picnic Consent = "Yes"
  4. Each pass uses Jungle Safari green-palette branding and is visually distinct from plain text output
  5. PDFs are valid file blobs that can be opened and printed
**Plans**: TBD

### Phase 3: Email Delivery + Guard
**Goal**: The parent receives exactly one branded email with all children's passes attached, and re-approving a sent row does nothing
**Depends on**: Phase 2
**Requirements**: EMAIL-01, EMAIL-02, EMAIL-03, EMAIL-04, EMAIL-05, GUARD-01, GUARD-02
**Success Criteria** (what must be TRUE):
  1. The parent's email (col 5) receives one email containing all children's PDF passes as attachments
  2. The email subject includes the parent name and "VBS 2026" branding
  3. The email body shows: greeting, registration confirmation, submission ID, list of children, VBS dates/times, church address, and contact info
  4. After a successful send, the Status cell reads "Approved — Email Sent" and re-editing the cell to "Approved" does not send another email
  5. If the email send throws an error, Logger.log captures it and the Status cell is NOT changed to "Approved — Email Sent"
**Plans**: TBD

## Progress

**Execution Order:** 1 → 2 → 3

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Trigger | 1/1 | Complete   | 2026-03-30 |
| 2. PDF Pass Generator | 0/TBD | Not started | - |
| 3. Email Delivery + Guard | 0/TBD | Not started | - |

### Phase 4: Redesign PDF pass and email template — fix age bug, polish layout, remove vercel URL, improve email formatting

**Goal:** [To be planned]
**Depends on:** Phase 3
**Plans:** 1/1 plans complete

Plans:
- [ ] TBD (run /gsd:plan-phase 4 to break down)
