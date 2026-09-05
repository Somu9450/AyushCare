import React, { useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Building2,
  Stethoscope,
  Sparkles,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Activity,
  HeartPulse,
  Thermometer,
  ShieldCheck,
  Pill,
  Info,
  MapPin,
  FileSpreadsheet,
} from "lucide-react";
import useMobileStore, { SCREENS } from "../../store/useMobileStore";
import { mockVisits } from "../../data/mockData";
import MobileHeader from "../../components/mobile/MobileHeader";
import BottomNavBar from "../../components/mobile/BottomNavBar";

/**
 * VISIT DETAILS SCREEN
 * Comprehensive historical record of a single completed healthcare visit encounter.
 * Distinct from scheduled appointment details:
 * - Patient-reported symptoms ("What You Reported")
 * - Neutral clinical history (collapsible)
 * - Recorded medicines with neutral historical notice
 * - Recorded vitals (or "Not recorded for this visit")
 * - Associated visit documents (visual cards)
 * - Doctor & department cards
 * - Neutral visit summary
 * - AYUSH support (Prakriti, Agni, Kostha with explanations)
 */
export const VisitDetailsScreen = () => {
  const {
    selectedVisit,
    prevScreen,
    setScreen,
    medicalRecords,
    setSelectedMedicalRecord,
    setActiveNavTab,
  } = useMobileStore();
  const [isClinicalHistoryOpen, setIsClinicalHistoryOpen] = useState(true);

  // Fallback to first mock visit if none selected directly
  const visit = selectedVisit || mockVisits[0];

  const isAyush = visit.type === "AYUSH";
  const Icon = isAyush ? Sparkles : Stethoscope;

  return (
    <div className="min-h-full flex flex-col justify-between bg-slate-50 text-slate-900 select-none">
      {/* Mobile Header with back arrow */}
      <MobileHeader
        title="Visit Details"
        showBack={true}
        onBack={prevScreen}
      />

      {/* Main Content Area */}
      <main className="flex-1 px-4 sm:px-6 py-4 sm:py-6 max-w-md md:max-w-2xl lg:max-w-3xl mx-auto w-full space-y-5">
        {/* -------------------------------------------------------------
            1. VISIT OVERVIEW CARD
        -------------------------------------------------------------- */}
        <section
          aria-label="Visit Overview"
          className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4"
        >
          {/* Top Bar: Date & Status Badge */}
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-slate-400" />
              <span className="text-base font-black text-slate-900">
                {visit.date}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{visit.status || "Visit completed"}</span>
            </div>
          </div>

          {/* Department, Doctor, Hospital */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-800">
                {visit.department}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                  isAyush
                    ? "bg-amber-50 text-amber-900 border-amber-200"
                    : "bg-teal-50 text-teal-800 border-teal-200"
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{visit.typeLabel || visit.type}</span>
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
              {visit.doctor}
            </h2>

            <div className="flex items-center gap-2 text-xs text-slate-500 pt-0.5">
              <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{visit.hospital}</span>
              {visit.room && (
                <>
                  <span>·</span>
                  <span className="font-medium text-slate-700">{visit.room}</span>
                </>
              )}
            </div>
          </div>
        </section>

        {/* -------------------------------------------------------------
            2. PATIENT-REPORTED SYMPTOMS ("What You Reported")
        -------------------------------------------------------------- */}
        <section
          aria-label="What You Reported"
          className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-3"
        >
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-teal-800 shrink-0" />
              <span>What You Reported</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">
              Intake information
            </span>
          </div>

          {/* Symptoms Tags */}
          <div className="space-y-2.5">
            <div className="flex flex-wrap gap-2">
              {visit.symptoms?.map((symptom, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 shadow-2xs"
                >
                  {symptom}
                </span>
              ))}
            </div>

            {/* Duration & Severity */}
            <div className="grid grid-cols-2 gap-2.5 pt-1 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Duration
                </span>
                <span className="text-sm font-black text-slate-800 mt-0.5 block">
                  {visit.duration || "Recorded in notes"}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Severity
                </span>
                <span className="text-sm font-black text-slate-800 mt-0.5 block">
                  {visit.severity || "Moderate"}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-snug italic pt-1">
              Recorded as reported by patient during check-in; not an automated diagnostic conclusion.
            </p>
          </div>
        </section>

        {/* -------------------------------------------------------------
            3. CLINICAL HISTORY (Collapsible Section)
        -------------------------------------------------------------- */}
        <section
          aria-label="Clinical History"
          className="rounded-3xl bg-white border border-slate-200/90 shadow-xs overflow-hidden"
        >
          <button
            type="button"
            onClick={() => setIsClinicalHistoryOpen(!isClinicalHistoryOpen)}
            className="w-full p-4 sm:p-5 flex items-center justify-between gap-3 text-left transition hover:bg-slate-50 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-800 shrink-0" />
              <h3 className="text-sm font-black text-slate-900">
                Clinical History
              </h3>
            </div>
            {isClinicalHistoryOpen ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {isClinicalHistoryOpen && (
            <div className="px-4 sm:px-5 pb-5 pt-1 border-t border-slate-100 space-y-3 text-xs">
              <div>
                <span className="font-bold text-slate-500 uppercase text-[10px] tracking-wider block">
                  Presenting complaint
                </span>
                <p className="text-slate-800 font-semibold mt-0.5">
                  {visit.clinicalHistory?.complaint || "Discussion of reported symptoms"}
                </p>
              </div>

              <div>
                <span className="font-bold text-slate-500 uppercase text-[10px] tracking-wider block">
                  Duration
                </span>
                <p className="text-slate-800 font-semibold mt-0.5">
                  {visit.clinicalHistory?.duration || visit.duration}
                </p>
              </div>

              {visit.clinicalHistory?.additionalInfo && (
                <div>
                  <span className="font-bold text-slate-500 uppercase text-[10px] tracking-wider block">
                    Additional information
                  </span>
                  <p className="text-slate-700 leading-relaxed mt-0.5">
                    {visit.clinicalHistory.additionalInfo}
                  </p>
                </div>
              )}

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500">
                Historical documentation compiled during doctor consultation.
              </div>
            </div>
          )}
        </section>

        {/* -------------------------------------------------------------
            4. AYUSH CONSULTATION SPECIFICS (If AYUSH Visit)
        -------------------------------------------------------------- */}
        {isAyush && visit.ayushDetails && (
          <section
            aria-label="AYUSH Consultation Details"
            className="p-4 sm:p-5 rounded-3xl bg-amber-50/70 border border-amber-200/90 shadow-xs space-y-3.5"
          >
            <div className="flex items-center gap-2 border-b border-amber-200/80 pb-2.5">
              <Sparkles className="w-4 h-4 text-amber-800 shrink-0" />
              <h3 className="text-sm font-black text-amber-950">
                AYUSH Consultation Assessment
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              {/* Prakriti */}
              {visit.ayushDetails.prakriti && (
                <div className="p-3 rounded-2xl bg-white border border-amber-200/80 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-950">
                      Prakriti (Constitutional Body Type)
                    </span>
                    <span className="font-black text-amber-900 bg-amber-100 px-2 py-0.5 rounded">
                      {visit.ayushDetails.prakriti.value}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    {visit.ayushDetails.prakriti.description}
                  </p>
                </div>
              )}

              {/* Agni */}
              {visit.ayushDetails.agni && (
                <div className="p-3 rounded-2xl bg-white border border-amber-200/80 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-950">
                      Agni (Digestive Strength)
                    </span>
                    <span className="font-black text-amber-900 bg-amber-100 px-2 py-0.5 rounded">
                      {visit.ayushDetails.agni.value}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    {visit.ayushDetails.agni.description}
                  </p>
                </div>
              )}

              {/* Kostha */}
              {visit.ayushDetails.kostha && (
                <div className="p-3 rounded-2xl bg-white border border-amber-200/80 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-950">
                      Kostha (Bowel Habit)
                    </span>
                    <span className="font-black text-amber-900 bg-amber-100 px-2 py-0.5 rounded">
                      {visit.ayushDetails.kostha.value}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    {visit.ayushDetails.kostha.description}
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* -------------------------------------------------------------
            5. MEDICINES
        -------------------------------------------------------------- */}
        <section
          aria-label="Medicines"
          className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-3"
        >
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Pill className="w-4 h-4 text-teal-800 shrink-0" />
              <span>Medicines</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">
              {visit.medications?.length || 0} recorded
            </span>
          </div>

          <div className="space-y-2.5">
            {visit.medications && visit.medications.length > 0 ? (
              visit.medications.map((med, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start justify-between gap-3"
                >
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                      {med.name}
                    </h4>
                    <p className="text-xs text-teal-800 font-medium mt-0.5">
                      {med.instructions}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-white px-2 py-0.5 rounded border border-slate-200 shrink-0">
                    Encounter Rx
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 italic py-2">
                No medications recorded for this visit.
              </p>
            )}

            <p className="text-[11px] text-slate-400 leading-snug italic pt-1">
              Historical information recorded during consultation. Not an active prescription recommendation.
            </p>
          </div>
        </section>

        {/* -------------------------------------------------------------
            6. VITALS
        -------------------------------------------------------------- */}
        <section
          aria-label="Vitals"
          className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-3"
        >
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-800 shrink-0" />
              <span>Vitals</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">
              Recorded at triage / OPD
            </span>
          </div>

          {visit.vitals ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Blood Pressure
                </span>
                <span className="text-sm font-black text-slate-900 mt-0.5 block">
                  {visit.vitals.bp}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Pulse
                </span>
                <span className="text-sm font-black text-slate-900 mt-0.5 block">
                  {visit.vitals.pulse}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  SpO₂
                </span>
                <span className="text-sm font-black text-slate-900 mt-0.5 block">
                  {visit.vitals.spo2}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Temperature
                </span>
                <span className="text-sm font-black text-slate-900 mt-0.5 block">
                  {visit.vitals.temperature}
                </span>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500 text-center">
              Vitals: Not recorded for this visit.
            </div>
          )}
        </section>

        {/* -------------------------------------------------------------
            7. DOCUMENTS ASSOCIATED WITH VISIT
        -------------------------------------------------------------- */}
        <section
          aria-label="Documents from this visit"
          className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-3"
        >
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-800 shrink-0" />
              <span>Documents from this visit</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">
              {visit.documents?.length || 0} attached
            </span>
          </div>

          <div className="space-y-2">
            {visit.documents && visit.documents.length > 0 ? (
              visit.documents.map((docItem, idx) => {
                const docTitle = typeof docItem === "string" ? docItem : (docItem?.fileName || docItem?.name || docItem?.title || "Medical_Document.pdf");
                const docType = typeof docItem === "string" ? "Prescription" : (docItem?.type || "Prescription");
                const docDate = typeof docItem === "string" ? (visit?.date || "Recent") : (docItem?.date || visit?.date || "Recent");
                const isLab = String(docType).toLowerCase().includes("lab");

                return (
                  <div
                    key={idx}
                    onClick={() => {
                      const matched =
                        medicalRecords?.find(
                          (r) =>
                            r.id === docItem?.recordId ||
                            r.title === docTitle
                        ) || {
                          id: docItem?.recordId || `DOC-VISIT-${idx + 1}`,
                          title: docTitle,
                          type: isLab ? "lab_report" : "prescription",
                          typeLabel: docType,
                          displayDate: docDate,
                          source: visit?.hospital || "Hospital OPD",
                          doctor: visit?.doctor || "Doctor",
                          visitId: visit?.id,
                          status: "PROCESSED",
                          extractedInformation: {
                            medicines: visit?.medications || [],
                            diagnosis: [
                              {
                                value:
                                  visit?.clinicalHistory?.complaint ||
                                  "Clinical consultation note",
                              },
                            ],
                          },
                        };
                      setSelectedMedicalRecord(matched);
                      setScreen(SCREENS.DOCUMENT_DETAILS);
                    }}
                    role="button"
                    tabIndex={0}
                    className="p-3.5 rounded-2xl bg-slate-50 hover:bg-teal-50/50 border border-slate-200 hover:border-teal-300 transition-all flex items-center justify-between gap-3 text-xs cursor-pointer active:scale-[0.99] group shadow-2xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-800 border border-teal-200 flex items-center justify-center shrink-0 group-hover:bg-teal-700 group-hover:text-white transition-colors">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 truncate group-hover:text-teal-950">
                          {docType}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {docDate} · {docTitle}
                        </p>
                      </div>
                    </div>

                    <span className="font-bold text-teal-800 flex items-center gap-0.5 shrink-0 group-hover:translate-x-0.5 transition-transform">
                      <span>View Record</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-500 italic py-2">
                No documents attached to this visit.
              </p>
            )}
          </div>

          {/* View All Records Action */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400">All health documents</span>
            <button
              type="button"
              onClick={() => {
                setActiveNavTab("records");
                setScreen(SCREENS.RECORDS);
              }}
              className="font-bold text-teal-800 hover:text-teal-950 flex items-center gap-1 cursor-pointer"
            >
              <span>View All Records →</span>
            </button>
          </div>
        </section>

        {/* -------------------------------------------------------------
            8. DOCTOR / DEPARTMENT INFORMATION
        -------------------------------------------------------------- */}
        <section
          aria-label="Doctor and Department Information"
          className="grid grid-cols-1 sm:grid-cols-2 gap-3"
        >
          {/* Doctor Card */}
          <div className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-1 text-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Doctor
            </span>
            <p className="text-sm font-black text-slate-900 leading-tight">
              {visit.doctor}
            </p>
            <p className="text-[11px] text-teal-800 font-medium">
              {visit.department}
            </p>
          </div>

          {/* Hospital & Room Card */}
          <div className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-1 text-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Hospital & Facility
            </span>
            <p className="text-sm font-black text-slate-900 leading-tight">
              {visit.hospital}
            </p>
            <p className="text-[11px] text-slate-500 font-medium">
              {visit.room || "Outpatient Department"}
            </p>
          </div>
        </section>

        {/* -------------------------------------------------------------
            9. VISIT SUMMARY
        -------------------------------------------------------------- */}
        <section
          aria-label="Visit Summary"
          className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-2"
        >
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <Info className="w-4 h-4 text-teal-800 shrink-0" />
            <h3 className="text-sm font-black text-slate-900">
              Visit Summary
            </h3>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {visit.summary ||
              "This visit included discussion of the patient's reported symptoms and review of available medical information."}
          </p>

          <p className="text-[11px] text-slate-400 leading-snug italic pt-1">
            Historical encounter summary for patient reference.
          </p>
        </section>

        {/* Back to Visits Action */}
        <div className="pt-2 pb-6">
          <button
            type="button"
            onClick={prevScreen}
            className="w-full h-12 rounded-2xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 transition active:scale-[0.99] cursor-pointer shadow-xs"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600" />
            <span>Back to My Visits</span>
          </button>
        </div>
      </main>

      {/* Persistent Bottom Navigation */}
      <BottomNavBar />
    </div>
  );
};

export default VisitDetailsScreen;
