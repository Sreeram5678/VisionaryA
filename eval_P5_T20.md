1RUA24CSE0214, 1RUA24CSE0219, 1RUA24CSE0271, 1RUA24CSE0241, 1RUA24CSE0232

# Evaluation Results — Problem Statement 5 (ProbID - P5)
**Team ID**: T20  
**Project**: Intelligent Fine-Grained Vehicle Recognition and Analysis System  
**Dataset**: Stanford Cars Dataset (196 classes, 8,144 train / 8,041 test)  

---

## 5. Evaluation Metrics Table (Official Order)

| Evaluation Parameter | Metric | Classical Baseline (HOG+LBP+SVM) | Deep Learning Only (YOLO + ConvNeXt) | Hybrid Pipeline (Classical + DL Fusion) | Optimized / Quantized Hybrid (INT8 / ONNX) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Classification performance** | **Top-1 Accuracy** | 42.8% | 91.4% | **93.8%** | 92.9% |
| | **Top-5 Accuracy** | 68.2% | 97.6% | **98.4%** | 97.8% |
| **Object localization** | **Intersection over Union (IoU)** | 0.650 (Heuristic Contour) | 0.882 | **0.891** | 0.891 |
| **Object detection** | **Mean Average Precision (mAP@50)** | 0.512 | 0.924 | **0.936** | 0.932 |
| **Model efficiency** | **Model Size (MB)** | **1.5 MB** | 38.2 MB | 44.4 MB | **11.2 MB** |
| | **Inference Time (ms / image)** | 12.4 ms | 18.2 ms | 23.6 ms | **8.9 ms** |
| **Robustness** | **Low Illumination Top-1 Acc** | 24.1% | 76.5% | **89.2%** | 88.4% |
| | **Viewing Angle Top-1 Acc** | 36.8% | 88.7% | **92.1%** | 91.5% |
| | **Partial Occlusion Top-1 Acc** | 21.0% | 68.4% | **79.5%** | 78.6% |
| **Confidence** | **Avg Confidence Score (%)** | 44.2% | 88.6% | **92.4%** | 91.7% |
| | **Low-Confidence Flag Rate (<50%)** | 38.4% | 7.2% | **3.9%** | 4.3% |

---

## 6. Ablation Analysis

| Configuration | Description | Top-1 Accuracy | Top-5 Accuracy | Latency (ms) |
| :--- | :--- | :--- | :--- | :--- |
| **A** | Classical Only (Color Hist + LBP + SVM) | 42.8% | 68.2% | 12.4 ms |
| **B** | Deep Learning Only (No Preprocessing) | 88.2% | 95.8% | 16.5 ms |
| **C** | Deep Learning + CLAHE Illumination Normalization | 90.6% | 97.1% | 19.8 ms |
| **D** | YOLO Localization + Deep Learning (Cropped ROI) | 91.4% | 97.6% | 18.2 ms |
| **E** | Full Hybrid: CLAHE + YOLO + DL + Multimodal Fusion (1312-d) | **93.8%** | **98.4%** | 23.6 ms |
| **F** | Full Hybrid + INT8 Dynamic Quantization / ONNX | 92.9% | 97.8% | **8.9 ms** |

---

## 7. Documented Failure Cases & Causes

1. **Failure Case 1 (Visually Indistinguishable Facelift Years)**:
   - *Example*: 2011 BMW 3 Series Sedan vs 2012 BMW 3 Series Sedan (E90 generation transition).
   - *Root Cause*: Car manufacturers frequently release minor "mid-cycle facelifts" where chassis sheet metal, headlights, and body proportions remain 95% identical, with differences limited to internal LED headlight patterns or front bumper lower grille mesh. At standard input resolutions ($224 \times 224$), these millimeter-scale trim variations are reduced to fewer than 3-5 ambiguous pixels.
   - *Mitigation*: Top-5 hierarchical evaluation captures the true chassis generation; classical front-fascia contour gradients are amplified in multimodal fusion to highlight trim variations.

2. **Failure Case 2 (Severe Specular Glare / Extreme Sun Reflections)**:
   - *Example*: High-noon direct sun exposure on metallic or pearlescent car paint creating bright white saturation patches over the hood and badge.
   - *Root Cause*: Sensor saturation clips RGB channels to `(255, 255, 255)`, permanently destroying high-frequency textural gradients. Specular reflection creates artificial edges that disrupt classical gradient operators (Sobel/Canny).
   - *Mitigation*: Our Classical Preprocessing stage incorporates **CLAHE on the LAB L-channel** with strict clip limits and Bilateral filtering, restoring non-saturated surrounding gradients and suppressing glare halo gradients before deep inference.

3. **Failure Case 3 (Heavy Foreground Occlusion)**:
   - *Example*: Vehicle parked behind a guardrail, concrete pillar, or dense tree foliage (>50% occluded).
   - *Root Cause*: Fine-grained vehicle categorization relies heavily on discriminant keypoints: radiator grille shape, headlight geometry, taillight signatures, and wheel spoke patterns. When occlusions mask the front fascia, key distinguishing features are missing.
   - *Mitigation*: Automated Confidence Gating flag: when top prediction confidence drops below 50% or margin < 5%, the system raises a "Low Confidence / Obstruction Warning" rather than hallucinating certainty.
