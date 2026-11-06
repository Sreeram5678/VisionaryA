import React, { useRef, useState } from 'react';
import { Upload, Camera, Sparkles, Image as ImageIcon, Loader2 } from 'lucide-react';

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
      alert("Could not access camera: " + err.message);
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
        const file = new File([blob], "camera_capture.jpg", { type: "image/jpeg" });
        stopCamera();
        onAnalyzeFile(file);
      }
    }, 'image/jpeg', 0.95);
  };

  return (
    <div className="space-y-6">
      {/* Upload & Camera Container */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-6 sm:p-10 text-center transition-all duration-200 glass-card ${
          dragActive
            ? 'border-cyan-400 bg-cyan-950/20 glow-cyan'
            : 'border-slate-800 hover:border-slate-700 bg-slate-900/40'
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
                className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded-xl flex items-center space-x-2 transition"
              >
                <Camera className="w-4 h-4" />
                <span>Snap Car Photo</span>
              </button>
              <button
                type="button"
                onClick={stopCamera}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl transition"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="max-w-lg mx-auto space-y-4">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              {loading ? (
                <Loader2 className="w-7 h-7 animate-spin text-cyan-400" />
              ) : (
                <Upload className="w-7 h-7" />
              )}
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-100">
                {loading ? 'Analyzing Vehicle Dynamics...' : 'Upload Unseen Vehicle Image'}
              </h3>
              <p className="text-sm text-slate-400 mt-1">
                Drag and drop your image, browse from disk, or test live via mobile camera.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                disabled={loading}
                onClick={() => fileInputRef.current?.click()}
                className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-semibold text-sm rounded-xl shadow-lg shadow-cyan-500/20 flex items-center space-x-2 transition disabled:opacity-50"
              >
                <ImageIcon className="w-4 h-4" />
                <span>Choose Image</span>
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={startCamera}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm rounded-xl border border-slate-700/60 flex items-center space-x-2 transition disabled:opacity-50"
              >
                <Camera className="w-4 h-4 text-cyan-400" />
                <span>Take Live Photo</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Preset Samples Carousel for Instant Hackathon Demonstration */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h4 className="text-sm font-semibold text-slate-300">
              Instant Viva Evaluation Presets
            </h4>
          </div>
          <span className="text-xs text-slate-400">Click any preset for 1-second benchmark</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {samples.map((sample) => (
            <button
              key={sample.id}
              disabled={loading}
              onClick={() => onAnalyzePreset(sample.id)}
              className="text-left p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800/80 transition-all duration-150 group flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/50">
                  {sample.category}
                </span>
                <p className="text-xs font-semibold text-slate-200 mt-2 line-clamp-1 group-hover:text-cyan-300 transition">
                  {sample.title}
                </p>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                  {sample.description}
                </p>
              </div>
              <div className="mt-3 flex items-center justify-between text-[11px] text-cyan-400 font-medium">
                <span>Evaluate</span>
                <span className="group-hover:translate-x-0.5 transition-transform">→</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
