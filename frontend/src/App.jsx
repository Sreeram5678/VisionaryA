import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import HeroUpload from './components/HeroUpload';
import ResultsView from './components/ResultsView';
import CVInspector from './components/CVInspector';
import BenchmarkView from './components/BenchmarkView';
import FailureCases from './components/FailureCases';
import { AlertCircle, Loader2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('recognition');
  const [health, setHealth] = useState(null);
  const [samples, setSamples] = useState([]);
  const [benchmarks, setBenchmarks] = useState([]);
  const [failureCases, setFailureCases] = useState([]);
  const [currentResult, setCurrentResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch initial data on mount
  useEffect(() => {
    fetchHealth();
    fetchSamples();
    fetchBenchmarks();
    fetchFailureCases();

    // Auto-run initial evaluation with the real Audi R8 sample
    handleAnalyzePreset('real_audi_r8');
  }, []);

  const fetchHealth = async () => {
    try {
      const res = await fetch('/api/health');
      if (res.ok) setHealth(await res.json());
    } catch (e) {
      console.warn("Could not fetch health:", e);
    }
  };

  const fetchSamples = async () => {
    try {
      const res = await fetch('/api/samples');
      if (res.ok) {
        const data = await res.json();
        setSamples(data.samples || []);
      }
    } catch (e) {
      console.warn("Could not fetch samples:", e);
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
      console.warn("Could not fetch benchmarks:", e);
    }
  };

  const fetchFailureCases = async () => {
    try {
      const res = await fetch('/api/failure-cases');
      if (res.ok) {
        const data = await res.json();
        setFailureCases(data.failure_cases || []);
      }
    } catch (e) {
      console.warn("Could not fetch failure cases:", e);
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

  return (
    <div className="min-h-screen flex flex-col bg-[#080c14] text-slate-100">
      {/* Sticky Glassmorphic Header */}
      <Header activeTab={activeTab} setActiveTab={setActiveTab} health={health} />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-500/50 flex items-center space-x-3 text-rose-200">
            <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
            <div className="text-sm">
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
              loading={loading}
              samples={samples}
            />

            {loading && !currentResult && (
              <div className="glass-card rounded-2xl p-12 text-center text-slate-400 space-y-3">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-cyan-400" />
                <p className="text-sm font-semibold text-slate-200">
                  Executing YOLOv8 Localization & Classical CLAHE Normalization...
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

        {/* Tab 4: Failure Cases & Viva Preparation */}
        {activeTab === 'failures' && (
          <FailureCases failureCases={failureCases} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/60 py-4 text-center text-xs text-slate-400">
        <p>Visionary — Problem Statement P5 · Team T20</p>
      </footer>
    </div>
  );
}
