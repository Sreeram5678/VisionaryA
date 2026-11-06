"""
Streamlit Application Utilities: Model Caching, Interactive Plotting, and Demo Presets.
"""

import os
from typing import Dict, List, Tuple
import cv2
import numpy as np
import plotly.graph_objects as go
import streamlit as st

from src.classification import CarPrediction
from src.hybrid import HybridVehicleRecognizer

SAMPLES_DIR = os.path.join(os.path.dirname(__file__), "samples")


@st.cache_resource(show_spinner="Loading Visionary Hybrid Pipeline...")
def get_hybrid_recognizer(
    conf_threshold: float = 0.25,
    uncertainty_threshold: float = 0.50,
) -> HybridVehicleRecognizer:
    """
    Initializes and caches the singleton HybridVehicleRecognizer instance.
    Uses cached PyTorch and YOLO models in memory for instantaneous inference.
    """
    return HybridVehicleRecognizer(
        detection_conf=conf_threshold,
        confidence_threshold=uncertainty_threshold,
    )


def render_top5_chart(top5_predictions: List[CarPrediction]) -> go.Figure:
    """
    Generates an interactive Plotly horizontal bar chart displaying
    Top-5 class predictions with probabilities.
    
    Args:
        top5_predictions: List of CarPrediction dataclasses.
        
    Returns:
        Plotly Figure object configured with dark styling.
    """
    # Reverse so highest probability is at the top of the horizontal bar chart
    preds = list(reversed(top5_predictions))
    labels = [f"<b>{p.make}</b> {p.model} ({p.year})" for p in preds]
    probs = [p.probability * 100.0 for p in preds]
    percentages = [f"{p.probability * 100.0:.1f}%" for p in preds]

    # Gradient colors highlighting Top-1 in vibrant lime green
    colors = [
        "rgba(34, 197, 94, 0.9)" if i == len(preds) - 1 else "rgba(56, 189, 248, 0.75)"
        for i in range(len(preds))
    ]

    fig = go.Figure(
        go.Bar(
            x=probs,
            y=labels,
            orientation="h",
            text=percentages,
            textposition="inside",
            insidetextanchor="end",
            marker=dict(color=colors, line=dict(color="rgba(255, 255, 255, 0.2)", width=1)),
        )
    )

    fig.update_layout(
        margin=dict(l=10, r=20, t=10, b=10),
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
        font=dict(color="#f1f5f9", family="sans-serif", size=13),
        xaxis=dict(
            title="Probability (%)",
            range=[0, max(100.0, max(probs) * 1.15)],
            gridcolor="rgba(255, 255, 255, 0.1)",
            zeroline=False,
        ),
        yaxis=dict(
            showgrid=False,
            zeroline=False,
        ),
        height=260,
    )

    return fig


def ensure_demo_samples() -> Dict[str, str]:
    """
    Returns real high-resolution vehicle demo images in app/samples/ for one-click testing.
    
    Returns:
        Dictionary mapping preset label to absolute file path.
    """
    os.makedirs(SAMPLES_DIR, exist_ok=True)

    samples = {
        "Audi R8 Supercar (Real Photo)": os.path.join(SAMPLES_DIR, "real_audi_r8.jpg"),
        "BMW M3 Sports Coupe (Real Photo)": os.path.join(SAMPLES_DIR, "real_bmw_coupe.jpg"),
        "Off-Road 4x4 SUV (Real Photo)": os.path.join(SAMPLES_DIR, "real_land_rover_suv.jpg"),
        "Night Driving Adverse Light (Real Photo)": os.path.join(SAMPLES_DIR, "real_night_drive.jpg"),
        "Scenic Mountain Road (Non-Car Negative)": os.path.join(SAMPLES_DIR, "real_scenic_landscape.jpg"),
    }

    return samples

    if not os.path.exists(samples["Non-Car Scene (Zero-Crash Test)"]):
        # Mountain / Tree landscape with no vehicle
        img = np.zeros((320, 480, 3), dtype=np.uint8)
        # Sky gradient
        for y in range(200):
            img[y, :] = [int(135 + y * 0.4), int(206 - y * 0.3), int(250 - y * 0.2)]
        # Green mountain hills
        pts1 = np.array([[0, 200], [180, 120], [340, 220], [480, 160], [480, 320], [0, 320]], np.int32)
        cv2.fillPoly(img, [pts1], (34, 139, 34))
        pts2 = np.array([[0, 240], [240, 180], [480, 250], [480, 320], [0, 320]], np.int32)
        cv2.fillPoly(img, [pts2], (46, 120, 50))
        cv2.imwrite(samples["Non-Car Scene (Zero-Crash Test)"], cv2.cvtColor(img, cv2.COLOR_RGB2BGR))

    return samples
