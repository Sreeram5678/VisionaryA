"""
Model Optimization: ONNX Export and Inference Engine.

Exports PyTorch fine-grained classifier graph to ONNX and executes
high-throughput multithreaded inference via ONNX Runtime.
"""

import os
from typing import Optional, Sequence, Tuple, Union
import numpy as np
import torch
import torch.nn as nn


class _ONNXExportWrapper(nn.Module):
    """Wrapper ensuring consistent dual output (logits, embedding) during ONNX tracing."""
    def __init__(self, base_model: nn.Module):
        super().__init__()
        self.base_model = base_model

    def forward(self, x: torch.Tensor) -> Tuple[torch.Tensor, torch.Tensor]:
        return self.base_model(x, return_embedding=True)


def export_to_onnx(
    model: nn.Module,
    output_path: str,
    img_size: int = 224,
    opset_version: int = 14,
) -> str:
    """
    Exports a PyTorch VehicleClassifier model to an optimized ONNX graph.
    
    Args:
        model: VehicleClassifier PyTorch model.
        output_path: Target disk path for the .onnx file.
        img_size: Image input resolution (default 224).
        opset_version: ONNX operator set version (default 14).
        
    Returns:
        Absolute path to the exported ONNX file.
    """
    model.eval()
    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)

    wrapper = _ONNXExportWrapper(model)
    wrapper.eval()
    dummy_input = torch.randn(1, 3, img_size, img_size, dtype=torch.float32)

    torch.onnx.export(
        wrapper,
        dummy_input,
        output_path,
        export_params=True,
        opset_version=opset_version,
        do_constant_folding=True,
        input_names=["input"],
        output_names=["logits", "embedding"],
        dynamic_axes={
            "input": {0: "batch_size"},
            "logits": {0: "batch_size"},
            "embedding": {0: "batch_size"},
        },
    )

    return os.path.abspath(output_path)


class ONNXVehicleClassifier:
    """
    High-performance inference runner utilizing ONNX Runtime with CPU multithreading.
    """

    def __init__(
        self,
        onnx_path: str,
        num_threads: int = 4,
    ):
        """
        Initializes the ONNX runtime inference session.
        
        Args:
            onnx_path: Path to the exported .onnx model.
            num_threads: Number of CPU threads for intra-operator parallelism.
        """
        import onnxruntime as ort

        if not os.path.exists(onnx_path):
            raise FileNotFoundError(f"ONNX model file not found at: {onnx_path}")

        self.onnx_path = onnx_path
        sess_options = ort.SessionOptions()
        sess_options.intra_op_num_threads = num_threads
        sess_options.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_ALL

        self.session = ort.InferenceSession(
            onnx_path,
            sess_options=sess_options,
            providers=["CPUExecutionProvider"],
        )

        self.input_name = self.session.get_inputs()[0].name
        self.output_names = [o.name for o in self.session.get_outputs()]

    def run(
        self,
        input_array: Union[np.ndarray, torch.Tensor],
    ) -> Tuple[np.ndarray, np.ndarray]:
        """
        Executes ONNX Runtime inference on preprocessed image tensors.
        
        Args:
            input_array: NumPy array or PyTorch Tensor of shape (B, 3, H, W).
            
        Returns:
            Tuple of:
              - logits: NumPy array of shape (B, 196)
              - embedding: NumPy array of shape (B, embedding_dim)
        """
        if isinstance(input_array, torch.Tensor):
            input_np = input_array.detach().cpu().numpy()
        else:
            input_np = np.asarray(input_array, dtype=np.float32)

        if input_np.ndim == 3:
            # Add batch dimension if missing
            input_np = np.expand_dims(input_np, axis=0)

        outputs = self.session.run(
            self.output_names,
            {self.input_name: input_np},
        )

        logits = outputs[0]
        embedding = outputs[1] if len(outputs) > 1 else np.zeros((input_np.shape[0], 0), dtype=np.float32)

        return logits, embedding
