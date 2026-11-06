"""
Hybrid Decision Fusion: Confidence Gating & Anomaly Alert.

Monitors prediction confidence against calibrated uncertainty thresholds
and Top-1 vs Top-2 prediction margins to flag ambiguous or out-of-distribution vehicles.
"""

from dataclasses import dataclass
from typing import Any, Dict, List, Optional, Sequence


@dataclass
class ConfidenceAssessment:
    """Evaluation of model certainty and reliability."""
    is_reliable: bool
    top1_confidence: float
    margin_to_second: float
    status: str  # 'CONFIDENT', 'LOW_CONFIDENCE', 'AMBIGUOUS'
    warning_message: Optional[str] = None
    suggested_action: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        return {
            "is_reliable": self.is_reliable,
            "top1_confidence": round(self.top1_confidence, 4),
            "margin_to_second": round(self.margin_to_second, 4),
            "status": self.status,
            "warning_message": self.warning_message,
            "suggested_action": self.suggested_action,
        }


def evaluate_confidence(
    probabilities: Sequence[float],
    threshold: float = 0.50,
    margin_threshold: float = 0.05,
) -> ConfidenceAssessment:
    """
    Evaluates prediction probabilities to detect low-confidence or ambiguous classifications.
    
    Args:
        probabilities: Sorted descending list of top class probabilities [P_1, P_2, ...].
        threshold: Absolute confidence threshold below which an anomaly alert is raised (default 0.50).
        margin_threshold: Minimum margin between Top-1 and Top-2 before flagging ambiguity (default 0.05).
        
    Returns:
        ConfidenceAssessment instance.
    """
    if not probabilities or len(probabilities) == 0:
        return ConfidenceAssessment(
            is_reliable=False,
            top1_confidence=0.0,
            margin_to_second=0.0,
            status="LOW_CONFIDENCE",
            warning_message="No prediction probabilities provided.",
            suggested_action="Verify detector and classifier inputs.",
        )

    p1 = float(probabilities[0])
    p2 = float(probabilities[1]) if len(probabilities) > 1 else 0.0
    margin = max(0.0, p1 - p2)

    # Condition 1: Low absolute confidence (< threshold)
    if p1 < threshold:
        return ConfidenceAssessment(
            is_reliable=False,
            top1_confidence=p1,
            margin_to_second=margin,
            status="LOW_CONFIDENCE",
            warning_message=(
                f"Low prediction confidence ({p1 * 100.0:.1f}%). "
                f"Below reliability threshold of {threshold * 100.0:.1f}%."
            ),
            suggested_action="Check CLAHE normalization tab or upload a clearer, unoccluded view.",
        )

    # Condition 2: Ambiguous decision boundary (margin < margin_threshold)
    if margin < margin_threshold:
        return ConfidenceAssessment(
            is_reliable=False,
            top1_confidence=p1,
            margin_to_second=margin,
            status="AMBIGUOUS",
            warning_message=(
                f"Ambiguous prediction: Top-1 ({p1 * 100.0:.1f}%) and "
                f"Top-2 ({p2 * 100.0:.1f}%) differ by only {margin * 100.0:.1f}%."
            ),
            suggested_action="Review Top-5 candidates for visually identical model years or chassis siblings.",
        )

    # Condition 3: Reliable, high-confidence prediction
    return ConfidenceAssessment(
        is_reliable=True,
        top1_confidence=p1,
        margin_to_second=margin,
        status="CONFIDENT",
        warning_message=None,
        suggested_action="Prediction confirmed with high statistical certainty.",
    )
