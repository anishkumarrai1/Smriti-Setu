# 🧠 Smriti-Setu: Cognitive Health & Memory Assistance Platform

Welcome to the **Smriti-Setu** project repository! Smriti-Setu is an integrated, production-grade full-stack cognitive stimulation and memory care platform designed for individuals with mild cognitive impairment (MCI) and dementia, their family caregivers, attending clinicians, and healthcare administrators.

---

## 📁 Repository Structure

```
Smriti-Setu/
├── 📂 frontend/                      # React 18 + TypeScript + Vite + Tailwind CSS (Port 3000)
│   ├── src/
│   │   ├── components/
│   │   │   ├── activities/           # Memory Match, Picture Recognition, Photo Puzzle, Pattern Recall
│   │   │   ├── memory/               # Reminiscence Garden & Milestones (with Photo & Audio Uploads)
│   │   │   ├── reminders/            # Adherence, Daily Schedule & Voice Reminders
│   │   │   ├── portal/               # Public Information Portal & NER Health Directory
│   │   │   ├── common/               # AI Voice Companion, Hardware Test Panel, Patient Modals
│   │   │   └── layout/               # Responsive AppShell, Mobile Bottom Bar & Header
│   │   ├── pages/                    # Patient, Caregiver, Clinician, Admin & Public Portals
│   │   ├── services/                 # Unified Axios API clients & WebSocket connection
│   │   ├── stores/                   # Zustand state stores (Auth, Accessibility, Activities)
│   │   ├── i18n/                     # Multilingual translations (Assamese, Bodo, Bengali, Nepali, Hindi, English)
│   │   └── types/                    # Unified TypeScript interface models
│   └── package.json
│
├── 📂 backend/                       # Node.js + Express + TypeScript API Server (Port 5001)
│   ├── src/
│   │   ├── modules/                  # 🔌 Modular Healthcare Domain Services
│   │   │   ├── dashboard/            # Caregiver summary & smart AI insights
│   │   │   ├── translation/          # Bhashini multilingual translation & NER dictionaries
│   │   │   ├── emotion/              # Emotion check-in & Comfort Mode triggers
│   │   │   ├── life-timeline/        # AI Life Timeline & anniversary matching
│   │   │   ├── memory-match/         # Memory Match session logging & accuracy metrics
│   │   │   ├── photo-puzzle/         # Sharp image slicing & puzzle piece validation
│   │   │   ├── routine-recall/       # Daily routine logging & decoy quiz generation
│   │   │   ├── voice-connect/        # Family voice note uploads & audio streaming
│   │   │   ├── voice-clone/          # Voice sample registry & reminder synthesis
│   │   │   └── system/               # Central health & system status registry
│   │   ├── controllers/              # REST & action controllers (patients, admin, reminders, devices)
│   │   ├── services/                 # Authentication, OTP, Bhashini, Hardware WebSocket gateway
│   │   ├── store/                    # Data storage with persistent JSON files
│   │   └── server.ts                 # Express HTTP server & Socket.io bootstrap
│   ├── data/                         # 💾 Persistent Database Files
│   │   ├── users.json                # User accounts, roles, hashed passwords & statuses
│   │   ├── patients.json             # Patient profiles, avatars, and clinical notes
│   │   ├── sessions.json             # Gameplay session records & accuracy metrics
│   │   └── login_activity.json       # Security audit & login telemetry logs
│   └── package.json
│
├── 📂 esp32/                         # ESP32 Firmware & Hardware Controller Code
├── 📂 uploads/                       # Storage for puzzle slices, voice messages & patient photos
├── 📄 package.json                   # Root Monorepo Scripts (dev, build, start, test)
└── 📄 README.md                      # Full-stack documentation & architecture guide
```

---

## 🎯 Key Features & Persona Capabilities

1. **Public Health Information Portal**:
   - Comprehensive North Eastern Region (NER) healthcare facilities search.
   - Government schemes, cognitive health resources, and helpline directories.
2. **Dedicated Role Gateway**:
   - Multi-persona role switching: **Patient**, **Family Caregiver**, **Clinician / Doctor**, and **System Administrator**.
   - Secure authentication with email/SMS OTP verification and bcrypt password hashing.
