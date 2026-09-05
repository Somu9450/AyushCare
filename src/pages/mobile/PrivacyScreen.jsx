import React, { useState } from "react";
import {
  Shield,
  ShieldCheck,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  Check,
  FileText,
  Activity,
  FolderHeart,
  ChevronRight,
  History,
  AlertCircle,
  Sliders,
} from "lucide-react";
import useMobileStore, { SCREENS } from "../../store/useMobileStore";
import MobileHeader from "../../components/mobile/MobileHeader";
import BottomNavBar from "../../components/mobile/BottomNavBar";
import { useLanguage } from "../../i18n/translations";

/**
 * PrivacyScreen — Simplified & Intuitive Patient Data Control
 * Allows patients to view and toggle:
 * 1. Master Health History Lock
 * 2. Active Doctor & Hospital Sharing Permissions (Toggle ON to allow, Toggle OFF to pause, and re-allow anytime!)
 * 3. Granular Diagnosis Privacy (Lock / hide specific past conditions like mental health or chronic illness)
 * 4. Granular Report Category Privacy (Lock / hide lab reports, scans, prescriptions)
 * 5. Recent Access History (Who viewed what)
 */
export const PrivacyScreen = () => {
  const {
    privacyData,
    isHealthHistoryLocked,
    toggleHealthHistoryAccess,
    diagnosesPrivacy,
    toggleDiagnosisPrivacy,
    reportsPrivacy,
    toggleReportPrivacy,
    toggleConsent,
    setSelectedConsent,
    setScreen,
  } = useMobileStore();

  const { t, isHindi } = useLanguage();
  const [activeTab, setActiveTab] = useState("all"); // "all" | "diagnoses" | "reports" | "audit"
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const activeConsents = privacyData.activeConsents || [];
  const accessHistory = privacyData.accessHistory || [];

  const handleToggleMasterHistory = () => {
    const willLock = !isHealthHistoryLocked;
    toggleHealthHistoryAccess();
    showToast(
      willLock
        ? (isHindi ? "मास्टर इतिहास लॉक किया गया (साझाकरण बंद)" : "Master history locked (sharing stopped)")
        : (isHindi ? "मास्टर इतिहास अनलॉक किया गया (साझाकरण चालू)" : "Master history unlocked (sharing allowed)")
    );
  };

  const handleToggleConsentItem = (consentId, currentlyActive) => {
    toggleConsent(consentId);
    showToast(
      currentlyActive
        ? (isHindi ? "पहुंच अनुमति रोक दी गई" : "Access permission paused")
        : (isHindi ? "पहुंच अनुमति पुनः स्वीकृत की गई ✓" : "Access permission re-allowed ✓")
    );
  };

  const handleToggleDiagnosis = (id, currentlyLocked) => {
    toggleDiagnosisPrivacy(id);
    showToast(
      currentlyLocked
        ? (isHindi ? "रोग निदान डॉक्टर से साझा किया जा रहा है ✓" : "Diagnosis is now shared with doctor ✓")
        : (isHindi ? "रोग निदान डॉक्टर से छुपा दिया गया 🔒" : "Diagnosis is now hidden from doctor 🔒")
    );
  };

  const handleToggleReport = (id, currentlyLocked) => {
    toggleReportPrivacy(id);
    showToast(
      currentlyLocked
        ? (isHindi ? "रिपोर्ट डॉक्टर से साझा की जा रही है ✓" : "Reports are now shared with doctor ✓")
        : (isHindi ? "रिपोर्ट डॉक्टर से छुपा दी गई 🔒" : "Reports are now hidden from doctor 🔒")
    );
  };

  return (
    <div className="min-h-full flex flex-col justify-between bg-slate-50 text-slate-900 select-none">
      {/* Header */}
      <MobileHeader
        title={t("privacy_title")}
        showBack={true}
        onBack={() => setScreen(SCREENS.MORE)}
      />

      {/* Main Content */}
      <main className="flex-1 px-4 sm:px-6 py-4 sm:py-6 max-w-md md:max-w-2xl lg:max-w-3xl mx-auto w-full space-y-5">
        {/* Toast Feedback */}
        {toastMessage && (
          <div className="p-3.5 rounded-2xl bg-slate-950 text-white border border-teal-500/40 shadow-xl text-xs font-bold flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-teal-400 shrink-0" />
              <span>{toastMessage}</span>
            </div>
            <span className="text-[10px] text-teal-300 uppercase tracking-wider font-black">
              {isHindi ? "सहेजा गया" : "Saved"}
            </span>
          </div>
        )}

        {/* -------------------------------------------------------------
            1. MASTER PRIVACY TOGGLE CARD
        -------------------------------------------------------------- */}
        <section
          aria-label="Master Privacy Control"
          className={`p-5 rounded-3xl border shadow-sm transition-all space-y-3.5 ${
            isHealthHistoryLocked
              ? "bg-amber-50/80 border-amber-300 ring-2 ring-amber-400/20"
              : "bg-white border-slate-200/90"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    isHealthHistoryLocked
                      ? "bg-amber-100 text-amber-900"
                      : "bg-teal-50 text-teal-800"
                  }`}
                >
                  {isHealthHistoryLocked ? (
                    <Lock className="w-4 h-4 text-amber-700" />
                  ) : (
                    <Unlock className="w-4 h-4 text-teal-800" />
                  )}
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900 leading-tight">
                    {t("privacy_history_lock_heading")}
                  </h2>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      isHealthHistoryLocked
                        ? "bg-amber-100 text-amber-900 border border-amber-300"
                        : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    }`}
                  >
                    {isHealthHistoryLocked
                      ? t("privacy_lock_active")
                      : t("privacy_lock_inactive")}
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-500 pt-1 leading-relaxed">
                {t("privacy_history_lock_sub")}
              </p>
            </div>

            {/* Master iOS-style Toggle Switch */}
            <button
              type="button"
              role="switch"
              aria-checked={!isHealthHistoryLocked}
              onClick={handleToggleMasterHistory}
              className={`w-14 h-8 rounded-full p-1 transition-colors duration-200 ease-in-out cursor-pointer shrink-0 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-600 ${
                !isHealthHistoryLocked ? "bg-teal-700" : "bg-slate-300"
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out flex items-center justify-center text-[10px] font-bold ${
                  !isHealthHistoryLocked
                    ? "translate-x-6 text-teal-800"
                    : "translate-x-0 text-slate-400"
                }`}
              >
                {!isHealthHistoryLocked ? "✓" : "✕"}
              </div>
            </button>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>
              {isHealthHistoryLocked
                ? (isHindi ? "वर्तमान स्थिति: संपूर्ण इतिहास सुरक्षित व छुपा हुआ है" : "Status: All history protected and hidden")
                : (isHindi ? "वर्तमान स्थिति: अधिकृत डॉक्टर आपका इतिहास देख सकते हैं" : "Status: Authorized doctors can view history")}
            </span>
            <span className="font-bold text-teal-800">
              {isHealthHistoryLocked
                ? (isHindi ? "अनलॉक करने हेतु स्विच दबाएं" : "Toggle switch to unlock")
                : (isHindi ? "छुपाने हेतु स्विच दबाएं" : "Toggle switch to hide")}
            </span>
          </div>
        </section>

        {/* -------------------------------------------------------------
            FILTER TABS: PERMISSIONS / DIAGNOSES / REPORTS / AUDIT
        -------------------------------------------------------------- */}
        <div className="flex p-1.5 rounded-2xl bg-slate-200/80 border border-slate-200 text-xs font-bold gap-1 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`flex-1 min-w-[80px] py-2 px-2.5 rounded-xl transition cursor-pointer text-center whitespace-nowrap ${
              activeTab === "all"
                ? "bg-white text-teal-900 shadow-xs font-black"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {t("privacy_tab_permissions")} ({activeConsents.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("diagnoses")}
            className={`flex-1 min-w-[80px] py-2 px-2.5 rounded-xl transition cursor-pointer text-center whitespace-nowrap ${
              activeTab === "diagnoses"
                ? "bg-white text-teal-900 shadow-xs font-black"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {t("privacy_tab_diagnoses")} ({diagnosesPrivacy?.length || 4})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("reports")}
            className={`flex-1 min-w-[80px] py-2 px-2.5 rounded-xl transition cursor-pointer text-center whitespace-nowrap ${
              activeTab === "reports"
                ? "bg-white text-teal-900 shadow-xs font-black"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {t("privacy_tab_reports")} ({reportsPrivacy?.length || 4})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("audit")}
            className={`flex-1 min-w-[80px] py-2 px-2.5 rounded-xl transition cursor-pointer text-center whitespace-nowrap ${
              activeTab === "audit"
                ? "bg-white text-teal-900 shadow-xs font-black"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {t("privacy_tab_audit")}
          </button>
        </div>

        {/* -------------------------------------------------------------
            TAB 1: PERMISSIONS & ACTIVE CONSENTS (WITH INSTANT TOGGLE!)
        -------------------------------------------------------------- */}
        {(activeTab === "all" || activeTab === "permissions") && (
          <section aria-label="Sharing Permissions" className="space-y-3">
            <div className="px-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {t("privacy_active_consents")}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {isHindi
                  ? "अस्पताल व डॉक्टर को दी गई अनुमतियां। आप किसी भी समय स्विच बंद या पुनः चालू कर सकते हैं।"
                  : "Permissions granted to hospital terminals and doctors. Toggle switch to pause or re-allow anytime."}
              </p>
            </div>

            <div className="space-y-3">
              {activeConsents.map((consent) => {
                const isActive = consent.status === "ACTIVE";

                return (
                  <div
                    key={consent.id}
                    className={`p-4 sm:p-5 rounded-3xl border transition shadow-xs space-y-3 ${
                      isActive
                        ? "bg-white border-slate-200/90"
                        : "bg-slate-100/80 border-slate-300 opacity-90"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-black text-slate-900">
                            {consent.title}
                          </h4>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              isActive
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                : "bg-rose-50 text-rose-800 border-rose-200"
                            }`}
                          >
                            {isActive
                              ? (isHindi ? "सक्रिय (साझा)" : "Active (Shared)")
                              : (isHindi ? "रोका गया (बंद)" : "Paused (Withdrawn)")}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {consent.purpose}
                        </p>
                      </div>

                      {/* Instant Toggle Switch for Consent */}
                      <button
                        type="button"
                        role="switch"
                        aria-checked={isActive}
                        onClick={() => handleToggleConsentItem(consent.id, isActive)}
                        className={`w-12 h-7 rounded-full p-0.5 transition-colors duration-200 ease-in-out cursor-pointer shrink-0 focus:outline-none ${
                          isActive ? "bg-teal-700" : "bg-slate-300"
                        }`}
                        title={isActive ? t("privacy_btn_withdraw") : t("privacy_btn_reallow")}
                      >
                        <div
                          className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out flex items-center justify-center text-[9px] font-bold ${
                            isActive
                              ? "translate-x-5 text-teal-800"
                              : "translate-x-0 text-slate-400"
                          }`}
                        >
                          {isActive ? "✓" : "✕"}
                        </div>
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
                      <span>
                        {isHindi ? "स्वीकृत:" : "Granted:"} {consent.grantedAt}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedConsent(consent);
                          setScreen(SCREENS.CONSENT_DETAILS);
                        }}
                        className="font-bold text-teal-800 hover:text-teal-950 flex items-center gap-0.5 cursor-pointer"
                      >
                        <span>{isHindi ? "पूर्ण विवरण" : "Full Details"}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* -------------------------------------------------------------
            TAB 2: PREVIOUS DIAGNOSES PRIVACY (SIMPLE GRANULAR TOGGLE!)
        -------------------------------------------------------------- */}
        {(activeTab === "all" || activeTab === "diagnoses") && (
          <section aria-label="Diagnoses Privacy" className="space-y-3 pt-1">
            <div className="px-1">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-teal-800" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  {t("privacy_diagnoses_title")}
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                {t("privacy_diagnoses_sub")}
              </p>
            </div>

            <div className="space-y-2.5">
              {diagnosesPrivacy.map((diag) => {
                const isLocked = diag.locked;
                const diagTitle = isHindi ? diag.hiTitle : diag.title;
                const diagCat = isHindi ? diag.hiCategory : diag.category;

                return (
                  <div
                    key={diag.id}
                    className={`p-4 rounded-2xl border transition shadow-2xs flex items-center justify-between gap-3 ${
                      isLocked
                        ? "bg-amber-50/70 border-amber-200"
                        : "bg-white border-slate-200"
                    }`}
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {isLocked ? (
                          <EyeOff className="w-4 h-4 text-amber-700 shrink-0" />
                        ) : (
                          <Eye className="w-4 h-4 text-teal-700 shrink-0" />
                        )}
                        <h4 className="text-sm font-bold text-slate-900 truncate">
                          {diagTitle}
                        </h4>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <span>{diagCat}</span>
                        <span>·</span>
                        <span>{diag.date}</span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                            isLocked
                              ? "bg-amber-200/80 text-amber-950"
                              : "bg-emerald-100 text-emerald-900"
                          }`}
                        >
                          {isLocked ? t("privacy_badge_hidden") : t("privacy_badge_shared")}
                        </span>
                      </div>
                    </div>

                    {/* Instant Toggle Switch */}
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={!isLocked}
                        onClick={() => handleToggleDiagnosis(diag.id, isLocked)}
                        className={`w-12 h-7 rounded-full p-0.5 transition-colors duration-200 ease-in-out cursor-pointer focus:outline-none ${
                          !isLocked ? "bg-teal-700" : "bg-amber-500"
                        }`}
                        title={!isLocked ? t("privacy_toggle_hide") : t("privacy_toggle_share")}
                      >
                        <div
                          className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out flex items-center justify-center text-[9px] font-bold ${
                            !isLocked
                              ? "translate-x-5 text-teal-800"
                              : "translate-x-0 text-amber-800"
                          }`}
                        >
                          {!isLocked ? "✓" : "🔒"}
                        </div>
                      </button>
                      <span className="text-[10px] font-bold text-slate-500">
                        {!isLocked
                          ? (isHindi ? "साझा" : "Shared")
                          : (isHindi ? "छुपाया गया" : "Hidden")}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* -------------------------------------------------------------
            TAB 3: MEDICAL REPORTS PRIVACY (TOGGLE SPECIFIC REPORT GROUPS)
        -------------------------------------------------------------- */}
        {(activeTab === "all" || activeTab === "reports") && (
          <section aria-label="Reports Privacy" className="space-y-3 pt-1">
            <div className="px-1">
              <div className="flex items-center gap-2">
                <FolderHeart className="w-4 h-4 text-teal-800" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  {t("privacy_reports_title")}
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                {t("privacy_reports_sub")}
              </p>
            </div>

            <div className="space-y-2.5">
              {reportsPrivacy.map((rep) => {
                const isLocked = rep.locked;
                const repTitle = isHindi ? rep.hiTitle : rep.title;

                return (
                  <div
                    key={rep.id}
                    className={`p-4 rounded-2xl border transition shadow-2xs flex items-center justify-between gap-3 ${
                      isLocked
                        ? "bg-amber-50/70 border-amber-200"
                        : "bg-white border-slate-200"
                    }`}
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {isLocked ? (
                          <Lock className="w-4 h-4 text-amber-700 shrink-0" />
                        ) : (
                          <FileText className="w-4 h-4 text-teal-700 shrink-0" />
                        )}
                        <h4 className="text-sm font-bold text-slate-900 truncate">
                          {repTitle}
                        </h4>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <span>{rep.count} {isHindi ? "दस्तावेज़" : "documents"}</span>
                        <span>·</span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                            isLocked
                              ? "bg-amber-200/80 text-amber-950"
                              : "bg-emerald-100 text-emerald-900"
                          }`}
                        >
                          {isLocked ? t("privacy_badge_hidden") : t("privacy_badge_shared")}
                        </span>
                      </div>
                    </div>

                    {/* Instant Toggle Switch */}
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={!isLocked}
                        onClick={() => handleToggleReport(rep.id, isLocked)}
                        className={`w-12 h-7 rounded-full p-0.5 transition-colors duration-200 ease-in-out cursor-pointer focus:outline-none ${
                          !isLocked ? "bg-teal-700" : "bg-amber-500"
                        }`}
                        title={!isLocked ? t("privacy_toggle_hide") : t("privacy_toggle_share")}
                      >
                        <div
                          className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out flex items-center justify-center text-[9px] font-bold ${
                            !isLocked
                              ? "translate-x-5 text-teal-800"
                              : "translate-x-0 text-amber-800"
                          }`}
                        >
                          {!isLocked ? "✓" : "🔒"}
                        </div>
                      </button>
                      <span className="text-[10px] font-bold text-slate-500">
                        {!isLocked
                          ? (isHindi ? "साझा" : "Shared")
                          : (isHindi ? "छुपाया गया" : "Hidden")}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* -------------------------------------------------------------
            TAB 4: ACCESS HISTORY AUDIT TRAIL
        -------------------------------------------------------------- */}
        {(activeTab === "all" || activeTab === "audit") && (
          <section aria-label="Access History Audit" className="space-y-3 pt-1">
            <div className="px-1">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-slate-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  {t("privacy_access_audit")}
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {isHindi
                  ? "हाल ही में किस डॉक्टर या कियोस्क टर्मिनल ने कौन सी जानकारी एक्सेस या अद्यतन की।"
                  : "Transparent audit log of who accessed or updated your medical information."}
              </p>
            </div>

            <div className="space-y-2">
              {accessHistory.slice(0, 4).map((entry) => (
                <div
                  key={entry.id}
                  className="p-3.5 rounded-2xl bg-white border border-slate-200 text-xs space-y-1 shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">
                      {entry.organization}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {entry.date} · {entry.time}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    {entry.informationAccessed} · {entry.purpose}
                  </p>
                  <div className="flex items-center gap-1.5 pt-0.5">
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                        entry.status === "ACTIVE"
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {entry.status}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {entry.accessedByRole}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNavBar />
    </div>
  );
};

export default PrivacyScreen;
