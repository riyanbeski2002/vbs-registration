// ============================================================
// VBS Registration — Google Apps Script Backend
// ============================================================
// SETUP INSTRUCTIONS:
// 1. Open your Google Sheet
// 2. Go to Extensions > Apps Script
// 3. Replace the Code.gs content with this file
// 4. Click Deploy > Manage Deployments > edit existing deployment
//    (or New Deployment if first time)
//    - Type: Web App
//    - Execute as: Me
//    - Who has access: Anyone
// 5. Authorize all permissions (Drive + Sheets)
// 6. Copy the Web App URL into your Vercel env var: NEXT_PUBLIC_APPS_SCRIPT_URL
//
// IMPORTANT: When updating this code, always edit the EXISTING deployment.
// Creating a new deployment changes your URL and breaks the frontend.
// ============================================================

var SHEET_NAME = 'Registrations';
var DRIVE_FOLDER_NAME = 'VBS Payment Screenshots 2026';
var STATUS_COLUMN = 21;
var APPROVED_VAL = 'Approved';
var CHURCH_ADDRESS = '107, 5th Cross Rd, Chinnapanahalli Main Rd, Doddanekundi, Marathahalli, Bengaluru, Karnataka 560037';

/**
 * Handles POST requests from the registration form.
 */
function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);

    // ── Validate required fields ──────────────────────────────
    if (!payload.parentName || !payload.phone || !payload.kids || !payload.file) {
      throw new Error('Missing required fields');
    }
    if (!Array.isArray(payload.kids) || payload.kids.length === 0) {
      throw new Error('At least one child is required');
    }

    // ── Save payment screenshot to Google Drive ───────────────
    var fileData  = payload.file;
    var decoded   = Utilities.base64Decode(fileData.base64Content);
    var blob      = Utilities.newBlob(decoded, fileData.mimeType, fileData.filename);
    var folder    = getOrCreateFolder(DRIVE_FOLDER_NAME);
    var driveFile = folder.createFile(blob);
    driveFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    var fileUrl = driveFile.getUrl();

    // ── Flatten kid arrays ────────────────────────────────────
    var kidNames      = payload.kids.map(function(k) { return k.name; }).join(', ');
    var kidAges       = payload.kids.map(function(k) { return k.age; }).join(', ');
    var kidGenders    = payload.kids.map(function(k) { return k.gender; }).join(', ');
    var medConditions = payload.kids.map(function(k) { return k.medicalCondition || 'None'; }).join(', ');
    var allergies     = payload.kids.map(function(k) { return k.allergies || 'None'; }).join(', ');
    var numKids       = payload.kids.length;

    // ── Generate submission ID ────────────────────────────────
    var submissionId = 'VBS-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);

    // ── Append to Sheet ───────────────────────────────────────
    var sheet = getOrCreateSheet();
    sheet.appendRow([
      new Date(),                                        // 1  Timestamp
      payload.parentName,                                // 2  Parent Name
      payload.phone,                                     // 3  Primary Phone
      payload.secondaryPhone || '',                      // 4  Secondary Phone
      payload.email || '',                               // 5  Email
      payload.firstTimeAttending || '',                  // 6  First Time Attending
      payload.regularChurchMember || '',                 // 7  Regular Church Member
      numKids,                                           // 8  Number of Kids
      kidNames,                                          // 9  Kid Names
      kidAges,                                           // 10 Kid Ages
      kidGenders,                                        // 11 Kid Genders
      medConditions,                                     // 12 Medical Conditions
      allergies,                                         // 13 Allergies
      payload.totalAmount,                               // 14 Total Amount (₹)
      payload.consentGeneral ? 'Yes' : 'No',             // 15 General Consent
      payload.consentPicnic  ? 'Yes' : 'No',             // 16 Picnic Consent
      payload.consentPhoto   ? 'Yes' : 'No',             // 17 Photo/Video Consent
      payload.pickupAuthorization || '',                 // 18 Pickup Authorization
      fileUrl,                                           // 19 Payment Screenshot URL
      submissionId,                                      // 20 Submission ID
      'Pending Review'                                   // 21 Status
    ]);

    return jsonResponse({ success: true, submissionId: submissionId });

  } catch (err) {
    Logger.log('VBS Registration Error: ' + err.message);
    return jsonResponse({ success: false, error: err.message });
  }
}

/**
 * Health check — GET request.
 */
