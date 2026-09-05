import React, { useState } from "react";
import {
  Languages,
  Eye,
  Type,
  Volume2,
  VolumeX,
  Shield,
  MonitorCheck,
  Info,
  LogOut,
  Check,
  ChevronRight,
  AlertTriangle,
  Sliders,
  Sparkles,
} from "lucide-react";
import useMobileStore, { SCREENS } from "../../store/useMobileStore";
import MobileHeader from "../../components/mobile/MobileHeader";
import BottomNavBar from "../../components/mobile/BottomNavBar";
import { useLanguage } from "../../i18n/translations";

export const SettingsScreen = () => {
  const {
    selectedLanguage,
    setSelectedLanguage,
    accessibilitySettings,
    updateAccessibilitySettings,
    kioskSession,
    setScreen,
    logoutPatient,
    isHealthHistoryLocked,
  } = useMobileStore();

  const { t, isHindi } = useLanguage();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleToggleHighContrast = () => {
    updateAccessibilitySettings({
      highContrast: !accessibilitySettings.highContrast,
    });
  };

  const handleToggleAudio = () => {
    updateAccessibilitySettings({
      audioAssistance: !accessibilitySettings.audioAssistance,
    });
  };

  const handleToggleReduceMotion = () => {
    updateAccessibilitySettings({
      reduceMotion: !accessibilitySettings.reduceMotion,
    });
  };

  const handleSetTextSize = (size) => {
    updateAccessibilitySettings({ textSize: size });
  };

  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    logoutPatient();
  };

  return (
    <div className="min-h-full flex flex-col justify-between bg-slate-50 text-slate-900">
      {/* Header */}
      <MobileHeader
        title={t("settings_title")}
        showBack={true}
        onBack={() => setScreen(SCREENS.MORE)}
      />

      {/* Main Content */}
      <main className="flex-1 px-4 sm:px-6 py-4 sm:py-6 max-w-md md:max-w-2xl lg:max-w-3xl mx-auto w-full space-y-5">
        {/* 1. Language Preference */}
        <section
          aria-label="Language Preference"
          className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-3"
        >
          <div className="flex items-center gap-2">
            <Languages className="w-5 h-5 text-teal-700" />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
              {t("settings_lang_heading")}
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            {t("settings_lang_sub")}
          </p>

          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => setSelectedLanguage("en")}
              className={`p-3 rounded-2xl border text-left flex items-center justify-between transition cursor-pointer ${
                selectedLanguage === "en"
                  ? "bg-teal-50/80 border-teal-600 text-teal-950 font-bold shadow-xs"
                  : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
              }`}
            >
              <div>
                <span className="text-sm font-bold block">English</span>
                <span className="text-[10px] text-slate-400">
                  {isHindi ? "सिस्टम मानक" : "Standard"}
                </span>
              </div>
              {selectedLanguage === "en" && (
                <div className="w-5 h-5 rounded-full bg-teal-800 text-white flex items-center justify-center">
                  <Check className="w-3.5 h-3.5" />
                </div>
              )}
            </button>

            <button
              type="button"
              onClick={() => setSelectedLanguage("hi")}
              className={`p-3 rounded-2xl border text-left flex items-center justify-between transition cursor-pointer ${
                selectedLanguage === "hi"
                  ? "bg-teal-50/80 border-teal-600 text-teal-950 font-bold shadow-xs"
                  : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
              }`}
            >
              <div>
                <span className="text-sm font-bold block">हिन्दी</span>
                <span className="text-[10px] text-slate-400">
                  {isHindi ? "आवाज़ व पाठ" : "Voice & Text"}
                </span>
              </div>
              {selectedLanguage === "hi" && (
                <div className="w-5 h-5 rounded-full bg-teal-800 text-white flex items-center justify-center">
                  <Check className="w-3.5 h-3.5" />
                </div>
              )}
            </button>
          </div>
        </section>

        {/* 2. Accessibility Controls */}
        <section
          aria-label="Accessibility Settings"
          className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-teal-700" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                {t("settings_access_heading")}
              </h3>
            </div>
            <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
              {isHindi ? "सक्रिय स्केल" : "Live Scaled"}
            </span>
          </div>

          {/* Text Size Switcher */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <Type className="w-4 h-4 text-slate-500" />
                {t("settings_text_size")}
              </span>
              <span className="text-[11px] font-mono text-slate-500 capitalize">
                {accessibilitySettings.textSize}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "default", label: t("settings_text_default") },
                { id: "large", label: t("settings_text_large") },
                { id: "xlarge", label: t("settings_text_xlarge") },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSetTextSize(opt.id)}
                  className={`py-2 px-2 rounded-xl text-center text-xs font-bold transition cursor-pointer border ${
                    accessibilitySettings.textSize === opt.id
                      ? "bg-teal-800 text-white border-teal-900 shadow-xs"
                      : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* High Contrast Mode Toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-slate-500" />
                {t("settings_high_contrast")}
              </span>
              <p className="text-[11px] text-slate-500">
                {t("settings_high_contrast_sub")}
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={accessibilitySettings.highContrast}
              onClick={handleToggleHighContrast}
              className={`w-12 h-7 rounded-full p-1 transition-colors cursor-pointer ${
                accessibilitySettings.highContrast ? "bg-teal-800" : "bg-slate-300"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  accessibilitySettings.highContrast ? "translate-x-5" : "translate-x-0"
                }`}
              ></div>
            </button>
          </div>

          {/* Audio Assistance Toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                {accessibilitySettings.audioAssistance ? (
                  <Volume2 className="w-4 h-4 text-teal-700" />
                ) : (
                  <VolumeX className="w-4 h-4 text-slate-400" />
                )}
                {t("settings_audio_assist")}
              </span>
              <p className="text-[11px] text-slate-500">
                {t("settings_audio_assist_sub")}
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={accessibilitySettings.audioAssistance}
              onClick={handleToggleAudio}
              className={`w-12 h-7 rounded-full p-1 transition-colors cursor-pointer ${
                accessibilitySettings.audioAssistance ? "bg-teal-800" : "bg-slate-300"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  accessibilitySettings.audioAssistance ? "translate-x-5" : "translate-x-0"
                }`}
              ></div>
            </button>
          </div>

          {/* Reduce Motion Toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-800">
                {t("settings_reduce_motion")}
              </span>
              <p className="text-[11px] text-slate-500">
                {t("settings_reduce_motion_sub")}
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={accessibilitySettings.reduceMotion}
              onClick={handleToggleReduceMotion}
              className={`w-12 h-7 rounded-full p-1 transition-colors cursor-pointer ${
                accessibilitySettings.reduceMotion ? "bg-teal-800" : "bg-slate-300"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  accessibilitySettings.reduceMotion ? "translate-x-5" : "translate-x-0"
                }`}
              ></div>
            </button>
          </div>
        </section>

        {/* 3. Privacy & Connected Sessions Shortcuts */}
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs divide-y divide-slate-100 text-sm">
          <button
            type="button"
            onClick={() => setScreen(SCREENS.PRIVACY)}
            className="w-full p-4 text-left flex items-center justify-between hover:bg-slate-50 transition cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-slate-900 block">
                  {t("more_menu_privacy")}
                </span>
                <span className="text-xs text-slate-500">
                  {t("more_menu_privacy_sub")}
                </span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </button>

          <button
            type="button"
            onClick={() => setScreen(SCREENS.KIOSK_SESSION)}
            className="w-full p-4 text-left flex items-center justify-between hover:bg-slate-50 transition cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center">
                <MonitorCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{t("more_menu_sessions")}</span>
                  <span
                    className={`text-[10px] font-black uppercase px-2 py-0.2 rounded-full border ${
                      kioskSession?.status === "CONNECTED"
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                        : "bg-slate-100 text-slate-500 border-slate-200"
                    }`}
                  >
                    {kioskSession?.status === "CONNECTED"
                      ? isHindi
                        ? "संबद्ध ✓"
                        : "Connected ✓"
                      : isHindi
                      ? "निष्क्रिय"
                      : "Inactive"}
                  </span>
                </div>
                <span className="text-xs text-slate-500">
                  {kioskSession?.kioskName || (isHindi ? "अस्पताल ओपीडी कियोस्क" : "Hospital OPD Kiosk")}
                </span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* 4. About MediKiosk / AyushCare */}
        <section
          aria-label="About MediKiosk"
          className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-3"
        >
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-teal-700" />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
              {t("settings_about_heading")}
            </h3>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs text-slate-600">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm">
                {t("app_name")} / MediKiosk
              </span>
              <span className="text-[11px] font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                v1.0.0
              </span>
            </div>
            <p className="text-slate-500">
              {t("settings_about_sub")}
            </p>
          </div>
        </section>

        {/* 5. Logout Action */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setShowLogoutModal(true)}
            className="w-full min-h-[50px] p-3 rounded-2xl border border-rose-200 bg-rose-50/80 hover:bg-rose-100 text-rose-800 font-bold text-xs flex items-center justify-center gap-2 transition active:scale-[0.99] cursor-pointer shadow-xs"
          >
            <LogOut className="w-4 h-4" />
            <span>{t("settings_btn_logout")}</span>
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

export default SettingsScreen;
