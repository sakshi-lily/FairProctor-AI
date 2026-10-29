"""Central Integrity Risk Engine for FairProctor-AI.

Aggregates multi-modal evidence across visual computer vision, browser event telemetry,
environmental reliability, and answer similarity into explainable review assessments.
"""

import logging
from dataclasses import asdict, dataclass, field
from pathlib import Path
from typing import Any, Dict, List, Optional, Union

import numpy as np
import pandas as pd

from fairproctor.config import MODELS_DIR
from fairproctor.engine.evidence import (
    EvidenceAggregator,
    EvidenceItem,
    EvidenceSeverity,
    EvidenceSource,
)
from fairproctor.engine.explanations import ExplanationGenerator
from fairproctor.engine.policy import DEFAULT_EXAM_POLICY, ExamPolicy
from fairproctor.features.environmental_features import EnvironmentalReliabilityExtractor
from fairproctor.features.similarity_features import AnswerSimilarityAnalyzer, PairwiseSimilarityResult
from fairproctor.models.session_risk_model import BehavioralSessionModel
from fairproctor.models.visual_behavior_model import VisualBehaviorClassifier

logger = logging.getLogger("fairproctor.engine.risk_engine")


@dataclass
class SessionRiskAssessment:
    """Structured proctoring risk assessment object.

    NOTE ON SCORE INTERPRETATION:
    The risk_score (0-100) is a provisional review-priority heuristic used to rank
    human reviewer queues. It is NOT a calibrated probability of cheating.
    """
    session_id: str
    risk_score: float  # 0 to 100 (review-priority heuristic; NOT a calibrated probability)
    integrity_score: float  # 0 to 100 (100 - risk_score)
    risk_level: str  # Review-priority category: 'LOW', 'MEDIUM', 'HIGH'
    evidence_timeline: List[Dict[str, Any]]
    contributing_factors: Dict[str, float]
    environmental_warnings: List[str]
    missing_data: List[str]
    confidence_or_uncertainty: str
    recommended_action: str  # 'NO_ACTION', 'SPOT_CHECK', 'PRIORITY_HUMAN_REVIEW'
    model_version: str
    policy_version: str
    summary_explanation: str

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


