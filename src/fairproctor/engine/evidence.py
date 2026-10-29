"""Evidence representation, audit trails, and correlation deduplication."""

from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Dict, List, Optional, Tuple, Union


class EvidenceSource(str, Enum):
    VIDEO_CV = "VIDEO_CV"
    BROWSER_EVENTS = "BROWSER_EVENTS"
    ANSWER_SIMILARITY = "ANSWER_SIMILARITY"
    ENVIRONMENTAL = "ENVIRONMENTAL"


class EvidenceSeverity(str, Enum):
    INFO = "INFO"
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"


@dataclass
class EvidenceItem:
    """Individual, traceable evidence item supporting proctoring assessments."""
    timestamp_or_interval: str
    source: EvidenceSource
    observation_type: str
    observed_value: Any
    relevant_policy: str
    explanation: str
    severity: EvidenceSeverity
    contribution_score: float
    data_quality_limitations: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        return {
            "timestamp_or_interval": self.timestamp_or_interval,
            "source": self.source.value,
            "observation_type": self.observation_type,
            "observed_value": self.observed_value,
            "relevant_policy": self.relevant_policy,
            "explanation": self.explanation,
            "severity": self.severity.value,
            "contribution_score": self.contribution_score,
            "data_quality_limitations": self.data_quality_limitations,
        }


class EvidenceAggregator:
    """Clusters correlated frame observations into deduplicated temporal episodes."""

    @staticmethod
    def cluster_temporal_observations(
        observations: List[Dict[str, Any]],
        max_gap_seconds: float = 10.0
    ) -> List[Dict[str, Any]]:
        """
        Groups sequential observations of the same type within max_gap_seconds
        into a single sustained episode to avoid double-counting.

        Args:
            observations: List of dicts with 'timestamp_sec', 'type', 'confidence'.

        Returns:
            List of aggregated episode dicts.
        """
        if not observations:
            return []

        # Sort by timestamp
        sorted_obs = sorted(observations, key=lambda x: x.get("timestamp_sec", 0.0))
        episodes: List[Dict[str, Any]] = []

        current_episode: Optional[Dict[str, Any]] = None

        for obs in sorted_obs:
            t = float(obs.get("timestamp_sec", 0.0))
            obs_type = obs.get("type", "UNKNOWN")
            conf = float(obs.get("confidence", 1.0))

            if current_episode is None:
                current_episode = {
                    "type": obs_type,
                    "start_sec": t,
                    "end_sec": t,
                    "frame_count": 1,
                    "max_confidence": conf,
                    "details": [obs],
                }
            else:
                same_type = (current_episode["type"] == obs_type)
                within_gap = (t - current_episode["end_sec"]) <= max_gap_seconds

                if same_type and within_gap:
                    current_episode["end_sec"] = t
                    current_episode["frame_count"] += 1
                    current_episode["max_confidence"] = max(current_episode["max_confidence"], conf)
                    current_episode["details"].append(obs)
                else:
                    episodes.append(current_episode)
                    current_episode = {
                        "type": obs_type,
                        "start_sec": t,
                        "end_sec": t,
                        "frame_count": 1,
                        "max_confidence": conf,
                        "details": [obs],
                    }

        if current_episode is not None:
            episodes.append(current_episode)

        return episodes
