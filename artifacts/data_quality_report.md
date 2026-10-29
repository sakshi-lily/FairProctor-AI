# FairProctor-AI: Data Quality & Schema Inspection Report

## 1. Executive Summary & Dataset Compatibility Assessment

A rigorous inspection of all available datasets in the repository was conducted. The repository contains two distinct, downloaded data sources:

1. **Mendeley Dataset (`Students suspicious behaviors detection dataset fo...`)**:
   - Contains **5,501 video frame observation records** extracted via MediaPipe (Face Mesh, Hands) and YOLO (Phone Detection).
   - **Features**: 37 predictor columns including face bounding boxes, eye/nose/mouth coordinates, hand tracking, head pose (pitch/yaw/roll), phone presence/confidence, and eye gaze direction/coordinates.
   - **Target**: `label` (0 = Normal, 1 = Cheating / Suspicious behavior).
   - **Crucial Ground-Truth Reality**: The dataset documentation confirms these observations originate from **simulated/staged laboratory scenarios** where participants enacted cheating behaviors (e.g., looking away at phones, looking off-screen). Therefore, this dataset supports training a **Frame-Level Visual Behavior Model**, but the model cannot be treated as definitive proof of real-world exam misconduct.

2. **GitHub Assessment Event Dataset (`Dataset-main/`)**:
   - **Aggregated Files (`Dataset1.csv`, `Dataset2.csv`)**: 61 and 52 candidate records respectively, reporting aggregated metrics: Revisions, Visit frequency, Flag, Kendall's Tau (KT), Cosine Distance (CD), and Bloom's Taxonomy score/time splits (HOTS vs. LOTS). Target: `Cheater` (binary).
   - **Raw Event Logs (`Raw_Dataset1.csv`, `Raw_Dataset2.csv`)**: Per-question attempt records (901 and 619 rows) containing question numbers, Bloom's level, timestamps of question visits, response submit timestamps, response selections, time taken, score, and **Tab Switch count**.
   - **Ground-Truth Reality**: The sample size is extremely small (113 total candidate sessions across both CSVs). Combining this dataset directly with the Mendeley dataset would be **methodologically invalid** because one operates at the **frame-level computer vision feature space** while the other operates at the **macro student-session / exam log level**.

> [!IMPORTANT]
> **Architectural Separation Principle**:
> The two datasets describe fundamentally different observation modalities. They **MUST NOT** be merged into a single training table. Instead, FairProctor-AI builds specialized sub-engines: a **Visual Behavior Classifier** trained on frame features, and an **Exam Behavioral Event Analyzer** evaluating student event logs, unified under an explainable **Session Risk Engine**.

---

## 2. Discovered Data Files & Schema Inventory

| File Path | Rows | Columns | Duplicates | Candidate Target | Target Class Distribution |
| :--- | :---: | :---: | :---: | :---: | :--- |
| `Dataset-main/Dataset1.csv` | 60 | 15 | 0 | Cheater | `Cheater`: 0=39, 1=21<br> |
| `Dataset-main/Dataset2.csv` | 51 | 15 | 0 | Cheater | `Cheater`: 0=37, 1=14<br> |
| `Dataset-main/Raw_Dataset1.csv` | 900 | 9 | 0 | None | N/A |
| `Dataset-main/Raw_Dataset2.csv` | 765 | 9 | 0 | None | N/A |
| `Students suspicious behaviors detection dataset fo/Students suspicious behaviors detection dataset_V1.csv` | 5,500 | 38 | 76 | label | `label`: 0=2881, 1=2619<br> |

---

## 3. Data Leakage & Integrity Analysis

### 3.1 Candidate Identifier Leakage
- In `Dataset1.csv`, `Dataset2.csv`, `Raw_Dataset1.csv`, and `Raw_Dataset2.csv`, the column `Username/ID` contains candidate identifiers (e.g., `Student1`, `Student2`).
- **Enforcement**: Candidate IDs must **never** be used as predictive features. They must be stripped during feature engineering to prevent overfitting to specific candidates.

### 3.2 Target Leakage & Aggregated Metrics
- Columns like `Flag` in `Dataset1.csv` / `Dataset2.csv` may reflect prior heuristic flagging or instructor annotations. Using `Flag` to predict `Cheater` would represent label contamination.
- In `Raw_Dataset1.csv`, the `Response-Submit-Timestamp` and `Response` are raw event traces. When computing session-level behavioral features, aggregations (e.g., total tab switches, variance in response time) must be derived deterministically without leaking post-hoc exam grades.

