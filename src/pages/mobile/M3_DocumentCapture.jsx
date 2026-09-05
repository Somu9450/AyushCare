import React, { useState, useRef, useEffect, useCallback } from "react";
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
  ArrowLeft,
  Plus,
  ChevronRight,
  Trash2,
  FileText,
  Check,
  Layers,
} from "lucide-react";
import useMobileStore, { SCREENS } from "../../store/useMobileStore";

/**
 * M3 — DOCUMENT CAPTURE (MULTI-CLICK CAMERA & MULTI-FILE UPLOAD)
 * Features:
 * - Live camera feed with full responsiveness
 * - Multiple camera clicks: take consecutive snapshots of multi-page documents
 * - Multiple local system file uploads (images & PDFs)
 * - Interactive captured pages thumbnail gallery tray with delete action
 * - Shutter flash animation and haptic feedback
 * - Mobile hardware torch/flash toggle
 */
export const M3_DocumentCapture = () => {
  const {
    capturedDocuments,
    setCapturedDocuments,
    setCapturedDocument,
    setScreen,
    prevScreen,
    selectedDocumentType,
  } = useMobileStore();

  // Local state for all captured pages in this scanning session
  const [capturedPages, setCapturedPages] = useState(() => {
    if (capturedDocuments && capturedDocuments.length > 0 && capturedDocuments[0]?.dataUrl) {
      return [...capturedDocuments];
    }
    return [];
  });

  const [flashOn, setFlashOn] = useState(false);
  const [torchSupported, setTorchSupported] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [shutterFlashing, setShutterFlashing] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState(null);

  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const streamRef = useRef(null);
  const toastTimeoutRef = useRef(null);

  // Play subtle feedback click using Web Audio API
  const playShutterSound = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      }
    } catch (e) {
      // Audio context might be restricted before interaction
    }
  };

  const showToast = (message) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setFeedbackToast(message);
    toastTimeoutRef.current = setTimeout(() => {
      setFeedbackToast(null);
    }, 2800);
  };

  const startCamera = useCallback(async () => {
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
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });
      } catch (envErr) {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      streamRef.current = stream;

      // Check torch support
      const track = stream.getVideoTracks()[0];
      if (track && track.getCapabilities) {
        const capabilities = track.getCapabilities();
        if ("torch" in capabilities || capabilities.torch) {
          setTorchSupported(true);
        }
      }

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

  useEffect(() => {
    startCamera();

    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      if (streamRef.current) {
        const track = streamRef.current.getVideoTracks()[0];
        if (track && track.applyConstraints) {
          track.applyConstraints({ advanced: [{ torch: false }] }).catch(() => {});
        }
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [startCamera]);

  // Flash / Torch Toggle
  const handleToggleFlash = async () => {
    const nextFlashState = !flashOn;
    setFlashOn(nextFlashState);

    if (streamRef.current) {
      const track = streamRef.current.getVideoTracks()[0];
      if (track && track.applyConstraints) {
        try {
          await track.applyConstraints({
            advanced: [{ torch: nextFlashState }],
          });
        } catch (err) {
          console.warn("Could not toggle mobile hardware torch:", err);
        }
      }
    }
  };

  // MULTIPLE CAMERA CLICKS: Snap photo and add to captured pages list
  const handleCaptureClick = () => {
    let capturedDataUrl = null;

    // Trigger visual shutter flash & sound
    setShutterFlashing(true);
    playShutterSound();
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(50);
    }
    setTimeout(() => setShutterFlashing(false), 160);

    // Extract frame from live video feed
    if (cameraActive && videoRef.current) {
      try {
        const video = videoRef.current;
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth || 1280;
        canvas.height = video.videoHeight || 720;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        capturedDataUrl = canvas.toDataURL("image/jpeg", 0.92);
      } catch (canvasErr) {
        console.warn("Canvas capture error:", canvasErr);
      }
    }

    const nextIndex = capturedPages.length + 1;
    const now = new Date();
    const formattedDate = now.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const newPage = {
      id: `capture_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      fileName: `Doc_Page_${nextIndex}.jpg`,
      date: formattedDate,
      sourceLabel: cameraActive
        ? `Live Camera Capture · Page ${nextIndex}`
        : `Scanned Document · Page ${nextIndex}`,
      fileSize: "1.4 MB",
      dataUrl: capturedDataUrl,
      capturedVia: cameraActive ? "LIVE_CAMERA" : "SCANNER_SIMULATION",
      pageNumber: nextIndex,
    };

    setCapturedPages((prev) => [...prev, newPage]);
    showToast(`Photo #${nextIndex} captured! Snap next page or tap Review.`);
  };

  // MULTIPLE FILE UPLOAD: select multiple files from local disk
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const startIndex = capturedPages.length;
    const now = new Date();
    const formattedDate = now.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const readPromises = files.map((file, idx) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          resolve({
            id: `upload_${Date.now()}_${idx}_${Math.random().toString(36).substr(2, 4)}`,
            fileName: file.name,
            date: formattedDate,
            sourceLabel: `Uploaded File · ${file.name}`,
            dataUrl: event.target?.result,
            fileSize: file.size ? `${(file.size / 1024).toFixed(1)} KB` : "1.2 MB",
            capturedVia: "LOCAL_UPLOAD",
            pageNumber: startIndex + idx + 1,
          });
        };
        reader.readAsDataURL(file);
      });
    });

    const newUploadedPages = await Promise.all(readPromises);
    setCapturedPages((prev) => [...prev, ...newUploadedPages]);
    showToast(`${files.length} document${files.length > 1 ? "s" : ""} added!`);

    // Reset input so re-selection works
    e.target.value = "";
  };

  // Remove a single captured page
  const handleRemovePage = (idToRemove) => {
    setCapturedPages((prev) => prev.filter((p) => p.id !== idToRemove));
    showToast("Page removed.");
  };

  // Proceed to review screen with all captured pages
  const handleProceedToReview = () => {
    if (capturedPages.length === 0) {
      // If none captured yet, take one photo right now and proceed
      handleCaptureClick();
      return;
    }

    setCapturedDocuments(capturedPages);
    setCapturedDocument(capturedPages[0]);
    setScreen(SCREENS.M4);
  };

  return (
    <div className="min-h-full flex flex-col justify-between bg-slate-50 text-slate-900 select-none">
      {/* Hidden file input with MULTIPLE support */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,application/pdf"
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* Top Header */}
      <header className="shrink-0 w-full px-4 sm:px-6 pt-safe pb-2 bg-white border-b border-slate-200/80 shadow-2xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3 h-14">
          <button
            type="button"
            onClick={prevScreen}
            aria-label="Back to Document Type"
            className="w-10 h-10 -ml-1 rounded-xl text-slate-700 hover:bg-slate-100 active:bg-slate-200 flex items-center justify-center transition cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Category & Multi-page counter badge */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
              {selectedDocumentType ? selectedDocumentType.replace("_", " ").toUpperCase() : "PRESCRIPTION"}
            </span>

            {capturedPages.length > 0 && (
              <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-300 flex items-center gap-1 shadow-2xs">
                <Layers className="w-3.5 h-3.5 text-emerald-700" />
                <span>{capturedPages.length} {capturedPages.length === 1 ? "page" : "pages"}</span>
              </span>
            )}
          </div>

          {/* Flash / Torch Toggle */}
          <button
            type="button"
            onClick={handleToggleFlash}
            aria-label="Toggle Flash"
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition active:scale-95 cursor-pointer border ${
              flashOn
                ? "bg-amber-400 border-amber-500 text-slate-950 shadow-sm"
                : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {flashOn ? (
              <Zap className="w-5 h-5 fill-current" />
            ) : (
              <ZapOff className="w-5 h-5" />
            )}
          </button>
        </div>
      </header>

      {/* Main Expansive Viewport */}
      <main className="flex-1 px-4 sm:px-6 py-3 max-w-md md:max-w-2xl lg:max-w-3xl mx-auto w-full flex flex-col items-center justify-between space-y-3">
        {/* Viewfinder Frame with live video */}
        <div className="relative w-full flex-1 min-h-[360px] sm:min-h-[440px] rounded-3xl overflow-hidden shadow-lg bg-slate-900 border-2 border-teal-600/50 flex flex-col items-center justify-between p-4">
          {/* Shutter flash overlay effect */}
          {shutterFlashing && (
            <div className="absolute inset-0 bg-white z-30 transition-opacity duration-150 pointer-events-none opacity-90 animate-pulse" />
          )}

          {/* Video Stream Element */}
          <video
            ref={videoRef}
            playsInline
            muted
            autoPlay
            className={`absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-300 ${
              cameraActive ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          />

          {/* Fallback Viewfinder when camera inactive */}
          {!cameraActive && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-0 bg-slate-900/90 text-white">
              <div className="w-16 h-16 rounded-2xl bg-teal-900/60 border border-teal-700 text-teal-300 flex items-center justify-center mb-3">
                <Camera className="w-8 h-8" />
              </div>
              <p className="text-base font-bold text-slate-100">
                Camera Viewfinder
              </p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                {cameraError ? cameraError : "Starting camera feed..."}
              </p>
            </div>
          )}

          {/* Corner Brackets */}
          <div className="absolute top-4 left-4 w-7 h-7 border-t-4 border-l-4 border-teal-400 rounded-tl-xl pointer-events-none z-10 shadow-xs"></div>
          <div className="absolute top-4 right-4 w-7 h-7 border-t-4 border-r-4 border-teal-400 rounded-tr-xl pointer-events-none z-10 shadow-xs"></div>
          <div className="absolute bottom-4 left-4 w-7 h-7 border-b-4 border-l-4 border-teal-400 rounded-bl-xl pointer-events-none z-10 shadow-xs"></div>
          <div className="absolute bottom-4 right-4 w-7 h-7 border-b-4 border-r-4 border-teal-400 rounded-br-xl pointer-events-none z-10 shadow-xs"></div>

          {/* Top Instruction Pill */}
          <div className="z-10 text-center space-y-0.5 bg-slate-950/80 px-4 py-2 rounded-2xl border border-slate-700/80 backdrop-blur-md shadow-md max-w-[92%]">
            <p className="text-xs font-bold text-white tracking-wide">
              {capturedPages.length > 0
                ? `Page ${capturedPages.length + 1}: Place document in frame & snap`
                : "Place the document inside the frame"}
            </p>
            <p className="text-[11px] font-medium text-teal-300">
              दस्तावेज़ को फ्रेम के अंदर रखें और फोटो लें
            </p>
          </div>

          {/* Floating Live Toast Feedback */}
          {feedbackToast && (
            <div className="z-20 bg-emerald-950/90 text-emerald-200 border border-emerald-500/60 px-4 py-2 rounded-full text-xs font-bold shadow-lg backdrop-blur-md flex items-center gap-1.5 animate-bounce">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{feedbackToast}</span>
            </div>
          )}

          {/* Bottom Status Tag */}
          <div className="z-10 bg-slate-950/70 backdrop-blur-md text-emerald-300 text-xs font-bold px-3 py-1 rounded-full border border-emerald-600/40 flex items-center gap-1.5 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>
              {capturedPages.length > 0
                ? `${capturedPages.length} item${capturedPages.length > 1 ? "s" : ""} captured · Ready for next click`
                : "Live scanner active ✓"}
            </span>
          </div>
        </div>

        {/* -------------------------------------------------------------
            CAPTURED PAGES THUMBNAIL GALLERY TRAY
        -------------------------------------------------------------- */}
        {capturedPages.length > 0 && (
          <div className="w-full bg-white rounded-2xl p-3 border border-slate-200/90 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-xs px-1">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-teal-700 font-black" />
                <span>Captured Pages ({capturedPages.length})</span>
              </span>
              <span className="text-[11px] text-teal-800 font-semibold">
                Click shutter again to add more
              </span>
            </div>

            {/* Horizontal thumbnail scroll */}
            <div className="flex items-center gap-2.5 overflow-x-auto pb-1 pt-0.5 no-scrollbar">
              {capturedPages.map((page, idx) => (
                <div
                  key={page.id || idx}
                  className="relative shrink-0 w-16 h-20 rounded-xl overflow-hidden border-2 border-teal-500 bg-slate-100 shadow-xs group"
                >
                  {page.dataUrl ? (
                    <img
                      src={page.dataUrl}
                      alt={`Page ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-1 text-slate-400 bg-slate-50">
                      <FileText className="w-6 h-6 text-teal-700" />
                    </div>
                  )}

                  {/* Page number badge */}
                  <span className="absolute bottom-1 left-1 bg-slate-900/80 text-white text-[9px] font-black px-1.5 py-0.2 rounded">
                    #{idx + 1}
                  </span>

                  {/* Delete button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemovePage(page.id);
                    }}
                    title="Remove this page"
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-sm hover:bg-rose-700 active:scale-90 transition cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}

              {/* Add more photo card */}
              <button
                type="button"
                onClick={handleCaptureClick}
                className="shrink-0 w-16 h-20 rounded-xl border-2 border-dashed border-teal-300 hover:border-teal-500 bg-teal-50/50 hover:bg-teal-50 flex flex-col items-center justify-center gap-1 text-teal-800 transition active:scale-95 cursor-pointer"
              >
                <Plus className="w-5 h-5 text-teal-700" />
                <span className="text-[10px] font-bold">Add Click</span>
              </button>
            </div>
          </div>
        )}

        {/* Secondary Upload Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap justify-center w-full">
          {!cameraActive && (
            <button
              type="button"
              onClick={startCamera}
              className="flex items-center gap-1.5 text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 px-4 py-2 rounded-full border border-teal-200 transition active:scale-95 cursor-pointer shadow-xs"
            >
              <Camera className="w-4 h-4 text-teal-700" />
              <span>Retry Camera</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 px-4 py-2 rounded-full border border-slate-200 transition active:scale-95 cursor-pointer shadow-xs"
          >
            <Upload className="w-4 h-4 text-teal-700" />
            <span>Upload Multiple Files (PDF/Photos)</span>
          </button>
        </div>
      </main>

      {/* Bottom Controls Bar */}
      <footer className="shrink-0 w-full px-6 pt-3 pb-safe bg-white border-t border-slate-200/90 shadow-[0_-4px_16px_rgba(0,0,0,0.03)]">
        <div className="max-w-md md:max-w-2xl lg:max-w-3xl mx-auto flex items-center justify-between gap-4 py-2">
          {/* Cancel */}
          <button
            type="button"
            onClick={prevScreen}
            className="text-sm font-bold text-slate-600 hover:text-slate-900 p-2 transition cursor-pointer"
          >
            Cancel
          </button>

          {/* Center: Large Shutter Capture Button */}
          <div className="flex flex-col items-center gap-1">
            <button
              type="button"
              onClick={handleCaptureClick}
              aria-label="Capture Photo"
              className="relative w-18 h-18 rounded-full bg-[#006666] p-1.5 shadow-md hover:bg-[#005454] transition-all active:scale-90 cursor-pointer flex items-center justify-center ring-4 ring-teal-100"
            >
              <div className="w-full h-full rounded-full border-2 border-white flex items-center justify-center text-white">
                <Camera className="w-7 h-7 text-white" />
              </div>

              {/* Number badge on shutter button */}
              {capturedPages.length > 0 && (
                <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center shadow border-2 border-white">
                  +{capturedPages.length}
                </span>
              )}
            </button>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              {capturedPages.length > 0 ? "Click to add next page" : "Snap photo"}
            </span>
          </div>

          {/* Right: Done / Review Button or Flash */}
          {capturedPages.length > 0 ? (
            <button
              type="button"
              onClick={handleProceedToReview}
              className="h-11 px-4 rounded-2xl bg-teal-800 hover:bg-teal-900 text-white font-black text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-sm"
            >
              <span>Review ({capturedPages.length})</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleToggleFlash}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 p-2 transition flex items-center gap-1 cursor-pointer"
            >
              <span>Flash</span>
              <span
                className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                  flashOn ? "bg-amber-100 text-amber-900" : "bg-slate-100 text-slate-500"
                }`}
              >
                {flashOn ? "ON" : "OFF"}
              </span>
            </button>
          )}
        </div>
      </footer>
    </div>
  );
};

export default M3_DocumentCapture;
