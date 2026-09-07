import React, { useMemo } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Building2,
  Stethoscope,
  Pill,
  AlertCircle,
  CheckCircle2,
  Eye,
  Edit2,
  FileText,
  FlaskConical,
  ClipboardList,
  UserRound,
  Clock3,
  ChevronRight,
} from "lucide-react";

import useMobileStore, { SCREENS } from "../../store/useMobileStore";
import MobileHeader from "../../components/mobile/MobileHeader";
import BottomNavBar from "../../components/mobile/BottomNavBar";
import OriginalDocModal from "../../components/mobile/OriginalDocModal";
import EditItemModal from "../../components/mobile/EditItemModal";
import useLanguage from "../../i18n/translations";

const normalizeArray = (value) => {
  if (Array.isArray(value)) return value;
  if (value === null || value === undefined || value === "") return [];
  return [value];
};

const getTypeLabel = (record, isHindi) => {
  switch (record?.type) {
    case "prescription":
      return isHindi ? "पर्चा" : "Prescription";
    case "lab_report":
      return isHindi ? "लैब रिपोर्ट" : "Lab Report";
    case "discharge_summary":
      return isHindi ? "डिस्चार्ज सारांश" : "Discharge Summary";
    default:
      return record?.typeLabel || (isHindi ? "अन्य रिकॉर्ड" : "Medical Record");
  }
};

