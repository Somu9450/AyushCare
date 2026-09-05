import React from "react";
import {
  MessageSquare,
  FileCheck,
  History,
  Activity,
  Send,
  ShieldAlert,
  Info,
  Layers,
  Sparkles,
} from "lucide-react";
import useMobileStore, { SCREENS } from "../../store/useMobileStore";
import MobileHeader from "../../components/mobile/MobileHeader";
import WarningBanner from "../../components/mobile/WarningBanner";
import HindiAudioButton from "../../components/mobile/HindiAudioButton";
import PrimaryButton from "../../components/mobile/PrimaryButton";
import BottomActionBar from "../../components/mobile/BottomActionBar";
import { useLanguage } from "../../i18n/translations";

/**
 * M8 — HEALTH SUMMARY
 * Plain-language patient health summary synthesizing kiosk inputs and uploaded records.
 * Provides accessible audio readout for patients.
 */
export const M8_HealthSummary = () => {
  const {
    healthSummary,
    submitToDoctor,
    isSendingToDoctor,
    prevScreen,
  } = useMobileStore();
  const { isHindi } = useLanguage();

  const handleSendToDoctor = async () => {
    await submitToDoctor();
  };

  return (
    <div className="min-h-full flex flex-col justify-between bg-slate-50">
      {/* Header */}
      <MobileHeader
        title={isHindi ? "स्वास्थ्य सारांश" : "Health Summary"}
        showBack={true}
        onBack={prevScreen}
      />

      {/* Main Content Area */}
      <main className="flex-1 px-4 sm:px-6 py-4 sm:py-6 max-w-md md:max-w-3xl lg:max-w-4xl mx-auto w-full space-y-5">
        {/* Prominent Clinical Safety Disclaimer: "Not a diagnosis" */}
        <div className="rounded-2xl border-2 border-teal-600 bg-teal-50/80 p-4 shadow-xs">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-teal-700"></span>
            <h3 className="text-sm font-black text-teal-950 uppercase tracking-wide">
              {isHindi ? "यह कोई अंतिम निदान नहीं है" : "Not a diagnosis"}
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-teal-900 leading-relaxed font-medium">
            {isHindi
              ? "यह आपके द्वारा दी गई जानकारी और आपके द्वारा अपलोड किए गए दस्तावेज़ों का सरल भाषा में सारांश है।"
              : "This is a plain-language summary of the information you provided and the documents you uploaded."}
          </p>
          <p className="text-[11px] sm:text-xs text-teal-700 mt-1 font-normal">
            {isHindi
              ? "आपके ओपीडी डॉक्टर व्यक्तिगत रूप से आपकी जांच करेंगे और चिकित्सीय निर्णय लेंगे।"
              : "Your OPD doctor will examine you in person and make clinical decisions."}
          </p>
        </div>

        {/* Audio Feature: Listen to Summary */}
        <div>
          <HindiAudioButton text={healthSummary.hindiAudioText} />
        </div>

        {/* 2-Column Responsive Grid for Clinical Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left Column: What you told us & What your documents show */}
          <div className="space-y-4">
            {/* Section 1: What you told us */}
            <section className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs space-y-2">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-800 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  {isHindi ? "आपने जो हमें बताया" : "What you told us"}
                </h3>
              </div>

              <div className="space-y-1.5 pt-1 text-xs text-slate-700">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <span className="font-semibold text-slate-900">
                    {isHindi ? "बुखार और जोड़ों में दर्द" : "Fever and joint pain"}
                  </span>
                  <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded">
                    {isHindi ? "कियोस्क पर दर्ज" : "Reported at Kiosk"}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <span className="text-slate-600">
                    {isHindi ? "अवधि: लगभग 3 दिन" : "Duration: about 3 days"}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {isHindi ? "मध्यम तीव्रता" : "Moderate severity"}
                  </span>
                </div>
              </div>
            </section>

            {/* Section 2: What your documents show */}
            <section className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs space-y-2">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-800 flex items-center justify-center">
                  <FileCheck className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  {isHindi ? "आपके दस्तावेज़ क्या दर्शाते हैं" : "What your documents show"}
                </h3>
              </div>

              <div className="space-y-1.5 pt-1 text-xs text-slate-700">
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <span className="font-bold text-slate-900">Paracetamol 650 mg</span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {isHindi ? "दिन में दो बार" : "Twice daily"}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <span className="font-bold text-slate-900">Metformin 500 mg</span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {isHindi ? "भोजन के बाद" : "After food"}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <span className="font-bold text-slate-900">Amlodipine 5 mg</span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {isHindi ? "सोते समय" : "At bedtime"}
                  </span>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Medical history & Recent results */}
          <div className="space-y-4">
            {/* Section 3: Your medical history */}
            <section className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs space-y-2">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-800 flex items-center justify-center">
                  <History className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  {isHindi ? "आपका चिकित्सा इतिहास" : "Your medical history"}
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-[10px] uppercase font-bold text-slate-400">
                    {isHindi ? "स्थिति" : "Condition"}
                  </p>
                  <p className="font-bold text-slate-900 mt-0.5">
                    {isHindi ? "2024 से मधुमेह" : "Diabetes since 2024"}
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-[10px] uppercase font-bold text-slate-400">
                    {isHindi ? "हृदय व रक्तचाप" : "Cardiovascular"}
                  </p>
                  <p className="font-bold text-slate-900 mt-0.5">
                    {isHindi ? "उच्च रक्तचाप" : "High Blood Pressure"}
                  </p>
                </div>
              </div>
            </section>

            {/* Section 4: Recent results */}
            <section className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs space-y-2">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-800 flex items-center justify-center">
                    <Activity className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {isHindi ? "हालिया जांच परिणाम" : "Recent results"}
                  </h3>
                </div>
                <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                  {isHindi ? "मई 2026" : "May 2026"}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-900">HbA1c: 8.4%</p>
                  <p className="text-[11px] text-slate-500">
                    {isHindi ? "ब्लड शुगर 186 mg/dL" : "Blood Sugar 186 mg/dL"}
                  </p>
                </div>
                <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                  {isHindi ? "डॉक्टर से समीक्षा करें" : "Review with Doctor"}
                </span>
              </div>
            </section>
          </div>
        </div>

        {/* Information Sources Breakdown */}
        <section className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-teal-700" />
            {isHindi ? "जानकारी के स्रोत" : "Information Sources"}
          </p>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs">
              <p className="text-slate-500 text-[11px]">
                {isHindi ? "मरीज़ द्वारा दर्ज" : "Patient Reported"}
              </p>
              <p className="font-bold text-slate-900 text-sm mt-0.5">
                {isHindi ? "2 प्रविष्टियां" : "2 items"}
              </p>
            </div>
            <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs">
              <p className="text-slate-500 text-[11px]">
                {isHindi ? "चिकित्सा दस्तावेज़" : "Medical Documents"}
              </p>
              <p className="font-bold text-slate-900 text-sm mt-0.5">
                {isHindi ? "3 दस्तावेज़" : "3 documents"}
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Bottom Action Bar */}
      <BottomActionBar>
        <PrimaryButton
          onClick={handleSendToDoctor}
          loading={isSendingToDoctor}
          icon={Send}
        >
          {isHindi ? "जमा करें" : "Submit"}
        </PrimaryButton>
      </BottomActionBar>
    </div>
  );
};

export default M8_HealthSummary;
