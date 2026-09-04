import React, { useState, useEffect } from "react";
import {
  RotateCcw,
  Check,
  CheckCircle2,
  Sparkles,
  SlidersHorizontal,
  Eye,
  ScanLine,
} from "lucide-react";
import useMobileStore, { SCREENS } from "../../store/useMobileStore";
import MobileHeader from "../../components/mobile/MobileHeader";
import DocumentPreview from "../../components/mobile/DocumentPreview";
import PrimaryButton from "../../components/mobile/PrimaryButton";
import SecondaryButton from "../../components/mobile/SecondaryButton";
import BottomActionBar from "../../components/mobile/BottomActionBar";

/**
 * M4 — IMAGE QUALITY REVIEW
 * Allows the patient to inspect the captured document clarity before OCR entity extraction begins.
 */
export const M4_DocumentReview = () => {
  const { capturedDocument, setScreen, prevScreen } = useMobileStore();

  const [processingDone, setProcessingDone] = useState(false);

  useEffect(() => {
    // Quick aesthetic enhancement indicator timer
    const timer = setTimeout(() => {
      setProcessingDone(true);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const handleRetake = () => {
    setScreen(SCREENS.M3);
  };

  const handleUsePhoto = () => {
    setScreen(SCREENS.M5);
  };

  return (
    <div className="min-h-full flex flex-col justify-between bg-slate-100">
      {/* Header */}
      <MobileHeader
        title="Review Document"
        showBack={true}
        onBack={handleRetake}
      />

      {/* Main Content Area */}
      <main className="flex-1 px-4 sm:px-6 py-4 sm:py-6 max-w-md md:max-w-2xl lg:max-w-3xl mx-auto w-full space-y-4">
        {/* Processing indicators bar */}
        <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="font-bold text-slate-700 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-teal-700" />
              Automated Enhancement
            </span>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              {processingDone ? "Applied ✓" : "Optimizing..."}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1.5 mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-500 font-medium">
            <div className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
              <span className="truncate">Straightening</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
              <span className="truncate">Readability</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
              <span className="truncate">Contrast</span>
            </div>
          </div>
        </div>

        {/* Large Document Preview Card */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-700">
              Captured Preview
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              {capturedDocument?.fileName || "Prescription_May2026.pdf"}
            </span>
          </div>

          <div className="shadow-md rounded-2xl overflow-hidden">
            <DocumentPreview
              documentName={capturedDocument?.fileName}
              date={capturedDocument?.date}
              doctor={capturedDocument?.doctor}
              clinic={capturedDocument?.clinic}
              imageSrc={capturedDocument?.dataUrl}
              showFullDetails={false}
            />
          </div>
        </div>

        {/* Clarity prompt question */}
        <div className="text-center pt-1 pb-1">
          <h2 className="text-base font-black text-slate-900 leading-tight">
            Is the document clear enough?
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Make sure patient name, medicines and dosage instructions are clearly readable.
          </p>
        </div>
      </main>

      {/* Dual CTA Bottom Action Bar */}
      <BottomActionBar>
        <div className="grid grid-cols-2 gap-2.5">
          <SecondaryButton
            onClick={handleRetake}
            icon={RotateCcw}
            variant="outline"
          >
            Retake
          </SecondaryButton>

          <PrimaryButton
            onClick={handleUsePhoto}
            icon={Check}
          >
            Use This Photo ✓
          </PrimaryButton>
        </div>
      </BottomActionBar>
    </div>
  );
};

export default M4_DocumentReview;
