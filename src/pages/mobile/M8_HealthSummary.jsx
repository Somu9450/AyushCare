import React, { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Volume2,
  VolumeX,
  AlertTriangle,
  CheckCircle2,
  CalendarDays,
  FileText,
  Pill,
  FlaskConical,
  Activity,
  ShieldCheck,
} from "lucide-react";
import { useMobileStore } from "../../store/useMobileStore";

const safeArray = (value) => {
  if (Array.isArray(value)) return value;
  if (value === null || value === undefined) return [];
  return [value];
};

const firstNonEmpty = (...values) => {
  for (const value of values) {
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return value;
    }
  }
  return "";
};

const normalizeSummary = (summary, extractedData) => {
  const source = summary || {};
  const extraction = extractedData || {};

  const medicines = safeArray(
    firstNonEmpty(
      source.medicines,
      source.medications,
      extraction.medicines,
      extraction.medications,
      extraction.detected_entities?.medicines
    )
  );

  const diagnoses = safeArray(
    firstNonEmpty(
      source.diagnoses,
      source.conditions,
      extraction.diagnoses,
      extraction.detected_entities?.diagnoses
    )
  );

  const investigations = safeArray(
    firstNonEmpty(
      source.investigations,
      source.tests,
      extraction.investigations,
      extraction.labResults,
      extraction.detected_entities?.lab_results,
      extraction.detected_entities?.tests
    )
  );

  const symptoms = safeArray(
    firstNonEmpty(
      source.symptoms,
      source.complaints,
      extraction.symptoms,
      extraction.chiefComplaint,
      extraction.chief_complaint,
      extraction.detected_entities?.symptoms
    )
  );

  const date = firstNonEmpty(
    source.date,
    source.visitDate,
    source.documentDate,
    extraction.date,
    extraction.parsed_date,
    extraction.documentDate
  );

  const plainLanguage = firstNonEmpty(
    source.plainLanguage,
    source.patientSummary,
    source.summary,
    source.description
  );

  return {
    title: firstNonEmpty(source.title, "Your health information"),
    plainLanguage:
      plainLanguage ||
      "Your uploaded information has been organized for you and can be reviewed by your healthcare team.",
    date,
    medicines,
    diagnoses,
    investigations,
    symptoms,
    warning: firstNonEmpty(source.warning, source.alert),
    source: source.source || "Uploaded document",
  };
};

const getItemLabel = (item) => {
  if (typeof item === "string") return item;

  if (!item || typeof item !== "object") {
    return String(item ?? "");
  }

  return firstNonEmpty(
    item.name,
    item.test,
    item.testName,
    item.medicine,
    item.medication,
    item.diagnosis,
    item.label,
    item.value,
    "Information"
  );
};

const getItemSecondary = (item) => {
  if (!item || typeof item !== "object") return "";

  const frequency = firstNonEmpty(item.frequency, item.dosage, item.dose);
  const duration = firstNonEmpty(item.duration, item.days);

  return [frequency, duration].filter(Boolean).join(" • ");
};

const speakText = (text) => {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return false;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-IN";
  utterance.rate = 0.9;
  utterance.pitch = 1;

  window.speechSynthesis.speak(utterance);
  return true;
};

