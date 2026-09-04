import React from "react";
import { FileText, Stethoscope, Calendar, User, ShieldCheck } from "lucide-react";

/**
 * DocumentPreview
 * Displays a realistic medical document sheet (prescription, lab report) or preview image.
 * Designed to look like an authentic Indian hospital OPD slip / prescription.
 */
export const DocumentPreview = ({
  documentName = "Prescription_May2026.pdf",
  date = "12 May 2026",
  doctor = "Dr. A. K. Verma, MD (Gen Med)",
  clinic = "Civil Hospital OPD - Room 104",
  patientName = "Rajesh Kumar Sharma",
  patientAge = 42,
  patientGender = "Male",
  imageSrc = null,
  showFullDetails = true,
  className = "",
}) => {
  if (imageSrc) {
    return (
      <div
        className={`w-full overflow-hidden rounded-2xl border border-slate-300 shadow-sm bg-slate-900 ${className}`}
      >
        <img
          src={imageSrc}
          alt="Captured Document"
          className="w-full h-auto max-h-[360px] object-contain mx-auto"
        />
      </div>
    );
  }

  return (
    <div
      className={`w-full rounded-2xl border border-slate-300 bg-white shadow-sm p-4 text-slate-800 font-sans select-none relative overflow-hidden ${className}`}
    >
      {/* Watermark badge */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-[0.03] select-none">
        <Stethoscope className="w-64 h-64 text-teal-900" />
      </div>

      {/* Hospital Header */}
      <div className="border-b-2 border-teal-800 pb-2.5 mb-3 flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-1.5 text-teal-900 font-black text-sm tracking-wide">
            <div className="w-5 h-5 rounded bg-teal-800 text-white flex items-center justify-center text-[10px] font-bold">
              +
            </div>
            <span>CIVIL HOSPITAL OPD</span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium leading-tight mt-0.5">
            Department of Health & Family Welfare • New Delhi
          </p>
          <p className="text-[10px] text-teal-800 font-semibold mt-0.5">
            {clinic}
          </p>
        </div>

        <div className="text-right shrink-0">
          <div className="inline-flex items-center gap-1 text-[11px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
            <Calendar className="w-3 h-3 text-slate-500" />
            <span>{date}</span>
          </div>
          <p className="text-[9px] text-slate-400 mt-1 font-mono">OPD-2026-4491</p>
        </div>
      </div>

      {/* Patient info bar */}
      <div className="bg-slate-50 rounded-xl p-2.5 mb-3 border border-slate-200/70 text-xs grid grid-cols-2 gap-x-2 gap-y-1">
        <div>
          <span className="text-slate-400 text-[10px] block uppercase font-bold">
            Patient Name
          </span>
          <span className="font-bold text-slate-900 truncate block">
            {patientName}
          </span>
        </div>
        <div>
          <span className="text-slate-400 text-[10px] block uppercase font-bold">
            Demographics
          </span>
          <span className="font-semibold text-slate-700">
            {patientAge} Yrs / {patientGender}
          </span>
        </div>
      </div>

      {/* Prescription Content (Rx symbol) */}
      <div className="space-y-2.5 my-2">
        <div className="flex items-center gap-2">
          <span className="text-xl font-serif font-black text-teal-900 italic leading-none">
            ℞
          </span>
          <div className="h-px bg-slate-200 flex-1"></div>
        </div>

        {/* Medicines Mock List */}
        <div className="space-y-2 text-xs font-mono pl-1">
          <div className="flex items-start justify-between gap-2 border-b border-dashed border-slate-200 pb-1.5">
            <div>
              <p className="font-bold text-slate-900 font-sans text-xs">
                1. Tab. Paracetamol 650 mg
              </p>
              <p className="text-[11px] text-slate-500">BD (Twice daily) - After meals</p>
            </div>
            <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
              5 Days
            </span>
          </div>

          <div className="flex items-start justify-between gap-2 border-b border-dashed border-slate-200 pb-1.5">
            <div>
              <p className="font-bold text-slate-900 font-sans text-xs">
                2. Tab. Metformin 500 mg
              </p>
              <p className="text-[11px] text-slate-500">1-0-1 - Morning & Night</p>
            </div>
            <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
              Cont.
            </span>
          </div>

          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-bold text-slate-900 font-sans text-xs">
                3. Tab. Amlodipine 5 mg
              </p>
              <p className="text-[11px] text-slate-500">0-0-1 - Bedtime</p>
            </div>
            <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
              Cont.
            </span>
          </div>
        </div>
      </div>

      {/* Doctor Signature & Stamp Footer */}
      {showFullDetails && (
        <div className="mt-4 pt-3 border-t border-slate-200 flex items-end justify-between">
          <div className="text-[10px] text-slate-500">
            <span className="font-bold block text-slate-700">Diagnosis:</span>
            <span>Viral Upper Resp. Infection</span>
          </div>

          <div className="text-right">
            <div className="font-serif italic text-teal-800 text-xs font-bold -mb-0.5">
              Dr. A. K. Verma
            </div>
            <div className="text-[9px] text-slate-400 font-sans">
              Reg: MCI-448129-DL
            </div>
            <div className="inline-block px-1.5 py-0.2 mt-0.5 text-[8px] font-black uppercase text-teal-800 border border-teal-700/40 rounded">
              OPD Verified
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentPreview;
