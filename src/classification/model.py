"""
Fine-Grained Vehicle Classification: Deep Learning Model Architecture.

Implements ConvNeXt-Tiny and EfficientNet backbones with penultimate
feature extraction tap for hybrid decision fusion.
"""

from typing import Optional, Tuple, Union
import torch
import torch.nn as nn
import timm


class VehicleClassifier(nn.Module):
    """
    Fine-grained deep learning vehicle classifier with dual-output capability:
    - 196-class classification logits
    - Penultimate feature embedding tap for hybrid classical-DL fusion
    """

    def __init__(
        self,
        backbone_name: str = "resnet50",
        num_classes: int = 196,
        pretrained: bool = True,
        dropout_rate: float = 0.2,
    ):
        """
        Initializes the VehicleClassifier.
        
        Args:
            backbone_name: Architecture name from timm ('resnet50', 'convnext_tiny', 'efficientnet_b3').
            num_classes: Number of target categories (Stanford Cars: 196).
            pretrained: Whether to load ImageNet pretrained backbone weights.
            dropout_rate: Dropout probability before the final classification head.
        """
        super().__init__()
        self.backbone_name = backbone_name
        self.num_classes = num_classes

        # Create full model with num_classes
        self.model = timm.create_model(
            backbone_name,
            pretrained=pretrained,
            num_classes=num_classes,
            drop_rate=dropout_rate,
        )

        self.embedding_dim = self.model.num_features

    def forward(
        self,
        x: torch.Tensor,
        return_embedding: bool = False,
    ) -> Union[torch.Tensor, Tuple[torch.Tensor, torch.Tensor]]:
        """
        Forward pass through model and penultimate feature extractor.
        """
        logits = self.model(x)

        if return_embedding:
            # Extract pooled penultimate feature representation
            feat = self.model.forward_features(x)
            if hasattr(self.model, "forward_head"):
                embedding = self.model.forward_head(feat, pre_logits=True)
            elif hasattr(self.model, "global_pool"):
                embedding = self.model.global_pool(feat).flatten(1)
            else:
                embedding = feat.flatten(1)
            return logits, embedding

        return logits

    def load_weights(self, weights_path: str, device: Union[str, torch.device] = "cpu") -> bool:
        """
        Loads fine-tuned model checkpoint from disk.
        """
        try:
            checkpoint = torch.load(weights_path, map_location=device)
            if isinstance(checkpoint, dict):
                if "state_dict" in checkpoint:
                    state_dict = checkpoint["state_dict"]
                elif "model" in checkpoint:
                    state_dict = checkpoint["model"]
                else:
                    state_dict = checkpoint
            else:
                state_dict = checkpoint

            # Strip 'module.' or 'model.' prefixes
            cleaned = {}
            for k, v in state_dict.items():
                k_clean = k
                if k_clean.startswith("module."):
                    k_clean = k_clean[7:]
                cleaned[k_clean] = v

            # Load into self.model or self
            try:
                self.model.load_state_dict(cleaned, strict=True)
            except Exception:
                self.load_state_dict(cleaned, strict=False)

            self.eval()
            return True
        except Exception as e:
            print(f"Warning: Could not load weights from {weights_path}: {e}")
            return False
