# Phase 2: PDF Pass Generator - Research

**Researched:** 2026-04-06
**Domain:** Google Apps Script — HTML-to-PDF generation via DriveApp
**Confidence:** HIGH (core mechanics verified via official docs + multiple community sources)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Pass style & layout**
- Event ticket style — landscape orientation, half-page (2 tickets fit per printed A4/Letter page)
- Structure: colored left stub + wider main body area
- No dashed/perforated separator line — stub is distinguished by background color contrast only
- Each child gets their own separate PDF file

**Content & text**
- Church: El Bethel AG International Church
- Address: 107, 5th Cross Rd, Chinnapanahalli Main Rd, Doddanekundi, Marathahalli, Bengaluru, Karnataka 560037
- Stub (left colored section): Child's full name (large/bold) + age below it
- Main body includes:
  - VBS name & year: "Vacation Bible School 2026"
  - Dates & times: May 11–15, 2026 · 10 AM – 1 PM
  - Church name and full address
  - Submission ID (for volunteer lookup)
- No QR code

**Picnic section**
- Shown as a distinct colored band at the bottom of the ticket
- Text: "Day 5 Full Day Picnic"
- Condition: shown only when Picnic Consent (col 16) = "Yes"
- When Picnic Consent = "No": the band is still rendered but greyed out / visually crossed out (not absent)

**Branding & colors**
- Color palette: deep jungle green (primary) + gold/amber accent
- Logo: church logo embedded via Google Drive file ID — fetched at runtime using DriveApp
- Decorative element: jungle/safari pattern (leaf or animal silhouette) as a subtle visual accent on the pass

**Tech stack: Google Apps Script only — HtmlService + DriveApp for PDF generation**

