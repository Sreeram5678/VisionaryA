import React, { useState } from 'react';
import { Layers, Eye, Sliders, CheckCircle2 } from 'lucide-react';

export default function CVInspector({ result }) {
  const [selectedPanel, setSelectedPanel] = useState('clahe');

  if (!result || !result.visualizations) {
    return (
      <div className="glass-card rounded-2xl p-12 text-center text-slate-400">
        <Layers className="w-10 h-10 mx-auto text-slate-600 mb-3" />
        <h3 className="text-lg font-bold text-slate-300">No Analysis Available Yet</h3>
        <p className="text-sm mt-1">Upload an image in the "Live Recognition" tab to inspect classical pipeline stages.</p>
      </div>
    );
  }

  const { visualizations, classical_metrics } = result;

  const panels = [
    {
      id: 'roi',
      title: '1. Localized Vehicle ROI',
      desc: 'Cropped vehicle bounding box with 5% spatial margin to prevent edge truncation.',
      image: visualizations.roi || visualizations.raw,
      badge: 'YOLOv8 Crop',
    },
    {
      id: 'clahe',
      title: '2. Illumination Normalized (CLAHE)',
      desc: 'CIE LAB color space conversion + Contrast Limited Adaptive Histogram Equalization on L-channel (clip limit: 2.0).',
      image: visualizations.clahe,
      badge: 'Contrast Normalized',
    },
    {
      id: 'denoised',
      title: '3. Bilateral Filter Denoised',
      desc: 'Edge-preserving smoothing suppressing sensor grain while retaining sharp car body crease lines (d=9, sigma=75).',
      image: visualizations.denoised,
      badge: 'Edge-Preserved',
    },
    {
      id: 'edges',
      title: '4. Adaptive Canny Edge Map',
      desc: 'Double-threshold hysteresis tracking vehicle structural edges (grille, hood silhouette, pillar angles).',
      image: visualizations.edges,
      badge: 'Canny Gradients',
    },
    {
      id: 'contours',
      title: '5. Structural Contours & Convex Hull',
      desc: 'Hierarchical boundary analysis isolating the outermost vehicle chassis silhouette.',
      image: visualizations.contours,
      badge: 'Chassis Geometry',
    },
  ];

  const activePanelData = panels.find((p) => p.id === selectedPanel) || panels[1];

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">
              Classical Computer Vision Subsystem Inspection
            </h2>
            <p className="text-sm text-slate-400">
              Deterministic feature extraction and illumination invariance pipeline preceding deep inference.
            </p>
          </div>
        </div>
      </div>

      {/* Main Inspector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Stage Selector List */}
        <div className="lg:col-span-5 space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
            Pipeline Processing Stages
          </h3>

          <div className="space-y-2">
            {panels.map((panel) => {
              const isActive = selectedPanel === panel.id;
              return (
                <button
                  key={panel.id}
                  onClick={() => setSelectedPanel(panel.id)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all duration-150 flex items-center space-x-3 ${
                    isActive
                      ? 'bg-cyan-950/40 border-cyan-500/60 shadow-md shadow-cyan-950/50'
                      : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-800/60 hover:border-slate-700'
                  }`}
                >
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-black flex-shrink-0 border border-slate-800">
                    {panel.image ? (
                      <img src={panel.image} alt={panel.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-600">N/A</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`text-sm font-semibold truncate ${isActive ? 'text-cyan-300' : 'text-slate-200'}`}>
                        {panel.title}
                      </p>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                      {panel.badge}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Extracted Classical Descriptors Table */}
          {classical_metrics && (
            <div className="glass-card rounded-2xl p-4 border border-slate-800 space-y-3 mt-4">
              <div className="flex items-center space-x-2 text-slate-300">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider">Geometric Invariants</h4>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/80">
                  <span className="text-slate-400 text-[10px] block">Aspect Ratio (W/H)</span>
                  <span className="font-mono font-bold text-cyan-300 text-sm">
                    {classical_metrics.aspect_ratio?.toFixed(3) ?? 'N/A'}
                  </span>
                </div>
                <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/80">
                  <span className="text-slate-400 text-[10px] block">Solidity (Area/Convex)</span>
                  <span className="font-mono font-bold text-sky-300 text-sm">
                    {classical_metrics.solidity?.toFixed(3) ?? 'N/A'}
                  </span>
                </div>
                <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/80">
                  <span className="text-slate-400 text-[10px] block">Compactness (4πA/P²)</span>
                  <span className="font-mono font-bold text-indigo-300 text-sm">
                    {classical_metrics.compactness?.toFixed(3) ?? 'N/A'}
                  </span>
                </div>
                <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/80">
                  <span className="text-slate-400 text-[10px] block">Bounding Extent</span>
                  <span className="font-mono font-bold text-purple-300 text-sm">
                    {classical_metrics.extent?.toFixed(3) ?? 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Large Stage Visualizer */}
        <div className="lg:col-span-7 space-y-4">
          <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs uppercase font-extrabold tracking-wider text-cyan-400">
                  Active Inspection Layer
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  {activePanelData.title}
                </h3>
              </div>
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/50">
                {activePanelData.badge}
              </span>
            </div>

            <p className="text-sm text-slate-300">
              {activePanelData.desc}
            </p>

            <div className="relative rounded-xl overflow-hidden bg-black border border-slate-800 aspect-video flex items-center justify-center">
              {activePanelData.image ? (
                <img
                  src={activePanelData.image}
                  alt={activePanelData.title}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-slate-500 text-sm">Image unavailable</div>
              )}
            </div>

            {/* Invariant Explanation Callout */}
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-white">Hybrid Advantage: </span>
                Feeding both deep latent representations (2048-d) and classical descriptors (544-d) into decision fusion ensures the network is resilient against adversarial paint reflections and uneven road glare.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
