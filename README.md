# Visionary — Intelligent Fine-Grained Vehicle Recognition System (P5)

[![Python 3.11](https://img.shields.io/badge/Python-3.11-blue.svg)](https://www.python.org/)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.2+-ee4c2c.svg)](https://pytorch.org/)
[![OpenCV](https://img.shields.io/badge/OpenCV-4.9+-green.svg)](https://opencv.org/)
[![YOLOv8](https://img.shields.io/badge/YOLO-v8-00ffff.svg)](https://github.com/ultralytics/ultralytics)
[![Streamlit](https://img.shields.io/badge/Streamlit-App-ff4b4b.svg)](https://streamlit.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> **College Hackathon Project — Problem Statement 5 (ProbID - P5)**  
> **Team ID**: `T20`  
> **Live Demo URL**: *[Deploying to Streamlit Cloud / HuggingFace Spaces]*

---

## 📌 Problem Overview
Vehicle recognition in the wild poses significant computer vision challenges: visually similar body styles across different model years, variable illumination conditions, severe reflections, and partial occlusions. 

**Visionary** delivers a hybrid intelligent recognition pipeline trained on the **Stanford Cars Dataset** (16,185 images across 196 categories). It combines:
1. **Classical Computer Vision**: CLAHE illumination normalization, edge/contour structural analysis, and color/texture (HSV + LBP) feature representations.
2. **Deep Learning Detection**: YOLOv8-based vehicle localization producing tight Region-of-Interest (ROI) bounding boxes.
3. **Fine-Grained Classification**: Pretrained Deep Feature Extractor (ConvNeXt / EfficientNet) distinguishing nuanced Make, Model, and Year attributes.
4. **Hybrid Decision Fusion**: Ensembling classical geometric/color priors with deep representations, accompanied by confidence thresholding.
5. **Model Optimization**: INT8 dynamic quantization and ONNX runtime integration for high-efficiency mobile/edge deployment.

---

## 🏗️ System Architecture

```
[Raw User Image]
       │
       ├──► [Classical Preprocessing] ──► CLAHE Normalization & Bilateral Filtering
       │
       ├──► [Vehicle Localization]   ──► YOLOv8 Bounding Box Detector (IoU > 0.85)
       │                                     │
       │                                     ▼ (Cropped ROI)
       │                          [Fine-Grained Deep Classifier]
       │                                     │
       └──► [Classical Feature Extractor]    ▼
               (Edges, Contours, LBP) ──► [Hybrid Fusion & Verification]
                                                     │
                                                     ▼
                                          [Make, Model, Year + Top-5 Probabilities]
                                          [Confidence Calibration & Anomaly Alert]
```

---

## 🚀 Quickstart & Reproduction

### 1. Clone the repository
```bash
git clone https://github.com/Sreeram5678/Visionary.git
cd Visionary
```

### 2. Environment Setup (Recommended: Python 3.11 with `uv`)
```bash
# Using uv (fastest)
uv venv --python 3.11
source .venv/bin/activate
uv pip install -r requirements.txt

# Or using standard pip
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 3. Launch Interactive Streamlit App
```bash
streamlit run app/app.py
```

---

## 📊 Evaluation & Ablation Results
All official evaluation metrics mandated by the hackathon instruction sheet are documented in **[`eval_P5_T20.md`](eval_P5_T20.md)**.

---

## 🤖 Agent & Teammate Guidelines
All contributors (human or AI agents) must read and abide by **[`AGENTS.md`](AGENTS.md)** before committing changes.