class FairProctorEngine:
    """Main intelligence engine for FairProctor-AI."""

    def __init__(
        self,
        visual_model: Optional[VisualBehaviorClassifier] = None,
        behavioral_model: Optional[BehavioralSessionModel] = None,
        similarity_analyzer: Optional[AnswerSimilarityAnalyzer] = None,
        version: str = "2.0.0"
    ):
        self.visual_model = visual_model
        self.behavioral_model = behavioral_model or BehavioralSessionModel()
        self.similarity_analyzer = similarity_analyzer or AnswerSimilarityAnalyzer()
        self.version = version

    @classmethod
    def load(
        cls,
        models_dir: Optional[Path] = None,
        load_visual: bool = True,
        load_behavioral: bool = True,
        visual_version: str = "v2",
        allow_legacy_fallback: bool = False,
    ) -> "FairProctorEngine":
        """
        Loads pre-trained models from the artifacts directory if available.

        Args:
            models_dir: Directory containing saved model bundles.
            load_visual: Whether to load the visual behavior model.
            load_behavioral: Whether to load the behavioral session model.
            visual_version: Target visual model version ('v2' or 'v1'). Defaults to 'v2'.
            allow_legacy_fallback: If True and v2 is requested but missing, allows falling
                                   back to legacy v1. If False (default), raises an explicit,
                                   actionable FileNotFoundError.

        Raises:
            FileNotFoundError: If the requested visual model is unavailable and fallback is disabled.
        """
        m_dir = models_dir or MODELS_DIR
        visual_model = None
        behavioral_model = None

        if load_visual:
            v_path_v2 = m_dir / "visual_behavior_model_v2.joblib"
            v_path_v1 = m_dir / "visual_behavior_model.joblib"

            if visual_version == "v2":
                if v_path_v2.exists():
                    v_path = v_path_v2
                elif allow_legacy_fallback:
                    if v_path_v1.exists():
                        logger.warning(
                            "Visual model v2.0.0 not found; using legacy v1.0.0 because allow_legacy_fallback=True."
                        )
                        v_path = v_path_v1
                    else:
                        raise FileNotFoundError(
                            f"Neither visual model v2.0.0 ({v_path_v2.name}) nor legacy v1.0.0 ({v_path_v1.name}) "
                            f"was found in {m_dir}."
                        )
                else:
                    raise FileNotFoundError(
                        f"Visual model v2.0.0 not found at {v_path_v2}. "
                        "Train and persist v2.0.0 using 'python scripts/train_visual_model.py --version v2', "
                        "or explicitly pass allow_legacy_fallback=True to permit legacy v1.0.0."
                    )
            elif visual_version == "v1":
                if v_path_v1.exists():
                    v_path = v_path_v1
                else:
                    raise FileNotFoundError(f"Legacy visual model v1.0.0 not found at {v_path_v1}.")
            else:
                v_path = m_dir / f"visual_behavior_model_{visual_version}.joblib"
                if not v_path.exists():
                    raise FileNotFoundError(f"Requested visual model '{visual_version}' not found at {v_path}.")

            try:
                visual_model = VisualBehaviorClassifier.load(v_path)
                logger.info(
                    f"Loaded visual behavior model ({visual_model.metadata.get('version', 'unknown')}) from {v_path.name}."
                )
            except Exception as e:
                logger.error(f"Failed to load visual model from {v_path}: {e}")
                raise

        if load_behavioral:
            b_path = m_dir / "session_behavior_model.joblib"
            if b_path.exists():
                try:
                    behavioral_model = BehavioralSessionModel.load(b_path)
                    logger.info("Loaded behavioral session model.")
                except Exception as e:
                    logger.warning(f"Failed to load behavioral model from {b_path}: {e}")

        engine_version = "2.0.0" if (visual_model and visual_model.metadata.get("version") in ["2.0.0", "v2.0.0"]) else "1.0.0"
        return cls(
            visual_model=visual_model,
            behavioral_model=behavioral_model,
            version=engine_version
        )

    def score_session(self, session_data: Dict[str, Any]) -> SessionRiskAssessment:
        """
        Scores an examination session from multi-modal evidence.

        Args:
            session_data: Dict containing:
                - session_id: str
                - session_metadata: dict
                - video_observations: list of dicts (or None)
                - browser_events: dict or list of dicts (or None)
                - environmental_conditions: dict (or None)
                - similarity_findings: dict or list (or None)
                - policy: optional ExamPolicy instance or dict

        Returns:
            SessionRiskAssessment object.
        """
        session_id = str(session_data.get("session_id", "session_unknown"))
        meta = session_data.get("session_metadata", {})
        raw_policy = session_data.get("policy")

        # Resolve policy
        if isinstance(raw_policy, ExamPolicy):
            policy = raw_policy
        elif isinstance(raw_policy, dict):
            policy = ExamPolicy(**raw_policy)
        else:
            policy = DEFAULT_EXAM_POLICY

        # Track missing modalities
        missing_data: List[str] = []
        video_obs = session_data.get("video_observations")
        browser_events = session_data.get("browser_events")

        if video_obs is None or len(video_obs) == 0:
            missing_data.append("video_stream")
        if browser_events is None or (isinstance(browser_events, dict) and len(browser_events) == 0):
            missing_data.append("browser_telemetry")

        evidence_items: List[EvidenceItem] = []
        contributing_factors: Dict[str, float] = {
            "visual_behavior": 0.0,
            "browser_events": 0.0,
            "cross_candidate_similarity": 0.0,
        }

        # -------------------------------------------------------------
        # 1. Environmental Reliability Assessment
        # FAIRNESS GUARANTEE: Environmental conditions NEVER independently
        # increase misconduct risk (+0.0 points).
        # -------------------------------------------------------------
        env_meta = session_data.get("environmental_conditions") or {}
        frames_df = pd.DataFrame(video_obs) if video_obs else None
        is_shared_room = meta.get("is_shared_room", policy.shared_room_candidate)

        env_report = EnvironmentalReliabilityExtractor.evaluate_environment(
            frames_df=frames_df,
            expected_duration_sec=float(meta.get("expected_duration_sec", 3600.0)),
            target_fps=float(env_meta.get("fps", 0.2)),
            network_interruptions=int(env_meta.get("network_interruptions", 0)),
            has_shared_room_indicators=is_shared_room
        )

        environmental_warnings = list(env_report.warnings)

        # -------------------------------------------------------------
        # 2. Visual Observations Analysis (with Temporal Deduplication)
        # -------------------------------------------------------------
        if frames_df is not None and not frames_df.empty:
            # Validate timestamps
            if "timestamp_sec" in frames_df.columns:
                ts_series = pd.to_numeric(frames_df["timestamp_sec"], errors="coerce")
                if (ts_series < 0.0).any():
                    raise ValueError("Invalid timestamp detected: timestamp_sec cannot be negative.")
                frames_df["timestamp_sec"] = ts_series.fillna(0.0)
                frames_df = frames_df.sort_values(by="timestamp_sec").reset_index(drop=True)
            else:
                target_fps = float(env_meta.get("fps", 0.2))
                step = 1.0 / max(target_fps, 0.01)
                frames_df["timestamp_sec"] = [float(i * step) for i in range(len(frames_df))]

            # Model-driven inference if classifier is loaded
            model_flagged_indices = set()
            if self.visual_model is not None:
                try:
                    eval_cols = self.visual_model.feature_names
                    eval_df = pd.DataFrame(index=frames_df.index)
                    for col in eval_cols:
                        if col in frames_df.columns:
                            eval_df[col] = frames_df[col]
                        elif col in ["head_pose", "gaze_direction"]:
                            eval_df[col] = "forward" if col == "head_pose" else "center"
                        else:
                            eval_df[col] = 0.0

                    probas = self.visual_model.predict_proba(eval_df)[:, 1]
                    # Identify frames where model probability is elevated (>= 0.85)
                    for idx, p in enumerate(probas):
                        if p >= 0.85:
                            model_flagged_indices.add(idx)
                except Exception as e:
                    logger.warning(f"Visual model inference failed on session frames: {e}")

            phone_obs = []
            away_obs = []
            multi_face_obs = []

            for idx, row in frames_df.iterrows():
                t_sec = float(row.get("timestamp_sec", idx * 5.0))

                # Phone check (YOLO detection + phone presence flag)
                p_pres = int(row.get("phone_present", 0))
                p_conf = float(row.get("phone_conf", 0.0))
                if p_pres > 0 and p_conf >= 0.40:
                    phone_obs.append({
                        "type": "PHONE_DETECTED",
                        "timestamp_sec": t_sec,
                        "confidence": p_conf
                    })

                # Gaze / head orientation check
                h_pose = str(row.get("head_pose", "forward")).strip().lower()
                g_dir = str(row.get("gaze_direction", "center")).strip().lower()
                g_on_script = str(row.get("gaze_on_script", "1")).strip()

                is_away = (
                    h_pose in ["left", "right", "down"] or
                    g_dir in ["bottom_left", "bottom_right", "looking down", "looking left", "looking right"] or
                    g_on_script == "0"
                )

                if is_away:
                    away_obs.append({
                        "type": "GAZE_DEVIATION",
                        "timestamp_sec": t_sec,
                        "confidence": 0.80,
                        "head_pose": h_pose
                    })

                # Multiple faces check
                n_faces = int(row.get("no_of_face", 1))
                if n_faces > 1:
                    multi_face_obs.append({
                        "type": "MULTIPLE_FACES",
                        "timestamp_sec": t_sec,
                        "confidence": 0.90
                    })

            # 2a. Cluster phone detections to avoid repeated double-counting
            phone_episodes = EvidenceAggregator.cluster_temporal_observations(phone_obs, max_gap_seconds=15.0)
            for ep in phone_episodes:
                dur = round(ep["end_sec"] - ep["start_sec"] + 5.0, 1)
                pts = min(40.0, 20.0 + (dur / 10.0) * 10.0)
                contributing_factors["visual_behavior"] += pts
                evidence_items.append(EvidenceItem(
                    timestamp_or_interval=f"{int(ep['start_sec'])}s - {int(ep['end_sec'])}s",
                    source=EvidenceSource.VIDEO_CV,
                    observation_type="PHONE_DETECTED",
                    observed_value=f"Phone observed across {ep['frame_count']} frame(s) for ~{dur}s",
                    relevant_policy="Unauthorized mobile devices strictly prohibited",
                    explanation=f"Unauthorized mobile device observed lasting approximately {dur} seconds.",
                    severity=EvidenceSeverity.HIGH,
                    contribution_score=pts
                ))

            # 2b. Cluster gaze deviations
            # FAIRNESS SAFEGUARD: Brief downward looks or head turns (< max_tolerated_absence_seconds)
            # MUST NOT be treated as confirmed cheating!
            away_episodes = EvidenceAggregator.cluster_temporal_observations(away_obs, max_gap_seconds=10.0)
            for ep in away_episodes:
                dur = round(ep["end_sec"] - ep["start_sec"] + 5.0, 1)
                if dur >= policy.max_tolerated_absence_seconds:
                    pts = min(20.0, 5.0 + (dur / 20.0) * 5.0)
                    contributing_factors["visual_behavior"] += pts
                    evidence_items.append(EvidenceItem(
                        timestamp_or_interval=f"{int(ep['start_sec'])}s - {int(ep['end_sec'])}s",
                        source=EvidenceSource.VIDEO_CV,
                        observation_type="PROLONGED_LOOKING_AWAY",
                        observed_value=f"Gaze deviation lasting ~{dur}s",
                        relevant_policy="Sustained gaze deviation beyond tolerated threshold",
                        explanation=(
                            f"Candidate gaze diverted from screen for {dur}s. Reviewer should verify "
                            "if candidate is consulting permitted scratchpad / physical calculation notes."
                        ),
                        severity=EvidenceSeverity.MEDIUM,
                        contribution_score=pts
                    ))

            # 2c. Shared room check: multiple faces
            # FAIRNESS SAFEGUARD: In shared room mode, multiple faces are flagged as context, NOT penalized!
            if multi_face_obs:
                if is_shared_room:
                    evidence_items.append(EvidenceItem(
                        timestamp_or_interval="Multiple intervals",
                        source=EvidenceSource.ENVIRONMENTAL,
                        observation_type="BACKGROUND_PERSON_DETECTED",
                        observed_value=f"{len(multi_face_obs)} frame(s) with secondary face",
                        relevant_policy="Shared Room Protection (IM-102)",
                        explanation="Secondary person observed in background; not penalized per shared-room policy.",
                        severity=EvidenceSeverity.INFO,
                        contribution_score=0.0
                    ))
                else:
                    # In an isolated room policy, brief background appearance is low severity, sustained is medium
                    pts = 15.0 if len(multi_face_obs) >= 3 else 5.0
                    sev = EvidenceSeverity.MEDIUM if pts >= 15.0 else EvidenceSeverity.LOW
                    contributing_factors["visual_behavior"] += pts
                    evidence_items.append(EvidenceItem(
                        timestamp_or_interval="Multiple intervals",
                        source=EvidenceSource.VIDEO_CV,
                        observation_type="MULTIPLE_FACES_DETECTED",
                        observed_value=f"{len(multi_face_obs)} frame(s) with multiple faces",
                        relevant_policy="Exam requires isolated room",
                        explanation=f"Multiple individuals detected in candidate video frame ({len(multi_face_obs)} frames).",
                        severity=sev,
                        contribution_score=pts
                    ))

        # -------------------------------------------------------------
        # 3. Browser Events Evaluation
        # -------------------------------------------------------------
        if browser_events:
            b_summary = browser_events if isinstance(browser_events, dict) else {}
            tab_switches = int(b_summary.get("total_tab_switches", 0))
            paste_count = int(b_summary.get("paste_count", 0))
            rapid_answers = int(b_summary.get("rapid_answer_count", 0))

            # 3a. Tab switches
            if not policy.allow_tab_switch and tab_switches > policy.max_tolerated_tab_switches:
                excess = tab_switches - policy.max_tolerated_tab_switches
                severity = EvidenceSeverity.HIGH if excess >= 3 else EvidenceSeverity.MEDIUM
                tab_pts = min(40.0, excess * 12.0)
                contributing_factors["browser_events"] += tab_pts
                evidence_items.append(EvidenceItem(
                    timestamp_or_interval="Session duration",
                    source=EvidenceSource.BROWSER_EVENTS,
                    observation_type="TAB_SWITCH_VIOLATION",
                    observed_value=tab_switches,
                    relevant_policy="Browser focus and navigation integrity rules",
                    explanation=f"Candidate switched browser tabs {tab_switches} times (policy tolerates {policy.max_tolerated_tab_switches}).",
                    severity=severity,
                    contribution_score=tab_pts
                ))

            # 3b. Paste events: interpreted strictly according to configured exam policy
            if policy.allow_copy_paste:
                if paste_count > 0:
                    evidence_items.append(EvidenceItem(
                        timestamp_or_interval="Session duration",
                        source=EvidenceSource.BROWSER_EVENTS,
                        observation_type="PERMITTED_PASTE_EVENT",
                        observed_value=paste_count,
                        relevant_policy="Exam permits copy-paste",
                        explanation=f"Paste event detected ({paste_count} instances), permitted under current exam policy.",
                        severity=EvidenceSeverity.INFO,
                        contribution_score=0.0
                    ))
            else:
                if paste_count > 0:
                    paste_pts = min(35.0, paste_count * 15.0)
                    contributing_factors["browser_events"] += paste_pts
                    evidence_items.append(EvidenceItem(
                        timestamp_or_interval="Session duration",
                        source=EvidenceSource.BROWSER_EVENTS,
                        observation_type="COPY_PASTE_VIOLATION",
                        observed_value=paste_count,
                        relevant_policy="Unauthorized copy-paste prohibited",
                        explanation=f"Unauthorized paste event detected ({paste_count} instances).",
                        severity=EvidenceSeverity.HIGH,
                        contribution_score=paste_pts
                    ))

            # 3c. Rapid guessing / bot-like submissions (< 5 sec answers)
            if rapid_answers >= 3:
                rapid_pts = 10.0
                contributing_factors["browser_events"] += rapid_pts
                evidence_items.append(EvidenceItem(
                    timestamp_or_interval="Session duration",
                    source=EvidenceSource.BROWSER_EVENTS,
                    observation_type="RAPID_RESPONSE_ANOMALY",
                    observed_value=rapid_answers,
                    relevant_policy="Natural response time distribution",
                    explanation=f"{rapid_answers} questions answered abnormally fast (< 5s), suggesting random guessing.",
                    severity=EvidenceSeverity.LOW,
                    contribution_score=rapid_pts
                ))

        # -------------------------------------------------------------
        # 4. Cross-Candidate Collusion Evaluation
        # -------------------------------------------------------------
        sim_data = session_data.get("similarity_findings")
        if sim_data:
            if isinstance(sim_data, dict):
                collusion_flag = sim_data.get("suspicious_collusion_flag", False)
                if collusion_flag:
                    pts = 35.0
                    contributing_factors["cross_candidate_similarity"] += pts
                    evidence_items.append(EvidenceItem(
                        timestamp_or_interval="Post-exam analysis",
                        source=EvidenceSource.ANSWER_SIMILARITY,
                        observation_type="SUSPICIOUS_ANSWER_COLLUSION",
                        observed_value=sim_data.get("identical_response_ratio", 0.0),
                        relevant_policy="Independent candidate test completion",
                        explanation=sim_data.get("explanation", "High proportion of shared identical incorrect answers."),
                        severity=EvidenceSeverity.HIGH,
                        contribution_score=pts
                    ))

        # -------------------------------------------------------------
        # 5. Composite Risk Calculation & Review Priority
        # The score is a provisional review-priority heuristic (0-100).
        # -------------------------------------------------------------
        total_risk = sum(contributing_factors.values())
        final_risk = min(100.0, max(0.0, round(total_risk, 1)))
        integrity_score = round(100.0 - final_risk, 1)

        if final_risk < policy.risk_threshold_low:
            risk_level = "LOW"
            action = "NO_ACTION"
        elif final_risk < policy.risk_threshold_medium:
            risk_level = "MEDIUM"
            action = "SPOT_CHECK"
        else:
            risk_level = "HIGH"
            action = "PRIORITY_HUMAN_REVIEW"

        # Confidence assessment based on missing modalities and environment
        confidence_factors = []
        if env_report.reliability_score < 50.0:
            confidence_factors.append("Low environmental quality")
        if missing_data:
            confidence_factors.append(f"Missing {', '.join(missing_data)}")

        if not confidence_factors:
            confidence_str = "HIGH (Full multi-modal evidence available and stable environment)"
        elif len(confidence_factors) == 1:
            confidence_str = f"MODERATE ({confidence_factors[0]})"
        else:
            confidence_str = f"LOW ({'; '.join(confidence_factors)})"

        summary_text = ExplanationGenerator.generate_reviewer_summary(
            session_id=session_id,
            risk_score=final_risk,
            integrity_score=integrity_score,
            risk_level=risk_level,
            contributing_factors=contributing_factors,
            evidence_timeline=evidence_items,
            environmental_warnings=environmental_warnings,
            missing_data=missing_data,
            model_version=self.version,
            policy_version=policy.policy_version
        )

        return SessionRiskAssessment(
            session_id=session_id,
            risk_score=final_risk,
            integrity_score=integrity_score,
            risk_level=risk_level,
            evidence_timeline=[item.to_dict() for item in evidence_items],
            contributing_factors=contributing_factors,
            environmental_warnings=environmental_warnings,
            missing_data=missing_data,
            confidence_or_uncertainty=confidence_str,
            recommended_action=action,
            model_version=self.version,
            policy_version=policy.policy_version,
            summary_explanation=summary_text
        )
