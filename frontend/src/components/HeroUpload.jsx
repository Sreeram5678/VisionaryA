import React, { useRef, useState } from 'react';
import { Upload, Camera, Sparkles, Image as ImageIcon, Loader2, ChevronRight } from 'lucide-react';

const CATEGORY_COLORS = {
  luxury:   { border: '#00D4FF', badge: 'bg-[#00D4FF]/10 text-[#00D4FF] border-[#00D4FF]/30' },
  sports:   { border: '#00FF88', badge: 'bg-[#00FF88]/10 text-[#00FF88] border-[#00FF88]/30' },
  suv:      { border: '#8B5CF6', badge: 'bg-[#8B5CF6]/10 text-[#8B5CF6] border-[#8B5CF6]/30' },
  sedan:    { border: '#60a5fa', badge: 'bg-blue-500/10 text-blue-300 border-blue-500/30' },
  truck:    { border: '#f59e0b', badge: 'bg-amber-500/10 text-amber-300 border-amber-500/30' },
  default:  { border: '#00D4FF', badge: 'bg-[#00D4FF]/10 text-[#00D4FF] border-[#00D4FF]/30' },
};

function getCategoryStyle(category) {
  const key = (category || '').toLowerCase();
  return CATEGORY_COLORS[key] || CATEGORY_COLORS.default;
}

const PIPELINE_STAGES = [
  'Initializing YOLOv8 Detector…',
  'Running CLAHE Normalization…',
  'Extracting Canny Edges…',
  'Running ConvNeXt Classifier…',
  'Fusing Hybrid Embeddings…',
  'Finalizing Results…',
];

function LoadingZone() {
  const [stage] = React.useState(() => Math.floor(Math.random() * PIPELINE_STAGES.length));

  return (
    <div className="flex flex-col items-center justify-center gap-5 py-10">
      {/* Animated spinner */}
      <div className="relative w-16 h-16">
        <div className="spinner-ring absolute inset-0" />
        <div
          className="absolute inset-2 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(0,212,255,0.12), transparent)' }}
        />
        <Loader2 className="absolute inset-0 m-auto w-6 h-6 text-[#00D4FF] animate-spin" />
      </div>

      {/* Pulsing dots */}
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-[#00D4FF]"
            style={{ animation: `ping 1.2s ease-in-out ${i * 0.2}s infinite`, opacity: 0.7 }}
          />
        ))}
      </div>

      <div className="text-center space-y-1">
        <p className="text-sm font-semibold text-white">Analyzing Vehicle Dynamics</p>
        <p className="text-xs text-slate-400 font-mono">{PIPELINE_STAGES[stage]}</p>
      </div>
    </div>
  );
}

export default function HeroUpload({ onAnalyzeFile, onAnalyzePreset, loading, samples }) {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

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
        video: { facingMode: 'environment' }
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
      streamRef.current.getTracks().forEach(track => track.stop());
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
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'camera_capture.jpg', { type: 'image/jpeg' });
        stopCamera();
        onAnalyzeFile(file);
      }
    }, 'image/jpeg', 0.95);
  };

  return (
    <div className="space-y-6">
      {/* Upload / Camera Container */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`upload-zone rounded-2xl p-8 sm:p-12 text-center cursor-pointer select-none${dragActive ? ' drag-active glow-cyan' : ''}`}
        onClick={() => !showCamera && !loading && fileInputRef.current?.click()}
        style={{ minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          onClick={(e) => e.stopPropagation()}
        />

        {showCamera ? (
          <div className="max-w-md mx-auto space-y-4 w-full" onClick={(e) => e.stopPropagation()}>
            <div className="relative rounded-xl overflow-hidden border border-[#00D4FF]/30 bg-black aspect-video flex items-center justify-center">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              {/* Scan line overlay */}
              <div className="absolute inset-0 pointer-events-none" style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,212,255,0.02) 2px, rgba(0,212,255,0.02) 4px)' }} />
            </div>
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={capturePhoto}
                className="px-5 py-2.5 font-semibold rounded-xl flex items-center gap-2 transition-all"
                style={{ background: 'linear-gradient(135deg, #00D4FF, #0066cc)', color: '#050810' }}
              >
                <Camera className="w-4 h-4" />
                <span>Snap Car Photo</span>
              </button>
              <button
                type="button"
                onClick={stopCamera}
                className="px-4 py-2.5 bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 font-medium rounded-xl border border-white/[0.08] transition"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : loading ? (
          <div onClick={(e) => e.stopPropagation()}>
            <LoadingZone />
          </div>
        ) : (
          <div className="max-w-lg mx-auto space-y-5" onClick={(e) => e.stopPropagation()}>
            {/* Upload icon in glowing square */}
            <div
              className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{
                background: 'rgba(0,212,255,0.08)',
                border: '1px solid rgba(0,212,255,0.25)',
                boxShadow: '0 0 30px rgba(0,212,255,0.12)',
              }}
            >
              <Upload className="w-8 h-8 text-[#00D4FF]" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white">
                Drop vehicle image here
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                or browse from disk · camera capture supported
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
              <button
                type="button"
                disabled={loading}
                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                className="px-6 py-2.5 font-semibold text-sm rounded-full flex items-center gap-2 transition-all disabled:opacity-50 shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, #00D4FF, #0066cc)',
                  color: '#050810',
                  boxShadow: '0 4px 20px rgba(0,212,255,0.25)',
                }}
              >
                <ImageIcon className="w-4 h-4" />
                <span>Choose Image</span>
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={(e) => { e.stopPropagation(); startCamera(); }}
                className="px-5 py-2.5 font-semibold text-sm rounded-full flex items-center gap-2 transition-all disabled:opacity-50 border text-[#00D4FF] border-[#00D4FF]/40 hover:bg-[#00D4FF]/5"
              >
                <Camera className="w-4 h-4" />
                <span>Live Camera</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Preset Samples */}
      {samples && samples.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#00D4FF]" />
              <h4 className="text-sm font-bold text-slate-200 tracking-wide">
                Instant Evaluation Presets
              </h4>
            </div>
            <span className="text-xs text-slate-500 font-mono">{samples.length} presets</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {samples.map((sample) => {
              const style = getCategoryStyle(sample.category);
              return (
                <button
                  key={sample.id}
                  disabled={loading}
                  onClick={() => onAnalyzePreset(sample.id)}
                  className="text-left rounded-xl transition-all duration-200 group disabled:opacity-50 overflow-hidden flex flex-col"
                  style={{
                    background: 'rgba(8,15,30,0.80)',
                    border: `1px solid rgba(255,255,255,0.06)`,
                    borderTop: `2px solid ${style.border}`,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = style.border; e.currentTarget.style.boxShadow = `0 8px 30px rgba(0,0,0,0.5), 0 0 0 1px ${style.border}30`; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderTopColor = style.border; e.currentTarget.style.boxShadow = ''; }}
                >
                  <div className="p-3 flex-1 space-y-2">
                    <span className={`text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded border ${style.badge}`}>
                      {sample.category}
                    </span>
                    <p className="text-xs font-bold text-slate-200 line-clamp-1 group-hover:text-white transition mt-1">
                      {sample.title}
                    </p>
                    <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">
                      {sample.description}
                    </p>
                  </div>
                  <div
                    className="flex items-center justify-between px-3 py-2 text-[10px] font-semibold"
                    style={{ borderTop: '1px solid rgba(255,255,255,0.04)', color: style.border }}
                  >
                    <span>Evaluate</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
