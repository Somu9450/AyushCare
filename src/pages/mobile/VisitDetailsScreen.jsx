import React, { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronRight,
  FileText,
  Hospital,
  Loader2,
  MapPin,
  RefreshCw,
  Stethoscope,
} from "lucide-react";

import useMobileStore, {
  SCREENS,
} from "../../store/useMobileStore";
import {
  fetchVisitDetails,
  getDocumentsForVisit,
} from "../../services/visitService";
import MobileHeader from "../../components/mobile/MobileHeader";
import BottomNavBar from "../../components/mobile/BottomNavBar";
import { useLanguage } from "../../i18n/translations";

function getVisitId(visit) {
  return (
    visit?.id ||
    visit?.visitId ||
    visit?.appointmentId ||
    null
  );
}

function formatDate(value, isHindi) {
  if (!value) {
    return isHindi ? "तारीख उपलब्ध नहीं" : "Date unavailable";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return String(value);
  }

  return parsed.toLocaleDateString(
    isHindi ? "hi-IN" : "en-IN",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );
}

function normalizeDocuments(result) {
  if (Array.isArray(result)) return result;

  if (Array.isArray(result?.documents)) {
    return result.documents;
  }

  if (Array.isArray(result?.records)) {
    return result.records;
  }

  if (Array.isArray(result?.data)) {
    return result.data;
  }

  return [];
}

