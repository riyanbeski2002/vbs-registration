# Phase 2: PDF Pass Generator - Context

**Gathered:** 2026-04-06
**Status:** Ready for planning

<domain>
## Phase Boundary

Generate one branded, printable PDF pass per child in a registration. PDFs are produced as
Drive blobs and attached to the approval email in Phase 3. Each pass reflects one child's
details. The email send itself is out of scope for this phase.

</domain>

<decisions>
## Implementation Decisions

### Pass style & layout
- Event ticket style — landscape orientation, half-page (2 tickets fit per printed A4/Letter page)
- Structure: colored left stub + wider main body area
- No dashed/perforated separator line — stub is distinguished by background color contrast only
- Each child gets their own separate PDF file

### Content & text
- **Church:** El Bethel AG International Church
- **Address:** 107, 5th Cross Rd, Chinnapanahalli Main Rd, Doddanekundi, Marathahalli, Bengaluru, Karnataka 560037
- **Stub** (left colored section): Child's full name (large/bold) + age below it
- **Main body** includes:
  - VBS name & year: "Vacation Bible School 2026"
  - Dates & times: May 11–15, 2026 · 10 AM – 1 PM
  - Church name and full address
  - Submission ID (for volunteer lookup)
- No QR code

### Picnic section
- Shown as a distinct colored band at the bottom of the ticket
- Text: "Day 5 Full Day Picnic"
- Condition: shown only when Picnic Consent (col 16) = "Yes"
- When Picnic Consent = "No": the band is still rendered but greyed out / visually crossed out (not absent)

### Branding & colors
- Color palette: deep jungle green (primary) + gold/amber accent
- Logo: church logo embedded via Google Drive file ID — fetched at runtime using DriveApp
- Decorative element: jungle/safari pattern (leaf or animal silhouette) as a subtle visual accent on the pass

### Claude's Discretion
- Exact hex values for jungle green and gold (e.g. #1a5c38, #c9a227 — adjust for visual quality)
- Typography sizes and font stack (CSS-safe fonts available in GAS HtmlService)
- Exact placement of the jungle/safari decorative element (corner, watermark, etc.)
- How the "greyed out" picnic band is styled (opacity, strikethrough text, or desaturated color)
- Temp Drive file handling for PDF blob generation

</decisions>

<specifics>
## Specific Ideas

- 2 passes per printed page — parents print at home and cut; this is the expected use case
- Submission ID on the pass lets a volunteer cross-reference the Google Sheet if needed
- Logo is stored in Google Drive (file ID to be provided when implementing — planner should note a placeholder constant `LOGO_DRIVE_FILE_ID` in Code.gs)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 02-pdf-pass-generator*
*Context gathered: 2026-04-06*
