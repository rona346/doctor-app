# Sareen Medical Care — AI-Powered Patient Management

A comprehensive, full-stack, enterprise-grade healthcare and telemedicine portal built for **Dr. Devendra Sareen**. This platform provides a secure patient portal, doctor schedules, administrative analytics, real-time doctor-patient communication, and an advanced AI-powered diagnostic helper powered by Google Gemini.

---

## 📖 Table of Contents
- [Project Description](#-project-description)
- [Key Features](#-key-features)
- [User Roles & Permissions](#-user-roles--permissions)
  - [Patient Portal](#1-patient-portal)
  - [Doctor Panel](#2-doctor-panel)
  - [Administrative Dashboard](#3-administrative-dashboard)
- [Tech Stack](#%EF%B8%8F-tech-stack)
- [Firebase Architecture & Services](#%EF%B8%8F-firebase-architecture--services)
- [AI Capabilities (Gemini API)](#-ai-capabilities-gemini-api)
- [Project Directory Structure](#%EF%B8%8F-project-directory-structure)
- [Installation & Setup Steps](#%EF%B8%8F-installation--setup-steps)
- [Environment Variables](#-environment-variables)
- [Deployment Instructions](#-deployment-instructions)
- [Screenshots & Visual Placements](#-screenshots--visual-placements)
- [Future Enhancements](#-future-enhancements)
- [License](#-license)

---

## 🌟 Project Description
**Sareen Medical Care** is a modern patient-management system designed to bridge the gap between healthcare providers and patients. By combining real-time scheduling, intuitive patient portals, robust analytics, and next-generation generative AI, the platform automates clinic workflows, reduces administrative bottlenecks, and delivers personalized patient guidance through secure symptom assessment and remote medical supervision.

---

## ✨ Key Features
*   **Dual-Engine Telemedicine Scheduler:** Smooth, real-time booking for both on-site visits and video appointments.
*   **Secure Multi-User Auth:** Unified authentication flow using Firebase Google Sign-In, protected against popup cancellations and race conditions.
*   **AI-Powered Preliminary Diagnosis:** Interactive medical assistant running on the latest Gemini models for symptom analysis.
*   **Real-Time Communications:** Multi-party live chat for immediate patient support, consultation messaging, and file attachments.
*   **Interactive Analytics Panels:** Modern charting tools that aggregate clinic usage, registration metrics, and app bookings for administrators.
*   **Dynamic Prescription Management:** Digital tracking of historic prescriptions, dosing instructions, and diagnostic advice.

---

## 👥 User Roles & Permissions

The application implements a role-based access control (RBAC) model split into three distinct dashboards:

### 1. Patient Portal
*   **Dashboard:** High-level summary of upcoming appointments, recently prescribed medications, and medical updates.
*   **Symptom Diagnostic Tool:** Self-service console where patients input symptoms to obtain instant AI recommendations.
*   **Appointment Booking:** Dynamic slot selection for selecting available times with specific doctors.
*   **My Prescriptions:** Log of past and present prescriptions detailing medications, dosage, frequency, and instructions.
*   **Chat Portal:** Direct connection to assigned primary care physicians or support staff.
*   **Profile Settings:** Secure management of personal and demographic information.

### 2. Doctor Panel
*   **Physician Dashboard:** Overview of the daily clinical schedule, active consultation list, and quick statistics.
*   **Patient Manager:** Comprehensive directory of patients containing detailed individual history logs.
*   **Appointment Scheduler:** Tools to approve, reschedule, or cancel patient requests in real time.
*   **Prescription Writer:** Digital forms to write, edit, and send official prescriptions directly to patient portals.

### 3. Administrative Dashboard
*   **Global Analytics:** Data visualizations displaying platform signups, booking ratios, and operational health.
*   **Physician Profiles:** Complete CRUD controls for adding, editing, and managing staff clinicians.
*   **Patient Directory:** Overview of all registered accounts, profile updates, and role-based assignments.
*   **Global Appointment Monitor:** Administrative controls to oversee and manage overall hospital bookings.

---

## 🛠️ Tech Stack

### Frontend Architecture
*   **Core Framework:** [React 19](https://react.dev/) — Declarative, component-driven web library.
*   **Compiler & Bundler:** [Vite 6](https://vite.dev/) — Next-generation frontend tooling.
*   **Language:** [TypeScript](https://www.typescriptlang.org/) — Fully type-safe programming with robust structures.
*   **Styling Engine:** [Tailwind CSS v4](https://tailwindcss.com/) — High-performance utility-first design.
*   **Animations:** [Motion](https://motion.dev/) — Fluid, hardware-accelerated animations and page transitions.
*   **Icons:** [Lucide React](https://lucide.dev/) — Lightweight vector medical and navigation iconography.
*   **Data Visualization:** [Recharts](https://recharts.org/) — Responsive, modular charting for administrative summaries.

### Server & Build Runtime
*   **Production Server:** [Express](https://expressjs.com/) — Lightweight Node.js server executing production asset delivery.
*   **Dev Engine:** [tsx](https://github.com/privatenumber/tsx) — Fast Node.js execution wrapper to load TypeScript modules directly.

---

## ⚡ Firebase Architecture & Services

The application relies on **Firebase** for cloud operations, data synchronization, and security rules:

1.  **Firebase Authentication:**
    *   Secure OAuth 2.0 with Google Sign-In.
    *   Robust popup handler guarding the `isLoggingIn` state. Even if patients close or cancel the sign-in modal, the system intercepts focus events, checks actual server authentication status, and dynamically restores the UI safely.
2.  **Cloud Firestore:**
    *   Real-time NoSQL document database structured to securely manage `users`, `appointments`, `messages`, and `prescriptions` collections.
3.  **Security Rules (`firestore.rules`):**
    *   Strict, schema-level rules ensuring authenticated users can only view or edit their own records.
    *   Strict administrator rules guarding doctor and patient directories.

---

## 🤖 AI Capabilities (Gemini API)

The system is equipped with an integrated **AI Diagnosis System** powered by Google GenAI:

*   **SDK Used:** `@google/genai` (V1 SDK)
*   **Model:** `gemini-3-flash-preview`
*   **Behavioral Protocol:**
    1.  The patient enters their current symptoms.
    2.  The backend routes the prompt to the model with specific medical context instructions.
    3.  Gemini analyzes the details to suggest 3-5 potential conditions, their severity level (Mild, Moderate, Severe), and recommends medical tests or specialists.
    4.  It automatically attaches a crucial, bold medical disclaimer emphasizing that the analysis is informational and does not replace official clinical diagnoses.

---

## 📁 Project Directory Structure

```bash
├── .env.example              # Template for secret keys & hosting URLs
├── .gitignore                # Specified paths to exclude from deployment
├── bun.lock                  # Lockfile for Bun package resolution
├── firebase-blueprint.json   # Structural representation for Firestore databases
├── firestore.rules           # Security rules enforcing strict RBAC on collections
├── index.html                # Single-page application template entry
├── metadata.json             # AI Studio applet name and frame permissions configuration
├── package.json              # Standard npm configuration & dependency graph
├── server.ts                 # Full-stack entry point utilizing Express and Vite middlewares
├── tsconfig.json             # Strict TypeScript configuration
├── vite.config.ts            # Vite compiler plugins and configurations
└── src/
    ├── main.tsx              # React mounting root
    ├── App.tsx               # Main routing router and high-level component structure
    ├── index.css             # Entry point for global CSS importing Tailwind
    ├── firebase.ts           # Firebase SDK, database, and auth initialization
    ├── types.ts              # Centralized TypeScript types, enums, and medical schemas
    ├── components/           # Reusable functional components
    │   ├── ErrorBoundary.tsx # Catch-all component for React runtime rendering protection
    │   ├── FirestoreTest.tsx # Debug widget for Firestore connection states
    │   ├── Navbar.tsx        # Responsive navigation and global user controls
    │   ├── Notifications.tsx # User notification trays
    │   └── Sidebar.tsx       # Expandable navigation menu matching user roles
    ├── hooks/                # Custom React Hooks
    │   └── useAuth.tsx       # Context wrapper handling state machine auth workflows
    ├── services/             # External service wrappers
    │   └── gemini.ts         # Secure module wrapping Google Gemini API actions
    └── pages/                # High-level screens and user dashboards
        ├── AdminAnalytics.tsx
        ├── AdminAppointments.tsx
        ├── AdminDashboard.tsx
        ├── AdminDoctors.tsx
        ├── AdminPatients.tsx
        ├── AppointmentBooking.tsx
        ├── Chat.tsx
        ├── DiagnosisSystem.tsx
        ├── DoctorAppointments.tsx
        ├── DoctorDashboard.tsx
        ├── DoctorPatients.tsx
        ├── Landing.tsx
        ├── PatientAppointments.tsx
        ├── PatientDashboard.tsx
        ├── PatientPrescriptions.tsx
        └── Profile.tsx
```

---

## ⚙️ Installation & Setup Steps

Follow these steps to run the application locally on your system:

### Prerequisites
*   [Node.js](https://nodejs.org/) (v18 or higher recommended)
*   An active [Firebase Project](https://console.firebase.google.com/)

### Step 1: Clone & Navigate
Download or extract the source files into your local environment:
```bash
cd react-example
```

### Step 2: Install Dependencies
Install all required libraries mapped in `package.json`:
```bash
npm install
```

### Step 3: Configure Environment Variables
Create a local `.env` file by copying the template:
```bash
cp .env.example .env
```
Fill in the credentials in `.env` (refer to the [Environment Variables](#-environment-variables) section below).

### Step 4: Run the Development Server
Launch the full-stack development server running on port `3000`:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Step 5: Build for Production
To bundle compile and bundle the application assets for live environments:
```bash
npm run build
```

---

## 🔑 Environment Variables

The application requires specific variables to perform operations safely. Ensure they are configured in your active runtime context or `.env` file:

```env
# Google GenAI API Key
# Required to route symptoms to Gemini models safely inside server.ts.
GEMINI_API_KEY="your-google-gemini-api-key"

# Application hosting URL
# Self-referential URL where the application or proxy is located.
APP_URL="http://localhost:3000"
```

---

## 🚀 Deployment Instructions

### Cloud Run Container Deployment
1.  Verify the environment is set up with Node.js and dependencies are bundled into the production directory:
    ```bash
    npm run build
    ```
2.  Start the production deployment server which serves built files and exposes port `3000`:
    ```bash
    npm run start
    ```

### Deploying Firestore Rules
When making changes to database collections or access requirements, deploy the security parameters using the Firebase CLI:
```bash
firebase deploy --only firestore:rules
```

---

## 📸 Screenshots & Visual Placements

> *Visual mockups and layouts of key system panels in operation.*

### 🖥️ User Dashboard Layout
| Patient Overview | Admin Analytics Panel |
| :---: | :---: |
| Elegant light theme showing diagnostic summaries, upcoming appointments, and instant chat trays with primary care physicians. | Dynamic charts rendering clinical metrics, registration volume, and appointment ratios. |

---

## 🔮 Future Enhancements
*   **Prescription Auto-Refills:** Direct linkage between pharmacies and doctor approval chains.
*   **Video Consultations:** Integrated high-performance WebRTC video rooms for direct teleconsultations within the portal.
*   **Multi-Language AI:** Expanding the AI Diagnosis assistant to support diverse languages and offline accessibility.
*   **Wearable Syncing:** Syncing wearable health metrics (heart rate, sleep cycles) into patient profile trends.

---

## 📄 License
This project is licensed under the MIT License. See the LICENSE file for details.
