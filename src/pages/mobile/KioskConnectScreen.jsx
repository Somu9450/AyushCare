import React, { useState } from "react";
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

  // Execute session connection simulation
  const handleProcessToken = async (token) => {
    setState("VALIDATING");
    setErrorMessage("");
    setErrorType("");

    try {
      const res = await validateKioskSession(token);

      if (res.valid && res.session) {
        setSessionResult(res.session);
        setState("CONNECTED");

        // Update global store
        connectKioskSession(res.session, res.patient);

        // Auto-navigate to Home after showing success badge
        setTimeout(() => {
          setScreen(SCREENS.M1);
        }, 1800);
      } else {
        setState("ERROR");
        setErrorType(res.errorType || "INVALID");
        setErrorMessage(
          res.message ||
            (res.errorType === "EXPIRED"
              ? (isHindi ? "यह कियोस्क सत्र समाप्त हो चुका है।" : "This kiosk session has expired.")
              : res.errorType === "ENDED"
              ? (isHindi ? "यह कियोस्क सत्र अब सक्रिय नहीं है।" : "This kiosk session is no longer active.")
              : (isHindi ? "क्यूआर कोड की पहचान नहीं हो सकी" : "QR code not recognized"))
        );
      }
    } catch (err) {
      setState("ERROR");
      setErrorType("ERROR");
      setErrorMessage(
        isHindi
          ? "कियोस्क सत्र से कनेक्ट करने में असमर्थ। कृपया पुनः प्रयास करें।"
          : "Unable to connect to kiosk session. Please try again."
      );
    }
  };

  const handleUseDemo = () => {
    handleProcessToken(DEFAULT_DEMO_TOKEN);
  };

  const handleTestExpired = () => {
    handleProcessToken("MK-EXPIRED-SESSION-TOKEN");
  };

  const handleTestInvalid = () => {
    handleProcessToken("INVALID_TOKEN_XYZ");
  };

  const handleResetScanner = () => {
    setState("SCANNER");
    setErrorMessage("");
    setErrorType("");
    setSessionResult(null);
  };

  return (
    <div className="min-h-full flex flex-col justify-between bg-slate-50 text-slate-900">
      {/* Header */}
      <MobileHeader
        title={t("kiosk_connect_title")}
        showBack={true}
        onBack={() => {
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
              <span className="text-[11px] font-black uppercase tracking-wider bg-teal-100 text-teal-800 px-2.5 py-0.5 rounded-full inline-block">
                {isHindi ? "कियोस्क क्यूआर ऑटो-कनेक्ट" : "Kiosk QR Auto-Connect"}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                {t("kiosk_scan_heading")}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 max-w-xs mx-auto">
                {t("kiosk_scan_sub")}
              </p>
            </div>

            {/* Simulated Camera Viewfinder */}
            <div className="relative mx-auto w-64 h-64 sm:w-72 sm:h-72 rounded-3xl bg-slate-900 border-4 border-slate-700 shadow-xl overflow-hidden flex flex-col items-center justify-center p-4">
              <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>

              {/* Viewfinder Corner Brackets */}
              <div className="absolute top-4 left-4 w-7 h-7 border-t-3 border-l-3 border-teal-400 rounded-tl-xl"></div>
              <div className="absolute top-4 right-4 w-7 h-7 border-t-3 border-r-3 border-teal-400 rounded-tr-xl"></div>
              <div className="absolute bottom-4 left-4 w-7 h-7 border-b-3 border-l-3 border-teal-400 rounded-bl-xl"></div>
              <div className="absolute bottom-4 right-4 w-7 h-7 border-b-3 border-r-3 border-teal-400 rounded-br-xl"></div>

              {/* Central scanning line */}
              <div className="w-52 h-0.5 bg-gradient-to-r from-transparent via-teal-400 to-transparent animate-pulse shadow-[0_0_12px_rgba(45,212,191,0.8)] z-10 mb-2"></div>

              {/* Center Icon */}
              <div className="w-20 h-20 rounded-2xl bg-teal-950/60 border border-teal-500/40 flex items-center justify-center text-teal-300 backdrop-blur-xs">
                <QrCode className="w-10 h-10 animate-pulse" />
              </div>

              <p className="mt-3 text-[11px] font-bold text-teal-200 uppercase tracking-wider text-center z-10">
                {t("kiosk_align_frame")}
              </p>
            </div>

            {/* Quick Actions Card */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleUseDemo}
                className="w-full min-h-[52px] px-4 rounded-2xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition active:scale-[0.99] cursor-pointer"
              >
                <Zap className="w-4 h-4 text-teal-200" />
                <span>{t("kiosk_btn_use_demo")}</span>
              </button>

              <button
                type="button"
                onClick={handleUseDemo}
                className="w-full min-h-[46px] px-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Camera className="w-4 h-4 text-teal-700" />
                <span>{t("kiosk_btn_scan_camera")}</span>
              </button>
            </div>

            {/* Prototype Test Cases Panel */}
            <div className="p-3 rounded-2xl bg-slate-100/90 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-slate-500">
                <span>{t("kiosk_evaluator_tools")}</span>
                <span className="text-[10px] text-teal-800 font-mono">SIH 2026</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleTestExpired}
                  className="py-1.5 px-2 rounded-xl bg-white hover:bg-amber-50 text-amber-800 border border-amber-200 font-bold text-[11px] transition text-center cursor-pointer"
                >
                  {t("kiosk_test_expired")}
                </button>
                <button
                  type="button"
                  onClick={handleTestInvalid}
                  className="py-1.5 px-2 rounded-xl bg-white hover:bg-rose-50 text-rose-800 border border-rose-200 font-bold text-[11px] transition text-center cursor-pointer"
                >
                  {t("kiosk_test_invalid")}
                </button>
              </div>
            </div>

            {/* Security Guarantee Banner */}
            <div className="p-3 rounded-2xl bg-teal-50/70 border border-teal-200/70 text-xs text-teal-950 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
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
                {t("kiosk_validating_sub")}
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
                {t("kiosk_connected_sub")}
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
                <p className="text-[11px] text-slate-400">
                  {isHindi ? "अभी प्रारंभ हुआ · 30 मिनट में समाप्त होगा" : "Started just now · Expires in 30 mins"}
                </p>
              </div>
            </div>

            <p className="text-xs text-teal-700 font-bold animate-pulse">
              {t("kiosk_redirecting")}
            </p>
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

      {/* Persistent Bottom Bar only on scanner screen */}
      {state === "SCANNER" && (
        <BottomActionBar>
          <PrimaryButton onClick={handleUseDemo} icon={Zap}>
            {isHindi ? "डेमो सत्र कनेक्ट करें →" : "Connect Demo Session →"}
          </PrimaryButton>
        </BottomActionBar>
      )}
    </div>
  );
};

export default KioskConnectScreen;
