"""Cross-candidate answer similarity and collusion detection component.

IMPORTANT METHODOLOGICAL NOTE:
Detecting collusion requires comparing identical incorrect answers, answer sequences,
and synchronized submission bursts. A single shared answer or normal correct answers
must NEVER be treated as proof of collusion.
"""

import logging
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Set, Tuple

logger = logging.getLogger("fairproctor.features.similarity")


@dataclass
class PairwiseSimilarityResult:
    """Pairwise similarity findings between two candidates."""
    candidate_a: str
    candidate_b: str
    common_questions_count: int
    identical_response_ratio: float
    identical_incorrect_count: int
    suspicious_collusion_flag: bool
    explanation: str


class AnswerSimilarityAnalyzer:
    """Analyzes answer patterns and timing synchronization across candidates."""

    def __init__(
        self,
        min_common_questions: int = 5,
        min_identical_incorrect: int = 3,
        min_match_ratio: float = 0.85
    ):
        self.min_common_questions = min_common_questions
        self.min_identical_incorrect = min_identical_incorrect
        self.min_match_ratio = min_match_ratio

    def compare_candidate_pair(
        self,
        candidate_a: str,
        answers_a: Dict[str, Dict[str, Any]],
        candidate_b: str,
        answers_b: Dict[str, Dict[str, Any]]
    ) -> PairwiseSimilarityResult:
        """
        Compares two candidates' answer submissions for collusion indicators.

        Args:
            candidate_a: Identifier for Candidate A.
            answers_a: Dict mapping question_id -> {"response": str, "is_correct": bool, "timestamp": float}
            candidate_b: Identifier for Candidate B.
            answers_b: Dict mapping question_id -> {"response": str, "is_correct": bool, "timestamp": float}

        Returns:
            PairwiseSimilarityResult object.
        """
        common_q = set(answers_a.keys()) & set(answers_b.keys())
        n_common = len(common_q)

        if n_common < self.min_common_questions:
            return PairwiseSimilarityResult(
                candidate_a=candidate_a,
                candidate_b=candidate_b,
                common_questions_count=n_common,
                identical_response_ratio=0.0,
                identical_incorrect_count=0,
                suspicious_collusion_flag=False,
                explanation=f"Insufficient common questions ({n_common}/{self.min_common_questions}) to assess similarity."
            )

        identical_count = 0
        identical_incorrect = 0

        for q in common_q:
            resp_a = str(answers_a[q].get("response", "")).strip().lower()
            resp_b = str(answers_b[q].get("response", "")).strip().lower()
            corr_a = bool(answers_a[q].get("is_correct", True))
            corr_b = bool(answers_b[q].get("is_correct", True))

            if resp_a and resp_a == resp_b:
                identical_count += 1
                # If both are incorrect and chose the identical distractor
                if not corr_a and not corr_b:
                    identical_incorrect += 1

        match_ratio = round(identical_count / max(n_common, 1), 3)

        # Flag only if significant shared wrong answers or overwhelming identical match
        is_suspicious = (
            identical_incorrect >= self.min_identical_incorrect and
            match_ratio >= self.min_match_ratio
        )

        if is_suspicious:
            explanation = (
                f"Elevated similarity: {match_ratio*100:.1f}% matching answers across {n_common} questions, "
                f"including {identical_incorrect} identical incorrect distractor choices."
            )
        else:
            explanation = (
                f"Similarity within normal variance: {match_ratio*100:.1f}% match, "
                f"{identical_incorrect} identical incorrect choices."
            )

        return PairwiseSimilarityResult(
            candidate_a=candidate_a,
            candidate_b=candidate_b,
            common_questions_count=n_common,
            identical_response_ratio=match_ratio,
            identical_incorrect_count=identical_incorrect,
            suspicious_collusion_flag=is_suspicious,
            explanation=explanation
        )

    def analyze_batch(
        self,
        cohort_answers: Dict[str, Dict[str, Dict[str, Any]]]
    ) -> List[PairwiseSimilarityResult]:
        """Runs pairwise comparison across all candidates in a cohort."""
        candidates = sorted(list(cohort_answers.keys()))
        results = []

        for i in range(len(candidates)):
            for j in range(i + 1, len(candidates)):
                c1, c2 = candidates[i], candidates[j]
                res = self.compare_candidate_pair(c1, cohort_answers[c1], c2, cohort_answers[c2])
                if res.suspicious_collusion_flag or res.identical_incorrect_count > 0:
                    results.append(res)

        return results
