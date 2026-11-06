import React from 'react';
import { AlertTriangle, ShieldCheck, Flame, HelpCircle, CheckCircle2 } from 'lucide-react';

const CASE_ACCENTS = ['#C47C3A', '#9B3A3A', '#7C4A1E'];

export default function FailureCases({ failureCases }) {
  if (!failureCases?.length) {
    return (
      <div className="card p-16 text-center space-y-3">
        <AlertTriangle className="w-10 h-10 mx-auto text-[#C4A882]" />
        <h3 className="text-base font-bold text-[#4A2C0E]">Loading Failure Cases…</h3>
      </div>
    );
  }

  const severityStyle = (s) =>
    s === 'Critical' ? 'badge-rose' :
    s === 'High'     ? 'badge-amber' :
                       'badge-cream';

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="card p-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
               style={{ background: 'linear-gradient(135deg,#FDF3E7,#F4E4CB)', border:'1px solid #EAD9C6' }}>
            <AlertTriangle className="w-5 h-5 text-[#C47C3A]" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#2C1A0E]">Documented Failure Cases & Viva Defence</h2>
            <p className="text-xs text-[#A0825A] mt-0.5">
              Mandatory rubric requirement — root-cause analysis and automated mitigations.
            </p>
          </div>
        </div>
      </div>

      {/* Case Cards */}
      <div className="space-y-4">
        {failureCases.map((c, idx) => {
          const accent = CASE_ACCENTS[idx] ?? '#C4A882';
          return (
            <div key={idx} className="card p-6 space-y-4"
                 style={{ borderLeftWidth: '4px', borderLeftColor: accent }}>

              {/* Case Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <span className="font-mono text-[10px] font-bold uppercase tracking-widest"
                        style={{ color: accent }}>{c.subtitle}</span>
                  <h3 className="text-base font-bold text-[#2C1A0E] mt-0.5">{c.title}</h3>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`badge ${severityStyle(c.severity)}`}>{c.severity} Severity</span>
                  <span className="badge badge-sage flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Mitigated
                  </span>
                </div>
              </div>

              {/* Example */}
              <div className="p-3.5 rounded-xl border text-xs"
                   style={{ background: '#FAF0E2', borderColor: '#EAD9C6', borderLeftWidth:'3px', borderLeftColor: accent }}>
                <span className="font-bold text-[#7A4F28]">Concrete Example: </span>
                <span className="text-[#4A2C0E]">{c.example}</span>
              </div>

              {/* Two columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-4 rounded-xl border border-[#F5D68A] bg-[#FFFBEB] space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-[#D97706]" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#D97706]">Observed Failure</span>
                  </div>
                  <p className="text-xs text-[#4A2C0E] leading-relaxed">{c.observed_behavior}</p>
                </div>

                <div className="p-4 rounded-xl border border-[#FFC4C4] bg-[#FFF1F0] space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-[#E11D48]" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#E11D48]">Root Cause</span>
                  </div>
                  <p className="text-xs text-[#4A2C0E] leading-relaxed">{c.root_cause}</p>
                </div>
              </div>

              {/* Mitigation */}
              <div className="p-4 rounded-xl space-y-1.5"
                   style={{ background: '#FDF3E7', border: `1px solid ${accent}44`, borderLeftWidth:'3px', borderLeftColor: accent }}>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" style={{ color: accent }} />
                  <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: accent }}>Engineered Mitigation</span>
                </div>
                <p className="text-xs text-[#4A2C0E] leading-relaxed">{c.mitigation}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Confidence Calibration */}
      <div className="card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#2D6A2D]" />
          <h3 className="text-sm font-bold text-[#2C1A0E]">Confidence Calibration & Gating Protocol</h3>
        </div>
        <p className="text-xs text-[#7A5C3E] leading-relaxed">
          Deep networks are notoriously over-confident on out-of-distribution data. Visionary enforces a two-tier verification policy.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: 'Confident (>50%, margin ≥5%)', color: '#2D6A2D', borderColor: '#B4D4B4', bg: '#EEF4EE',
              desc: 'Primary match passed with clear statistical separation. Displayed as definitive result.' },
            { label: 'Ambiguous (margin <5%)', color: '#B45309', borderColor: '#FDE68A', bg: '#FFFBEB',
              desc: 'Top 2 candidates differ by <5% probability. User shown adjacent trim candidates.' },
            { label: 'Low Confidence (<50%)', color: '#E11D48', borderColor: '#FFC4C4', bg: '#FFF1F0',
              desc: 'Automated warning raised. Hallucination prevented on non-car or heavily occluded images.' },
          ].map(({ label, color, borderColor, bg, desc }) => (
            <div key={label} className="p-3.5 rounded-xl border text-xs" style={{ background: bg, borderColor }}>
              <span className="font-bold block mb-1" style={{ color }}>{label}</span>
              <p className="text-[#4A2C0E] leading-relaxed opacity-80">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
