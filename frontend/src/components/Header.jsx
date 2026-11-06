import React from 'react';
import { ShieldCheck, Cpu, Activity, AlertTriangle, Layers, Zap } from 'lucide-react';

export default function Header({ activeTab, setActiveTab, health }) {
  const tabs = [
    { id: 'recognition', label: 'Live Recognition', icon: Zap },
    { id: 'classical', label: 'Classical CV Pipeline', icon: Layers },
    { id: 'benchmarks', label: 'Ablation Benchmarks', icon: Activity },
    { id: 'failures', label: 'Failure Cases & Viva', icon: AlertTriangle },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.04] bg-[#050810]/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Brand Row */}
        <div className="flex items-center justify-between h-14">
          {/* Brand */}
          <div className="flex items-center space-x-3">
            {/* Hexagonal Monogram */}
            <div
              className="relative h-9 w-9 flex items-center justify-center flex-shrink-0"
              style={{ clipPath: 'polygon(50% 0%, 95% 25%, 95% 75%, 50% 100%, 5% 75%, 5% 25%)' }}
            >
              <div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(135deg, #00D4FF 0%, #0066aa 50%, #8B5CF6 100%)' }}
              />
              <span className="relative text-sm font-black text-white z-10">V</span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span
                  className="text-lg font-black tracking-widest uppercase"
                  style={{ background: 'linear-gradient(90deg, #00D4FF, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
                >
                  VISIONARY
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold tracking-widest text-[#00D4FF] border border-[#00D4FF]/30 rounded-full bg-[#00D4FF]/5">
                  P5 · T20
                </span>
              </div>
              <p className="text-[10px] text-slate-500 hidden sm:block tracking-wide">
                Fine-Grained Vehicle Intelligence · 196 Classes
              </p>
            </div>
          </div>

          {/* Right: Status + Architecture Chips */}
          <div className="hidden md:flex items-center gap-3">
            {/* Live indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#00FF88]/5 border border-[#00FF88]/20">
              <span className="live-dot" />
              <span className="text-[11px] font-semibold text-[#00FF88] tracking-wide">Pipeline Ready</span>
            </div>

            {/* Architecture chips */}
            <div className="flex items-center gap-1.5">
              {['YOLOv8', 'ConvNeXt', 'Fusion'].map((chip) => (
                <span
                  key={chip}
                  className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded bg-[#0a1828] text-slate-400 border border-white/[0.06]"
                >
                  {chip}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Pill Navigation */}
        <div className="flex gap-1 pb-2 overflow-x-auto scrollbar-none" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <div className="flex gap-1 pt-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`tab-pill${isActive ? ' active' : ''}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Cyan gradient separator */}
      <div
        className="h-px w-full"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.3), transparent)' }}
      />
    </header>
  );
}
