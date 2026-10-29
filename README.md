# FairProctor AI 🛡️

**Explainable & Connectivity-Aware Online Exam Integrity Platform**  
*Built for the Integraminds IM-102 Hackathon*

---

## 🌟 Overview

**FairProctor AI** is a next-generation academic integrity platform engineered around a core principle: **poor connectivity should never be confused with academic misconduct**. Traditional proctoring tools routinely flag students for camera disconnections, cellular handovers, or ambient lighting transitions. FairProctor AI decouples environmental interference from behavioral telemetry, generating transparent, explainable decision graphs with guaranteed student due process.

> **Hackathon Prototype Notice:**  
> This platform is an engineering submission created for the Integraminds IM-102 Hackathon. All candidate names, sessions, and telemetry signals are synthetic demo data. This project is an independent prototype and does not represent an official partnership or verified integration with Integraminds.

---

## 🎨 Visual Identity & Design System

- **Midnight Navy:** `#0B1020` (Core canvas)
- **Deep Indigo:** `#151C35` (Elevated cards & navigation)
- **Electric Mint:** `#79F2C0` (High-confidence verified telemetry & accents)
- **Warm Ivory:** `#F5F3EC` (Editorial Due Process & Privacy Charter)
- **Typography:** `Manrope` (Interface elements) paired with `Newsreader` (Editorial serif headlines) and `JetBrains Mono` (Audit codes & timestamps)

---

## 🚀 Key Features

### 1. 3D Integrity Scoring Engine Visual
- Custom interactive visual featuring concentric orbital telemetry rings and a central translucent polyhedral core.
- Real-time perspective tilt tracking pointer coordinates with graceful fallback.
- **Interactive Decoupling Mode Toggle:** Witness in real-time how legacy proctoring jumps to 88/100 ("Camera Obstruction Flag") on a 34% packet drop, while FairProctor isolates the network fault and preserves the true candidate score at 14/100 ("Auto-Cleared").

### 2. Interactive Product Preview Dashboard
- **Reviewer Queue Switcher:** Seamlessly switch between sample candidate sessions (`SES-884A`, `SES-912C`, `SES-404B`).
- **Decoupled Metric Bars:** Side-by-side visualization of Behavioural Risk Score vs. Environmental Stability Score.
- **Filterable Evidence Timeline:** Filter by All Signals, Environmental, Behavioural, Client/DOM, and Keystroke/Paste.
- **Explainable Decision Inspector:** Deep audit box explaining the plain-language AI rationale and applied fairness rules.
- **Live Reviewer Verdict Actions:** Triage actions ("Dismiss as Environmental", "Request Candidate Statement").

### 3. Multi-Signal Correlation & Explainable Evidence Tree
- Synthesizes keystroke cadence, DOM focus transitions, clipboard entropy, and cross-cohort collusion clustering.
- Interactive decision graph displaying the step-by-step audit trail from WebRTC stream ingest to SHA-256 HMAC cryptographic signing.

### 4. High-Contrast Editorial Privacy Charter (Warm Ivory Section)
- Four foundational ethical pillars: Biometric Zero-Retention (vectors expunged in RAM), Bandwidth Equity Audits, Informed Consent, and Guaranteed 48-Hour Appeal.
- Interactive institutional policy controls for retention schedules and low-bandwidth audit reports.

### 5. Interactive Pre-Test Readiness Modal
- Simulated candidate self-diagnostic tool evaluating Camera FOV, ambient lux level, uplink jitter tolerance, and single-display sandbox.

### 6. Candidate Due Process & Rebuttal Window
- Interactive appeal submission interface allowing students to submit plain-language statements and attach local WebRTC socket telemetry dumps.

---

## 🛠️ Tech Stack

- **Framework:** React 19 + TypeScript
- **Bundler:** Vite
- **Motion & Interactions:** Framer Motion
- **Icons:** Lucide React
- **Styling:** Vanilla CSS with comprehensive CSS custom properties
- **Typography:** Google Fonts (`Manrope`, `Newsreader`, `JetBrains Mono`)
- **Linting:** Oxlint (0 warnings, 0 errors)

---

## 💻 Getting Started

### Prerequisites
- Node.js `v20+` or `v22+`
- npm `10+`
- MongoDB `v6+` or `v7+` (running on `mongodb://127.0.0.1:27017` or configured via `MONGODB_URI` in `.env`. Note: If MongoDB is not active, the backend automatically operates using a persistent local JSON store in `server/data/users.json`).

### Installation
```bash
# Clone the repository
git clone https://github.com/sakshi-lily/FairProctor-AI.git
cd FairProctor-AI

# Install dependencies
npm install

# Copy environment configuration template
cp .env.example .env
```

### Running Locally
```bash
# Terminal 1: Start Express Authentication & RBAC Backend (Port 5000)
npm run server

# Terminal 2: Start Vite Frontend (Port 5173, proxied to port 5000)
npm run dev
```
Open [http://localhost:5173/](http://localhost:5173/) in your browser.

---

## 🔐 Authentication & Access Control (RBAC)

FairProctor AI includes an enterprise authentication and server-enforced role-based access control system:

### Verified Demo Accounts
The database automatically seeds 3 verified accounts on first launch:
- **Administrator:** `admin@fairproctor.ai` / `Admin@FairProctor2026!` (Full user management & governance)
- **Reviewer:** `reviewer@fairproctor.ai` / `Reviewer@FairProctor2026!` (Triage queue, evidence inspector, live verdicts)
- **Candidate:** `candidate@fairproctor.ai` / `Candidate@FairProctor2026!` (Exam readiness, hardware pre-test, due process appeal)

### Role-Based Access Control
- **Candidate:** Access to candidate diagnostic verification, active exam readiness, and due process appeal submission. Public registration strictly defaults to Candidate.
- **Reviewer:** Access to reviewer triage queue, decoupled risk metrics (Behavioral Risk vs Environmental Stability), cryptographic audit trail, and reviewer verdicts.
- **Admin:** Access to user registry, live role promotion/demotion, account activation/suspension, system infrastructure inspection, and tamper-evident audit logs.

### Security Guarantees
- **Password Security:** Salted and hashed using `bcrypt` (12 rounds); plain-text passwords are never stored.
- **Session Security:** Short-lived JWT access tokens (15m) + secure refresh tokens (30d for remember-me, 1d default) stored in `HttpOnly`, `SameSite=Lax`, `Secure-in-production` cookies with Bearer token fallback.
- **CSRF Protection:** State-changing requests (`POST`, `PUT`, `PATCH`, `DELETE`) are guarded with cryptographically secure double-submit tokens.
- **Zero Email Enumeration:** Password recovery and login errors use constant-time comparison and privacy-preserving responses.
- **Password Recovery:** Time-limited (15 minutes), single-use cryptographic tokens hashed with SHA-256 before database storage.
- **Rate Limiting:** Failed logins throttled to 5 attempts per 15-minute window per IP to stop brute-force attacks.

### Running Automated Test Suites
```bash
# Run unit & cryptographic hashing tests
npm run test:auth

# Run complete 21-point end-to-end integration test suite
npm run test:e2e
```

### Building for Production
```bash
# Type check and build production bundle
npm run build

# Preview production build
npm run preview
```

### Linting
```bash
npm run lint
```

