import React from 'react';
import { AlertTriangle, ShieldCheck, CheckCircle2, Flame, HelpCircle } from 'lucide-react';

export default function FailureCases({ failureCases }) {
  if (!failureCases || failureCases.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-12 text-center text-slate-400">
        <AlertTriangle className="w-10 h-10 mx-auto text-slate-600 mb-3" />
        <h3 className="text-lg font-bold text-slate-300">Loading Failure Cases...</h3>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">
              Documented Failure Cases & Viva Defense Prep
            </h2>
            <p className="text-sm text-slate-400">
              Mandatory Hackathon Challenge Requirement: In-depth root-cause analysis and automated mitigations.
            </p>
          </div>
        </div>
      </div>

      {/* 3 Failure Case Cards */}
      <div className="space-y-4">
        {failureCases.map((c, idx) => (
          <div
            key={idx}
            className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4 hover:border-slate-700 transition"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider block font-bold">
                  {c.subtitle}
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  {c.title}
                </h3>
              </div>

              <div className="flex items-center space-x-2">
                <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${
                  c.severity === 'Critical'
                    ? 'bg-rose-950/60 text-rose-300 border-rose-800/60'
                    : c.severity === 'High'
                    ? 'bg-amber-950/60 text-amber-300 border-amber-800/60'
                    : 'bg-sky-950/60 text-sky-300 border-sky-800/60'
                }`}>
                  {c.severity} Severity
                </span>
                <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Mitigated</span>
                </span>
              </div>
            </div>

            {/* Example Citation */}
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 text-xs">
              <span className="font-bold text-slate-400">Concrete Example: </span>
              <span className="text-slate-200">{c.example}</span>
            </div>

            {/* Observed Behavior & Root Cause */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1 bg-slate-900/40 p-3.5 rounded-xl border border-slate-800">
                <div className="flex items-center space-x-1.5 text-amber-400 font-bold uppercase tracking-wider">
                  <Flame className="w-3.5 h-3.5" />
                  <span>Observed Failure Behavior</span>
                </div>
                <p className="text-slate-300 leading-relaxed pt-1">
                  {c.observed_behavior}
                </p>
              </div>

              <div className="space-y-1 bg-slate-900/40 p-3.5 rounded-xl border border-slate-800">
                <div className="flex items-center space-x-1.5 text-rose-400 font-bold uppercase tracking-wider">
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Optical / Mathematical Root Cause</span>
                </div>
                <p className="text-slate-300 leading-relaxed pt-1">
                  {c.root_cause}
                </p>
              </div>
            </div>

            {/* Architectural Mitigation */}
            <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/30 text-xs space-y-1">
              <div className="flex items-center space-x-1.5 text-cyan-400 font-bold uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>Engineered System Mitigation</span>
              </div>
              <p className="text-slate-200 leading-relaxed pt-1">
                {c.mitigation}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Confidence Gating & Calibration Policy */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Confidence Calibration & Gating Protocol</span>
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          Standard deep networks are notoriously overconfident on out-of-distribution or occluded data. Visionary enforces a two-tier verification policy:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="font-bold text-emerald-400 block mb-1">Confident (&gt; 50%, Margin &ge; 5%)</span>
            <p className="text-slate-400 text-[11px]">Primary vehicle match passed with clear statistical separation. Result displayed as definitive match.</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="font-bold text-amber-400 block mb-1">Ambiguous (Margin &lt; 5%)</span>
            <p className="text-slate-400 text-[11px]">Top 2 candidate classes differ by less than 5% probability. User is presented with adjacent trim candidates.</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="font-bold text-rose-400 block mb-1">Low Confidence (&lt; 50%)</span>
            <p className="text-slate-400 text-[11px]">Automated warning flagged. Hallucination avoided on non-car images, severe occlusions, or extreme shadows.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
