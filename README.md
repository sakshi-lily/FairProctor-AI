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

### Installation
```bash
# Clone the repository
git clone https://github.com/sakshi-lily/FairProctor-AI.git
cd FairProctor-AI

# Install dependencies
npm install
```

### Running Locally
```bash
# Start Vite development server
npm run dev
```
Open [http://localhost:5173/](http://localhost:5173/) in your browser.

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
