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
    Ensures sample demo images exist in app/samples/ for one-click testing.
    
    Returns:
        Dictionary mapping preset label to absolute file path.
    """
    os.makedirs(SAMPLES_DIR, exist_ok=True)

    samples = {
        "Sport Coupe (High Contrast)": os.path.join(SAMPLES_DIR, "demo_coupe.png"),
        "SUV (Standard Day)": os.path.join(SAMPLES_DIR, "demo_suv.png"),
        "Low-Light Night Car (CLAHE Demo)": os.path.join(SAMPLES_DIR, "demo_night.png"),
        "Non-Car Scene (Zero-Crash Test)": os.path.join(SAMPLES_DIR, "demo_landscape.png"),
    }

    # Generate synthetic demo presets if not present
    if not os.path.exists(samples["Sport Coupe (High Contrast)"]):
        # Red Sport Coupe simulation
        img = np.full((320, 480, 3), 180, dtype=np.uint8)
        # Road asphalt
        img[220:, :] = [60, 60, 65]
        # Car body (Red)
        cv2.rectangle(img, (90, 140), (410, 230), (220, 25, 25), -1)
        # Cabin / Roof
        pts = np.array([[160, 140], [210, 90], [330, 90], [370, 140]], np.int32)
        cv2.fillPoly(img, [pts], (40, 40, 50))
        # Wheels
        cv2.circle(img, (160, 230), 32, (20, 20, 20), -1)
        cv2.circle(img, (340, 230), 32, (20, 20, 20), -1)
        cv2.circle(img, (160, 230), 16, (180, 180, 180), -1)
        cv2.circle(img, (340, 230), 16, (180, 180, 180), -1)
        # Headlight & Taillight
        cv2.rectangle(img, (400, 160), (410, 180), (240, 240, 255), -1)
        cv2.rectangle(img, (90, 160), (98, 180), (180, 0, 0), -1)
        cv2.imwrite(samples["Sport Coupe (High Contrast)"], cv2.cvtColor(img, cv2.COLOR_RGB2BGR))

    if not os.path.exists(samples["SUV (Standard Day)"]):
        # Blue SUV simulation
        img = np.full((320, 480, 3), 210, dtype=np.uint8)
        img[230:, :] = [70, 70, 75]
        # SUV Boxy body (Navy Blue)
        cv2.rectangle(img, (70, 110), (420, 240), (30, 80, 190), -1)
        # Roof & Windows
        cv2.rectangle(img, (120, 70), (370, 130), (50, 55, 65), -1)
        # Wheels
        cv2.circle(img, (150, 240), 38, (25, 25, 25), -1)
        cv2.circle(img, (340, 240), 38, (25, 25, 25), -1)
        cv2.circle(img, (150, 240), 18, (190, 190, 190), -1)
        cv2.circle(img, (340, 240), 18, (190, 190, 190), -1)
        cv2.imwrite(samples["SUV (Standard Day)"], cv2.cvtColor(img, cv2.COLOR_RGB2BGR))

    if not os.path.exists(samples["Low-Light Night Car (CLAHE Demo)"]):
        # Severely underexposed / dark night image
        img = np.full((320, 480, 3), 20, dtype=np.uint8)
        # Faint car body
        cv2.rectangle(img, (90, 140), (410, 230), (45, 10, 10), -1)
        cv2.circle(img, (160, 230), 32, (10, 10, 10), -1)
        cv2.circle(img, (340, 230), 32, (10, 10, 10), -1)
        # Street lamp glare in corner
        cv2.circle(img, (40, 40), 30, (255, 255, 200), -1)
        cv2.imwrite(samples["Low-Light Night Car (CLAHE Demo)"], cv2.cvtColor(img, cv2.COLOR_RGB2BGR))

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
