import React from "react";
import {
  X,
  FileText,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  AlertCircle,
} from "lucide-react";

import DocumentPreview from "./DocumentPreview";
import useMobileStore from "../../store/useMobileStore";
import useLanguage from "../../i18n/translations";

const normalizePage = (page, index) => {
  if (!page) {
    return {
      id: `page-${index + 1}`,
      fileName: `Page ${index + 1}`,
      image: null,
      dataUrl: null,
    };
  }

  return {
    ...page,
    id: page.id || `page-${index + 1}`,
    fileName:
      page.fileName ||
      page.name ||
      `Page ${index + 1}`,
    image:
      page.image ||
      page.dataUrl ||
      page.imageSrc ||
      null,
    dataUrl:
      page.dataUrl ||
      page.image ||
      page.imageSrc ||
      null,
  };
};

export const OriginalDocModal = () => {
  const {
    isOriginalDocModalOpen,
    setOriginalDocModalOpen,
    capturedDocument,
  } = useMobileStore();

  const { isHindi, tr } = useLanguage();

  const [currentPageIndex, setCurrentPageIndex] =
    React.useState(0);

  const [imageError, setImageError] =
    React.useState(false);

  React.useEffect(() => {
    setCurrentPageIndex(0);
    setImageError(false);
  }, [
    isOriginalDocModalOpen,
    capturedDocument?.id,
    capturedDocument?.fileName,
  ]);

  if (!isOriginalDocModalOpen) {
    return null;
  }

  const rawPages = Array.isArray(capturedDocument?.pages)
    ? capturedDocument.pages
    : [];

  const pages =
    rawPages.length > 0
      ? rawPages.map(normalizePage)
      : [
          {
            id: "page-1",
            fileName:
              capturedDocument?.fileName ||
              (tr('Original Document', 'मूल दस्तावेज़')),
            image:
              capturedDocument?.image ||
              capturedDocument?.dataUrl ||
              null,
            dataUrl:
              capturedDocument?.dataUrl ||
              capturedDocument?.image ||
              null,
          },
        ];

  const safePageIndex = Math.min(
    currentPageIndex,
    Math.max(0, pages.length - 1)
  );

  const activePage = pages[safePageIndex];

  const totalPages = pages.length;

  const currentImage =
    activePage?.image ||
    activePage?.dataUrl ||
    activePage?.previewUrl ||
    activePage?.imageUrl ||
    capturedDocument?.document_url ||
    capturedDocument?.download_url ||
    capturedDocument?.url ||
    capturedDocument?.image ||
    capturedDocument?.dataUrl ||
    null;

  const isPdf = Boolean(
    activePage?.mimeType?.includes("pdf") ||
    capturedDocument?.mimeType?.includes("pdf") ||
    String(currentImage || "").toLowerCase().includes(".pdf")
  );

  const isCloudinaryPdf = Boolean(isPdf && currentImage && String(currentImage).includes("cloudinary.com"));

  const documentName =
    activePage?.fileName ||
    capturedDocument?.fileName ||
    capturedDocument?.title ||
    (tr('Original Medical Document', 'मूल चिकित्सीय दस्तावेज़'));

  const docSummary =
    capturedDocument?.summary ||
    capturedDocument?.extractedInformation?.summary ||
    capturedDocument?.extracted_data?.summary ||
    capturedDocument?.extractedInformation?.ai_summary ||
    capturedDocument?.extracted_data?.ai_summary ||
    null;

  const docHealthInfo =
    capturedDocument?.health_info ||
    capturedDocument?.extractedInformation?.health_info ||
    capturedDocument?.extracted_data?.health_info ||
    null;

  const goToPreviousPage = () => {
    setCurrentPageIndex((index) =>
      Math.max(0, index - 1)
    );
    setImageError(false);
  };

  const goToNextPage = () => {
    setCurrentPageIndex((index) =>
      Math.min(totalPages - 1, index + 1)
    );
    setImageError(false);
  };

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={
        tr('Original Document', 'मूल दस्तावेज़')
      }
      onClick={() => setOriginalDocModalOpen(false)}
    >
      <div
        className="w-full max-w-lg max-h-[94vh] bg-slate-950 text-white rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl border border-slate-700 flex flex-col"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Header */}
        <header className="shrink-0 px-4 py-3.5 border-b border-slate-800 bg-slate-950 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-teal-900/60 border border-teal-700 text-teal-300 flex items-center justify-center shrink-0">
              <FileText className="w-4.5 h-4.5" />
            </div>

            <div className="min-w-0">
              <h2 className="text-sm font-black truncate">
                {documentName}
              </h2>

              <p className="text-[10px] text-slate-400 mt-0.5">
                {totalPages > 1
                  ? tr(`Page ${safePageIndex + 1} of ${totalPages}`, `पृष्ठ ${safePageIndex + 1} / ${totalPages}`)
                  : tr('Original source document', 'मूल दस्तावेज़')}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setOriginalDocModalOpen(false)}
            className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer active:scale-95 transition"
            aria-label={
              tr('Close', 'बंद करें')
            }
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* Page selector */}
        {totalPages > 1 && (
          <div className="shrink-0 px-4 py-2.5 bg-slate-900 border-b border-slate-800">
            <div className="flex items-center gap-2 overflow-x-auto">
              {pages.map((page, index) => (
                <button
                  key={page.id || index}
                  type="button"
                  onClick={() => {
                    setCurrentPageIndex(index);
                    setImageError(false);
                  }}
                  className={`shrink-0 px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition ${
                    safePageIndex === index
                      ? "bg-teal-700 text-white"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  {tr(`Page ${index + 1}`, `पृष्ठ ${index + 1}`)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Document */}
        <div className="flex-1 overflow-y-auto bg-slate-900 p-3 sm:p-4">
          <div className="rounded-2xl overflow-hidden bg-white shadow-xl">
            {isPdf && currentImage ? (
              <div className="flex flex-col items-center justify-center p-3 bg-slate-900 min-h-[360px]">
                {isCloudinaryPdf ? (
                  <div className="relative w-full rounded-xl overflow-hidden bg-white">
                    <img
                      src={currentImage.replace(/\.pdf$/i, '.jpg')}
                      alt={documentName}
                      className="block w-full h-auto max-h-[65vh] object-contain bg-white mx-auto"
                      onError={() => setImageError(true)}
                    />
                  </div>
                ) : (
                  <iframe
                    src={currentImage}
                    title={documentName}
                    className="w-full h-[55vh] rounded-xl bg-white border border-slate-700"
                  />
                )}
                <a
                  href={currentImage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-600 active:bg-teal-800 text-white text-xs font-bold transition cursor-pointer shadow-md"
                >
                  <FileText className="w-4 h-4" />
                  {tr('Open Full PDF Document', 'पूरा PDF दस्तावेज़ खोलें')}
                </a>
              </div>
            ) : currentImage && !imageError ? (
              <div className="relative">
                <img
                  src={currentImage}
                  alt={
                    isHindi
                      ? `मूल दस्तावेज़ पृष्ठ ${
                          safePageIndex + 1
                        }`
                      : `Original document page ${
                          safePageIndex + 1
                        }`
                  }
                  className="block w-full h-auto max-h-[65vh] object-contain bg-white"
                  onError={() => setImageError(true)}
                />

                <div className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-black/60 text-white flex items-center justify-center">
                  <ZoomIn className="w-4 h-4" />
                </div>
              </div>
            ) : (
              <div className="min-h-[280px] flex flex-col items-center justify-center px-6 py-8 text-center bg-slate-50">
                <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-100">
                  <FileText className="w-7 h-7" />
                </div>

                <h3 className="mt-4 text-sm font-black text-slate-900">
                  {documentName}
                </h3>

                {docSummary && (
                  <div className="mt-3 p-3 bg-white rounded-xl border border-slate-200 text-left w-full text-xs text-slate-700 shadow-xs">
                    <p className="font-bold text-teal-800 text-[11px] mb-1 uppercase tracking-wider">{tr('AI Document Summary', 'एआई सारांश')}</p>
                    <p className="leading-relaxed">{docSummary}</p>
                  </div>
                )}

                {docHealthInfo && (
                  <div className="mt-2 p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-left w-full text-xs text-emerald-900 shadow-xs">
                    <p className="font-bold text-emerald-800 text-[11px] mb-1 uppercase tracking-wider">{tr('Health Guidance', 'स्वास्थ्य सलाह')}</p>
                    <p className="leading-relaxed">{docHealthInfo}</p>
                  </div>
                )}

                {currentImage && (
                  <a
                    href={currentImage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-700 text-white text-xs font-bold shadow-xs hover:bg-teal-600 transition"
                  >
                    <FileText className="w-4 h-4" />
                    {tr('Open Document File', 'दस्तावेज़ फ़ाइल खोलें')}
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className="mt-3 p-3.5 rounded-2xl bg-slate-800 border border-slate-700">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-teal-300 shrink-0 mt-0.5" />

              <div>
                <p className="text-xs font-bold text-slate-200">
                  {tr('Information read from document', 'दस्तावेज़ से निकाली गई जानकारी')}
                </p>

                <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                  {tr('The displayed information is based on content read from the document. Verify important information against the original document.', 'दिखाई गई जानकारी दस्तावेज़ से पढ़ी गई सामग्री पर आधारित है। महत्वपूर्ण जानकारी को मूल दस्तावेज़ से सत्यापित करें।')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        {totalPages > 1 && (
          <div className="shrink-0 px-4 py-2.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={goToPreviousPage}
              disabled={safePageIndex === 0}
              className="h-10 px-3 rounded-xl bg-slate-800 text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700 flex items-center gap-1.5 text-xs font-bold cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              {tr('Previous', 'पिछला')}
            </button>

            <span className="text-[10px] font-bold text-slate-500">
              {safePageIndex + 1} / {totalPages}
            </span>

            <button
              type="button"
              onClick={goToNextPage}
              disabled={safePageIndex === totalPages - 1}
              className="h-10 px-3 rounded-xl bg-slate-800 text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700 flex items-center gap-1.5 text-xs font-bold cursor-pointer"
            >
              {tr('Next', 'अगला')}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Footer */}
        <footer className="shrink-0 p-3.5 bg-slate-950 border-t border-slate-800">
          <button
            type="button"
            onClick={() => setOriginalDocModalOpen(false)}
            className="w-full min-h-[46px] rounded-xl bg-teal-700 hover:bg-teal-600 active:bg-teal-800 text-white text-sm font-black cursor-pointer transition"
          >
            {tr('Done Viewing', 'समीक्षा पूरी करें')}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default OriginalDocModal;