function doGet() {
  return jsonResponse({ status: 'ok', message: 'VBS Registration API is running' });
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function getOrCreateFolder(name) {
  var iter = DriveApp.getFoldersByName(name);
  return iter.hasNext() ? iter.next() : DriveApp.createFolder(name);
}

function getOrCreateSheet() {
  var ss    = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow([
      'Timestamp',
      'Parent Name',
      'Primary Phone',
      'Secondary Phone',
      'Email',
      'First Time Attending',
      'Regular Church Member',
      'Number of Kids',
      'Kid Names',
      'Kid Ages',
      'Kid Genders',
      'Medical Conditions',
      'Allergies',
      'Total Amount (₹)',
      'General Consent',
      'Picnic Consent',
      'Photo/Video Consent',
      'Pickup Authorization',
      'Payment Screenshot URL',
      'Submission ID',
      'Status'
    ]);

    var headerRange = sheet.getRange(1, 1, 1, 21);
    headerRange.setBackground('#0f2d1a');
    headerRange.setFontColor('#ffffff');
    headerRange.setFontWeight('bold');
    sheet.setFrozenRows(1);

    // Auto-resize columns for readability
    sheet.autoResizeColumns(1, 21);
  }

  return sheet;
}

function generateSubmissionId() {
  var year   = new Date().getFullYear();
  var digits = Math.floor(1000 + Math.random() * 9000);
  return 'VBS-' + year + '-' + digits;
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── Phase 1: Trigger ─────────────────────────────────────────────────────────

/**
 * Run this ONCE from the Apps Script editor to install the approval trigger.
 * Safe to run multiple times — deletes any existing trigger before creating a new one.
 */
function installTrigger() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  // Remove any existing onApprovalEdit triggers to prevent duplicates
  ScriptApp.getProjectTriggers().forEach(function(t) {
    if (t.getHandlerFunction() === 'onApprovalEdit') {
      ScriptApp.deleteTrigger(t);
    }
  });
  ScriptApp.newTrigger('onApprovalEdit')
    .forSpreadsheet(ss)
    .onEdit()
    .create();
  Logger.log('installTrigger: trigger installed successfully');
}

/**
 * Diagnostic helper — logs all installed triggers for this project.
 */
function listTriggers() {
  ScriptApp.getProjectTriggers().forEach(function(t) {
    Logger.log('Trigger: ' + t.getHandlerFunction() + ' | type: ' + t.getEventType());
  });
}

/**
 * Installable onEdit handler. Fires when any cell is edited.
 * Guards ensure it only acts when Status (col 21) is set to "Approved".
 */
function onApprovalEdit(e) {
  // Guard 1: null safety
  if (!e || !e.range) return;
  // Guard 2: correct sheet
  if (e.range.getSheet().getName() !== SHEET_NAME) return;
  // Guard 3: single-cell edit only (multi-cell paste leaves e.value undefined)
  if (e.range.getNumRows() !== 1 || e.range.getNumColumns() !== 1) return;
  // Guard 4: correct column
  if (e.range.getColumn() !== STATUS_COLUMN) return;
  // Guard 5: skip header row
  if (e.range.getRow() <= 1) return;
  // Guard 6: value must be exactly "Approved"
  if (e.value !== APPROVED_VAL) return;

  var row = e.range.getRow();
  Logger.log('TRIG-01: Approval detected on row ' + row);

  var data = readRegistrationRow(row);
  sendApprovalEmail(data, row);
}

/**
 * Reads a registration row and returns a typed plain object.
 * Column mapping matches the appendRow() in doPost().
 */
function readRegistrationRow(row) {
  var sheet  = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  var values = sheet.getRange(row, 1, 1, 21).getValues()[0];

  var kidNames = String(values[8]).split(',').map(function(s) { return s.trim(); });
  var kidAges  = String(values[9]).split(',').map(function(s) { return s.trim(); });

  var kids = kidNames.map(function(name, i) {
    return { name: name, age: kidAges[i] || '' };
  });

  return {
    parentName:   String(values[1]),
    parentEmail:  String(values[4]),
    numKids:      Number(values[7]),
    kids:         kids,
    picnicConsent: String(values[15]),   // col 16 — "Yes" or "No"
    submissionId: String(values[19]),    // col 20
    totalAmount:  values[13],            // col 14
  };
}

// ── Phase 2: PDF Pass Generator ───────────────────────────────────────────────

var LOGO_DRIVE_FILE_ID = ''; // Set to the Google Drive file ID of the church logo before deploying

