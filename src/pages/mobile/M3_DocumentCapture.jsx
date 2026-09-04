import React, { useState, useRef, useEffect } from "react";
import {
  Camera,
  Zap,
  ZapOff,
  X,
  Upload,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import useMobileStore, { SCREENS } from "../../store/useMobileStore";
import MobileHeader from "../../components/mobile/MobileHeader";

/**
 * M3 — DOCUMENT CAPTURE
 * Camera / Document Scanner interface designed for one-handed mobile capture.
 * Features a scanner viewfinder frame with auto-edge detection simulation.
 */
export const M3_DocumentCapture = () => {
  const { setCapturedDocument, setScreen, prevScreen, selectedDocumentType } =
    useMobileStore();

  const [flashOn, setFlashOn] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [documentDetected, setDocumentDetected] = useState(true);

  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const streamRef = useRef(null);

  const startCamera = React.useCallback(async () => {
    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {
      setCameraError("Camera API not supported in this browser");
      return;
    }

    try {
      let stream = null;
      // First try back/environment camera (mobile phones)
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
      } catch (envErr) {
        // Fallback to any available camera (laptops / front webcams)
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
          await videoRef.current.play();
        } catch (playErr) {
          console.warn("Video auto-play interrupted:", playErr);
        }
        setCameraActive(true);
        setCameraError(null);
      }
    } catch (err) {
      console.warn("Camera access failed or denied:", err);
      setCameraActive(false);
      setCameraError(err.message || "Camera access denied");
    }
  }, []);

  // Initialize camera on mount
  useEffect(() => {
    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [startCamera]);

  const handleCapture = () => {
    let capturedDataUrl = null;

    // If live camera is active, grab a real frame snapshot via canvas
    if (cameraActive && videoRef.current) {
      try {
        const video = videoRef.current;
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth || 1280;
        canvas.height = video.videoHeight || 720;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        capturedDataUrl = canvas.toDataURL("image/jpeg", 0.9);
      } catch (canvasErr) {
        console.warn("Could not extract canvas snapshot, falling back to mock", canvasErr);
      }
    }

    // TODO: Replace mock capture with production document scanning/camera pipeline.
    setCapturedDocument({
      fileName: `Prescription_May2026.pdf`,
      date: "12 May 2026",
      sourceLabel: cameraActive ? "Live Camera Capture · 12 May 2026" : "Source document · 12 May 2026",
      fileSize: "1.4 MB",
      dataUrl: capturedDataUrl,
      capturedVia: cameraActive ? "LIVE_CAMERA" : "MOCK_SCANNER",
    });

    setScreen(SCREENS.M4);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCapturedDocument({
          fileName: file.name,
          date: "12 May 2026",
          sourceLabel: `Uploaded file · ${file.name}`,
          dataUrl: event.target?.result,
          fileSize: `${(file.size / 1024).toFixed(1)} KB`,
        });
        setScreen(SCREENS.M4);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-full flex flex-col justify-between bg-slate-950 text-white select-none">
      {/* Hidden file input for mobile photo picker / gallery fallback */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* Top Header */}
      <div className="shrink-0 px-4 pt-safe pb-2 flex items-center justify-between z-10 bg-slate-950/80 backdrop-blur-xs">
        <button
          type="button"
          onClick={prevScreen}
          aria-label="Cancel Scanner"
          className="w-10 h-10 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition active:scale-95 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top: Document detected indicator */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-600/60 text-emerald-300 text-xs font-bold tracking-tight shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Document detected ✓</span>
        </div>

        {/* Flash Toggle */}
        <button
          type="button"
          onClick={() => setFlashOn(!flashOn)}
          aria-label="Toggle Flash"
          className={`w-10 h-10 rounded-full flex items-center justify-center transition active:scale-95 cursor-pointer ${
            flashOn
              ? "bg-amber-400 text-slate-950 font-bold"
              : "bg-slate-800 text-slate-300 hover:text-white"
          }`}
        >
          {flashOn ? <Zap className="w-5 h-5 fill-current" /> : <ZapOff className="w-5 h-5" />}
        </button>
      </div>

      {/* Main Viewfinder Section */}
      <div className="flex-1 relative flex flex-col items-center justify-center px-4 py-2">
        {/* Scanner Viewport Frame */}
        <div className="relative w-full max-w-[340px] aspect-[3/4] rounded-3xl border-2 border-dashed border-teal-400/80 overflow-hidden shadow-2xl flex flex-col items-center justify-between p-4 bg-slate-900/60 backdrop-blur-xs">
          {/* Animated Scanning Laser Beam */}
          <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-teal-400 to-transparent shadow-[0_0_12px_#2dd4bf] animate-scan-beam z-10 pointer-events-none"></div>

          {/* Always mount video element in DOM so videoRef is ready on mount */}
          <video
            ref={videoRef}
            playsInline
            muted
            autoPlay
            className={`absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-300 ${
              cameraActive ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          />

          {/* Fallback silhouette shown when camera is loading or permission not yet granted */}
          {!cameraActive && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-0 opacity-80">
              {/* Simulated Paper Silhouette */}
              <div className="w-[85%] h-[80%] rounded-xl bg-white/10 border border-white/20 p-4 flex flex-col justify-between shadow-inner backdrop-blur-xs">
                <div className="space-y-2">
                  <div className="h-2.5 w-1/2 bg-teal-400/40 rounded"></div>
                  <div className="h-2 w-3/4 bg-white/20 rounded"></div>
                  <div className="h-2 w-2/3 bg-white/20 rounded"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-2 w-full bg-white/15 rounded"></div>
                  <div className="h-2 w-5/6 bg-white/15 rounded"></div>
                  <div className="h-2 w-4/5 bg-white/15 rounded"></div>
                </div>
                <div className="flex justify-between items-end">
                  <div className="h-4 w-12 bg-teal-400/30 rounded"></div>
                  <div className="h-6 w-16 bg-white/20 rounded-md"></div>
                </div>
              </div>
            </div>
          )}

          {/* Corner Guides (Viewfinder target brackets) */}
          <div className="absolute top-3 left-3 w-6 h-6 border-t-4 border-l-4 border-teal-400 rounded-tl-lg pointer-events-none z-20"></div>
          <div className="absolute top-3 right-3 w-6 h-6 border-t-4 border-r-4 border-teal-400 rounded-tr-lg pointer-events-none z-20"></div>
          <div className="absolute bottom-3 left-3 w-6 h-6 border-b-4 border-l-4 border-teal-400 rounded-bl-lg pointer-events-none z-20"></div>
          <div className="absolute bottom-3 right-3 w-6 h-6 border-b-4 border-r-4 border-teal-400 rounded-br-lg pointer-events-none z-20"></div>

          {/* Guidance Instruction Overlay */}
          <div className="z-20 text-center space-y-1 bg-slate-950/80 px-4 py-2 rounded-2xl border border-slate-700/80 backdrop-blur-md shadow-lg max-w-[90%]">
            <p className="text-xs font-bold text-white tracking-wide">
              Place the document inside the frame
            </p>
            <p className="text-[11px] font-medium text-teal-300 leading-tight">
              कृपया दस्तावेज़ को फ्रेम के अंदर रखें
            </p>
          </div>

          {/* Category Tag */}
          <div className="z-20 bg-slate-900/90 text-teal-300 text-[11px] font-bold px-3 py-1 rounded-full border border-teal-700/50">
            Target: {selectedDocumentType ? selectedDocumentType.replace("_", " ").toUpperCase() : "PRESCRIPTION"}
          </div>
        </div>

        {/* Gallery / File Fallback Trigger */}
        {/* Camera Toggle & File Upload Fallback Trigger */}
        <div className="mt-3 flex items-center gap-2 flex-wrap justify-center">
          {!cameraActive ? (
            <button
              type="button"
              onClick={startCamera}
              className="flex items-center gap-1.5 text-xs font-semibold text-emerald-300 hover:text-white bg-emerald-950/80 px-3.5 py-1.5 rounded-full border border-emerald-700/60 transition active:scale-95 cursor-pointer shadow-xs"
            >
              <Camera className="w-3.5 h-3.5 text-emerald-400" />
              <span>Enable Live Camera</span>
            </button>
          ) : (
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Live Camera Active</span>
            </span>
          )}

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900/90 px-3.5 py-1.5 rounded-full border border-slate-800 transition active:scale-95 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-teal-400" />
            <span>Upload Photo / PDF Instead</span>
          </button>
        </div>
      </div>

      {/* Bottom Camera Controls Bar */}
      <div className="shrink-0 px-6 pt-3 pb-safe bg-slate-950 border-t border-slate-900">
        <div className="max-w-md mx-auto flex items-center justify-between gap-6 py-2">
          {/* Cancel */}
          <button
            type="button"
            onClick={prevScreen}
            className="text-xs font-bold text-slate-400 hover:text-white p-2 transition"
          >
            Cancel
          </button>

          {/* Main Shutter Capture Button */}
          <button
            type="button"
            onClick={handleCapture}
            aria-label="Capture Document"
            className="w-18 h-18 rounded-full bg-white p-1.5 shadow-[0_0_24px_rgba(45,212,191,0.4)] transition-all active:scale-90 hover:shadow-[0_0_32px_rgba(45,212,191,0.6)] cursor-pointer flex items-center justify-center relative group"
          >
            <div className="w-full h-full rounded-full border-2 border-slate-900 bg-[#006666] flex items-center justify-center text-white transition-colors group-hover:bg-[#005454]">
              <Camera className="w-7 h-7 text-white" />
            </div>
          </button>

          {/* Flash status indicator */}
          <button
            type="button"
            onClick={() => setFlashOn(!flashOn)}
            className="text-xs font-bold text-slate-400 hover:text-white p-2 transition flex items-center gap-1"
          >
            <span>Flash</span>
            <span className={`text-[10px] font-bold ${flashOn ? "text-amber-400" : "text-slate-500"}`}>
              {flashOn ? "ON" : "OFF"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default M3_DocumentCapture;
