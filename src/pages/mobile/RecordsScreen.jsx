import React, { useMemo } from "react";
import {
  FileText,
  UploadCloud,
  Clock,
  Eye,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ShieldCheck,
  Building2,
  FileSpreadsheet,
  FolderHeart,
  FileCheck,
  Stethoscope,
  RotateCcw,
  Lock,
} from "lucide-react";
import useMobileStore, { SCREENS } from "../../store/useMobileStore";
import MobileHeader from "../../components/mobile/MobileHeader";
import BottomNavBar from "../../components/mobile/BottomNavBar";
import OriginalDocModal from "../../components/mobile/OriginalDocModal";

/**
 * MEDICAL RECORDS HOME SCREEN
 * Central patient repository for uploaded, digitized, and synced medical records.
 * Features:
 * - Category summary cards (Prescriptions, Lab Reports, Discharge Summaries, Other Records)
 * - Chronological document view grouped by month
 * - Visit linkage indicators
 * - Processing status badges (Processed, Needs Review, Processing, Confirmed)
 * - Prominent Upload Document entry point leading to the existing upload flow
 */
export const RecordsScreen = () => {
  const {
    medicalRecords,
    setSelectedMedicalRecord,
    selectedRecordCategory,
    setSelectedRecordCategory,
    setScreen,
    prevScreen,
    isHealthHistoryLocked,
  } = useMobileStore();

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts = {
      prescription: 0,
      lab_report: 0,
      discharge_summary: 0,
      other: 0,
    };
    medicalRecords.forEach((doc) => {
      if (counts[doc.type] !== undefined) {
        counts[doc.type]++;
      } else {
        counts.other++;
      }
    });
    return counts;
  }, [medicalRecords]);

  const categories = [
    {
      id: "prescription",
      title: "Prescriptions",
      count: categoryCounts.prescription,
      icon: FileText,
      color: "teal",
    },
    {
      id: "lab_report",
      title: "Lab Reports",
      count: categoryCounts.lab_report,
      icon: FileSpreadsheet,
      color: "blue",
    },
    {
      id: "discharge_summary",
      title: "Discharge Summaries",
      count: categoryCounts.discharge_summary,
      icon: Building2,
      color: "emerald",
    },
    {
      id: "other",
      title: "Other Medical Records",
      count: categoryCounts.other,
      icon: FolderHeart,
      color: "amber",
    },
  ];

  // Filter records by selected category
  const filteredRecords = useMemo(() => {
    if (selectedRecordCategory === "ALL") {
      return medicalRecords;
    }
    return medicalRecords.filter((r) => r.type === selectedRecordCategory);
  }, [medicalRecords, selectedRecordCategory]);

  // Group records chronologically by month
  const groupedRecords = useMemo(() => {
    const groups = {};
    filteredRecords.forEach((rec) => {
      const monthGroup = rec.monthGroup || "RECENT";
      if (!groups[monthGroup]) {
        groups[monthGroup] = [];
      }
      groups[monthGroup].push(rec);
    });
    return groups;
  }, [filteredRecords]);

  const handleOpenDocument = (doc) => {
    setSelectedMedicalRecord(doc);
    setScreen(SCREENS.DOCUMENT_DETAILS);
  };

  const handleCategoryClick = (catId) => {
    if (selectedRecordCategory === catId) {
      setSelectedRecordCategory("ALL");
    } else {
      setSelectedRecordCategory(catId);
    }
  };

  // Status badge styling
  const renderStatusBadge = (status) => {
    switch (status) {
      case "CONFIRMED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
            <CheckCircle2 className="w-3 h-3 text-teal-700" />
            <span>Confirmed</span>
          </span>
        );
      case "NEEDS_REVIEW":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-300">
            <AlertCircle className="w-3 h-3 text-amber-600" />
            <span>Needs Review</span>
          </span>
        );
      case "PROCESSING":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
            <Clock className="w-3 h-3 text-blue-600 animate-spin" />
            <span>Processing</span>
          </span>
        );
      case "FAILED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
            <AlertCircle className="w-3 h-3 text-rose-600" />
            <span>Failed</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Processed</span>
          </span>
        );
    }
  };

  return (
    <div className="min-h-full flex flex-col justify-between bg-slate-50 text-slate-900 select-none">
      {/* Mobile Header with brand status */}
      <MobileHeader
        title="Medical Records"
        showBack={true}
        onBack={prevScreen}
      />

      {/* Main Content Area */}
      <main className="flex-1 px-4 sm:px-6 py-4 sm:py-6 max-w-md md:max-w-2xl lg:max-w-3xl mx-auto w-full space-y-5">
        {/* Main Heading & Subheading */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
              Medical Records
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
              Your prescriptions, reports and other medical documents.
            </p>
          </div>

          {isHealthHistoryLocked && (
            <span className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-300 shadow-2xs">
              <Lock className="w-3 h-3 text-amber-700" />
              <span>Sharing restricted</span>
            </span>
          )}
        </div>

        {/* -------------------------------------------------------------
            PROMINENT DOCUMENT UPLOAD CTA BANNER
        -------------------------------------------------------------- */}
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-teal-800 to-teal-950 text-white shadow-md flex items-center justify-between gap-4">
          <div className="space-y-1 min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-200 bg-teal-700/60 px-2 py-0.5 rounded">
              Digitize & Analyze
            </span>
            <h3 className="text-base sm:text-lg font-black leading-tight text-white">
              Upload Medical Document
            </h3>
            <p className="text-xs text-teal-100/90 leading-snug">
              Scan prescriptions or upload lab test PDFs to fast-track your consultation.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setScreen(SCREENS.M2)}
            className="shrink-0 h-11 px-4 rounded-2xl bg-white text-teal-950 hover:bg-teal-50 active:scale-95 font-bold text-xs flex items-center gap-2 transition cursor-pointer shadow-sm"
          >
            <UploadCloud className="w-4 h-4 text-teal-800" />
            <span>Upload</span>
          </button>
        </div>

        {/* -------------------------------------------------------------
            RECORD CATEGORY CARDS
        -------------------------------------------------------------- */}
        <section aria-label="Record Categories" className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Categories
            </h3>
            {selectedRecordCategory !== "ALL" && (
              <button
                type="button"
                onClick={() => setSelectedRecordCategory("ALL")}
                className="text-xs font-bold text-teal-800 hover:text-teal-950 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Show All</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedRecordCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategoryClick(cat.id)}
                  className={`p-3.5 rounded-2xl border text-left transition-all active:scale-[0.98] cursor-pointer flex flex-col justify-between min-h-[96px] ${
                    isSelected
                      ? "bg-teal-50/90 border-teal-700 shadow-xs ring-1 ring-teal-600/30"
                      : "bg-white border-slate-200/90 hover:border-slate-300 shadow-2xs"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                        isSelected
                          ? "bg-teal-800 text-white"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span
                      className={`text-xs font-black px-2 py-0.5 rounded-full ${
                        isSelected
                          ? "bg-teal-800 text-white"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {cat.count}
                    </span>
                  </div>

                  <div className="mt-2">
                    <p
                      className={`text-xs font-bold leading-tight ${
                        isSelected ? "text-teal-950" : "text-slate-800"
                      }`}
                    >
                      {cat.title}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {cat.count} {cat.count === 1 ? "record" : "records"}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* -------------------------------------------------------------
            ALL RECORDS VIEW (Chronological list grouped by month)
        -------------------------------------------------------------- */}
        <section aria-label="All Records" className="space-y-4 pt-1">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {selectedRecordCategory === "ALL"
                ? "All Records"
                : `${categories.find((c) => c.id === selectedRecordCategory)?.title || "Filtered"} Records`}{" "}
              ({filteredRecords.length})
            </h3>

            <button
              type="button"
              onClick={() => setScreen(SCREENS.M7)}
              className="text-xs font-bold text-teal-800 hover:text-teal-950 cursor-pointer flex items-center gap-1"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Timeline →</span>
            </button>
          </div>

          {filteredRecords.length === 0 ? (
            /* Empty State */
            <div className="p-8 rounded-3xl bg-white border border-slate-200/90 text-center space-y-3 shadow-xs my-4">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-800 border border-teal-200 flex items-center justify-center mx-auto">
                <FileText className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-slate-900">
                No medical records yet.
              </h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                Your uploaded prescriptions and reports will appear here.
              </p>
              <button
                type="button"
                onClick={() => setScreen(SCREENS.M2)}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-teal-800 hover:bg-teal-900 transition cursor-pointer"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Upload First Document</span>
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {Object.entries(groupedRecords).map(([monthGroup, records]) => (
                <div key={monthGroup} className="space-y-2.5">
                  {/* Month Group Label */}
                  <div className="flex items-center gap-2 px-1">
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                      {monthGroup}
                    </span>
                    <div className="flex-1 h-px bg-slate-200/80" />
                  </div>

                  {/* Document Cards */}
                  <div className="space-y-2.5">
                    {records.map((doc) => (
                      <div
                        key={doc.id}
                        onClick={() => handleOpenDocument(doc)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            handleOpenDocument(doc);
                          }
                        }}
                        className="w-full p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-teal-600/40 hover:shadow-md transition-all active:scale-[0.99] text-left cursor-pointer space-y-2.5 group shadow-2xs select-none"
                      >
                        {/* Top: Type Badge & Status */}
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 uppercase tracking-wide">
                            {doc.typeLabel || doc.type}
                          </span>
                          {renderStatusBadge(doc.status)}
                        </div>

                        {/* Title */}
                        <div>
                          <h4 className="text-sm sm:text-base font-black text-slate-900 leading-snug break-words group-hover:text-teal-950">
                            {doc.title}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 flex-wrap">
                            <span className="flex items-center gap-1 font-semibold text-slate-700">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              {doc.displayDate || doc.date}
                            </span>
                            <span>·</span>
                            <span>{doc.source}</span>
                          </div>
                        </div>

                        {/* Visit Association Link (if present) */}
                        {doc.visitId && (
                          <div className="pt-1.5 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-teal-800 font-semibold">
                            <Stethoscope className="w-3 h-3 text-teal-700 shrink-0" />
                            <span>Linked to Visit Encounter</span>
                          </div>
                        )}

                        {/* Bottom: Action */}
                        <div className="pt-1 flex items-center justify-between text-xs text-slate-400 border-t border-slate-100">
                          <span>{doc.fileSize || "1.4 MB"}</span>
                          <span className="font-bold text-teal-800 group-hover:text-teal-950 flex items-center gap-0.5 transition-transform group-hover:translate-x-0.5">
                            <span>View</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* DPDP Compliance Notice */}
        <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-500 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-teal-800 shrink-0" />
          <span>All documents are securely encrypted and linked with ABDM Health Locker.</span>
        </div>
      </main>

      {/* Persistent Bottom Navigation */}
      <BottomNavBar />

      {/* Original Document Modal */}
      <OriginalDocModal />
    </div>
  );
};

export default RecordsScreen;
