import React, { useState } from "react";
import {
  ArrowLeft,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  Clock,
  Calendar,
  Building2,
  FileText,
  AlertCircle,
  XCircle,
  HelpCircle,
  UserCheck,
  Check,
} from "lucide-react";
import useMobileStore, { SCREENS } from "../../store/useMobileStore";
import MobileHeader from "../../components/mobile/MobileHeader";
import BottomNavBar from "../../components/mobile/BottomNavBar";
import PrivacyConfirmModal from "../../components/mobile/PrivacyConfirmModal";
import { useLanguage } from "../../i18n/translations";

/**
 * ConsentDetailsScreen
 * Detailed view of an active or historical consent permission:
 * - What information is shared
 * - Who can access it
 * - Why it is needed
 * - Granted date, scope, and status
 * - Patient action to withdraw/revoke access
 */
export const ConsentDetailsScreen = () => {
  const {
    selectedConsent,
    privacyData,
    withdrawConsent,
    regrantConsent,
    setScreen,
    prevScreen,
  } = useMobileStore();
  const { isHindi } = useLanguage();

  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [successToast, setSuccessToast] = useState(null);

  // Fallback to first consent in mockPrivacyData if none specifically selected
  const activeConsentList = privacyData.activeConsents || [];
  const consent =
    selectedConsent ||
    activeConsentList[0] || {
      id: "consent-001",
      title: "Hospital Consultation Access",
      purpose: "Share your health history and documents with the care team for your consultation.",
      whyNeeded:
        "Allows the consulting physician to review previous diagnoses, current medications, and past lab investigations during your clinical consultation.",
      informationShared: [
        "Patient-reported symptoms and intake vitals",
        "Recorded healthcare visits and clinical history",
        "Relevant medical documents and test reports",
        "Active prescription history and clinical summary",
      ],
      accessedBy: "Connected hospital care team · Civil Hospital OPD",
      status: "ACTIVE",
      grantedAt: "05 Sep 2026 · 10:24 AM",
      expiresAt: "Today, end of consultation",
      lastUpdated: "05 Sep 2026 · 10:24 AM",
      scope: "Current consultation encounter (#AY-OPD-108)",
    };

  const isWithdrawn = consent.status === "WITHDRAWN";

  const handleWithdrawConfirm = () => {
    withdrawConsent(consent.id);
    setIsWithdrawModalOpen(false);
    setSuccessToast(isHindi ? "सहमति सफलतापूर्वक रोक दी गई" : "Access paused successfully");
    setTimeout(() => {
      setSuccessToast(null);
    }, 3000);
  };

  const handleRegrantAccess = () => {
    regrantConsent(consent.id);
    setSuccessToast(isHindi ? "सहमति पुनः स्वीकृत की गई ✓" : "Access re-allowed successfully ✓");
    setTimeout(() => {
      setSuccessToast(null);
    }, 3000);
  };

  return (
    <div className="min-h-full flex flex-col justify-between bg-slate-50 text-slate-900 select-none">
      {/* Header */}
      <MobileHeader
        title={isHindi ? "सहमति विवरण" : "Consent Details"}
        showBack={true}
        onBack={() => setScreen(SCREENS.PRIVACY)}
      />

      {/* Main Content */}
      <main className="flex-1 px-4 sm:px-6 py-4 sm:py-6 max-w-md md:max-w-2xl lg:max-w-3xl mx-auto w-full space-y-4">
        {/* Success Toast */}
        {successToast && (
          <div className="p-3.5 rounded-2xl bg-emerald-950 text-emerald-200 border border-emerald-500/60 shadow-lg text-xs font-bold flex items-center justify-between gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>{successToast}</span>
            </div>
            <span className="text-[10px] text-emerald-300">
              {isHindi ? "अद्यतित" : "Updated"}
            </span>
          </div>
        )}

        {/* Top Summary Card */}
        <section
          aria-label="Consent Summary"
          className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-3"
        >
          <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded border border-teal-200">
                {isHindi ? "साझाकरण अनुमति" : "Sharing Permission"}
              </span>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
                {consent.title}
              </h2>
            </div>

            {/* Status Badge */}
            {isWithdrawn ? (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-800 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200 shrink-0">
                <XCircle className="w-3.5 h-3.5 text-rose-600" />
                <span>{isHindi ? "वापस ली गई" : "Withdrawn"}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{isHindi ? "सक्रिय" : "Active"}</span>
              </span>
            )}
          </div>

          {/* Primary Purpose */}
          <div className="space-y-1 text-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              {isHindi ? "उद्देश्य" : "Purpose"}
            </span>
            <p className="text-sm font-semibold text-slate-800 leading-relaxed">
              {consent.purpose}
            </p>
          </div>
        </section>

        {/* Why this is needed */}
        {consent.whyNeeded && (
          <section
            aria-label="Why Needed"
            className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-1.5 text-xs"
          >
            <div className="flex items-center gap-1.5 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
              <HelpCircle className="w-3.5 h-3.5 text-teal-700" />
              <span>{isHindi ? "इसकी आवश्यकता क्यों है?" : "Why is this needed?"}</span>
            </div>
            <p className="text-slate-700 leading-relaxed text-xs sm:text-sm">
              {consent.whyNeeded}
            </p>
          </section>
        )}

        {/* What Information is Shared */}
        <section
          aria-label="What Information is Shared"
          className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-3"
        >
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <FileText className="w-4 h-4 text-teal-800 shrink-0" />
            <h3 className="text-sm font-black text-slate-900">
              {isHindi ? "इस सहमति में शामिल जानकारी" : "Information Covered by This Consent"}
            </h3>
          </div>

          <div className="space-y-2">
            {consent.informationShared?.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-2.5 text-xs text-slate-800"
              >
                <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="font-medium leading-relaxed">{item}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Who Can Access */}
        <section
          aria-label="Recipient Information"
          className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-2.5 text-xs"
        >
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <UserCheck className="w-4 h-4 text-teal-800 shrink-0" />
            <h3 className="text-sm font-black text-slate-900">
              {isHindi ? "इस जानकारी को कौन एक्सेस कर सकता है" : "Who Can Access This Information"}
            </h3>
          </div>

          <p className="text-slate-800 font-bold text-sm">
            {consent.accessedBy}
          </p>

          <div className="grid grid-cols-2 gap-2.5 pt-1 text-[11px]">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-400 block font-semibold uppercase text-[9px]">
                {isHindi ? "स्वीकृत" : "Granted"}
              </span>
              <span className="font-bold text-slate-800 mt-0.5 block">
                {consent.grantedAt}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-400 block font-semibold uppercase text-[9px]">
                {isHindi ? "वैधता" : "Validity"}
              </span>
              <span className="font-bold text-slate-800 mt-0.5 block">
                {consent.expiresAt || (isHindi ? "सक्रिय सत्र" : "Active session")}
              </span>
            </div>
          </div>
        </section>

        {/* Non-destructive Explanation Banner */}
        <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200/90 text-xs text-slate-600 space-y-1">
          <div className="flex items-center gap-2 font-bold text-slate-800">
            <AlertCircle className="w-4 h-4 text-teal-800 shrink-0" />
            <span>{isHindi ? "मरीज़ नियंत्रण सूचना" : "Patient Control Notice"}</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed pl-6">
            {isHindi
              ? "सहमति वापस लेने से जुड़े हुए सत्र इस जानकारी को पढ़ना बंद कर देंगे। आपके व्यक्तिगत मेडिकल रिकॉर्ड, मुलाकातें और इतिहास इस ऐप में आपके लिए पूरी तरह सुरक्षित रहेंगे।"
              : "Withdrawing access stops connected sessions from reading this information. Your personal medical records, visits, and history remain securely available to you in this app."}
          </p>
        </div>

        {/* Action Button: Withdraw Access */}
        <div className="pt-2 pb-6 space-y-2">
          {!isWithdrawn ? (
            <button
              type="button"
              onClick={() => setIsWithdrawModalOpen(true)}
              className="w-full min-h-[50px] px-4 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition active:scale-[0.99] cursor-pointer shadow-2xs"
            >
              <ShieldAlert className="w-4 h-4 text-rose-700" />
              <span>{isHindi ? "पहुंच रोकें / सहमति वापस लें" : "Pause / Withdraw Access"}</span>
            </button>
          ) : (
            <div className="space-y-2">
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-bold text-center">
                {isHindi
                  ? "यह सहमति वर्तमान में रोक दी गई है।"
                  : "Access is currently paused."}
              </div>
              <button
                type="button"
                onClick={handleRegrantAccess}
                className="w-full min-h-[50px] px-4 rounded-2xl bg-teal-800 hover:bg-teal-900 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition active:scale-[0.99] cursor-pointer shadow-sm"
              >
                <ShieldCheck className="w-4 h-4 text-teal-300" />
                <span>{isHindi ? "सहमति पुनः अनुमति दें (साझाकरण चालू करें)" : "Re-Allow Access Permission"}</span>
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => setScreen(SCREENS.PRIVACY)}
            className="w-full min-h-[46px] px-4 rounded-2xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{isHindi ? "गोपनीयता व डेटा नियंत्रण पर वापस जाएं" : "Back to Privacy & Data Control"}</span>
          </button>
        </div>
      </main>

      {/* Persistent Bottom Nav */}
      <BottomNavBar />

      {/* Confirmation Modal */}
      <PrivacyConfirmModal
        isOpen={isWithdrawModalOpen}
        title={isHindi ? "क्या यह सहमति वापस लें?" : "Withdraw this access?"}
        message={
          isHindi
            ? "यदि आप यह सहमति वापस लेते हैं, तो संबंधित स्वास्थ्य सत्र को इसके अंतर्गत आने वाली जानकारी का उपयोग करने की अनुमति नहीं होगी।"
            : "If you withdraw this consent, the selected healthcare session will no longer be allowed to use the information covered by this consent."
        }
        confirmText={isHindi ? "सहमति वापस लें" : "Withdraw Access"}
        cancelText={isHindi ? "रद्द करें" : "Cancel"}
        variant="danger"
        icon={ShieldAlert}
        onConfirm={handleWithdrawConfirm}
        onCancel={() => setIsWithdrawModalOpen(false)}
      />
    </div>
  );
};

export default ConsentDetailsScreen;
