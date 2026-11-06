import React, { useState } from 'react';
import { Layers, Sliders, CheckCircle2 } from 'lucide-react';

export default function CVInspector({ result }) {
  const [selectedPanel, setSelectedPanel] = useState('clahe');

  if (!result?.visualizations) {
    return (
      <div className="card p-16 text-center space-y-3">
        <Layers className="w-10 h-10 mx-auto text-[#C4A882]" />
        <h3 className="text-base font-bold text-[#4A2C0E]">No Analysis Yet</h3>
        <p className="text-sm text-[#A0825A]">Upload an image on the Live Recognition tab first.</p>
      </div>
    );
  }

  const { visualizations, classical_metrics } = result;

  const panels = [
    { id: 'roi',      title: 'Localised Vehicle ROI',         badge: 'YOLOv8 Crop',       image: visualizations.roi || visualizations.raw,
      desc: 'Cropped bounding box with 5% spatial margin to prevent edge truncation.' },
    { id: 'clahe',    title: 'CLAHE Illumination Normalised', badge: 'Contrast Equalised', image: visualizations.clahe,
      desc: 'CIE LAB → CLAHE on L-channel (clip limit 2.0) for illumination invariance.' },
    { id: 'denoised', title: 'Bilateral Filter Denoised',     badge: 'Edge-Preserved',     image: visualizations.denoised,
      desc: 'Edge-preserving smoothing (d=9, σ=75) suppresses noise while keeping body crease lines.' },
    { id: 'edges',    title: 'Adaptive Canny Edge Map',       badge: 'Gradient Edges',     image: visualizations.edges,
      desc: 'Hysteresis tracking structural edges — grille mesh, hood line, pillar angles.' },
    { id: 'contours', title: 'Contours & Convex Hull',        badge: 'Chassis Geometry',   image: visualizations.contours,
      desc: 'Hierarchical boundary analysis isolating the outer vehicle chassis silhouette.' },
  ];

  const active = panels.find(p => p.id === selectedPanel) || panels[1];

  const metricItems = classical_metrics ? [
    { label: 'Aspect Ratio (W/H)',   value: classical_metrics.aspect_ratio?.toFixed(3)  ?? '—', color: '#7C4A1E' },
    { label: 'Solidity',             value: classical_metrics.solidity?.toFixed(3)       ?? '—', color: '#A0621A' },
    { label: 'Compactness (4πA/P²)', value: classical_metrics.compactness?.toFixed(3)   ?? '—', color: '#C47C3A' },
    { label: 'Bounding Extent',      value: classical_metrics.extent?.toFixed(3)         ?? '—', color: '#8B6914' },
  ] : [];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="card p-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
               style={{ background: 'linear-gradient(135deg,#FDF3E7,#F4E4CB)', border: '1px solid #EAD9C6' }}>
            <Layers className="w-5 h-5 text-[#7C4A1E]" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#2C1A0E]">Classical CV Pipeline Inspector</h2>
            <p className="text-xs text-[#A0825A] mt-0.5">
              Deterministic feature extraction & illumination invariance before deep inference.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* Stage List */}
        <div className="lg:col-span-5 space-y-3">
          <span className="section-label px-1">Processing Stages</span>
          <div className="space-y-2">
            {panels.map((panel, i) => {
              const isActive = selectedPanel === panel.id;
              return (
                <button key={panel.id} onClick={() => setSelectedPanel(panel.id)}
                  className="w-full text-left rounded-xl border flex items-center gap-3 p-3 transition-all duration-150"
                  style={{
                    background:   isActive ? '#FDF3E7' : '#FFFCF7',
                    borderColor:  isActive ? '#C47C3A' : '#EAD9C6',
                    borderLeftWidth: isActive ? '3px' : '1px',
                    borderLeftColor: isActive ? '#7C4A1E' : '#EAD9C6',
                  }}>
                  <div className="relative flex-shrink-0">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-[#2C1A0E] border border-[#EAD9C6]">
                      {panel.image
                        ? <img src={panel.image} alt={panel.title} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-[9px] text-[#A0825A]">N/A</div>
                      }
                    </div>
                    <span className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black text-[#FDF6EE]"
                          style={{ background: isActive ? '#7C4A1E' : '#C4A882' }}>
                      {i + 1}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate ${isActive ? 'text-[#4A2C0E]' : 'text-[#2C1A0E]'}`}>
                      {panel.title}
                    </p>
                    <span className="badge badge-caramel mt-1">{panel.badge}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Metrics */}
          {metricItems.length > 0 && (
            <div className="card p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#C47C3A]" />
                <h4 className="text-sm font-bold text-[#2C1A0E]">Geometric Invariants</h4>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {metricItems.map(({ label, value, color }) => (
                  <div key={label} className="p-2.5 rounded-xl bg-[#FAF0E2] border border-[#EAD9C6]">
                    <span className="block text-[9px] text-[#A0825A] font-semibold uppercase tracking-wide leading-none">{label}</span>
                    <span className="font-mono text-sm font-bold mt-1 block" style={{ color }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Viewer */}
        <div className="lg:col-span-7">
          <div className="card p-5 space-y-4 h-full">
            <div className="flex items-start justify-between">
              <div>
                <span className="section-label">Active Layer</span>
                <h3 className="text-base font-bold text-[#2C1A0E] mt-0.5">{active.title}</h3>
              </div>
              <span className="badge badge-caramel">{active.badge}</span>
            </div>

            <p className="text-xs text-[#7A5C3E] leading-relaxed">{active.desc}</p>

            <div className="relative rounded-xl overflow-hidden bg-[#2C1A0E] border border-[#EAD9C6] flex items-center justify-center"
                 style={{ aspectRatio: '4/3' }}>
              {active.image
                ? <img src={active.image} alt={active.title} className="w-full h-full object-contain" />
                : <span className="text-sm text-[#A0825A]">Image unavailable</span>
              }
            </div>

            <div className="flex items-start gap-2.5 p-3.5 rounded-xl border"
                 style={{ background: '#FDF3E7', borderColor: '#EAD9C6', borderLeftWidth:'3px', borderLeftColor:'#7C4A1E' }}>
              <CheckCircle2 className="w-4 h-4 text-[#2D6A2D] flex-shrink-0 mt-0.5" />
              <div className="text-xs text-[#4A2C0E] leading-relaxed">
                <span className="font-bold">Hybrid Advantage: </span>
                Fusing deep latent (2048-d) with classical descriptors (544-d) makes the model resilient to reflections and uneven road glare.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
