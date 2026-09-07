import React from "react";
import {
  ArrowLeft,
  ChevronRight,
  ClipboardList,
  FileText,
  FlaskConical,
  FolderOpen,
  Info,
} from "lucide-react";

import useMobileStore from "../../store/useMobileStore";

const DOCUMENT_TYPES = [
  {
    id: "prescription",
    title: "Prescription",
    description:
      "Doctor's prescription, medicines, or treatment advice",
    icon: ClipboardList,
  },
  {
    id: "lab_report",
    title: "Lab Report",
    description:
      "Blood tests, urine tests, imaging, or other reports",
    icon: FlaskConical,
  },
  {
    id: "discharge_summary",
    title: "Discharge Summary",
    description:
      "Hospital discharge summary or treatment summary",
    icon: FileText,
  },
  {
    id: "other",
    title: "Other Medical Document",
    description:
      "Any other healthcare document you want to save",
    icon: FolderOpen,
  },
];

export default function M2_DocumentType() {
  const {
    selectedDocumentType,
    documentProcessingConsent,
    setSelectedDocumentType,
    setDocumentProcessingConsent,
    setScreen,
  } = useMobileStore();

  const handleSelect = (type) => {
    if (!documentProcessingConsent) return;
    setSelectedDocumentType(type.id);
    setScreen("M3");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col">
        {/* Header */}
        <header className="flex items-center gap-3 border-b border-slate-200 bg-white px-5 py-4">
          <button
            type="button"
            onClick={() => setScreen("M1")}
            className="flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition active:scale-95"
            aria-label="Go back"
          >
            <ArrowLeft size={22} />
          </button>

          <div>
            <h1 className="text-lg font-bold">
              Document Type
            </h1>

            <p className="text-xs text-slate-500">
              What are you uploading?
            </p>
          </div>
        </header>

        <main className="flex-1 px-5 py-6">
          {/* Intro */}
          <section className="mb-6">
            <h2 className="text-xl font-bold">
              Choose a document type
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Selecting the closest type helps us organize
              the information extracted from your document.
            </p>
          </section>

          {/* Types */}
          <div className="space-y-3">
            {DOCUMENT_TYPES.map(
              (type) => {
                const Icon = type.icon;

                const selected =
                  selectedDocumentType ===
                  type.id;

                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => handleSelect(type)}
                    disabled={!documentProcessingConsent}
                    className={`flex w-full items-center gap-4 rounded-3xl border bg-white p-4 text-left shadow-sm transition active:scale-[0.99] ${
                      selected
                        ? "border-blue-300 ring-2 ring-blue-50"
                        : "border-slate-100"
                    }`}
                  >
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                        selected
                          ? "bg-blue-50"
                          : "bg-slate-50"
                      }`}
                    >
                      <Icon
                        size={23}
                        className={
                          selected
                            ? "text-blue-600"
                            : "text-slate-600"
                        }
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold text-slate-900">
                        {type.title}
                      </h3>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        {type.description}
                      </p>
                    </div>

                    <ChevronRight
                      size={19}
                      className="shrink-0 text-slate-400"
                    />
                  </button>
                );
              },
            )}
          </div>

          <label className="mt-6 flex items-start gap-3 rounded-2xl border border-teal-100 bg-teal-50 p-4 text-left">
            <input type="checkbox" checked={Boolean(documentProcessingConsent)} onChange={(e) => setDocumentProcessingConsent(e.target.checked)} className="mt-1 h-5 w-5 accent-teal-700" />
            <span className="text-sm leading-5 text-teal-950"><strong>I agree to secure document analysis.</strong><br/><span className="text-xs text-teal-800">AyushCare will read this image to extract useful medical information and save it to my account.</span></span>
          </label>

          {/* Privacy note */}
          <section className="mt-6 rounded-3xl border border-blue-100 bg-blue-50 p-4">
            <div className="flex gap-3">
              <Info
                size={19}
                className="mt-0.5 shrink-0 text-blue-600"
              />

              <div>
                <p className="text-sm font-semibold text-blue-950">
                  Before you upload
                </p>

                <p className="mt-1 text-xs leading-5 text-blue-800">
                  Only upload documents that belong to you
                  or that you are authorized to provide.
                  You will be able to review extracted
                  information before it is sent to the doctor.
                </p>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}