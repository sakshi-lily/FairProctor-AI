"""Environmental reliability and capture quality assessment.

IMPORTANT FAIRNESS GUARANTEE:
Environmental degradation (poor lighting, low bandwidth, missing frames,
or shared room background noise) is a measurement quality indicator, NOT a misconduct signal.
Degraded environmental conditions MUST NEVER independently increase a candidate's risk score.
"""

import logging
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional

import numpy as np
import pandas as pd

logger = logging.getLogger("fairproctor.features.environmental")


@dataclass
class EnvironmentalReport:
    """Report detailing environmental quality, network stability, and data reliability."""
    reliability_score: float  # 0 to 100: How reliable is the incoming media data
    lighting_quality_score: float  # 0 to 100
    frame_availability_ratio: float  # 0.0 to 1.0 (received / expected)
    is_low_bandwidth: bool
    is_poor_lighting: bool
    is_shared_room_candidate: bool
    network_dropouts_count: int
    warnings: List[str] = field(default_factory=list)
    risk_inflation_penalty: float = 0.0  # Invariant: Always 0.0


class EnvironmentalReliabilityExtractor:
    """Computes deterministic capture quality metrics from observation metadata."""

    @classmethod
    def evaluate_environment(
        cls,
        frames_df: Optional[pd.DataFrame] = None,
        expected_duration_sec: float = 3600.0,
        target_fps: float = 0.2,  # Low-bandwidth default: 1 frame every 5 seconds
        network_interruptions: int = 0,
        has_shared_room_indicators: bool = False
    ) -> EnvironmentalReport:
        """
        Assesses lighting, camera stability, bandwidth, and frame completeness.

        Args:
            frames_df: DataFrame of visual observations (with face_conf, timestamps, etc.).
            expected_duration_sec: Expected examination session length in seconds.
            target_fps: Expected sampling rate (default: 0.2 FPS for low-bandwidth proctoring).
            network_interruptions: Reported number of socket/connection disconnects.
            has_shared_room_indicators: Flag if candidate registered a shared space.

        Returns:
            EnvironmentalReport object.
        """
        warnings: List[str] = []

        if frames_df is None or frames_df.empty:
            warnings.append("No video frames received for this session (Audio/Browser only mode).")
            if network_interruptions > 0:
                warnings.append(
                    f"Candidate experienced {network_interruptions} network interruptions during the exam."
                )
            return EnvironmentalReport(
                reliability_score=0.0,
                lighting_quality_score=0.0,
                frame_availability_ratio=0.0,
                is_low_bandwidth=True,
                is_poor_lighting=False,
                is_shared_room_candidate=has_shared_room_indicators,
                network_dropouts_count=network_interruptions,
                warnings=warnings,
                risk_inflation_penalty=0.0
            )

        n_frames = len(frames_df)
        expected_frames = max(1, int(expected_duration_sec * target_fps))
        availability_ratio = min(1.0, round(n_frames / expected_frames, 3))

        # Assess lighting based on face confidence distribution
        face_conf_col = "face_conf"
        if face_conf_col in frames_df.columns:
            confs = pd.to_numeric(frames_df[face_conf_col], errors="coerce").dropna()
            mean_conf = float(confs.mean()) if len(confs) > 0 else 0.0
        else:
            mean_conf = 80.0

        lighting_score = min(100.0, max(0.0, round(mean_conf, 1)))
        is_poor_lighting = lighting_score < 65.0
        if is_poor_lighting:
            warnings.append(
                f"Poor lighting condition detected (Average face detection confidence {lighting_score:.1f}%). "
                "Confidence threshold softened to avoid false accusations."
            )

        # Check bandwidth & frame availability
        is_low_bw = (availability_ratio < 0.60) or (target_fps <= 0.25)
        if availability_ratio < 0.60:
            warnings.append(
                f"Low frame availability detected ({n_frames}/{expected_frames} frames received, {availability_ratio*100:.1f}%). "
                "System tolerating network latency."
            )

        # Check network interruptions
        if network_interruptions > 0:
            warnings.append(
                f"Candidate experienced {network_interruptions} network interruptions during the exam."
            )

        # Check shared room / multiple people background presence
        if has_shared_room_indicators or ("no_of_face" in frames_df.columns and (frames_df["no_of_face"] > 1).sum() > 0):
            warnings.append(
                "Shared room / background activity observed. Per IM-102 policy, "
                "presence of background individuals alone is NOT grounds for penalty."
            )

        # Composite reliability score (100 = optimal capture conditions, 0 = completely degraded)
        reliability = round(
            0.50 * lighting_score +
            0.50 * (availability_ratio * 100.0) -
            min(20.0, network_interruptions * 5.0),
            1
        )
        reliability = max(0.0, min(100.0, reliability))

        return EnvironmentalReport(
            reliability_score=reliability,
            lighting_quality_score=lighting_score,
            frame_availability_ratio=availability_ratio,
            is_low_bandwidth=is_low_bw,
            is_poor_lighting=is_poor_lighting,
            is_shared_room_candidate=has_shared_room_indicators,
            network_dropouts_count=network_interruptions,
            warnings=warnings,
            risk_inflation_penalty=0.0  # ALWAYS 0.0
        )
