import React, { useEffect } from "react";
import {
  CheckCircle2,
  Circle,
  Loader2,
  FileSearch,
  Sparkles,
  Shield,
} from "lucide-react";
import useMobileStore, { SCREENS } from "../../store/useMobileStore";
import MobileHeader from "../../components/mobile/MobileHeader";
import { useLanguage } from "../../i18n/translations";

const ANALYSIS_STEPS = [
  { id: 0, labelEn: "Image Captured", labelHi: "छवि कैप्चर हुई" },
  { id: 1, labelEn: "Image Enhanced", labelHi: "छवि संवर्धित हुई" },
  { id: 2, labelEn: "Reading Text", labelHi: "पाठ पढ़ा जा रहा है" },
  { id: 3, labelEn: "Understanding Medical Information", labelHi: "चिकित्सा जानकारी समझी जा रही है" },
  { id: 4, labelEn: "Extracting Important Details", labelHi: "आवश्यक विवरण निकाले जा रहे हैं" },
];

/**
 * M5 — ANALYSING DOCUMENT
 * Visual progress stepper simulating AI/OCR document ingestion.
 * Shows patient exactly which processing stage the healthcare system is in.
 */
export const M5_DocumentAnalysis = () => {
  const {
    analysisStep,
    runAnalysisSimulation,
    setScreen,
    capturedDocuments,
    documentSets,
  } = useMobileStore();
  const { isHindi } = useLanguage();

  const totalPages = capturedDocuments?.length || 1;
  const activeSets = (documentSets || []).filter((s) => s.pages && s.pages.length > 0);
  const setsSummary =
    activeSets.length > 1
      ? activeSets.map((s) => `${s.title} (${s.pages.length}${isHindi ? "पृ" : "p"})`).join(" & ")
      : "";

  useEffect(() => {
    // Start automated progress simulation
    runAnalysisSimulation(() => {
      // Transition to Extracted Information (M6) upon completion
      setTimeout(() => {
        setScreen(SCREENS.M6);
      }, 500);
    });
  }, [runAnalysisSimulation, setScreen]);

  const getHeaderTitle = () => {
    if (activeSets.length > 1) {
      return isHindi
        ? `${activeSets.length} दस्तावेज़ सेट संसाधित हो रहे हैं (${totalPages} पृष्ठ)`
        : `Processing ${activeSets.length} Document Sets (${totalPages} Pages)`;
    }
    if (totalPages > 1) {
      return isHindi
        ? `${totalPages} दस्तावेज़ संसाधित हो रहे हैं`
        : `Processing ${totalPages} Documents`;
    }
    return isHindi ? "दस्तावेज़ संसाधित हो रहा है" : "Processing Document";
  };

  const getMainHeading = () => {
    if (activeSets.length > 1) {
      return isHindi
        ? `${activeSets.length} दस्तावेज़ सेट पढ़े जा रहे हैं (${totalPages} पृष्ठ)`
        : `Reading ${activeSets.length} Document Sets (${totalPages} pages)`;
    }
    if (totalPages > 1) {
      return isHindi
        ? `आपके दस्तावेज़ पढ़े जा रहे हैं (${totalPages} पृष्ठ)`
        : `Reading your documents (${totalPages} pages)`;
    }
    return isHindi ? "आपका दस्तावेज़ पढ़ा जा रहा है" : "Reading your document";
  };

  const getSubheading = () => {
    if (setsSummary) {
      return isHindi
        ? `एआई इनसे चिकित्सा जानकारी निकाल रहा है: ${setsSummary}`
        : `AI is extracting medical information from: ${setsSummary}`;
    }
    if (totalPages > 1) {
      return isHindi
        ? `एआई सभी ${totalPages} पृष्ठों से चिकित्सा जानकारी निकाल रहा है`
        : `AI is extracting medical information from all ${totalPages} captured pages`;
    }
    return isHindi
      ? "एआई दस्तावेज़ से आवश्यक चिकित्सा जानकारी निकाल रहा है"
      : "AI is extracting medical information from the document";
  };

  return (
    <div className="min-h-full flex flex-col justify-between bg-slate-50">
      {/* Header */}
      <MobileHeader
        title={getHeaderTitle()}
        showBack={false}
      />

      {/* Main Content Area */}
      <main className="flex-1 px-5 py-6 max-w-md mx-auto w-full flex flex-col justify-center items-center text-center space-y-6">
        {/* Animated Scanner Pulse Ring */}
        <div className="relative flex items-center justify-center">
          <div className="w-24 h-24 rounded-full bg-teal-100 animate-pulse-ring absolute"></div>
          <div className="w-20 h-20 rounded-full bg-teal-50 border-2 border-teal-600 flex items-center justify-center text-teal-800 shadow-md relative z-10">
            <FileSearch className="w-9 h-9 animate-pulse text-[#006666]" />
          </div>
        </div>

        {/* Headings */}
        <div className="space-y-1.5">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {getMainHeading()}
          </h2>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            {getSubheading()}
          </p>
        </div>

        {/* Progress Stepper List */}
        <div className="w-full bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm text-left space-y-3.5">
          {ANALYSIS_STEPS.map((step) => {
            const isCompleted = analysisStep > step.id;
            const isCurrent = analysisStep === step.id;
            const isPending = analysisStep < step.id;
            const label = isHindi ? step.labelHi : step.labelEn;

            return (
              <div
                key={step.id}
                className={`flex items-center gap-3.5 transition-all duration-300 ${
                  isPending ? "opacity-40" : "opacity-100"
                }`}
              >
                {/* Step Status Icon */}
                <div className="shrink-0 flex items-center justify-center">
                  {isCompleted ? (
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 fill-emerald-100 text-emerald-700" />
                    </div>
                  ) : isCurrent ? (
                    <div className="w-6 h-6 rounded-full bg-teal-100 text-[#006666] flex items-center justify-center animate-spin">
                      <Loader2 className="w-5 h-5" />
                    </div>
                  ) : (
                    <Circle className="w-5 h-5 text-slate-300 stroke-[1.75]" />
                  )}
                </div>

                {/* Step Label */}
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-sm font-bold truncate ${
                      isCurrent
                        ? "text-[#006666]"
                        : isCompleted
                        ? "text-slate-800"
                        : "text-slate-400"
                    }`}
                  >
                    {label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Clinical Safe Subtext */}
        <div className="pt-2 text-[11px] text-slate-400 flex items-center gap-1.5 justify-center">
          <Shield className="w-3.5 h-3.5 text-slate-400" />
          <span>
            {isHindi
              ? "इसमें कुछ सेकंड लग सकते हैं · निजी व सुरक्षित"
              : "This may take a few seconds · Private & Secure"}
          </span>
        </div>
      </main>

      {/* Footer spacer */}
      <div className="pb-safe"></div>
    </div>
  );
};

export default M5_DocumentAnalysis;
