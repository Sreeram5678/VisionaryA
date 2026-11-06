"""
Unit and integration tests for FastAPI backend API endpoints.
"""

import io
import numpy as np
import pytest
from PIL import Image
from fastapi.testclient import TestClient

from backend.main import app

client = TestClient(app)


def test_health_check_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["problem_statement"] == "P5"
    assert data["team_id"] == "T20"


def test_samples_endpoint():
    response = client.get("/api/samples")
    assert response.status_code == 200
    data = response.json()
    assert "samples" in data
    assert len(data["samples"]) > 0


def test_sample_image_serving():
    response = client.get("/api/samples/real_audi_r8.jpg")
    assert response.status_code == 200
    assert response.headers["content-type"].startswith("image/")
    assert len(response.content) > 1000


def test_benchmarks_endpoint():
    response = client.get("/api/benchmarks")
    assert response.status_code == 200
    data = response.json()
    assert "benchmarks" in data
    assert len(data["benchmarks"]) == 4


def test_failure_cases_endpoint():
    response = client.get("/api/failure-cases")
    assert response.status_code == 200
    data = response.json()
    assert "failure_cases" in data
    assert len(data["failure_cases"]) == 3
    cases = data["failure_cases"]
    assert cases[0]["id"] == "facelift_similarity"
    assert cases[1]["id"] == "specular_glare"
    assert cases[2]["id"] == "severe_occlusion"


def test_analyze_with_preset_endpoint():
    response = client.post("/api/analyze", data={"preset_id": "real_audi_r8"})
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "top1" in data
    assert "top5" in data
    assert len(data["top5"]) == 5
    assert "confidence_assessment" in data
    assert "visualizations" in data
    assert "detection" in data["visualizations"]
    assert "clahe" in data["visualizations"]
    assert "edges" in data["visualizations"]
    assert "contours" in data["visualizations"]
    assert "roi" in data["visualizations"]
    assert data["visualizations"]["detection"].startswith("data:image/jpeg;base64,")


def test_analyze_with_uploaded_file():
    # Create simple synthetic test image
    img = Image.new("RGB", (200, 200), color=(100, 150, 200))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    buf.seek(0)

    files = {"file": ("test.jpg", buf, "image/jpeg")}
    response = client.post("/api/analyze", files=files)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "latency" in data


def test_root_serves_react_frontend():
    response = client.get("/")
    assert response.status_code == 200
    assert "Visionary" in response.text
    assert "id=\"root\"" in response.text


