import React, { useState } from "react";
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
  Eye,
  Camera,
  FolderPlus,
  Folder,
  ArrowRight,
  ArrowLeftRight,
  X,
  Maximize2,
  Edit2,
  AlertCircle,
} from "lucide-react";
import useMobileStore, { SCREENS } from "../../store/useMobileStore";
import MobileHeader from "../../components/mobile/MobileHeader";
import DocumentPreview from "../../components/mobile/DocumentPreview";
import PrimaryButton from "../../components/mobile/PrimaryButton";
import SecondaryButton from "../../components/mobile/SecondaryButton";
import BottomActionBar from "../../components/mobile/BottomActionBar";
import { useLanguage } from "../../i18n/translations";

/**
 * M4 — DOCUMENT REVIEW WITH CLUSTERING & PER-IMAGE CONTROLS
 * Displays all document sets (e.g. Blood Report 3p, CT Scan 4p) with full controls:
 * - Review / Inspect any individual image in high resolution
 * - Retake any particular image without affecting others
 * - Move pages between document sets/clusters
 * - Delete unwanted pages or entire sets
 * - Add additional pages to any specific set
 * - Create new document sets
 */
export const M4_DocumentReview = () => {
  const {
    documentSets,
    createDocumentSet,
    deleteDocumentSet,
    updateDocumentSetTitle,
    removePageFromSet,
    movePageBetweenSets,
    setRetargetPageForRetake,
    setActiveSetId,
    setCapturedDocuments,
    setCapturedDocument,
    setScreen,
  } = useMobileStore();
  const { isHindi } = useLanguage();

  // Full-screen image inspection modal state
  const [inspectedImage, setInspectedImage] = useState(null); // { page, setId, setTitle, pageIndex, totalPages }
  // Move page modal state
  const [movingPage, setMovingPage] = useState(null); // { pageId, fromSetId, pageNumber }
  // Edit set title modal state
  const [editingSet, setEditingSet] = useState(null); // { setId, title, type }

  // Filter sets with pages, or show all
  const activeSets = documentSets.length > 0 ? documentSets : [];
  const totalAllPages = activeSets.reduce((acc, s) => acc + (s.pages?.length || 0), 0);

  // Trigger retake of a specific image
  const handleRetakeSpecificImage = (setId, page, pageIndex, setTitle) => {
    setRetargetPageForRetake({
      setId,
      pageId: page.id,
      pageIndex,
      pageTitle: page.fileName || (isHindi ? `पृष्ठ #${pageIndex + 1}` : `Page #${pageIndex + 1}`),
      parentSetTitle: setTitle,
    });
    setActiveSetId(setId);
    setScreen(SCREENS.M3);
  };

  // Add more pages to a specific set
  const handleAddPageToSpecificSet = (setId) => {
    setRetargetPageForRetake(null);
    setActiveSetId(setId);
    setScreen(SCREENS.M3);
  };

  // Proceed to analysis
  const handleProceedToAnalysis = () => {
    const allPages = activeSets.flatMap((s) => s.pages);
    if (allPages.length > 0) {
      setCapturedDocuments(allPages);
      setCapturedDocument(allPages[0]);
    }
    setScreen(SCREENS.M5);
  };

  // Handle page move
  const handleConfirmMovePage = (toSetId) => {
    if (!movingPage || toSetId === movingPage.fromSetId) {
      setMovingPage(null);
      return;
    }
    movePageBetweenSets(movingPage.fromSetId, toSetId, movingPage.pageId);
    setMovingPage(null);
  };

  return (
    <div className="min-h-full flex flex-col justify-between bg-slate-100 select-none">
      {/* Header */}
      <MobileHeader
        title={isHindi ? `दस्तावेज़ों की समीक्षा (${totalAllPages} पृष्ठ)` : `Review Documents (${totalAllPages} Pages)`}
        showBack={true}
        onBack={() => setScreen(SCREENS.M3)}
      />

      {/* Main Content Area */}
      <main className="flex-1 px-3 sm:px-6 py-4 max-w-md md:max-w-2xl lg:max-w-3xl mx-auto w-full space-y-4">
        {/* Quality & Automated Enhancement Banner */}
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-teal-700" />
              <span>{isHindi ? "एआई छवि संवर्धन" : "AI Image Enhancement"}</span>
            </span>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              {isHindi ? "संवर्धित व स्पष्ट ✓" : "Enhanced & Readable ✓"}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {isHindi
              ? "स्पष्टता और कंट्रास्ट के लिए सभी छवियों को समायोजित किया गया है। आप नीचे प्रत्येक सेट में पृष्ठों की समीक्षा, पुनः फोटो या व्यवस्था कर सकते हैं।"
              : "All images have been adjusted for contrast and sharpness. You can review, retake, or organize pages in each report set below."}
          </p>
        </div>

        {/* Overview Bar */}
        <div className="flex items-center justify-between text-xs px-1">
          <div className="flex items-center gap-1.5 font-black text-slate-800">
            <Layers className="w-4 h-4 text-teal-700" />
            <span>{isHindi ? `दस्तावेज़ सेट व समूह (${activeSets.length})` : `Document Sets & Clusters (${activeSets.length})`}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              setRetargetPageForRetake(null);
              setScreen(SCREENS.M3);
            }}
            className="font-bold text-teal-800 hover:text-teal-950 flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isHindi ? "नया सेट जोड़ें" : "Add New Set"}</span>
          </button>
        </div>

        {/* DOCUMENT CLUSTERS / SETS LIST */}
        <div className="space-y-4">
          {activeSets.map((docSet, setIdx) => {
            const pages = docSet.pages || [];
            return (
              <div
                key={docSet.id || setIdx}
                className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs space-y-3"
              >
                {/* Cluster Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center font-bold text-xs">
                      {setIdx + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-sm font-black text-slate-900">
                          {isHindi
                            ? (docSet.title?.includes("Prescription") ? "डॉक्टर का पर्चा" : docSet.title?.includes("Blood") ? "रक्त जांच रिपोर्ट" : docSet.title?.includes("CT") ? "सीटी स्कैन रिपोर्ट" : docSet.title)
                            : docSet.title}
                        </h3>
                        <button
                          type="button"
                          onClick={() => setEditingSet(docSet)}
                          className="p-1 text-slate-400 hover:text-teal-800 transition cursor-pointer"
                          title={isHindi ? "सेट का नाम बदलें" : "Rename Set"}
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-400 font-medium">
                        {isHindi
                          ? `इस रिपोर्ट सेट में ${pages.length} पृष्ठ`
                          : `${pages.length} page${pages.length !== 1 ? "s" : ""} in this report set`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleAddPageToSpecificSet(docSet.id)}
                      className="px-2.5 py-1 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-[11px] flex items-center gap-1 transition cursor-pointer border border-teal-200"
                      title={isHindi ? "इस रिपोर्ट में और पृष्ठ जोड़ें" : "Add more pages to this report"}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{isHindi ? "पृष्ठ जोड़ें" : "Add Page"}</span>
                    </button>

                    {activeSets.length > 1 && (
                      <button
                        type="button"
                        onClick={() => deleteDocumentSet(docSet.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                        title={isHindi ? "पूरा सेट हटाएं" : "Delete entire set"}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Pages Grid for this Set */}
                {pages.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {pages.map((page, pageIdx) => (
                      <div
                        key={page.id || pageIdx}
                        className="relative rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden shadow-2xs flex flex-col justify-between group"
                      >
                        {/* Page Preview Thumbnail */}
                        <div
                          onClick={() =>
                            setInspectedImage({
                              page,
                              setId: docSet.id,
                              setTitle: docSet.title,
                              pageIndex: pageIdx,
                              totalPages: pages.length,
                            })
                          }
                          className="relative w-full aspect-[3/4] bg-slate-900 cursor-pointer overflow-hidden flex items-center justify-center"
                        >
                          {page.dataUrl ? (
                            <img
                              src={page.dataUrl}
                              alt={`Page ${pageIdx + 1}`}
                              className="w-full h-full object-cover transition group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center p-2 text-slate-400">
                              <FileText className="w-7 h-7 text-teal-400" />
                              <span className="text-[10px] mt-1 font-bold">
                                {isHindi ? "दस्तावेज़" : "Document"}
                              </span>
                            </div>
                          )}

                          {/* Page Number Badge */}
                          <span className="absolute top-1.5 left-1.5 bg-slate-900/85 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md border border-white/20">
                            {isHindi ? `पृष्ठ ${pageIdx + 1}` : `Page ${pageIdx + 1}`}
                          </span>

                          {/* Quick Inspect Icon on Hover */}
                          <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                            <Eye className="w-6 h-6 drop-shadow-md" />
                          </div>
                        </div>

                        {/* Page Per-Image Controls Bar */}
                        <div className="p-2 bg-white border-t border-slate-100 flex items-center justify-between gap-1 text-[11px]">
                          {/* Retake Button */}
                          <button
                            type="button"
                            onClick={() =>
                              handleRetakeSpecificImage(
                                docSet.id,
                                page,
                                pageIdx,
                                docSet.title
                              )
                            }
                            className="flex-1 py-1 px-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-900 font-bold text-[10px] flex items-center justify-center gap-1 transition cursor-pointer border border-teal-200 active:scale-95"
                            title={isHindi ? "इस विशेष फोटो को पुनः खींचें" : "Retake this particular photo"}
                          >
                            <Camera className="w-3 h-3 text-teal-700" />
                            <span>{isHindi ? "पुनः फोटो" : "Retake"}</span>
                          </button>

                          {/* Move to another set */}
                          {activeSets.length > 1 && (
                            <button
                              type="button"
                              onClick={() =>
                                setMovingPage({
                                  pageId: page.id,
                                  fromSetId: docSet.id,
                                  pageNumber: pageIdx + 1,
                                })
                              }
                              className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-teal-800 transition cursor-pointer"
                              title={isHindi ? "दूसरे दस्तावेज़ सेट में भेजें" : "Move to another document set"}
                            >
                              <ArrowLeftRight className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => removePageFromSet(docSet.id, page.id)}
                            className="p-1 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                            title={isHindi ? "यह छवि हटाएं" : "Delete this image"}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Snap another page into this set tile */}
                    <button
                      type="button"
                      onClick={() => handleAddPageToSpecificSet(docSet.id)}
                      className="min-h-[140px] rounded-2xl border-2 border-dashed border-teal-300 hover:border-teal-600 bg-teal-50/40 hover:bg-teal-50 flex flex-col items-center justify-center gap-1 text-teal-800 transition cursor-pointer active:scale-95 p-3 text-center"
                    >
                      <Plus className="w-6 h-6 text-teal-700" />
                      <span className="text-xs font-bold leading-tight">
                        {isHindi ? `+ ${docSet.title} में पृष्ठ जोड़ें` : `+ Add Page to ${docSet.title}`}
                      </span>
                    </button>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-dashed border-slate-300 text-center space-y-2">
                    <p className="text-xs text-slate-500">
                      {isHindi ? "इस सेट में अभी कोई फोटो नहीं खींची गई है।" : "No images captured in this set yet."}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleAddPageToSpecificSet(docSet.id)}
                      className="px-3 py-1.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs inline-flex items-center gap-1 cursor-pointer shadow-xs"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>{isHindi ? `${docSet.title} के लिए फोटो लें` : `Take Photos for ${docSet.title}`}</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>

      {/* Full-Screen Image Inspection Modal */}
      {inspectedImage && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex flex-col justify-between bg-slate-950/95 text-white p-4 animate-fade-in"
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between gap-2 max-w-lg mx-auto w-full pt-2">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-teal-300">
                {inspectedImage.setTitle}
              </span>
              <h3 className="text-sm font-bold text-white">
                {isHindi
                  ? `पृष्ठ ${inspectedImage.pageIndex + 1} / ${inspectedImage.totalPages}`
                  : `Page ${inspectedImage.pageIndex + 1} of ${inspectedImage.totalPages}`}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setInspectedImage(null)}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Large Image Preview Canvas */}
          <div className="flex-1 flex items-center justify-center my-4 overflow-hidden max-w-lg mx-auto w-full">
            {inspectedImage.page.dataUrl ? (
              <img
                src={inspectedImage.page.dataUrl}
                alt="Full preview"
                className="max-h-[62vh] w-auto object-contain rounded-2xl shadow-2xl border border-white/20"
              />
            ) : (
              <div className="w-full max-w-sm bg-white text-slate-900 rounded-2xl p-4">
                <DocumentPreview
                  documentName={inspectedImage.page.fileName}
                  date={inspectedImage.page.date}
                  showFullDetails={false}
                />
              </div>
            )}
          </div>

          {/* Bottom Controls inside Inspector */}
          <div className="max-w-lg mx-auto w-full space-y-2 pb-2">
            <div className="flex items-center justify-between text-xs text-slate-300 px-1">
              <span>{isHindi ? "स्पष्टता: " : "Clarity: "}<strong className="text-emerald-400">{isHindi ? "उच्च रिज़ॉल्यूशन" : "High Resolution"}</strong></span>
              <span>{inspectedImage.page.date || (isHindi ? "आज" : "Today")}</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  const target = inspectedImage;
                  setInspectedImage(null);
                  handleRetakeSpecificImage(
                    target.setId,
                    target.page,
                    target.pageIndex,
                    target.setTitle
                  );
                }}
                className="h-11 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer border border-white/20"
              >
                <Camera className="w-4 h-4 text-teal-300" />
                <span>{isHindi ? "यह पृष्ठ पुनः खींचें" : "Retake This Page"}</span>
              </button>

              <button
                type="button"
                onClick={() => setInspectedImage(null)}
                className="h-11 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md"
              >
                <Check className="w-4 h-4" />
                <span>{isHindi ? "स्पष्ट दिख रहा है ✓" : "Looks Clear ✓"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Move Page Between Sets Modal */}
      {movingPage && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
        >
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl space-y-3 border border-slate-200 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <ArrowLeftRight className="w-4 h-4 text-teal-700" />
                <h3 className="text-sm font-black text-slate-900">
                  {isHindi ? `पृष्ठ #${movingPage.pageNumber} को इस सेट में ले जाएं:` : `Move Page #${movingPage.pageNumber} to Set:`}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setMovingPage(null)}
                className="p-1 rounded-xl hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {activeSets.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleConfirmMovePage(s.id)}
                  disabled={s.id === movingPage.fromSetId}
                  className={`w-full p-2.5 rounded-xl border text-left text-xs font-bold transition flex items-center justify-between ${
                    s.id === movingPage.fromSetId
                      ? "bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed"
                      : "hover:bg-teal-50 hover:border-teal-600 text-slate-800 cursor-pointer"
                  }`}
                >
                  <span>{s.title}</span>
                  {s.id === movingPage.fromSetId ? (
                    <span className="text-[10px] text-slate-400">{isHindi ? "वर्तमान सेट" : "Current Set"}</span>
                  ) : (
                    <ArrowRight className="w-3.5 h-3.5 text-teal-700" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Edit Set Title Modal */}
      {editingSet && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
        >
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl space-y-3 border border-slate-200 animate-scale-up">
            <h3 className="text-sm font-black text-slate-900">
              {isHindi ? "दस्तावेज़ सेट का नाम बदलें" : "Rename Document Report Set"}
            </h3>
            <input
              type="text"
              value={editingSet.title}
              onChange={(e) =>
                setEditingSet({ ...editingSet, title: e.target.value })
              }
              className="w-full h-11 px-3 rounded-xl border border-slate-200 font-bold text-xs text-slate-800 outline-none focus:border-teal-700"
            />
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setEditingSet(null)}
                className="h-10 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
              >
                {isHindi ? "रद्द करें" : "Cancel"}
              </button>
              <button
                type="button"
                onClick={() => {
                  updateDocumentSetTitle(editingSet.setId || editingSet.id, editingSet.title);
                  setEditingSet(null);
                }}
                className="h-10 rounded-xl bg-teal-800 text-white font-bold text-xs shadow-sm"
              >
                {isHindi ? "सहेजें" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dual CTA Bottom Action Bar */}
      <BottomActionBar>
        <div className="grid grid-cols-2 gap-2.5">
          <SecondaryButton
            onClick={() => {
              setRetargetPageForRetake(null);
              setScreen(SCREENS.M3);
            }}
            icon={Plus}
            variant="outline"
          >
            {isHindi ? "+ और पृष्ठ खींचें" : "+ Snap More Pages"}
          </SecondaryButton>

          <PrimaryButton
            onClick={handleProceedToAnalysis}
            icon={Check}
            disabled={totalAllPages === 0}
          >
            {isHindi ? `सभी ${totalAllPages} पृष्ठ उपयोग करें ✓` : `Use All ${totalAllPages} Pages ✓`}
          </PrimaryButton>
        </div>
      </BottomActionBar>
    </div>
  );
};

export default M4_DocumentReview;