/**
 * Fetches the church logo from Google Drive and returns it as a base64 data URI.
 * Returns { ok: true, src: 'data:image/...;base64,...' } on success.
 * Returns { ok: false, src: '' } if LOGO_DRIVE_FILE_ID is unset or fetch fails.
 * Safe to call even when no logo is configured — pass renders without logo.
 */
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

/**
 * Builds the HTML string for a single child's VBS pass.
 * Produces a landscape A5 event-ticket layout using an HTML table (two columns):
 *   - Left stub: jungle green background, child name, age, admission label, optional logo, SVG leaf accent
 *   - Right body: church name, event title, dates, address, submission ID, picnic band
 * The picnic band is ALWAYS rendered — gold/active when consent="Yes", greyed/strikethrough when "No".
 * print-color-adjust: exact is applied globally and inline on all colored elements so the green
 * stub and gold band survive the GAS WebKit PDF renderer's background-stripping behavior.
 */
function buildPassHtml(childName, childAge, picnicConsent, submissionId, logo) {
  var picnicActive = (picnicConsent === 'Yes');
  var picnicStyle = picnicActive
    ? 'background:#c9a227;color:#1a1a1a;font-weight:700;print-color-adjust:exact;-webkit-print-color-adjust:exact;'
    : 'background:#cccccc;color:#888888;opacity:0.45;text-decoration:line-through;print-color-adjust:exact;-webkit-print-color-adjust:exact;';

  var logoHtml = logo.ok
    ? '<img src="' + logo.src + '" style="height:40px;margin-bottom:8px;display:block;margin-left:auto;margin-right:auto;" />'
    : '';

  // Inline SVG leaf silhouette — decorative jungle accent at low opacity
  // Uses a real HTML element (not ::before/::after) for WebKit PDF compatibility
  var leafSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" '
    + 'style="opacity:0.18;display:block;margin:0 auto 6px auto;" fill="#ffffff">'
    + '<path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20c7 0 '
    + '12-8 12-8a22.29 22.29 0 0 1-3 5.4C15.59 19 14 21 12 21a3.38 3.38 0 0 1-1.53-.36'
    + 'C9.27 22.23 8.31 23 7 23a3 3 0 0 1-3-3c0-1 .46-1.87 1.17-2.51C5.06 17.16 5 16.59 '
    + '5 16c0-5.52 6-10 12-10z"/>'
    + '</svg>';

  return '<!DOCTYPE html>'
    + '<html><head><meta charset="UTF-8">'
    + '<style>'
    + '* { box-sizing: border-box; print-color-adjust: exact; -webkit-print-color-adjust: exact; }'
    + '@page { size: A5 landscape; margin: 8mm; }'
    + 'body { margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background: #ffffff; }'
    + '</style>'
    + '</head><body>'

    // ── Two-column ticket table (no flexbox — WebKit PDF safe) ──
    + '<table width="100%" style="border-collapse:collapse;height:100%;">'
    + '<tr>'

    // ── Left stub: jungle green ──
    + '<td width="28%" style="background:#1a5c38;color:#ffffff;vertical-align:middle;text-align:center;'
    + 'padding:16px 10px;print-color-adjust:exact;-webkit-print-color-adjust:exact;">'
    + logoHtml
    + leafSvg
    + '<div style="font-size:22px;font-weight:700;line-height:1.2;margin-bottom:6px;">' + childName + '</div>'
    + '<div style="font-size:13px;font-weight:600;color:#a3d9b1;">Age: ' + childAge + ' yrs</div>'
    + '<div style="margin-top:14px;font-size:9px;letter-spacing:0.15em;text-transform:uppercase;color:#5a9c76;">Admission Pass</div>'
    + '</td>'

    // ── Right body: white ──
    + '<td width="72%" style="background:#ffffff;vertical-align:top;padding:16px 18px;">'
    + '<div style="font-size:9px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#1a5c38;margin-bottom:2px;">El Bethel AG International Church</div>'
    + '<div style="font-size:18px;font-weight:700;color:#c9a227;margin-bottom:10px;">Vacation Bible School 2026</div>'
    + '<div style="font-size:12px;font-weight:700;color:#1a5c38;margin-bottom:2px;">May 11 - 15, 2026</div>'
    + '<div style="font-size:11px;color:#374151;margin-bottom:8px;">Monday to Friday &nbsp;&middot;&nbsp; 10:00 AM - 1:00 PM</div>'
    + '<div style="font-size:10px;color:#6b7280;margin-bottom:10px;">107, 5th Cross Rd, Chinnapanahalli Main Rd,<br>Doddanekundi, Marathahalli, Bengaluru 560037</div>'
    + '<div style="font-size:10px;color:#9ca3af;">Ref: ' + submissionId + '</div>'

    // ── Picnic band — always rendered, style differs by consent ──
    + '<div style="margin-top:12px;padding:6px 12px;text-align:center;font-size:11px;'
    + 'letter-spacing:0.1em;text-transform:uppercase;border-radius:4px;' + picnicStyle + '">'
    + 'Day 5 - Full Day Picnic'
    + '</div>'

    + '</td>'
    + '</tr>'
    + '</table>'
    + '</body></html>';
}

