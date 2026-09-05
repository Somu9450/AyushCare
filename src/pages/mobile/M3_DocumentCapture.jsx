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
  FolderPlus,
  ArrowRight,
  Folder,
} from "lucide-react";
import useMobileStore, { SCREENS } from "../../store/useMobileStore";
import { useLanguage } from "../../i18n/translations";

const PRESET_SET_NAMES = [
  { title: "Blood Report", hi: "ब्लड रिपोर्ट", type: "lab_report", icon: "🩸" },
  { title: "CT Scan Report", hi: "सीटी स्कैन रिपोर्ट", type: "lab_report", icon: "🧠" },
  { title: "Doctor Prescription", hi: "डॉक्टर की पर्ची", type: "prescription", icon: "📋" },
  { title: "X-Ray / MRI Report", hi: "एक्स-रे व एमआरआई", type: "lab_report", icon: "🦴" },
  { title: "Discharge Summary", hi: "डिस्चार्ज समरी", type: "discharge_summary", icon: "🏥" },
  { title: "Lab Test / Pathology", hi: "पैथोलॉजी जांच", type: "lab_report", icon: "🔬" },
];

/**
 * M3 — DOCUMENT CAPTURE (WITH SET CLUSTERING & SINGLE-PAGE RETAKE)
 * Supports:
 * - Live camera feed with multi-click continuous shooting
 * - Multi-file local upload (images and PDFs)
 * - Document Clustering: organize pages into named sets (e.g. Blood Report 3p, CT Scan 4p)
 * - Switch active set or create new document set on the fly
 * - Dedicated "Retake Particular Image" mode: seamlessly replaces one specific image
 * - Mobile torch/flash hardware toggle
 */
