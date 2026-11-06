import React, { useRef, useState, useEffect } from 'react';
import { Upload, Camera, Sparkles, Image as ImageIcon, Loader2, Play, CheckCircle2, ChevronRight, Layers } from 'lucide-react';

export default function HeroUpload({ onAnalyzeFile, onAnalyzePreset, onAnalyzeTestSample, loading, samples }) {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [activePresetId, setActivePresetId] = useState('real_audi_r8');
  const [testSamples, setTestSamples] = useState([]);
  const [activeTab, setActiveTab] = useState('presets'); // 'presets' | 'testset'
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    // Fetch official Stanford Cars test set samples
    fetch('/api/test-samples')
      .then((res) => (res.ok ? res.json() : { test_samples: [] }))
      .then((data) => setTestSamples(data.test_samples || []))
      .catch((e) => console.warn('Could not fetch test samples:', e));
  }, []);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onAnalyzeFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      onAnalyzeFile(e.target.files[0]);
    }
  };

  const startCamera = async () => {
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      alert('Could not access camera: ' + err.message);
      setShowCamera(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        if (blob) {
          const file = new File([blob], 'camera_capture.jpg', { type: 'image/jpeg' });
          stopCamera();
          onAnalyzeFile(file);
        }
      },
      'image/jpeg',
      0.95
    );
  };

  const handlePresetClick = (id) => {
    setActivePresetId(id);
    onAnalyzePreset(id);
  };

  return (
    <div className="space-y-6">
      {/* Upload & Camera Input Zone */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`relative rounded-2xl p-6 sm:p-8 text-center transition-all duration-300 border ${
          dragActive
            ? 'border-cyan-400 bg-cyan-950/20 shadow-lg shadow-cyan-500/10'
            : 'border-white/[0.08] hover:border-white/[0.15] bg-[#0c1019]/80 backdrop-blur-md'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {showCamera ? (
          <div className="max-w-md mx-auto space-y-4">
            <div className="relative rounded-xl overflow-hidden border border-cyan-500/30 bg-black aspect-video flex items-center justify-center">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            </div>
            <div className="flex justify-center space-x-3">
              <button
                type="button"
                onClick={capturePhoto}
                className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl flex items-center space-x-2 transition shadow-lg shadow-cyan-500/20"
              >
                <Camera className="w-4 h-4" />
                <span>Capture Frame</span>
              </button>
              <button
                type="button"
                onClick={stopCamera}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 font-medium text-xs rounded-xl border border-white/[0.08] transition"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="max-w-md mx-auto space-y-3">
            <div className="mx-auto w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500/10 to-indigo-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
              ) : (
                <Upload className="w-6 h-6" />
              )}
            </div>

            <div>
              <h3 className="text-base font-bold text-white tracking-wide">
                {loading ? 'Processing Visual Telemetry...' : 'Upload Unseen Vehicle Photography'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Drag and drop raw car imagery or capture live via camera
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-1">
              <button
                type="button"
                disabled={loading}
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-lg shadow-md shadow-cyan-500/10 flex items-center space-x-2 transition disabled:opacity-50"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Browse File</span>
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={startCamera}
                className="px-3.5 py-2 bg-slate-900/90 hover:bg-slate-800 text-slate-200 font-medium text-xs rounded-lg border border-white/[0.08] flex items-center space-x-1.5 transition disabled:opacity-50"
              >
                <Camera className="w-3.5 h-3.5 text-cyan-400" />
                <span>Live Camera</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Evaluation Presets & Test Set Selector Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setActiveTab('presets')}
              className={`text-xs font-bold tracking-wider uppercase transition-colors pb-1 flex items-center space-x-1.5 ${
                activeTab === 'presets'
                  ? 'text-cyan-400 border-b-2 border-cyan-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Calibrated Presets (5 Scenarios)</span>
            </button>

            {testSamples.length > 0 && (
              <button
                onClick={() => setActiveTab('testset')}
                className={`text-xs font-bold tracking-wider uppercase transition-colors pb-1 flex items-center space-x-1.5 ${
                  activeTab === 'testset'
                    ? 'text-cyan-400 border-b-2 border-cyan-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Stanford Cars Test Set ({testSamples.length} Cars)</span>
              </button>
            )}
          </div>

          <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
            1-Click Live Inference
          </span>
        </div>

        {/* Tab 1: The 5 Photographic Scenario Presets */}
        {activeTab === 'presets' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {samples.map((s) => {
              const isSelected = activePresetId === s.id;
              return (
                <button
                  key={s.id}
                  disabled={loading}
                  onClick={() => handlePresetClick(s.id)}
                  className={`group relative text-left rounded-xl overflow-hidden border transition-all duration-200 bg-[#0d121c] flex flex-col justify-between ${
                    isSelected
                      ? 'border-cyan-400/80 ring-1 ring-cyan-400/50 shadow-lg shadow-cyan-950/40'
                      : 'border-white/[0.08] hover:border-cyan-500/40 hover:bg-[#111724]'
                  }`}
                >
                  {/* Real Car Thumbnail Image */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-black/60">
                    <img
                      src={s.image_url || `/api/samples/${s.filename}`}
                      alt={s.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0d121c] via-transparent to-black/30" />

                    {/* Category Tag Badge */}
                    <span className="absolute top-2 left-2 text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-cyan-300 border border-cyan-500/30">
                      {s.category}
                    </span>
                  </div>

                  {/* Card Metadata */}
                  <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                    <div>
                      <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                        {s.title}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">{s.subtitle}</p>
                      <p className="text-[10px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                        {s.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-white/[0.05] flex items-center justify-between text-[10px]">
                      <span className="font-mono text-cyan-400 font-medium">Evaluate</span>
                      <Play className="w-2.5 h-2.5 text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Tab 2: Stanford Cars Test Set Gallery */}
        {activeTab === 'testset' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {testSamples.map((item, idx) => (
              <button
                key={idx}
                disabled={loading}
                onClick={() => onAnalyzeTestSample(item.filename)}
                className="group relative text-left rounded-xl overflow-hidden border border-white/[0.08] hover:border-cyan-400/60 bg-[#0d121c] transition-all p-2.5 flex items-center space-x-3"
              >
                <div className="w-16 h-12 rounded-lg overflow-hidden bg-black flex-shrink-0 border border-white/[0.08]">
                  <img
                    src={item.image_url}
                    alt={item.ground_truth}
                    className="w-full h-full object-cover group-hover:scale-105 transition"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[9px] font-mono text-cyan-400 block truncate font-bold">
                    {item.make} ({item.year})
                  </span>
                  <p className="text-xs font-semibold text-white truncate group-hover:text-cyan-300">
                    {item.model}
                  </p>
                  <span className="text-[9px] text-slate-400 block truncate">
                    {item.body_style}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
