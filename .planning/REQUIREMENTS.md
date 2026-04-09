# Requirements: VBS 2026 Automated Approval Emails

**Defined:** 2026-03-29
**Core Value:** When a church admin approves a registration, the parent immediately receives confirmation and printable PDF passes for every child — no manual follow-up required.

## v1 Requirements

### Trigger

- [x] **TRIG-01**: An installable onEdit trigger fires when the Status column (col 21) value changes to "Approved"
- [x] **TRIG-02**: Trigger only fires on the "Registrations" sheet (not other sheets)
- [x] **TRIG-03**: Trigger is idempotent — re-editing a row that already sent does not re-send

### PDF Pass

- [x] **PASS-01**: A PDF pass is generated for each child in the registration
- [x] **PASS-02**: Each pass displays the child's name and age
- [x] **PASS-03**: Each pass displays VBS dates: May 11–15, 2026 | 10:00 AM – 1:00 PM
- [x] **PASS-04**: Each pass displays church name: El Bethel AG International Church
- [x] **PASS-05**: Each pass displays the church address
- [x] **PASS-06**: Each pass includes a "Day 5 — Full Day Picnic" section
- [x] **PASS-07**: Picnic pass section is visually distinct / highlighted only when Picnic Consent (col 16) = "Yes"
- [x] **PASS-08**: Each pass is themed to match the Jungle Safari VBS branding (green palette, safari style)

### Email

- [x] **EMAIL-01**: One email is sent to the parent's email address (col 5)
- [x] **EMAIL-02**: Email subject includes the parent name and VBS 2026 branding
- [x] **EMAIL-03**: Email body contains: greeting, registration confirmation, submission ID, list of registered children, VBS dates/times, church address, contact info
- [x] **EMAIL-04**: Each child's PDF pass is attached to the email
- [x] **EMAIL-05**: Email is sent using GmailApp (no external email API)

### Duplicate Guard

- [x] **GUARD-01**: After successful send, status is updated to "Approved — Email Sent" to prevent re-send
- [x] **GUARD-02**: If email send fails, an error is logged via Logger.log and the status is NOT changed

## v2 Requirements

### Notifications

- **NOTF-01**: WhatsApp/SMS notification to parent's phone number on approval
- **NOTF-02**: Reminder email 3 days before VBS starts

### Admin

- **ADMIN-01**: Bulk approve multiple rows and send emails in one action
- **ADMIN-02**: Resend pass email from a custom menu item

## Out of Scope

| Feature | Reason |
|---------|--------|
| External email services (SendGrid, Resend) | GmailApp is sufficient at VBS scale |
| New infrastructure or env vars | All logic stays in Code.gs |
| Custom check-in QR per child on pass | Deferred to v2 |
| Mobile push notifications | Out of scope for v1 |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| TRIG-01 | Phase 1 | Complete |
| TRIG-02 | Phase 1 | Complete |
| TRIG-03 | Phase 1 | Complete |
| PASS-01 | Phase 2 | Complete (02-01) |
| PASS-02 | Phase 2 | Complete (02-01) |
| PASS-03 | Phase 2 | Complete (02-01) |
| PASS-04 | Phase 2 | Complete (02-01) |
| PASS-05 | Phase 2 | Complete (02-01) |
| PASS-06 | Phase 2 | Complete (02-01) |
| PASS-07 | Phase 2 | Complete (02-01) |
| PASS-08 | Phase 2 | Complete (02-01) |
| EMAIL-01 | Phase 3 | Complete |
| EMAIL-02 | Phase 3 | Complete |
| EMAIL-03 | Phase 3 | Complete |
| EMAIL-04 | Phase 3 | Complete |
| EMAIL-05 | Phase 3 | Complete |
| GUARD-01 | Phase 3 | Complete |
| GUARD-02 | Phase 3 | Complete |

**Coverage:**
- v1 requirements: 18 total
- Mapped to phases: 18
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-29*
*Last updated: 2026-03-29 — traceability updated with 3-phase roadmap*
