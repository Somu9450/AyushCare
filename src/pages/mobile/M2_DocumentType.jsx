import React from "react";
import { ArrowRight, Info } from "lucide-react";
import useMobileStore, { SCREENS } from "../../store/useMobileStore";
import { mockDocumentTypes } from "../../data/mockData";
import MobileHeader from "../../components/mobile/MobileHeader";
import DocumentTypeCard from "../../components/mobile/DocumentTypeCard";
import PrimaryButton from "../../components/mobile/PrimaryButton";
import BottomActionBar from "../../components/mobile/BottomActionBar";
import { useLanguage } from "../../i18n/translations";

/**
 * M2 — SELECT DOCUMENT TYPE
 * Allows the patient to choose the category of document they are about to capture.
 */
export const M2_DocumentType = () => {
  const {
    selectedDocumentType,
    setSelectedDocumentType,
    setScreen,
    prevScreen,
  } = useMobileStore();
  const { isHindi } = useLanguage();

  const handleContinue = () => {
    if (!selectedDocumentType) return;
    setScreen(SCREENS.M3);
  };

  return (
    <div className="min-h-full flex flex-col justify-between bg-slate-50">
      {/* Header */}
      <MobileHeader
        title={isHindi ? "दस्तावेज़ का प्रकार चुनें" : "Select Document Type"}
        showBack={true}
        onBack={prevScreen}
      />

      {/* Main Content */}
      <main className="flex-1 px-4 sm:px-6 py-4 sm:py-6 max-w-md md:max-w-3xl lg:max-w-4xl mx-auto w-full space-y-5">
        {/* Step Indicator */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-black tracking-wider uppercase bg-teal-100 text-teal-800 px-2.5 py-0.5 rounded-full">
            {isHindi ? "चरण 1 / 4" : "Step 1 of 4"}
          </span>
          <span className="text-xs text-slate-400 font-medium">
            {isHindi ? "दस्तावेज़ चयन" : "Document Selection"}
          </span>
        </div>

        {/* Heading */}
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
            {isHindi ? "आप क्या अपलोड कर रहे हैं?" : "What are you uploading?"}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
            {isHindi
              ? "अपने दस्तावेज़ से मेल खाती श्रेणी चुनें ताकि एआई सही नैदानिक विवरण निकाल सके।"
              : "Select the category that best matches your document to help AI extract the correct clinical details."}
          </p>
        </div>

        {/* Options Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {mockDocumentTypes.map((type) => (
            <DocumentTypeCard
              key={type.id}
              type={type}
              isSelected={selectedDocumentType === type.id}
              onSelect={setSelectedDocumentType}
            />
          ))}
        </div>

        {/* Helper Notice */}
        <div className="p-3 rounded-xl bg-white border border-slate-200/80 text-xs text-slate-500 flex items-start gap-2">
          <Info className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
          <p className="leading-normal">
            {isHindi
              ? "आप कागज़ की पर्चियों की फोटो खींच सकते हैं या फोन से पीडीएफ/फोटो अपलोड कर सकते हैं।"
              : "You can capture physical paper slips or upload PDF/images from your phone."}
          </p>
        </div>
      </main>

      {/* Bottom Action Bar */}
      <BottomActionBar>
        <PrimaryButton
          onClick={handleContinue}
          disabled={!selectedDocumentType}
          icon={ArrowRight}
        >
          {isHindi ? "आगे बढ़ें" : "Continue"}
        </PrimaryButton>
      </BottomActionBar>
    </div>
  );
};

export default M2_DocumentType;
