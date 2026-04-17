# 🩺 HealthScreen: Geriatric Clinical Assessment Tool

**HealthScreen** is a comprehensive, interactive React-based web application designed for healthcare professionals to efficiently conduct geriatric health screenings. The application digitizes 14 validated clinical assessment tools based on the **Ministry of Public Health (MoPH), Thailand (2021)** guidelines.


## ✨ Key Features

* **Comprehensive Assessment Suite**: 14 digitized screening tools covering Cognitive Function, Nutrition, Functional Abilities, General Health, Geriatric Syndromes, and Mental Health.
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

2. Google Sheets Integration
The app requires a Google Apps Script deployment to save data.

Create a new Google Sheet.

Go to Extensions > Apps Script.

Paste the contents of your Code.gs into the editor.

Add your Google Sheet ID to the Script Properties (Project Settings > Script Properties > Key: SPREADSHEET_ID).

Click Deploy > New Deployment, select "Web app", set access to "Anyone", and copy the Web App URL.

3. Environment Variables
Create a .env file in the root directory and add your Google Apps Script URL:

```bash
VITE_SCRIPT_URL=your_google_apps_script_web_app_url_here
```
4. Run the App
Start the development server:
```bash
npm run dev
```
⚖️ Disclaimer
This application is designed as a screening tool only and does not provide formal medical diagnoses. All interpretations should be reviewed by qualified healthcare professionals.

References: Guidelines for Geriatric Screening and Assessment, Department of Medical Services, Ministry of Public Health, Thailand (2021).
