# Visionary — System Design Document
**Problem Statement ID**: P5 (Intelligent Fine-Grained Vehicle Recognition and Analysis System)  
**Team ID**: T20  
**Authors (USNs)**: 1RUA24CSE0214, 1RUA24CSE0219, 1RUA24CSE0271, 1RUA24CSE0241, 1RUA24CSE0232  
**Target Dataset**: Stanford Cars Dataset (196 classes, 16,185 total images)

---

## 1. Executive Summary & Objective
Modern intelligent transportation systems require recognizing vehicle make, model, and year to automate toll collection, parking management, and stolen vehicle identification. However, vehicles of consecutive model years or platform-sharing makes often exhibit near-identical exterior profiles, while real-world capture conditions introduce severe illumination variations, camera angles, and partial occlusions.

**Visionary** is an end-to-end hybrid vehicle analysis framework that couples classical computer vision image restoration, contour/texture descriptor extraction, YOLO-based region-of-interest localization, and deep transfer learning for fine-grained 196-class car classification.

---

## 2. System Architecture & Processing Sequence

```
                                +---------------------------+
                                |    Input Vehicle Image    |
                                +-------------+-------------+
                                              |
                     +------------------------+------------------------+
                     |                                                 |
                     v                                                 v
+---------------------------------------+       +---------------------------------------+
|  Stage 1: Classical Image Processing   |       |  Stage 2: Object Detection (YOLOv8)   |
|  - CLAHE (Illumination Normalization) |       |  - Car/Truck/Bus Localization         |
|  - Bilateral Filtering (Denoising)    |       |  - Coordinate Extraction (x1,y1,x2,y2)|
|  - Canny Edge Detection & Contours    |       |  - Confidence Filtering (> 0.25)      |
|  - Color (HSV) & LBP Texture Vectors  |       +-------------------+-------------------+
+--------------------+------------------+                           |
                     |                                              v
                     |                          +---------------------------------------+
                     |                          |  Stage 3: ROI Cropping & Alignment   |
                     |                          |  - Aspect-ratio Preserved Resizing    |
                     |                          +-------------------+-------------------+
                     |                                              |
                     |                                              v
                     |                          +---------------------------------------+
                     |                          |  Stage 4: Fine-Grained Classifier     |
                     |                          |  - Pretrained ConvNeXt / EfficientNet  |
                     |                          |  - 196 Class Logits & Probabilities   |
                     |                          +-------------------+-------------------+
                     |                                              |
                     +------------------------+---------------------+
                                              |
                                              v
                                +---------------------------+
                                |  Stage 5: Hybrid Fusion   |
                                |  - Deep Embedding + CV    |
                                |  - Confidence Threshold   |
                                |  - Low-confidence Alert   |
                                +-------------+-------------+
                                              |
                                              v
                                +---------------------------+
                                |  Streamlit Dashboard Output|
                                |  - BBox + Top-1/Top-5     |
                                |  - Intermediate CV Panels |
                                |  - Benchmarking & Latency |
                                +---------------------------+
```

---

## 3. Subsystem Breakdown

### 3.1 Classical Computer Vision Subsystem
1. **Adaptive Histogram Equalization (CLAHE)**: Converts RGB image to CIE LAB color space, applies CLAHE strictly to the L-channel (clip limit: 2.0, grid size: 8x8) to normalize non-uniform illumination without distorting chromaticity, and converts back to RGB.
2. **Edge & Silhouette Analysis**: Applies Gaussian blur followed by adaptive Canny edge detection (Otsu thresholding) to isolate vehicle silhouette, wheel arches, and grille boundaries.
3. **Color & Texture Descriptors**: Computes 32-bin HSV color histograms representing vehicle paint and Local Binary Patterns (LBP) capturing radiator grille and headlight micro-textures.

### 3.2 Detection & Localization Subsystem
- Uses lightweight YOLOv8 nano / small fine-tuned for vehicle localization.
- Computes Intersection over Union (IoU) with ground truth annotations.
- Outputs coordinates `[x1, y1, x2, y2]` with confidence score and crops the Region of Interest (ROI) with 5% spatial margin.

### 3.3 Deep Learning Fine-Grained Classifier
- Backbone: `convnext_tiny` or `efficientnet_b3` pretrained on ImageNet and adapted to Stanford Cars' 196 fine-grained categories.
- Loss Function: Cross-Entropy with Label Smoothing (0.1) to prevent overconfidence on visually adjacent model years.
- Multi-class output produces Top-1 and Top-5 class probabilities.

### 3.4 Hybrid Fusion & Verification
- Extracted classical color/texture descriptors are normalized and fused with the penultimate deep feature representations.
- A confidence gate evaluates whether Top-1 probability falls below the uncertainty threshold ($< 0.50$); if so, an anomaly warning is triggered.

---

## 4. Optimization & Efficiency Strategy
To meet the mobile and resource-constrained requirements:
1. **Dynamic INT8 Quantization**: Reduces model weight precision from FP32 to INT8, cutting memory footprint by $\approx 60-75\%$.
2. **ONNX Runtime Export**: Exports PyTorch computation graph to an optimized ONNX engine with operator fusion and graph simplification for sub-50ms CPU inference.

---

## 5. Limitations & Ethical Considerations
- **Dataset Bias**: The Stanford Cars dataset predominantly contains North American and European car releases between 1991 and 2012. Modern EVs (e.g. Tesla Model 3) or regional vehicles outside the dataset are mapped to nearest semantic equivalents.
- **Privacy Assurance**: The system specifically focuses on vehicle make, model, and year. As mandated by the problem constraints, it **does not** perform license plate recognition or facial recognition, preventing personal identification tracking.
