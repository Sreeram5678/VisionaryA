"""
Unit tests for the Model Optimization Subsystem.
Tests dynamic INT8 quantization, size estimation, ONNX export and runtime inference,
latency benchmarking, and optimization comparison.
"""

import os
import numpy as np
import pytest
import torch
import torch.nn as nn

from src.classification import VehicleClassifier
from src.optimization import (
    LatencyStats,
    ONNXVehicleClassifier,
    benchmark_latency,
    compare_optimizations,
    export_to_onnx,
    get_model_size_mb,
    quantize_model_dynamic,
    save_quantized_model,
)


class SimpleCarModel(nn.Module):
    """Lightweight test neural network for rapid deterministic testing."""
    def __init__(self):
        super().__init__()
        self.conv = nn.Conv2d(3, 16, kernel_size=3, padding=1)
        self.pool = nn.AdaptiveAvgPool2d((1, 1))
        self.fc1 = nn.Linear(16, 64)
        self.fc2 = nn.Linear(64, 196)

    def forward(self, x, return_embedding=False):
        feat = torch.relu(self.fc1(self.pool(torch.relu(self.conv(x))).flatten(1)))
        logits = self.fc2(feat)
        if return_embedding:
            return logits, feat
        return logits


# ---------------------------------------------------------------------------
# Quantization Tests
# ---------------------------------------------------------------------------

def test_dynamic_quantization_linear():
    model = SimpleCarModel()
    model.eval()

    quantized = quantize_model_dynamic(model)
    assert quantized is not None

    x = torch.randn(2, 3, 32, 32)
    with torch.no_grad():
        out_fp32 = model(x)
        out_quant = quantized(x)

    assert out_quant.shape == (2, 196)
    assert out_quant.shape == out_fp32.shape


def test_get_model_size_mb():
    model = SimpleCarModel()
    size_mb = get_model_size_mb(model)
    assert size_mb > 0.0
    assert isinstance(size_mb, float)


def test_save_quantized_model(tmp_path):
    model = SimpleCarModel()
    quantized = quantize_model_dynamic(model)
    save_file = str(tmp_path / "test_quantized.pt")

    size_mb = save_quantized_model(quantized, save_file)
    assert os.path.exists(save_file)
    assert size_mb > 0.0


# ---------------------------------------------------------------------------
# ONNX Export and Runtime Tests
# ---------------------------------------------------------------------------

def test_onnx_export_and_inference(tmp_path):
    model = SimpleCarModel()
    model.eval()

    onnx_file = str(tmp_path / "test_model.onnx")
    exported_path = export_to_onnx(model, onnx_file, img_size=32, opset_version=14)

    assert os.path.exists(exported_path)

    # Initialize ONNX Runtime engine
    engine = ONNXVehicleClassifier(exported_path, num_threads=2)

    dummy_input = np.random.randn(1, 3, 32, 32).astype(np.float32)
    logits, embedding = engine.run(dummy_input)

    assert logits.shape == (1, 196)
    assert embedding.shape == (1, 64)


# ---------------------------------------------------------------------------
# Benchmarking Tests
# ---------------------------------------------------------------------------

def test_benchmark_latency():
    # Simple simulated function
    def dummy_func():
        return np.sum(np.ones((100, 100)))

    stats = benchmark_latency(dummy_func, num_warmup=2, num_runs=10)
    assert isinstance(stats, LatencyStats)
    assert stats.mean_ms >= 0.0
    assert stats.fps > 0.0
    assert stats.min_ms <= stats.mean_ms <= stats.max_ms


def test_compare_optimizations():
    model = SimpleCarModel()
    quantized = quantize_model_dynamic(model)
    dummy_input = torch.randn(1, 3, 32, 32)

    summary = compare_optimizations(model, quantized, input_tensor=dummy_input, num_runs=5)

    assert "fp32_size_mb" in summary
    assert "quantized_size_mb" in summary
    assert "compression_ratio" in summary
    assert "speedup_factor" in summary
    assert "output_cosine_similarity" in summary
    assert summary["output_cosine_similarity"] > 0.85
