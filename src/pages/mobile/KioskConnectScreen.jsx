import React, { useState, useEffect } from "react";
import {
  QrCode,
  Camera,
  CheckCircle2,
  AlertCircle,
  Clock,
  Building2,
  MonitorCheck,
  RefreshCw,
  Sparkles,
  ArrowLeft,
  ShieldCheck,
  Zap,
} from "lucide-react";
import useMobileStore, { SCREENS } from "../../store/useMobileStore";
import {
  validateKioskSession,
  DEFAULT_DEMO_TOKEN,
} from "../../services/kioskSessionService";
import MobileHeader from "../../components/mobile/MobileHeader";
import PrimaryButton from "../../components/mobile/PrimaryButton";
import SecondaryButton from "../../components/mobile/SecondaryButton";
import BottomActionBar from "../../components/mobile/BottomActionBar";

// TODO: Replace mock kiosk session validation with backend API.
// TODO: Replace mock QR session token with secure server-generated token.
// TODO: Connect to real hospital kiosk session service.
// TODO: In production, kiosk QR should reference a secure short-lived session.
// TODO: Patient identity/session authorization must be validated server-side.
// TODO: Never trust patient identity or medical data supplied directly by QR.

export const KioskConnectScreen = () => {
  const {
    connectKioskSession,
    setScreen,
    isAuthenticated,
    prevScreen,
    session,
  } = useMobileStore();

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
              ? "This kiosk session has expired."
              : res.errorType === "ENDED"
              ? "This kiosk session is no longer active."
              : "QR code not recognized")
        );
      }
    } catch (err) {
      setState("ERROR");
      setErrorType("ERROR");
      setErrorMessage("Unable to connect to kiosk session. Please try again.");
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
        title="Connect to Hospital Kiosk"
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
                Kiosk QR Auto-Connect
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                Scan QR on Hospital Kiosk
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 max-w-xs mx-auto">
                Point your mobile camera at the QR code displayed on the kiosk terminal screen.
              </p>
            </div>

            {/* Simulated Camera Viewfinder */}
            <div className="relative mx-auto w-64 h-64 sm:w-72 sm:h-72 rounded-3xl bg-slate-900 border-4 border-slate-700 shadow-xl overflow-hidden flex flex-col items-center justify-center p-4">
              {/* Background camera simulation grid */}
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
                Align QR Code Inside Frame
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
                <span>Use Demo Kiosk Session</span>
              </button>

              <button
                type="button"
                onClick={handleUseDemo}
                className="w-full min-h-[46px] px-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Camera className="w-4 h-4 text-teal-700" />
                <span>Scan QR Code with Camera</span>
              </button>
            </div>

            {/* Prototype Test Cases Panel */}
            <div className="p-3 rounded-2xl bg-slate-100/90 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-slate-500">
                <span>Evaluator Testing Tools</span>
                <span className="text-[10px] text-teal-800 font-mono">SIH 2026 MOCK</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleTestExpired}
                  className="py-1.5 px-2 rounded-xl bg-white hover:bg-amber-50 text-amber-800 border border-amber-200 font-bold text-[11px] transition text-center cursor-pointer"
                >
                  Test Expired Session
                </button>
                <button
                  type="button"
                  onClick={handleTestInvalid}
                  className="py-1.5 px-2 rounded-xl bg-white hover:bg-rose-50 text-rose-800 border border-rose-200 font-bold text-[11px] transition text-center cursor-pointer"
                >
                  Test Invalid QR
                </button>
              </div>
            </div>

            {/* Security Guarantee Banner */}
            <div className="p-3 rounded-2xl bg-teal-50/70 border border-teal-200/70 text-xs text-teal-950 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong>Privacy Protected:</strong> The kiosk QR contains only a short-lived session reference. Your medical history, diagnosis, and Aadhaar identifiers are never exposed inside QR codes.
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
                Connecting to Hospital Kiosk...
              </h3>
              <p className="text-xs text-slate-500">
                Validating session token and establishing secure companion link
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
                Session Active
              </span>
              <h3 className="text-2xl font-black text-slate-900">
                Connected to Hospital Kiosk ✓
              </h3>
              <p className="text-xs text-slate-600 max-w-xs mx-auto">
                Your mobile app is now synchronized with the hospital kiosk terminal.
              </p>
            </div>

            {/* Session Card Summary */}
            <div className="p-4 rounded-3xl bg-white border border-slate-200 text-left space-y-2 shadow-xs max-w-sm mx-auto">
              <div className="flex items-center gap-2 text-xs font-bold text-teal-900">
                <MonitorCheck className="w-4 h-4 text-teal-700" />
                <span>{sessionResult?.kioskName || "Hospital OPD Kiosk"}</span>
              </div>
              <div className="text-xs text-slate-600 space-y-1">
                <p>
                  <strong className="text-slate-700">Hospital:</strong>{" "}
                  {sessionResult?.hospitalName || "MediKiosk Demo Hospital"}
                </p>
                <p>
                  <strong className="text-slate-700">Department:</strong>{" "}
                  {sessionResult?.department || "General OPD"}
                </p>
                <p className="text-[11px] text-slate-400">
                  Started just now · Expires in 30 mins
                </p>
              </div>
            </div>

            <p className="text-xs text-teal-700 font-bold animate-pulse">
              Redirecting to Patient Home...
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
                Connection Failed
              </span>
              <h3 className="text-2xl font-black text-slate-900">
                {errorMessage}
              </h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                {errorType === "EXPIRED"
                  ? "Kiosk QR codes are valid for a limited time for security. Please request a new QR on the kiosk."
                  : errorType === "ENDED"
                  ? "This consultation session was already terminated at the kiosk terminal."
                  : "The scanned QR code does not correspond to an active hospital kiosk session."}
              </p>
            </div>

            <div className="space-y-2 pt-4 max-w-xs mx-auto">
              <button
                type="button"
                onClick={handleResetScanner}
                className="w-full min-h-[48px] px-4 rounded-2xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Try Again</span>
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
                Return to {isAuthenticated ? "Home" : "Login"}
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Persistent Bottom Bar only on scanner screen */}
      {state === "SCANNER" && (
        <BottomActionBar>
          <PrimaryButton onClick={handleUseDemo} icon={Zap}>
            Connect Demo Session →
          </PrimaryButton>
        </BottomActionBar>
      )}
    </div>
  );
};

export default KioskConnectScreen;
