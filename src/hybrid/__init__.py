"""
Hybrid Decision Fusion Subsystem for Visionary.

Provides multimodal feature fusion, uncertainty threshold gating,
comparative ablation benchmarks, and the master HybridVehicleRecognizer.
"""

from src.hybrid.benchmark import (
    BENCHMARK_SUITE,
    ModelBenchmark,
    get_benchmark_by_name,
    get_comparative_benchmarks,
)
from src.hybrid.fusion import fuse_features
from src.hybrid.gate import (
    ConfidenceAssessment,
    evaluate_confidence,
)
from src.hybrid.pipeline import (
    HybridAnalysisResult,
    HybridVehicleRecognizer,
)

__all__ = [
    "fuse_features",
    "evaluate_confidence",
    "ConfidenceAssessment",
    "ModelBenchmark",
    "BENCHMARK_SUITE",
    "get_comparative_benchmarks",
    "get_benchmark_by_name",
    "HybridAnalysisResult",
    "HybridVehicleRecognizer",
]
