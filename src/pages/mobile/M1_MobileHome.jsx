import React, { useEffect } from "react";
import {
  UploadCloud,
  FileHeart,
  Clock,
  ShieldCheck,
  ArrowRight,
  ChevronRight,
  Building2,
  User,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import useMobileStore, { SCREENS } from "../../store/useMobileStore";
import MobileHeader from "../../components/mobile/MobileHeader";
import PrimaryButton from "../../components/mobile/PrimaryButton";
import BottomActionBar from "../../components/mobile/BottomActionBar";

/**
 * M1 — ACTIVE SESSION / MOBILE HOME
 * First touchpoint after patient scans QR code on the hospital kiosk terminal.
 */
export const M1_MobileHome = () => {
  const {
    session,
    timerSecondsRemaining,
    decrementTimer,
    isSessionExpired,
    setScreen,
  } = useMobileStore();

  // Live session countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      decrementTimer();
    }, 1000);
    return () => clearInterval(interval);
  }, [decrementTimer]);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <div className="min-h-full flex flex-col justify-between bg-slate-50">
      {/* Mobile Header */}
      <MobileHeader showBack={false} />

      {/* Main Content Area */}
      <main className="flex-1 px-4 sm:px-6 py-4 sm:py-6 max-w-md md:max-w-3xl lg:max-w-4xl mx-auto w-full space-y-5">
        {/* Session Active & Expiry Banner */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-teal-50/90 border border-teal-200/80 text-teal-950 shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
            </span>
            <span className="text-xs font-bold">
              Session Active
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-semibold text-teal-900 bg-white/80 px-2.5 py-1 rounded-full border border-teal-200">
            <Clock className="w-3.5 h-3.5 text-teal-700" />
            <span>
              {isSessionExpired ? "Session Expired" : `Expires in ${formatTimer(timerSecondsRemaining)}`}
            </span>
          </div>
        </div>

        {/* Patient & Terminal Mini Bar */}
        <div className="flex items-center justify-between px-1 text-xs text-slate-500">
          <div className="flex items-center gap-1.5 truncate">
            <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="font-semibold text-slate-800 truncate">
              {session.patient?.name || "Patient"}
            </span>
            <span className="text-slate-400">({session.patient?.age}y / {session.patient?.gender})</span>
          </div>
          <span className="text-[11px] font-mono text-slate-400 shrink-0">
            {session.kioskId}
          </span>
        </div>

        {/* Main Heading */}
        <div className="pt-1 pb-1">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
            Upload your previous medical records securely.
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
            Attach prescriptions or reports to help your OPD doctor see your treatment history and make informed decisions.
          </p>
        </div>

        {/* Action Choice Section: "What would you like to do?" */}
        <div className="space-y-3 pt-1">
          <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            What would you like to do?
          </p>

          {/* Cards in 2-column grid on tablet/desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* Card 1: Upload Medical Documents */}
            <button
              type="button"
              onClick={() => setScreen(SCREENS.M2)}
              className="w-full p-4 sm:p-5 rounded-2xl border-2 border-teal-700 bg-white hover:bg-teal-50/50 shadow-sm active:scale-[0.99] transition-all text-left flex items-start justify-between gap-3.5 cursor-pointer group"
            >
              <div className="flex items-start gap-3.5 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-800 border border-teal-200 flex items-center justify-center shrink-0 group-hover:bg-[#006666] group-hover:text-white transition-colors">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900 leading-tight">
                      Upload Medical Documents
                    </h3>
                    <span className="text-[10px] font-bold bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded">
                      Recommended
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Add prescriptions, lab reports or other medical records.
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-teal-700 shrink-0 mt-3 transition-transform group-hover:translate-x-0.5" />
            </button>

            {/* Card 2: View My Health Summary */}
            <button
              type="button"
              onClick={() => setScreen(SCREENS.M8)}
              className="w-full p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 shadow-xs active:scale-[0.99] transition-all text-left flex items-start justify-between gap-3.5 cursor-pointer group"
            >
              <div className="flex items-start gap-3.5 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 group-hover:bg-slate-200 transition-colors">
                  <FileHeart className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-slate-900 leading-tight">
                    View My Health Summary
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Review the information collected during your visit.
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Security Information Footer */}
        <div className="pt-2">
          <div className="p-3 rounded-xl bg-slate-100/90 border border-slate-200/80 flex items-center gap-2.5 text-xs text-slate-600">
            <ShieldCheck className="w-4 h-4 text-teal-800 shrink-0" />
            <p className="leading-snug">
              Your information is securely linked to this hospital session.
            </p>
          </div>
        </div>
      </main>

      {/* Bottom Primary Action Bar */}
      <BottomActionBar>
        <PrimaryButton
          onClick={() => setScreen(SCREENS.M2)}
          icon={ArrowRight}
          disabled={isSessionExpired}
        >
          Upload Documents →
        </PrimaryButton>
      </BottomActionBar>
    </div>
  );
};

export default M1_MobileHome;