function InfoSection({ icon, title, items, emptyText }) {
  if (!items.length) return null;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <div className="rounded-xl bg-slate-100 p-2">{icon}</div>
        <h3 className="font-semibold text-slate-900">{title}</h3>
      </div>

      <div className="space-y-2">
        {items.map((item, index) => (
          <div
            key={`${title}-${index}`}
            className="rounded-xl bg-slate-50 px-3 py-3"
          >
            <p className="font-medium text-slate-800">{getItemLabel(item)}</p>

            {getItemSecondary(item) && (
              <p className="mt-1 text-sm text-slate-500">
                {getItemSecondary(item)}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export default function M8_HealthSummary() {
  const {
    extractedData,
    healthSummary,
    timeline,
    medicalTimeline,
    medicalRecords,
    visits,
    patient,
    session,
    setScreen,
  } = useMobileStore();

  const [isSpeaking, setIsSpeaking] = useState(false);

  const summary = useMemo(
    () => normalizeSummary(healthSummary || {}, extractedData),
    [healthSummary, extractedData]
  );

  const latestTimelineItem = useMemo(() => {
    const source = Array.isArray(medicalTimeline)
      ? medicalTimeline
      : Array.isArray(timeline)
        ? timeline
        : [];

    return source.length ? source[source.length - 1] : null;
  }, [medicalTimeline, timeline]);

  const patientName =
    patient?.name ||
    patient?.fullName ||
    session?.patientName ||
    "Patient";

  const summaryText = [
    summary.plainLanguage,
    summary.symptoms.length
      ? `Reported symptoms: ${summary.symptoms.map(getItemLabel).join(", ")}.`
      : "",
    summary.diagnoses.length
      ? `Reported diagnoses or conditions: ${summary.diagnoses
          .map(getItemLabel)
          .join(", ")}.`
      : "",
    summary.medicines.length
      ? `Medicines mentioned: ${summary.medicines
          .map(getItemLabel)
          .join(", ")}.`
      : "",
  ]
    .filter(Boolean)
    .join(" ");

  const handleAudio = () => {
    if (
      typeof window === "undefined" ||
      !("speechSynthesis" in window)
    ) {
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const started = speakText(summaryText);

    if (started) {
      setIsSpeaking(true);

      window.speechSynthesis.addEventListener(
        "voiceschanged",
        () => {},
        { once: true }
      );

      const checkSpeaking = () => {
        if (!window.speechSynthesis.speaking) {
          setIsSpeaking(false);
          return;
        }

        window.setTimeout(checkSpeaking, 250);
      };

      window.setTimeout(checkSpeaking, 250);
    }
  };

  const handleContinue = () => {
    setScreen("M9");
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-4">
          <button
            type="button"
            onClick={() => setScreen("M7")}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700"
            aria-label="Go back"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
              Health summary
            </p>
            <h1 className="truncate text-lg font-bold text-slate-900">
              Your information
            </h1>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-50 text-teal-700">
            <Activity size={19} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-4 px-4 py-5">
        <section className="rounded-3xl bg-teal-700 p-5 text-white shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-teal-100">Hello, {patientName}</p>
              <h2 className="mt-1 text-2xl font-bold">
                Your health information is ready
              </h2>
              <p className="mt-2 text-sm leading-6 text-teal-50">
                We organized the information from your uploaded document so it
                is easier to understand and review.
              </p>
            </div>

            <div className="rounded-2xl bg-white/15 p-3">
              <CheckCircle2 size={25} />
            </div>
          </div>

          <button
            type="button"
            onClick={handleAudio}
            className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 font-semibold text-teal-800"
          >
            {isSpeaking ? <VolumeX size={19} /> : <Volume2 size={19} />}
            {isSpeaking ? "Stop listening" : "Listen to summary"}
          </button>
        </section>

        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle
              size={20}
              className="mt-0.5 shrink-0 text-amber-700"
            />

            <div>
              <p className="font-semibold text-amber-900">
                This is not a diagnosis
              </p>
              <p className="mt-1 text-sm leading-5 text-amber-800">
                This summary is based on information provided or extracted
                from your records. Your doctor or healthcare professional makes
                the clinical decisions.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-slate-100 p-2 text-slate-700">
              <FileText size={19} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Source
              </p>
              <p className="mt-1 font-semibold text-slate-900">
                {summary.title}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                {summary.source}
              </p>

              {(summary.date || latestTimelineItem?.date) && (
                <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
                  <CalendarDays size={16} />
                  <span>{summary.date || latestTimelineItem?.date}</span>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">
            In simple words
          </h2>

          <p className="mt-3 text-[15px] leading-7 text-slate-700">
            {summary.plainLanguage}
          </p>
        </section>

        <InfoSection
          icon={<Activity size={18} />}
          title="Symptoms or complaints"
          items={summary.symptoms}
          emptyText="No symptoms were extracted."
        />

        <InfoSection
          icon={<Pill size={18} />}
          title="Medicines mentioned"
          items={summary.medicines}
          emptyText="No medicines were extracted."
        />

        <InfoSection
          icon={<FlaskConical size={18} />}
          title="Tests or investigations"
          items={summary.investigations}
          emptyText="No investigations were extracted."
        />

        <InfoSection
          icon={<ShieldCheck size={18} />}
          title="Diagnoses or conditions mentioned"
          items={summary.diagnoses}
          emptyText="No diagnoses were extracted."
        />

        {summary.warning && (
          <section className="rounded-2xl border border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle
                size={19}
                className="mt-0.5 shrink-0 text-red-600"
              />
              <div>
                <p className="font-semibold text-red-900">Please note</p>
                <p className="mt-1 text-sm leading-6 text-red-800">
                  {summary.warning}
                </p>
              </div>
            </div>
          </section>
        )}

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <CheckCircle2
              size={20}
              className="mt-0.5 shrink-0 text-emerald-600"
            />

            <div>
              <p className="font-semibold text-slate-900">
                Ready for your healthcare team
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Your uploaded information can now be included with the visit
                information shared with {facilityName}.
              </p>
            </div>
          </div>
        </section>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 p-3 backdrop-blur">
        <div className="mx-auto flex max-w-2xl gap-3">
          <button
            type="button"
            onClick={() => setScreen("M7")}
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
            Continue
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}