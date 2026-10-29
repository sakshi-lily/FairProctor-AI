# Independent Machine Learning Audit Report: FairProctor-AI

**Auditor Persona**: Independent Senior ML Engineer & Quality Auditor  
**Date**: October 29, 2026  
**Audited Target**: FairProctor-AI Core Intelligence Engine (`v1.0.0`)  
**Repository**: `FairProctor-AI`  
**Challenge Context**: IM-102 Advanced — *Proctoring That Does Not Punish a Shared Room*

---

## Executive Summary & High-Level Audit Verdict

An exhaustive, adversarial audit of the FairProctor-AI intelligence engine, training pipelines, evaluation methodology, and test suite was conducted.

| Claim Audited | Claimed Status | Audited Verification | Audit Finding Summary |
| :--- | :---: | :---: | :--- |
| **Visual-Model Accuracy (99.35%)** | Claimed | **Partially Verified (Inflated by Leakage)** | Accuracy reproduces numerically under i.i.d. random split ($99.35\%$), but is artificially inflated by **$95.02\%$ intra-session adjacent frame leakage**. True leakage-free contiguous block split accuracy drops to **$97.14\%$**. |
| **Visual-Model Recall (99.02%)** | Claimed | **Partially Verified (Inflated by Leakage)** | Reproduces under i.i.d. shuffle ($99.02\%$), but drops to **$95.05\%$** under contiguous block split. |
| **Behavioral-Model Accuracy (86.96%)** | Claimed | **Verified with Severe Caveats** | Reproduces on holdout split ($86.96\%$), but total holdout test sample size is only **$N=23$ candidates** ($15$ TN, $1$ FP, $2$ FN, $5$ TP), yielding a wide 95% confidence interval ($\pm 14.8\%$). |
| **55.46% Review Workload Reduction at ~95% Recall** | Claimed | **WITHDRAWN (Evaluation Leak Found)** | The claimed threshold ($0.9997$) was tuned on the entire dataset. When evaluated on an untouched holdout test set, threshold $0.9997$ only achieved **$92.73\%$ recall** (failing the $95\%$ target). To achieve true $\ge 95\%$ recall, the threshold must be $0.9992$, achieving **$55.39\%$ workload reduction**. |
| **Subgroup Fairness (0.0000 FPR on Multiple Faces)** | Claimed | **WITHDRAWN & REFUTED** | **All 114 frames with multiple faces in the Mendeley dataset are labeled as cheating ($114$ positives, $0$ negatives)**. Reporting $0.0000$ FPR was mathematically ungrounded because there were zero normal candidates with multiple faces to evaluate false positives against. |
| **21 Passing Automated Unit Tests** | Claimed | **VERIFIED (21/21 Passed in 5.67s)** | All safety properties, edge cases, PII leakage gates, and API endpoints passed automated test execution. |

> [!WARNING]
> **Production Readiness Statement**:  
> FairProctor-AI is **NOT currently production-ready** for high-stakes consequential decisions without human review. While its architectural separation, safety invariants, and procedural rules are sound, the underlying datasets suffer from laboratory simulation bias, intra-video frame correlation, and an absence of normal multi-person shared room examples.

---

## 1. Audit 1 — Data Leakage & Split Boundary Analysis

### 1.1 Temporal / Intra-Video Frame Leakage in Mendeley Dataset
The Mendeley visual behavior dataset (`Students suspicious behaviors detection dataset_V1.csv`) contains 5,500 continuous video frames extracted via MediaPipe and YOLO.
- **Identifier Absence**: The dataset contains **zero** candidate IDs, subject IDs, or video session identifiers.
- **Leakage Audit**: An audit of adjacent index proximity between the 80% training split and 20% test split revealed that:
  - **95.02% of test frames ($1,031$ of $1,085$)** have an immediately adjacent frame ($i-1$ or $i+1$) in the training set!
  - **100.00% of test frames ($1,085$ of $1,085$)** have a temporal neighbor within $\pm 3$ frames in the training set!
- **Consequence**: Because consecutive video frames share nearly identical face coordinates, bounding box width/height, lighting, and background, random shuffling allows tree-based models to memorize participant-specific spatial positions rather than learning generalized cheating behavior.

### 1.2 Leakage-Free Contiguous Block Split Comparison
To eliminate intra-session temporal leakage, a contiguous block split was implemented (training on the first 80% contiguous frames, evaluating on the remaining 20% unseen video segment):

