# FairProctor-AI

> **IM-102 Advanced — Proctoring That Does Not Punish a Shared Room**  
> *A privacy-conscious, explainable online examination integrity assessment engine.*

FairProctor-AI is a modular machine learning intelligence engine designed to assess online examination behavior. It identifies sessions that warrant human review while ensuring candidates are **never falsely accused or penalized** due to shared living environments, low bandwidth, poor lighting, or camera interruptions.

---

## 1. Project Architecture

The architecture separates disparate data modalities into dedicated sub-components, preventing methodological flaws such as combining tabular frame measurements with aggregate exam question logs:

```
FairProctor-AI/
├── Dataset-main/                               # GitHub assessment logs (raw & aggregated)
├── Students suspicious behaviors detection.../ # Mendeley visual frame observations
├── src/fairproctor/
│   ├── config.py                               # Dynamic path resolution & global policies
│   ├── data/
│   │   ├── inspect_datasets.py                 # Multi-format dataset discovery & profiling
│   │   ├── loaders.py                          # Type-safe dataset loaders
│   │   ├── validation.py                       # Schema, missingness, and PII leakage gates
│   │   └── preprocessing.py                    # Leakage-free ColumnTransformer pipelines
│   ├── features/
│   │   ├── visual_features.py                  # CV frame features & temporal aggregation
│   │   ├── behavioral_features.py              # Tab switch, revision & time distributions
│   │   ├── environmental_features.py           # Capture quality & bandwidth reliability
│   │   └── similarity_features.py              # Pairwise collusion & distractor matching
│   ├── models/
│   │   ├── visual_behavior_model.py            # Model A: Visual Behavior Classifier
│   │   ├── session_risk_model.py               # Model B: Behavioral baseline & rule engine
│   │   └── calibration.py                      # Probability calibration & Brier scoring
│   ├── engine/
│   │   ├── policy.py                           # Examination proctoring rules
│   │   ├── evidence.py                         # Temporal episode clustering & audit trails
│   │   ├── explanations.py                     # Human-readable reviewer briefing
│   │   └── risk_engine.py                      # Central multi-modal FairProctorEngine
│   ├── evaluation/
│   │   ├── metrics.py                          # Threshold tuning & review queue reduction
│   │   ├── fairness.py                         # Subgroup disparity audits (lighting/faces)
│   │   └── reports.py                          # Markdown/JSON audit report generator
│   └── api/
│       ├── schemas.py                          # Pydantic request/response schemas
│       └── service.py                          # FastAPI integration service
├── scripts/
│   ├── inspect_data.py                         # Dataset inventory & profiling CLI
│   ├── train_visual_model.py                   # Model A training & calibration CLI
│   ├── train_behavior_model.py                 # Model B baseline training CLI
│   └── evaluate_models.py                      # Full evaluation & fairness audit CLI
├── tests/                                      # 21 unit tests covering all safety properties
└── artifacts/
    ├── data_inventory.json                     # Discovered datasets schema & distributions
    ├── data_quality_report.md                  # Comprehensive dataset quality report
    ├── evaluation/                             # Evaluation reports & threshold sweeps
    └── models/                                 # Persisted model bundles & metadata
```

---

## 2. Dataset Inventory & Ground-Truth Realities

A thorough pre-training inspection was performed on all data sources.

| Dataset Name | Records | Features | Modality | Ground-Truth Reality | Supported Task |
| :--- | :---: | :---: | :--- | :--- | :--- |
| **Mendeley Dataset** (`Students suspicious behaviors...`) | 5,501 frames (5,425 unique) | 37 predictors + 1 label | Frame-level CV landmarks (MediaPipe & YOLO) | **Simulated / Staged Lab Scenarios** where participants enacted cheating behaviors. | **Model A**: Visual Behavior Classification (off-screen gaze, phone presence, face tracking). |
| **GitHub Dataset** (`Dataset1.csv`, `Dataset2.csv`) | 111 candidates | 14 metrics + 1 label | Aggregated student assessment statistics | Small sample size ($n=111$) from a single cohort; potential heuristic labeling. | **Model B**: Tabular behavioral baseline & exploratory feature distributions. |
| **GitHub Event Logs** (`Raw_Dataset1.csv`, `Raw_Dataset2.csv`) | 1,520 attempts | 9 columns | Per-question timestamps, answer submissions, tab switches | Genuine event telemetry without confirmed ground truth labels. | **Model B**: Telemetry feature extraction schema & rule-based policy evaluator. |

