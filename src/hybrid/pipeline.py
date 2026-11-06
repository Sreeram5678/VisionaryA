"""
Hybrid Decision Fusion: Master Vehicle Recognition Pipeline.

End-to-end framework integrating:
1. YOLOv8 Vehicle Detection & Localization
2. Classical Computer Vision (CLAHE, Bilateral, Canny, Contours, HSV, LBP)
3. ConvNeXt Fine-Grained 196-Class Classification
4. 1312-dimensional Multimodal Feature Fusion
5. Confidence Gating & Anomaly Alert
"""

from dataclasses import dataclass, field
import time
from typing import Any, Dict, List, Optional, Tuple, Union
import numpy as np
from PIL import Image

from src.classical import ClassicalPipeline, ClassicalResult
from src.classification import (
    CarPrediction,
    ClassificationResult,
    VehicleClassifierEngine,
)
from src.detection import DetectionBox, DetectionResult, VehicleDetector
from src.hybrid.fusion import fuse_features
from src.hybrid.gate import ConfidenceAssessment, evaluate_confidence


@dataclass
class HybridAnalysisResult:
    """Consolidated end-to-end analysis result."""
    vehicle_detected: bool
    primary_box: Optional[DetectionBox]
    top1: CarPrediction
    top5: List[CarPrediction]
    confidence_assessment: ConfidenceAssessment
    fused_embedding: np.ndarray
    classical_metrics: Dict[str, float]
    visualizations: Dict[str, np.ndarray]
    total_latency_ms: float
    status: str = "Success"

    def to_dict(self) -> Dict[str, Any]:
        """Serializes result into a JSON-compatible dictionary."""
        return {
            "vehicle_detected": self.vehicle_detected,
            "primary_box": self.primary_box.to_dict() if self.primary_box else None,
            "top1": self.top1.to_dict(),
            "top5": [p.to_dict() for p in self.top5],
            "confidence_assessment": self.confidence_assessment.to_dict(),
            "fused_embedding_dim": int(self.fused_embedding.shape[0]),
            "classical_metrics": self.classical_metrics,
            "available_visualizations": list(self.visualizations.keys()),
            "total_latency_ms": round(self.total_latency_ms, 2),
            "status": self.status,
        }


class HybridVehicleRecognizer:
    """
    Master recognition system chaining detection, classical CV, deep transfer learning,
    and decision fusion into a single high-throughput engine.
    """

    def __init__(
        self,
        detector_weights: str = "yolov8n.pt",
        classifier_weights: Optional[str] = None,
        detection_conf: float = 0.25,
        confidence_threshold: float = 0.50,
        margin_threshold: float = 0.05,
        device: Optional[str] = None,
    ):
        """
        Initializes the HybridVehicleRecognizer pipeline.
        
        Args:
            detector_weights: Path/name of YOLOv8 detector weights.
            classifier_weights: Path to fine-tuned ConvNeXt classifier weights.
            detection_conf: Minimum confidence for vehicle localization.
            confidence_threshold: Minimum confidence for classification reliability alert.
            margin_threshold: Ambiguity margin threshold.
            device: Compute device ('cuda', 'mps', 'cpu', or None for auto).
        """
        self.detection_conf = detection_conf
        self.confidence_threshold = confidence_threshold
        self.margin_threshold = margin_threshold

        # Initialize subsystem modules
        self.detector = VehicleDetector(
            weights=detector_weights,
            conf_threshold=detection_conf,
        )
        self.classical_pipeline = ClassicalPipeline()
        self.classifier_engine = VehicleClassifierEngine(
            weights_path=classifier_weights,
            device=device,
        )

    def analyze(
        self,
        image_input: Union[np.ndarray, Image.Image, str],
        top_k: int = 5,
    ) -> HybridAnalysisResult:
        """
        Executes full hybrid analysis on a given vehicle image.
        
        Args:
            image_input: NumPy RGB array, PIL Image, or image file path.
            top_k: Number of candidate classes to return.
            
        Returns:
            HybridAnalysisResult holding predictions, fusion embeddings, and UI visual panels.
        """
        start_time = time.perf_counter()

        # Step 1: Vehicle Localization via YOLOv8
        detection_res: DetectionResult = self.detector.detect(
            image_input,
            conf_threshold=self.detection_conf,
        )

        roi = detection_res.roi
        primary_box = detection_res.primary_box
        vehicle_detected = detection_res.has_vehicle

        # Step 2: Classical Computer Vision Processing on the localized ROI
        classical_res: ClassicalResult = self.classical_pipeline.process(roi)
        classical_feat = classical_res.features
        classical_metrics = classical_res.metrics
        visualizations = classical_res.visualizations.copy()
        
        # Inject detection visualization
        visualizations["detection"] = detection_res.annotated_image

        # Step 3: Fine-Grained Deep Learning Classification on the ROI
        classification_res: ClassificationResult = self.classifier_engine.predict(
            roi,
            top_k=top_k,
        )
        deep_embedding = classification_res.embedding
        top1 = classification_res.top1
        top5 = classification_res.top5

        # Step 4: Multimodal Feature Fusion (544-dim + 768-dim -> 1312-dim)
        fused_embedding = fuse_features(classical_feat, deep_embedding)

        # Step 5: Confidence Gating & Anomaly Flagging
        top_probs = [p.probability for p in top5]
        confidence_assessment = evaluate_confidence(
            top_probs,
            threshold=self.confidence_threshold,
            margin_threshold=self.margin_threshold,
        )

        total_latency_ms = (time.perf_counter() - start_time) * 1000.0

        status = "Success" if vehicle_detected else "No vehicle localized; analyzed full image."

        return HybridAnalysisResult(
            vehicle_detected=vehicle_detected,
            primary_box=primary_box,
            top1=top1,
            top5=top5,
            confidence_assessment=confidence_assessment,
            fused_embedding=fused_embedding,
            classical_metrics=classical_metrics,
            visualizations=visualizations,
            total_latency_ms=total_latency_ms,
            status=status,
        )