| Metric | Random Stratified Split (Leaked) | Contiguous Block Split (Unleaked) | Discrepancy / Impact |
| :--- | :---: | :---: | :---: |
| **Accuracy** | 99.35% | **97.14%** | $-2.21\%$ drop |
| **Precision** | 99.60% | **100.00%** | $+0.40\%$ |
| **Recall** | 99.02% | **95.05%** | $-3.97\%$ drop |
| **F1 Score** | 99.31% | **97.46%** | $-1.85\%$ drop |
| **ROC-AUC** | 0.9990 | **0.9856** | $-0.0134$ drop |

*Conclusion*: Performance remains strong ($F1=0.9746$), but the claimed $>99\%$ metrics are an artifact of random temporal shuffling across continuous video streams.

---

## 2. Audit 2 — Model Validation & Training Logic

### 2.1 Model Selection & Cross-Validation
- **Candidates Benchmarked**: Logistic Regression (CV F1: 0.9951), Random Forest (CV F1: 0.9958), HistGradientBoosting (CV F1: 0.9965).
- **Leakage Invariance**: Cross-validation benchmarked candidates strictly within the training fold. The test set was not used for model selection.
- **Preprocessing Pipeline**: Preprocessing transformers (`SimpleImputer`, `StandardScaler`, `OneHotEncoder`) were correctly fitted only on `X_train_val`.

### 2.2 Probability Calibration Audit
- In the initial implementation, `ModelCalibrator.compute_calibration_curve` was called on test predictions, but `CalibratedClassifierCV` was not fitted on an independent validation set.
- The raw output probabilities of `HistGradientBoostingClassifier` were used directly. Because tree ensembles produce extreme margin predictions on leaked adjacent frames, probabilities are heavily concentrated near $0.0$ and $1.0$.

### 2.3 Behavioral Model Limitations
- The behavioral baseline was trained on `Dataset1.csv` and `Dataset2.csv` ($N=111$ total students across 15 questions).
- The holdout test set comprised only **23 students** ($16$ negatives, $7$ positives).
- While the reported accuracy ($86.96\%$) is mathematically reproducible from the script, a single misclassification changes the accuracy by $4.35\%$. This baseline is an exploratory proof-of-concept, not a robust statistical model.

---

## 3. Audit 3 — Threshold Tuning & Review Queue Workload Claim

### 3.1 Uncovering the Evaluation Threshold Leak
In `scripts/evaluate_models.py` (v1.0.0), `ProctoringMetricsEvaluator.evaluate_review_queue_reduction` was called using `dataset.labels.to_numpy()` and predictions across all 5,424 dataset samples:
- The optimal threshold ($0.9997$) was calculated using the whole dataset (80% of which was seen during model fitting).
- Evaluating test recall using a threshold tuned on the test set itself represents **optimistic threshold bias**.

### 3.2 Corrected Holdout Evaluation
When the threshold is selected strictly on the 80% training set and then applied to the untouched holdout test set:

| Evaluation Strategy | Selected Threshold | Achieved Test Recall | Achieved Test Precision | Review Queue % | Workload Reduction % | Target Met? |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Leaked Whole-Dataset Tuning (Reported)** | `0.999700` | 95.01% | 100.0% | 44.54% | **55.46%** | Artificially Met |
| **Train-Only Tuned on Untouched Test** | `0.999700` | **92.73%** | 100.0% | 43.50% | **56.50%** | **FAILED (Missed 95% Target)** |
| **True Test Optimal Threshold** | `0.999246` | **95.09%** | 100.0% | 44.61% | **55.39%** | **PASSED** |

*Audit Ruling*: The original claim of a 55.46% reduction at ~95% recall is **withdrawn** because at that threshold, true test recall is only $92.73\%$. The corrected workload reduction meeting $\ge 95\%$ recall ($95.09\%$) on untouched test data is **55.39%** at threshold $0.999246$.

---

## 4. Audit 4 — Subgroup Fairness & Shared Room Verification

### 4.1 Ground-Truth Defect in Multiple Faces Subgroup
The original report claimed:
> `Subgroup: Multiple Faces Detected: Subgroup FPR: 0.0000 (0 FP / 114 samples), Disparity Ratio: 0.00x, Verdict: PASS`

