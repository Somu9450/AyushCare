import React, { useState } from "react";
import {
  MonitorCheck,
  Building2,
  Clock,
  Shield,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ExternalLink,
} from "lucide-react";
import useMobileStore, { SCREENS } from "../../store/useMobileStore";
import MobileHeader from "../../components/mobile/MobileHeader";
import BottomNavBar from "../../components/mobile/BottomNavBar";
import useLanguage from "../../i18n/translations";

export const KioskSessionDetailsScreen = () => {
  const {
    kioskSession,
    disconnectKioskSession,
    setScreen,
    isHealthHistoryLocked,
  } = useMobileStore();

  const { t, isHindi } = useLanguage();

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const isActive = kioskSession?.status === "CONNECTED";

  const handleEndSession = () => {
    disconnectKioskSession();
    setShowConfirmModal(false);
    setToastMessage(isHindi ? "सत्र समाप्त हुआ" : "Session ended");
    setTimeout(() => {
      setToastMessage("");
    }, 3000);
  };

  return (
    <div className="min-h-full flex flex-col justify-between bg-slate-50 text-slate-900">
      {/* Header */}
      <MobileHeader
        title={t("kiosk_session_title")}
        showBack={true}
        onBack={() => setScreen(SCREENS.M1)}
      />

      {/* Main Content */}
      <main className="flex-1 px-4 sm:px-6 py-4 sm:py-6 max-w-md md:max-w-2xl lg:max-w-3xl mx-auto w-full space-y-5">
        {/* Toast feedback */}
        {toastMessage && (
          <div className="p-3.5 rounded-2xl bg-slate-900 text-white font-bold text-xs flex items-center gap-2 shadow-lg animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Primary Kiosk Status Banner */}
        <div
          className={`p-5 rounded-3xl shadow-sm space-y-3 transition-colors ${
            isActive
              ? "bg-gradient-to-br from-teal-800 to-teal-950 text-white"
              : "bg-white border border-slate-200 text-slate-800"
          }`}
        >
          <div className="flex items-center justify-between gap-2 border-b border-white/15 pb-3">
            <div className="flex items-center gap-2">
              <MonitorCheck
                className={`w-5 h-5 ${isActive ? "text-teal-200" : "text-slate-400"}`}
              />
              <span
                className={`text-xs font-black uppercase tracking-wider ${
                  isActive ? "text-teal-200" : "text-slate-500"
                }`}
              >
                {t("kiosk_terminal_heading")}
              </span>
            </div>

            <span
              className={`text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                isActive
                  ? "bg-emerald-500/30 text-emerald-200 border-emerald-400/40"
                  : "bg-slate-100 text-slate-500 border-slate-200"
              }`}
            >
              {isActive ? t("kiosk_status_active") : t("kiosk_status_ended")}
            </span>
          </div>

          <div className="space-y-1">
            <h2 className={`text-2xl font-black ${isActive ? "text-white" : "text-slate-900"}`}>
              {kioskSession?.kioskName || (isHindi ? "अस्पताल ओपीडी कियोस्क" : "Hospital OPD Kiosk")}
            </h2>
            <p className={`text-xs font-mono ${isActive ? "text-teal-200/80" : "text-slate-500"}`}>
              {isHindi ? "टर्मिनल" : "Terminal"}: {kioskSession?.terminalId || "KIOSK-03"} · {isHindi ? "संदर्भ" : "Reference"}: {kioskSession?.sessionToken || "MK-2026-0905"}
            </p>
          </div>
        </div>

        {/* Detailed Metadata Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
            {t("kiosk_details_heading")}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-0.5 p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 font-bold uppercase text-[10px]">
                {t("kiosk_hospital_name")}
              </span>
              <p className="font-bold text-slate-800 text-sm">
                {isHindi
                  ? (kioskSession?.hindiHospitalName || "मेडीकियोस्क अस्पताल")
                  : (kioskSession?.hospitalName || "MediKiosk Demo Hospital")}
              </p>
            </div>

            <div className="space-y-0.5 p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 font-bold uppercase text-[10px]">
                {t("kiosk_department")}
              </span>
              <p className="font-bold text-slate-800 text-sm">
                {isHindi ? "सामान्य ओपीडी" : (kioskSession?.department || "General OPD")}
              </p>
            </div>

            <div className="space-y-0.5 p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 font-bold uppercase text-[10px]">
                {t("kiosk_connected_time")}
              </span>
              <p className="font-bold text-slate-800 text-sm">
                {kioskSession?.connectedAt || "05 Sep 2026 · 10:30 AM"}
              </p>
            </div>

            <div className="space-y-0.5 p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 font-bold uppercase text-[10px]">
                {t("kiosk_session_expires")}
              </span>
              <p className="font-bold text-slate-800 text-sm">
                {kioskSession?.expiresAt || "05 Sep 2026 · 11:00 AM"}
              </p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
            <span className="text-slate-400 font-bold uppercase text-[10px]">
              {t("kiosk_location")}
            </span>
            <p className="font-bold text-slate-800 mt-0.5">
              {isHindi ? "नागरिक अस्पताल प्रतीक्षालय, भूतल" : (kioskSession?.location || "Civil Hospital Waiting Lobby, Ground Floor")}
            </p>
          </div>
        </div>

        {/* Privacy & Information Sharing Governance */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-teal-700" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
                {t("kiosk_privacy_gov")}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setScreen(SCREENS.PRIVACY)}
              className="text-[11px] font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1 cursor-pointer"
            >
              <span>{t("kiosk_manage")}</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          <div
            className={`p-3.5 rounded-2xl border flex items-start gap-3 ${
              isHealthHistoryLocked
                ? "bg-amber-50/80 border-amber-200 text-amber-950"
                : "bg-teal-50/80 border-teal-200 text-teal-950"
            }`}
          >
            {isHealthHistoryLocked ? (
              <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            ) : (
              <Unlock className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
            )}
            <div className="text-xs space-y-1">
              <p className="font-bold">
                {isHealthHistoryLocked
                  ? t("kiosk_sharing_restricted")
                  : t("kiosk_sharing_allowed")}
              </p>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                {t("kiosk_sharing_sub")}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-2 space-y-3">
          {isActive ? (
            <button
              type="button"
              onClick={() => setShowConfirmModal(true)}
              className="w-full min-h-[50px] p-3 rounded-2xl border border-rose-200 bg-rose-50/80 hover:bg-rose-100 text-rose-800 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-xs active:scale-[0.99]"
            >
              <XCircle className="w-4 h-4" />
              <span>{t("kiosk_btn_end_session")}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setScreen(SCREENS.KIOSK_CONNECT)}
              className="w-full min-h-[50px] p-3 rounded-2xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-xs active:scale-[0.99]"
            >
              <span>{t("kiosk_btn_connect_again")}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setScreen(SCREENS.M1)}
            className="w-full min-h-[44px] text-xs font-bold text-slate-500 hover:text-slate-800 text-center cursor-pointer"
          >
            {t("kiosk_btn_back_home")}
          </button>
        </div>
      </main>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
        >
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl space-y-4 text-center border border-slate-200 animate-scale-up">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-black text-slate-900">
                {t("kiosk_end_confirm_title")}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t("kiosk_end_confirm_sub")}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="h-11 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
              >
                {t("cancel")}
              </button>
              <button
                type="button"
                onClick={handleEndSession}
                className="h-11 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition cursor-pointer shadow-sm"
              >
                {t("kiosk_btn_end_session")}
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNavBar />
    </div>
  );
};

export default KioskSessionDetailsScreen;
