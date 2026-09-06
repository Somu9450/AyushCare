import React, { useMemo, useState } from "react";
import {
  AlertCircle,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileText,
  FlaskConical,
  Lock,
  Pill,
  RotateCcw,
  Search,
  Stethoscope,
  UploadCloud,
  X,
} from "lucide-react";

import useMobileStore, {
  SCREENS,
} from "../../store/useMobileStore";
import MobileHeader from "../../components/mobile/MobileHeader";
import BottomNavBar from "../../components/mobile/BottomNavBar";
import { useLanguage } from "../../i18n/translations";

const CATEGORY_META = {
  prescription: {
    icon: Pill,
  },
  lab_report: {
    icon: FlaskConical,
  },
  discharge_summary: {
    icon: Stethoscope,
  },
  other: {
    icon: FileText,
  },
};

const STATUS_META = {
  UPLOADED: {
    icon: FileText,
  },
  CONFIRMED: {
    icon: CheckCircle2,
  },
  NEEDS_REVIEW: {
    icon: AlertCircle,
  },
  PROCESSING: {
    icon: Clock3,
  },
  PROCESSED: {
    icon: CheckCircle2,
  },
  FAILED: {
    icon: AlertCircle,
  },
};

function getTypeLabel(record, isHindi) {
  const labels = {
    prescription: isHindi
      ? "पर्चा"
      : "Prescription",
    lab_report: isHindi
      ? "लैब रिपोर्ट"
      : "Lab Report",
    discharge_summary: isHindi
      ? "डिस्चार्ज सारांश"
      : "Discharge Summary",
    other: isHindi
      ? "अन्य रिकॉर्ड"
      : "Other Record",
  };

  return (
    record?.typeLabel ||
    labels[record?.type] ||
    (isHindi
      ? "चिकित्सीय रिकॉर्ड"
      : "Medical Record")
  );
}

function getRecordDate(record) {
  return (
    record?.displayDate ||
    record?.date ||
    record?.createdAt ||
    record?.uploadedAt ||
    ""
  );
}

