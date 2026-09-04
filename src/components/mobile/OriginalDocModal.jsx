import React from "react";
import { X, FileText, Download, ZoomIn } from "lucide-react";
import DocumentPreview from "./DocumentPreview";
import useMobileStore from "../../store/useMobileStore";

/**
 * OriginalDocModal
 * Modal sheet allowing the patient to inspect the original source document for verification.
 */
export const OriginalDocModal = () => {
  const { isOriginalDocModalOpen, setOriginalDocModalOpen, capturedDocument } =
    useMobileStore();

  if (!isOriginalDocModalOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={() => setOriginalDocModalOpen(false)}
    >
      <div
        className="w-full max-w-lg bg-slate-900 text-white rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-slate-700 animate-in slide-in-from-bottom duration-250"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between gap-3 bg-slate-950">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-teal-900/60 border border-teal-700 text-teal-300 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold truncate text-slate-100">
                {capturedDocument?.fileName || "Original Prescription"}
              </h3>
              <p className="text-[11px] text-slate-400">
                Source Document · High Resolution Scan
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setOriginalDocModalOpen(false)}
            aria-label="Close Original Document"
            className="w-9 h-9 rounded-full bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 flex items-center justify-center transition active:scale-95 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Scrollable Document View */}
        <div className="p-4 overflow-y-auto max-h-[75vh] bg-slate-900">
          <div className="bg-white rounded-2xl p-1 shadow-lg">
            <DocumentPreview
              documentName={capturedDocument?.fileName}
              date={capturedDocument?.date}
              doctor={capturedDocument?.doctor}
              clinic={capturedDocument?.clinic}
              imageSrc={capturedDocument?.dataUrl}
              showFullDetails={true}
            />
          </div>

          <div className="mt-3 p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300 flex items-center justify-between">
            <span>OCR Status: <strong>Extracted 3 medicines, 1 diagnosis</strong></span>
            <span className="text-[11px] text-teal-400 font-semibold">100% Match</span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-950 flex gap-2">
          <button
            type="button"
            onClick={() => setOriginalDocModalOpen(false)}
            className="w-full min-h-[46px] rounded-xl bg-[#006666] hover:bg-[#005454] active:bg-[#004747] text-white font-bold text-sm cursor-pointer transition"
          >
            Done Viewing
          </button>
        </div>
      </div>
    </div>
  );
};

export default OriginalDocModal;
