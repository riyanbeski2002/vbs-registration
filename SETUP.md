# VBS Registration — Setup Guide

## Quick Start

### Step 1 — Create Google Sheet

1. Go to [sheets.google.com](https://sheets.google.com) and create a new spreadsheet
2. Name it something like **VBS 2026 Registrations**
3. The Apps Script will automatically create the **Registrations** tab with column headers on first submission

### Step 2 — Add Google Apps Script

1. In your Google Sheet, click **Extensions → Apps Script**
2. Delete all existing content in `Code.gs`
3. Copy the entire contents of `apps-script/Code.gs` from this project and paste it
4. Click **Save** (Ctrl+S or Cmd+S)

### Step 3 — Deploy Apps Script as Web App

1. Click **Deploy → New Deployment**
2. Click the gear icon next to "Type" and select **Web App**
3. Set:
   - **Description**: VBS Registration API
   - **Execute as**: Me (your Google account)
   - **Who has access**: Anyone
4. Click **Deploy**
5. You will be asked to authorize permissions — click **Authorize access** and follow the prompts
6. **Copy the Web App URL** — it looks like:
   ```
   https://script.google.com/macros/s/AKfycby.../exec
   ```

> ⚠️ **Important**: If you update the script code later, always go to **Deploy → Manage Deployments** and edit the **existing** deployment. Do NOT create a new deployment — it will change the URL and break the form.

### Step 4 — Configure the Frontend

Create a `.env.local` file in the project root:

```bash
NEXT_PUBLIC_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

Replace `YOUR_DEPLOYMENT_ID` with the actual ID from Step 3.

### Step 5 — Add Your UPI QR Code

1. Get your church's UPI QR code image (PNG, JPG, or WebP recommended)
2. Open `components/PaymentSection.tsx`
3. Find this line near the top:
   ```ts
   const QR_CODE_SRC = '/qr-placeholder.svg';
   ```
4. Replace `qr-placeholder.svg` with your QR image filename, e.g.:
   ```ts
   const QR_CODE_SRC = '/church-upi-qr.png';
   ```
5. Place your QR image in the `public/` folder

### Step 6 — Change Registration Fee (if needed)

Open `lib/config.ts` and update this line:

```ts
export const REGISTRATION_FEE_PER_CHILD = 300; // change this number
```

The fee will automatically update everywhere on the form.

---

## Deploy to Vercel

1. Push this project to a GitHub repository:
   ```bash
   git add .
   git commit -m "Initial VBS registration app"
   git push
   ```

2. Go to [vercel.com](https://vercel.com) → **Add New Project** → Import your GitHub repo

3. In the deployment settings, add an **Environment Variable**:
   - Name: `NEXT_PUBLIC_APPS_SCRIPT_URL`
   - Value: your Apps Script Web App URL

4. Click **Deploy**

5. Your form is now live at the Vercel URL!

---

## Test the Full Flow

1. Open your form URL
2. Fill in all fields with test data
3. Use a small test image as the payment screenshot
4. Submit the form
5. Check:
   - ✅ Success message with reference ID appears on screen
   - ✅ New row appears in your Google Sheet (Registrations tab)
   - ✅ Payment screenshot file appears in Google Drive → "VBS Payment Screenshots 2026" folder

---

## Ongoing Admin

### Viewing registrations
Open your Google Sheet — all registrations appear in the **Registrations** tab.

### Updating status
In the **Status** column, change "Pending Review" to "Confirmed" or "Rejected" as you verify payments.

### Accessing payment screenshots
Each row has a **Payment Screenshot URL** — click it to view the uploaded payment proof in Google Drive.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Form submits but nothing appears in Sheet | Check that Apps Script URL is correct in `.env.local`; check Apps Script execution logs (Extensions → Apps Script → Executions) |
| CORS error in browser console | Make sure `Content-Type: text/plain` is being sent (it is by default in this code); verify Apps Script is deployed as "Anyone" access |
| "Unknown font" build error | Use `Fredoka` not `Fredoka_One` in layout.tsx (already fixed) |
| File upload fails | Check file is under 5 MB and is JPG/PNG/WebP/PDF |
| Script authorization error | Re-authorize in Apps Script (Run → Review Permissions) |

---

## Customization

| What to change | Where |
|---------------|-------|
| Registration fee | `lib/config.ts` — `REGISTRATION_FEE_PER_CHILD` |
| UPI QR code image | `public/` folder + update path in `components/PaymentSection.tsx` |
| Consent text | `components/ConsentSection.tsx` |
| Page title/subtitle | `components/HeroSection.tsx` |
| Drive folder name | `apps-script/Code.gs` — `DRIVE_FOLDER_NAME` |
| Sheet tab name | `apps-script/Code.gs` — `SHEET_NAME` |
| Colors | `app/globals.css` — `@theme` block |