const StatusBadge = ({ status, isHindi }) => {
  const config = {
    UPLOADED: {
      icon: Clock3,
      label: isHindi ? "अपलोड किया गया" : "Uploaded",
      className: "bg-slate-100 text-slate-700 border-slate-300",
    },
    CONFIRMED: {
      icon: CheckCircle2,
      label: isHindi ? "सत्यापित" : "Confirmed",
      className: "bg-teal-50 text-teal-800 border-teal-200",
    },
    NEEDS_REVIEW: {
      icon: AlertCircle,
      label: isHindi ? "समीक्षा आवश्यक" : "Needs Review",
      className: "bg-amber-50 text-amber-900 border-amber-300",
    },
    PROCESSING: {
      icon: Clock3,
      label: isHindi ? "प्रक्रिया जारी" : "Processing",
      className: "bg-blue-50 text-blue-800 border-blue-200",
    },
    PROCESSED: {
      icon: CheckCircle2,
      label: isHindi ? "प्रसंस्कृत" : "Processed",
      className: "bg-emerald-50 text-emerald-800 border-emerald-200",
    },
    FAILED: {
      icon: AlertCircle,
      label: isHindi ? "विफल" : "Failed",
      className: "bg-rose-50 text-rose-800 border-rose-200",
    },
  };

  const current = config[status] || config.PROCESSED;
  const Icon = current.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold ${current.className}`}
    >
      <Icon
        className={`w-3.5 h-3.5 ${
          status === "PROCESSING" ? "animate-spin" : ""
        }`}
      />
      {current.label}
    </span>
  );
};

const Section = ({ title, icon: Icon, children }) => (
  <section className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-3">
    <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
      <Icon className="w-4 h-4 text-teal-800 shrink-0" />
      <h2 className="text-sm font-black text-slate-900">{title}</h2>
    </div>

    {children}
  </section>
);

const EmptyExtraction = ({ text }) => (
  <p className="text-xs text-slate-500 italic py-1">{text}</p>
);

const VerificationBadge = ({ needsVerification, isHindi }) => {
  if (needsVerification) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black">
        <AlertCircle className="w-3 h-3" />
        {isHindi ? "जांचें" : "Verify"}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
      <CheckCircle2 className="w-3 h-3" />
      {isHindi ? "सत्यापित" : "Verified"}
    </span>
  );
};

export const DocumentDetailsScreen = () => {
  const {
    selectedMedicalRecord,
    medicalRecords,
    setOriginalDocModalOpen,
    setEditingEntity,
    setSelectedVisit,
    setScreen,
    prevScreen,
    setCapturedDocument,
    setActiveNavTab,
  } = useMobileStore();

  const { isHindi } = useLanguage();

  const record = useMemo(() => {
    if (selectedMedicalRecord) {
      return selectedMedicalRecord;
    }

    if (Array.isArray(medicalRecords) && medicalRecords.length > 0) {
      return medicalRecords[0];
    }

    return null;
  }, [selectedMedicalRecord, medicalRecords]);

  const associatedVisit = useMemo(() => {
    if (!record?.visitId) return null;

    return (
      (Array.isArray([])
        ? [].find((visit) => visit.id === record.visitId)
        : null) || null
    );
  }, [record]);

  const extraction =
    record?.extractedInformation ||
    record?.extraction ||
    record?.extractedData ||
    {};

  const medicines = normalizeArray(extraction?.medicines);
  const investigations = normalizeArray(extraction?.investigations);
  const procedures = normalizeArray(extraction?.procedures);
  const diagnosis = normalizeArray(extraction?.diagnosis);
  const recordDetails = normalizeArray(extraction?.recordDetails);

  const date =
    record?.displayDate ||
    record?.date ||
    record?.createdAt ||
    (isHindi ? "तारीख उपलब्ध नहीं" : "Date unavailable");

  const source =
    record?.source ||
    record?.clinic ||
    record?.hospital ||
    (isHindi ? "स्वास्थ्य केंद्र" : "Healthcare facility");

  const pages =
    Array.isArray(record?.pages) && record.pages.length > 0
      ? record.pages
      : [];

  const totalPages =
    pages.length > 0
      ? pages.length
      : Number(record?.totalPages || 1);

  const handleViewOriginal = () => {
    if (!record) return;

    const documentPages = pages.map((page, index) => ({
      ...page,
      id: page?.id || `${record.id || "record"}-page-${index + 1}`,
      fileName:
        page?.fileName ||
        page?.name ||
        `${record.title || "Medical Document"} · Page ${index + 1}`,
      image:
        page?.image ||
        page?.dataUrl ||
        page?.imageSrc ||
        null,
      dataUrl:
        page?.dataUrl ||
        page?.image ||
        page?.imageSrc ||
        null,
    }));

    setCapturedDocument({
      id: record.id,
      fileName:
        record.fileName ||
        record.title ||
        "Medical_Document",
      date,
      doctor: record.doctor || "",
      clinic: source,
      dataUrl:
        record.dataUrl ||
        record.image ||
        documentPages[0]?.dataUrl ||
        null,
      pages: documentPages,
      totalPages,
    });

    setOriginalDocModalOpen(true);
  };

  const handleOpenAssociatedVisit = () => {
    if (!associatedVisit) return;

    setSelectedVisit(associatedVisit);
    setActiveNavTab("visits");
    setScreen(SCREENS.VISIT_DETAILS);
  };

  if (!record) {
    return (
      <div className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        <MobileHeader
          title={isHindi ? "दस्तावेज़ विवरण" : "Document Details"}
          showBack={true}
          onBack={prevScreen}
        />

        <main className="flex-1 px-4 py-10 flex items-center justify-center">
          <div className="w-full max-w-md p-7 rounded-3xl bg-white border border-slate-200 text-center shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto">
              <FileText className="w-7 h-7 text-slate-500" />
            </div>

            <h1 className="mt-4 text-lg font-black">
              {isHindi
                ? "दस्तावेज़ उपलब्ध नहीं है"
                : "Document unavailable"}
            </h1>

            <p className="mt-1.5 text-xs text-slate-500">
              {isHindi
                ? "कृपया रिकॉर्ड सूची से दस्तावेज़ दोबारा खोलें।"
                : "Please open the document again from your records."}
            </p>

            <button
              type="button"
              onClick={prevScreen}
              className="mt-5 w-full h-11 rounded-xl bg-teal-800 text-white text-xs font-bold cursor-pointer"
            >
              {isHindi ? "वापस जाएं" : "Go back"}
            </button>
          </div>
        </main>

        <BottomNavBar />
      </div>
    );
  }

  return (
    <div className="min-h-full flex flex-col bg-slate-50 text-slate-900 select-none">
      <MobileHeader
        title={isHindi ? "दस्तावेज़ विवरण" : "Document Details"}
        showBack={true}
        onBack={prevScreen}
      />

      <main className="flex-1 px-4 sm:px-6 py-4 sm:py-6 max-w-md md:max-w-2xl lg:max-w-3xl mx-auto w-full space-y-5">
        {/* Document overview */}
        <section className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 text-[10px] font-black uppercase tracking-wide">
              <FileText className="w-3.5 h-3.5" />
              {getTypeLabel(record, isHindi)}
            </span>

            <StatusBadge
              status={record.status}
              isHindi={isHindi}
            />
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-black leading-snug break-words">
              {record.title ||
                (isHindi ? "चिकित्सीय रिकॉर्ड" : "Medical Record")}
            </h1>

            <div className="mt-2 flex items-center gap-2 flex-wrap text-xs text-slate-500">
              <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
                <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                {date}
              </span>

              <span>·</span>

              <span className="inline-flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                {source}
              </span>

              {totalPages > 1 && (
                <>
                  <span>·</span>
                  <span className="font-semibold text-teal-800">
                    {totalPages} {isHindi ? "पृष्ठ" : "pages"}
                  </span>
                </>
              )}
            </div>

            {(record.doctor || record.department) && (
              <div className="mt-3 flex items-center gap-2 text-xs text-slate-600">
                <UserRound className="w-3.5 h-3.5 text-slate-400" />

                <span>
                  {record.doctor || ""}
                  {record.doctor && record.department ? " · " : ""}
                  {record.department || ""}
                </span>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
            <div className="text-[11px] text-slate-400 leading-relaxed">
              {isHindi
                ? "मूल दस्तावेज़ से निकाली गई जानकारी"
                : "Information extracted from the source document"}
            </div>

            <button
              type="button"
              onClick={handleViewOriginal}
              className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold hover:bg-teal-100 active:scale-95 transition cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              {isHindi ? "मूल देखें" : "View Original"}
            </button>
          </div>
        </section>

        {/* Associated visit */}
        <Section
          title={
            isHindi
              ? "संबंधित स्वास्थ्य परामर्श"
              : "Associated Healthcare Encounter"
          }
          icon={Stethoscope}
        >
          {associatedVisit ? (
            <button
              type="button"
              onClick={handleOpenAssociatedVisit}
              className="w-full p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-left flex items-center justify-between gap-3 hover:border-teal-500 transition cursor-pointer"
            >
              <div className="min-w-0">
                <p className="text-xs font-bold text-teal-800">
                  {associatedVisit.date || ""}
                  {associatedVisit.department
                    ? ` · ${
                        isHindi
                          ? associatedVisit.hindiDepartment ||
                            associatedVisit.department
                          : associatedVisit.department
                      }`
                    : ""}
                </p>

                <p className="text-sm font-black text-slate-900 mt-1">
                  {isHindi
                    ? associatedVisit.hindiDoctor ||
                      associatedVisit.doctor
                    : associatedVisit.doctor}
                </p>

                <p className="text-[11px] text-slate-500 mt-0.5">
                  {isHindi
                    ? associatedVisit.hindiHospital ||
                      associatedVisit.hospital
                    : associatedVisit.hospital}
                </p>
              </div>

              <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
            </button>
          ) : (
            <p className="text-xs text-slate-500 italic">
              {isHindi
                ? "यह रिकॉर्ड किसी विशिष्ट मुलाकात से लिंक नहीं है।"
                : "This record is not linked to a specific visit."}
            </p>
          )}
        </Section>

        {/* Safety note */}
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />

            <div>
              <p className="text-xs font-black text-amber-900">
                {isHindi
                  ? "दस्तावेज़ से निकाली गई जानकारी"
                  : "Information read from the document"}
              </p>

              <p className="text-[11px] text-amber-900/80 mt-1 leading-relaxed">
                {isHindi
                  ? "किसी भी दवा, जांच या अन्य जानकारी को मूल दस्तावेज़ से मिलाकर देखें। यह नैदानिक निर्णय नहीं है।"
                  : "Check medicines, investigations and other information against the original document. This is not a clinical decision."}
              </p>
            </div>
          </div>
        </div>

        {/* Medicines */}
        <Section
          title={isHindi ? "पहचानी गई दवाइयां" : "Extracted Medicines"}
          icon={Pill}
        >
          {medicines.length === 0 ? (
            <EmptyExtraction
              text={
                isHindi
                  ? "इस रिकॉर्ड से कोई दवा नहीं मिली।"
                  : "No medicines were extracted from this record."
              }
            />
          ) : (
            <div className="space-y-2.5">
              {medicines.map((medicine, index) => {
                const id = medicine?.id || `medicine-${index}`;

                return (
                  <div
                    key={id}
                    className={`p-3.5 rounded-2xl border ${
                      medicine?.needsVerification
                        ? "bg-amber-50/60 border-amber-300"
                        : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-black text-slate-900">
                          {medicine?.name ||
                            (isHindi ? "दवा" : "Medicine")}
                        </p>

                        {(medicine?.dosage ||
                          medicine?.schedule ||
                          medicine?.instruction) && (
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                            {[medicine?.dosage, medicine?.schedule]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                        )}

                        {medicine?.instruction && (
                          <p className="text-[11px] text-slate-500 mt-1">
                            {medicine.instruction}
                          </p>
                        )}

                        {medicine?.needsVerification && (
                          <p className="text-[11px] text-amber-800 mt-2 flex items-start gap-1">
                            <AlertCircle className="w-3 h-3 shrink-0 mt-0.5" />
                            {medicine?.verificationReason ||
                              (isHindi
                                ? "मूल पर्चे से मिलान करें।"
                                : "Verify against the original document.")}
                          </p>
                        )}
                      </div>

                      <div className="shrink-0 flex flex-col items-end gap-2">
                        <VerificationBadge
                          needsVerification={
                            medicine?.needsVerification
                          }
                          isHindi={isHindi}
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setEditingEntity({
                              type: "medicine",
                              data: medicine,
                            })
                          }
                          className="inline-flex items-center gap-1 text-xs font-bold text-teal-800 cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3" />
                          {isHindi ? "संपादित करें" : "Edit"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Section>

        {/* Lab investigations */}
        <Section
          title={isHindi ? "जांच परिणाम" : "Investigations & Results"}
          icon={FlaskConical}
        >
          {investigations.length === 0 ? (
            <EmptyExtraction
              text={
                isHindi
                  ? "इस रिकॉर्ड में कोई जांच परिणाम नहीं मिला।"
                  : "No investigation results were extracted."
              }
            />
          ) : (
            <div className="space-y-2.5">
              {investigations.map((test, index) => {
                const id = test?.id || `investigation-${index}`;

                return (
                  <div
                    key={id}
                    className={`p-3.5 rounded-2xl border ${
                      test?.needsVerification
                        ? "bg-amber-50/60 border-amber-300"
                        : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-black text-slate-900">
                          {test?.testName ||
                            test?.name ||
                            (isHindi ? "जांच" : "Investigation")}
                        </p>

                        <p className="text-sm font-bold text-slate-700 mt-1">
                          {[test?.value, test?.unit]
                            .filter(Boolean)
                            .join(" ")}
                        </p>

                        {test?.referenceRange && (
                          <p className="text-[11px] text-slate-500 mt-1">
                            {isHindi ? "संदर्भ सीमा" : "Reference range"}:{" "}
                            {test.referenceRange}
                          </p>
                        )}

                        {test?.needsVerification && (
                          <p className="text-[11px] text-amber-800 mt-2 flex items-start gap-1">
                            <AlertCircle className="w-3 h-3 shrink-0 mt-0.5" />
                            {test?.verificationReason ||
                              (isHindi
                                ? "मूल रिपोर्ट से मिलान करें।"
                                : "Verify against the original report.")}
                          </p>
                        )}
                      </div>

                      <div className="shrink-0 flex flex-col items-end gap-2">
                        <VerificationBadge
                          needsVerification={test?.needsVerification}
                          isHindi={isHindi}
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setEditingEntity({
                              type: "investigation",
                              data: test,
                            })
                          }
                          className="inline-flex items-center gap-1 text-xs font-bold text-teal-800 cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3" />
                          {isHindi ? "संपादित करें" : "Edit"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Section>

        {/* Diagnosis */}
        <Section
          title={
            isHindi
              ? "निदान / दस्तावेज़ में लिखी जानकारी"
              : "Diagnosis / Document Information"
          }
          icon={Stethoscope}
        >
          {diagnosis.length === 0 ? (
            <EmptyExtraction
              text={
                isHindi
                  ? "कोई विशिष्ट निदान जानकारी नहीं मिली।"
                  : "No specific diagnosis information was extracted."
              }
            />
          ) : (
            <div className="space-y-2.5">
              {diagnosis.map((item, index) => {
                const id = item?.id || `diagnosis-${index}`;
                const label = item?.value || item?.name || "";

                return (
                  <div
                    key={id}
                    className={`p-3.5 rounded-2xl border ${
                      item?.needsVerification
                        ? "bg-amber-50/60 border-amber-300"
                        : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-slate-900">
                          {label}
                        </p>

                        {item?.needsVerification && (
                          <p className="text-[11px] text-amber-800 mt-1.5">
                            {item?.verificationReason ||
                              (isHindi
                                ? "मूल दस्तावेज़ से जांचें।"
                                : "Verify against the original document.")}
                          </p>
                        )}
                      </div>

                      <div className="shrink-0 flex flex-col items-end gap-2">
                        <VerificationBadge
                          needsVerification={item?.needsVerification}
                          isHindi={isHindi}
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setEditingEntity({
                              type: "diagnosis",
                              data: {
                                id,
                                name: label,
                              },
                            })
                          }
                          className="inline-flex items-center gap-1 text-xs font-bold text-teal-800 cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3" />
                          {isHindi ? "संपादित करें" : "Edit"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Section>

        {/* Other document details */}
        {recordDetails.length > 0 && (
          <Section
            title={
              isHindi ? "दस्तावेज़ विवरण" : "Document Details"
            }
            icon={ClipboardList}
          >
            <div className="space-y-2">
              {recordDetails.map((detail, index) => (
                <div
                  key={detail?.id || `detail-${index}`}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-3"
                >
                  <div>
                    <p className="text-[10px] uppercase tracking-wide font-bold text-slate-400">
                      {detail?.label || "Detail"}
                    </p>

                    <p className="text-sm font-bold text-slate-800 mt-0.5">
                      {detail?.value || ""}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setEditingEntity({
                        type: "recordDetail",
                        data: detail,
                      })
                    }
                    className="shrink-0 text-xs font-bold text-teal-800 cursor-pointer"
                  >
                    {isHindi ? "संपादित करें" : "Edit"}
                  </button>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Procedure */}
        {procedures.length > 0 && (
          <Section
            title={isHindi ? "प्रक्रिया विवरण" : "Procedure Details"}
            icon={ClipboardList}
          >
            <div className="space-y-2.5">
              {procedures.map((procedure, index) => (
                <div
                  key={
                    procedure?.id ||
                    `procedure-${index}`
                  }
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-3"
                >
                  <div>
                    <p className="text-sm font-black text-slate-900">
                      {procedure?.name ||
                        (isHindi ? "प्रक्रिया" : "Procedure")}
                    </p>

                    {procedure?.notes && (
                      <p className="text-xs text-slate-500 mt-1">
                        {procedure.notes}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setEditingEntity({
                        type: "procedure",
                        data: procedure,
                      })
                    }
                    className="shrink-0 inline-flex items-center gap-1 text-xs font-bold text-teal-800 cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3" />
                    {isHindi ? "संपादित करें" : "Edit"}
                  </button>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Source metadata */}
        <section className="p-4 rounded-2xl bg-slate-100 border border-slate-200">
          <div className="flex items-start gap-2">
            <FileText className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />

            <div>
              <p className="text-xs font-bold text-slate-700">
                {isHindi ? "स्रोत" : "Source"}
              </p>

              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                {source}
                {record.doctor ? ` · ${record.doctor}` : ""}
              </p>

              <p className="text-[10px] text-slate-400 mt-1">
                {isHindi
                  ? "यह जानकारी रिकॉर्ड में उपलब्ध स्रोत विवरण पर आधारित है।"
                  : "This information is based on source details available with the record."}
              </p>
            </div>
          </div>
        </section>

        {/* Back */}
        <div className="pb-6">
          <button
            type="button"
            onClick={prevScreen}
            className="w-full h-12 rounded-2xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 transition active:scale-[0.99] cursor-pointer shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            {isHindi
              ? "चिकित्सीय रिकॉर्ड पर वापस जाएं"
              : "Back to Medical Records"}
          </button>
        </div>
      </main>

      <BottomNavBar />

      <OriginalDocModal />

      <EditItemModal />
    </div>
  );
};

export default DocumentDetailsScreen;