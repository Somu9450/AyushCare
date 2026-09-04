import React from "react";
import {
  FileText,
  Calendar,
  Pill,
  Stethoscope,
  AlertCircle,
  CheckCircle2,
  Eye,
  Edit2,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import useMobileStore, { SCREENS } from "../../store/useMobileStore";
import MobileHeader from "../../components/mobile/MobileHeader";
import WarningBanner from "../../components/mobile/WarningBanner";
import PrimaryButton from "../../components/mobile/PrimaryButton";
import SecondaryButton from "../../components/mobile/SecondaryButton";
import BottomActionBar from "../../components/mobile/BottomActionBar";
import OriginalDocModal from "../../components/mobile/OriginalDocModal";
import EditItemModal from "../../components/mobile/EditItemModal";

/**
 * M6 — EXTRACTED INFORMATION
 * Patient verification screen for OCR recognized medications and clinical diagnosis.
 * Highlights low-confidence items with friendly 'Verify' badge.
 */
export const M6_ExtractedInformation = () => {
  const {
    extractedData,
    setOriginalDocModalOpen,
    setEditingEntity,
    confirmExtractedInformation,
    setScreen,
    prevScreen,
  } = useMobileStore();

  const handleConfirm = () => {
    confirmExtractedInformation();
    setScreen(SCREENS.M7);
  };

  return (
    <div className="min-h-full flex flex-col justify-between bg-slate-50">
      {/* Header */}
      <MobileHeader
        title="Extracted Information"
        showBack={true}
        onBack={prevScreen}
      />

      {/* Main Content Area */}
      <main className="flex-1 px-4 sm:px-6 py-4 sm:py-6 max-w-md md:max-w-3xl lg:max-w-4xl mx-auto w-full space-y-5">
        {/* Source Document Tag */}
        <div className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">
                {extractedData.documentName}
              </p>
              <p className="text-[11px] text-slate-500 truncate mt-0.5">
                {extractedData.sourceInfo}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setOriginalDocModalOpen(true)}
            className="shrink-0 px-2.5 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View Original</span>
          </button>
        </div>

        {/* Page Title */}
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
            We Found This Information
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Please check the medications and diagnosis extracted from your document.
          </p>
        </div>

        {/* Prescription Date pill */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl w-fit">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span>Prescription Date: <strong>{extractedData.prescriptionDate}</strong></span>
        </div>

        {/* Section 1: Medicines List */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Pill className="w-3.5 h-3.5 text-teal-700" />
              Medicines ({extractedData.medicines.length})
            </h3>
            <span className="text-[11px] text-slate-400">Tap to edit if needed</span>
          </div>

          <div className="space-y-2">
            {extractedData.medicines.map((med) => (
              <div
                key={med.id}
                className={`p-3.5 rounded-2xl border transition-all text-left flex items-start justify-between gap-3 ${
                  med.needsVerification
                    ? "bg-amber-50/70 border-amber-300 shadow-2xs ring-1 ring-amber-400/20"
                    : "bg-white border-slate-200/90 shadow-2xs"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <p className="text-sm font-bold text-slate-900">
                      {med.name}
                    </p>
                    <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                      {med.schedule}
                    </span>
                  </div>

                  {med.instruction && (
                    <p className="text-xs text-slate-500 mt-1">
                      {med.instruction}
                    </p>
                  )}

                  {med.needsVerification && (
                    <p className="text-[11px] text-amber-800 mt-1.5 font-medium flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 text-amber-600 shrink-0" />
                      <span>{med.verificationReason || "Verify handwriting on original slip"}</span>
                    </p>
                  )}
                </div>

                <div className="shrink-0 flex flex-col items-end gap-2">
                  {/* Confidence Badge */}
                  {med.needsVerification ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300">
                      <AlertCircle className="w-3 h-3 text-amber-600" />
                      Verify
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      High confidence
                    </span>
                  )}

                  {/* Edit button */}
                  <button
                    type="button"
                    onClick={() =>
                      setEditingEntity({
                        type: "medicine",
                        data: med,
                      })
                    }
                    className="text-xs font-semibold text-teal-800 hover:text-teal-950 p-1 flex items-center gap-1 transition"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Diagnosis */}
        <div className="space-y-1.5 pt-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 px-1">
            <Stethoscope className="w-3.5 h-3.5 text-teal-700" />
            Diagnosis
          </h3>

          <div
            className={`p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
              extractedData.diagnosis.needsVerification
                ? "bg-amber-50/70 border-amber-300 shadow-2xs ring-1 ring-amber-400/20"
                : "bg-white border-slate-200 shadow-2xs"
            }`}
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-900">
                {extractedData.diagnosis.name}
              </p>
              {extractedData.diagnosis.needsVerification && (
                <p className="text-[11px] text-amber-800 mt-1 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-amber-600 shrink-0" />
                  <span>{extractedData.diagnosis.verificationReason || "Check diagnosis spelling"}</span>
                </p>
              )}
            </div>

            <div className="shrink-0 flex flex-col items-end gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300">
                <AlertCircle className="w-3 h-3 text-amber-600" />
                Verify
              </span>
              <button
                type="button"
                onClick={() =>
                  setEditingEntity({
                    type: "diagnosis",
                    data: extractedData.diagnosis,
                  })
                }
                className="text-xs font-semibold text-teal-800 hover:text-teal-950 p-1 flex items-center gap-1 transition"
              >
                <Edit2 className="w-3 h-3" />
                <span>Edit</span>
              </button>
            </div>
          </div>
        </div>

        {/* Clinical Safety Warning Banner */}
        <div className="pt-2">
          <WarningBanner
            variant="warning"
            title="Please verify highlighted information."
          >
            <p className="text-xs text-amber-900 leading-relaxed">
              We are only correcting document reading. This is not a clinical decision.
            </p>
          </WarningBanner>
        </div>
      </main>

      {/* Bottom Action Bar */}
      <BottomActionBar>
        <div className="grid grid-cols-2 gap-2.5">
          <SecondaryButton
            onClick={() => setOriginalDocModalOpen(true)}
            icon={Eye}
            variant="outline"
          >
            View Original
          </SecondaryButton>

          <PrimaryButton
            onClick={handleConfirm}
            icon={ArrowRight}
          >
            Confirm
          </PrimaryButton>
        </div>
      </BottomActionBar>

      {/* Modals for viewing original and editing entries */}
      <OriginalDocModal />
      <EditItemModal />
    </div>
  );
};

export default M6_ExtractedInformation;