/**
 * Generates a PDF blob for one child's pass.
 * Creates a temporary HTML file in Drive, exports it as PDF, then trashes the temp file.
 * The finally block guarantees temp file cleanup even if getAs() throws an exception.
 */
function generatePassPdf(childName, childAge, picnicConsent, submissionId, logo) {
  var html = buildPassHtml(childName, childAge, picnicConsent, submissionId, logo);
  var tempFile = DriveApp.createFile(
    Utilities.newBlob(html, 'text/html', childName + '-pass.html')
  );
  var pdfBlob;
  try {
    pdfBlob = tempFile.getAs('application/pdf').setName(childName + ' - VBS Pass 2026.pdf');
  } finally {
    tempFile.setTrashed(true);
  }
  return pdfBlob;
}

/**
 * Generates PDF passes for all children in a registration.
 * Fetches the church logo ONCE (one Drive read) then passes it to each child's PDF generation.
 * Returns an array of PDF blobs ready to attach to an email.
 */
function generatePassesForRegistration(data) {
  var logo = getLogoBase64();
  return data.kids.map(function(kid) {
    return generatePassPdf(kid.name, kid.age, data.picnicConsent, data.submissionId, logo);
  });
}

// ── Phase 3: Email Delivery + Guard ──────────────────────────────────────────

/**
 * Sends the approval email with all children's PDF passes attached.
 * Updates the status cell to "Approved — Email Sent" on success.
 * Logs errors without changing the status cell on failure.
 */
function sendApprovalEmail(data, row) {
  try {
    var passPdfs = generatePassesForRegistration(data);

    var kidList = data.kids.map(function(k, i) {
      return (i + 1) + '. ' + k.name + ' (Age ' + k.age + ')';
    }).join('\n');

    var subject = 'VBS 2026 Registration Approved — ' + data.parentName;

    var body = 'Dear ' + data.parentName + ',\n\n'
      + 'Great news! Your registration for Jungle Safari VBS 2026 has been approved.\n\n'
      + '--- Registration Details ---\n'
      + 'Reference ID : ' + data.submissionId + '\n'
      + 'Children registered:\n' + kidList + '\n\n'
      + '--- Event Details ---\n'
      + 'Dates  : May 11 – 15, 2026 (Monday to Friday)\n'
      + 'Time   : 10:00 AM – 1:00 PM\n'
      + (data.picnicConsent === 'Yes' ? 'Day 5  : Full Day Picnic (May 15, 2026)\n' : '')
      + 'Venue  : El Bethel AG International Church\n'
      + '         ' + CHURCH_ADDRESS + '\n\n'
      + 'Please find the VBS admission pass(es) attached to this email — one per child.\n'
      + 'Print and bring them on the first day.\n\n'
      + 'We look forward to seeing your child(ren) at the Jungle Safari!\n\n'
      + 'Warm regards,\n'
      + 'El Bethel AG International Church\n'
      + 'VBS 2026 Team';

    GmailApp.sendEmail(data.parentEmail, subject, body, {
      attachments: passPdfs,
      name: 'El Bethel VBS 2026',
    });

    // Mark as sent so re-editing "Approved" doesn't trigger another send
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    sheet.getRange(row, STATUS_COLUMN).setValue('Approved — Email Sent');

    Logger.log('sendApprovalEmail: email sent to ' + data.parentEmail + ' for ' + data.submissionId);

  } catch (err) {
    Logger.log('sendApprovalEmail ERROR for row ' + row + ': ' + err.message);
    // Status cell is NOT changed — admin can retry by re-setting to "Approved"
  }
}