export const M3_DocumentCapture = () => {
  const {
    documentSets,
    activeSetId,
    setActiveSetId,
    createDocumentSet,
    addPageToSet,
    replacePageInSet,
    removePageFromSet,
    retargetPageForRetake,
    setRetargetPageForRetake,
    setCapturedDocuments,
    setCapturedDocument,
    setScreen,
    selectedDocumentType,
  } = useMobileStore();
  const { isHindi } = useLanguage();

  const [flashOn, setFlashOn] = useState(false);
  const [torchSupported, setTorchSupported] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [shutterFlashing, setShutterFlashing] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState(null);
  const [showNewSetModal, setShowNewSetModal] = useState(false);
  const [newSetName, setNewSetName] = useState("");
  const [newSetType, setNewSetType] = useState("lab_report");

  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const streamRef = useRef(null);
  const toastTimeoutRef = useRef(null);

  // Active set
  const currentSet =
    documentSets.find((s) => s.id === activeSetId) ||
    documentSets[0] || {
      id: "set_default",
      title: "Prescription / OPD Slip",
      pages: [],
    };

  const currentSetPages = currentSet.pages || [];
  const totalPagesAcrossAllSets = documentSets.reduce((acc, s) => acc + (s.pages?.length || 0), 0);

  // Shutter audio feedback
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
      // Audio context might be restricted before user gesture
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

  // Capture frame from camera
  const captureFrameDataUrl = () => {
    if (cameraActive && videoRef.current) {
      try {
        const video = videoRef.current;
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth || 1280;
        canvas.height = video.videoHeight || 720;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL("image/jpeg", 0.92);
      } catch (canvasErr) {
        console.warn("Canvas capture error:", canvasErr);
      }
    }
    return null;
  };

  // MULTIPLE CAMERA CLICKS & RETAKE HANDLER
  const handleCaptureClick = () => {
    setShutterFlashing(true);
    playShutterSound();
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(50);
    }
    setTimeout(() => setShutterFlashing(false), 160);

    const capturedDataUrl = captureFrameDataUrl();
    const now = new Date();
    const formattedDate = now.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    // Case 1: Retaking a particular image
    if (retargetPageForRetake) {
      const { setId, pageId, pageIndex, parentSetTitle } = retargetPageForRetake;
      const updatedPage = {
        fileName: `${parentSetTitle || "Page"}_${pageIndex + 1}_retaken.jpg`,
        date: formattedDate,
        sourceLabel: cameraActive
          ? `Live Retake · Page ${pageIndex + 1}`
          : `Retaken Page ${pageIndex + 1}`,
        fileSize: "1.4 MB",
        dataUrl: capturedDataUrl,
        capturedVia: cameraActive ? "LIVE_CAMERA_RETAKE" : "RETAKE_SIMULATION",
      };

      replacePageInSet(setId, pageId, updatedPage);
      showToast(`Page #${pageIndex + 1} retaken successfully!`);
      setTimeout(() => {
        setScreen(SCREENS.M4);
      }, 500);
      return;
    }

    // Case 2: Standard capture into current active set
    const nextIndex = currentSetPages.length + 1;
    const newPage = {
      id: `capture_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      fileName: `${currentSet.title || "Doc"}_Page_${nextIndex}.jpg`,
      date: formattedDate,
      sourceLabel: cameraActive
        ? `Live Camera Capture · Page ${nextIndex}`
        : `Scanned Document · Page ${nextIndex}`,
      fileSize: "1.4 MB",
      dataUrl: capturedDataUrl,
      capturedVia: cameraActive ? "LIVE_CAMERA" : "SCANNER_SIMULATION",
      parentSetId: currentSet.id,
      parentSetTitle: currentSet.title,
    };

    addPageToSet(currentSet.id, newPage);
    showToast(`Added Page #${nextIndex} to ${currentSet.title}!`);
  };

  // MULTIPLE FILE UPLOAD HANDLER
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const now = new Date();
    const formattedDate = now.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    // If retaking a specific image with a file:
    if (retargetPageForRetake) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const { setId, pageId, pageIndex } = retargetPageForRetake;
        replacePageInSet(setId, pageId, {
          fileName: file.name,
          date: formattedDate,
          sourceLabel: `Uploaded File · ${file.name}`,
          dataUrl: event.target?.result,
          fileSize: file.size ? `${(file.size / 1024).toFixed(1)} KB` : "1.2 MB",
          capturedVia: "LOCAL_UPLOAD_RETAKE",
        });
        showToast(`Page #${pageIndex + 1} replaced with uploaded file!`);
        setTimeout(() => setScreen(SCREENS.M4), 400);
      };
      reader.readAsDataURL(file);
      e.target.value = "";
      return;
    }

    // Otherwise upload files into active set
    const startIndex = currentSetPages.length;
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
            parentSetId: currentSet.id,
            parentSetTitle: currentSet.title,
          });
        };
        reader.readAsDataURL(file);
      });
    });

    const newUploadedPages = await Promise.all(readPromises);
    newUploadedPages.forEach((page) => {
      addPageToSet(currentSet.id, page);
    });

    showToast(`${files.length} document${files.length > 1 ? "s" : ""} added to ${currentSet.title}!`);
    e.target.value = "";
  };

  // Create new document set handler
  const handleCreateSetSubmit = (e) => {
    e.preventDefault();
    const title = newSetName.trim() || `Report Set ${documentSets.length + 1}`;
    createDocumentSet(title, newSetType);
    setShowNewSetModal(false);
    setNewSetName("");
    showToast(`Created set: "${title}"`);
  };

  const handleCreatePreset = (preset) => {
    createDocumentSet(preset.title, preset.type);
    setShowNewSetModal(false);
    showToast(`Created set: "${preset.title}"`);
  };

  // Proceed to review screen
  const handleProceedToReview = () => {
    if (totalPagesAcrossAllSets === 0) {
      handleCaptureClick();
      return;
    }

    const allPages = documentSets.flatMap((s) => s.pages);
    setCapturedDocuments(allPages);
    if (allPages.length > 0) {
      setCapturedDocument(allPages[0]);
    }
    setScreen(SCREENS.M4);
  };

  return (
    <div className="min-h-full flex flex-col justify-between bg-slate-50 text-slate-900 select-none">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple={!retargetPageForRetake}
        accept="image/*,application/pdf"
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* Top Header Bar */}
      <header className="px-4 py-3 bg-white border-b border-slate-200 shadow-2xs z-20">
        <div className="flex items-center justify-between gap-2 max-w-lg mx-auto">
          <button
            type="button"
            onClick={() => {
              if (retargetPageForRetake) {
                setRetargetPageForRetake(null);
                setScreen(SCREENS.M4);
              } else {
                setScreen(SCREENS.M1);
              }
            }}
            className="p-2 -ml-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="text-center">
            <h1 className="text-xs font-black uppercase tracking-wider text-teal-800">
              {retargetPageForRetake
                ? (isHindi ? "पृष्ठ पुनः फोटो मोड" : "Retake Page Mode")
                : (isHindi ? "स्वास्थ्य दस्तावेज़ फोटो" : "Capture Health Documents")}
            </h1>
            <p className="text-[11px] text-slate-500 font-medium">
              {retargetPageForRetake
                ? (isHindi
                    ? `${retargetPageForRetake.pageTitle || `पृष्ठ #${retargetPageForRetake.pageIndex + 1}`} की पुनः फोटो`
                    : `Retaking ${retargetPageForRetake.pageTitle || `Page #${retargetPageForRetake.pageIndex + 1}`}`)
                : (isHindi
                    ? `${documentSets.length} सेट में कुल ${totalPagesAcrossAllSets} पृष्ठ कैप्चर किए गए`
                    : `${totalPagesAcrossAllSets} total pages captured in ${documentSets.length} set${documentSets.length > 1 ? "s" : ""}`)}
            </p>
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 -mr-2 rounded-xl text-teal-800 hover:bg-teal-50 transition cursor-pointer flex items-center gap-1 font-bold text-xs"
            title={isHindi ? "फाइलें अपलोड करें" : "Upload files from storage"}
          >
            <Upload className="w-4 h-4" />
            <span className="hidden xs:inline">{isHindi ? "अपलोड" : "Upload"}</span>
          </button>
        </div>

        {/* Retake Page Alert Banner */}
        {retargetPageForRetake && (
          <div className="mt-2 p-2.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between gap-2 max-w-lg mx-auto animate-fade-in">
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-amber-700 shrink-0" />
              <div>
                <p className="font-bold">
                  {isHindi
                    ? `पृष्ठ #${retargetPageForRetake.pageIndex + 1} की पुनः फोटो ली जा रही है`
                    : `Retaking Page #${retargetPageForRetake.pageIndex + 1}`}
                </p>
                <p className="text-[11px] text-amber-800">
                  {isHindi ? "संबंधित सेट: " : "Belongs to: "}
                  <strong>{retargetPageForRetake.parentSetTitle}</strong>
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setRetargetPageForRetake(null);
                setScreen(SCREENS.M4);
              }}
              className="px-2.5 py-1 rounded-xl bg-white border border-amber-300 text-amber-900 font-bold text-[11px] hover:bg-amber-100 transition cursor-pointer shrink-0"
            >
              {isHindi ? "रद्द करें" : "Cancel Retake"}
            </button>
          </div>
        )}

        {/* Document Sets / Cluster Selector Tabs (When not retaking) */}
        {!retargetPageForRetake && (
          <div className="mt-2 pt-2 border-t border-slate-100 max-w-lg mx-auto">
            <div className="flex items-center justify-between mb-1 text-[11px]">
              <span className="font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-teal-700" />
                <span>{isHindi ? "दस्तावेज़ सेट व समूह" : "Document Sets & Clusters"}</span>
              </span>
              <button
                type="button"
                onClick={() => setShowNewSetModal(true)}
                className="font-bold text-teal-700 hover:text-teal-900 flex items-center gap-0.5 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>{isHindi ? "+ नया रिपोर्ट सेट" : "+ New Report Set"}</span>
              </button>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              {documentSets.map((s) => {
                const isSelected = s.id === activeSetId;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setActiveSetId(s.id)}
                    className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                      isSelected
                        ? "bg-teal-800 text-white border-teal-900 shadow-xs"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
                    }`}
                  >
                    <span>
                      {isHindi
                        ? (s.title?.includes("Prescription") ? "डॉक्टर का पर्चा" : s.title?.includes("Blood") ? "रक्त जांच रिपोर्ट" : s.title?.includes("CT") ? "सीटी स्कैन रिपोर्ट" : s.title)
                        : s.title}
                    </span>
                    <span
                      className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
                        isSelected ? "bg-white/20 text-white" : "bg-white text-slate-600 border border-slate-200"
                      }`}
                    >
                      {s.pages?.length || 0}{isHindi ? "पृ" : "p"}
                    </span>
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => setShowNewSetModal(true)}
                className="shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold text-teal-800 border-2 border-dashed border-teal-300 hover:border-teal-600 hover:bg-teal-50 transition flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-teal-700" />
                <span>{isHindi ? "सेट जोड़ें" : "Add Set"}</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Viewport */}
      <main className="flex-1 flex flex-col items-center justify-between p-3 sm:p-4 max-w-lg mx-auto w-full relative">
        {/* Shutter flash animation overlay */}
        {shutterFlashing && (
          <div className="absolute inset-0 bg-white z-40 animate-out fade-out duration-150 pointer-events-none"></div>
        )}

        {/* Temporary toast notification */}
        {feedbackToast && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 text-white px-4 py-2 rounded-2xl text-xs font-bold shadow-xl border border-white/20 flex items-center gap-2 animate-fade-in backdrop-blur-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{feedbackToast}</span>
          </div>
        )}

        {/* Live Camera Viewfinder Card */}
        <div className="relative w-full aspect-[3/4] max-h-[50vh] sm:max-h-[56vh] bg-slate-900 rounded-3xl overflow-hidden shadow-md flex items-center justify-center border-4 border-slate-800">
          {/* Live Video Feed */}
          <video
            ref={videoRef}
            playsInline
            muted
            autoPlay
            className={`w-full h-full object-cover ${cameraActive ? "block" : "hidden"}`}
          />

          {/* Camera Access Fallback Simulation */}
          {!cameraActive && (
            <div className="flex flex-col items-center justify-center p-6 text-center text-slate-400 space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-teal-400">
                <Camera className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-200">
                  {cameraError ? "Camera Access Restricted" : "Initializing Camera Feed..."}
                </p>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  {cameraError || "Point camera at document to take multi-page snaps."}
                </p>
              </div>
              <button
                type="button"
                onClick={startCamera}
                className="px-3 py-1.5 rounded-xl bg-teal-800 hover:bg-teal-700 text-white font-bold text-xs transition cursor-pointer"
              >
                Retry Camera
              </button>
            </div>
          )}

          {/* Viewfinder Corner Framing Lines */}
          <div className="absolute inset-4 pointer-events-none">
            <div className="absolute top-0 left-0 w-8 h-8 border-t-3 border-l-3 border-teal-400 rounded-tl-xl"></div>
            <div className="absolute top-0 right-0 w-8 h-8 border-t-3 border-r-3 border-teal-400 rounded-tr-xl"></div>
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-3 border-l-3 border-teal-400 rounded-bl-xl"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-3 border-r-3 border-teal-400 rounded-br-xl"></div>
          </div>

          {/* Active Set Overlay Watermark */}
          <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/20 flex items-center gap-1.5 shadow-sm">
            <Folder className="w-3 h-3 text-teal-300" />
            <span>Target: {currentSet.title}</span>
            <span className="text-teal-300">({currentSetPages.length} pages)</span>
          </div>

          {/* Flash / Torch Toggle Button */}
          {torchSupported && (
            <button
              type="button"
              onClick={handleToggleFlash}
              className={`absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center transition cursor-pointer shadow-md ${
                flashOn ? "bg-amber-400 text-slate-900" : "bg-slate-900/80 text-white"
              }`}
            >
              {flashOn ? <Zap className="w-5 h-5" /> : <ZapOff className="w-5 h-5" />}
            </button>
          )}
        </div>

        {/* Camera Controls Bar: Gallery Preview, Shutter Button, Upload Trigger */}
        <div className="w-full pt-3 pb-1 flex items-center justify-around gap-3">
          {/* Upload Shortcut */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-14 h-14 rounded-2xl bg-white hover:bg-slate-100 border border-slate-200 shadow-sm flex flex-col items-center justify-center text-teal-800 transition active:scale-95 cursor-pointer"
            title={isHindi ? "फोटो या दस्तावेज़ अपलोड करें" : "Upload photo / document"}
          >
            <Upload className="w-5 h-5" />
            <span className="text-[9px] font-bold mt-0.5">{isHindi ? "अपलोड" : "Upload"}</span>
          </button>

          {/* Main Shutter Capture Button */}
          <div className="relative">
            <button
              type="button"
              onClick={handleCaptureClick}
              className="w-20 h-20 rounded-full bg-teal-800 hover:bg-teal-900 text-white border-4 border-white shadow-xl flex items-center justify-center transition active:scale-90 cursor-pointer group"
              title={retargetPageForRetake ? (isHindi ? "पुनः फोटो लें" : "Retake page") : (isHindi ? "फोटो खींचें" : "Snap photo")}
            >
              <div className="w-16 h-16 rounded-full border-2 border-teal-400/50 flex items-center justify-center group-hover:bg-teal-700/50 transition">
                {retargetPageForRetake ? (
                  <RotateCcw className="w-7 h-7 text-white animate-spin-once" />
                ) : (
                  <Camera className="w-7 h-7 text-white" />
                )}
              </div>
            </button>

            {/* Counter Badge on Shutter */}
            {currentSetPages.length > 0 && !retargetPageForRetake && (
              <span className="absolute -top-1 -right-1 bg-amber-500 text-white font-black text-[10px] w-6 h-6 rounded-full flex items-center justify-center shadow-sm border-2 border-white">
                {currentSetPages.length}
              </span>
            )}
          </div>

          {/* Review Direct Action Button */}
          <button
            type="button"
            onClick={handleProceedToReview}
            disabled={totalPagesAcrossAllSets === 0}
            className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center transition active:scale-95 cursor-pointer shadow-sm ${
              totalPagesAcrossAllSets > 0
                ? "bg-teal-800 hover:bg-teal-900 text-white border border-teal-900"
                : "bg-slate-200 text-slate-400 border border-slate-200 cursor-not-allowed"
            }`}
            title={isHindi ? "दस्तावेज़ों की समीक्षा करें" : "Review documents"}
          >
            <ChevronRight className="w-5 h-5" />
            <span className="text-[9px] font-bold mt-0.5">{isHindi ? "समीक्षा" : "Review"}</span>
          </button>
        </div>

        {/* Current Set Thumbnail Filmstrip Tray */}
        {currentSetPages.length > 0 && (
          <div className="w-full mt-2 p-2 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between text-[11px] mb-1.5 px-1">
              <span className="font-bold text-slate-700">
                {isHindi
                  ? `"${currentSet.title}" में पृष्ठ: ${currentSetPages.length}`
                  : `Pages in "${currentSet.title}": ${currentSetPages.length}`}
              </span>
              <button
                type="button"
                onClick={handleProceedToReview}
                className="font-bold text-teal-800 hover:text-teal-950 flex items-center gap-0.5"
              >
                <span>{isHindi ? `सभी समीक्षा करें (${totalPagesAcrossAllSets})` : `Review All (${totalPagesAcrossAllSets})`}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
              {currentSetPages.map((page, idx) => (
                <div
                  key={page.id || idx}
                  className="relative shrink-0 w-12 h-16 rounded-xl overflow-hidden border border-slate-300 bg-slate-100 shadow-2xs group"
                >
                  {page.dataUrl ? (
                    <img
                      src={page.dataUrl}
                      alt={`Page ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <FileText className="w-5 h-5 text-teal-700" />
                    </div>
                  )}

                  <span className="absolute bottom-0.5 left-0.5 bg-slate-900/80 text-white text-[8px] font-black px-1 rounded">
                    #{idx + 1}
                  </span>

                  <button
                    type="button"
                    onClick={() => removePageFromSet(currentSet.id, page.id)}
                    className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-rose-600 text-white flex items-center justify-center hover:bg-rose-700 transition"
                    title="Remove page"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={handleCaptureClick}
                className="shrink-0 w-12 h-16 rounded-xl border-2 border-dashed border-teal-300 hover:border-teal-600 bg-teal-50/50 flex flex-col items-center justify-center text-teal-800 transition cursor-pointer"
                title="Snap next page"
              >
                <Plus className="w-4 h-4 text-teal-700" />
                <span className="text-[8px] font-bold">Snap</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* New Document Set Modal */}
      {showNewSetModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
        >
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl space-y-4 border border-slate-200 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-teal-700" />
                <h3 className="text-base font-black text-slate-900">
                  {isHindi ? "दस्तावेज़ सेट बनाएं" : "Create Document Set"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowNewSetModal(false)}
                className="p-1 rounded-xl hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              {isHindi
                ? "संबंधित पृष्ठों को एक समूह में रखें (जैसे 3-पृष्ठों की ब्लड रिपोर्ट या 4-पृष्ठों का सीटी स्कैन)।"
                : "Group related pages together (e.g. 3-page Blood Report or 4-page CT Scan)."}
            </p>

            {/* Quick Presets */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                {isHindi ? "त्वरित श्रेणी विकल्प" : "Quick Category Presets"}
              </span>
              <div className="grid grid-cols-2 gap-2">
                {PRESET_SET_NAMES.map((preset) => (
                  <button
                    key={preset.title}
                    type="button"
                    onClick={() => handleCreatePreset({ ...preset, title: isHindi ? (preset.hi || preset.title) : preset.title })}
                    className="p-2 rounded-xl bg-slate-50 hover:bg-teal-50 border border-slate-200 text-left text-xs font-bold text-slate-800 transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>{preset.icon}</span>
                    <span className="truncate">{isHindi ? (preset.hi || preset.title) : preset.title}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Name Form */}
            <form onSubmit={handleCreateSetSubmit} className="space-y-3 pt-2 border-t border-slate-100">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-600">
                  {isHindi ? "कस्टम सेट का नाम" : "Custom Set Title"}
                </label>
                <input
                  type="text"
                  placeholder={isHindi ? "उदा. अल्ट्रासाउंड एब्डोमेन 2026" : "e.g. Ultrasound Abdomen 2026"}
                  value={newSetName}
                  onChange={(e) => setNewSetName(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 outline-none focus:border-teal-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowNewSetModal(false)}
                  className="h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
                >
                  {isHindi ? "रद्द करें" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="h-10 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs transition cursor-pointer shadow-xs"
                >
                  {isHindi ? "बनाएं और चुनें" : "Create & Select"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default M3_DocumentCapture;
