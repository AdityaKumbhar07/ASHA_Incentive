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

## 🚀 Setup & Local Development

### 1. Prerequisites
*   Node.js installed
*   A Firebase Project with Authentication (Email/Password) and Firestore enabled.
*   (Optional) The PDF-generation backend running either locally via Docker or hosted on a server.

### 2. Installation
Clone the repository and install the dependencies:
```bash
npm install
```

### 3. Firebase Configuration
Ensure your `src/config/firebase.js` is correctly pointing to your active Firebase project.

### 4. Run the Development Server
```bash
npm run dev
```

### 5. Setting up the First Admin
To access the Admin Panel for the first time, you must manually upgrade an account via the Firebase Console:
1. Create a user normally via Authentication.
2. Copy their UID.
3. In Firestore, create a document in the `users` collection where the Document ID is the UID.
4. Add the fields: `role: "admin"`, `username: "admin"`, `ashaName: "Master Admin"`.
5. Log into the app to access the Admin Dashboard.
