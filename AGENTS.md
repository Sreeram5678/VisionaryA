# AGENTS.md — Agent & Contributor Operations Manual

> **Mission**: Build an intelligent, fine-grained vehicle recognition and analysis system (Make, Model, Year across 196 categories) integrating Classical Computer Vision + Deep Learning (YOLO detection + Fine-Grained Classification + Hybrid Fusion) with a modern React + FastAPI UI and quantified ablation analysis for Intra-College Hackathon Evaluation.

---

## 1. Project & Team Identity
- **Problem Statement ID**: P5 (Intelligent Fine-Grained Vehicle Recognition and Analysis System)
- **Team ID**: `T20`
- **Team Members & USNs**:
  - `1RUA24CSE0214` - Chakradhar K (Deep Learning & Kaggle Training)
  - `1RUA24CSE0219` - Sreeram Lagisetty (Team Lead & Full-Stack Integration)
  - `1RUA24CSE0271` - Nagarjuna VV (Classical Computer Vision & Preprocessing)
  - `1RUA24CSE0241` - Manoj R (Vehicle Detection & Localization)
  - `1RUA24CSE0232` - Snehan (Optimization, Failure Analysis & Benchmarking)
- **Dataset**: Stanford Cars Dataset (196 classes, 8,144 train / 8,041 test images)

---

## 2. Hackathon Rubric & Zero-Tolerance Constraints (100 Points)

| Criteria | Max Points | Mandatory Requirements to Win Top Band |
| :--- | :--- | :--- |
| **Demo and Viva** | **25 pts** | Clear 3-minute pitch on live URL; handles judge's live unseen image; each member explains their exact component; explains 3 failure cases. |
| **Evaluation Metrics** | **25 pts** | Top-1 & Top-5 accuracy, IoU, mAP, model size & inference time, robustness tests, confidence calibration. |
| **Implementation** | **20 pts** | Core features work on unseen inputs; proper train/val split; clean modular code; robust error handling for non-car or corrupted images. |
| **UI/UX & Deployment** | **15 pts** | **Public URL works on first click from phone & laptop**; responds in <10s; clear loading & error states; one-command run or Dockerfile. |
| **Project Documentation** | **15 pts** | Architecture diagram matches code; design doc complete; README reproduces results; `eval_P5_T20.md` strictly formatted. |

### ⚠️ Instant Penalties (Do NOT violate):
- **No live URL** $\rightarrow$ UI/UX score capped at `0/15`.
- **No GitHub link** $\rightarrow$ Implementation score capped at `0/20`.
- **Missing Architecture Diagram or Design Doc** $\rightarrow$ Documentation capped at `5/15`.
- **Late submission** $\rightarrow$ Minus 5 points per 15 minutes beyond deadline.

---

## 3. Mandatory Evaluator Output File: `eval_P5_T20.md`
The instruction sheet strictly mandates this exact filename and structure:
- **Line 1 must contain all member USNs comma-separated**:
  `1RUA24CSE0214, 1RUA24CSE0219, 1RUA24CSE0271, 1RUA24CSE0241, 1RUA24CSE0232`
- Followed by the official metrics table in exact order:
  1. Classification performance (Top-1 and Top-5 accuracy)
  2. Object localization (Intersection over Union - IoU)
  3. Object detection (Mean Average Precision - mAP)
  4. Model efficiency (Model size and inference time)
  5. Robustness (Performance under varying illumination/angles)
  6. Confidence (Prediction confidence and threshold analysis)

---

## 4. Architectural Blueprint

```
[Input Image (Uploaded via React Frontend)]
      │
      ├──► [Classical CV Pipeline]
      │       ├── CLAHE illumination normalization & bilateral denoising
      │       ├── Canny edge detection & structural contours
      │       └── Color histogram (HSV) & LBP/GLCM texture extraction
      │
      ├──► [Detection & Localization (YOLOv8)]
      │       ├── Vehicle Bounding Box detection (x1, y1, x2, y2)
      │       └── Region-of-Interest (ROI) cropping
      │
      └──► [Fine-Grained Classification (SOTA Backbone)]
              ├── Backbone: ConvNeXt-Tiny / EfficientNet-B3 fine-tuned on Stanford Cars 196
              ├── Penultimate feature embedding
              │
              ▼
[Hybrid Fusion & Decision Logic]
      ├── Concatenate deep features + classical descriptors (or color/aspect gating)
      ├── Output: Top-1 & Top-5 Make, Model, Year + Confidence Score
      └── Low-confidence detector flag (Confidence < threshold)
              │
              ▼
[Modern React + Tailwind Dashboard]
      ├── Tab 1: Live Vehicle Recognition & Bounding Box Canvas
      ├── Tab 2: Intermediate Image Processing (CLAHE, Edges, Contours, Texture)
      ├── Tab 3: Comparative Benchmarks (Classical vs DL vs Hybrid vs Quantized)
      └── Tab 4: Documented Failure Cases & Ablation Insights
```

---

## 5. Repository Directory Layout (Monorepo)

