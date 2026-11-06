"""
Unit tests for the Hybrid Decision Fusion Subsystem.
Tests multimodal feature fusion, confidence gating, comparative benchmarks,
and the end-to-end HybridVehicleRecognizer pipeline.
"""

import numpy as np
import pytest
from PIL import Image

from src.hybrid import (
    BENCHMARK_SUITE,
    ConfidenceAssessment,
    HybridAnalysisResult,
    HybridVehicleRecognizer,
    evaluate_confidence,
    fuse_features,
    get_benchmark_by_name,
    get_comparative_benchmarks,
)


# ---------------------------------------------------------------------------
# Multimodal Feature Fusion Tests
# ---------------------------------------------------------------------------

def test_fuse_features_1d():
    # Classical: 544-dim, Deep: 768-dim
    classical = np.random.randn(544).astype(np.float32)
    deep = np.random.randn(768).astype(np.float32)

    fused = fuse_features(classical, deep)

    assert fused.shape == (1312,)
    assert fused.dtype == np.float32

    # Verify both partitions are individually normalized
    norm_c = np.linalg.norm(fused[:544])
    norm_d = np.linalg.norm(fused[544:])

    assert pytest.approx(norm_c, abs=1e-5) == 1.0
    assert pytest.approx(norm_d, abs=1e-5) == 1.0


def test_fuse_features_batch():
    classical_batch = np.random.randn(4, 544).astype(np.float32)
    deep_batch = np.random.randn(4, 768).astype(np.float32)

    fused = fuse_features(classical_batch, deep_batch)

    assert fused.shape == (4, 1312)
    assert fused.dtype == np.float32


def test_fuse_features_invalid():
    with pytest.raises(ValueError):
        fuse_features(None, np.zeros(768))


# ---------------------------------------------------------------------------
# Confidence Gate & Anomaly Detection Tests
# ---------------------------------------------------------------------------

def test_evaluate_confidence_confident():
    probs = [0.85, 0.05, 0.04, 0.03, 0.03]
    assessment = evaluate_confidence(probs, threshold=0.50, margin_threshold=0.05)

    assert assessment.is_reliable is True
    assert assessment.status == "CONFIDENT"
    assert assessment.warning_message is None
    assert assessment.top1_confidence == 0.85
    assert pytest.approx(assessment.margin_to_second, abs=1e-5) == 0.80


def test_evaluate_confidence_low_confidence():
    probs = [0.38, 0.25, 0.20, 0.10, 0.07]
    assessment = evaluate_confidence(probs, threshold=0.50, margin_threshold=0.05)

    assert assessment.is_reliable is False
    assert assessment.status == "LOW_CONFIDENCE"
    assert "Low prediction confidence" in assessment.warning_message
    assert assessment.top1_confidence == 0.38


def test_evaluate_confidence_ambiguous():
    # Top-1 is above 0.50, but Top-2 is very close (margin < 0.05)
    probs = [0.52, 0.49, 0.01]
    assessment = evaluate_confidence(probs, threshold=0.50, margin_threshold=0.05)

    assert assessment.is_reliable is False
    assert assessment.status == "AMBIGUOUS"
    assert "Ambiguous prediction" in assessment.warning_message
    assert pytest.approx(assessment.margin_to_second, abs=1e-5) == 0.03


def test_evaluate_confidence_empty():
    assessment = evaluate_confidence([])
    assert assessment.is_reliable is False
    assert assessment.status == "LOW_CONFIDENCE"


# ---------------------------------------------------------------------------
# Comparative Benchmarking Tests
# ---------------------------------------------------------------------------

def test_comparative_benchmarks_matrix():
    benchmarks = get_comparative_benchmarks()
    assert len(benchmarks) == 4

    names = [b["name"] for b in benchmarks]
    assert "Classical CV Baseline" in names
    assert "Deep Learning Alone" in names
    assert "Hybrid Fusion (Visionary)" in names
    assert "Quantized Mobile Hybrid" in names

    # Hybrid should outperform DL alone in accuracy and robustness
    hybrid = get_benchmark_by_name("Hybrid Fusion")
    dl = get_benchmark_by_name("Deep Learning")
    assert hybrid.top1_accuracy > dl.top1_accuracy
    assert hybrid.robustness_score > dl.robustness_score


# ---------------------------------------------------------------------------
# Master Recognizer End-to-End Tests
# ---------------------------------------------------------------------------

def test_hybrid_vehicle_recognizer_end_to_end():
    # Use CPU for deterministic unit test
    recognizer = HybridVehicleRecognizer(device="cpu")

    # Synthetic 250x300 image
    image = np.full((250, 300, 3), 100, dtype=np.uint8)
    image[70:180, 40:260] = [220, 20, 20]  # Red vehicle body block

    result = recognizer.analyze(image, top_k=5)

    assert isinstance(result, HybridAnalysisResult)
    assert result.top1 is not None
    assert len(result.top5) == 5
    assert result.fused_embedding.shape == (1312,)
    assert isinstance(result.confidence_assessment, ConfidenceAssessment)
    assert result.total_latency_ms > 0

    # Verify visual frames
    expected_frames = ["raw", "detection", "clahe", "denoised", "edges", "contours"]
    for frame in expected_frames:
        assert frame in result.visualizations
        assert isinstance(result.visualizations[frame], np.ndarray)

    # Dictionary serialization
    res_dict = result.to_dict()
    assert res_dict["fused_embedding_dim"] == 1312
    assert "status" in res_dict
    assert "available_visualizations" in res_dict
