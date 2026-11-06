"""
Model Optimization Subsystem for Visionary.

Provides dynamic INT8 quantization, ONNX graph export, ONNX Runtime inference,
and quantified latency and model footprint benchmarking.
"""

from src.optimization.benchmark import (
    LatencyStats,
    benchmark_latency,
    compare_optimizations,
)
from src.optimization.onnx_engine import (
    ONNXVehicleClassifier,
    export_to_onnx,
)
from src.optimization.quantization import (
    get_model_size_mb,
    quantize_model_dynamic,
    save_quantized_model,
)

__all__ = [
    "quantize_model_dynamic",
    "get_model_size_mb",
    "save_quantized_model",
    "export_to_onnx",
    "ONNXVehicleClassifier",
    "LatencyStats",
    "benchmark_latency",
    "compare_optimizations",
]