3. **Adaptive Cognitive Activities**:
   - 5 interactive brain exercises: *Memory Match*, *Photo Puzzle*, *Picture Recognition*, *Daily Routine Recall*, and *Pattern Recall*.
   - Real-time adaptive difficulty scaling based on player accuracy.
4. **Memory Garden & Reminiscence Therapy**:
   - Digital memory archive with family photos, voice notes, and milestone stories.
5. **AI Voice Companion**:
   - Floating multilingual AI assistant supporting voice commands, conversation, and instant navigation.
6. **Admin Audit Console & Database Hub**:
   - User account status management (Instant active / suspended toggling).
   - Real-time security telemetry and login activity tracking.
   - 1-click export of complete user and session data to **Microsoft Excel (.CSV)** or **MongoDB (.JSON)**.
7. **Cross-Device Persistent Storage**:
   - All patient profiles, photos, and game sessions persist to backend disk files (`patients.json`, `sessions.json`, `users.json`), synchronizing across all devices on the network.

---

## 🔗 Connected Domain Services (Active on `/api`)

| Module | Mount Path | Purpose | Status |
|---|---|---|---|
| **System Health** | `/api/system` | Architecture health & system status | 🟢 Operational |
| **Authentication** | `/api/auth` | Login, registration, OTP & JWT sessions | 🟢 Operational |
| **Admin Console** | `/api/admin` | User management, status suspension & data export | 🟢 Operational |
| **Patient Profiles** | `/api/patients` | Multi-patient roster, photo updates & hierarchy | 🟢 Operational |
| **Game Sessions** | `/api/results`, `/api/sessions` | Gameplay accuracy logging & adaptive difficulty | 🟢 Operational |
| **Bhashini Translation** | `/api/translate` | Multilingual translation (Assamese, Bodo, Nepali, etc.) | 🟢 Operational |
| **Reminders & Adherence**| `/api/reminders` | Scheduled audio/visual medication alerts | 🟢 Operational |
| **Memory Garden** | `/api/memories` | Personalized reminiscence archive | 🟢 Operational |
| **Photo Puzzle** | `/api/puzzle` | Image slicing & coordinate verification | 🟢 Operational |
| **Daily Routine Recall** | `/api/routine` | Routine logging & quiz prompt generation | 🟢 Operational |
| **ESP32 Hardware** | `/api/devices` | ESP32 hardware device telemetry & socket bridge | 🟢 Operational |

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18+ or v20+ recommended
- **npm**: v9+

### 1. Clone the Repository
```bash
git clone https://github.com/anishkumarrai1/Smriti-Setu.git
cd Smriti-Setu
```

### 2. Install Dependencies
```bash
# Install root monorepo, frontend, and backend dependencies
npm install
cd backend && npm install
cd ../frontend && npm install
cd ..
```

### 3. Run in Development Mode
You can run frontend and backend simultaneously:

```bash
# Terminal 1: Start Backend API (Port 5001)
cd backend
npm run dev

# Terminal 2: Start Frontend Dev Server (Port 3000)
cd frontend
npm run dev
```

* **Frontend Web App:** [http://localhost:3000/](http://localhost:3000/)
* **Backend API Gateway:** [http://localhost:5001/](http://localhost:5001/)
* **API Health Check:** [http://localhost:5001/api/health](http://localhost:5001/api/health)

---

### 4. Single-Port Unified Production Build
To build and run the entire unified stack on a single port:

```bash
# 1. Build frontend and backend bundles
npm run build

# 2. Run the production server
npm start
```

The unified production server will serve the React frontend SPA, static upload assets, and all 41+ REST API endpoints on `http://localhost:5001/`.

---

## 🔐 Default Demo Accounts

| Role | Email Identifier | Password | Access Level |
|---|---|---|---|
| **System Admin** | `admin@smritisetu.gov.in` | `Admin12!` | Full Admin Audit & Security Console |
| **Clinician / Doctor** | `doctor@smritisetu.gov.in` | `Doctor12!` | Clinical Telemetry & Patient Diagnostics |
| **Family Caregiver** | `caregiver@smritisetu.gov.in` | `Caregiver12!` | Patient Monitoring, Reminders & Garden |
| **Patient (Ranjit)** | `patient@smritisetu.gov.in` | `Patient12!` | Personalized Games, Memory Garden & Companion |

---

## 📄 License
This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
