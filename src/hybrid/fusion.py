"""
Hybrid Decision Fusion: Multimodal Feature Concatenation.

Combines classical computer vision representations (HSV color histograms,
LBP texture, geometric descriptors: 544 dimensions) with deep learning penultimate
embeddings (ConvNeXt-Tiny: 768 dimensions) into a joint 1312-dimensional vector.
"""

from typing import Union
import numpy as np


def fuse_features(
    classical_feat: np.ndarray,
    deep_embedding: np.ndarray,
) -> np.ndarray:
    """
    Fuses normalized classical visual descriptors with deep feature embeddings.
    
    Both vectors are individually L2-normalized prior to concatenation to balance
    the influence of color/texture geometric priors against deep semantic representations.
    
    Dimension breakdown:
      - Classical features: 512 (Color HSV) + 26 (Texture LBP) + 6 (Geometry) = 544
      - Deep features: 768 (ConvNeXt-Tiny penultimate tap)
      - Fused dimension: 544 + 768 = 1312
      
    Args:
        classical_feat: 1D or 2D NumPy array of shape (544,) or (B, 544).
        deep_embedding: 1D or 2D NumPy array of shape (768,) or (B, 768).
        
    Returns:
        Fused NumPy array of shape (1312,) or (B, 1312) with dtype float32.
    """
    if classical_feat is None or deep_embedding is None:
        raise ValueError("Feature vectors cannot be None.")

    c_feat = np.asarray(classical_feat, dtype=np.float32)
    d_feat = np.asarray(deep_embedding, dtype=np.float32)

    # Normalize classical feature vector
    c_norm = np.linalg.norm(c_feat, axis=-1, keepdims=True)
    c_normalized = c_feat / np.maximum(c_norm, 1e-7)

    # Normalize deep feature embedding
    d_norm = np.linalg.norm(d_feat, axis=-1, keepdims=True)
    d_normalized = d_feat / np.maximum(d_norm, 1e-7)

    # Concatenate along the feature dimension
    fused = np.concatenate([c_normalized, d_normalized], axis=-1)

    return fused.astype(np.float32)
