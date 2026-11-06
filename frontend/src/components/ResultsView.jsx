import React from 'react';
import { ShieldCheck, AlertTriangle, Clock, Cpu, BarChart2, Maximize2 } from 'lucide-react';

const RANK_STYLES = [
  { bg: '#7C4A1E', text: '#FDF6EE' },
  { bg: '#A07050', text: '#FDF6EE' },
  { bg: '#C4A882', text: '#2C1A0E' },
  { bg: '#E5D5C0', text: '#6B4A2A' },
  { bg: '#EDE0D0', text: '#8B6040' },
];

export default function ResultsView({ result }) {
  if (!result) return null;

  const { vehicle_detected, primary_box, top1, top5, confidence_assessment, latency, visualizations, fused_embedding_dim } = result;

  const confStatus = confidence_assessment?.status;
  const confPct = ((top1?.probability ?? 0) * 100).toFixed(1);

  const confStyle =
    confStatus === 'CONFIDENT'  ? { color: '#2D6A2D', bg: '#EEF4EE', border: '#B4D4B4' } :
    confStatus === 'AMBIGUOUS'  ? { color: '#92600A', bg: '#FFFBEB', border: '#F5D68A' } :
                                  { color: '#9B3A3A', bg: '#FFF1F0', border: '#FFC4C4' };

  const latencyItems = [
    { label: 'YOLOv8 Det',   value: latency?.detection_ms ?? 0,      color: '#7C4A1E' },
    { label: 'Classical CV', value: latency?.classical_cv_ms ?? 0,    color: '#A0621A' },
    { label: 'Classifier',   value: latency?.classification_ms ?? 0,  color: '#C47C3A' },
    { label: 'Total',        value: latency?.total_latency_ms ?? 0,   color: '#2D6A2D', bold: true },
  ];

  return (
    <div className="space-y-5">
      {/* Alerts */}
      {!vehicle_detected && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-[#FFFBEB] border border-[#F5D68A]"
             style={{ borderLeftWidth: '4px', borderLeftColor: '#D97706' }}>
          <AlertTriangle className="w-4 h-4 text-[#D97706] flex-shrink-0 mt-0.5" />
          <p className="text-sm text-[#92600A]">
            <span className="font-bold">No vehicle detected — </span>
            YOLO found no bounding box; classifier ran on the full frame.
          </p>
        </div>
      )}
      {confidence_assessment?.is_low_confidence && vehicle_detected && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-[#FFF1F0] border border-[#FFC4C4]"
             style={{ borderLeftWidth: '4px', borderLeftColor: '#E11D48' }}>
          <AlertTriangle className="w-4 h-4 text-[#E11D48] flex-shrink-0 mt-0.5" />
          <p className="text-sm text-[#9B3A3A]">
            <span className="font-bold">Low confidence (&lt;50%) — </span>
            Possible occlusion, heavy shadow, or out-of-distribution trim.
          </p>
        </div>
      )}

      {/* Main 2-col layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* LEFT — Detection + Latency */}
        <div className="lg:col-span-6 space-y-4">

          {/* Detection Image */}
          <div className="card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Maximize2 className="w-4 h-4 text-[#C47C3A]" />
                <h3 className="text-sm font-bold text-[#2C1A0E]">YOLOv8 Detection · ROI</h3>
              </div>
              {primary_box && (
                <span className="font-mono text-[11px] text-[#7C4A1E] bg-[#FDF3E7] border border-[#EAD9C6] px-2 py-0.5 rounded-lg">
                  Conf {(primary_box.confidence * 100).toFixed(1)}%
                </span>
              )}
            </div>

            <div className="relative rounded-xl overflow-hidden bg-[#2C1A0E] aspect-video flex items-center justify-center border border-[#EAD9C6]">
              {visualizations?.detection
                ? <img src={visualizations.detection} alt="Vehicle localisation" className="w-full h-full object-contain" />
                : <span className="text-sm text-[#A0825A]">No localisation image</span>
              }
            </div>

            {primary_box && (
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: 'X1', value: primary_box.x1, color: '#7C4A1E' },
                  { label: 'Y1', value: primary_box.y1, color: '#A0621A' },
                  { label: 'X2', value: primary_box.x2, color: '#C47C3A' },
                  { label: 'Y2', value: primary_box.y2, color: '#8B6914' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="text-center py-2 px-1 rounded-xl bg-[#FAF0E2] border border-[#EAD9C6]">
                    <span className="block text-[9px] font-bold uppercase tracking-widest" style={{ color }}>{label}</span>
                    <span className="font-mono text-xs font-semibold text-[#2C1A0E] mt-0.5 block">{value}px</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Latency */}
          <div className="card p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#C47C3A]" />
              <h4 className="text-sm font-bold text-[#2C1A0E]">Latency Breakdown</h4>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {latencyItems.map(({ label, value, color, bold }) => (
                <div key={label}
                     className="text-center py-2.5 rounded-xl bg-[#FAF0E2] border"
                     style={{ borderColor: bold ? color + '55' : '#EAD9C6', borderWidth: bold ? '1.5px' : '1px' }}>
                  <span className="block text-[9px] text-[#A0825A] font-semibold uppercase tracking-wide">{label}</span>
                  <span className="font-mono text-sm font-bold mt-0.5 block" style={{ color }}>{value} ms</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT — Predictions */}
        <div className="lg:col-span-6 space-y-4">

          {/* Top-1 Hero */}
          <div className="card p-6 space-y-4 relative overflow-hidden">
            {/* warm radial glow */}
            <div className="absolute top-0 right-0 w-40 h-40 rounded-full pointer-events-none opacity-40"
                 style={{ background: 'radial-gradient(circle, #C47C3A22 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />

            <div className="flex items-start justify-between relative">
              <div className="flex-1 min-w-0 pr-4">
                <span className="section-label">Top-1 Match</span>
                <h2 className="text-2xl font-black text-[#2C1A0E] mt-1 leading-tight font-display">
                  {top1?.make} {top1?.model}
                </h2>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-[#A0825A] font-medium">Model Year</span>
                  <span className="badge badge-caramel">{top1?.year || '—'}</span>
                </div>
              </div>

              {/* Confidence */}
              <div className="text-right flex-shrink-0">
                <div className="text-4xl font-black leading-none" style={{ color: confStyle.color }}>
                  {confPct}%
                </div>
                <div className="mt-1.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs font-semibold"
                     style={{ background: confStyle.bg, borderColor: confStyle.border, color: confStyle.color }}>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {confStatus}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#EAD9C6] flex items-center justify-between text-xs text-[#A0825A]">
              <div className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-[#C47C3A]" />
                <span>Fused Embedding</span>
              </div>
              <span className="font-mono font-semibold text-[#7C4A1E]">{fused_embedding_dim ?? 1312}-dim</span>
            </div>
          </div>

          {/* Top-5 Rankings */}
          <div className="card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-[#C47C3A]" />
                <h3 className="text-sm font-bold text-[#2C1A0E]">Top-5 Candidates</h3>
              </div>
              <span className="section-label">Stanford Cars 196</span>
            </div>

            <div className="space-y-3">
              {top5?.map((pred, idx) => {
                const pct = (pred.probability * 100).toFixed(1);
                const rank = RANK_STYLES[idx] || RANK_STYLES[4];
                const isWinner = idx === 0;
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 truncate pr-2">
                        <span className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] flex-shrink-0"
                              style={{ background: rank.bg, color: rank.text }}>
                          {idx + 1}
                        </span>
                        <span className={`truncate ${isWinner ? 'font-bold text-[#2C1A0E]' : 'font-medium text-[#6B4A2A]'}`}>
                          {pred.class_name}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-[#2C1A0E] flex-shrink-0">{pct}%</span>
                    </div>
                    <div className="prob-bar-track">
                      <div
                        className={`prob-bar-fill ${isWinner ? 'prob-bar-winner' : 'prob-bar-other'}`}
                        style={{ width: `${Math.max(pred.probability * 100, 2)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
