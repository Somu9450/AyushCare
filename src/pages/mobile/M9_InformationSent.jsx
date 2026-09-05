import React from "react";
import {
  CheckCircle2,
  Sparkles,
  ArrowRight,
  MonitorCheck,
  RotateCcw,
  Check,
  ShieldCheck,
} from "lucide-react";
import useMobileStore from "../../store/useMobileStore";
import MobileHeader from "../../components/mobile/MobileHeader";
import PrimaryButton from "../../components/mobile/PrimaryButton";
import BottomActionBar from "../../components/mobile/BottomActionBar";
import { useLanguage } from "../../i18n/translations";

const CHECKLIST_ITEMS_EN = [
  "History captured",
  "Documents processed",
  "Timeline created",
  "Doctor summary prepared",
];

const CHECKLIST_ITEMS_HI = [
  "स्वास्थ्य इतिहास दर्ज हुआ",
  "दस्तावेज़ संसाधित हुए",
  "समयरेखा तैयार हुई",
  "डॉक्टर सारांश तैयार हुआ",
];

/**
 * M9 — INFORMATION SENT
 * Final completion screen confirming clinical handoff to the assigned doctor.
 * Prompts the patient to return to the physical hospital kiosk terminal.
 */
export const M9_InformationSent = () => {
  const { session, resetMobileSession } = useMobileStore();
  const { isHindi } = useLanguage();

  const checklistItems = isHindi ? CHECKLIST_ITEMS_HI : CHECKLIST_ITEMS_EN;

  const handleReturnToKiosk = () => {
    resetMobileSession();
  };

  return (
    <div className="min-h-full flex flex-col justify-between bg-slate-50">
      {/* Header */}
      <MobileHeader
        title={isHindi ? "सत्र संपन्न" : "Session Completed"}
        showBack={false}
      />

      {/* Main Content Area */}
      <main className="flex-1 px-5 py-6 max-w-md mx-auto w-full flex flex-col justify-center items-center text-center space-y-6">
        {/* Success Icon with Glow */}
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-md">
            <CheckCircle2 className="w-14 h-14" />
          </div>
          <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-teal-800 text-white flex items-center justify-center shadow-sm">
            <Sparkles className="w-4 h-4 text-emerald-300" />
          </div>
        </div>

        {/* Headings */}
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
            {isHindi ? "आपकी जानकारी भेज दी गई है ✓" : "Your Information Has Been Sent ✓"}
          </h2>
          <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">
            {isHindi
              ? "आपका स्वास्थ्य इतिहास और दस्तावेज़ अब डॉक्टर की समीक्षा हेतु उपलब्ध हैं।"
              : "Your medical history and documents are now available for your doctor to review."}
          </p>
        </div>

        {/* Completed milestones checklist */}
        <div className="w-full bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm text-left space-y-3">
          {checklistItems.map((item, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <span className="text-sm font-bold text-slate-800">
                {item}
              </span>
            </div>
          ))}
        </div>

        {/* Return to Kiosk Instruction Card */}
        <div className="w-full rounded-2xl bg-teal-50/90 border-2 border-teal-600/40 p-4 text-left flex items-start gap-3.5 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-teal-800 text-white flex items-center justify-center shrink-0">
            <MonitorCheck className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-black text-slate-900">
              {isHindi ? "कृपया कियोस्क पर वापस जाएं" : "Please return to the kiosk"}
            </h3>
            <p className="text-xs text-teal-900 mt-0.5 leading-snug">
              {isHindi
                ? "आपका सत्र अस्पताल टर्मिनल के साथ सिंक हो गया है।"
                : "Your session is synced with the hospital terminal."}
            </p>
            <p className="text-[11px] text-slate-500 mt-1 font-mono">
              {isHindi ? "टर्मिनल: " : "Terminal: "}
              {session.terminalName || "Central Delhi OPD Terminal 03"}
            </p>
          </div>
        </div>

        {/* Subtle security confirmation */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>
            {isHindi
              ? "सत्र सुरक्षित रूप से पूर्ण हुआ और ओपीडी डेस्क से जुड़ा है"
              : "Session securely finalized and linked to OPD Desk"}
          </span>
        </div>
      </main>

      {/* Bottom Action Bar */}
      <BottomActionBar>
        <PrimaryButton
          onClick={handleReturnToKiosk}
          icon={RotateCcw}
        >
          {isHindi ? "कियोस्क पर वापस जाएं" : "Return to Kiosk"}
        </PrimaryButton>
      </BottomActionBar>
    </div>
  );
};

export default M9_InformationSent;