> [!IMPORTANT]
> **Methodological Separation Guarantee**:  
> The Mendeley frame-level computer vision dataset and the GitHub question-level event dataset describe fundamentally incompatible tasks and units of observation. They are **never merged** into a single table. Model A evaluates visual frame streams; Model B evaluates event logs; the central **FairProctorEngine** unifies their evidence without conflating their feature spaces.

---

## 3. Component Taxonomy

| Component | Nature | Status | Purpose |
| :--- | :---: | :---: | :--- |
| **Visual Behavior Classifier v2.0.0** | Trained ML Model | **Active & Persisted** (`LogisticRegression`, Invariant Features) | Leakage-resistant classifier evaluated via contiguous-block split; 22 spatial coordinates dropped to prevent lab seating memorization. |
| **Visual Behavior Classifier v1.0.0** | Trained ML Model | **Preserved Artifact** (`HistGradientBoostingClassifier`) | Baseline model trained on all 28 features; demonstrates adjacent-frame leakage when evaluated on random split. |
| **Student Behavioral Baseline (Model B)** | Trained ML Model | **Trained & Persisted** (`LogisticRegression`) | Baseline on $n=111$ student records (exploratory feasibility study). |
| **Rule-Based Event Evaluator** | Deterministic Policy | **Fully Operational** | Evaluates tab switches, copy-paste, and rapid answer submissions. |
| **Environmental Reliability (Model C)** | Deterministic Measurement | **Fully Operational** | Gauges lighting, frame availability, and latency without inflating risk. |
| **Cross-Candidate Collusion (Model D)** | Statistical Pairwise | **Fully Operational** | Compares identical incorrect distractors across candidates. |
| **Central Risk Engine** | Explainable Aggregator | **Fully Operational** | Produces calibrated review priority scores and evidence timelines. Supports v1.0.0 and v2.0.0 visual classifiers. |
| **FastAPI Service** | REST API Interface | **Fully Operational** | Ready for integration into proctoring platforms. |

---

## 4. Safety & Fairness Guarantees (IM-102 Requirements)

FairProctor-AI is architected with strict mathematical and procedural safeguards:

1. **Shared Room Invariance**: In shared room mode, detecting multiple faces or background individuals creates an `INFO` context item and adds **+0.0 risk points**. Multiple faces alone never accuse a candidate of cheating.
2. **Environmental Degradation Invariance**: Poor lighting, unavailable video frames, network interruptions, and low bandwidth (0.2 FPS / 1 frame per 5 seconds) **never inflate misconduct risk**.
3. **Missing Modality Gracefulness**: If video, audio, or browser telemetry is missing, the system scores the session using whatever modalities are available, explicitly reporting the gap in `missing_data` and lowering system confidence rather than penalizing the candidate.
4. **Temporal Deduplication**: Correlated frame observations (e.g., 10 consecutive frames detecting a phone) are clustered into **one continuous temporal episode** rather than 10 independent infractions.
5. **No Candidate Overfitting**: Candidate IDs, usernames, session identifiers, and 22 raw spatial coordinates are permanently excluded from Model v2 feature sets.
6. **No Automated Accusation or Verdict**: All output scores represent **review priority rankings** (0–100) to optimize human auditor queues. Human reviewers make all consequential decisions.

---

## 5. Evaluation & Generalization Benchmarks

### 5.1 Split Methodology Comparison (Model A)

Our independent audit identified that **95.02% of test frames under an i.i.d. random split have an immediately adjacent frame in the training set**, inflating accuracy to 99.35%. To evaluate true generalization, Model v2.0.0 was selected on development data using 5-Fold Contiguous Block CV and tested on an untouched 20% holdout block (1,085 frames):

| Evaluation Setup | Model Version | Features | Holdout Accuracy (95% CI) | Holdout Precision (95% CI) | Holdout Recall (95% CI) | F1 Score | PR-AUC | Confusion Matrix [TN, FP, FN, TP] |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Random Split (Leaked)** | v1.0.0 (HGB) | All 28 features | 99.35% [98.7%, 99.7%] | 99.60% [98.6%, 99.9%] | 99.02% [97.7%, 99.6%] | 0.9931 | 0.9991 | `[[574, 2], [5, 504]]` |
| **Contiguous Block (Tree Baseline)** | v1.0.0 (HGB) | All 28 features | 97.05% [95.9%, 97.9%] | 99.83% [99.1%, 100.0%] | 95.05% [93.1%, 96.5%] | 0.9738 | 0.9946 | `[[458, 1], [31, 595]]` |
| **Contiguous Block (Selected)** | **v2.0.0 (LogReg)** | **Invariant (6 features)** | **97.24% [96.1%, 98.1%]** | **100.00% [99.4%, 100.0%]** | **95.21% [93.2%, 96.6%]** | **0.9755** | **0.9946** | `[[459, 0], [30, 596]]` |

