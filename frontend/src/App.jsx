import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import HeroUpload from './components/HeroUpload';
import ResultsView from './components/ResultsView';
import CVInspector from './components/CVInspector';
import BenchmarkView from './components/BenchmarkView';
import { AlertCircle, Loader2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('recognition');
  const [samples, setSamples] = useState([]);
  const [benchmarks, setBenchmarks] = useState([]);
  const [currentResult, setCurrentResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch initial data on mount
  useEffect(() => {
    fetchSamples();
    fetchBenchmarks();

    // Auto-run initial evaluation with the real Audi R8 sample
    handleAnalyzePreset('real_audi_r8');
  }, []);

  const fetchSamples = async () => {
    try {
      const res = await fetch('/api/samples');
      if (res.ok) {
        const data = await res.json();
        setSamples(data.samples || []);
      }
    } catch (e) {
      console.warn('Could not fetch samples:', e);
    }
  };

  const fetchBenchmarks = async () => {
    try {
      const res = await fetch('/api/benchmarks');
      if (res.ok) {
        const data = await res.json();
        setBenchmarks(data.benchmarks || []);
      }
    } catch (e) {
      console.warn('Could not fetch benchmarks:', e);
    }
  };

  const handleAnalyzeFile = async (file) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'Analysis failed');
      }
      const data = await res.json();
      setCurrentResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzePreset = async (presetId) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('preset_id', presetId);
      const res = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'Analysis failed');
      }
      const data = await res.json();
      setCurrentResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeTestSample = async (filename) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('test_sample_filename', filename);
      const res = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'Analysis failed');
      }
      const data = await res.json();
      setCurrentResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#070a12] text-slate-100 antialiased selection:bg-cyan-500 selection:text-black">
      {/* Sleek Minimalist Header without clutter */}
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 flex items-center space-x-3 text-rose-200 text-sm">
            <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
            <div>
              <span className="font-bold">Error:</span> {error}
            </div>
          </div>
        )}

        {/* Tab 1: Live Vehicle Recognition */}
        {activeTab === 'recognition' && (
          <div className="space-y-6">
            <HeroUpload
              onAnalyzeFile={handleAnalyzeFile}
              onAnalyzePreset={handleAnalyzePreset}
              onAnalyzeTestSample={handleAnalyzeTestSample}
              loading={loading}
              samples={samples}
            />

            {loading && !currentResult && (
              <div className="rounded-2xl p-12 text-center text-slate-400 space-y-3 bg-[#0d121c] border border-white/[0.08]">
                <Loader2 className="w-7 h-7 animate-spin mx-auto text-cyan-400" />
                <p className="text-xs font-mono uppercase tracking-wider text-slate-300">
                  Localizing Vehicle ROI & Normalizing Lighting...
                </p>
              </div>
            )}

            <ResultsView result={currentResult} />
          </div>
        )}

        {/* Tab 2: Classical Computer Vision Pipeline Inspector */}
        {activeTab === 'classical' && (
          <CVInspector result={currentResult} />
        )}

        {/* Tab 3: Comparative Benchmarks */}
        {activeTab === 'benchmarks' && (
          <BenchmarkView benchmarks={benchmarks} />
        )}
      </main>

      {/* Modern Minimalist Clean Footer */}
      <footer className="border-t border-white/[0.05] bg-[#05070c] py-4 text-center text-xs text-slate-500 font-mono">
        <p>Visionary · Autonomous Fine-Grained Vehicle Telemetry</p>
      </footer>
    </div>
  );
}
