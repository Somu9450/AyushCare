import React, { useState } from "react";
import {
  User,
  IdCard,
  Shield,
  ShieldCheck,
  Lock,
  LogOut,
  Sliders,
  Building2,
  ChevronRight,
  HeartPulse,
  MonitorCheck,
  AlertTriangle,
} from "lucide-react";
import useMobileStore, { SCREENS } from "../../store/useMobileStore";
import MobileHeader from "../../components/mobile/MobileHeader";
import BottomNavBar from "../../components/mobile/BottomNavBar";
import useLanguage from "../../i18n/translations";

export const MoreScreen = () => {
  const {
    session,
    kioskSession,
    setScreen,
    logoutPatient,
    isHealthHistoryLocked,
    selectedLanguage,
    accessibilitySettings,
  } = useMobileStore();

  const { t, isHindi } = useLanguage();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const patient = session.patient || {};
  const isKioskConnected = kioskSession?.status === "CONNECTED";

  const getMaskedAbha = (abha) => {
    if (!abha) return "91-XXXX-XXXX-9012";
    const clean = abha.replace(/\s+/g, "");
    if (clean.length >= 14) {
      return `${clean.slice(0, 3)}XXXX-XXXX-${clean.slice(-4)}`;
    }
    return "91-XXXX-XXXX-9012";
  };

  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    logoutPatient();
  };

  const displayName = isHindi
    ? (patient.hindiName || patient.name || "मरीज़")
    : (patient.name || "Patient Name");

  const genderDisplay = isHindi
    ? (patient.gender === "Female" ? "महिला" : "पुरुष")
    : (patient.gender || "Male");

  const textSizeDisplay = isHindi
    ? (accessibilitySettings.textSize === "xlarge" ? "अति विशाल" : accessibilitySettings.textSize === "large" ? "बड़ा" : "सामान्य")
    : (accessibilitySettings.textSize || "Default");

  return (
    <div className="min-h-full flex flex-col justify-between bg-slate-50 text-slate-900">
      <MobileHeader title={t("more_title")} showBack={false} />

      <main className="flex-1 px-4 sm:px-6 py-4 sm:py-6 max-w-md md:max-w-3xl lg:max-w-4xl mx-auto w-full space-y-5">
        {/* Patient ABHA Digital Profile Card (Tap to View Full Profile) */}
        <div
          onClick={() => setScreen(SCREENS.PROFILE)}
          className="p-5 rounded-3xl bg-gradient-to-br from-teal-800 to-teal-950 text-white shadow-md space-y-4 cursor-pointer hover:shadow-lg transition active:scale-[0.99] group"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center font-bold text-lg text-white">
                {patient.name ? patient.name.charAt(0) : "P"}
              </div>
              <div>
                <h3 className="text-lg font-black leading-tight flex items-center gap-1.5">
                  <span>{displayName}</span>
                  <ChevronRight className="w-4 h-4 text-teal-300 opacity-60 group-hover:opacity-100 transition" />
                </h3>
                <p className="text-xs text-teal-100 font-medium mt-0.5">
                  {patient.age} {isHindi ? "वर्ष" : "Yrs"} · {genderDisplay} · {patient.bloodGroup || "B+"}
                </p>
              </div>
            </div>

            <span className="text-[10px] font-black uppercase bg-teal-700/80 px-2 py-0.5 rounded border border-teal-500/40">
              {isHindi ? "डिजिटल सत्यापित" : "ABDM Verified"}
            </span>
          </div>

          {/* Masked ABHA Number Bar */}
          <div className="p-3 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-between">
            <div>
              <span className="text-[9px] uppercase tracking-wider text-teal-200 font-bold block">
                {isHindi ? "आभा संख्या" : "ABHA Number"}
              </span>
              <span className="text-sm font-mono font-bold tracking-wider text-white">
                {getMaskedAbha(patient.abhaNumber)}
              </span>
            </div>
            <IdCard className="w-5 h-5 text-teal-200" />
          </div>

          <div className="text-[11px] text-teal-200/80 flex items-center justify-between">
            <span>
              {isHindi ? "जिला" : "District"}: {isHindi ? (patient.hindiDistrict || patient.district || "मध्य दिल्ली") : (patient.district || "Central Delhi")}, {isHindi ? "दिल्ली" : (patient.state || "Delhi")}
            </span>
            <span className="underline font-bold text-white">{t("more_profile_card_view")}</span>
          </div>
        </div>

        {/* Hospital Kiosk Terminal Linkage Status */}
        <div
          onClick={() => {
            if (isKioskConnected) {
              setScreen(SCREENS.KIOSK_SESSION);
            } else {
              setScreen(SCREENS.KIOSK_CONNECT);
            }
          }}
          className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-50 transition"
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isKioskConnected
                  ? "bg-teal-50 text-teal-800"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {t("more_kiosk_conn_title")}
              </p>
              <p className="text-sm font-bold text-slate-900">
                {isKioskConnected
                  ? (isHindi ? (kioskSession?.hindiHospitalName || "मेडीकियोस्क अस्पताल") : (kioskSession?.hospitalName || "MediKiosk Demo Hospital"))
                  : (isHindi ? "कियोस्क से कनेक्ट नहीं है" : "Not Connected to Kiosk")}
              </p>
              <p className="text-xs text-slate-500 mt-0.5 font-mono">
                {isKioskConnected
                  ? `${isHindi ? "टर्मिनल" : "Terminal"}: ${kioskSession?.terminalId || "KIOSK-03"}`
                  : (isHindi ? "कियोस्क क्यूआर स्कैन करने के लिए टैप करें" : "Tap to scan kiosk QR")}
              </p>
            </div>
          </div>

          {isKioskConnected ? (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 shrink-0">
              {isHindi ? "सक्रिय ✓" : "Active ✓"}
            </span>
          ) : (
            <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200 shrink-0">
              {isHindi ? "कनेक्ट करें →" : "Connect →"}
            </span>
          )}
        </div>

        {/* Settings / Navigation Shortcuts List */}
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs divide-y divide-slate-100 text-sm">
          {/* Patient Profile */}
          <button
            type="button"
            onClick={() => setScreen(SCREENS.PROFILE)}
            className="w-full p-4 text-left flex items-center justify-between hover:bg-slate-50 transition cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center shrink-0 group-hover:bg-teal-700 group-hover:text-white transition">
                <User className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-slate-900">{t("more_menu_profile")}</span>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t("more_menu_profile_sub")}
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-700 transition shrink-0" />
          </button>

          {/* Privacy & Data Control */}
          <button
            type="button"
            onClick={() => setScreen(SCREENS.PRIVACY)}
            className="w-full p-4 text-left flex items-center justify-between hover:bg-slate-50 transition cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center shrink-0 group-hover:bg-teal-700 group-hover:text-white transition">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{t("more_menu_privacy")}</span>
                  {isHealthHistoryLocked && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                      <Lock className="w-2.5 h-2.5" />
                      <span>{isHindi ? "प्रतिबंधित" : "Restricted"}</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t("more_menu_privacy_sub")}
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-700 transition shrink-0" />
          </button>

          {/* Settings & Accessibility */}
          <button
            type="button"
            onClick={() => setScreen(SCREENS.SETTINGS)}
            className="w-full p-4 text-left flex items-center justify-between hover:bg-slate-50 transition cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center shrink-0 group-hover:bg-teal-700 group-hover:text-white transition">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-slate-900">{t("more_menu_settings")}</span>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isHindi
                    ? `भाषा (हिन्दी), टेक्स्ट आकार (${textSizeDisplay}), उच्च कंट्रास्ट`
                    : `Language (English), text scale (${textSizeDisplay}), high contrast`}
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-700 transition shrink-0" />
          </button>

          {/* Active Sessions */}
          <button
            type="button"
            onClick={() => setScreen(SCREENS.KIOSK_SESSION)}
            className="w-full p-4 text-left flex items-center justify-between hover:bg-slate-50 transition cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center shrink-0 group-hover:bg-teal-700 group-hover:text-white transition">
                <MonitorCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-slate-900">{t("more_menu_sessions")}</span>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isKioskConnected
                    ? (isHindi ? "1 अस्पताल टर्मिनल कनेक्टेड" : "1 hospital terminal connected")
                    : (isHindi ? "कोई सक्रिय कियोस्क सत्र नहीं" : "No active kiosk session")}
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-700 transition shrink-0" />
          </button>

          {/* Health Summary */}
          <button
            type="button"
            onClick={() => setScreen(SCREENS.M8)}
            className="w-full p-4 text-left flex items-center justify-between hover:bg-slate-50 transition cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center shrink-0 group-hover:bg-teal-700 group-hover:text-white transition">
                <HeartPulse className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-slate-900">{t("more_menu_summary")}</span>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t("more_menu_summary_sub")}
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-700 transition shrink-0" />
          </button>

          {/* Medical Timeline */}
          <button
            type="button"
            onClick={() => setScreen(SCREENS.M7)}
            className="w-full p-4 text-left flex items-center justify-between hover:bg-slate-50 transition cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center shrink-0 group-hover:bg-teal-700 group-hover:text-white transition">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-slate-900">{t("more_menu_timeline")}</span>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t("more_menu_timeline_sub")}
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-700 transition shrink-0" />
          </button>
        </div>

        {/* Logout / Switch Patient Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setShowLogoutModal(true)}
            className="w-full min-h-[50px] p-3 rounded-2xl border border-rose-200 bg-rose-50/70 hover:bg-rose-100 text-rose-800 font-bold text-sm flex items-center justify-center gap-2 transition active:scale-[0.99] cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>{t("more_btn_logout")}</span>
          </button>
        </div>
      </main>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
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
                {t("settings_logout_confirm_title")}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t("settings_logout_confirm_sub")}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="h-11 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
              >
                {t("cancel")}
              </button>
              <button
                type="button"
                onClick={handleConfirmLogout}
                className="h-11 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition cursor-pointer shadow-sm"
              >
                {t("settings_btn_confirm_logout")}
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNavBar />
    </div>
  );
};

export default MoreScreen;