### 3.3 Visual Feature Collinearity & Redundancy
- In the Mendeley dataset, multiple face landmarks (`left_eye_x`, `right_eye_x`, `nose_tip_x`, `mouth_x`) are strongly collinear with `face_x` and `face_y`.
- Head pose is captured both categorically (`head_pose`: forward, down, left, right) and continuous angles (`head_pitch`, `head_yaw`, `head_roll`).
- When `face_present == 0`, coordinates are set to `0` or `None`. Imputation and scaling pipelines must handle zero-padding and 'None' strings without causing data drift.

---

## 4. Documentation Findings (from Table_1.docx & Table_2.docx)

### Documentation File: `Students suspicious behaviors detection dataset fo/Table_1.docx`
**Character Count**: 2884

```text
Table 1 .   Dataset feature glossary Feature Name Data Type Description Example Values/Range Units (if applicable) face_present Integer (Binary) Indicator: 1 if a face is detected, 0 otherwise. 0, 1 N/A no_of_face Integer Number of faces detected in the frame. Typically 1 when  face_present  is 1. 0, 1 Count face_x ,  face_y Float X, Y coordinates of the top-left corner of the detected face bounding box. e.g., 260.7 - 318.1 Pixels face_w ,  face_h Float Width and Height of the detected face bounding box. e.g., 102.2 - 205.2 Pixels left_eye_x ,  left_eye_y Float X, Y coordinates of the left eye ’ s center. e.g., 281.2 - 370.5 Pixels right_eye_x ,  right_eye_y Float X, Y coordinates of the right eye ’ s center. e.g., 332.4 - 437.0 Pixels nose_tip_x ,  nose_tip_y Float X, Y coordinates of the nose tip. e.g., 272.6 - 415.9 Pixels mouth_x ,  mouth_y Float X, Y coordinates of the mouth center. e.g., 272.7 - 407.5 Pixels face_conf Float Confidence score (0-100) of the face detection. Higher is better. e.g., 50.2 - 97.8 Percentage hand_count Integer Number of hands detected in the frame. 0, 1, 2 Count left_hand_x ,  left_hand_y Float X, Y coordinates of the left hand. Zero if not detected.
```

### Documentation File: `Students suspicious behaviors detection dataset fo/Table_2.docx`
**Character Count**: 756

```text
Table 2.  Overview of tools and extracted features in student behavior monitoring modules Module Tool/Library Key Features Extracted Face Detection MediaPipe Face Detection ,  OpenCV face_present ,  face_conf , bounding box, eye/nose/mouth landmarks Head Pose Estimation MediaPipe Face Mesh ,   OpenCV  solvePnP () ,   NumPy head_pose ,  h ead_pitch ,  head_yaw ,  head_roll Eye Gaze Tracking MediaPipe Face Mesh, OpenCV  solvePnP () ,   projectPoints () gaze_on_script ,  gaze_direction ,  gaze_point_x ,  gaze_point_y , pupil coordinates Hand Tracking MediaPipe Hands ,  OpenCV hand-object interaction ,  hand_count , wrist landmarks Mobile  Phone Detection PyTorch ,  YOLOv 5/ YOLOv7 ,  OpenCV p hone_present ,  phone_loc_x ,  phone_loc_ y ,  phone_conf
```

---

## 5. Architectural Recommendations for Phase Two to Five

1. **Visual Behavior Model (Model A)**:
   - Train on `Students suspicious behaviors detection dataset_V1.csv`.
   - Target: `label` (0 vs 1).
   - Features: Facial presence, head pose (yaw, pitch, roll), gaze direction, phone presence, phone confidence, hand count, hand-object interaction.
   - Evaluated using Stratified K-Fold and Grouped K-Fold to prevent sequential frame leakage.

2. **Session Behavioral Event Analyzer (Model B)**:
   - Ingest raw question event logs (`Raw_Dataset1.csv`, `Raw_Dataset2.csv`) and session summaries (`Dataset1.csv`, `Dataset2.csv`).
   - Provide feature extraction for: `total_tab_switches`, `tab_switch_rate`, `mean_response_time`, `lots_vs_hots_time_ratio`, `answer_revision_rate`.
   - Provide a rule-based proctoring policy evaluator aligned with exam configurations.

3. **Environmental Reliability Component (Model C)**:
   - Compute deterministic heuristics for missing frames, low frame rate (e.g., 0.2 FPS / 1 frame per 5 seconds), lighting confidence (`face_conf` drops), and camera occlusion.
   - **Fairness Guarantee**: Environmental degradation NEVER increases misconduct risk score.

4. **Cross-Candidate Similarity Component (Model D)**:
   - Statistical pairwise similarity for identical incorrect choices and response burst synchronization.