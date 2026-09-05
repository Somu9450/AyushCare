import React, { useState } from "react";
import {
  ArrowLeft,
  FileText,
  Calendar,
  Building2,
  Stethoscope,
  Pill,
  AlertCircle,
  CheckCircle2,
  Eye,
  Edit2,
  Clock,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  FileSpreadsheet,
  FolderHeart,
  FileCheck,
} from "lucide-react";
import useMobileStore, { SCREENS } from "../../store/useMobileStore";
import { mockMedicalRecords, mockVisits } from "../../data/mockData";
import MobileHeader from "../../components/mobile/MobileHeader";
import BottomNavBar from "../../components/mobile/BottomNavBar";
import OriginalDocModal from "../../components/mobile/OriginalDocModal";
import EditItemModal from "../../components/mobile/EditItemModal";

/**
 * DOCUMENT DETAILS SCREEN
 * Patient record inspection screen displaying:
 * - Document metadata (name, type, date, source hospital, visit link)
 * - Original document preview access
 * - Extracted medicines & diagnosis entities with confidence ratings
 * - Direct correction / edit actions
 * - Plain-language clinical safety warning
 */
export const DocumentDetailsScreen = () => {
  const {
    selectedMedicalRecord,
    medicalRecords,
    setOriginalDocModalOpen,
    setEditingEntity,
    setSelectedVisit,
    setScreen,
    prevScreen,
    capturedDocument,
    setCapturedDocument,
    setActiveNavTab,
  } = useMobileStore();

  // Active record or fallback to first record
  const doc = selectedMedicalRecord || medicalRecords[0] || mockMedicalRecords[0];

  // Lookup associated visit if linked
  const associatedVisit = doc?.visitId
    ? mockVisits.find((v) => v.id === doc.visitId) || null
    : null;

  const extracted = doc?.extractedInformation || {
    medicines: [],
    diagnosis: [],
    prescriptionDate: doc?.displayDate || doc?.date || "Today",
  };

  const medicinesList = Array.isArray(extracted.medicines)
    ? extracted.medicines
    : extracted.medicines
    ? [extracted.medicines]
    : [];

  const diagnosisList = Array.isArray(extracted.diagnosis)
    ? extracted.diagnosis
    : extracted.diagnosis
    ? [extracted.diagnosis]
    : [];

  const handleViewOriginal = () => {
    // TODO: Replace mock/local document source with backend document storage URL.
    setCapturedDocument({
      fileName: doc?.title || "Medical_Document.pdf",
      date: doc?.displayDate || doc?.date || "Today",
      doctor: doc?.doctor || "Doctor",
      clinic: doc?.clinic || doc?.source || "OPD",
      dataUrl: doc?.dataUrl,
    });
    setOriginalDocModalOpen(true);
  };

  const handleOpenAssociatedVisit = () => {
    if (associatedVisit) {
      setSelectedVisit(associatedVisit);
      setActiveNavTab("visits");
      setScreen(SCREENS.VISIT_DETAILS);
    }
  };

  // Status badge styling
  const getStatusBadge = (status) => {
    switch (status) {
      case "CONFIRMED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-700" />
            <span>Confirmed</span>
          </span>
        );
      case "NEEDS_REVIEW":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-300">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            <span>Needs Review</span>
          </span>
        );
      case "PROCESSING":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
            <Clock className="w-3.5 h-3.5 text-blue-600 animate-spin" />
            <span>Processing</span>
          </span>
        );
      case "FAILED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>Failed</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Processed</span>
          </span>
        );
    }
  };

  return (
    <div className="min-h-full flex flex-col justify-between bg-slate-50 text-slate-900 select-none">
      {/* Mobile Header with back button */}
      <MobileHeader
        title="Document Details"
        showBack={true}
        onBack={prevScreen}
      />

      {/* Main Content Area */}
      <main className="flex-1 px-4 sm:px-6 py-4 sm:py-6 max-w-md md:max-w-2xl lg:max-w-3xl mx-auto w-full space-y-5">
        {/* -------------------------------------------------------------
            1. DOCUMENT OVERVIEW CARD
        -------------------------------------------------------------- */}
        <section
          aria-label="Document Overview"
          className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4"
        >
          {/* Top Bar: Type & Status */}
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <span className="text-xs font-black uppercase tracking-wider text-teal-800 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
              {doc.typeLabel || doc.type}
            </span>
            {getStatusBadge(doc.status)}
          </div>

          {/* Title & Metadata */}
          <div className="space-y-1.5">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug break-words">
              {doc.title}
            </h2>

            <div className="flex items-center gap-2 text-xs text-slate-500 pt-0.5 flex-wrap">
              <span className="flex items-center gap-1 font-semibold text-slate-700">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {doc.displayDate || doc.date}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                {doc.source}
              </span>
              {doc.fileSize && (
                <>
                  <span>·</span>
                  <span className="font-mono text-slate-400">{doc.fileSize}</span>
                </>
              )}
            </div>
          </div>

          {/* View Original Action Button */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
            <span className="text-xs text-slate-400">
              Scanned / uploaded paper slip
            </span>
            <button
              type="button"
              onClick={handleViewOriginal}
              className="px-4 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold transition flex items-center gap-1.5 border border-teal-200 cursor-pointer active:scale-95 shadow-2xs"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>View Original</span>
            </button>
          </div>
        </section>

        {/* -------------------------------------------------------------
            2. ASSOCIATED HEALTHCARE VISIT
        -------------------------------------------------------------- */}
        <section
          aria-label="Associated Healthcare Visit"
          className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-2.5"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Stethoscope className="w-3.5 h-3.5 text-teal-800" />
              <span>Associated Healthcare Encounter</span>
            </h3>
          </div>

          {associatedVisit ? (
            <div className="flex items-center justify-between gap-3 pt-1">
              <div>
                <p className="text-xs font-bold text-teal-800">
                  {associatedVisit.date} · {associatedVisit.department}
                </p>
                <p className="text-sm font-black text-slate-900 mt-0.5">
                  {associatedVisit.doctor}
                </p>
                <p className="text-[11px] text-slate-500">
                  {associatedVisit.hospital} · {associatedVisit.room || "OPD"}
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenAssociatedVisit}
                className="shrink-0 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <span>Encounter</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic py-1">
              Not linked to a specific visit.
            </p>
          )}
        </section>

        {/* -------------------------------------------------------------
            3. DOCUMENT EXTRACTION CLINICAL SAFETY NOTICE
        -------------------------------------------------------------- */}
        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-xs text-amber-950 space-y-1 shadow-2xs">
          <div className="flex items-center gap-2 font-bold text-amber-900">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
            <span>Please verify highlighted information.</span>
          </div>
          <p className="text-[11px] text-amber-900/90 leading-relaxed pl-6">
            We are showing what was read from your document. This is not a clinical decision.
          </p>
        </div>

        {/* -------------------------------------------------------------
            4. EXTRACTED MEDICATIONS
        -------------------------------------------------------------- */}
        <section
          aria-label="Extracted Medications"
          className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-3"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Pill className="w-4 h-4 text-teal-800 shrink-0" />
              <span>Extracted Medicines</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">
              {medicinesList.length} recognized
            </span>
          </div>

          <div className="space-y-2.5">
            {medicinesList.length > 0 ? (
              medicinesList.map((med) => (
                <div
                  key={med.id || med.name}
                  className={`p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                    med.needsVerification
                      ? "bg-amber-50/60 border-amber-300 ring-1 ring-amber-400/20"
                      : "bg-slate-50/70 border-slate-200"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <p className="text-sm font-bold text-slate-900">
                        {med.name}
                      </p>
                      {med.schedule && (
                        <span className="text-[11px] font-semibold text-slate-600 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                          {med.schedule}
                        </span>
                      )}
                    </div>

                    {med.instruction && (
                      <p className="text-xs text-slate-500 mt-1">
                        {med.instruction}
                      </p>
                    )}

                    {med.needsVerification && (
                      <p className="text-[11px] text-amber-800 mt-1.5 font-medium flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 text-amber-600 shrink-0" />
                        <span>{med.verificationReason || "Please verify against paper copy"}</span>
                      </p>
                    )}
                  </div>

                  <div className="shrink-0 flex flex-col items-end gap-2">
                    {med.needsVerification ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                        <AlertCircle className="w-3 h-3 text-amber-600" />
                        Verify
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        High confidence
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        setEditingEntity({
                          type: "medicine",
                          data: med,
                        })
                      }
                      className="text-xs font-bold text-teal-800 hover:text-teal-950 p-1 flex items-center gap-1 transition cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 italic py-2">
                No medication entities extracted from this document.
              </p>
            )}

            <p className="text-[11px] text-slate-400 leading-snug italic pt-1">
              Extracted from document. Please verify with paper copy.
            </p>
          </div>
        </section>

        {/* -------------------------------------------------------------
            5. EXTRACTED DIAGNOSIS / CLINICAL NOTES
        -------------------------------------------------------------- */}
        <section
          aria-label="Extracted Diagnosis"
          className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-3"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-teal-800 shrink-0" />
              <span>Diagnosis / Document Information</span>
            </h3>
          </div>

          <div className="space-y-2">
            {diagnosisList.length > 0 ? (
              diagnosisList.map((diag, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                    diag.needsVerification
                      ? "bg-amber-50/60 border-amber-300 ring-1 ring-amber-400/20"
                      : "bg-slate-50/70 border-slate-200"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-900">
                      {diag.value || diag.name}
                    </p>
                    {diag.needsVerification && (
                      <p className="text-[11px] text-amber-800 mt-1 font-medium flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 text-amber-600 shrink-0" />
                        <span>{diag.verificationReason || "Verify spelling on original slip"}</span>
                      </p>
                    )}
                  </div>

                  <div className="shrink-0 flex flex-col items-end gap-2">
                    {diag.needsVerification ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                        <AlertCircle className="w-3 h-3 text-amber-600" />
                        Verify
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Verified
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        setEditingEntity({
                          type: "diagnosis",
                          data: {
                            id: diag.id || idx,
                            name: diag.value || diag.name,
                          },
                        })
                      }
                      className="text-xs font-bold text-teal-800 hover:text-teal-950 p-1 flex items-center gap-1 transition cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 italic py-2">
                No specific diagnosis line extracted.
              </p>
            )}

            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 w-fit mt-2">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>
                Prescription Date: <strong>{extracted.prescriptionDate || doc.displayDate}</strong>
              </span>
            </div>
          </div>
        </section>

        {/* Back to Records Action */}
        <div className="pt-2 pb-6">
          <button
            type="button"
            onClick={prevScreen}
            className="w-full h-12 rounded-2xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 transition active:scale-[0.99] cursor-pointer shadow-xs"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600" />
            <span>Back to Medical Records</span>
          </button>
        </div>
      </main>

      {/* Persistent Bottom Navigation */}
      <BottomNavBar />

      {/* Original Document Modal Sheet */}
      <OriginalDocModal />

      {/* Edit Entity Modal */}
      <EditItemModal />
    </div>
  );
};

export default DocumentDetailsScreen;
