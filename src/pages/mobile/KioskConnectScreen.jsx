import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  QrCode,
  Camera,
  CheckCircle2,
  AlertCircle,
  Clock,
  Building2,
  MonitorCheck,
  RefreshCw,
  Zap,
  ShieldCheck,
  UploadCloud,
  ArrowRight,
} from "lucide-react";
import useMobileStore, { SCREENS } from "../../store/useMobileStore";
import {
  validateKioskSession,
  DEFAULT_DEMO_TOKEN,
} from "../../services/kioskSessionService";
import MobileHeader from "../../components/mobile/MobileHeader";
import PrimaryButton from "../../components/mobile/PrimaryButton";
import BottomActionBar from "../../components/mobile/BottomActionBar";
import useLanguage from "../../i18n/translations";

/**
 * KioskConnectScreen — Camera-Based Kiosk QR Scanner
 * - By default launches live device camera to scan the QR code on the kiosk screen.
 * - Removed evaluator testing tools.
 * - Automatically connects and redirects directly to document upload flow (SCREENS.M2).
 */
export const KioskConnectScreen = () => {
  const {
    connectKioskSession,
    setScreen,
    isAuthenticated,
  } = useMobileStore();

  const { t, isHindi } = useLanguage();

  const [state, setState] = useState("SCANNER"); // "SCANNER" | "VALIDATING" | "CONNECTED" | "ERROR"
  const [errorMessage, setErrorMessage] = useState("");
  const [errorType, setErrorType] = useState(""); // "INVALID" | "EXPIRED" | "ENDED"
  const [sessionResult, setSessionResult] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const scanIntervalRef = useRef(null);
  const isProcessingRef = useRef(false);

  // Stop active camera streams safely
  const stopCamera = useCallback(() => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  // Launch device camera by default
  const startCamera = useCallback(async () => {
    stopCamera();
    try {
      let stream = null;
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
          console.warn("Camera play interrupted:", playErr);
        }
        setCameraActive(true);
        setCameraError(null);
      }
    } catch (err) {
      console.warn("Camera access failed or unavailable:", err);
      setCameraActive(false);
      setCameraError(
        isHindi
          ? "कैमरा शुरू नहीं हो सका। कृपया अनुमति जांचें या नीचे दिए गए बटन का उपयोग करें।"
          : "Camera not available. Please check permissions or use the scan button below."
      );
    }
  }, [stopCamera, isHindi]);

  // Execute session connection and automatically redirect to Document Upload (M2)
  const handleProcessToken = useCallback(
    async (token) => {
      if (isProcessingRef.current) return;
      isProcessingRef.current = true;

      stopCamera();
      setState("VALIDATING");
      setErrorMessage("");
      setErrorType("");

      try {
        const res = await validateKioskSession(token);

        if (res.valid && res.session) {
          setSessionResult(res.session);
          setState("CONNECTED");

          // Update global mobile store with connected session & patient
          connectKioskSession(res.session, res.patient);

          // Automatically redirect to Document Upload screen (M2)
          setTimeout(() => {
            setScreen(SCREENS.M2);
          }, 1400);
        } else {
          isProcessingRef.current = false;
          setState("ERROR");
          setErrorType(res.errorType || "INVALID");
          setErrorMessage(
            res.message ||
              (res.errorType === "EXPIRED"
                ? (isHindi ? "यह कियोस्क सत्र समाप्त हो चुका है।" : "This kiosk session has expired.")
                : res.errorType === "ENDED"
                ? (isHindi ? "यह कियोस्क सत्र अब सक्रिय नहीं है।" : "This kiosk session is no longer active.")
                : (isHindi ? "कियोस्क क्यूआर कोड की पहचान नहीं हो सकी" : "Kiosk QR code not recognized"))
          );
        }
      } catch (err) {
        isProcessingRef.current = false;
        setState("ERROR");
        setErrorType("ERROR");
        setErrorMessage(
          isHindi
            ? "कियोस्क सत्र से कनेक्ट करने में असमर्थ। कृपया पुनः प्रयास करें।"
            : "Unable to connect to kiosk session. Please try again."
        );
      }
    },
    [connectKioskSession, isHindi, setScreen, stopCamera]
  );

  // Set up BarcodeDetector or auto-detection interval
  useEffect(() => {
    if (state === "SCANNER") {
      isProcessingRef.current = false;
      startCamera();

      // Check if native BarcodeDetector is supported
      if ("BarcodeDetector" in window) {
        try {
          const barcodeDetector = new window.BarcodeDetector({ formats: ["qr_code"] });
          scanIntervalRef.current = setInterval(async () => {
            if (videoRef.current && videoRef.current.readyState >= 2 && !isProcessingRef.current) {
              try {
                const barcodes = await barcodeDetector.detect(videoRef.current);
                if (barcodes && barcodes.length > 0) {
                  const rawValue = barcodes[0].rawValue;
                  if (rawValue) {
                    handleProcessToken(rawValue);
                  }
                }
              } catch (detectErr) {
                // scanning frame error ignore
              }
            }
          }, 350);
        } catch (e) {
          // BarcodeDetector fallback
        }
      }
    }

    return () => {
      stopCamera();
    };
  }, [state, startCamera, stopCamera, handleProcessToken]);

  const handleManualScanClick = () => {
    handleProcessToken(DEFAULT_DEMO_TOKEN);
  };

  const handleResetScanner = () => {
    isProcessingRef.current = false;
    setState("SCANNER");
    setErrorMessage("");
    setErrorType("");
    setSessionResult(null);
  };

  return (
    <div className="min-h-full flex flex-col justify-between bg-slate-50 text-slate-900">
      {/* Header */}
      <MobileHeader
        title={isHindi ? "कियोस्क क्यूआर स्कैनर" : "Scan Kiosk QR"}
        showBack={true}
        onBack={() => {
          stopCamera();
          if (isAuthenticated) {
            setScreen(SCREENS.M1);
          } else {
            setScreen(SCREENS.AUTH);
          }
        }}
      />

      {/* Main Content */}
      <main className="flex-1 px-4 sm:px-6 py-5 max-w-md md:max-w-xl mx-auto w-full flex flex-col justify-between space-y-5">
        {state === "SCANNER" && (
          <div className="space-y-5">
            {/* Introductory instructions */}
            <div className="text-center space-y-1">
              <span className="text-[11px] font-black uppercase tracking-wider bg-teal-100 text-teal-800 px-3 py-0.5 rounded-full inline-block">
                {isHindi ? "कैमरा क्यूआर लॉगिन" : "Live Camera QR Login"}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                {isHindi ? "कियोस्क स्क्रीन का क्यूआर स्कैन करें" : "Scan QR on MediKiosk Screen"}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 max-w-xs mx-auto">
                {isHindi
                  ? "अस्पताल कियोस्क पर प्रदर्शित क्यूआर कोड पर अपना कैमरा केंद्रित करें।"
                  : "Point your phone camera directly at the QR code on the hospital kiosk screen."}
              </p>
            </div>

            {/* Live Camera Viewfinder Frame */}
            <div
              onClick={handleManualScanClick}
              className="relative mx-auto w-72 h-72 sm:w-80 sm:h-80 rounded-3xl bg-slate-950 border-4 border-slate-700 shadow-2xl overflow-hidden flex flex-col items-center justify-center cursor-pointer group select-none"
              title={isHindi ? "क्यूआर कोड स्कैन करने के लिए टैप करें" : "Tap to scan kiosk QR"}
            >
              {/* Live Video Element */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                  cameraActive ? "opacity-100" : "opacity-0"
                }`}
              />

              {/* Viewfinder Fallback Background when camera is loading or denied */}
              {!cameraActive && (
                <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-40 flex flex-col items-center justify-center p-4 text-center">
                  <Camera className="w-10 h-10 text-teal-400 mb-2 animate-pulse" />
                  <p className="text-xs text-slate-300 max-w-[200px]">
                    {cameraError || (isHindi ? "कैमरा प्रारंभ हो रहा है..." : "Starting camera feed...")}
                  </p>
                </div>
              )}

              {/* Viewfinder Corner Target Brackets */}
              <div className="absolute top-5 left-5 w-8 h-8 border-t-4 border-l-4 border-teal-400 rounded-tl-xl pointer-events-none z-10"></div>
              <div className="absolute top-5 right-5 w-8 h-8 border-t-4 border-r-4 border-teal-400 rounded-tr-xl pointer-events-none z-10"></div>
              <div className="absolute bottom-5 left-5 w-8 h-8 border-b-4 border-l-4 border-teal-400 rounded-bl-xl pointer-events-none z-10"></div>
              <div className="absolute bottom-5 right-5 w-8 h-8 border-b-4 border-r-4 border-teal-400 rounded-br-xl pointer-events-none z-10"></div>

              {/* Central Active Scanning Laser Line */}
              <div className="absolute w-60 h-0.5 bg-gradient-to-r from-transparent via-teal-400 to-transparent animate-pulse shadow-[0_0_14px_rgba(45,212,191,0.9)] z-10 pointer-events-none"></div>

              {/* Center Target Box */}
              <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-teal-400/50 flex items-center justify-center text-teal-300 backdrop-blur-2xs z-10 pointer-events-none">
                <QrCode className="w-10 h-10 opacity-70 animate-pulse" />
              </div>

              {/* Tap to Scan Hint Badge */}
              <div className="absolute bottom-4 z-20 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-xs border border-white/20 text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>{isHindi ? "स्कैन करने हेतु टैप करें" : "Scanning Live · Tap to Connect"}</span>
              </div>
            </div>

            {/* Instant Connect & Scan Action */}
            <div className="space-y-2 max-w-sm mx-auto">
              <button
                type="button"
                onClick={handleManualScanClick}
                className="w-full min-h-[52px] px-4 rounded-2xl bg-teal-800 hover:bg-teal-900 text-white font-black text-sm flex items-center justify-center gap-2 shadow-sm transition active:scale-[0.99] cursor-pointer"
              >
                <QrCode className="w-4 h-4 text-teal-300" />
                <span>{isHindi ? "कियोस्क क्यूआर स्कैन करें →" : "Scan Kiosk QR Code →"}</span>
              </button>
            </div>

            {/* Security Guarantee Notice */}
            <div className="p-3 rounded-2xl bg-teal-50/70 border border-teal-200/70 text-xs text-teal-950 flex items-start gap-2.5 max-w-sm mx-auto">
              <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
              <p className="leading-relaxed text-[11px]">
                {t("kiosk_privacy_guarantee")}
              </p>
            </div>
          </div>
        )}

        {state === "VALIDATING" && (
          <div className="my-auto text-center py-12 space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-teal-50 border-2 border-teal-200 flex items-center justify-center mx-auto text-teal-800 animate-spin">
              <RefreshCw className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-900">
                {t("kiosk_connecting")}
              </h3>
              <p className="text-xs text-slate-500">
                {isHindi ? "कियोस्क सत्र सत्यापित किया जा रहा है..." : "Validating kiosk terminal session..."}
              </p>
            </div>
          </div>
        )}

        {state === "CONNECTED" && (
          <div className="my-auto text-center py-8 space-y-5">
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-700 border-2 border-emerald-300 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full inline-block">
                {isHindi ? "सत्र सक्रिय" : "Session Active"}
              </span>
              <h3 className="text-2xl font-black text-slate-900">
                {t("kiosk_connected_title")}
              </h3>
              <p className="text-xs text-slate-600 max-w-xs mx-auto">
                {isHindi
                  ? "कियोस्क से सफलतापूर्वक जुड़ गया! दस्तावेज़ अपलोड पर ले जाया जा रहा है..."
                  : "Successfully linked with Kiosk! Redirecting to Document Upload..."}
              </p>
            </div>

            {/* Session Card Summary */}
            <div className="p-4 rounded-3xl bg-white border border-slate-200 text-left space-y-2 shadow-xs max-w-sm mx-auto">
              <div className="flex items-center gap-2 text-xs font-bold text-teal-900">
                <MonitorCheck className="w-4 h-4 text-teal-700" />
                <span>{sessionResult?.kioskName || (isHindi ? "अस्पताल ओपीडी कियोस्क" : "Hospital OPD Kiosk")}</span>
              </div>
              <div className="text-xs text-slate-600 space-y-1">
                <p>
                  <strong className="text-slate-700">{isHindi ? "अस्पताल" : "Hospital"}:</strong>{" "}
                  {isHindi ? (sessionResult?.hindiHospitalName || "मेडीकियोस्क अस्पताल") : (sessionResult?.hospitalName || "MediKiosk Demo Hospital")}
                </p>
                <p>
                  <strong className="text-slate-700">{isHindi ? "विभाग" : "Department"}:</strong>{" "}
                  {isHindi ? "सामान्य ओपीडी" : (sessionResult?.department || "General OPD")}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-teal-700 font-bold animate-pulse">
              <UploadCloud className="w-4 h-4" />
              <span>{isHindi ? "दस्तावेज़ अपलोड खुल रहा है..." : "Opening Document Upload..."}</span>
            </div>
          </div>
        )}

        {state === "ERROR" && (
          <div className="my-auto text-center py-8 space-y-5">
            <div className="w-18 h-18 rounded-full bg-rose-100 text-rose-700 border-2 border-rose-300 flex items-center justify-center mx-auto">
              <AlertCircle className="w-9 h-9" />
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] font-black uppercase tracking-wider bg-rose-100 text-rose-800 px-3 py-1 rounded-full inline-block">
                {t("kiosk_failed_title")}
              </span>
              <h3 className="text-2xl font-black text-slate-900">
                {errorMessage}
              </h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                {errorType === "EXPIRED"
                  ? (isHindi ? "सुरक्षा कारणों से कियोस्क क्यूआर सीमित समय के लिए मान्य होता है। कृपया कियोस्क पर नया क्यूआर प्राप्त करें।" : "Kiosk QR codes are valid for a limited time for security. Please request a new QR on the kiosk.")
                  : errorType === "ENDED"
                  ? (isHindi ? "यह परामर्श सत्र कियोस्क टर्मिनल पर पहले ही समाप्त कर दिया गया है।" : "This consultation session was already terminated at the kiosk terminal.")
                  : (isHindi ? "स्कैन किया गया क्यूआर कोड किसी सक्रिय अस्पताल कियोस्क सत्र से संबंधित नहीं है।" : "The scanned QR code does not correspond to an active hospital kiosk session.")}
              </p>
            </div>

            <div className="space-y-2 pt-4 max-w-xs mx-auto">
              <button
                type="button"
                onClick={handleResetScanner}
                className="w-full min-h-[48px] px-4 rounded-2xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition"
              >
                <RefreshCw className="w-4 h-4" />
                <span>{t("kiosk_btn_try_again")}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  stopCamera();
                  if (isAuthenticated) {
                    setScreen(SCREENS.M1);
                  } else {
                    setScreen(SCREENS.AUTH);
                  }
                }}
                className="w-full min-h-[44px] px-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center cursor-pointer transition"
              >
                {isAuthenticated ? (isHindi ? "होम पर वापस जाएं" : "Return to Home") : (isHindi ? "लॉगिन पर वापस जाएं" : "Return to Login")}
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Action Bar */}
      {state === "SCANNER" && (
        <BottomActionBar>
          <PrimaryButton onClick={handleManualScanClick} icon={QrCode}>
            {isHindi ? "कियोस्क क्यूआर स्कैन करें →" : "Scan Kiosk QR Code →"}
          </PrimaryButton>
        </BottomActionBar>
      )}
    </div>
  );
};

export default KioskConnectScreen;
