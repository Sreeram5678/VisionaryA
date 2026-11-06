"""
Model Optimization: Dynamic INT8 Quantization.

Applies post-training dynamic quantization to convert FP32 linear projections
to INT8 precision (torch.qint8), reducing memory footprint by ~60-75% with
negligible impact on classification accuracy.
"""

import io
import os
from typing import Dict, Tuple, Union
import torch
import torch.nn as nn


def _ensure_qengine():
    """Configures the appropriate quantization backend engine for the current hardware."""
    supported = torch.backends.quantized.supported_engines
    if "qnnpack" in supported and (torch.backends.quantized.engine == "none" or torch.backends.quantized.engine != "qnnpack"):
        torch.backends.quantized.engine = "qnnpack"
    elif "fbgemm" in supported and torch.backends.quantized.engine == "none":
        torch.backends.quantized.engine = "fbgemm"


# Auto-configure engine upon import
_ensure_qengine()


def quantize_model_dynamic(
    model: nn.Module,
    dtype: torch.dtype = torch.qint8,
) -> nn.Module:
    """
    Applies PyTorch dynamic post-training quantization to linear layers in the model.
    
    Args:
        model: PyTorch model (e.g. VehicleClassifier).
        dtype: Target quantized integer data type (default torch.qint8).
        
    Returns:
        Quantized PyTorch model with INT8 linear layers.
    """
    if model is None:
        raise ValueError("Model cannot be None.")

    _ensure_qengine()
    model.eval()

    # Apply dynamic quantization to Linear projection layers
    try:
        quantized_model = torch.ao.quantization.quantize_dynamic(
            model,
            qconfig_spec={nn.Linear},
            dtype=dtype,
        )
    except AttributeError:
        # Fallback for older PyTorch versions
        quantized_model = torch.quantization.quantize_dynamic(
            model,
            qconfig_spec={nn.Linear},
            dtype=dtype,
        )

    return quantized_model


def get_model_size_mb(model: nn.Module) -> float:
    """
    Measures the serialized storage size of a model in megabytes (MB).
    Works accurately for standard float models as well as dynamically quantized models.
    
    Args:
        model: PyTorch model instance.
        
    Returns:
        Size in megabytes (MB).
    """
    buffer = io.BytesIO()
    torch.save(model.state_dict(), buffer)
    size_mb = buffer.tell() / (1024.0 * 1024.0)
    return float(round(size_mb, 2))


def save_quantized_model(
    model: nn.Module,
    save_path: str,
) -> float:
    """
    Saves the quantized model state dictionary to disk.
    
    Args:
        model: Quantized PyTorch model.
        save_path: Target disk file path.
        
    Returns:
        Saved file size in megabytes (MB).
    """
    os.makedirs(os.path.dirname(os.path.abspath(save_path)), exist_ok=True)
    torch.save(model.state_dict(), save_path)
    size_mb = os.path.getsize(save_path) / (1024.0 * 1024.0)
    return float(round(size_mb, 2))
