# 🩺 HealthScreen: Geriatric Clinical Assessment Tool

**HealthScreen** is a comprehensive, interactive React-based web application designed for healthcare professionals to efficiently conduct geriatric health screenings. The application digitizes 15 validated clinical assessment tools based on the **Ministry of Public Health (MoPH), Thailand (2021)** guidelines.

📖 **คู่มือการใช้งาน (ภาษาไทย)**: [docs/MANUAL.docx](docs/MANUAL.docx) (ไฟล์ Word พร้อมภาพหน้าจอจริง) · ต้นฉบับแก้ไขข้อความ: [docs/MANUAL.md](docs/MANUAL.md)


## ✨ Key Features

* **Comprehensive Assessment Suite**: 15 digitized screening tools covering Cognitive Function, Nutrition, Functional Abilities, General Health, Geriatric Syndromes, and Mental Health.
* **Interactive UI**: 
  * 🎨 **Digital Drawing Canvas**: Built-in full-screen canvas for visual tests like Clock Drawing (Mini-Cog/MoCA), Intersecting Pentagons (MMSE), and Cube Copying.
  * ⏱️ **Integrated Stopwatch**: Built-in timer for the Timed Up and Go Test (TUGT).
* **Smart Scoring Logic**: Automatic score calculation and interpretation (e.g., dynamic cut-off scores based on education level in MMSE).
* **Cloud Database Integration**: Seamlessly saves patient data and test results directly to Google Sheets via Google Apps Script.
* **Data Management**: Dashboard to view history, filter results, and export data to CSV.
* **Responsive Design**: Optimized for tablets and mobile devices used in clinical settings.

## 📋 Included Screening Tools

**🧠 Cognitive Function**
* **Mini-Cog™**: 3-item recall and clock drawing test.
* **TMSE** (Thai Mental State Examination).
* **MMSE-Thai 2002**: Mini-Mental State Examination (Education-adjusted cut-offs).
* **MoCA**: Montreal Cognitive Assessment.

**🥗 Nutrition & Muscle**
* **MNA** (Mini Nutritional Assessment): Short & Full forms.
* **Modified MSRA-5**: Sarcopenia risk assessment.

**🛌 Functional & Frailty**
* **Barthel ADL Index**: Activities of Daily Living.
* **Frail Scale**: 5-item frailty screening.

**🏥 General Health**
* **Oral Health Assessment** (8 items).
* **Eye Health & Vision** (Snellen chart integration).
* **Bone & Joint**: Osteoarthritis, OSTA Index, FRAX Score.

**🚶‍♂️ Geriatric Syndromes**
* **TUGT** (Timed Up and Go Test) for fall risk.

**❤️‍🩹 Mental Health**
* **Depression**: 2Q (Screening) & 9Q (Severity).
* **Suicide Risk**: 8Q.
* **TAI** (Typology of Aged with Illustration): 4-domain dependency screening classifying into 9 subgroups (B5–B3 / C4–C2 / I3–I1) mapped to NHSO long-term care groups 1–4.

## 🚀 Tech Stack

* **Frontend**: React (Vite)
* **Styling**: Inline CSS / Custom CSS Variables (Tailwind-inspired)
* **Backend/Database**: Google Apps Script & Google Sheets
* **Deployment**: Vercel / Netlify (Recommended)

## ⚙️ Installation & Setup

### 1. Local Development
Clone the repository and install dependencies:

```bash
git clone <your-repo-url>
cd healthscreen
npm install
```

### 2. Google Sheets Integration
The app requires a Google Apps Script deployment to save data.

1. Create a new Google Sheet.
2. Go to **Extensions → Apps Script** and paste the contents of [`apps-script/Code.gs`](apps-script/Code.gs).
3. **Project Settings → Script Properties**: add `SPREADSHEET_ID` (and optionally `SHEET_NAME`, defaults to `Result`).
4. **Deploy → New deployment → Web app**, set *Who has access* to **Anyone**, and copy the `/exec` URL.

The script is deliberately schema-agnostic: it matches incoming JSON keys against the
header row and appends any column it hasn't seen before. **Adding a screening tool or a
new field never requires editing or redeploying it** — the schema lives entirely in
[`diagnosing/src/shared/sheetSchema.js`](diagnosing/src/shared/sheetSchema.js).

### 3. Environment Variables
Create a `.env` file inside `diagnosing/` (copy `.env.example`) and add your Web App URL:

```bash
VITE_SCRIPT_URL=your_google_apps_script_web_app_url_here
```

`VITE_*` values are baked in at build time — restart the dev server (or rebuild) after changing them.
4. Run the App
Start the development server:
```bash
npm run dev
```
⚖️ Disclaimer
This application is designed as a screening tool only and does not provide formal medical diagnoses. All interpretations should be reviewed by qualified healthcare professionals.

References: Guidelines for Geriatric Screening and Assessment, Department of Medical Services, Ministry of Public Health, Thailand (2021).
