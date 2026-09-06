import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  FileSearch,
  LoaderCircle,
  Sparkles,
} from "lucide-react";
import { useMobileStore } from "../../store/useMobileStore";
import { analyzeDocumentOCR } from "../../services/documentService";

const normalizePages = (capturedDocuments, capturedDocument) => {
  if (Array.isArray(capturedDocuments) && capturedDocuments.length) {
    return capturedDocuments.filter(Boolean);
  }

  if (capturedDocument?.pages?.length) {
    return capturedDocument.pages.filter(Boolean);
  }

  return capturedDocument ? [capturedDocument] : [];
};

const getProgressValue = (value) => {
  const numeric = Number(value);

  if (!Number.isFinite(numeric)) return 0;

  if (numeric <= 1) return Math.round(numeric * 100);

  return Math.max(0, Math.min(100, Math.round(numeric)));
};

export default function M5_DocumentAnalysis() {
  const {
    capturedDocument,
    capturedDocuments,
    selectedDocumentType,
    documentType,
    setExtractedData,
    setScreen,
  } = useMobileStore();

  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState("Preparing your document...");
  const [error, setError] = useState("");

  const pages = useMemo(
    () => normalizePages(capturedDocuments, capturedDocument),
    [capturedDocuments, capturedDocument]
  );

  const activeType =
    selectedDocumentType ||
    documentType ||
    capturedDocument?.documentType ||
    "other";

  useEffect(() => {
    let cancelled = false;

    const runAnalysis = async () => {
      if (!pages.length) {
        setError("No document is available for analysis.");
        return;
      }

      try {
        setProgress(8);
        setStage("Preparing document images...");

        const input = {
          documentType: activeType,
          pages,
          images: pages,
          pageCount: pages.length,
          document: {
            ...capturedDocument,
            pages,
            pageCount: pages.length,
            documentType: activeType,
          },
        };

        const result = await analyzeDocumentOCR(input, (update) => {
          if (cancelled) return;

          if (typeof update === "number") {
            setProgress(getProgressValue(update));
            return;
          }

          if (update && typeof update === "object") {
            if (update.progress !== undefined) {
              setProgress(getProgressValue(update.progress));
            }

            if (update.label || update.stage || update.message) {
              setStage(
                update.label ||
                  update.stage ||
                  update.message ||
                  "Analyzing document..."
              );
            }
          }
        });

        if (cancelled) return;

        setProgress(100);
        setStage("Document analyzed");

        if (typeof setExtractedData === "function") {
          setExtractedData({
            ...result,
            documentType: activeType,
            pageCount: pages.length,
            sourceDocument: {
              id: capturedDocument?.id || null,
              documentType: activeType,
              pageCount: pages.length,
            },
          });
        }

        window.setTimeout(() => {
          if (!cancelled) {
            setScreen("M6");
          }
        }, 500);
      } catch (analysisError) {
        console.error("Document analysis failed:", analysisError);

        if (!cancelled) {
          setError(
            "We could not analyze this document. You can go back and retake a clearer photo."
          );
        }
      }
    };

    runAnalysis();

    return () => {
      cancelled = true;
    };
  }, [
    activeType,
    capturedDocument,
    pages,
    setExtractedData,
    setScreen,
  ]);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-4">
          <button
            type="button"
            onClick={() => setScreen("M4")}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700"
            aria-label="Back"
          >
            <ArrowLeft size={20} />
          </button>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
              Step 4 of 6
            </p>
            <h1 className="text-lg font-bold text-slate-900">
              Analyzing document
            </h1>
          </div>
        </div>
      </header>

      <main className="mx-auto flex min-h-[calc(100vh-76px)] max-w-2xl items-center px-4 py-10">
        <section className="w-full rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          {!error ? (
            <>
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-teal-50 text-teal-700">
                {progress >= 100 ? (
                  <CheckCircle2 size={42} />
                ) : (
                  <LoaderCircle size={42} className="animate-spin" />
                )}
              </div>

              <div className="mt-6 text-center">
                <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
                  {pages.length}{" "}
                  {pages.length === 1 ? "page" : "pages"} • {activeType}
                </p>

                <h2 className="mt-2 text-2xl font-bold text-slate-900">
                  {progress >= 100
                    ? "Analysis complete"
                    : "Reading your document"}
                </h2>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {stage}
                </p>
              </div>

              <div className="mt-7">
                <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-500">
                  <span>Processing</span>
                  <span>{progress}%</span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-teal-700 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="mt-7 space-y-3">
                <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                  <FileSearch size={19} className="text-teal-700" />
                  <span className="text-sm text-slate-700">
                    Reading text and document structure
                  </span>
                </div>

                <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                  <Sparkles size={19} className="text-teal-700" />
                  <span className="text-sm text-slate-700">
                    Identifying medicines, dates and clinical information
                  </span>
                </div>

                <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                  <CheckCircle2 size={19} className="text-teal-700" />
                  <span className="text-sm text-slate-700">
                    Preparing information for your review
                  </span>
                </div>
              </div>

              <p className="mt-7 text-center text-xs leading-5 text-slate-500">
                Please keep this screen open while the document is being
                processed.
              </p>
            </>
          ) : (
            <>
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-red-600">
                <FileSearch size={38} />
              </div>

              <div className="mt-6 text-center">
                <h2 className="text-2xl font-bold text-slate-900">
                  Analysis could not be completed
                </h2>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {error}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setScreen("M4")}
                className="mt-7 flex min-h-13 w-full items-center justify-center rounded-xl bg-teal-700 px-4 py-3 font-semibold text-white"
              >
                Review document
              </button>
            </>
          )}
        </section>
      </main>
    </div>
  );
}