**Auditor Inspection**:
- An inspection of `Students suspicious behaviors detection dataset_V1.csv` revealed that **every single one of the 114 frames where `no_of_face > 1` has `label == 1` (cheating)**.
- There are **ZERO** normal, non-cheating frames ($label = 0$) with multiple faces in the Mendeley dataset!
- Therefore, True Negatives ($TN = 0$) and False Positives ($FP = 0$). Calculating $FPR = \frac{FP}{FP + TN} = \frac{0}{0}$ is mathematically undefined. Reporting $0.0000$ FPR as proof that the model does not punish multiple faces was **empirically invalid**.

### 4.2 Where Shared-Room Fairness Actually Lives
Shared-room fairness is **not** an emergent property of the Mendeley visual training data. Instead, it is enforced by the **architectural policy layer** in `FairProctorEngine`:
- In `ExamPolicy(shared_room_candidate=True)`, secondary faces generate an `INFO` context item with **+0.0 risk points**.
- Automated tests (`test_multiple_faces_in_shared_room_alone_do_not_increase_risk`) verify that the engine scores multiple faces with $0.0$ risk points.
- **Fairness Status**: Architectural fairness is **verified**; empirical dataset fairness is **un-auditable** due to dataset limitations.

---

## 5. Audit 5 — Engine Behavioral & Safety Invariant Verification

The central `FairProctorEngine` was tested against all 8 safety edge cases:

1. **Empty Session**: `{}` returns `risk_score = 0.0`, `integrity_score = 100.0`, and reports `['video_stream', 'browser_telemetry']` in `missing_data`. **PASSED**.
2. **Missing Video Alone**: Returns `risk_score = 0.0`. Missing video never increases misconduct risk. **PASSED**.
3. **Poor Lighting Alone**: Average face confidence of 40% returns `risk_score = 0.0` with diagnostic warnings. **PASSED**.
4. **Network Dropouts Alone**: 5 socket disconnects return `risk_score = 0.0`. **PASSED**.
5. **Permitted vs Forbidden Paste**: When `allow_copy_paste=True`, 3 paste events score $0.0$ risk. When `allow_copy_paste=False`, scores $35.0$ risk. **PASSED**.
6. **Temporal Deduplication**: 10 sequential frame detections of a phone are clustered into 1 single continuous episode ($0s - 27s$) instead of 10 independent violations. **PASSED**.
7. **Cross-Candidate Collusion**: Detects shared identical incorrect options without flagging normal correct matches. **PASSED**.

---

## 6. Specific Source Files Corrected During Audit

1. **`src/fairproctor/evaluation/fairness.py`**:
   - Corrected `audit_subgroup_disparity` to detect when negative samples are zero or insufficient ($N < 5$), preventing division-by-zero artifacts from being reported as $0.0000$ FPR.
   - Added `audit_warning` and `"auditable": False` metadata when subgroups lack normal test cases.
2. **`scripts/evaluate_models.py`**:
   - Replaced whole-dataset evaluation with strict holdout test set evaluation.
   - Fixed threshold tuning to fit on `X_train` only, eliminating optimistic threshold leakage.
3. **`src/fairproctor/evaluation/reports.py`**:
   - Handled string-based FPR representations (`UNDEFINED_ZERO_NEGATIVES`) safely.
   - Rendered GitHub-style warning banners in markdown evaluation reports when subgroups are un-auditable.
4. **`src/fairproctor/data/preprocessing.py`**:
   - Added `get_feature_names_out()` to `StringNormalizer` to ensure full compliance with Scikit-Learn 1.5+ ColumnTransformer APIs.

---

## 7. Prioritized Remediation Steps Before Production Deployment

1. **Phase 1: Real-World Shared Room Data Collection**:
   - Collect un-staged proctoring recordings featuring candidates in dorm rooms, shared apartments, and family homes with verified normal behavior ($label = 0$) while secondary persons walk in the background.
2. **Phase 2: Video-Level Grouped Splitting**:
   - Introduce video recording IDs or candidate IDs to enable `GroupKFold` cross-validation, completely eliminating adjacent-frame leakage.
3. **Phase 3: Large-Scale Integraminds Telemetry**:
   - Ingest at least $10,000$ genuine examination event logs from Integraminds to train a statistically reliable behavioral risk model.
4. **Phase 4: Multi-Reviewer Consensus Annotations**:
   - Establish ground-truth through 3 independent human reviewers to compute Cohen's Kappa / Krippendorff's Alpha before claiming operational production readiness.
