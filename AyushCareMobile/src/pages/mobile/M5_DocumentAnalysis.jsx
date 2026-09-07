import React, { useEffect, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, LoaderCircle, RotateCcw } from "lucide-react";
import { useMobileStore } from "../../store/useMobileStore";
import { analyzeDocumentOCR } from "../../services/documentService";

const pagesOf = (docs, doc) => Array.isArray(docs) && docs.length ? docs : doc?.pages?.length ? doc.pages : doc ? [doc] : [];

export default function M5_DocumentAnalysis() {
  const { capturedDocument, capturedDocuments, selectedDocumentType, documentType, documentUploadContext, setExtractedData, setScreen } = useMobileStore();
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState("Preparing your document…");
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);
  const pages = useMemo(() => pagesOf(capturedDocuments, capturedDocument), [capturedDocuments, capturedDocument]);
  const activeType = selectedDocumentType || documentType || capturedDocument?.documentType || "other";

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!pages.length) { setError("No document is available for analysis."); return; }
      setError(""); setProgress(5); setStage("Uploading securely…");
      try {
        const result = await analyzeDocumentOCR({
          consultationId: documentUploadContext?.consultationId || null,
          documentType: activeType,
          pages,
          document: { ...(capturedDocument || {}), pages, documentType: activeType },
        }, (value, message) => {
          if (cancelled) return;
          if (typeof value === "number") setProgress(Math.max(0, Math.min(100, value)));
          if (message) setStage(message);
        });
        if (cancelled) return;
        if (!result?.success) {
          const failed = (result?.documents || []).find((d) => String(d.status).toLowerCase() === "failed");
          throw new Error(failed?.processing_error || failed?.extracted_data?.error || "We could not read this document. Please retake a clear photo and try again.");
        }
        setProgress(100); setStage("Document analyzed successfully");
        setExtractedData({ ...result, documentType: activeType, pageCount: pages.length });
        window.setTimeout(() => { if (!cancelled) setScreen("M6"); }, 450);
      } catch (e) {
        if (!cancelled) { setError(e?.message || "Document analysis failed."); setStage("Analysis could not be completed"); }
      }
    })();
    return () => { cancelled = true; };
  }, [retryKey, activeType, pages, capturedDocument, documentUploadContext, setExtractedData, setScreen]);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900">
      <main className="mx-auto flex min-h-[80vh] max-w-md items-center justify-center">
        <section className="w-full rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          {error ? <AlertCircle size={42} className="mx-auto text-red-600" /> : <LoaderCircle size={42} className="mx-auto animate-spin text-teal-700" />}
          <h1 className="mt-5 text-xl font-bold">{error ? "Document analysis needs attention" : "Reading your document"}</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">{error || stage}</p>
          <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-teal-700 transition-all" style={{ width: `${progress}%` }} /></div>
          <p className="mt-2 text-xs font-semibold text-slate-500">{progress}%</p>
          {error && <button type="button" onClick={() => setRetryKey((k) => k + 1)} className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 font-semibold text-white"><RotateCcw size={17}/> Try again</button>}
          {!error && progress >= 95 && <div className="mt-5 flex items-center justify-center gap-2 text-sm font-semibold text-teal-700"><CheckCircle2 size={18}/> Extracting useful medical information</div>}
        </section>
      </main>
    </div>
  );
}
