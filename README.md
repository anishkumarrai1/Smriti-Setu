# 🧠 Smriti-Setu: Full-Stack Cognitive & NER AI Platform

Welcome to the **Smriti-Setu** project repository! This repository is organized as an integrated, production-grade full-stack monorepo connecting modular AI healthcare domains, expressive UI activities, and real-time backend microservices.

---

## 📁 Full-Stack Repository Structure

```
SIH_FINAL/
├── 📂 frontend/                      # React 18 + TypeScript + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/
│   │   │   ├── activities/           # Memory Match, Picture Recognition, Photo Puzzle
│   │   │   ├── memory/               # Reminiscence Garden & Milestones (with Photo Uploads)
│   │   │   └── reminders/            # Adherence & Voice Reminders
│   │   ├── pages/                    # Patient, Caregiver, Clinician & Govt Portals
│   │   ├── services/                 # Modular API Clients for backend services
│   │   ├── stores/                   # Zustand stores (Auth, Language, Activities)
│   │   └── types/                    # Unified TypeScript interface models
│   └── package.json
│
├── 📂 backend/                       # Node.js + Express + TypeScript API Server (Port 5000)
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
│   │   │   ├── voice-clone/          # XTTS voice sample registry & reminder synthesis
│   │   │   └── system/               # Central health & system status registry
│   │   ├── routes/                   # Unified route index mounting all domain APIs
│   │   ├── controllers/              # REST & action controllers (reminders, patients, devices)
│   │   ├── store/                    # In-memory and persistent data stores
│   │   ├── test/                     # Comprehensive automated contract test suite (41 endpoints)
│   │   └── server.ts                 # Express HTTP server bootstrap
│   └── package.json
│
├── 📂 uploads/                       # Storage for puzzle slices, voice messages & samples
├── 📄 package.json                   # Root Monorepo Scripts (dev, build, test)
└── 📄 README.md                      # Full-stack documentation & architecture guide
```

---

## 🔗 Connected Domain Services (Active on `/api`)

| Module | Mount Path | Purpose | Status |
|---|---|---|---|
| **System Health** | `/api/system` | Architecture health & system status | 🟢 Operational |
| **Caregiver Dashboard** | `/api/dashboard` | Aggregated metrics, adherence, rule-based insights | 🟢 Operational |
| **Bhashini Translation** | `/api/translate` | Multilingual NER translation (Assamese, Bodo, Nepali, etc.) | 🟢 Operational |
| **Emotion Check-In** | `/api/emotion` | Comfort Mode triggers (lullabies, breathing, photos) | 🟢 Operational |
| **Life Timeline** | `/api/timeline` | Recurring historical milestones & anniversary matching | 🟢 Operational |
| **Memory Match** | `/api/memory-match` | Session accuracy logging and progression tracking | 🟢 Operational |
| **Photo Puzzle** | `/api/puzzle` | Sharp image slicing and placement coordinate verification | 🟢 Operational |
| **Daily Routine Recall** | `/api/routine` | Caregiver care logging & quiz prompt generation | 🟢 Operational |
| **Family Voice Connect** | `/api/voice-messages` | Audio recording uploads & streaming playback | 🟢 Operational |
| **Voice Cloning (XTTS)**| `/api/voice-clone` | Voice sample registration & reminder voice synthesis | 🟢 Operational |
| **Reminders & Adherence**| `/api/reminders` | Scheduled alerts, patient acknowledge, adherence rates | 🟢 Operational |
| **NER Healthcare Portal** | `/api/portal` | 8 NER states health facilities, programs & resources | 🟢 Operational |

---

## 🚀 Quick Start Guide

### 1. Root Monorepo Commands
```bash
# Verify all 41 full-stack endpoints across all modules
npm test

# Build both frontend and backend
npm run build

# Start backend dev server
npm run dev:backend

# Start frontend dev server
npm run dev:frontend
```

### 2. Frontend Application (`/frontend`)
* Local URL: `http://localhost:3000/`
* Features: Multilingual voice selector (Hindi, English, Assamese, Bengali, Nepali, Bodo), Photo Puzzle custom image uploads, Memory Garden photo memories, Patient/Caregiver/Clinician portals.

### 3. Backend API Gateway (`/backend`)
* API Gateway: `http://localhost:5000/`
* Health Check: `http://localhost:5000/api/health`
* System Status: `http://localhost:5000/api/system/status`

### 4. Single-Link Production Hosting (Frontend + Backend on 1 Port)
```bash
# 1. Build unified monorepo bundle
npm run build

# 2. Run unified server on port 5000 (serves React SPA + 41 API endpoints + uploads)
npm start
```

---

## 🌐 Live Deployments
* **Live Full-Stack Web App (Cloudflare Single Link)**: [https://rebecca-investigations-omissions-fingers.trycloudflare.com](https://rebecca-investigations-omissions-fingers.trycloudflare.com)
* **API Health Status**: [https://rebecca-investigations-omissions-fingers.trycloudflare.com/api/health](https://rebecca-investigations-omissions-fingers.trycloudflare.com/api/health)
* **Regional Healthcare Portal**: [https://rebecca-investigations-omissions-fingers.trycloudflare.com/api/portal/states](https://rebecca-investigations-omissions-fingers.trycloudflare.com/api/portal/states)

---

## 📦 How Anyone Can Clone and Run This Project

```bash
# 1. Clone the repository
git clone https://github.com/utkarsh058/ByteFlow.git
cd ByteFlow

# 2. Install all dependencies
cd backend && npm install
cd ../frontend && npm install
cd ..

# 3. Build & Run Full-Stack (Unified on port 5000)
npm run build
npm start
```
Open **`http://localhost:5000`** in your browser to play and access all features!


