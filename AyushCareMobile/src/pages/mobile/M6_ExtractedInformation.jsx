import React, { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Edit3,
  FileText,
  FlaskConical,
  Pill,
  Stethoscope,
  UserRound,
  X,
} from "lucide-react";
import { useMobileStore } from "../../store/useMobileStore";

const safeArray = (value) => {
  if (Array.isArray(value)) return value;
  if (value === undefined || value === null || value === "") return [];
  return [value];
};

const firstNonEmpty = (...values) => {
  for (const value of values) {
    if (
      value !== undefined &&
      value !== null &&
      String(value).trim() !== ""
    ) {
      return value;
    }
  }

  return "";
};

const normalizeData = (data) => {
  const source = data || {};
  const entities = source.detected_entities || source.detectedEntities || {};

  return {
    status: firstNonEmpty(
      source.extraction_status,
      source.extractionStatus,
      "success"
    ),

    parsedDate: firstNonEmpty(
      source.parsed_date,
      source.parsedDate,
      source.date,
      source.documentDate
    ),

    medicines: safeArray(
      firstNonEmpty(
        source.medicines,
        source.medications,
        entities.medicines
      )
    ),

    diagnoses: safeArray(
      firstNonEmpty(
        source.diagnoses,
        source.conditions,
        entities.diagnoses
      )
    ),

    investigations: safeArray(
      firstNonEmpty(
        source.investigations,
        source.tests,
        source.labResults,
        entities.investigations,
        entities.lab_results,
        entities.tests
      )
    ),

    symptoms: safeArray(
      firstNonEmpty(
        source.symptoms,
        source.complaints,
        source.chiefComplaint,
        source.chief_complaint,
        entities.symptoms
      )
    ),

    allergies: safeArray(
      firstNonEmpty(
        source.allergies,
        entities.allergies
      )
    ),

    rawText: firstNonEmpty(
      source.raw_text,
      source.rawText,
      source.ocr_text,
      source.ocrText
    ),
  };
};

const itemToText = (item) => {
  if (typeof item === "string") return item;

  if (!item || typeof item !== "object") {
    return String(item ?? "");
  }

  return firstNonEmpty(
    item.name,
    item.medicine,
    item.medication,
    item.test,
    item.testName,
    item.diagnosis,
    item.label,
    item.value,
    "Information"
  );
};

const itemDetails = (item) => {
  if (!item || typeof item !== "object") return "";

  const parts = [
    firstNonEmpty(item.dose, item.dosage),
    item.frequency,
    item.duration,
    item.unit,
    item.referenceRange,
    item.result,
    item.value,
  ].filter(Boolean);

  return parts.join(" • ");
};

