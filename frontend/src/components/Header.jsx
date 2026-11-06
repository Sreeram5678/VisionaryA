import React from 'react';
import { Layers, Activity, Scan } from 'lucide-react';

export default function Header({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'recognition', label: 'Live Recognition', icon: Scan },
    { id: 'classical', label: 'Classical CV Pipeline', icon: Layers },
    { id: 'benchmarks', label: 'Ablation Benchmarks', icon: Activity },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#06080e]/90 backdrop-blur-xl border-b border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Futuristic Automotive Vision Emblem & Title */}
          <div className="flex items-center space-x-3.5">
            {/* Custom High-Tech Logo Glyph */}
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500/20 via-slate-900 to-indigo-500/20 border border-cyan-500/30 flex items-center justify-center shadow-lg shadow-cyan-500/10 group cursor-default">
              <svg
                viewBox="0 0 24 24"
                className="w-5 h-5 text-cyan-400 group-hover:rotate-45 transition-transform duration-500"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.4" />
                <path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
                <circle cx="12" cy="12" r="3" fill="currentColor" fillOpacity="0.8" />
              </svg>
              <div className="absolute -inset-0.5 rounded-xl bg-cyan-400/20 blur-sm opacity-50 pointer-events-none" />
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-black tracking-widest bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  VISIONARY
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              </div>
              <p className="text-[11px] text-slate-400 font-medium tracking-tight">
                Intelligent Fine-Grained Vehicle Recognition
              </p>
            </div>
          </div>

          {/* Minimalist Tab Navigation */}
          <nav className="flex space-x-1 bg-slate-950/70 p-1 rounded-xl border border-white/[0.06]">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-500/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03] border border-transparent'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