function formatDate(value, isHindi) {
  if (!value) {
    return isHindi
      ? "तारीख उपलब्ध नहीं"
      : "Date unavailable";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return String(value);
  }

  return parsed.toLocaleDateString(
    isHindi ? "hi-IN" : "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
}

function getRecordSource(record, isHindi) {
  return (
    record?.source ||
    record?.clinic ||
    record?.hospital ||
    record?.facility ||
    (isHindi
      ? "स्वास्थ्य केंद्र"
      : "Healthcare facility")
  );
}

function getStatusLabel(status, isHindi) {
  const labels = {
    UPLOADED: isHindi
      ? "अपलोड किया गया"
      : "Uploaded",
    CONFIRMED: isHindi
      ? "पुष्ट"
      : "Confirmed",
    NEEDS_REVIEW: isHindi
      ? "समीक्षा आवश्यक"
      : "Needs review",
    PROCESSING: isHindi
      ? "प्रक्रिया जारी"
      : "Processing",
    PROCESSED: isHindi
      ? "प्रसंस्कृत"
      : "Processed",
    FAILED: isHindi
      ? "विफल"
      : "Failed",
  };

  return (
    labels[status] ||
    (isHindi ? "रिकॉर्ड" : "Record")
  );
}

function getCategory(record) {
  if (
    [
      "prescription",
      "lab_report",
      "discharge_summary",
    ].includes(record?.type)
  ) {
    return record.type;
  }

  return "other";
}

function getEntityCount(record) {
  const extraction =
    record?.extractedInformation ||
    record?.extraction ||
    record?.extractedData ||
    {};

  const medicines = Array.isArray(
    extraction?.medicines
  )
    ? extraction.medicines.length
    : 0;

  const investigations = Array.isArray(
    extraction?.investigations
  )
    ? extraction.investigations.length
    : 0;

  const procedures = Array.isArray(
    extraction?.procedures
  )
    ? extraction.procedures.length
    : 0;

  return medicines + investigations + procedures;
}

export default function RecordsScreen() {
  const {
    medicalRecords,
    setSelectedMedicalRecord,
    selectedRecordCategory,
    setSelectedRecordCategory,
    setScreen,
    isHealthHistoryLocked,
  } = useMobileStore();

  const { isHindi } = useLanguage();

  const [searchQuery, setSearchQuery] =
    useState("");

  const records = Array.isArray(medicalRecords)
    ? medicalRecords
    : [];

  const categoryCounts = useMemo(() => {
    const counts = {
      prescription: 0,
      lab_report: 0,
      discharge_summary: 0,
      other: 0,
    };

    records.forEach((record) => {
      counts[getCategory(record)] += 1;
    });

    return counts;
  }, [records]);

  const categories = [
    {
      id: "prescription",
      title: isHindi
        ? "पर्चे"
        : "Prescriptions",
      count: categoryCounts.prescription,
      icon: CATEGORY_META.prescription.icon,
    },
    {
      id: "lab_report",
      title: isHindi
        ? "लैब रिपोर्ट"
        : "Lab reports",
      count: categoryCounts.lab_report,
      icon: CATEGORY_META.lab_report.icon,
    },
    {
      id: "discharge_summary",
      title: isHindi
        ? "डिस्चार्ज"
        : "Discharge",
      count: categoryCounts.discharge_summary,
      icon: CATEGORY_META.discharge_summary.icon,
    },
    {
      id: "other",
      title: isHindi
        ? "अन्य"
        : "Other",
      count: categoryCounts.other,
      icon: CATEGORY_META.other.icon,
    },
  ];

  const filteredRecords = useMemo(() => {
    let result = [...records];

    if (selectedRecordCategory !== "ALL") {
      result = result.filter(
        (record) =>
          getCategory(record) ===
          selectedRecordCategory
      );
    }

    const query =
      searchQuery.trim().toLowerCase();

    if (query) {
      result = result.filter((record) => {
        const extraction =
          record?.extractedInformation ||
          record?.extraction ||
          {};

        const searchable = [
          record?.title,
          record?.type,
          record?.typeLabel,
          record?.source,
          record?.clinic,
          record?.hospital,
          record?.facility,
          record?.doctor,
          record?.displayDate,
          record?.date,
          extraction?.diagnosis,
          extraction?.summary,
        ]
          .filter(Boolean)
          .map((value) =>
            typeof value === "object"
              ? JSON.stringify(value)
              : String(value)
          )
          .join(" ")
          .toLowerCase();

        return searchable.includes(query);
      });
    }

    result.sort((a, b) => {
      const dateA = new Date(
        getRecordDate(a)
      ).getTime();

      const dateB = new Date(
        getRecordDate(b)
      ).getTime();

      return (
        (Number.isNaN(dateB) ? 0 : dateB) -
        (Number.isNaN(dateA) ? 0 : dateA)
      );
    });

    return result;
  }, [
    records,
    selectedRecordCategory,
    searchQuery,
  ]);

  const groupedRecords = useMemo(() => {
    const groups = {};

    filteredRecords.forEach((record) => {
      const date = getRecordDate(record);

      let groupName = isHindi
        ? "अन्य"
        : "Other";

      if (date) {
        const parsed = new Date(date);

        if (!Number.isNaN(parsed.getTime())) {
          groupName = parsed.toLocaleDateString(
            isHindi ? "hi-IN" : "en-IN",
            {
              month: "long",
              year: "numeric",
            }
          );
        }
      }

      if (!groups[groupName]) {
        groups[groupName] = [];
      }

      groups[groupName].push(record);
    });

    return groups;
  }, [filteredRecords, isHindi]);

  const openDocument = (record) => {
    if (!record) return;

    setSelectedMedicalRecord(record);
    setScreen(SCREENS.DOCUMENT_DETAILS);
  };

  const selectCategory = (category) => {
    setSelectedRecordCategory(
      selectedRecordCategory === category
        ? "ALL"
        : category
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <MobileHeader
        title={isHindi ? "मेडिकल रिकॉर्ड्स" : "Medical Records"}
        subtitle={
          isHindi
            ? "आपके पर्चे और चिकित्सीय दस्तावेज़"
            : "Your prescriptions and medical documents"
        }
      />

      <main className="mx-auto w-full max-w-md px-4 py-5 pb-24 sm:px-5">
        <section className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black tracking-tight">
              {isHindi
                ? "आपके रिकॉर्ड"
                : "Your records"}
            </h1>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              {isHindi
                ? "अपलोड किए गए और संसाधित दस्तावेज़ यहां मिलेंगे।"
                : "Uploaded and processed documents appear here."}
            </p>
          </div>

          {isHealthHistoryLocked ? (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-800">
              <Lock size={11} />
              {isHindi
                ? "प्रतिबंधित"
                : "Restricted"}
            </span>
          ) : null}
        </section>

        <section className="mt-5 rounded-3xl bg-gradient-to-br from-teal-800 to-teal-950 p-5 text-white shadow-md">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <span className="inline-flex rounded-lg bg-teal-700/60 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-teal-100">
                {isHindi
                  ? "नया रिकॉर्ड"
                  : "New record"}
              </span>

              <h2 className="mt-2 text-base font-black">
                {isHindi
                  ? "चिकित्सीय दस्तावेज़ जोड़ें"
                  : "Add a medical document"}
              </h2>

              <p className="mt-1 text-xs leading-5 text-teal-100/90">
                {isHindi
                  ? "पर्चा या रिपोर्ट स्कैन करके रिकॉर्ड में जोड़ें।"
                  : "Scan a prescription or report to add it to your records."}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setScreen(SCREENS.M2)}
              className="flex h-11 shrink-0 items-center gap-2 rounded-2xl bg-white px-4 text-xs font-bold text-teal-950 active:scale-95"
            >
              <UploadCloud size={16} />
              {isHindi ? "अपलोड" : "Upload"}
            </button>
          </div>
        </section>

        <section className="mt-5">
          <div className="relative">
            <Search
              size={17}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(event.target.value)
              }
              placeholder={
                isHindi
                  ? "रिकॉर्ड खोजें..."
                  : "Search records..."
              }
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-10 text-sm font-medium outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            />

            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100"
                aria-label={
                  isHindi
                    ? "खोज साफ करें"
                    : "Clear search"
                }
              >
                <X size={16} />
              </button>
            ) : null}
          </div>
        </section>

        <section className="mt-5">
          <div className="mb-3 flex items-center justify-between px-1">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-500">
              {isHindi
                ? "श्रेणियां"
                : "Categories"}
            </h2>

            {selectedRecordCategory !==
            "ALL" ? (
              <button
                type="button"
                onClick={() =>
                  setSelectedRecordCategory("ALL")
                }
                className="inline-flex items-center gap-1 text-xs font-bold text-teal-800"
              >
                <RotateCcw size={12} />
                {isHindi ? "सभी" : "Show all"}
              </button>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                {...category}
                selected={
                  selectedRecordCategory ===
                  category.id
                }
                onClick={() =>
                  selectCategory(category.id)
                }
                isHindi={isHindi}
              />
            ))}
          </div>
        </section>

        <section className="mt-6">
          <div className="mb-3 flex items-center justify-between px-1">
            <div>
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-500">
                {selectedRecordCategory ===
                "ALL"
                  ? isHindi
                    ? "सभी रिकॉर्ड"
                    : "All records"
                  : categories.find(
                        (item) =>
                          item.id ===
                          selectedRecordCategory
                      )?.title ||
                    (isHindi
                      ? "रिकॉर्ड"
                      : "Records")}
              </h2>

              <p className="mt-0.5 text-[11px] text-slate-400">
                {filteredRecords.length}{" "}
                {isHindi
                  ? "रिकॉर्ड"
                  : filteredRecords.length === 1
                    ? "record"
                    : "records"}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setScreen(SCREENS.M7)
              }
              className="inline-flex items-center gap-1 text-xs font-bold text-teal-800"
            >
              <Clock3 size={14} />
              {isHindi
                ? "समयरेखा"
                : "Timeline"}
              <ChevronRight size={14} />
            </button>
          </div>

          {filteredRecords.length === 0 ? (
            <EmptyRecords
              isHindi={isHindi}
              searching={Boolean(
                searchQuery.trim()
              )}
              onUpload={() =>
                setScreen(SCREENS.M2)
              }
            />
          ) : (
            <div className="space-y-5">
              {Object.entries(groupedRecords).map(
                ([groupName, groupRecords]) => (
                  <div
                    key={groupName}
                    className="space-y-2.5"
                  >
                    <div className="flex items-center gap-2 px-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        {groupName}
                      </span>

                      <div className="h-px flex-1 bg-slate-200" />
                    </div>

                    {groupRecords.map(
                      (record, index) => (
                        <RecordCard
                          key={
                            record?.id ||
                            record?.documentId ||
                            `record-${index}`
                          }
                          record={record}
                          isHindi={isHindi}
                          onOpen={() =>
                            openDocument(record)
                          }
                        />
                      )
                    )}
                  </div>
                )
              )}
            </div>
          )}
        </section>
      </main>

      <BottomNavBar />
    </div>
  );
}

