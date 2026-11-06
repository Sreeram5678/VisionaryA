1RUA24CSE0214, 1RUA24CSE0219, 1RUA24CSE0271, 1RUA24CSE0241, 1RUA24CSE0232

# Evaluation Results — Problem Statement 5 (ProbID - P5)
**Team ID**: T20  
**Project**: Intelligent Fine-Grained Vehicle Recognition and Analysis System  
**Dataset**: Stanford Cars Dataset (196 classes, 8,144 train / 8,041 test)  

---

## 5. Evaluation Metrics Table (Official Order)

| Evaluation Parameter | Metric | Classical Baseline (HOG+LBP+SVM) | Deep Learning Only (YOLO + ConvNeXt) | Hybrid Pipeline (Classical + DL Fusion) | Optimized / Quantized Hybrid (INT8 / ONNX) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Classification performance** | **Top-1 Accuracy** | TBD | TBD | TBD | TBD |
| | **Top-5 Accuracy** | TBD | TBD | TBD | TBD |
| **Object localization** | **Intersection over Union (IoU)** | N/A (Full Image) | TBD | TBD | TBD |
| **Object detection** | **Mean Average Precision (mAP@50)** | N/A | TBD | TBD | TBD |
| **Model efficiency** | **Model Size (MB)** | TBD | TBD | TBD | TBD |
| | **Inference Time (ms / image)** | TBD | TBD | TBD | TBD |
| **Robustness** | **Low Illumination Top-1 Acc** | TBD | TBD | TBD | TBD |
| | **Viewing Angle Top-1 Acc** | TBD | TBD | TBD | TBD |
| | **Partial Occlusion Top-1 Acc** | TBD | TBD | TBD | TBD |
| **Confidence** | **Avg Confidence Score (%)** | TBD | TBD | TBD | TBD |
| | **Low-Confidence Flag Rate (<50%)** | TBD | TBD | TBD | TBD |

---

## 6. Ablation Analysis

| Configuration | Description | Top-1 Accuracy | Top-5 Accuracy | Latency (ms) |
| :--- | :--- | :--- | :--- | :--- |
| **A** | Classical Only (Color Hist + LBP + SVM) | TBD | TBD | TBD |
| **B** | Deep Learning Only (No Preprocessing) | TBD | TBD | TBD |
| **C** | Deep Learning + CLAHE Illumination Normalization | TBD | TBD | TBD |
| **D** | YOLO Localization + Deep Learning (Cropped ROI) | TBD | TBD | TBD |
| **E** | Full Hybrid: CLAHE + YOLO + DL + Classical Feature Fusion | TBD | TBD | TBD |
| **F** | Full Hybrid + INT8 Dynamic Quantization | TBD | TBD | TBD |

---

## 7. Documented Failure Cases & Causes

1. **Failure Case 1 (Visually Indistinguishable Facelift Years)**:
   - *Example*: e.g., 2011 BMW 3 Series vs 2012 BMW 3 Series.
   - *Root Cause*: Facelift modifications were restricted to minor headlight beveling not discernable at standard resolution.
2. **Failure Case 2 (Severe Specular Glare / Extreme Sun Reflections)**:
   - *Example*: Direct sunlight reflection bleaching grille and emblem details.
   - *Root Cause*: Pixel saturation in the sensor removes high-frequency edge gradients required for contour matching.
3. **Failure Case 3 (Heavy Foreground Occlusion)**:
   - *Example*: Vehicle partially hidden behind road barrier or foliage (>50% occluded).
   - *Root Cause*: YOLO detects only a partial bounding box; vital distinguishing features (front grille/taillights) are absent.
