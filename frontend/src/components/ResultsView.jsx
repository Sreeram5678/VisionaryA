import React from 'react';
import { ShieldCheck, AlertTriangle, CheckCircle2, Clock, Cpu, BarChart2, Maximize2, Trophy } from 'lucide-react';

function ConfidenceColor(status) {
  if (status === 'CONFIDENT') return { text: '#00FF88', bg: 'rgba(0,255,136,0.08)', border: 'rgba(0,255,136,0.3)' };
  if (status === 'AMBIGUOUS') return { text: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.3)' };
  return { text: '#f43f5e', bg: 'rgba(244,63,94,0.08)', border: 'rgba(244,63,94,0.3)' };
}

const RANK_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32', '#94a3b8', '#64748b'];

export default function ResultsView({ result }) {
  if (!result) return null;

  const {
    vehicle_detected,
    primary_box,
    top1,
    top5,
    confidence_assessment,
    latency,
    visualizations,
    fused_embedding_dim,
  } = result;

  const confStyle = ConfidenceColor(confidence_assessment.status);
  const topPct = ((top1?.probability ?? 0) * 100).toFixed(1);

  return (
    <div className="space-y-5">
      {/* Alert Banners */}
      {!vehicle_detected && (
        <div
          className="flex items-start gap-4 p-4 rounded-xl text-sm"
          style={{ background: 'rgba(245,158,11,0.06)', borderLeft: '4px solid #f59e0b', border: '1px solid rgba(245,158,11,0.2)', borderLeftWidth: '4px' }}
        >
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-amber-200">
            <span className="font-bold text-amber-300">Zero Vehicle Bounding Box Detected: </span>
            YOLO detector did not find a vehicle with sufficient confidence. The classifier evaluated full-frame features.
          </div>
        </div>
      )}

      {confidence_assessment.is_low_confidence && vehicle_detected && (
        <div
          className="flex items-start gap-4 p-4 rounded-xl text-sm"
          style={{ background: 'rgba(244,63,94,0.06)', borderLeft: '4px solid #f43f5e', border: '1px solid rgba(244,63,94,0.2)', borderLeftWidth: '4px' }}
        >
          <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
          <div className="text-rose-200">
            <span className="font-bold text-rose-300">Low Confidence Warning (&lt; 50% threshold): </span>
            Top prediction confidence is below calibrated reliability threshold. Vehicle may suffer from severe occlusion, heavy shadow, or unrepresented trim.
          </div>
        </div>
      )}

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* LEFT — Detection + Latency */}
        <div className="lg:col-span-6 space-y-4">
          {/* Detection Image Panel */}
          <div className="glass-card rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Maximize2 className="w-4 h-4 text-[#00D4FF]" />
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest">
                  YOLOv8 Detection & ROI
                </h3>
              </div>
              {primary_box && (
                <span
                  className="text-xs font-mono font-bold px-2 py-0.5 rounded"
                  style={{ color: '#00D4FF', background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.25)' }}
                >
                  Conf: {(primary_box.confidence * 100).toFixed(1)}%
                </span>
              )}
            </div>

            {/* Image */}
            <div
              className="relative rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center"
              style={{ border: vehicle_detected ? '1px solid rgba(0,212,255,0.2)' : '1px solid rgba(255,255,255,0.06)', boxShadow: vehicle_detected ? '0 0 20px rgba(0,212,255,0.08) inset' : 'none' }}
            >
              {visualizations?.detection ? (
                <img
                  src={visualizations.detection}
                  alt="Vehicle Localization"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-slate-600 text-sm">No localization image available</div>
              )}
            </div>

            {/* BBox Coordinates */}
            {primary_box && (
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: 'X1', value: primary_box.x1, color: '#00D4FF' },
                  { label: 'Y1', value: primary_box.y1, color: '#38bdf8' },
                  { label: 'X2', value: primary_box.x2, color: '#818cf8' },
                  { label: 'Y2', value: primary_box.y2, color: '#a78bfa' },
                ].map(({ label, value, color }) => (
                  <div
                    key={label}
                    className="text-center rounded-lg py-2"
                    style={{ background: 'rgba(5,8,16,0.8)', border: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    <span className="block text-[9px] font-mono font-bold tracking-widest" style={{ color }}>
                      {label}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-200 mt-0.5">{value}px</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Latency Strip */}
          <div className="glass-card rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#00D4FF]" />
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest">
                End-to-End Latency
              </h4>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { label: 'YOLOv8 Det', value: latency?.detection_ms ?? 0, color: '#00D4FF', thick: false },
                { label: 'Classical CV', value: latency?.classical_cv_ms ?? 0, color: '#38bdf8', thick: false },
                { label: 'ResNet50 196', value: latency?.classification_ms ?? 0, color: '#818cf8', thick: false },
                { label: 'Total Pipeline', value: latency?.total_latency_ms ?? 0, color: '#00FF88', thick: true },
              ].map(({ label, value, color, thick }) => (
                <div
                  key={label}
                  className="text-center rounded-xl py-3"
                  style={{
                    background: 'rgba(5,8,16,0.8)',
                    border: thick ? `2px solid ${color}30` : '1px solid rgba(255,255,255,0.06)',
                    boxShadow: thick ? `0 0 15px ${color}10` : 'none',
                  }}
                >
                  <span className="block text-[9px] font-mono tracking-wider" style={{ color: thick ? color : '#64748b' }}>
                    {label}
                  </span>
                  <span className="text-sm font-black font-mono mt-1" style={{ color }}>{value} ms</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT — Predictions */}
        <div className="lg:col-span-6 space-y-4">
          {/* TOP-1 HERO CARD */}
          <div
            className="rounded-2xl p-6 space-y-4 relative overflow-hidden"
            style={{
              background: 'rgba(8,15,30,0.90)',
              border: '1px solid rgba(0,212,255,0.18)',
              boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
            }}
          >
            {/* Radial glow */}
            <div
              className="absolute top-0 right-0 w-56 h-56 pointer-events-none"
              style={{ background: 'radial-gradient(circle at top right, rgba(0,212,255,0.08), transparent 70%)' }}
            />

            {/* Trophy label */}
            <div className="flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[10px] font-bold tracking-widest uppercase text-amber-400">Top Match</span>
            </div>

            {/* Car name — HUGE */}
            <div>
              <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight tracking-tight">
                {top1?.make} {top1?.model}
              </h2>
              <span
                className="inline-block mt-2 px-3 py-1 text-xs font-bold rounded-full"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#cbd5e1' }}
              >
                Model Year: {top1?.year || 'Unknown'}
              </span>
            </div>

            {/* Confidence — MASSIVE */}
            <div className="flex items-end gap-4">
              <div>
                <div
                  className="text-5xl font-black leading-none"
                  style={{ color: confStyle.text, textShadow: `0 0 30px ${confStyle.text}40` }}
                >
                  {topPct}%
                </div>
                <span
                  className="inline-flex items-center gap-1 mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase"
                  style={{ color: confStyle.text, background: confStyle.bg, border: `1px solid ${confStyle.border}` }}
                >
                  <ShieldCheck className="w-3 h-3" />
                  {confidence_assessment.status}
                </span>
              </div>
            </div>

            {/* Footer */}
            <div
              className="flex items-center justify-between pt-3 text-xs"
              style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
            >
              <span className="flex items-center gap-1.5 text-slate-500">
                <Cpu className="w-3.5 h-3.5 text-[#00D4FF]" />
                <span className="font-mono">{fused_embedding_dim ?? 1312}-dim Fused Vector</span>
              </span>
              <span className="text-[10px] text-slate-600 font-mono">Stanford Cars 196</span>
            </div>
          </div>

          {/* TOP-5 RANKING */}
          <div className="glass-card rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-[#00D4FF]" />
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest">
                  Top-5 Candidate Distribution
                </h3>
              </div>
              <span className="text-[10px] text-slate-600 font-mono">196 classes</span>
            </div>

            <div className="space-y-3">
              {top5?.map((pred, idx) => {
                const pct = (pred.probability * 100).toFixed(1);
                const isWinner = idx === 0;
                const rankColor = RANK_COLORS[idx] || '#64748b';
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 truncate pr-2">
                        {/* Rank badge */}
                        <span
                          className="w-5 h-5 rounded-full flex items-center justify-center font-black text-[9px] flex-shrink-0"
                          style={{
                            background: isWinner ? '#FFD70020' : 'rgba(255,255,255,0.05)',
                            border: `1px solid ${rankColor}50`,
                            color: rankColor,
                          }}
                        >
                          {idx + 1}
                        </span>
                        <span className={`truncate font-semibold ${isWinner ? 'text-white' : 'text-slate-400'}`}>
                          {pred.class_name}
                        </span>
                      </div>
                      <span
                        className="font-mono font-black flex-shrink-0"
                        style={{ color: isWinner ? '#00D4FF' : '#64748b' }}
                      >
                        {pct}%
                      </span>
                    </div>

                    {/* Bar */}
                    <div
                      className="w-full h-2.5 rounded-full overflow-hidden"
                      style={{ background: 'rgba(255,255,255,0.04)' }}
                    >
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${Math.max(pred.probability * 100, 2)}%`,
                          background: isWinner
                            ? 'linear-gradient(90deg, #00D4FF, #0066cc)'
                            : 'linear-gradient(90deg, #1e293b, #334155)',
                          boxShadow: isWinner ? '0 0 10px rgba(0,212,255,0.4)' : 'none',
                        }}
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