function CategoryCard({
  title,
  count,
  icon: Icon,
  selected,
  onClick,
  isHindi,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-[104px] rounded-2xl border p-3.5 text-left transition active:scale-[0.98] ${
        selected
          ? "border-teal-600 bg-teal-50 ring-1 ring-teal-600/20"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex items-center justify-between">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${
            selected
              ? "bg-teal-800 text-white"
              : "bg-slate-100 text-slate-700"
          }`}
        >
          <Icon size={16} />
        </div>

        <span
          className={`min-w-7 rounded-full px-2 py-1 text-center text-xs font-black ${
            selected
              ? "bg-teal-800 text-white"
              : "bg-slate-100 text-slate-700"
          }`}
        >
          {count}
        </span>
      </div>

      <p
        className={`mt-3 text-xs font-bold ${
          selected
            ? "text-teal-950"
            : "text-slate-800"
        }`}
      >
        {title}
      </p>

      <p className="mt-1 text-[10px] text-slate-400">
        {count}{" "}
        {isHindi
          ? "रिकॉर्ड"
          : count === 1
            ? "record"
            : "records"}
      </p>
    </button>
  );
}

function StatusBadge({ status, isHindi }) {
  const meta =
    STATUS_META[status] ||
    STATUS_META.PROCESSED;

  const Icon = meta.icon;

  const classes = {
    UPLOADED:
      "bg-slate-100 text-slate-700 border-slate-200",
    CONFIRMED:
      "bg-teal-50 text-teal-800 border-teal-200",
    NEEDS_REVIEW:
      "bg-amber-50 text-amber-800 border-amber-200",
    PROCESSING:
      "bg-blue-50 text-blue-800 border-blue-200",
    PROCESSED:
      "bg-emerald-50 text-emerald-800 border-emerald-200",
    FAILED:
      "bg-rose-50 text-rose-800 border-rose-200",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold ${
        classes[status] ||
        classes.PROCESSED
      }`}
    >
      <Icon size={12} />
      {getStatusLabel(status, isHindi)}
    </span>
  );
}

