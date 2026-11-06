"""
Model Optimization: Performance and Latency Benchmarking.

Profiles inference latency (mean, median, p95, FPS), measures memory footprint
reductions, and validates output fidelity across FP32, INT8, and ONNX engines.
"""

from dataclasses import dataclass
import time
from typing import Any, Callable, Dict, Optional, Union
import numpy as np
import torch
import torch.nn as nn

from src.optimization.quantization import get_model_size_mb


@dataclass
class LatencyStats:
    """Detailed latency profiling statistics."""
    mean_ms: float
    median_ms: float
    p95_ms: float
    min_ms: float
    max_ms: float
    fps: float

    def to_dict(self) -> Dict[str, Any]:
        return {
            "mean_ms": round(self.mean_ms, 2),
            "median_ms": round(self.median_ms, 2),
            "p95_ms": round(self.p95_ms, 2),
            "min_ms": round(self.min_ms, 2),
            "max_ms": round(self.max_ms, 2),
            "fps": round(self.fps, 1),
        }


def benchmark_latency(
    runner: Callable[[], Any],
    num_warmup: int = 5,
    num_runs: int = 20,
) -> LatencyStats:
    """
    Measures execution latency over multiple warmups and evaluation runs.
    
    Args:
        runner: Zero-argument callable executing one inference pass.
        num_warmup: Number of untimed warmup iterations.
        num_runs: Number of timed evaluation iterations.
        
    Returns:
        LatencyStats with timing distribution and throughput (FPS).
    """
    # Warmup runs
    for _ in range(num_warmup):
        _ = runner()

    times: list[float] = []
    for _ in range(num_runs):
        t0 = time.perf_counter()
        _ = runner()
        t1 = time.perf_counter()
        times.append((t1 - t0) * 1000.0)

    times_arr = np.array(times)
    mean_ms = float(np.mean(times_arr))
    median_ms = float(np.median(times_arr))
    p95_ms = float(np.percentile(times_arr, 95))
    min_ms = float(np.min(times_arr))
    max_ms = float(np.max(times_arr))
    fps = (1000.0 / mean_ms) if mean_ms > 0 else 0.0

    return LatencyStats(
        mean_ms=mean_ms,
        median_ms=median_ms,
        p95_ms=p95_ms,
        min_ms=min_ms,
        max_ms=max_ms,
        fps=fps,
    )


def compare_optimizations(
    fp32_model: nn.Module,
    quantized_model: nn.Module,
    input_tensor: Optional[torch.Tensor] = None,
    num_runs: int = 15,
) -> Dict[str, Any]:
    """
    Compares baseline FP32 model against quantized INT8 model across
    model storage footprint, inference latency, throughput, and output fidelity.
    
    Args:
        fp32_model: Baseline full-precision PyTorch model.
        quantized_model: Dynamic INT8 quantized model.
        input_tensor: Test input tensor of shape (1, 3, 224, 224).
        num_runs: Number of timing benchmark runs.
        
    Returns:
        Dictionary containing comparative speedup and compression metrics.
    """
    if input_tensor is None:
        input_tensor = torch.randn(1, 3, 224, 224, dtype=torch.float32)

    fp32_model.eval()
    quantized_model.eval()

    # 1. Size comparison
    fp32_size_mb = get_model_size_mb(fp32_model)
    quant_size_mb = get_model_size_mb(quantized_model)
    compression_ratio = fp32_size_mb / max(0.01, quant_size_mb)
    size_reduction_pct = ((fp32_size_mb - quant_size_mb) / max(0.01, fp32_size_mb)) * 100.0

    # 2. Latency comparison
    with torch.no_grad():
        fp32_stats = benchmark_latency(
            lambda: fp32_model(input_tensor),
            num_warmup=3,
            num_runs=num_runs,
        )
        quant_stats = benchmark_latency(
            lambda: quantized_model(input_tensor),
            num_warmup=3,
            num_runs=num_runs,
        )

        # 3. Output fidelity (Cosine similarity of predicted logits)
        out_fp32 = fp32_model(input_tensor)
        out_quant = quantized_model(input_tensor)
        
        logits_fp32 = out_fp32[0] if isinstance(out_fp32, tuple) else out_fp32
        logits_quant = out_quant[0] if isinstance(out_quant, tuple) else out_quant

        v1 = logits_fp32.flatten()
        v2 = logits_quant.flatten()
        cosine_sim = torch.cosine_similarity(v1, v2, dim=0).item()

    speedup = fp32_stats.mean_ms / max(0.01, quant_stats.mean_ms)

    return {
        "fp32_size_mb": fp32_size_mb,
        "quantized_size_mb": quant_size_mb,
        "compression_ratio": round(compression_ratio, 2),
        "size_reduction_percent": round(size_reduction_pct, 1),
        "fp32_latency": fp32_stats.to_dict(),
        "quantized_latency": quant_stats.to_dict(),
        "speedup_factor": round(speedup, 2),
        "output_cosine_similarity": round(cosine_sim, 4),
    }