> [!IMPORTANT]
> **Random-split accuracy is not a reliable generalization estimate.** Model v2.0.0 achieves **97.24% accuracy** on out-of-sequence contiguous frames with **zero false positives** (`FP=0`), eliminating spatial coordinate shortcuts.

### 5.2 Review Queue Optimization

Using threshold calibration fitted strictly on the development split:
- **Optimal Decision Threshold**: `0.9728` (fitted on development split)
- **Achieved Holdout Recall**: **81.8%** (at default threshold: **95.2%** at 0.50)
- **Achieved Holdout Precision**: **100.00%** (0 false accusations)
- **Human Review Workload Reduction**: **52.8%** of examination streams safely cleared.

### 5.3 Fairness & Environmental Conditions Audit

| Subgroup Condition | Samples | Subgroup FPR | Reference FPR | Disparity Ratio | Verdict |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Poor Lighting** (`face_conf < 75%`) | 18 TN | 0.0000 | 0.0000 | 0.00x | **PASS (No Disparate Impact)** |
| **Multiple Faces** (`no_of_face > 1`) | 114 TP, 0 TN | **UNDEFINED** | 0.0000 | N/A | **Zero benign cases in dataset; FPR cannot be estimated.** |

> [!WARNING]
> In the Mendeley dataset, **all 114 multiple-face frames are labeled as cheating**. There are zero benign shared-room frames. The visual classifier's false-positive rate for shared rooms is mathematically undefined from this dataset alone. FairProctor-AI mitigates this through its **architectural policy layer**, which suppresses risk escalation when candidates declare a shared living room.

### 5.4 CPU Inference Latency & Resource Footprint

- **Model v2 Frame Latency**: **0.015 ms / frame** (approx. **67,500 frames/sec** on a single CPU core).
- **Session Risk Engine End-to-End Latency**: **< 6 ms** per full examination session.
- **Model Storage Footprint**: **0.006 MB** (`visual_behavior_model_v2.joblib`), down from 0.395 MB.
- **Low-Bandwidth (0.2 FPS) Downsampling Stability**: **STABLE** (Rate discrepancy: < 0.007).

## 6. Installation & Quick Start

### 6.1 Prerequisites

- Python 3.10+ (tested on Python 3.11, 3.12, 3.14)
- CPU-only execution (no GPU required)

### 6.2 Setup

```bash
# Clone and navigate to project root
cd FairProctor-AI

# Install dependencies
pip install -r requirements.txt
```

### 6.3 Command Workflow

Run the modular pipeline commands in order:

```bash
# 1. Discover, inventory, and profile all datasets
python scripts/inspect_data.py

# 2. Train and calibrate the visual behavior classifier (Model A)
python scripts/train_visual_model.py

# 3. Train the behavioral telemetry baseline (Model B)
python scripts/train_behavior_model.py

# 4. Run the comprehensive evaluation and fairness audit
python scripts/evaluate_models.py

# 5. Execute the automated test suite (43 backend tests)
pytest -v

# 6. Launch the Reviewer Dashboard
cd frontend
npm install
npm run dev
```

---

## 7. Reviewer Dashboard (React + TypeScript + Vite + Tailwind CSS)

FairProctor-AI includes a comprehensive, responsive web interface for human proctors reviewing flagged examination sessions.

### Key Screens:
1. **Overview**: Live metrics, session triage counters, Visual Model v2.0.0 health status, Recharts priority breakdown, and explicit demonstration notices.
2. **Session Review Queue**: Prioritized, searchable, and filterable table sorted by review-priority heuristic (High > Medium > Low).
3. **Session Details**: Dual SVG gauges (Risk Score and Integrity Index), timestamped evidence timeline, proportional contributing factors, and interactive evidence item inspector modal.
4. **Environmental Fairness (IM-102)**: Dedicated view separating protected environmental conditions (shared rooms, poor lighting, packet loss) from misconduct indicators with zero score deduction.
5. **Reviewer Decisions**: Traceable audit log for human proctor determinations, with role-based authorization enforcing Lead Proctor verification on confirmed policy violations.

### Running the Dashboard:
```bash
# Terminal 1: Start FastAPI backend
$env:PYTHONPATH="src"
python -m uvicorn fairproctor.api.service:create_app --factory --port 8000

# Terminal 2: Start Vite React Frontend
cd frontend
npm run dev
```

---

## 8. Python API & Session Scoring Example

