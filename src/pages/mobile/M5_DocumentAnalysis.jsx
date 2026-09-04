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

const ANALYSIS_STEPS = [
  { id: 0, label: "Image Captured" },
  { id: 1, label: "Image Enhanced" },
  { id: 2, label: "Reading Text" },
  { id: 3, label: "Understanding Medical Information" },
  { id: 4, label: "Extracting Important Details" },
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
  } = useMobileStore();

  useEffect(() => {
    // Start automated progress simulation
    // TODO: Replace simulated processing with backend OCR/document-processing API.
    runAnalysisSimulation(() => {
      // Transition to Extracted Information (M6) upon completion
      setTimeout(() => {
        setScreen(SCREENS.M6);
      }, 500);
    });
  }, [runAnalysisSimulation, setScreen]);

  return (
    <div className="min-h-full flex flex-col justify-between bg-slate-50">
      {/* Header */}
      <MobileHeader
        title="Processing Document"
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
            Reading your document
          </h2>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            AI is extracting medical information
          </p>
        </div>

        {/* Progress Stepper List */}
        <div className="w-full bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm text-left space-y-3.5">
          {ANALYSIS_STEPS.map((step) => {
            const isCompleted = analysisStep > step.id;
            const isCurrent = analysisStep === step.id;
            const isPending = analysisStep < step.id;

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
                    {step.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Clinical Safe Subtext */}
        <div className="pt-2 text-[11px] text-slate-400 flex items-center gap-1.5 justify-center">
          <Shield className="w-3.5 h-3.5 text-slate-400" />
          <span>This may take a few seconds · Private & Secure</span>
        </div>
      </main>

      {/* Footer spacer */}
      <div className="pb-safe"></div>
    </div>
  );
};

export default M5_DocumentAnalysis;
