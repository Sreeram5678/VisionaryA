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
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Team Info */}
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <span className="text-xl font-black text-white tracking-tighter">V</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-extrabold tracking-wide bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
                  VISIONARY
                </span>
                <span className="px-2 py-0.5 text-xs font-semibold bg-cyan-950 text-cyan-400 border border-cyan-800/60 rounded-full">
                  P5 · Team T20
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Hybrid Fine-Grained Vehicle Recognition (Stanford Cars 196)
              </p>
            </div>
          </div>

          {/* Model Health / Architecture Badge */}
          <div className="hidden md:flex items-center space-x-3 text-xs bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-lg">
            <div className="flex items-center space-x-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-slate-300 font-medium">Pipeline Active</span>
            </div>
            <span className="text-slate-700">|</span>
            <div className="flex items-center space-x-1 text-slate-400">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>YOLOv8 + 196-Class Classifier</span>
            </div>
            <span className="text-slate-700">|</span>
            <div className="flex items-center space-x-1 text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>Multimodal 1312-d</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 overflow-x-auto pb-2 pt-1 border-t border-slate-800/60 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all duration-150 whitespace-nowrap ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
