"""Configuration and path management for FairProctor-AI."""

from dataclasses import dataclass, field
from pathlib import Path
from typing import Dict, List, Optional


def find_project_root() -> Path:
    """Find the project root directory based on marker directories or files."""
    current = Path(__file__).resolve().parent
    for parent in [current] + list(current.parents):
        if (parent / "Dataset-main").exists() or (parent / ".git").exists():
            return parent
    # Fallback to grandparent of src/fairproctor/
    return Path(__file__).resolve().parents[2]


PROJECT_ROOT = find_project_root()
ARTIFACTS_DIR = PROJECT_ROOT / "artifacts"
MODELS_DIR = ARTIFACTS_DIR / "models"
EVALUATION_DIR = ARTIFACTS_DIR / "evaluation"

# Dynamic discovery of raw dataset paths to avoid hardcoded names
def discover_dataset_paths() -> Dict[str, Optional[Path]]:
    """Discover dataset directories in the project root."""
    paths: Dict[str, Optional[Path]] = {
        "github_events": None,
        "mendeley_visual": None,
    }

    if not PROJECT_ROOT.exists():
        return paths

    for item in PROJECT_ROOT.iterdir():
        if item.is_dir():
            name_lower = item.name.lower()
            if "dataset-main" in name_lower:
                paths["github_events"] = item
            elif "students suspicious behaviors" in name_lower or "mendeley" in name_lower:
                paths["mendeley_visual"] = item

    return paths


@dataclass
class ProctoringPolicy:
    """Configurable examination proctoring policy."""
    allow_copy_paste: bool = False
    allow_tab_switch: bool = False
    max_tolerated_tab_switches: int = 1
    max_tolerated_out_of_frame_seconds: float = 15.0
    shared_room_mode: bool = True  # Avoid accusing on presence of other people in room
    low_bandwidth_mode: bool = True  # Gracefully tolerate low frame rate / missing frames
    min_face_detection_conf: float = 60.0
    phone_alert_conf: float = 0.50
    risk_threshold_low: float = 30.0
    risk_threshold_medium: float = 60.0


@dataclass
class TrainingConfig:
    """Settings for reproducible model training and evaluation."""
    random_seed: int = 42
    test_size: float = 0.20
    n_splits: int = 5
    cpu_n_jobs: int = -1
    target_recall: float = 0.95  # Operational target for review queue reduction


GLOBAL_POLICY = ProctoringPolicy()
GLOBAL_TRAIN_CONFIG = TrainingConfig()
