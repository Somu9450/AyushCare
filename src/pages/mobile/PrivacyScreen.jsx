import React, { useState } from "react";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Unlock,
  Eye,
  Clock,
  Calendar,
  Building2,
  FileText,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Check,
  Monitor,
  PowerOff,
  History,
  HelpCircle,
} from "lucide-react";
import useMobileStore, { SCREENS } from "../../store/useMobileStore";
import MobileHeader from "../../components/mobile/MobileHeader";
import BottomNavBar from "../../components/mobile/BottomNavBar";
import PrivacyConfirmModal from "../../components/mobile/PrivacyConfirmModal";

/**
 * PrivacyScreen — "Privacy & Data Control"
 * Patient-friendly privacy and consent experience inspired by DPDP principles:
 * - Health history access lock/unlock control
 * - Active consent governance with detail inspection & withdrawal
 * - Chronological consent history
 * - Access audit history ("Who accessed my information?")
 * - Active connected healthcare sessions management
 */
export const PrivacyScreen = () => {
  const {
    privacyData,
    isHealthHistoryLocked,
    setHealthHistoryLocked,
    setSelectedConsent,
    endSession,
    setScreen,
    prevScreen,
  } = useMobileStore();

  // Confirmation Modals State
  const [isLockModalOpen, setIsLockModalOpen] = useState(false);
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);
  const [sessionToEnd, setSessionToEnd] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Lock / Unlock Handlers
  const handleConfirmLock = () => {
    setHealthHistoryLocked(true);
    setIsLockModalOpen(false);
    showToast("Health history locked");
  };

  const handleConfirmUnlock = () => {
    setHealthHistoryLocked(false);
    setIsUnlockModalOpen(false);
    showToast("Health history unlocked");
  };

  // End Session Handler
  const handleConfirmEndSession = () => {
    if (sessionToEnd) {
      endSession(sessionToEnd.id);
      setSessionToEnd(null);
      showToast("Session ended");
    }
  };

  const activeConsents = privacyData.activeConsents || [];
  const consentHistory = privacyData.consentHistory || [];
  const accessHistory = privacyData.accessHistory || [];
  const activeSessions = privacyData.activeSessions || [];

  return (
    <div className="min-h-full flex flex-col justify-between bg-slate-50 text-slate-900 select-none">
      {/* Header */}
      <MobileHeader
        title="Privacy & Data Control"
        showBack={true}
        onBack={() => setScreen(SCREENS.MORE)}
      />

      {/* Main Content */}
      <main className="flex-1 px-4 sm:px-6 py-4 sm:py-6 max-w-md md:max-w-2xl lg:max-w-3xl mx-auto w-full space-y-5">
        {/* Floating Toast Feedback */}
        {toastMessage && (
          <div className="p-3.5 rounded-2xl bg-slate-950 text-white border border-teal-500/40 shadow-xl text-xs font-bold flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-teal-400 shrink-0" />
              <span>{toastMessage}</span>
            </div>
            <span className="text-[10px] text-teal-300 uppercase tracking-wider font-extrabold">
              Saved
            </span>
          </div>
        )}

        {/* -------------------------------------------------------------
            BANNER / HEADER NOTICE
        -------------------------------------------------------------- */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-teal-800 to-teal-950 text-white shadow-md space-y-2.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-teal-200">
              <Shield className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-200">
              Patient Governance
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
            Privacy & Data Control
          </h2>

          <p className="text-xs sm:text-sm text-teal-100/90 leading-relaxed">
            Manage how your health information is shared and accessed. Your health information belongs to you. You can review active sharing permissions, control access, and review recent activity.
          </p>
        </div>

        {/* -------------------------------------------------------------
            SECTION 1 — HEALTH HISTORY CONTROL (LOCK / UNLOCK)
        -------------------------------------------------------------- */}
        <section
          aria-label="Health History Access"
          className={`p-5 rounded-3xl border shadow-xs transition-all space-y-4 ${
            isHealthHistoryLocked
              ? "bg-amber-50/70 border-amber-300 ring-1 ring-amber-400/20"
              : "bg-white border-slate-200/90"
          }`}
        >
          {/* Header & State Indicator */}
          <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                {isHealthHistoryLocked ? (
                  <Lock className="w-4 h-4 text-amber-700 shrink-0" />
                ) : (
                  <Unlock className="w-4 h-4 text-teal-800 shrink-0" />
                )}
                <h3 className="text-sm sm:text-base font-black text-slate-900">
                  Health History Access
                </h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Control whether your saved health history and medical documents can be shared with connected healthcare sessions.
              </p>
            </div>

            {/* Status Badge */}
            {isHealthHistoryLocked ? (
              <span className="shrink-0 inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs">
                <Lock className="w-3 h-3 text-amber-700" />
                <span>Restricted</span>
              </span>
            ) : (
              <span className="shrink-0 inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-teal-50 text-teal-800 border border-teal-200 shadow-2xs">
                <CheckCircle2 className="w-3 h-3 text-teal-700" />
                <span>Available</span>
              </span>
            )}
          </div>

          {/* Current Status Explanation */}
          <div className="flex items-center justify-between gap-3 text-xs">
            <div>
              <p className="font-bold text-slate-800">
                {isHealthHistoryLocked
                  ? "Sharing is currently restricted"
                  : "Available for sharing"}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {isHealthHistoryLocked
                  ? "Connected healthcare sessions cannot read your past history or documents."
                  : "Authorized doctor consoles and terminals can access shared records."}
              </p>
            </div>

            {/* Toggle Button */}
            {isHealthHistoryLocked ? (
              <button
                type="button"
                onClick={() => setIsUnlockModalOpen(true)}
                className="shrink-0 px-4 py-2 rounded-2xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-xs"
              >
                <Unlock className="w-3.5 h-3.5" />
                <span>Unlock History</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsLockModalOpen(true)}
                className="shrink-0 px-4 py-2 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold text-xs border border-amber-300 flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-xs"
              >
                <Lock className="w-3.5 h-3.5 text-amber-800" />
                <span>Lock History</span>
              </button>
            )}
          </div>

          <div className="pt-2 border-t border-slate-100/80 text-[11px] text-slate-400 italic">
            This is a patient-controlled product setting. Your records remain intact and visible to you.
          </div>
        </section>

        {/* -------------------------------------------------------------
            SECTION 2 — ACTIVE CONSENTS
        -------------------------------------------------------------- */}
        <section aria-label="Active Consents" className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Active Consents
              </h3>
              <p className="text-xs text-slate-500">
                Permissions currently granted to connected healthcare sessions
              </p>
            </div>
            <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
              {activeConsents.filter((c) => c.status === "ACTIVE").length} Active
            </span>
          </div>

          <div className="space-y-2.5">
            {activeConsents.length > 0 ? (
              activeConsents.map((consent) => {
                const isActive = consent.status === "ACTIVE";

                return (
                  <div
                    key={consent.id}
                    className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-3 hover:border-teal-400/40 transition"
                  >
                    <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                      <div>
                        <h4 className="text-sm font-black text-slate-900 leading-tight">
                          {consent.title}
                        </h4>
                        <span className="text-[11px] text-teal-800 font-semibold mt-0.5 block">
                          Granted: {consent.grantedAt}
                        </span>
                      </div>

                      {isActive ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 shrink-0">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Active</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-800 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200 shrink-0">
                          <XCircle className="w-3 h-3 text-rose-600" />
                          <span>Withdrawn</span>
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {consent.purpose}
                    </p>

                    <div className="flex items-center justify-between pt-1 text-xs">
                      <span className="text-[11px] text-slate-400 truncate max-w-[200px]">
                        Scope: {consent.scope || "Active consultation"}
                      </span>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedConsent(consent);
                          setScreen(SCREENS.CONSENT_DETAILS);
                        }}
                        className="font-bold text-teal-800 hover:text-teal-950 flex items-center gap-0.5 cursor-pointer py-1"
                      >
                        <span>View Details</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-5 rounded-3xl bg-white border border-slate-200 text-center text-xs text-slate-500">
                No active sharing permissions. Consents you grant will appear here.
              </div>
            )}
          </div>
        </section>

        {/* -------------------------------------------------------------
            SECTION 3 — CONSENT HISTORY
        -------------------------------------------------------------- */}
        <section aria-label="Consent History" className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Consent History
            </h3>
            <span className="text-xs text-slate-400">Chronological</span>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs divide-y divide-slate-100 overflow-hidden">
            {consentHistory.length > 0 ? (
              consentHistory.map((item, idx) => (
                <div key={item.id || idx} className="p-4 text-xs space-y-1 hover:bg-slate-50/50 transition">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-black text-slate-900 text-xs sm:text-sm">
                      {item.title}
                    </p>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                        item.status === "ACTIVE"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : item.status === "WITHDRAWN"
                          ? "bg-rose-50 text-rose-800 border-rose-200"
                          : "bg-slate-100 text-slate-600 border-slate-200"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <p className="text-slate-600 text-[11px]">{item.purpose}</p>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                    <span>Granted: {item.grantedAt}</span>
                    {item.withdrawnAt && (
                      <span className="text-rose-700 font-semibold">
                        Withdrawn: {item.withdrawnAt}
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-xs text-slate-500">
                No consent history recorded.
              </div>
            )}
          </div>
        </section>

        {/* -------------------------------------------------------------
            SECTION 4 — ACCESS HISTORY ("Who accessed my information?")
        -------------------------------------------------------------- */}
        <section aria-label="Access History" className="space-y-3">
          <div className="px-1 space-y-0.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Who accessed my information?
            </h3>
            <p className="text-xs text-slate-500">
              Review recent access activity across connected clinical systems.
            </p>
          </div>

          <div className="space-y-2.5">
            {accessHistory.length > 0 ? (
              accessHistory.map((entry) => (
                <div
                  key={entry.id}
                  className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2 text-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-black text-slate-900">
                        {entry.organization}
                      </p>
                      <p className="text-[11px] text-teal-800 font-medium">
                        {entry.department} · {entry.accessedByRole}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-bold text-slate-700 block">
                        {entry.date}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {entry.time}
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-semibold">
                        Information accessed: {entry.informationAccessed}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 pl-5">
                      Purpose: {entry.purpose}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 rounded-2xl bg-white border border-slate-200 text-center text-xs text-slate-500">
                No access events recorded.
              </div>
            )}
          </div>

          <p className="text-[11px] text-slate-400 italic px-1">
            Access activity shown here is based on the information available to MediKiosk.
          </p>
        </section>

        {/* -------------------------------------------------------------
            SECTION 5 — ACTIVE SESSIONS
        -------------------------------------------------------------- */}
        <section aria-label="Active Sessions" className="space-y-3 pb-6">
          <div className="flex items-center justify-between px-1">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Active Sessions
              </h3>
              <p className="text-xs text-slate-500">
                Currently connected devices and clinical terminals
              </p>
            </div>
            <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
              {activeSessions.filter((s) => s.status === "ACTIVE").length} Connected
            </span>
          </div>

          <div className="space-y-2.5">
            {activeSessions.length > 0 ? (
              activeSessions.map((session) => {
                const isActive = session.status === "ACTIVE";

                return (
                  <div
                    key={session.id}
                    className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                            isActive
                              ? "bg-teal-50 text-teal-800 border border-teal-200"
                              : "bg-slate-100 text-slate-400 border border-slate-200"
                          }`}
                        >
                          <Monitor className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-900 leading-tight">
                            {session.name}
                          </h4>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {session.device}
                          </p>
                        </div>
                      </div>

                      {isActive ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          <span>Active</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200 shrink-0">
                          <span>Ended</span>
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                        <span className="text-slate-400 block font-semibold text-[9px] uppercase">
                          Purpose
                        </span>
                        <span className="font-bold text-slate-800 mt-0.5 block">
                          {session.purpose}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                        <span className="text-slate-400 block font-semibold text-[9px] uppercase">
                          Started At
                        </span>
                        <span className="font-bold text-slate-800 mt-0.5 block">
                          {session.startedAt}
                        </span>
                      </div>
                    </div>

                    {/* End Session Button */}
                    {isActive && (
                      <div className="pt-1 flex justify-end">
                        <button
                          type="button"
                          onClick={() => setSessionToEnd(session)}
                          className="px-3.5 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-2xs"
                        >
                          <PowerOff className="w-3.5 h-3.5 text-rose-700" />
                          <span>End Session</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="p-4 rounded-2xl bg-white border border-slate-200 text-center text-xs text-slate-500">
                No active sessions.
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Persistent Bottom Nav */}
      <BottomNavBar />

      {/* -------------------------------------------------------------
          CONFIRMATION MODALS
      -------------------------------------------------------------- */}
      {/* 1. Lock History Modal */}
      <PrivacyConfirmModal
        isOpen={isLockModalOpen}
        title="Lock your health history?"
        message="When your history is locked, connected healthcare sessions will not be able to use your saved medical history and documents through this patient-controlled setting."
        confirmText="Lock History"
        cancelText="Cancel"
        variant="warning"
        icon={Lock}
        onConfirm={handleConfirmLock}
        onCancel={() => setIsLockModalOpen(false)}
      />

      {/* 2. Unlock History Modal */}
      <PrivacyConfirmModal
        isOpen={isUnlockModalOpen}
        title="Unlock your health history?"
        message="Your saved health information can be shared with connected healthcare sessions when you allow access."
        confirmText="Unlock History"
        cancelText="Cancel"
        variant="primary"
        icon={Unlock}
        onConfirm={handleConfirmUnlock}
        onCancel={() => setIsUnlockModalOpen(false)}
      />

      {/* 3. End Session Modal */}
      <PrivacyConfirmModal
        isOpen={!!sessionToEnd}
        title="End this session?"
        message="Ending the session will stop this connected session from using your information."
        confirmText="End Session"
        cancelText="Cancel"
        variant="danger"
        icon={PowerOff}
        onConfirm={handleConfirmEndSession}
        onCancel={() => setSessionToEnd(null)}
      />
    </div>
  );
};

export default PrivacyScreen;
