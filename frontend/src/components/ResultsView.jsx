import React from 'react';
import { ShieldCheck, AlertTriangle, CheckCircle2, Clock, Cpu, BarChart2, Maximize2 } from 'lucide-react';

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

  const confColor =
    confidence_assessment.status === 'CONFIDENT'
      ? 'text-emerald-400 bg-emerald-950/60 border-emerald-500/40'
      : confidence_assessment.status === 'AMBIGUOUS'
      ? 'text-amber-400 bg-amber-950/60 border-amber-500/40'
      : 'text-rose-400 bg-rose-950/60 border-rose-500/40';

  return (
    <div className="space-y-6">
      {/* Non-car or Low-Confidence Alert Banner */}
      {!vehicle_detected && (
        <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 flex items-start space-x-3 text-amber-200">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <span className="font-bold">Zero Vehicle Bounding Box Detected:</span> YOLO detector did not find a vehicle with sufficient confidence. The classifier evaluated full-frame features.
          </div>
        </div>
      )}

      {confidence_assessment.is_low_confidence && vehicle_detected && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 flex items-start space-x-3 text-rose-200">
          <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <span className="font-bold">Low Confidence Warning (&lt; 50% threshold):</span> Top prediction confidence is below calibrated reliability threshold. Vehicle may suffer from severe occlusion, heavy shadow, or unrepresented trim.
          </div>
        </div>
      )}

      {/* Main Grid: Visual Localization on Left, Classification on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Visual Localization Image */}
        <div className="lg:col-span-6 space-y-4">
          <div className="glass-card rounded-2xl p-4 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Maximize2 className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                  YOLOv8 Detection & ROI
                </h3>
              </div>
              {primary_box && (
                <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/40 px-2 py-0.5 rounded">
                  Conf: {(primary_box.confidence * 100).toFixed(1)}%
                </span>
              )}
            </div>

            <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800 aspect-video flex items-center justify-center">
              {visualizations?.detection ? (
                <img
                  src={visualizations.detection}
                  alt="Vehicle Localization"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-slate-500 text-sm">No localization image available</div>
              )}
            </div>

            {/* Bounding Box Coordinate Pill Bar */}
            {primary_box && (
              <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
                <div>
                  <span className="text-slate-500 block text-[10px]">X1</span>
                  <span className="text-slate-300 font-semibold">{primary_box.x1}px</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Y1</span>
                  <span className="text-slate-300 font-semibold">{primary_box.y1}px</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">X2</span>
                  <span className="text-slate-300 font-semibold">{primary_box.x2}px</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Y2</span>
                  <span className="text-slate-300 font-semibold">{primary_box.y2}px</span>
                </div>
              </div>
            )}
          </div>

          {/* Latency & Hardware Metrics */}
          <div className="glass-card rounded-2xl p-4 border border-slate-800 space-y-3">
            <div className="flex items-center space-x-2 text-slate-300">
              <Clock className="w-4 h-4 text-cyan-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider">End-to-End Latency Breakdown</h4>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 block">YOLOv8 Det</span>
                <span className="text-sm font-bold text-cyan-400 font-mono">
                  {latency?.detection_ms ?? 0} ms
                </span>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 block">Classical CV</span>
                <span className="text-sm font-bold text-sky-400 font-mono">
                  {latency?.classical_cv_ms ?? 0} ms
                </span>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 block">ResNet50 196</span>
                <span className="text-sm font-bold text-indigo-400 font-mono">
                  {latency?.classification_ms ?? 0} ms
                </span>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-emerald-500/30 text-center">
                <span className="text-[10px] text-emerald-400 block">Total Pipeline</span>
                <span className="text-sm font-bold text-emerald-300 font-mono">
                  {latency?.total_latency_ms ?? 0} ms
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Fine-Grained Predictions & Probability Rankings */}
        <div className="lg:col-span-6 space-y-4">
          {/* Top-1 Hero Prediction Card */}
          <div className="glass-card rounded-2xl p-6 border border-cyan-500/20 bg-gradient-to-br from-slate-900 via-slate-900/90 to-cyan-950/20 space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs uppercase font-extrabold tracking-wider text-cyan-400">
                  Top-1 Fine-Grained Match
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white mt-1 tracking-tight">
                  {top1?.make} {top1?.model}
                </h2>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-sm font-semibold text-slate-400">Model Year:</span>
                  <span className="px-2 py-0.5 text-xs font-bold rounded bg-slate-800 text-slate-200 border border-slate-700">
                    {top1?.year || 'Unknown'}
                  </span>
                </div>
              </div>

              {/* Confidence Pill */}
              <div className="text-right">
                <div className={`px-3 py-1.5 rounded-xl border font-bold text-sm inline-flex items-center space-x-1.5 ${confColor}`}>
                  <ShieldCheck className="w-4 h-4" />
                  <span>{((top1?.probability ?? 0) * 100).toFixed(1)}%</span>
                </div>
                <span className="block text-[11px] font-mono mt-1 text-slate-400">
                  {confidence_assessment.status}
                </span>
              </div>
            </div>

            {/* Multimodal Feature Embedding Status */}
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center space-x-1">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                <span>Multimodal Representation</span>
              </span>
              <span className="font-mono text-cyan-300 font-semibold">
                {fused_embedding_dim ?? 1312}-dim Fused Vector
              </span>
            </div>
          </div>

          {/* Top-5 Candidate Ranking with Animated Probability Bars */}
          <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BarChart2 className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                  Top-5 Candidate Distribution
                </h3>
              </div>
              <span className="text-xs text-slate-400">Stanford Cars 196</span>
            </div>

            <div className="space-y-3">
              {top5?.map((pred, idx) => {
                const pct = (pred.probability * 100).toFixed(1);
                const isWinner = idx === 0;
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2 truncate pr-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                          isWinner ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                        }`}>
                          #{idx + 1}
                        </span>
                        <span className={`truncate font-medium ${isWinner ? 'text-white font-semibold' : 'text-slate-300'}`}>
                          {pred.class_name}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-slate-200 flex-shrink-0">
                        {pct}%
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isWinner
                            ? 'bg-gradient-to-r from-cyan-500 to-blue-500'
                            : 'bg-slate-700'
                        }`}
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