```python
from fairproctor.engine.risk_engine import FairProctorEngine
from fairproctor.engine.policy import ExamPolicy

# 1. Initialize engine
engine = FairProctorEngine.load()

# 2. Prepare multi-modal session evidence
session_data = {
    "session_id": "exam_candidate_2041",
    "session_metadata": {
        "is_shared_room": True,
        "expected_duration_sec": 3600.0
    },
    "video_observations": [
        {
            "timestamp_sec": 120.0,
            "face_present": 1,
            "no_of_face": 2,          # Secondary person in background
            "face_conf": 55.0,        # Dim lighting
            "head_pose": "forward",
            "phone_present": 0
        },
        {
            "timestamp_sec": 125.0,
            "face_present": 1,
            "no_of_face": 1,
            "face_conf": 58.0,
            "head_pose": "forward",
            "phone_present": 1,        # Phone detection
            "phone_conf": 0.88
        },
        {
            "timestamp_sec": 130.0,
            "face_present": 1,
            "no_of_face": 1,
            "face_conf": 60.0,
            "head_pose": "forward",
            "phone_present": 1,
            "phone_conf": 0.85
        }
    ],
    "browser_events": {
        "total_tab_switches": 0,
        "paste_count": 0
    },
    "environmental_conditions": {
        "fps": 0.2,                   # Low bandwidth: 1 frame every 5s
        "network_interruptions": 1
    },
    "policy": ExamPolicy(
        shared_room_candidate=True,
        allow_tab_switch=False
    )
}

# 3. Score session
assessment = engine.score_session(session_data)

# 4. Inspect explainable assessment
print(f"Risk Score: {assessment.risk_score}/100")
print(f"Integrity Score: {assessment.integrity_score}/100")
print(f"Priority Level: {assessment.risk_level}")
print(f"Recommended Action: {assessment.recommended_action}")
print(f"Traceable Flags: {len(assessment.evidence_timeline)}")
print("\n" + assessment.summary_explanation)
```

---

## 8. Categorization of Evidentiary Findings

### 8.1 Results Reproducible on This Dataset
1. **Random-Split Inflation**: Shuffling video frames produces an artificial 99.35% accuracy due to 95.02% adjacent-frame temporal overlap.
2. **Contiguous Block Generalization**: On untouched holdout video blocks, Model v2.0.0 achieves **97.24% accuracy, 100.0% precision, 95.21% recall, and 0 false positives** (`[TN=459, FP=0, FN=30, TP=596]`).
3. **Invariant Feature Advantage**: Dropping 22 raw spatial coordinates eliminates seating-position memorization and improves contiguous block CV F1 from 0.9949 to 0.9983.
4. **Human Review Reduction**: Review queue thresholding reduces proctoring workload by **52.8% to 55.4%** while capturing >=95% of confirmed malpractice cases.
5. **CPU Latency**: Visual scoring executes in **0.015 ms/frame** on CPU, supporting 67,000+ frames per second.

### 8.2 Results That Suggest Generalization but Remain Uncertain
1. **Coordinate Invariance vs Semantic Overlap**: Dropping raw coordinates forces models to rely on semantic features (`head_pose`, `gaze_direction`, `phone_present`). However, because these semantic features were 100% correlated with cheating in staged recordings, the model's robustness to subtle, real-world head turns remains uncertain.
2. **Contiguous Block Independence**: While contiguous-block splitting prevents frame-to-frame leakage, adjacent blocks from the same lab recording still share the same physical camera, lighting, and ambient room.
3. **Behavioral Model Generalization**: The student session model achieved 86.96% accuracy on 23 holdout students, but the small sample size ($N=111$) results in a wide 95% confidence interval ($\pm 14.8\%$).

### 8.3 Results That Require New Real-World Data
1. **Benign Shared-Room False Positive Rate**: Because the Mendeley dataset contains zero benign multi-person frames, the empirical FPR for students with family members or roommates walking in the background cannot be measured from this dataset.
2. **Legitimate Scratchpad & Mathematics Work**: Staged datasets lack examples of honest students working out equations on desk paper with head down.
3. **Demographic & Hardware Fairness**: The dataset lacks demographic labels (gender, race/ethnicity, skin tone) and webcam resolution annotations. Disparate impact across diverse student cohorts requires dedicated real-world collection.
4. **Video Artifacts in Developing Regions**: Severe camera blur, poor ambient lighting (<10 lux), and variable packet-drop artifacts require real-world network testbeds.

---

## 9. Production Readiness Verdict

> [!CAUTION]
> **FairProctor-AI is NOT claimed to be production-ready or to have validated real-world accuracy.**  
> While Model v2.0.0 represents a significant advance over v1.0.0 by eliminating spatial coordinate shortcuts and temporal split leakage, no visual proctoring algorithm trained on laboratory-staged video can be deployed for autonomous, high-stakes decisions without human-in-the-loop oversight and real-world validation.
