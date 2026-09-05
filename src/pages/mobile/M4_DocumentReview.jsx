import React, { useState, useEffect } from "react";
import {
  RotateCcw,
  Check,
  CheckCircle2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Layers,
  FileText,
} from "lucide-react";
import useMobileStore, { SCREENS } from "../../store/useMobileStore";
import MobileHeader from "../../components/mobile/MobileHeader";
import DocumentPreview from "../../components/mobile/DocumentPreview";
import PrimaryButton from "../../components/mobile/PrimaryButton";
import SecondaryButton from "../../components/mobile/SecondaryButton";
import BottomActionBar from "../../components/mobile/BottomActionBar";

/**
 * M4 — DOCUMENT QUALITY & MULTI-PAGE REVIEW
 * Allows patient to inspect clarity across all captured/uploaded pages before OCR entity extraction.
 * Features:
 * - Pagination between all captured camera shots or uploaded documents
 * - Thumbnail strip to jump directly to any page
 * - Add more pages / Retake actions
 * - Delete unwanted page
 * - Clarity and enhancement indicators
 */
export const M4_DocumentReview = () => {
  const {
    capturedDocument,
    capturedDocuments,
    setCapturedDocument,
    setCapturedDocuments,
    removeCapturedDocument,
    setScreen,
    prevScreen,
  } = useMobileStore();

  const [processingDone, setProcessingDone] = useState(false);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  // Normalize document list
  const docList =
    capturedDocuments && capturedDocuments.length > 0
      ? capturedDocuments
      : capturedDocument
      ? [capturedDocument]
      : [];

  const totalPages = docList.length || 1;
  const safeIndex = Math.min(currentPageIndex, totalPages - 1);
  const activeDoc = docList[safeIndex] || capturedDocument;

  useEffect(() => {
    // Quick aesthetic enhancement indicator timer
    const timer = setTimeout(() => {
      setProcessingDone(true);
    }, 500);
    return () => clearTimeout(timer);
  }, [currentPageIndex]);

  const handleRetakeOrAdd = () => {
    // Return to capture screen while keeping pages in state
    setScreen(SCREENS.M3);
  };

  const handleDeleteCurrentPage = () => {
    if (docList.length <= 1) {
      // If deleting the only page, return to capture
      setScreen(SCREENS.M3);
      return;
    }
    const updated = docList.filter((_, idx) => idx !== safeIndex);
    setCapturedDocuments(updated);
    if (safeIndex >= updated.length) {
      setCurrentPageIndex(updated.length - 1);
    }
  };

  const handleUsePhotos = () => {
    if (docList.length > 0) {
      setCapturedDocument(docList[0]);
    }
    setScreen(SCREENS.M5);
  };

  const handlePrevPage = () => {
    if (safeIndex > 0) {
      setCurrentPageIndex(safeIndex - 1);
    }
  };

  const handleNextPage = () => {
    if (safeIndex < totalPages - 1) {
      setCurrentPageIndex(safeIndex + 1);
    }
  };

  return (
    <div className="min-h-full flex flex-col justify-between bg-slate-100 select-none">
      {/* Header */}
      <MobileHeader
        title={totalPages > 1 ? `Review Documents (${totalPages})` : "Review Document"}
        showBack={true}
        onBack={handleRetakeOrAdd}
      />

      {/* Main Content Area */}
      <main className="flex-1 px-4 sm:px-6 py-3 sm:py-5 max-w-md md:max-w-2xl lg:max-w-3xl mx-auto w-full space-y-3.5">
        {/* Processing indicators bar */}
        <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="font-bold text-slate-700 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-teal-700" />
              <span>Automated Enhancement</span>
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

        {/* Multi-Page Navigation Bar (when 2+ pages) */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between bg-white px-3 py-2 rounded-2xl border border-slate-200/80 shadow-2xs text-xs">
            <button
              type="button"
              onClick={handlePrevPage}
              disabled={safeIndex === 0}
              className={`p-1.5 rounded-xl flex items-center gap-1 font-bold transition cursor-pointer ${
                safeIndex === 0
                  ? "text-slate-300 cursor-not-allowed"
                  : "text-teal-800 hover:bg-teal-50 active:scale-95"
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Prev</span>
            </button>

            <div className="flex items-center gap-1.5 font-black text-slate-800">
              <Layers className="w-3.5 h-3.5 text-teal-700" />
              <span>
                Page {safeIndex + 1} of {totalPages}
              </span>
            </div>

            <button
              type="button"
              onClick={handleNextPage}
              disabled={safeIndex === totalPages - 1}
              className={`p-1.5 rounded-xl flex items-center gap-1 font-bold transition cursor-pointer ${
                safeIndex === totalPages - 1
                  ? "text-slate-300 cursor-not-allowed"
                  : "text-teal-800 hover:bg-teal-50 active:scale-95"
              }`}
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Document Preview Card */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between px-1 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-700">
              <span>Preview</span>
              {totalPages > 1 && (
                <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  Page {safeIndex + 1} of {totalPages}
                </span>
              )}
            </div>
            <span className="text-[11px] font-mono text-slate-400 truncate max-w-[180px]">
              {activeDoc?.fileName || "Document_Page.jpg"}
            </span>
          </div>

          <div className="shadow-md rounded-2xl overflow-hidden bg-white">
            <DocumentPreview
              documentName={activeDoc?.fileName}
              date={activeDoc?.date}
              doctor={activeDoc?.doctor}
              clinic={activeDoc?.clinic}
              imageSrc={activeDoc?.dataUrl}
              showFullDetails={false}
            />
          </div>
        </div>

        {/* Thumbnail Selector Strip (if multiple pages) */}
        {totalPages > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto py-1 px-0.5 no-scrollbar">
            {docList.map((doc, idx) => (
              <button
                key={doc.id || idx}
                type="button"
                onClick={() => setCurrentPageIndex(idx)}
                className={`relative shrink-0 w-14 h-18 rounded-xl overflow-hidden border-2 transition active:scale-95 cursor-pointer shadow-xs ${
                  idx === safeIndex
                    ? "border-teal-600 ring-2 ring-teal-200"
                    : "border-slate-200 opacity-65 hover:opacity-100"
                }`}
              >
                {doc.dataUrl ? (
                  <img
                    src={doc.dataUrl}
                    alt={`Page ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 text-slate-400">
                    <FileText className="w-5 h-5 text-teal-700" />
                  </div>
                )}
                <span className="absolute bottom-0.5 left-0.5 bg-slate-900/80 text-white text-[8px] font-black px-1 rounded">
                  #{idx + 1}
                </span>
              </button>
            ))}

            {/* Add more button in strip */}
            <button
              type="button"
              onClick={handleRetakeOrAdd}
              title="Add more pages"
              className="shrink-0 w-14 h-18 rounded-xl border-2 border-dashed border-teal-300 hover:border-teal-600 bg-teal-50/50 flex flex-col items-center justify-center gap-0.5 text-teal-800 transition active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-teal-700" />
              <span className="text-[9px] font-bold">+Add</span>
            </button>
          </div>
        )}

        {/* Page Actions: Delete Current Page or Add More */}
        <div className="flex items-center justify-between gap-2 px-1 text-xs">
          <button
            type="button"
            onClick={handleRetakeOrAdd}
            className="text-teal-800 hover:text-teal-950 font-bold flex items-center gap-1 cursor-pointer py-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Snap / Upload More Pages</span>
          </button>

          {totalPages > 1 && (
            <button
              type="button"
              onClick={handleDeleteCurrentPage}
              className="text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1 cursor-pointer py-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete this page</span>
            </button>
          )}
        </div>

        {/* Clarity prompt question */}
        <div className="text-center pt-1 pb-1">
          <h2 className="text-base font-black text-slate-900 leading-tight">
            Is the document clear enough?
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Make sure patient name, medicines and doctor signature are clearly readable.
          </p>
        </div>
      </main>

      {/* Dual CTA Bottom Action Bar */}
      <BottomActionBar>
        <div className="grid grid-cols-2 gap-2.5">
          <SecondaryButton
            onClick={handleRetakeOrAdd}
            icon={RotateCcw}
            variant="outline"
          >
            {totalPages > 1 ? "Retake / Add" : "Retake"}
          </SecondaryButton>

          <PrimaryButton
            onClick={handleUsePhotos}
            icon={Check}
          >
            {totalPages > 1 ? `Use All ${totalPages} Photos ✓` : "Use This Photo ✓"}
          </PrimaryButton>
        </div>
      </BottomActionBar>
    </div>
  );
};

export default M4_DocumentReview;
