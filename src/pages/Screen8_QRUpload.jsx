import React, { useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  CheckCircle2,
  FileImage,
  FileText,
  Loader2,
  ScanLine,
  ShieldCheck,
  Trash2,
  Upload,
  X,
} from 'lucide-react';

import { useKioskStore } from '../store/useKioskStore';

const DOCUMENT_TYPES = [
  {
    id: 'prescription',
    title: 'Prescription',
    subtitle: 'Doctor prescription or OPD slip',
  },
  {
    id: 'lab_report',
    title: 'Lab report',
    subtitle: 'Blood, urine or other investigations',
  },
  {
    id: 'discharge_summary',
    title: 'Discharge summary',
    subtitle: 'Hospital or surgery records',
  },
  {
    id: 'other',
    title: 'Other document',
    subtitle: 'Any relevant medical document',
  },
];

const Screen8_QRUpload = () => {
  const {
    nextScreen,
    prevScreen,
    sessionData,
    addDocument,
    removeDocument,
  } = useKioskStore();

  const fileInputRef = useRef(null);

  const [selectedType, setSelectedType] = useState('prescription');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingFile, setProcessingFile] = useState(null);
  const [showTypeSelector, setShowTypeSelector] = useState(false);

  const documents = sessionData.documents || [];

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files || []);

    if (!files.length) return;

    files.forEach((file) => {
      processDocument(file);
    });

    event.target.value = '';
  };

  const processDocument = (file) => {
    setProcessingFile(file.name);
    setIsProcessing(true);

    /*
     * Mock OCR processing.
     *
     * Production:
     * file -> backend upload -> OCR -> entity extraction
     * -> document timeline object
     *
     * The resulting object intentionally stays generic so
     * the backend can later replace these mock values.
     */
    setTimeout(() => {
      const document = {
        id: `doc_${Date.now()}_${Math.random()
          .toString(36)
          .slice(2, 8)}`,

        name: file.name,

        type: selectedType,

        mimeType: file.type,

        size: file.size,

        uploadedAt: new Date().toISOString(),

        processingStatus: 'COMPLETED',

        ocrStatus: 'MOCK_COMPLETED',

        extractedData: {
          documentType: selectedType,
          diagnoses: [],
          medications: [],
          investigations: [],
          procedures: [],
        },

        timelineDate: null,
      };

      addDocument(document);

      setIsProcessing(false);
      setProcessingFile(null);
    }, 1100);
  };

  const handleScanDocument = () => {
    /*
     * On an actual kiosk this can open the camera/scanner
     * integration.
     *
     * For now we use the same upload mechanism.
     */
    fileInputRef.current?.click();
  };

  const handleContinue = () => {
    nextScreen();
  };

  const getDocumentLabel = (type) => {
    return (
      DOCUMENT_TYPES.find((item) => item.id === type)?.title ||
      'Medical document'
    );
  };

  return (
    <div className="flex-1 w-full bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-bold text-teal-700">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-100">
                8
              </span>

              <span>Medical documents</span>
            </div>

            <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              Add your previous medical documents
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
              Scan prescriptions, reports or discharge summaries. The system
              will digitize them and organize important information for your doctor.
            </p>
          </div>

          <div className="hidden h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 sm:flex">
            <ScanLine className="h-8 w-8" />
          </div>
        </div>

        {/* Privacy notice */}
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />

          <div>
            <p className="text-sm font-black text-emerald-900">
              Your documents stay part of your clinical session
            </p>

            <p className="mt-1 text-sm leading-5 text-emerald-800">
              Documents are processed to help create a structured medical
              history for the doctor.
            </p>
          </div>
        </div>

        {/* Main layout */}
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">

          {/* Upload area */}
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">

            <div className="mb-5">
              <h2 className="text-xl font-black text-slate-900">
                Upload or scan
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                You can add multiple documents.
              </p>
            </div>

            {/* Document type */}
            <div className="mb-5">
              <label className="mb-2 block text-sm font-black text-slate-700">
                What are you adding?
              </label>

              <button
                type="button"
                onClick={() => setShowTypeSelector(!showTypeSelector)}
                className="flex min-h-[58px] w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 text-left transition hover:bg-slate-100 active:scale-[0.99]"
              >
                <div>
                  <p className="text-sm font-black text-slate-900">
                    {getDocumentLabel(selectedType)}
                  </p>

                  <p className="mt-0.5 text-xs text-slate-500">
                    Choose the closest document type
                  </p>
                </div>

                <ArrowRight
                  className={`h-5 w-5 text-slate-400 transition ${
                    showTypeSelector ? 'rotate-90' : ''
                  }`}
                />
              </button>

              {showTypeSelector && (
                <div className="mt-2 grid gap-2">
                  {DOCUMENT_TYPES.map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => {
                        setSelectedType(type.id);
                        setShowTypeSelector(false);
                      }}
                      className={`rounded-xl border p-3 text-left transition ${
                        selectedType === type.id
                          ? 'border-teal-300 bg-teal-50'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <p className="text-sm font-black text-slate-900">
                        {type.title}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {type.subtitle}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Upload buttons */}
            <div className="grid gap-4 sm:grid-cols-2">

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="group flex min-h-[150px] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center transition hover:border-teal-400 hover:bg-teal-50 active:scale-[0.99]"
              >
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-teal-700 shadow-sm transition group-hover:bg-teal-100">
                  <Upload className="h-7 w-7" />
                </div>

                <p className="text-base font-black text-slate-900">
                  Upload document
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Photo, scanned image or PDF
                </p>
              </button>

              <button
                type="button"
                onClick={handleScanDocument}
                className="group flex min-h-[150px] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center transition hover:border-teal-400 hover:bg-teal-50 active:scale-[0.99]"
              >
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-teal-700 shadow-sm transition group-hover:bg-teal-100">
                  <Camera className="h-7 w-7" />
                </div>

                <p className="text-base font-black text-slate-900">
                  Scan with kiosk
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Use the connected document scanner
                </p>
              </button>

            </div>

            {/* OCR processing */}
            {isProcessing && (
              <div className="mt-5 flex items-center gap-4 rounded-2xl border border-teal-100 bg-teal-50 p-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-teal-700">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-black text-teal-900">
                    Digitizing document...
                  </p>

                  <p className="mt-1 truncate text-xs text-teal-700">
                    {processingFile}
                  </p>
                </div>
              </div>
            )}

            {/* What OCR does */}
            <div className="mt-6 rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-black text-slate-800">
                What will be extracted?
              </p>

              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <ExtractionItem text="Diagnoses" />
                <ExtractionItem text="Medications & dosage" />
                <ExtractionItem text="Investigation values" />
                <ExtractionItem text="Previous procedures" />
              </div>
            </div>
          </section>

          {/* Documents list */}
          <aside className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  Added documents
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  {documents.length} document
                  {documents.length === 1 ? '' : 's'} added
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                <FileText className="h-5 w-5" />
              </div>
            </div>

            {documents.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
                <FileImage className="mx-auto h-8 w-8 text-slate-300" />

                <p className="mt-3 text-sm font-bold text-slate-600">
                  No documents added yet
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-400">
                  You can continue without uploading anything.
                </p>
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                {documents.map((document) => (
                  <DocumentCard
                    key={document.id}
                    document={document}
                    getDocumentLabel={getDocumentLabel}
                    onRemove={() => removeDocument(document.id)}
                  />
                ))}
              </div>
            )}

            <div className="mt-5 rounded-2xl bg-amber-50 p-4">
              <p className="text-xs leading-5 text-amber-800">
                <strong>Tip:</strong> Upload clear images so the OCR system
                can read handwritten prescriptions and printed reports more accurately.
              </p>
            </div>
          </aside>
        </div>

        {/* Navigation */}
        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">

          <button
            type="button"
            onClick={prevScreen}
            className="flex min-h-[56px] items-center justify-center gap-2 rounded-2xl bg-white px-6 text-base font-black text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50 active:scale-[0.99]"
          >
            <ArrowLeft className="h-5 w-5" />
            Back
          </button>

          <button
            type="button"
            onClick={handleContinue}
            className="flex min-h-[60px] items-center justify-center gap-3 rounded-2xl bg-teal-800 px-8 text-base font-black text-white shadow-lg shadow-teal-900/10 transition hover:bg-teal-900 active:scale-[0.99]"
          >
            Review my information
            <ArrowRight className="h-5 w-5" />
          </button>

        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Components                                                                 */
/* -------------------------------------------------------------------------- */

const ExtractionItem = ({ text }) => {
  return (
    <div className="flex items-center gap-2">
      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />

      <span className="text-xs font-semibold text-slate-600">
        {text}
      </span>
    </div>
  );
};

const DocumentCard = ({
  document,
  getDocumentLabel,
  onRemove,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">

      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-teal-700 shadow-sm">
          <FileText className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-black text-slate-900">
            {document.name}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {getDocumentLabel(document.type)}
          </p>

          <div className="mt-2 flex items-center gap-1.5 text-xs font-bold text-emerald-700">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Digitized
          </div>
        </div>

        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${document.name}`}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 active:scale-95"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default Screen8_QRUpload;
export { Screen8_QRUpload };