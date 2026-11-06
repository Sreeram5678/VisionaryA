import React, { useState } from 'react';
import { Layers, Eye, Sliders, CheckCircle2 } from 'lucide-react';

export default function CVInspector({ result }) {
  const [selectedPanel, setSelectedPanel] = useState('clahe');

  if (!result || !result.visualizations) {
    return (
      <div className="glass-card rounded-2xl p-14 text-center space-y-3">
        <div
          className="mx-auto w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.15)' }}
        >
          <Layers className="w-7 h-7 text-slate-600" />
        </div>
        <h3 className="text-lg font-bold text-slate-300">No Analysis Available Yet</h3>
        <p className="text-sm text-slate-500">
          Upload an image in the "Live Recognition" tab to inspect classical pipeline stages.
        </p>
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
      num: '01',
    },
    {
      id: 'clahe',
      title: '2. Illumination Normalized (CLAHE)',
      desc: 'CIE LAB color space conversion + Contrast Limited Adaptive Histogram Equalization on L-channel (clip limit: 2.0).',
      image: visualizations.clahe,
      badge: 'Contrast Normalized',
      num: '02',
    },
    {
      id: 'denoised',
      title: '3. Bilateral Filter Denoised',
      desc: 'Edge-preserving smoothing suppressing sensor grain while retaining sharp car body crease lines (d=9, sigma=75).',
      image: visualizations.denoised,
      badge: 'Edge-Preserved',
      num: '03',
    },
    {
      id: 'edges',
      title: '4. Adaptive Canny Edge Map',
      desc: 'Double-threshold hysteresis tracking vehicle structural edges (grille, hood silhouette, pillar angles).',
      image: visualizations.edges,
      badge: 'Canny Gradients',
      num: '04',
    },
    {
      id: 'contours',
      title: '5. Structural Contours & Convex Hull',
      desc: 'Hierarchical boundary analysis isolating the outermost vehicle chassis silhouette.',
      image: visualizations.contours,
      badge: 'Chassis Geometry',
      num: '05',
    },
  ];

  const activePanelData = panels.find((p) => p.id === selectedPanel) || panels[1];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)', boxShadow: '0 0 20px rgba(0,212,255,0.08)' }}
          >
            <Layers className="w-6 h-6 text-[#00D4FF]" />
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

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Stage Selector */}
        <div className="lg:col-span-5 space-y-2">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">
            Pipeline Processing Stages
          </h3>

          <div className="space-y-1.5">
            {panels.map((panel) => {
              const isActive = selectedPanel === panel.id;
              return (
                <button
                  key={panel.id}
                  onClick={() => setSelectedPanel(panel.id)}
                  className="w-full text-left rounded-xl transition-all duration-200 flex items-center gap-3 p-3 group"
                  style={{
                    background: isActive ? 'rgba(0,212,255,0.06)' : 'rgba(8,15,30,0.6)',
                    border: isActive
                      ? '1px solid rgba(0,212,255,0.3)'
                      : '1px solid rgba(255,255,255,0.05)',
                    borderLeft: isActive ? '4px solid #00D4FF' : '4px solid transparent',
                  }}
                >
                  {/* Thumbnail */}
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-black flex-shrink-0 border border-white/[0.06]">
                    {panel.image ? (
                      <img src={panel.image} alt={panel.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[9px] text-slate-700">N/A</div>
                    )}
                    {/* Stage number overlay */}
                    <div
                      className="absolute top-1 left-1 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black"
                      style={{ background: isActive ? '#00D4FF' : 'rgba(0,0,0,0.7)', color: isActive ? '#050810' : '#64748b' }}
                    >
                      {panel.num}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold truncate ${isActive ? 'text-[#00D4FF]' : 'text-slate-300 group-hover:text-slate-100'}`}>
                      {panel.title}
                    </p>
                    <span
                      className="inline-block mt-1 text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded"
                      style={{ background: isActive ? 'rgba(0,212,255,0.1)' : 'rgba(255,255,255,0.04)', color: isActive ? '#00D4FF' : '#475569', border: `1px solid ${isActive ? 'rgba(0,212,255,0.3)' : 'rgba(255,255,255,0.06)'}` }}
                    >
                      {panel.badge}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Classical Metrics */}
          {classical_metrics && (
            <div className="glass-card rounded-2xl p-4 space-y-3 mt-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#00D4FF]" />
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Geometric Invariants
                </h4>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Aspect Ratio (W/H)', value: classical_metrics.aspect_ratio?.toFixed(3) ?? 'N/A', color: '#00D4FF' },
                  { label: 'Solidity (Area/Convex)', value: classical_metrics.solidity?.toFixed(3) ?? 'N/A', color: '#38bdf8' },
                  { label: 'Compactness (4πA/P²)', value: classical_metrics.compactness?.toFixed(3) ?? 'N/A', color: '#818cf8' },
                  { label: 'Bounding Extent', value: classical_metrics.extent?.toFixed(3) ?? 'N/A', color: '#a78bfa' },
                ].map(({ label, value, color }) => (
                  <div
                    key={label}
                    className="p-2.5 rounded-xl"
                    style={{ background: 'rgba(5,8,16,0.8)', border: '1px solid rgba(255,255,255,0.05)' }}
                  >
                    <span className="text-[9px] text-slate-500 block">{label}</span>
                    <span className="font-mono font-black text-sm mt-0.5" style={{ color }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Large Visualizer */}
        <div className="lg:col-span-7 space-y-4">
          <div className="glass-card rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold tracking-widest uppercase text-[#00D4FF]">
                  Active Inspection Layer
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">{activePanelData.title}</h3>
              </div>
              <span
                className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full"
                style={{ background: 'rgba(0,212,255,0.08)', color: '#00D4FF', border: '1px solid rgba(0,212,255,0.25)' }}
              >
                {activePanelData.badge}
              </span>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">{activePanelData.desc}</p>

            {/* Image — 4:3 aspect */}
            <div
              className="relative rounded-xl overflow-hidden bg-black flex items-center justify-center"
              style={{
                aspectRatio: '4/3',
                border: '1px solid rgba(0,212,255,0.12)',
                boxShadow: '0 0 20px rgba(0,212,255,0.05) inset',
              }}
            >
              {activePanelData.image ? (
                <img
                  src={activePanelData.image}
                  alt={activePanelData.title}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-slate-600 text-sm">Image unavailable</div>
              )}
            </div>

            {/* Callout */}
            <div
              className="flex items-start gap-3 p-4 rounded-xl text-xs"
              style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.04), rgba(0,255,136,0.04))', border: '1px solid rgba(0,255,136,0.15)' }}
            >
              <CheckCircle2 className="w-4 h-4 text-[#00FF88] flex-shrink-0 mt-0.5" />
              <div className="text-slate-300 leading-relaxed">
                <span className="font-bold text-white">Hybrid Advantage: </span>
                Feeding both deep latent representations (2048-d) and classical descriptors (544-d) into decision fusion ensures the network is resilient against adversarial paint reflections and uneven road glare.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