export default function VisitDetailsScreen() {
  const {
    selectedVisit,
    medicalRecords,
    setSelectedMedicalRecord,
    setScreen,
  } = useMobileStore();

  const { isHindi } = useLanguage();

  const [visitDetails, setVisitDetails] =
    useState(selectedVisit || null);

  const [linkedDocuments, setLinkedDocuments] =
    useState([]);

  const [loading, setLoading] = useState(true);
  const [documentsLoading, setDocumentsLoading] =
    useState(true);
  const [error, setError] = useState("");

  const visitId = getVisitId(selectedVisit);

  useEffect(() => {
    let cancelled = false;

    const loadDetails = async () => {
      if (!visitId) {
        setVisitDetails(selectedVisit || null);
        setLoading(false);
        setDocumentsLoading(false);
        return;
      }

      setLoading(true);
      setDocumentsLoading(true);
      setError("");

      try {
        const [detailsResult, documentsResult] =
          await Promise.all([
            fetchVisitDetails(visitId),
            getDocumentsForVisit(visitId),
          ]);

        if (cancelled) return;

        setVisitDetails(
          detailsResult?.visit ||
            detailsResult?.data ||
            detailsResult ||
            selectedVisit
        );

        setLinkedDocuments(
          normalizeDocuments(documentsResult)
        );
      } catch (loadError) {
        if (cancelled) return;

        setError(
          loadError?.message ||
            (isHindi
              ? "विज़िट विवरण लोड नहीं हो सका।"
              : "Unable to load visit details.")
        );

        setVisitDetails(selectedVisit || null);
        setLinkedDocuments([]);
      } finally {
        if (!cancelled) {
          setLoading(false);
          setDocumentsLoading(false);
        }
      }
    };

    loadDetails();

    return () => {
      cancelled = true;
    };
  }, [visitId]);

  const fallbackDocuments = useMemo(() => {
    if (!visitId || !Array.isArray(medicalRecords)) {
      return [];
    }

    return medicalRecords.filter((record) => {
      const recordVisitId =
        record?.visitId ||
        record?.associatedVisitId ||
        record?.appointmentId;

      return (
        String(recordVisitId || "") ===
        String(visitId)
      );
    });
  }, [medicalRecords, visitId]);

  const documents =
    linkedDocuments.length > 0
      ? linkedDocuments
      : fallbackDocuments;

  const visit = visitDetails || {};

  const doctor =
    visit?.doctor ||
    visit?.doctorName ||
    visit?.physician ||
    (isHindi ? "चिकित्सक" : "Doctor");

  const department =
    visit?.department ||
    visit?.specialty ||
    visit?.departmentName ||
    (isHindi ? "सामान्य चिकित्सा" : "General Medicine");

  const facility =
    visit?.facility ||
    visit?.hospital ||
    visit?.hospitalName ||
    (isHindi ? "स्वास्थ्य केंद्र" : "Healthcare facility");

  const location =
    visit?.location ||
    visit?.address ||
    "";

  const date =
    visit?.date ||
    visit?.visitDate ||
    visit?.appointmentDate ||
    "";

  const summary =
    visit?.summary ||
    visit?.reason ||
    visit?.chiefComplaint ||
    visit?.notes ||
    "";

  const diagnosis =
    visit?.diagnosis ||
    visit?.diagnoses ||
    "";

  const openDocument = (record) => {
    if (!record) return;

    setSelectedMedicalRecord(record);
    setScreen(SCREENS.DOCUMENT_DETAILS);
  };

  if (!selectedVisit) {
    return (
      <div className="min-h-screen bg-slate-50">
        <MobileHeader
          title={isHindi ? "विज़िट विवरण" : "Visit Details"}
        />

        <main className="mx-auto max-w-md px-5 py-10">
          <div className="rounded-3xl bg-white p-7 text-center shadow-sm ring-1 ring-slate-200">
            <Stethoscope
              size={32}
              className="mx-auto text-slate-300"
            />

            <h2 className="mt-4 text-base font-bold text-slate-800">
              {isHindi
                ? "विज़िट उपलब्ध नहीं है"
                : "Visit not selected"}
            </h2>

            <button
              type="button"
              onClick={() => setScreen(SCREENS.VISITS)}
              className="mt-5 rounded-xl bg-teal-700 px-4 py-2.5 text-xs font-bold text-white"
            >
              {isHindi ? "विज़िट देखें" : "View visits"}
            </button>
          </div>
        </main>

        <BottomNavBar />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <MobileHeader
        title={isHindi ? "विज़िट विवरण" : "Visit Details"}
        subtitle={
          isHindi
            ? "स्वास्थ्य मुलाकात"
            : "Healthcare encounter"
        }
      />

      <main className="mx-auto w-full max-w-md px-4 py-5 pb-24 sm:px-5">
        {error ? (
          <div className="mb-4 flex items-start justify-between gap-3 rounded-2xl bg-amber-50 p-4 text-xs text-amber-900 ring-1 ring-amber-200">
            <span>{error}</span>

            <RefreshCw
              size={15}
              className="shrink-0"
            />
          </div>
        ) : null}

        <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
              <Stethoscope size={23} />
            </div>

            <div className="min-w-0 flex-1">
              <h1 className="text-base font-black text-slate-900">
                {department}
              </h1>

              <p className="mt-1 text-sm font-medium text-slate-500">
                {doctor}
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <InfoTile
              icon={CalendarDays}
              label={isHindi ? "तारीख" : "Date"}
              value={formatDate(date, isHindi)}
            />

            <InfoTile
              icon={Hospital}
              label={isHindi ? "केंद्र" : "Facility"}
              value={facility}
            />
          </div>

          {location ? (
            <div className="mt-3 flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-3">
              <MapPin
                size={16}
                className="shrink-0 text-slate-400"
              />

              <span className="truncate text-xs font-medium text-slate-600">
                {location}
              </span>
            </div>
          ) : null}
        </section>

        {loading ? (
          <div className="mt-4 rounded-3xl bg-white p-6 text-center shadow-sm ring-1 ring-slate-200">
            <Loader2
              size={25}
              className="mx-auto animate-spin text-teal-700"
            />

            <p className="mt-3 text-xs font-semibold text-slate-500">
              {isHindi
                ? "विवरण लोड हो रहा है..."
                : "Loading details..."}
            </p>
          </div>
        ) : (
          <>
            {summary || diagnosis ? (
              <section className="mt-4 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                <h2 className="text-sm font-black text-slate-800">
                  {isHindi
                    ? "मुलाकात का सार"
                    : "Visit summary"}
                </h2>

                {summary ? (
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {summary}
                  </p>
                ) : null}

                {diagnosis ? (
                  <div className="mt-4 rounded-2xl bg-slate-50 p-3.5">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                      {isHindi ? "निदान" : "Diagnosis"}
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-700">
                      {typeof diagnosis === "object"
                        ? diagnosis?.label ||
                          diagnosis?.name ||
                          JSON.stringify(diagnosis)
                        : diagnosis}
                    </p>
                  </div>
                ) : null}
              </section>
            ) : null}

            <section className="mt-4">
              <div className="mb-3 flex items-center justify-between px-1">
                <div>
                  <h2 className="text-sm font-black text-slate-800">
                    {isHindi
                      ? "इस विज़िट के दस्तावेज़"
                      : "Documents from this visit"}
                  </h2>

                  <p className="mt-0.5 text-[11px] text-slate-400">
                    {documents.length}{" "}
                    {isHindi
                      ? "दस्तावेज़"
                      : documents.length === 1
                        ? "document"
                        : "documents"}
                  </p>
                </div>
              </div>

              {documentsLoading ? (
                <div className="rounded-3xl bg-white p-7 text-center ring-1 ring-slate-200">
                  <Loader2
                    size={23}
                    className="mx-auto animate-spin text-teal-700"
                  />
                </div>
              ) : documents.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-7 text-center">
                  <FileText
                    size={29}
                    className="mx-auto text-slate-300"
                  />

                  <p className="mt-3 text-xs font-medium text-slate-500">
                    {isHindi
                      ? "इस विज़िट से कोई दस्तावेज़ जुड़ा नहीं है।"
                      : "No documents are linked to this visit."}
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {documents.map((record, index) => (
                    <button
                      key={
                        record?.id ||
                        record?.documentId ||
                        `document-${index}`
                      }
                      type="button"
                      onClick={() =>
                        openDocument(record)
                      }
                      className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition active:scale-[0.99]"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                        <FileText size={19} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-slate-800">
                          {record?.title ||
                            record?.fileName ||
                            (isHindi
                              ? "चिकित्सीय दस्तावेज़"
                              : "Medical document")}
                        </p>

                        <p className="mt-1 truncate text-[11px] text-slate-500">
                          {record?.typeLabel ||
                            record?.type ||
                            (isHindi
                              ? "दस्तावेज़"
                              : "Document")}
                        </p>
                      </div>

                      <ChevronRight
                        size={18}
                        className="shrink-0 text-slate-400"
                      />
                    </button>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>

      <BottomNavBar />
    </div>
  );
}

function InfoTile({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="rounded-2xl bg-slate-50 px-3 py-3">
      <div className="flex items-center gap-1.5 text-slate-400">
        <Icon size={13} />
        <span className="text-[10px] font-semibold">
          {label}
        </span>
      </div>

      <p className="mt-1 truncate text-xs font-bold text-slate-700">
        {value}
      </p>
    </div>
  );
}