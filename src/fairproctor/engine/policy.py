"""Examination proctoring policy and configuration rules."""

from dataclasses import dataclass, field
from typing import Dict, List, Optional


@dataclass
class ExamPolicy:
    """Configurable proctoring rules per examination."""
    exam_id: str = "default_exam"
    policy_version: str = "1.0.0"
    allow_copy_paste: bool = False
    allow_tab_switch: bool = False
    max_tolerated_tab_switches: int = 1
    max_tolerated_absence_seconds: float = 30.0
    shared_room_candidate: bool = True  # If True, background persons do NOT flag as cheating
    low_bandwidth_candidate: bool = True  # If True, tolerate frame rates down to 0.2 FPS
    risk_threshold_low: float = 25.0
    risk_threshold_medium: float = 55.0
    require_human_review_threshold: float = 55.0


DEFAULT_EXAM_POLICY = ExamPolicy()
