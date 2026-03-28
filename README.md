# 🧠 DementiaEval — Cognitive Screening Tool

A web-based cognitive screening application for early dementia detection, built with React + Vite. Supports three validated clinical tools: **Mini-Cog™**, **TMSE**, and **MoCA**. Results are automatically saved to Google Sheets.

---

## ✨ Features

- **Mini-Cog™** — 3-word recall + clock drawing test (5 pts)
- **TMSE** — Thai Mental State Examination, 6 domains (30 pts)
- **MoCA** — Montreal Cognitive Assessment, 7 domains (30 pts)
- 📊 Auto-save results to Google Sheets
- 📥 Export all results as CSV
- ⏱ Built-in timer for each test
- 🎨 Clean, mobile-friendly UI in Thai language
- 🔒 Sensitive config stored in `.env` and Apps Script Properties

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
cd YOUR_REPO_NAME/diagnosing
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

Edit `.env`:

```bash
VITE_SCRIPT_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_URL/exec
```

### 4. Run the development server

```bash
npm run dev
```

---

## 🔧 Google Sheets Setup

### Apps Script

1. Open your Google Sheet
2. Go to **Extensions** → **Apps Script**
3. Paste the contents of `apps-script/Code.gs`
4. Go to **Project Settings** → **Script Properties** and add:

| Property | Value |
|---|---|
| `SPREADSHEET_ID` | Your Google Sheet ID |
| `SHEET_NAME` | `Result` (or your sheet tab name) |

5. Click **Deploy** → **New deployment** → **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
6. Copy the deployment URL → paste into your `.env` as `VITE_SCRIPT_URL`

---

## 📁 Project Structure

```
diagnosing/
├── src/
│   ├── App.jsx          # Main app, navigation, results page
│   ├── MiniCogQuiz.jsx  # Mini-Cog™ test
│   ├── TMSEQuiz.jsx     # TMSE test
│   ├── MoCAQuiz.jsx     # MoCA test
│   ├── assets/          # Images (lion, rhino, camel, nurse)
│   └── index.css        # Global styles + CSS variables
├── .env                 # ← NOT committed (gitignored)
├── .env.example         # ← Safe template (committed)
└── package.json
```

---

## 🧪 Scoring Criteria

| Test | Max Score | Impaired If |
|---|---|---|
| Mini-Cog™ | 5 | ≤ 3 |
| TMSE | 30 | < 24 |
| MoCA | 30 | < 25 |

> ⚠️ This tool is for **screening purposes only** and is not a medical diagnosis.

---

## 🔒 Security

- `VITE_SCRIPT_URL` is stored in `.env` (gitignored)
- `SPREADSHEET_ID` and `SHEET_NAME` are stored in Apps Script `PropertiesService`
- No sensitive data is hardcoded in source files

---

## 📜 Credits

- **Mini-Cog™** © S. Borson
- **MoCA** © Z. Nasreddine MD · [www.mocatest.org](https://www.mocatest.org) · Thai translation by Solaphat Hemrungrojn MD
- **TMSE** — สารศิริราช 45(6) มิถุนายน 2536 : 359-374

---

## 📄 License

MIT
