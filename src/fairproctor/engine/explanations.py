"""Explainability and human-readable audit trail generator."""

from typing import Any, Dict, List
from fairproctor.engine.evidence import EvidenceItem


class ExplanationGenerator:
    """Generates transparent, contextual explanations for human exam reviewers."""

    @staticmethod
    def generate_reviewer_summary(
        session_id: str,
        risk_score: float,
        integrity_score: float,
        risk_level: str,
        contributing_factors: Dict[str, float],
        evidence_timeline: List[EvidenceItem],
        environmental_warnings: List[str],
        missing_data: List[str],
        model_version: str = "2.0.0",
        policy_version: str = "1.0.0"
    ) -> str:
        """Constructs a comprehensive, non-accusatory reviewer briefing."""
        lines = [
            f"=== FairProctor-AI Reviewer Summary for Session: {session_id} ===",
            f"Review Priority: {risk_level} (Risk Score: {risk_score:.1f}/100, Integrity Score: {integrity_score:.1f}/100)",
            f"Engine Version: Model v{model_version} | Policy v{policy_version}",
            "",
            "Operational Principle:",
            "This score is a provisional review-priority heuristic (0-100) to guide human review queues. "
            "It is NOT an automated accusation, penalty, or empirical probability of cheating.",
            "",
            "Risk Breakdown by Factor:",
        ]

        for factor, points in contributing_factors.items():
            lines.append(f" - {factor.replace('_', ' ').title()}: +{points:.1f} pts")

        if missing_data:
            lines.append("")
            lines.append(f"Missing Modalities: {', '.join(missing_data)} (Handled safely; missing data is never penalized).")

        if environmental_warnings:
            lines.append("")
            lines.append("Environmental Safeguards & Mitigations:")
            for w in environmental_warnings:
                lines.append(f" [Context] {w}")

        lines.append("")
        lines.append(f"Evidence Timeline ({len(evidence_timeline)} traceable flags):")
        if not evidence_timeline:
            lines.append(" - No policy infractions or suspicious anomalies detected.")
        else:
            for item in evidence_timeline:
                lines.append(
                    f" [{item.timestamp_or_interval}] ({item.source.value}) {item.observation_type} "
                    f"[{item.severity.value}]: {item.explanation}"
                )

        return "\n".join(lines)
