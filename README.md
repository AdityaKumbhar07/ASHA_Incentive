# ASHA Incentive Report Generator

A web application designed to help **ASHA (Accredited Social Health Activist) workers** digitally fill out their monthly incentive reports, automatically calculate their salaries, and generate perfectly formatted Excel and PDF files based on official templates.

## 🌟 Key Features

### 👩‍⚕️ ASHA Worker Portal
*   **12-Month Dashboard:** A clear, interactive grid showing the status of reports for every month of the year.
*   **Smart Wizard:** A multi-step form to input daily data and targets.
*   **Auto-Calculation:** Automatically calculates achievements and total salary based on complex, hardcoded rules.
*   **Copy from Past Months:** Instantly pre-fill a new month's report using data from any previous month.
*   **Auto-Save to Cloud:** Progress is automatically saved securely to the cloud.

### 👑 Admin Panel
*   **Role-Based Security:** Administrators have a completely separate, secure dashboard.
*   **Worker Management:** Admins can create and delete ASHA worker profiles (assigning permanent details like PHC, Sub Center, Village, etc.).
*   **Drill-Down Access:** Admins can click into any specific worker's profile to view or edit their 12-month grid and reports on their behalf.

### 📄 Export System
*   **Pixel-Perfect Excel:** Injects data directly into the official `template.xlsx` file, preserving all original complex formulas, shared strings, and formatting.
*   **PDF Generation:** Uses a dedicated LibreOffice headless backend to convert the filled Excel sheets into perfectly paginated PDFs.

---

## 🏗️ Architecture & Tech Stack

*   **Frontend:** React, Vite, React Router
*   **Database & Auth:** Google Firebase (Authentication + Firestore)
*   **Excel Processing:** JSZip (Direct XML manipulation to preserve template integrity)
*   **PDF Backend:** A lightweight Node.js/Express server running a LibreOffice Docker container (Deployed on Render).

---
