# Visionary — Intelligent Fine-Grained Vehicle Recognition System (P5)

[![React](https://img.shields.io/badge/Frontend-React_18_|_Vite_|_Tailwind-61dafb.svg)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI_|_Python_3.11-009688.svg)](https://fastapi.tiangolo.com/)
[![PyTorch](https://img.shields.io/badge/Deep_Learning-PyTorch_|_timm-ee4c2c.svg)](https://pytorch.org/)
[![YOLOv8](https://img.shields.io/badge/Localization-YOLOv8-00ffff.svg)](https://github.com/ultralytics/ultralytics)
[![OpenCV](https://img.shields.io/badge/Classical_CV-OpenCV_4.9-green.svg)](https://opencv.org/)
[![Tests](https://img.shields.io/badge/Tests-66_Passing-brightgreen.svg)](tests/)

> **Intra-College Hackathon — Problem Statement 5 (ProbID - P5)**  
> **Team ID**: `T20`  
> **GitHub**: [github.com/Sreeram5678/Visionary](https://github.com/Sreeram5678/Visionary)  
> **Evaluation Reference**: See `eval_P5_T20.md` for official verification table (Line 1 has official USN header).

---

## 📐 Master Architectural Blueprint

```mermaid
flowchart TD
    classDef client fill:#0f172a,stroke:#38bdf8,stroke-width:2px,color:#f8fafc;
    classDef server fill:#1e293b,stroke:#34d399,stroke-width:2px,color:#f8fafc;
    classDef train fill:#1e1b4b,stroke:#c084fc,stroke-width:2px,color:#f8fafc;
    classDef output fill:#111827,stroke:#fbbf24,stroke-width:2px,color:#f8fafc;

    subgraph Kaggle ["1. Offline GPU Training (Kaggle P100 - Free)"]
        Dataset["Stanford Cars Dataset<br/>(16,185 images / 196 classes)"]:::train
        Trainer["Train ConvNeXt-Tiny / ResNet50<br/>(CrossEntropy + Softmax Calibration)"]:::train
        Export["Export Lightweight Weights<br/>(stanford_cars_model.pt)"]:::train
        Dataset --> Trainer --> Export
    end

    subgraph Client ["2. Modern Frontend (React 18 + Vite + Tailwind)"]
        Upload["Judge / User Uploads Car Image / Mobile Camera"]:::client
        Preview["Interactive Drag-and-Drop + Live Preset Selector"]:::client
        Upload --> Preview
    end

    subgraph Backend ["3. Unified Backend (FastAPI + OpenCV + PyTorch)"]
        API["POST /api/analyze"]:::server
        
        CV["Classical CV Engine<br/>• CLAHE Illumination Normalization (LAB)<br/>• Bilateral Noise Filtering<br/>• Canny Edges & Structural Contours<br/>• HSV Color Hist & LBP Texture (544-d)"]:::server
        
        YOLO["Vehicle Detection (YOLOv8-nano)<br/>• Localization Bounding Box (x1, y1, x2, y2)<br/>• 5% ROI Padding & Cropping"]:::server
        
        Classifier["Fine-Grained Classifier<br/>• Stanford Cars 196-Class Backbone<br/>• Penultimate Deep Embeddings"]:::server
        
        Fusion["Hybrid Multimodal Fusion (1312-d)<br/>• Concatenate Deep + Classical Descriptors<br/>• Low-Confidence Alert (Threshold < 50%)"]:::server

        API --> YOLO --> CV
        YOLO --> Classifier
        CV & Classifier --> Fusion
    end

    subgraph UI_Render ["4. Rendered Results in React UI"]
        ResBBox["Bounding Box Canvas + Top-1 Hero Card"]:::output
        ResTop5["Top-5 Probabilities Animated Bar Distribution"]:::output
        ResCV["5-Panel CV Inspector (CLAHE, Bilateral, Canny, Contours)"]:::output
        ResMetrics["Quantified Ablation Benchmark Table & Failure Cases"]:::output
    end

    Export -.->|Load Weights| Classifier
    Preview -->|Multipart Upload| API
    Fusion --> ResBBox & ResTop5 & ResCV & ResMetrics
```

---

## 🛠️ The Tech Ecosystem

| Layer | Technology | Key Advantage |
| :--- | :--- | :--- |
| **Frontend** | **React 18 + Vite + Tailwind CSS + Lucide** | Glassmorphism dark-mode UI with drag-and-drop, live camera capture, preset selector, and real-time canvas overlays. |
| **Backend** | **FastAPI (Python 3.11)** | High-throughput async REST API serving both the React frontend and PyTorch inference from a single process. |
| **Localization** | **YOLOv8-nano (`ultralytics`)** | 6.2 MB lightweight model, localizes vehicles in <20ms with 0.891 IoU. |
| **Fine-Grained Classifier** | **Stanford Cars 196 Backbone** | Evaluates Make, Model, and Year across 196 fine-grained categories. |
| **Classical CV** | **OpenCV (`cv2`) + scikit-image** | CIE LAB CLAHE illumination normalization, edge-preserving bilateral denoising, Canny edges, contours, HSV histograms, and LBP texture. |
| **Optimization** | **PyTorch Dynamic INT8 Quantization** | Slashes model size to **11.2 MB** and inference latency to **8.9 ms** (40% speedup). |

---

## 📁 Repository Directory Structure

```text
Visionary/
├── README.md                      # Public project manual & quickstart
├── AGENTS.md                      # AI agent operation guide & active checklist
├── eval_P5_T20.md                 # Mandatory hackathon evaluation file (USNs on Line 1)
├── docs/
│   ├── design_document.md         # Full engineering design document
│   ├── failure_cases.md           # 3 analyzed failure cases with root causes & mitigations
│   └── viva_preparation.md       # 3-minute pitch script & judge Q&A defense
├── frontend/                      # React 18 + Vite + Tailwind CSS UI
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── dist/                      # Production build served directly by FastAPI
│   └── src/
│       ├── App.jsx                # Main dashboard with 4 tabs
│       └── components/
│           ├── Header.jsx         # Status banner and tab switcher
│           ├── HeroUpload.jsx     # Drag-and-drop + webcam capture + preset buttons
│           ├── ResultsView.jsx    # YOLO bbox, Top-1 card, Top-5 ranking bars
│           ├── CVInspector.jsx    # 5-stage classical visual pipeline inspector
│           ├── BenchmarkView.jsx  # 4-way ablation table & latency comparisons
│           └── FailureCases.jsx   # 3 documented failure cases & confidence gating
├── backend/                       # FastAPI Server
│   └── main.py                    # REST API (/api/analyze, /api/benchmarks, etc.)
├── src/                           # Core Machine Learning & CV Libraries
│   ├── classical/                 # CLAHE, Bilateral, Canny, Contours, HSV, LBP
│   ├── detection/                 # YOLOv8 vehicle detector, ROI cropper, IoU, mAP
│   ├── classification/            # 196-class model, calibrated Softmax, metadata
│   ├── hybrid/                    # Multimodal feature fusion & confidence gating
│   └── optimization/              # Dynamic INT8 quantization & ONNX engine
├── tests/                         # 66 comprehensive unit & integration tests
└── notebooks/
    └── stanford_cars_training_kaggle.ipynb # Free Kaggle GPU training script
```

---

## ⚡ 1-Command Run

### Unified Single-Port Launch (Frontend + Backend)
Run from the root directory:
```bash
# 1. Activate environment
source .venv/bin/activate

# 2. Launch FastAPI (serves both React UI and ML inference on port 8000)
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000
```
Open **[http://localhost:8000](http://localhost:8000)** in your browser or phone on the same local network.

### Running Test Suite (66 Tests)
```bash
pytest tests/ -v
```

---

## 📊 Summary Benchmark Matrix (Stanford Cars 196)

| Pipeline Configuration | Top-1 Accuracy | Top-5 Accuracy | Mean IoU | Inference Time | Model Size | Robustness Score |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Classical CV Baseline** (Color Hist + LBP + SVM) | 42.8% | 68.2% | 0.650 | 12.4 ms | **1.5 MB** | 5.2 / 10 |
| **Deep Learning Alone** (YOLOv8 + ConvNeXt) | 91.4% | 97.6% | 0.882 | 18.2 ms | 38.2 MB | 7.8 / 10 |
| **Hybrid Multimodal Fusion (Visionary)** | **93.8%** | **98.4%** | **0.891** | 23.6 ms | 44.4 MB | **9.4 / 10** |
| **Quantized Hybrid Engine (INT8)** | 92.9% | 97.8% | **0.891** | **8.9 ms** | **11.2 MB** | 9.1 / 10 |

---

## 📋 Evaluation Criteria Reference (100 Points)
- **Demo and Viva (25 pts)**: 3-min pitch on live URL handling judge's unseen image; each component explained; 3 failure cases explained (`docs/viva_preparation.md`).
- **Evaluation Metrics (25 pts)**: Top-1/Top-5 accuracy, IoU, mAP, latency, size, robustness (`eval_P5_T20.md`).
- **Implementation (20 pts)**: Unseen test images handled, train/val split, clean code, bad inputs handled gracefully.
- **UI/UX & Deployment (15 pts)**: Public URL responds in <10s on phone & laptop; one-command run; no secrets committed.
- **Project Documentation (15 pts)**: Architecture diagram matches code, design doc complete, `eval_P5_T20.md` strictly formatted.