function RecordCard({
  record,
  isHindi,
  onOpen,
}) {
  const pages = Array.isArray(record?.pages)
    ? record.pages.length
    : Number(record?.totalPages || 0);

  const entityCount =
    getEntityCount(record);

  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition active:scale-[0.99]"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
          <FileText size={19} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-lg border border-teal-200 bg-teal-50 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-teal-800">
              {getTypeLabel(record, isHindi)}
            </span>

            {pages > 1 ? (
              <span className="rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-500">
                {pages}{" "}
                {isHindi ? "पृष्ठ" : "pages"}
              </span>
            ) : null}
          </div>

          <h3 className="mt-2 text-sm font-black leading-5 text-slate-900">
            {record?.title ||
              record?.fileName ||
              (isHindi
                ? "चिकित्सीय रिकॉर्ड"
                : "Medical record")}
          </h3>

          <div className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-500">
            <span className="inline-flex items-center gap-1">
              <CalendarDays size={12} />
              {formatDate(
                getRecordDate(record),
                isHindi
              )}
            </span>

            <span>·</span>

            <span className="inline-flex min-w-0 items-center gap-1">
              <Building2
                size={12}
                className="shrink-0"
              />
              <span className="max-w-[170px] truncate">
                {getRecordSource(
                  record,
                  isHindi
                )}
              </span>
            </span>
          </div>

          {entityCount > 0 ? (
            <div className="mt-3 inline-flex rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-semibold text-slate-500">
              {entityCount}{" "}
              {isHindi
                ? "निकाली गई जानकारी"
                : "extracted items"}
            </div>
          ) : null}
        </div>

        <ChevronRight
          size={18}
          className="mt-1 shrink-0 text-slate-400"
        />
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
        <StatusBadge
          status={record?.status}
          isHindi={isHindi}
        />

        <span className="text-[10px] font-bold text-teal-800">
          {isHindi
            ? "विवरण देखें"
            : "View details"}
        </span>
      </div>
    </button>
  );
}

function EmptyRecords({
  isHindi,
  searching,
  onUpload,
}) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-200 bg-white px-6 py-10 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
        {searching ? (
          <Search size={26} />
        ) : (
          <FileText size={26} />
        )}
      </div>

      <h3 className="mt-4 text-base font-black text-slate-800">
        {searching
          ? isHindi
            ? "कोई रिकॉर्ड नहीं मिला"
            : "No matching records"
          : isHindi
            ? "अभी कोई रिकॉर्ड नहीं है"
            : "No medical records yet"}
      </h3>

      <p className="mx-auto mt-1.5 max-w-xs text-xs leading-5 text-slate-500">
        {searching
          ? isHindi
            ? "खोज शब्द बदलकर फिर प्रयास करें।"
            : "Try a different search term."
          : isHindi
            ? "आपके अपलोड किए गए दस्तावेज़ यहां दिखाई देंगे।"
            : "Your uploaded documents will appear here."}
      </p>

      {!searching ? (
        <button
          type="button"
          onClick={onUpload}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-teal-800 px-4 py-2.5 text-xs font-bold text-white active:scale-95"
        >
          <UploadCloud size={14} />
          {isHindi
            ? "दस्तावेज़ अपलोड करें"
            : "Upload document"}
        </button>
      ) : null}
    </div>
  );
}