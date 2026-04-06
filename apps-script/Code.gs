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

/**
 * Builds the HTML string for a single child's VBS pass.
 * Every piece of data is its own element — no text burned onto an image.
 */
function buildPassHtml(childName, childAge, picnicConsent) {
  var picnicSection = picnicConsent === 'Yes'
    ? '<div style="margin-top:20px;border:2px solid #c8a84b;border-radius:8px;padding:14px 18px;background:#fffbea;">'
      + '<div style="font-size:11px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:#92610a;margin-bottom:4px;">Day 5 — Full Day Picnic Pass</div>'
      + '<div style="font-size:13px;color:#78350f;font-weight:600;">May 15, 2026 &nbsp;·&nbsp; All Day</div>'
      + '<div style="font-size:11px;color:#a16207;margin-top:4px;">This pass admits the child to the Day 5 picnic event.</div>'
      + '</div>'
    : '';

  return '<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="margin:0;padding:0;font-family:Georgia,serif;background:#f5f5f5;">'
    + '<div style="width:520px;margin:30px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 18px rgba(0,0,0,0.12);">'

    // ── Header ──
    + '<div style="background:#0f2d1a;padding:20px 24px;">'
    + '<div style="font-size:10px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#a3d9b1;margin-bottom:4px;">El Bethel AG International Church</div>'
    + '<div style="font-size:20px;font-weight:700;color:#c8a84b;letter-spacing:0.06em;">Jungle Safari VBS 2026</div>'
    + '</div>'

    // ── Admission label ──
    + '<div style="background:#2d7a4f;padding:8px 24px;">'
    + '<div style="font-size:10px;font-weight:800;letter-spacing:0.22em;text-transform:uppercase;color:#d4f7e2;">Admission Pass</div>'
    + '</div>'

    // ── Child details ──
    + '<div style="padding:22px 24px 0;">'
    + '<div style="font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#6b7280;margin-bottom:6px;">Child</div>'
    + '<div style="font-size:24px;font-weight:700;color:#0f2d1a;margin-bottom:2px;">' + childName + '</div>'
    + '<div style="font-size:14px;color:#374151;font-weight:600;">Age: ' + childAge + ' years</div>'
    + '</div>'

    // ── Divider ──
    + '<div style="margin:18px 24px;border-top:1.5px solid #e5e7eb;"></div>'

    // ── Event details ──
    + '<div style="padding:0 24px;">'
    + '<div style="font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#6b7280;margin-bottom:10px;">Event Details</div>'
    + '<div style="font-size:14px;color:#111827;font-weight:600;margin-bottom:4px;">May 11 – 15, 2026</div>'
    + '<div style="font-size:13px;color:#374151;margin-bottom:4px;">Monday to Friday &nbsp;·&nbsp; 10:00 AM – 1:00 PM</div>'
    + '<div style="font-size:12px;color:#6b7280;margin-top:8px;">' + CHURCH_ADDRESS + '</div>'
    + '</div>'

    // ── Picnic section (conditional) ──
    + '<div style="padding:0 24px 24px;">'
    + picnicSection
    + '</div>'

    // ── Footer ──
    + '<div style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:12px 24px;text-align:center;">'
    + '<div style="font-size:10px;color:#9ca3af;">We look forward to seeing you! &nbsp;·&nbsp; vbs-chi.vercel.app</div>'
    + '</div>'

    + '</div></body></html>';
}

/**
 * Generates a PDF blob for one child's pass.
 * Creates a temporary HTML file in Drive, exports it as PDF, then trashes the temp file.
 */
function generatePassPdf(childName, childAge, picnicConsent) {
  var html = buildPassHtml(childName, childAge, picnicConsent);
  var tempFile = DriveApp.createFile(
    Utilities.newBlob(html, 'text/html', childName + '-pass.html')
  );
  var pdfBlob = tempFile.getAs('application/pdf').setName(childName + ' - VBS Pass 2026.pdf');
  tempFile.setTrashed(true);
  return pdfBlob;
}

/**
 * Generates PDF passes for all children in a registration.
 * Returns an array of PDF blobs ready to attach to an email.
 */
function generatePassesForRegistration(data) {
  return data.kids.map(function(kid) {
    return generatePassPdf(kid.name, kid.age, data.picnicConsent);
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