```text
Visionary/
├── README.md                      # Public overview, live demo link, reproduction guide
├── AGENTS.md                      # THIS FILE (Always kept up-to-date)
├── eval_P5_T20.md                 # Required submission metrics file
├── docs/
│   ├── architecture_diagram.png   # System architecture diagram
│   ├── design_document.md         # Comprehensive engineering design doc
│   └── failure_cases.md           # 3 analyzed failure cases
├── frontend/                      # React 18 + Vite + Tailwind CSS
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx
│       └── components/
├── backend/                       # FastAPI + PyTorch + Classical CV
│   ├── main.py                    # Entrypoint serving React dist/ + API
│   ├── requirements.txt           # Python dependencies
│   ├── weights/                   # Model weights (<50MB)
│   └── src/
│       ├── classical/             # CLAHE, Canny, Contours, LBP
│       ├── detection/             # YOLOv8 localization & cropping
│       ├── classification/        # ConvNeXt inference & 196 class map
│       ├── hybrid/                # Fusion & thresholding
│       └── optimization/          # INT8 quantization & ONNX export
└── notebooks/
    └── stanford_cars_training_kaggle.ipynb # Free Kaggle GPU training
```

---

## 6. Engineering & Git Workflow Rules for All Agents

1. **Keep `AGENTS.md` and `eval_P5_T20.md` Synchronized**: Whenever a module is finished, mark it complete in the Roadmap Checklist below.
2. **Conventional Commits**: Format every git commit as:
   - `feat(module): description`
   - `fix(module): description`
   - `docs(name): description`
   - `perf(module): description`
3. **Handle Bad & Unseen Input Gracefully**:
   - What if a user uploads a photo of a cat or an empty road? The detector must report *"No vehicle detected"*, not crash with an index error.
   - What if image is corrupted or zero bytes? Catch errors and display a clean alert.
4. **No Secrets**: Never commit tokens, API keys, or private paths.
5. **No Team Members Table in `README.md`**: Do NOT add the team members table (USNs, names, roles) to `README.md`. Team USNs must only reside in `eval_P5_T20.md` (mandatory evaluation header) and `AGENTS.md`.

---

## 7. Master Hackathon Roadmap & Checklist

- [x] **Phase 1: Foundation & Project Scaffolding**
  - [x] Create GitHub repository `Visionary` under `@Sreeram5678`
  - [x] Configure `.gitignore`, `requirements.txt`, and `AGENTS.md`
  - [x] Initialize `eval_P5_T20.md` with correct USNs header
  - [x] Finalize React + FastAPI + Hugging Face Spaces + Kaggle blueprint

- [x] **Phase 2: Classical Computer Vision Pipeline (`src/classical/`)**
  - [x] Illumination normalization via CLAHE (RGB $\rightarrow$ LAB $\rightarrow$ CLAHE $\rightarrow$ RGB)
  - [x] Bilateral & Gaussian noise reduction
  - [x] Canny edge detection & hierarchical contour analysis
  - [x] Color histograms (HSV space) + Texture (Local Binary Patterns - LBP)
  - [x] Geometric feature extraction (Aspect ratio, bounding box compactness)
  - [x] Classical feature extractor & visualization pipeline with comprehensive test suite

- [x] **Phase 3: Vehicle Detection & Localization (`src/detection/`)**
  - [x] Pretrained YOLOv8 vehicle detector (cars/trucks/buses)
  - [x] ROI bounding box extraction with padding
  - [x] Intersection over Union (IoU) validation against Stanford Cars annotations
  - [x] Mean Average Precision (mAP) calculation

- [x] **Phase 4: Fine-Grained Deep Learning Classifier (`src/classification/` & Kaggle)**
  - [x] Stanford Cars 196 class mapping (Make, Model, Year)
  - [x] Kaggle training notebook for ConvNeXt-Tiny / EfficientNet
  - [x] Export lightweight weights (< 50 MB)
  - [x] Calibration and confidence score calculation

- [ ] **Phase 5: Hybrid Integration (`backend/src/hybrid/`)**
  - [ ] Fuse classical visual features with deep embeddings
  - [ ] Implement low-confidence threshold fallback logic (< 50% flag)
  - [ ] Quantified comparison: Classical vs Deep Learning vs Hybrid

- [ ] **Phase 6: Model Optimization (`backend/src/optimization/`)**
  - [ ] PyTorch FP16 / Dynamic INT8 Quantization
  - [ ] ONNX export and runtime benchmarking
  - [ ] Latency (ms) and Model Size (MB) reduction metrics

- [ ] **Phase 7: Modern React Frontend & FastAPI Integration (`frontend/` + `backend/`)**
  - [ ] Build React 18 + Vite + Tailwind dashboard with dark glassmorphism
  - [ ] Tab 1: Single & batch vehicle image recognition with interactive BBox Canvas
  - [ ] Tab 2: Intermediate Classical CV visual outputs (CLAHE, Edges, Contours, LBP)
  - [ ] Tab 3: Model comparison benchmark table
  - [ ] Tab 4: Documented failure cases with visual explanations
  - [ ] Deploy single container to Hugging Face Spaces (Get live URL)

- [ ] **Phase 8: Documentation & Viva Readiness**
  - [ ] Generate comprehensive `docs/architecture_diagram.png`
  - [ ] Complete `docs/design_document.md`
  - [ ] Complete `docs/failure_cases.md` (3 distinct failure cases)
  - [ ] Finalize `eval_P5_T20.md` with verified metrics
  - [ ] 3-Minute pitch script & viva Q&A prep for all team members
