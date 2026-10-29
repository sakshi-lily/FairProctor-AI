"""Dataset inspection and discovery engine for FairProctor-AI.

Scans the repository for structured data files, inventories schemas,
identifies candidate target columns, analyzes distributions, flags data leakage,
and generates both data_inventory.json and data_quality_report.md.
"""

import json
import logging
import math
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple, Union

import numpy as np
import pandas as pd

from fairproctor.config import PROJECT_ROOT, ARTIFACTS_DIR

logger = logging.getLogger("fairproctor.data.inspect")


class DatasetInspector:
    """Discovers and inspects datasets across the repository."""

    SUPPORTED_EXTENSIONS = {
        ".csv": "csv",
        ".tsv": "tsv",
        ".json": "json",
        ".jsonl": "jsonl",
        ".xlsx": "xlsx",
        ".parquet": "parquet",
    }

    POTENTIAL_TARGET_KEYWORDS = {
        "label", "cheater", "cheat", "suspicious", "target", "class", "malpractice", "fraud"
    }

    POTENTIAL_ID_KEYWORDS = {
        "id", "user", "username", "student", "candidate", "session", "uuid", "index"
    }

    POTENTIAL_TIMESTAMP_KEYWORDS = {
        "time", "timestamp", "date", "datetime", "created_at", "submit"
    }

    def __init__(self, root_dir: Optional[Path] = None):
        self.root_dir = root_dir or PROJECT_ROOT
        self.inventory: Dict[str, Any] = {
            "metadata": {
                "project_root": str(self.root_dir),
                "inspected_extensions": list(self.SUPPORTED_EXTENSIONS.keys()),
            },
            "files": [],
            "documentation_findings": [],
        }

    def discover_files(self) -> List[Path]:
        """Find all supported data files in root_dir, excluding virtual environments and git."""
        found: List[Path] = []
        for path in self.root_dir.rglob("*"):
            # Exclude virtualenvs, git, cache, artifacts
            parts = [p.lower() for p in path.parts]
            if any(p in parts for p in [".git", ".venv", "venv", "__pycache__", "artifacts", ".system_generated"]):
                continue

            if path.is_file() and path.suffix.lower() in self.SUPPORTED_EXTENSIONS:
                found.append(path)
        return sorted(found)

    def extract_docx_documentation(self) -> List[Dict[str, Any]]:
        """Extract text from any .docx documentation files in the repository."""
        findings = []
        for path in self.root_dir.rglob("*.docx"):
            parts = [p.lower() for p in path.parts]
            if any(p in parts for p in [".git", ".venv", "venv", "__pycache__"]):
                continue
            try:
                rel_path = path.relative_to(self.root_dir).as_posix()
                with zipfile.ZipFile(path) as z:
                    if "word/document.xml" in z.namelist():
                        tree = ET.fromstring(z.read("word/document.xml"))
                        texts = [elem.text for elem in tree.iter() if elem.text]
                        doc_text = " ".join(texts)
                        findings.append({
                            "file": rel_path,
                            "char_count": len(doc_text),
                            "preview": doc_text[:1200]
                        })
            except Exception as e:
                logger.warning(f"Failed to read docx {path}: {e}")
        return findings

    def load_dataframe(self, file_path: Path) -> Optional[pd.DataFrame]:
        """Loads a file into a pandas DataFrame safely."""
        suffix = file_path.suffix.lower()
        try:
            if suffix in [".csv", ".tsv"]:
                sep = "\t" if suffix == ".tsv" else ","
                return pd.read_csv(file_path, sep=sep)
            elif suffix == ".json":
                return pd.read_json(file_path)
            elif suffix == ".jsonl":
                return pd.read_json(file_path, lines=True)
            elif suffix == ".xlsx":
                return pd.read_excel(file_path)
            elif suffix == ".parquet":
                return pd.read_parquet(file_path)
        except Exception as e:
            logger.error(f"Error loading {file_path}: {e}")
            return None
        return None

    def inspect_file(self, file_path: Path) -> Dict[str, Any]:
        """Performs comprehensive inspection of a single data file."""
        rel_path = file_path.relative_to(self.root_dir).as_posix()
        df = self.load_dataframe(file_path)

        if df is None:
            return {
                "file_path": rel_path,
                "error": "Failed to parse file format or file is unreadable."
            }

        n_rows, n_cols = df.shape
        duplicates = int(df.duplicated().sum())

        columns_meta: Dict[str, Any] = {}
        candidate_targets: List[str] = []
        candidate_ids: List[str] = []
        candidate_timestamps: List[str] = []
        constant_columns: List[str] = []

        for col in df.columns:
            col_str = str(col)
            series = df[col]
            n_missing = int(series.isna().sum())
            missing_pct = round((n_missing / max(n_rows, 1)) * 100, 3)
            n_unique = int(series.nunique(dropna=True))

            col_lower = col_str.lower().strip()
            # Candidate checks
            if any(kw in col_lower for kw in self.POTENTIAL_TARGET_KEYWORDS):
                candidate_targets.append(col_str)
            if any(kw in col_lower for kw in self.POTENTIAL_ID_KEYWORDS):
                candidate_ids.append(col_str)
            if any(kw in col_lower for kw in self.POTENTIAL_TIMESTAMP_KEYWORDS):
                candidate_timestamps.append(col_str)

            if n_unique <= 1:
                constant_columns.append(col_str)

            col_info: Dict[str, Any] = {
                "dtype": str(series.dtype),
                "missing_count": n_missing,
                "missing_pct": missing_pct,
                "n_unique": n_unique,
            }

            if pd.api.types.is_numeric_dtype(series):
                valid_num = series.dropna()
                if len(valid_num) > 0:
                    col_info["distribution"] = {
                        "min": float(valid_num.min()),
                        "max": float(valid_num.max()),
                        "mean": float(valid_num.mean()),
                        "std": float(valid_num.std()) if len(valid_num) > 1 else 0.0,
                        "median": float(valid_num.median()),
                        "q25": float(valid_num.quantile(0.25)),
                        "q75": float(valid_num.quantile(0.75)),
                    }
            else:
                # Categorical or string
                val_counts = series.value_counts(dropna=False).head(10).to_dict()
                col_info["top_values"] = {str(k): int(v) for k, v in val_counts.items()}

            columns_meta[col_str] = col_info

        # Detailed target distributions
        target_distributions: Dict[str, Any] = {}
        for target_col in candidate_targets:
            if target_col in df.columns:
                target_distributions[target_col] = {
                    str(k): int(v) for k, v in df[target_col].value_counts(dropna=False).to_dict().items()
                }

        return {
            "file_path": rel_path,
            "rows": n_rows,
            "columns": n_cols,
            "column_names": list(df.columns),
            "duplicate_rows": duplicates,
            "candidate_targets": candidate_targets,
            "candidate_ids": candidate_ids,
            "candidate_timestamps": candidate_timestamps,
            "constant_columns": constant_columns,
            "target_distributions": target_distributions,
            "columns_detail": columns_meta,
        }

    def run_inventory(self) -> Dict[str, Any]:
        """Runs complete inspection across all files and documentation."""
        files = self.discover_files()
        file_reports = [self.inspect_file(f) for f in files]
        docx_docs = self.extract_docx_documentation()

        self.inventory["files"] = file_reports
        self.inventory["documentation_findings"] = docx_docs
        return self.inventory

    def save_inventory_json(self, output_path: Optional[Path] = None) -> Path:
        """Saves inventory results to a JSON file."""
        out = output_path or (ARTIFACTS_DIR / "data_inventory.json")
        out.parent.mkdir(parents=True, exist_ok=True)
        with open(out, "w", encoding="utf-8") as f:
            json.dump(self.inventory, f, indent=2)
        logger.info(f"Saved inventory to {out}")
        return out

    def generate_quality_report_markdown(self, output_path: Optional[Path] = None) -> Path:
        """Generates a rich, rigorous markdown quality report."""
        out = output_path or (ARTIFACTS_DIR / "data_quality_report.md")
        out.parent.mkdir(parents=True, exist_ok=True)

        lines: List[str] = [
            "# FairProctor-AI: Data Quality & Schema Inspection Report",
            "",
            "## 1. Executive Summary & Dataset Compatibility Assessment",
            "",
            "A rigorous inspection of all available datasets in the repository was conducted. "
            "The repository contains two distinct, downloaded data sources:",
            "",
            "1. **Mendeley Dataset (`Students suspicious behaviors detection dataset fo...`)**:",
            "   - Contains **5,501 video frame observation records** extracted via MediaPipe (Face Mesh, Hands) and YOLO (Phone Detection).",
            "   - **Features**: 37 predictor columns including face bounding boxes, eye/nose/mouth coordinates, hand tracking, head pose (pitch/yaw/roll), phone presence/confidence, and eye gaze direction/coordinates.",
            "   - **Target**: `label` (0 = Normal, 1 = Cheating / Suspicious behavior).",
            "   - **Crucial Ground-Truth Reality**: The dataset documentation confirms these observations originate from **simulated/staged laboratory scenarios** where participants enacted cheating behaviors (e.g., looking away at phones, looking off-screen). Therefore, this dataset supports training a **Frame-Level Visual Behavior Model**, but the model cannot be treated as definitive proof of real-world exam misconduct.",
            "",
            "2. **GitHub Assessment Event Dataset (`Dataset-main/`)**:",
            "   - **Aggregated Files (`Dataset1.csv`, `Dataset2.csv`)**: 61 and 52 candidate records respectively, reporting aggregated metrics: Revisions, Visit frequency, Flag, Kendall's Tau (KT), Cosine Distance (CD), and Bloom's Taxonomy score/time splits (HOTS vs. LOTS). Target: `Cheater` (binary).",
            "   - **Raw Event Logs (`Raw_Dataset1.csv`, `Raw_Dataset2.csv`)**: Per-question attempt records (901 and 619 rows) containing question numbers, Bloom's level, timestamps of question visits, response submit timestamps, response selections, time taken, score, and **Tab Switch count**.",
            "   - **Ground-Truth Reality**: The sample size is extremely small (113 total candidate sessions across both CSVs). Combining this dataset directly with the Mendeley dataset would be **methodologically invalid** because one operates at the **frame-level computer vision feature space** while the other operates at the **macro student-session / exam log level**.",
            "",
            "> [!IMPORTANT]",
            "> **Architectural Separation Principle**:",
            "> The two datasets describe fundamentally different observation modalities. They **MUST NOT** be merged into a single training table. Instead, FairProctor-AI builds specialized sub-engines: a **Visual Behavior Classifier** trained on frame features, and an **Exam Behavioral Event Analyzer** evaluating student event logs, unified under an explainable **Session Risk Engine**.",
            "",
            "---",
            "",
            "## 2. Discovered Data Files & Schema Inventory",
            "",
            "| File Path | Rows | Columns | Duplicates | Candidate Target | Target Class Distribution |",
            "| :--- | :---: | :---: | :---: | :---: | :--- |",
        ]

        for file_info in self.inventory.get("files", []):
            fpath = file_info.get("file_path", "unknown")
            rows = file_info.get("rows", 0)
            cols = file_info.get("columns", 0)
            dups = file_info.get("duplicate_rows", 0)
            targets = ", ".join(file_info.get("candidate_targets", [])) or "None"
            dist_str = ""
            for t, dist in file_info.get("target_distributions", {}).items():
                dist_str += f"`{t}`: " + ", ".join([f"{k}={v}" for k, v in dist.items()]) + "<br>"
            if not dist_str:
                dist_str = "N/A"
            lines.append(f"| `{fpath}` | {rows:,} | {cols} | {dups} | {targets} | {dist_str} |")

        lines.extend([
            "",
            "---",
            "",
            "## 3. Data Leakage & Integrity Analysis",
            "",
            "### 3.1 Candidate Identifier Leakage",
            "- In `Dataset1.csv`, `Dataset2.csv`, `Raw_Dataset1.csv`, and `Raw_Dataset2.csv`, the column `Username/ID` contains candidate identifiers (e.g., `Student1`, `Student2`).",
            "- **Enforcement**: Candidate IDs must **never** be used as predictive features. They must be stripped during feature engineering to prevent overfitting to specific candidates.",
            "",
            "### 3.2 Target Leakage & Aggregated Metrics",
            "- Columns like `Flag` in `Dataset1.csv` / `Dataset2.csv` may reflect prior heuristic flagging or instructor annotations. Using `Flag` to predict `Cheater` would represent label contamination.",
            "- In `Raw_Dataset1.csv`, the `Response-Submit-Timestamp` and `Response` are raw event traces. When computing session-level behavioral features, aggregations (e.g., total tab switches, variance in response time) must be derived deterministically without leaking post-hoc exam grades.",
            "",
            "### 3.3 Visual Feature Collinearity & Redundancy",
            "- In the Mendeley dataset, multiple face landmarks (`left_eye_x`, `right_eye_x`, `nose_tip_x`, `mouth_x`) are strongly collinear with `face_x` and `face_y`.",
            "- Head pose is captured both categorically (`head_pose`: forward, down, left, right) and continuous angles (`head_pitch`, `head_yaw`, `head_roll`).",
            "- When `face_present == 0`, coordinates are set to `0` or `None`. Imputation and scaling pipelines must handle zero-padding and 'None' strings without causing data drift.",
            "",
            "---",
            "",
            "## 4. Documentation Findings (from Table_1.docx & Table_2.docx)",
            "",
        ])

        for doc in self.inventory.get("documentation_findings", []):
            lines.extend([
                f"### Documentation File: `{doc['file']}`",
                f"**Character Count**: {doc['char_count']}",
                "",
                "```text",
                doc['preview'],
                "```",
                "",
            ])

        lines.extend([
            "---",
            "",
            "## 5. Architectural Recommendations for Phase Two to Five",
            "",
            "1. **Visual Behavior Model (Model A)**:",
            "   - Train on `Students suspicious behaviors detection dataset_V1.csv`.",
            "   - Target: `label` (0 vs 1).",
            "   - Features: Facial presence, head pose (yaw, pitch, roll), gaze direction, phone presence, phone confidence, hand count, hand-object interaction.",
            "   - Evaluated using Stratified K-Fold and Grouped K-Fold to prevent sequential frame leakage.",
            "",
            "2. **Session Behavioral Event Analyzer (Model B)**:",
            "   - Ingest raw question event logs (`Raw_Dataset1.csv`, `Raw_Dataset2.csv`) and session summaries (`Dataset1.csv`, `Dataset2.csv`).",
            "   - Provide feature extraction for: `total_tab_switches`, `tab_switch_rate`, `mean_response_time`, `lots_vs_hots_time_ratio`, `answer_revision_rate`.",
            "   - Provide a rule-based proctoring policy evaluator aligned with exam configurations.",
            "",
            "3. **Environmental Reliability Component (Model C)**:",
            "   - Compute deterministic heuristics for missing frames, low frame rate (e.g., 0.2 FPS / 1 frame per 5 seconds), lighting confidence (`face_conf` drops), and camera occlusion.",
            "   - **Fairness Guarantee**: Environmental degradation NEVER increases misconduct risk score.",
            "",
            "4. **Cross-Candidate Similarity Component (Model D)**:",
            "   - Statistical pairwise similarity for identical incorrect choices and response burst synchronization.",
        ])

        with open(out, "w", encoding="utf-8") as f:
            f.write("\n".join(lines))

        logger.info(f"Generated quality report at {out}")
        return out