### Claude's Discretion
- Exact hex values for jungle green and gold (e.g. #1a5c38, #c9a227 — adjust for visual quality)
- Typography sizes and font stack (CSS-safe fonts available in GAS HtmlService)
- Exact placement of the jungle/safari decorative element (corner, watermark, etc.)
- How the "greyed out" picnic band is styled (opacity, strikethrough text, or desaturated color)
- Temp Drive file handling for PDF blob generation

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| PASS-01 | A PDF pass is generated for each child in the registration | `generatePassPdf()` pattern: Utilities.newBlob → DriveApp.createFile → getAs('application/pdf') → setTrashed |
| PASS-02 | Each pass displays the child's name and age | Inline HTML string construction with childName/childAge parameters |
| PASS-03 | Each pass displays VBS dates: May 11–15, 2026 | 10:00 AM – 1:00 PM | Static text in HTML template |
| PASS-04 | Each pass displays church name: El Bethel AG International Church | Static text in HTML template; also stored as constant |
| PASS-05 | Each pass displays the church address | Existing CHURCH_ADDRESS constant in Code.gs |
| PASS-06 | Each pass includes a "Day 5 — Full Day Picnic" section | Conditional band rendered in all cases; styling differs by consent |
| PASS-07 | Picnic section is visually distinct only when Picnic Consent = "Yes"; greyed out when "No" | Two CSS variants: active (green/gold) vs greyed (opacity + text-decoration) |
| PASS-08 | Each pass is themed to match Jungle Safari VBS branding (green palette, safari style) | Deep jungle green (#1a5c38) + gold (#c9a227), table-based layout, logo embedded via base64 |
</phase_requirements>

---

## Summary

Phase 2 replaces the existing `buildPassHtml` / `generatePassPdf` functions in Code.gs with a new, properly designed ticket-style implementation. The current implementation (portrait card, no stub layout, no logo, picnic section absent when "No") does not satisfy the user's decisions. The entire pass generation block must be rewritten.

The core technical approach is locked: Google Apps Script only, using `Utilities.newBlob(html, 'text/html', ...)` → `DriveApp.createFile(blob)` → `.getAs('application/pdf')` → `tempFile.setTrashed(true)`. This is the well-established GAS HTML-to-PDF pattern verified across multiple official and community sources.

Two non-obvious technical constraints govern the entire layout. First, the GAS PDF renderer uses a WebKit print engine that strips background colors by default — every element with a background color must carry `print-color-adjust: exact; -webkit-print-color-adjust: exact;` inline or in a `@page`/`@media print` block, or the green stub and gold accents will render white. Second, modern CSS layout (flexbox, CSS grid) is unreliable in this renderer — the two-column stub + body layout must be built with an HTML `<table>` (two `<td>` cells) rather than flex/grid divs.

The logo is embedded at runtime by fetching the Drive file by ID, encoding the blob bytes to base64, and inlining it as a `data:image/*;base64,...` src. External Drive URLs are unreliable in the PDF renderer due to permission headaches; base64 is the only robust approach.

**Primary recommendation:** Rewrite `buildPassHtml()` as a table-based landscape half-page ticket (approximately 750px × 350px) with `@page { size: landscape; }` and `print-color-adjust: exact` on all colored elements. Embed logo via base64. Always render the picnic band — use full color when consent = "Yes", opacity: 0.35 + strikethrough text when consent = "No".

---

## Standard Stack

### Core

| Service | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Google Apps Script | Runtime V8 | Server-side execution environment | Only available runtime — locked by user decision |
| DriveApp | Built-in GAS service | Create temp HTML file, export as PDF blob, trash temp file | Only way to produce PDF blobs in GAS without external APIs |
| Utilities.newBlob | Built-in GAS | Wrap HTML string as a Blob with MIME type `text/html` | Required input for DriveApp.createFile |
| Utilities.base64Encode | Built-in GAS | Encode Drive image bytes for inline HTML embedding | Avoids Drive URL permission issues in PDF renderer |

### No npm / No External Libraries

This phase uses zero external libraries. GAS runs on Google's servers — there is no npm install step. All code additions go directly into `apps-script/Code.gs`.

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| DriveApp HTML-to-PDF | pdf-lib (GAS library) | pdf-lib gives more control but adds library dependency and significant complexity; not worth it for this use case |
| Base64 image embedding | Drive sharing URL in `<img src>` | Drive URLs unreliable in PDF renderer; base64 is the correct approach |
| HTML `<table>` for two-column layout | CSS flexbox / grid | Flexbox/grid are unreliable in the GAS WebKit print renderer; tables render predictably |

---

## Architecture Patterns

### File Structure

All code for this phase lives in one file only:

```
apps-script/
└── Code.gs    # Replace buildPassHtml() and generatePassPdf() entirely
               # Add LOGO_DRIVE_FILE_ID constant
               # generatePassesForRegistration() already correct — no change needed
```

### Pattern 1: HTML-to-PDF via Temp Drive File

**What:** Build an HTML string → create a temp Drive file → export as PDF → trash the temp file → return the blob.

**When to use:** Every time a pass is generated. This is the only supported approach in GAS.

```javascript
// Source: https://www.labnol.org/code/19960-convert-html-to-pdf
// + GAS official DriveApp docs
function generatePassPdf(childName, childAge, picnicConsent, logoBase64) {
  var html = buildPassHtml(childName, childAge, picnicConsent, logoBase64);
  var blob = Utilities.newBlob(html, 'text/html', childName + '-pass.html');
  var tempFile = DriveApp.createFile(blob);
  var pdfBlob = tempFile.getAs('application/pdf')
                        .setName(childName + ' - VBS Pass 2026.pdf');
  tempFile.setTrashed(true);
  return pdfBlob;
}
```

### Pattern 2: Logo Base64 Embedding (fetch once, reuse per child)

**What:** Fetch the logo file once per registration (not once per child) and pass the base64 string into each `buildPassHtml()` call.

**When to use:** Any time a Drive-hosted image needs to appear in an HTML-to-PDF output.

```javascript
// Source: community.latenode.com/t/embedding-google-drive-images-in-html-with-apps-script
// Verified pattern: DriveApp.getFileById → getBlob → getBytes → base64Encode
function getLogoBase64() {
  try {
    var blob = DriveApp.getFileById(LOGO_DRIVE_FILE_ID).getBlob();
    var mimeType = blob.getContentType(); // e.g. 'image/png'
    var encoded = Utilities.base64Encode(blob.getBytes());
    return { src: 'data:' + mimeType + ';base64,' + encoded, ok: true };
  } catch (err) {
    Logger.log('Logo fetch failed: ' + err.message);
    return { src: '', ok: false }; // Pass renders without logo — graceful degradation
  }
}
```

**Key point:** Fetch logo ONCE in `generatePassesForRegistration()`, then pass the base64 string to each child's `generatePassPdf()` call. Avoids N Drive reads for N children.

### Pattern 3: Ticket Layout — HTML Table Two-Column

**What:** Landscape half-page ticket using `<table>` with two `<td>` cells. Left `<td>` = colored stub; right `<td>` = main body. No flexbox.

**Why table:** The GAS PDF renderer (WebKit print mode) does not reliably support CSS flexbox or grid. HTML tables render predictably in all WebKit PDF contexts.

**Page sizing:** Use `@page { size: A5 landscape; }` in a `<style>` block to produce a half-A4 landscape page (148mm × 210mm). This gives a single-page PDF per child that prints 2-up on A4/Letter.

```javascript
// Source: Research synthesis — GAS community + CSS @page spec
function buildPassHtml(childName, childAge, picnicConsent, logoBase64) {
  var picnicActive = (picnicConsent === 'Yes');

  var picnicBandStyle = picnicActive
    ? 'background:#c9a227;color:#1a1a1a;font-weight:700;'
    : 'background:#cccccc;color:#888888;opacity:0.5;text-decoration:line-through;';

  var logoHtml = logoBase64.ok
    ? '<img src="' + logoBase64.src + '" style="height:40px;margin-bottom:6px;" />'
    : '';

  return '<!DOCTYPE html>'
    + '<html><head><meta charset="UTF-8">'
    + '<style>'
    + '@page { size: A5 landscape; margin: 8mm; }'
    + '* { box-sizing: border-box; }'
    + 'body { margin:0; padding:0; font-family: Arial, Helvetica, sans-serif; background:#ffffff; }'
    + '.ticket { width:100%; border-collapse:collapse; }'
    + '.stub { width:28%; background:#1a5c38; color:#ffffff; vertical-align:middle; '
    +         'text-align:center; padding:16px 10px; '
    +         'print-color-adjust:exact; -webkit-print-color-adjust:exact; }'
    + '.body { width:72%; background:#ffffff; vertical-align:top; padding:16px 18px; }'
    + '.picnic-band { text-align:center; padding:6px 12px; font-size:11px; letter-spacing:0.1em; '
    +                'text-transform:uppercase; ' + picnicBandStyle
    +                'print-color-adjust:exact; -webkit-print-color-adjust:exact; }'
    + '.gold { color:#c9a227; }'
    + '</style>'
    + '</head><body>'
    + '<table class="ticket"><tr>'

    // ── Left stub ──
    + '<td class="stub">'
    + logoHtml
    + '<div style="font-size:22px;font-weight:700;line-height:1.2;margin-bottom:8px;">' + childName + '</div>'
    + '<div style="font-size:13px;font-weight:600;color:#a3d9b1;">Age: ' + childAge + ' yrs</div>'
    + '<div style="margin-top:16px;font-size:9px;letter-spacing:0.15em;text-transform:uppercase;color:#5a9c76;">Admission Pass</div>'
    + '</td>'

    // ── Main body ──
    + '<td class="body">'
    + '<div style="font-size:9px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#1a5c38;margin-bottom:2px;">El Bethel AG International Church</div>'
    + '<div style="font-size:18px;font-weight:700;color:#c9a227;margin-bottom:12px;">Vacation Bible School 2026</div>'

    + '<div style="font-size:12px;font-weight:700;color:#1a5c38;margin-bottom:2px;">May 11 – 15, 2026</div>'
    + '<div style="font-size:11px;color:#374151;margin-bottom:8px;">Monday to Friday &nbsp;·&nbsp; 10:00 AM – 1:00 PM</div>'

    + '<div style="font-size:10px;color:#6b7280;margin-bottom:12px;">107, 5th Cross Rd, Chinnapanahalli Main Rd,<br>Doddanekundi, Marathahalli, Bengaluru 560037</div>'

    + '<div style="font-size:10px;color:#9ca3af;">Ref: ' + submissionId + '</div>'

    // Picnic band
    + '<div class="picnic-band" style="margin-top:12px;border-radius:4px;">'
    + (picnicActive ? 'Day 5 — Full Day Picnic' : 'Day 5 — Full Day Picnic')
    + '</div>'

    + '</td>'
    + '</tr></table>'
    + '</body></html>';
}
```

**Note:** `submissionId` must be passed as a parameter to `buildPassHtml()` — add it to the function signature.

### Pattern 4: Decorative Jungle Element (CSS Unicode / SVG inline)

**What:** Since external images (other than the logo) add complexity, use a CSS-only or inline-SVG leaf/paw silhouette as an accent on the stub.

**Recommended:** A simple SVG leaf inline inside the stub HTML, or a Unicode leaf character (e.g. `&#127807;` 🌿). Place as a watermark-style element in the stub background, positioned at low opacity.

**When to avoid:** Do not use CSS `::before`/`::after` pseudo-elements — they are unreliable in the GAS PDF renderer.

### Anti-Patterns to Avoid

- **Using CSS flexbox or grid for layout:** The GAS WebKit PDF renderer does not reliably render flex/grid. Use `<table>` instead.
- **Background colors without `print-color-adjust: exact`:** Colors will be stripped in the PDF output, leaving the colored stub white.
- **CSS `::before`/`::after` pseudo-elements:** Unreliable in WebKit print mode — use real HTML elements.
- **Fetching logo once per child:** Causes N Drive reads and wastes quota. Fetch once per registration and reuse.
- **Absent picnic section when consent = "No":** CONTEXT.md explicitly requires the band to be rendered but visually greyed out, not absent.
- **External Google Drive image URLs in `<img src>`:** Permission complications make this unreliable. Always use base64 data URI.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| HTML-to-PDF conversion | Custom PDF byte builder | DriveApp.createFile + getAs('application/pdf') | Only supported approach in GAS; handles all page sizing |
| Image embedding | Drive sharing URL or UrlFetch | DriveApp.getFileById + Utilities.base64Encode | Base64 data URIs are reliable; Drive URLs have permission issues in PDF renderer |
| Landscape page size | Manual pixel calculations | `@page { size: A5 landscape; }` CSS rule | Standard CSS @page is supported in the GAS renderer |

**Key insight:** GAS's PDF rendering is a narrow WebKit print pipeline. Working within its constraints (tables, inline styles, print-color-adjust, base64 images) is far more reliable than fighting them.

---

## Common Pitfalls

### Pitfall 1: Background Colors Disappear in PDF

**What goes wrong:** The colored stub renders white; gold accent text appears correctly but backgrounds vanish.

**Why it happens:** WebKit's print rendering suppresses background colors by default to save printer toner. GAS uses this same pipeline when converting HTML to PDF.

**How to avoid:** Add `print-color-adjust: exact; -webkit-print-color-adjust: exact;` to every element with a non-white background-color, either inline in the style attribute or in a `<style>` block `@media print` rule. Apply it globally with `* { print-color-adjust: exact; -webkit-print-color-adjust: exact; }` to be safe.

**Warning signs:** Test the PDF and check if the stub column is white. If so, this is the cause.

### Pitfall 2: Flexbox Layout Breaks the Two-Column Design

**What goes wrong:** The stub and body appear stacked vertically instead of side by side, or the layout is completely collapsed.

**Why it happens:** CSS flexbox rendering is inconsistent in GAS's WebKit PDF mode — the same HTML that looks correct in a browser may not render correctly in the GAS PDF pipeline.

**How to avoid:** Use an HTML `<table>` with `border-collapse: collapse` for the two-column ticket layout. This is the safe, cross-environment approach for GAS HTML PDFs.

**Warning signs:** When previewing the HTML file (before PDF conversion), it looks fine, but the exported PDF has a different layout.

### Pitfall 3: Logo Fetch Failure Breaks All Passes for a Registration

**What goes wrong:** If `LOGO_DRIVE_FILE_ID` is set but the file doesn't exist or isn't accessible, `DriveApp.getFileById()` throws an exception that aborts pass generation for all children.

**Why it happens:** Unhandled exception in logo fetch propagates up the call stack.

**How to avoid:** Wrap logo fetch in try/catch. Return `{ ok: false, src: '' }` on failure and skip the `<img>` tag — the pass is still valid without a logo. Log the failure for the admin to diagnose.

**Warning signs:** Email send fails for all children when logo ID is wrong. Check Logger output.

### Pitfall 4: Temp Drive Files Not Cleaned Up

**What goes wrong:** Over many registrations, Drive fills up with `.html` temp files.

**Why it happens:** `tempFile.setTrashed(true)` is called after `getAs()` — but if an exception occurs between file creation and the trash call, the temp file is orphaned.

**How to avoid:** Wrap the PDF generation in try/catch, and call `setTrashed(true)` in a finally block, or always call it even if `getAs()` fails.

**Warning signs:** Growing list of `*-pass.html` files in the root of Drive.

### Pitfall 5: Page Size Not Matching Half-A4 Expectation

**What goes wrong:** PDF is full A4 portrait instead of landscape half-page, so 2 passes per printed page don't work.

**Why it happens:** `@page { size: A4; }` defaults to portrait. Without an explicit `size: A5 landscape` (or equivalent), the PDF is full-size portrait.

**How to avoid:** Include `@page { size: A5 landscape; margin: 8mm; }` in the HTML `<style>` block. A5 landscape (210mm × 148mm) is exactly half of A4, which allows 2 passes on one A4 sheet when printed at "fit to page."

**Warning signs:** PDF viewer shows a portrait A4 page for each pass.

### Pitfall 6: Submission ID Missing from buildPassHtml Parameters

**What goes wrong:** Submission ID doesn't appear on the pass, even though it's required by the decisions.

**Why it happens:** The current `buildPassHtml(childName, childAge, picnicConsent)` signature doesn't include `submissionId`. The existing function must be updated to accept and embed it.

**How to avoid:** Update the function signature to `buildPassHtml(childName, childAge, picnicConsent, submissionId, logoBase64)` and update all call sites accordingly.

---

## Code Examples

Verified patterns from official and community sources:

### Logo Fetch + Base64 Encode (once per registration)

```javascript
// Source: community.latenode.com/t/embedding-google-drive-images-in-html-with-apps-script
// Pattern: fetch once, pass to all children's PDFs
var LOGO_DRIVE_FILE_ID = ''; // Set this to the actual Drive file ID before deploying

function getLogoBase64() {
  if (!LOGO_DRIVE_FILE_ID) return { ok: false, src: '' };
  try {
    var blob = DriveApp.getFileById(LOGO_DRIVE_FILE_ID).getBlob();
    var encoded = Utilities.base64Encode(blob.getBytes());
    var mimeType = blob.getContentType() || 'image/png';
    return { ok: true, src: 'data:' + mimeType + ';base64,' + encoded };
  } catch (err) {
    Logger.log('getLogoBase64 failed: ' + err.message);
    return { ok: false, src: '' };
  }
}
```

### generatePassesForRegistration — Updated Call Pattern

```javascript
// Updated orchestrator: fetch logo once, pass to all children
function generatePassesForRegistration(data) {
  var logo = getLogoBase64(); // One Drive read, reused for all children
  return data.kids.map(function(kid) {
    return generatePassPdf(kid.name, kid.age, data.picnicConsent, data.submissionId, logo);
  });
}
```

### PDF Generation with Cleanup Guard

```javascript
// Source: GAS DriveApp official docs + community pattern
function generatePassPdf(childName, childAge, picnicConsent, submissionId, logo) {
  var html = buildPassHtml(childName, childAge, picnicConsent, submissionId, logo);
  var blob = Utilities.newBlob(html, 'text/html', childName + '-pass.html');
  var tempFile = DriveApp.createFile(blob);
  var pdfBlob;
  try {
    pdfBlob = tempFile.getAs('application/pdf')
                      .setName(childName + ' - VBS Pass 2026.pdf');
  } finally {
    tempFile.setTrashed(true); // Always clean up even if getAs throws
  }
  return pdfBlob;
}
```

### Print Color Adjust (Critical)

```css
/* Apply globally in <style> block to prevent background stripping */
* {
  print-color-adjust: exact;
  -webkit-print-color-adjust: exact;
}
@page {
  size: A5 landscape;
  margin: 8mm;
}
```

### Picnic Band — Active vs Greyed

```javascript
// Active (consent = Yes): gold band, dark text
var picnicBandActiveStyle =
  'background:#c9a227; color:#1a1a1a; font-weight:700; '
  + 'print-color-adjust:exact; -webkit-print-color-adjust:exact;';

// Greyed (consent = No): desaturated, opacity, strikethrough
var picnicBandGreyStyle =
  'background:#cccccc; color:#888888; opacity:0.45; '
  + 'text-decoration:line-through; '
  + 'print-color-adjust:exact; -webkit-print-color-adjust:exact;';

var picnicBandStyle = (picnicConsent === 'Yes') ? picnicBandActiveStyle : picnicBandGreyStyle;
```

---

## State of the Art

| Old Approach (current Code.gs) | New Approach (this phase) | Impact |
|-------------------------------|--------------------------|--------|
| Portrait card layout, single column | Landscape half-page ticket, two-column table | Matches user decision; printable 2-up |
| Picnic section absent when consent = "No" | Picnic band always rendered; greyed out when "No" | Satisfies PASS-06/PASS-07 |
| No logo | Logo embedded via base64 from Drive | Satisfies PASS-08 branding |
| No submission ID on pass | Submission ID in main body | Volunteer cross-reference capability |
| No jungle decorative element | Inline SVG or Unicode leaf accent on stub | Satisfies PASS-08 visual theme |
| Background colors unconstrained | `print-color-adjust: exact` on all colored elements | Colors actually appear in PDF |
| `buildPassHtml(childName, childAge, picnicConsent)` | `buildPassHtml(childName, childAge, picnicConsent, submissionId, logo)` | Correct parameter set |

**Note on existing code:** The current `buildPassHtml` and `generatePassPdf` in Code.gs are partially implemented stubs. They must be fully replaced, not patched. The `generatePassesForRegistration` function's structure (map over kids) is correct and can be retained with parameter updates.

---

## Open Questions

1. **Logo file MIME type**
   - What we know: `DriveApp.getFileById().getBlob().getContentType()` returns the MIME type string. Common values: `image/png`, `image/jpeg`.
   - What's unclear: The actual LOGO_DRIVE_FILE_ID is not set yet — it's a placeholder. The implementer must be told to fill it in.
   - Recommendation: Define `var LOGO_DRIVE_FILE_ID = '';` as a top-level constant in Code.gs (already mentioned in CONTEXT.md). The planner should include a task for the implementer to set this value. The code must handle an empty string gracefully (skip logo fetch, render pass without logo).

2. **Jungle/safari decorative element approach**
   - What we know: Claude's Discretion — placement and style not locked.
   - What's unclear: Whether an inline SVG leaf or a Unicode emoji (🌿, 🦁) renders correctly in the GAS PDF pipeline.
   - Recommendation: Use a simple inline SVG for the decorative element placed at low opacity in the stub column. Avoid CSS pseudo-elements. Test with an actual PDF export before finalizing. Unicode emoji rendering in WebKit PDF is inconsistent.

3. **Drive quota for temp file creation**
   - What we know: GAS has a 6-minute execution limit; Documents created: 250/day (consumer), 1,500/day (Workspace). For a VBS with ~50 registrations × ~3 children = 150 temp files created + trashed per day. Well within quota.
   - What's unclear: Whether `setTrashed()` counts against the creation quota.
   - Recommendation: At VBS scale, this is not a concern. Document the quota headroom in the code comment.

---

## Sources

### Primary (HIGH confidence)
- [Google Apps Script DriveApp official reference](https://developers.google.com/apps-script/reference/drive/drive-app) — File.getAs(), createFile(), setTrashed()
- [Google Apps Script Quotas](https://developers.google.com/apps-script/guides/services/quotas) — execution limits, file creation limits, email attachment limits
- [Google Apps Script HtmlService guide](https://developers.google.com/apps-script/guides/html) — HTML/CSS in GAS, IFRAME sandboxing restrictions

### Secondary (MEDIUM confidence)
- [labnol.org — Convert HTML to PDF with Google Script](https://www.labnol.org/code/19960-convert-html-to-pdf) — Verified that the `Utilities.newBlob → createFile → getAs` pattern is standard; confirmed HTML5 table tags work in PDF conversion
- [Latenode community — Embedding Google Drive images in HTML with Apps Script](https://community.latenode.com/t/embedding-google-drive-images-in-html-with-apps-script/22098) — Confirmed base64 data URI is the reliable approach; Drive URL sharing is unreliable

### Tertiary (LOW confidence — flag for validation)
- WebSearch result citing "webkit print removes background styling" — Consistent with well-known CSS print behavior. The `print-color-adjust: exact` workaround is verified by CSS specification and multiple general CSS sources, but not directly verified against the exact GAS PDF pipeline. **Validate by exporting a test PDF and checking if the green stub background appears.**
- WebSearch result citing CSS flexbox unreliable in GAS PDF — Not directly sourced from GAS docs. Based on general WebKit print behavior and community reports. **Validate by testing flex vs table layout in an actual GAS PDF export.**

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — DriveApp HTML-to-PDF is the documented GAS approach; no external libraries needed
- Architecture: HIGH — Table-based layout and base64 logo embedding are verified patterns
- CSS pitfalls (print-color-adjust): MEDIUM — Well-known CSS print behavior, not verified against exact GAS renderer
- Layout pitfalls (flexbox): MEDIUM — Based on general WebKit print behavior; validate with real export

**Research date:** 2026-04-06
**Valid until:** 2026-07-06 (GAS service APIs are stable; CSS rendering behavior unlikely to change in this period)