function EditableSection({
  title,
  icon,
  items,
  onEdit,
}) {
  if (!items.length) return null;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="rounded-xl bg-slate-100 p-2 text-slate-700">
            {icon}
          </div>
          <h2 className="font-semibold text-slate-900">{title}</h2>
        </div>

        <button
          type="button"
          onClick={onEdit}
          className="flex h-10 items-center gap-1.5 rounded-lg px-2.5 text-sm font-semibold text-teal-700"
        >
          <Edit3 size={16} />
          Edit
        </button>
      </div>

      <div className="space-y-2">
        {items.map((item, index) => (
          <div
            key={`${title}-${index}`}
            className="rounded-xl bg-slate-50 px-3 py-3"
          >
            <p className="font-medium text-slate-800">
              {itemToText(item)}
            </p>

            {itemDetails(item) && (
              <p className="mt-1 text-xs leading-5 text-slate-500">
                {itemDetails(item)}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export default function M6_ExtractedInformation() {
  const {
    extractedData,
    capturedDocument,
    selectedDocumentType,
    setExtractedData,
    setScreen,
  } = useMobileStore();

  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState("");

  const normalized = useMemo(
    () => normalizeData(extractedData),
    [extractedData]
  );

  const documentType =
    selectedDocumentType ||
    capturedDocument?.documentType ||
    extractedData?.documentType ||
    "other";

  const abnormalValues = Array.isArray(extractedData?.abnormal_values)
    ? extractedData.abnormal_values
    : Array.isArray(extractedData?.abnormalValues) ? extractedData.abnormalValues : [];

  const insightText = abnormalValues.length
    ? `${abnormalValues.length} value${abnormalValues.length === 1 ? "" : "s"} may need attention.`
    : normalized.medicines.length || normalized.diagnoses.length || normalized.investigations.length
      ? "The document was read and useful medical information was found."
      : "No clear structured insight was detected.";

  const openEditor = (section) => {
    const values = normalized[section] || [];

    setEditing(section);
    setDraft(values.map(itemToText).join("\n"));
  };

  const saveEditor = () => {
    if (!editing) return;

    const values = draft
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);

    const next = {
      ...(extractedData || {}),
      [editing]: values,
    };

    /*
     * Keep the AI/backend response intact while allowing the patient to
     * correct the structured values before continuing.
     */
    if (editing === "medicines") {
      next.medications = values;
    }

    if (editing === "investigations") {
      next.tests = values;
    }

    if (editing === "diagnoses") {
      next.conditions = values;
    }

    setExtractedData(next);
    setEditing(null);
    setDraft("");
  };

  const handleContinue = () => {
    /*
     * The store/service layer will use this normalized extraction for the
     * timeline and health-summary stages.
     */
    setExtractedData({
      ...(extractedData || {}),
      extraction_status: normalized.status || "success",
      parsed_date: normalized.parsedDate || null,
      detected_entities: {
        ...(extractedData?.detected_entities || {}),
        medicines: normalized.medicines,
        diagnoses: normalized.diagnoses,
        investigations: normalized.investigations,
        symptoms: normalized.symptoms,
        allergies: normalized.allergies,
      },
    });

    setScreen("M7");
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-4">
          <button
            type="button"
            onClick={() => setScreen("M4")}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700"
            aria-label="Back"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
              Step 5 of 6
            </p>
            <h1 className="truncate text-lg font-bold text-slate-900">
              Check extracted information
            </h1>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <CheckCircle2 size={20} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-4 px-4 py-5">
        <section className="rounded-3xl bg-teal-700 p-5 text-white shadow-sm">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-white/15 p-2">
              <FileText size={22} />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-teal-100">
                {documentType}
              </p>

              <h2 className="mt-1 text-xl font-bold">
                We found information in your document
              </h2>

              <p className="mt-2 text-sm leading-6 text-teal-50">
                Please check the extracted information. You can edit it if
                something is incorrect before continuing.
              </p>
            </div>
          </div>
        </section>

        <section className={`rounded-2xl border p-4 shadow-sm ${abnormalValues.length ? "border-amber-200 bg-amber-50" : "border-teal-100 bg-teal-50"}`}>
          <p className={`text-xs font-black uppercase tracking-wide ${abnormalValues.length ? "text-amber-800" : "text-teal-800"}`}>Key insight</p>
          <p className={`mt-1 text-sm font-semibold ${abnormalValues.length ? "text-amber-950" : "text-teal-950"}`}>{insightText}</p>
          {abnormalValues.length > 0 && <div className="mt-3 space-y-2">{abnormalValues.slice(0, 4).map((item, index) => <div key={item?.id || index} className="rounded-xl bg-white/70 px-3 py-2 text-xs text-amber-950"><strong>{item?.label || "Result"}</strong>{item?.value ? `: ${item.value}` : ""}{item?.unit ? ` ${item.unit}` : ""}{item?.reference_range ? ` • Ref ${item.reference_range}` : ""}</div>)}</div>}
        </section>

        {normalized.parsedDate && (
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-slate-100 p-2 text-slate-700">
                <CalendarDays size={19} />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Document date
                </p>
                <p className="mt-1 font-semibold text-slate-900">
                  {normalized.parsedDate}
                </p>
              </div>
            </div>
          </section>
        )}

        <EditableSection
          title="Medicines"
          icon={<Pill size={18} />}
          items={normalized.medicines}
          onEdit={() => openEditor("medicines")}
        />

        <EditableSection
          title="Diagnoses or conditions"
          icon={<Stethoscope size={18} />}
          items={normalized.diagnoses}
          onEdit={() => openEditor("diagnoses")}
        />

        <EditableSection
          title="Tests and investigations"
          icon={<FlaskConical size={18} />}
          items={normalized.investigations}
          onEdit={() => openEditor("investigations")}
        />

        <EditableSection
          title="Symptoms or complaints"
          icon={<UserRound size={18} />}
          items={normalized.symptoms}
          onEdit={() => openEditor("symptoms")}
        />

        <EditableSection
          title="Allergies"
          icon={<CheckCircle2 size={18} />}
          items={normalized.allergies}
          onEdit={() => openEditor("allergies")}
        />

        {!normalized.medicines.length &&
          !normalized.diagnoses.length &&
          !normalized.investigations.length &&
          !normalized.symptoms.length &&
          !normalized.allergies.length && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm">
              <FileText
                size={30}
                className="mx-auto text-slate-400"
              />

              <h2 className="mt-3 font-semibold text-slate-900">
                No structured information found
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                The document can still be kept as an uploaded record. A
                healthcare professional should review the original document
                for information that could not be extracted automatically.
              </p>
            </section>
          )}

        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-semibold text-amber-900">
            Please review before continuing
          </p>

          <p className="mt-1 text-sm leading-5 text-amber-800">
            Automated extraction can make mistakes, especially with unclear
            photographs or handwritten records. This information is not a
            medical diagnosis.
          </p>
        </section>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 p-3 backdrop-blur">
        <div className="mx-auto flex max-w-2xl gap-3">
          <button
            type="button"
            onClick={() => setScreen("M5")}
            className="flex min-h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-700"
            aria-label="Back"
          >
            <ArrowLeft size={19} />
          </button>

          <button
            type="button"
            onClick={handleContinue}
            className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 font-semibold text-white"
          >
            Confirm & View Timeline
            <ArrowRight size={18} />
          </button>
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4">
          <div className="w-full max-w-lg rounded-t-3xl bg-white p-5 shadow-xl sm:rounded-3xl">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
                  Edit extracted data
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  {editing.charAt(0).toUpperCase() + editing.slice(1)}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setEditing(null)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600"
                aria-label="Close"
              >
                <X size={19} />
              </button>
            </div>

            <p className="mt-3 text-sm leading-5 text-slate-600">
              Put one item on each line.
            </p>

            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              rows={7}
              className="mt-4 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              placeholder="Enter one item per line"
              autoFocus
            />

            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="min-h-12 rounded-xl border border-slate-300 bg-white px-4 font-semibold text-slate-700"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={saveEditor}
                className="min-h-12 rounded-xl bg-teal-700 px-4 font-semibold text-white"
              >
                Save changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}