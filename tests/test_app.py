"""
Unit and smoke tests for the Streamlit Application module.
Verifies demo samples creation, Plotly chart generation, and app module imports.
"""

import os
import pytest
from PIL import Image

from app.utils import ensure_demo_samples, render_top5_chart
from src.classification import CarPrediction


def test_ensure_demo_samples():
    samples = ensure_demo_samples()
    assert len(samples) >= 4
    for name, path in samples.items():
        assert os.path.exists(path)
        img = Image.open(path)
        assert img.size[0] > 0
        assert img.size[1] > 0


def test_render_top5_chart():
    predictions = [
        CarPrediction(
            class_id=14,
            class_name="Audi R8 Coupe 2012",
            make="Audi",
            model="R8 Coupe",
            year=2012,
            body_style="Coupe",
            probability=0.78,
        ),
        CarPrediction(
            class_id=8,
            class_name="Aston Martin V8 Vantage Coupe 2012",
            make="Aston Martin",
            model="V8 Vantage",
            year=2012,
            body_style="Coupe",
            probability=0.12,
        ),
    ]

    fig = render_top5_chart(predictions)
    assert fig is not None
    assert len(fig.data) == 1
    # Check y-axis labels contain the car makes
    assert "Audi" in fig.data[0].y[-1]
