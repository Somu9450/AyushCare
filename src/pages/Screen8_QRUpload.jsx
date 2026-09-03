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
import { useTranslation } from '../hooks/useTranslation';
import { SkeletonOCRExtraction } from '../components/common/KioskSkeleton';

const DOCUMENT_TYPES = [
  {
    id: 'prescription',
    title: 'Prescription',
    hi: 'डॉक्टर की पर्ची',
    subtitle: 'Doctor prescription or OPD slip',
  },
  {
    id: 'lab_report',
    title: 'Lab report',
    hi: 'जांच रिपोर्ट',
    subtitle: 'Blood, urine or other investigations',
  },
  {
    id: 'discharge_summary',
    title: 'Discharge summary',
    hi: 'डिस्चार्ज समरी',
    subtitle: 'Hospital or surgery records',
  },
  {
    id: 'other',
    title: 'Other document',
    hi: 'अन्य मेडिकल दस्तावेज़',
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

  const { t, isHindi } = useTranslation();

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
    const doc = DOCUMENT_TYPES.find((item) => item.id === type);
    if (!doc) return t('screen8.docOther', 'Medical document');
    return isHindi ? (doc.hi || doc.title) : doc.title;
  };

  return (
    <div className="h-full w-full max-w-5xl mx-auto px-4 py-2 select-none flex flex-col justify-between">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* --------------------------------------------------
          COMPACT HEADER
      --------------------------------------------------- */}
      <div className="flex items-center justify-between gap-3 mb-1.5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
              {t('screen8.stepLabel', 'Step 6 · Document Upload')}
            </span>
            <h1 className="text-lg sm:text-xl font-black text-slate-900">
              {t('screen8.title', 'Upload Previous Medical Records')}
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {t('screen8.subtitle', 'Attach previous prescriptions, lab reports, or discharge summaries (Optional)')}
          </p>
        </div>

        <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
          <ScanLine className="w-4 h-4" />
        </div>
      </div>

      {/* --------------------------------------------------
          TWO-COLUMN ATM LAYOUT
      --------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_0.85fr] gap-3 items-start flex-1 min-h-0">

        {/* LEFT COLUMN: Upload Type & Trigger Buttons */}
        <div className="bg-white border border-slate-200 rounded-2xl p-2.5 shadow-xs flex flex-col gap-2">
          {/* Document Type Selector Pill Bar */}
          <div>
            <span className="text-[11px] font-black text-slate-700 block mb-1">Select Document Category:</span>
            <div className="flex gap-1.5 overflow-x-auto pb-0.5">
              {DOCUMENT_TYPES.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setSelectedType(type.id)}
                  className={`shrink-0 h-7 px-2.5 rounded-lg border text-[11px] font-bold cursor-pointer transition ${
                    selectedType === type.id
                      ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {type.title}
                </button>
              ))}
            </div>
          </div>

          {/* Upload & Scan Buttons in 2 Columns */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="h-[80px] rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-teal-50 hover:border-teal-400 p-2 text-left flex items-center gap-2.5 cursor-pointer transition active:scale-[0.99]"
            >
              <div className="w-10 h-10 rounded-xl bg-white text-teal-700 flex items-center justify-center shadow-xs shrink-0">
                <Upload className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-black text-slate-900 truncate">Upload File</p>
                <p className="text-[10px] text-slate-500 truncate">Photo, PDF, Image</p>
              </div>
            </button>

            <button
              type="button"
              onClick={handleScanDocument}
              className="h-[80px] rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-teal-50 hover:border-teal-400 p-2 text-left flex items-center gap-2.5 cursor-pointer transition active:scale-[0.99]"
            >
              <div className="w-10 h-10 rounded-xl bg-white text-teal-700 flex items-center justify-center shadow-xs shrink-0">
                <Camera className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-black text-slate-900 truncate">Scan with Kiosk</p>
                <p className="text-[10px] text-slate-500 truncate">Hardware scanner</p>
              </div>
            </button>
          </div>

          {/* OCR Processing Skeleton */}
          {isProcessing && <SkeletonOCRExtraction />}

          {/* Extraction Pills */}
          <div className="rounded-xl bg-slate-50 border border-slate-100 p-1.5 flex items-center justify-between text-[10px] text-slate-500">
            <span>OCR extracts:</span>
            <span className="font-bold text-slate-700">Rx Diagnoses • Dosages • Lab Results</span>
          </div>
        </div>

        {/* RIGHT COLUMN: Added Documents List & Continue */}
        <div className="flex flex-col gap-2 bg-white border border-slate-200 rounded-2xl p-2.5 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-black text-slate-800">
              <FileText className="w-4 h-4 text-teal-700" />
              <span>Added Documents</span>
            </div>
            <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full">
              {documents.length} Files
            </span>
          </div>

          {/* Document list */}
          <div className="min-h-[70px] max-h-36 overflow-y-auto space-y-1.5 pr-0.5">
            {documents.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-3 text-center">
                <FileImage className="mx-auto w-6 h-6 text-slate-300" />
                <p className="mt-1 text-xs font-bold text-slate-600">No documents added</p>
                <p className="text-[10px] text-slate-400">Optional: you can proceed without documents</p>
              </div>
            ) : (
              documents.map((document) => (
                <DocumentCard
                  key={document.id}
                  document={document}
                  getDocumentLabel={getDocumentLabel}
                  onRemove={() => removeDocument(document.id)}
                />
              ))
            )}
          </div>

          {/* Action Continue Button */}
          <button
            type="button"
            onClick={handleContinue}
            className="w-full h-11 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-black flex items-center justify-between px-4 cursor-pointer transition text-sm shadow-xs"
          >
            <span>
              {documents.length > 0
                ? t('screen9.title', 'Review & Confirm')
                : t('screen8.skipUpload', 'Skip & Continue')}
            </span>
            <ArrowRight className="w-5 h-5" />
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