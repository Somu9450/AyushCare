import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  HeartPulse,
  Languages,
  LockKeyhole,
  Pencil,
  ShieldCheck,
  UserRound,
} from 'lucide-react';

import { useKioskStore } from '../store/useKioskStore';

const Screen9_ReviewSubmission = () => {
  const {
    nextScreen,
    prevScreen,
    sessionData,
    language,
  } = useKioskStore();

  const [consentGiven, setConsentGiven] = useState(false);
  const [expandedSection, setExpandedSection] = useState('summary');

  const {
    patientProfile,
    track,
    selectedDepartment,
    requestedDoctor,
    chiefComplaint,
    symptoms = [],
    clinicalHistory = {},
    ayushHistory = {},
    documents = [],
    redFlags = [],
    vitals = {},
  } = sessionData;

  const summary = useMemo(() => {
    return {
      patientName:
        patientProfile?.name ||
        patientProfile?.hindiName ||
        'Patient',

      age:
        patientProfile?.age ??
        calculateAge(patientProfile?.dob),

      gender: patientProfile?.gender || 'Not provided',

      complaint:
        chiefComplaint ||
        symptoms?.map((item) => item.name).join(', ') ||
        'No chief complaint recorded',

      symptomCount: symptoms.length,

      documentCount: documents.length,

      hasVitals:
        Boolean(
          vitals.bp ||
          vitals.pulse ||
          vitals.temp ||
          vitals.spo2
        ),

      redFlagCount: redFlags.length,

      department:
        selectedDepartment?.name ||
        selectedDepartment?.label ||
        selectedDepartment ||
        'General OPD',

      doctor:
        requestedDoctor?.name ||
        requestedDoctor?.label ||
        requestedDoctor ||
        'Duty Medical Officer',

      trackLabel:
        track === 'AYUSH'
          ? 'Ayurveda / AYUSH'
          : 'Allopathy',
    };
  }, [
    patientProfile,
    chiefComplaint,
    symptoms,
    documents,
    redFlags,
    vitals,
    selectedDepartment,
    requestedDoctor,
    track,
  ]);

  const handleSubmit = () => {
    if (!consentGiven) return;

    /*
     * Screen 10 will consume the completed session.
     *
     * We intentionally do not add another store action here.
     * The current architecture already uses nextScreen().
     */
    nextScreen();
  };

  const toggleSection = (section) => {
    setExpandedSection((current) =>
      current === section ? null : section
    );
  };

  return (
    <div className="flex-1 w-full bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-bold text-teal-700">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-100">
                9
              </span>

              <span>Review & consent</span>
            </div>

            <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              Review your information
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
              Please check the information below before we securely send it
              to the hospital&apos;s clinical system.
            </p>
          </div>

          <div className="hidden h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-teal-100 text-teal-700 sm:flex">
            <ClipboardCheck className="h-8 w-8" />
          </div>
        </div>

        {/* Red flag warning */}
        {redFlags.length > 0 && (
          <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-700" />

            <div>
              <p className="text-sm font-black text-rose-900">
                Important symptoms detected
              </p>

              <p className="mt-1 text-sm leading-5 text-rose-800">
                Some symptoms you reported may require priority attention.
                Please inform the hospital staff immediately.
              </p>
            </div>
          </div>
        )}

        {/* Main grid */}
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">

          {/* Review sections */}
          <main className="space-y-4">

            {/* Patient */}
            <ReviewSection
              title="Patient information"
              icon={<UserRound className="h-5 w-5" />}
              section="patient"
              expanded={expandedSection === 'patient'}
              onToggle={toggleSection}
            >
              <div className="grid gap-4 sm:grid-cols-3">
                <SummaryField
                  label="Name"
                  value={summary.patientName}
                />

                <SummaryField
                  label="Age"
                  value={
                    summary.age
                      ? `${summary.age} years`
                      : 'Not provided'
                  }
                />

                <SummaryField
                  label="Gender"
                  value={summary.gender}
                />
              </div>
            </ReviewSection>

            {/* Clinical summary */}
            <ReviewSection
              title="Clinical history"
              icon={<HeartPulse className="h-5 w-5" />}
              section="summary"
              expanded={expandedSection === 'summary'}
              onToggle={toggleSection}
              badge={
                summary.symptomCount > 0
                  ? `${summary.symptomCount} symptom${
                      summary.symptomCount === 1 ? '' : 's'
                    }`
                  : null
              }
            >
              <div className="space-y-5">

                <div>
                  <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                    Chief complaint
                  </p>

                  <p className="mt-2 rounded-xl bg-slate-50 p-4 text-sm font-bold leading-6 text-slate-800">
                    {summary.complaint}
                  </p>
                </div>

                {symptoms.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-black uppercase tracking-wide text-slate-400">
                      Symptoms reported
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {symptoms.map((symptom, index) => (
                        <span
                          key={symptom.id || index}
                          className="rounded-full bg-teal-50 px-3 py-2 text-xs font-bold text-teal-800"
                        >
                          {symptom.name ||
                            symptom.label ||
                            symptom.title ||
                            String(symptom)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <HistoryField
                    label="Past medical history"
                    value={formatArray(
                      clinicalHistory.pastMedicalHistory
                    )}
                  />

                  <HistoryField
                    label="Past surgical history"
                    value={formatArray(
                      clinicalHistory.pastSurgicalHistory
                    )}
                  />

                  <HistoryField
                    label="Medications"
                    value={formatArray(
                      clinicalHistory.medications
                    )}
                  />

                  <HistoryField
                    label="Allergies"
                    value={formatArray(
                      clinicalHistory.allergies
                    )}
                  />
                </div>

              </div>
            </ReviewSection>

            {/* AYUSH */}
            {track === 'AYUSH' && (
              <ReviewSection
                title="Ayurvedic history"
                icon={<Languages className="h-5 w-5" />}
                section="ayush"
                expanded={expandedSection === 'ayush'}
                onToggle={toggleSection}
              >
                <div className="grid gap-3 sm:grid-cols-2">

                  <AyushField
                    traditional="Prakriti"
                    value={ayushHistory.prakriti}
                  />

                  <AyushField
                    traditional="Vikriti"
                    value={ayushHistory.vikriti}
                  />

                  <AyushField
                    traditional="Sara"
                    value={ayushHistory.sara}
                  />

                  <AyushField
                    traditional="Samhanana"
                    value={ayushHistory.samhanana}
                  />

                  <AyushField
                    traditional="Pramana"
                    value={ayushHistory.pramana}
                  />

                  <AyushField
                    traditional="Satmya"
                    value={ayushHistory.satmya}
                  />

                  <AyushField
                    traditional="Sattva"
                    value={ayushHistory.sattva}
                  />

                  <AyushField
                    traditional="Ahara Shakti"
                    value={ayushHistory.aharaShakti}
                  />

                  <AyushField
                    traditional="Vyayama Shakti"
                    value={ayushHistory.vyayamaShakti}
                  />

                  <AyushField
                    traditional="Vaya"
                    value={ayushHistory.vaya}
                  />

                  <AyushField
                    traditional="Agni"
                    value={ayushHistory.agni}
                  />

                  <AyushField
                    traditional="Kostha"
                    value={ayushHistory.kostha}
                  />

                </div>
              </ReviewSection>
            )}

            {/* Vitals */}
            <ReviewSection
              title="Vitals"
              icon={<HeartPulse className="h-5 w-5" />}
              section="vitals"
              expanded={expandedSection === 'vitals'}
              onToggle={toggleSection}
            >
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <VitalSummary
                  label="Blood pressure"
                  value={vitals.bp}
                  unit="mmHg"
                />

                <VitalSummary
                  label="Pulse"
                  value={vitals.pulse}
                  unit="bpm"
                />

                <VitalSummary
                  label="Temperature"
                  value={vitals.temp}
                  unit="°F"
                />

                <VitalSummary
                  label="SpO₂"
                  value={vitals.spo2}
                  unit="%"
                />
              </div>
            </ReviewSection>

            {/* Documents */}
            <ReviewSection
              title="Medical documents"
              icon={<FileText className="h-5 w-5" />}
              section="documents"
              expanded={expandedSection === 'documents'}
              onToggle={toggleSection}
              badge={
                documents.length
                  ? `${documents.length} added`
                  : 'None'
              }
            >
              {documents.length === 0 ? (
                <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                  No previous medical documents were uploaded.
                </p>
              ) : (
                <div className="space-y-2">
                  {documents.map((document) => (
                    <div
                      key={document.id}
                      className="flex items-center gap-3 rounded-xl bg-slate-50 p-3"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-teal-700">
                        <FileText className="h-5 w-5" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-slate-800">
                          {document.name}
                        </p>

                        <p className="mt-0.5 text-xs text-slate-500">
                          Digitized successfully
                        </p>
                      </div>

                      <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                    </div>
                  ))}
                </div>
              )}
            </ReviewSection>

          </main>

          {/* Submission panel */}
          <aside className="h-fit lg:sticky lg:top-6">

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-100 text-teal-700">
                  <ShieldCheck className="h-6 w-6" />
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Ready to submit
                  </p>

                  <h2 className="text-lg font-black text-slate-900">
                    Clinical summary
                  </h2>
                </div>
              </div>

              {/* Routing */}
              <div className="mt-6 rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                  Consultation
                </p>

                <p className="mt-2 text-sm font-black text-slate-900">
                  {summary.department}
                </p>

                <p className="mt-1 text-sm text-slate-600">
                  {summary.doctor}
                </p>

                <div className="mt-3 inline-flex rounded-full bg-teal-100 px-3 py-1.5 text-xs font-bold text-teal-800">
                  {summary.trackLabel}
                </div>
              </div>

              {/* Summary count */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                <CountCard
                  value={summary.symptomCount}
                  label="Symptoms"
                />

                <CountCard
                  value={summary.documentCount}
                  label="Documents"
                />
              </div>

              {/* Consent */}
              <div className="mt-5 rounded-2xl border border-slate-200 p-4">

                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={consentGiven}
                    onClick={() => setConsentGiven(!consentGiven)}
                    className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-2 transition ${
                      consentGiven
                        ? 'border-teal-700 bg-teal-700 text-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {consentGiven && (
                      <Check className="h-4 w-4" />
                    )}
                  </button>

                  <div>
                    <p className="text-sm font-black text-slate-900">
                      I give consent
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      I understand that the information collected during
                      this session will be shared with the hospital&apos;s
                      authorized clinical system for my consultation.
                    </p>
                  </div>
                </div>

              </div>

              {/* Security */}
              <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-slate-500">
                <LockKeyhole className="h-4 w-4" />
                Secure clinical data transfer
              </div>

              {/* Submit */}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!consentGiven}
                className="mt-5 flex min-h-[60px] w-full items-center justify-center gap-3 rounded-2xl bg-teal-800 px-5 text-base font-black text-white shadow-lg shadow-teal-900/10 transition hover:bg-teal-900 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
              >
                Submit & generate token
                <ArrowRight className="h-5 w-5" />
              </button>

              {!consentGiven && (
                <p className="mt-3 text-center text-xs font-semibold text-slate-400">
                  Please provide consent to continue.
                </p>
              )}

            </div>

            <div className="mt-4 rounded-2xl bg-slate-100 p-4 text-xs leading-5 text-slate-500">
              Your information is presented to the doctor as a structured
              summary. The doctor can review, edit and confirm it before
              saving the clinical record.
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

          <div className="hidden items-center gap-2 text-sm font-semibold text-slate-400 sm:flex">
            <ShieldCheck className="h-4 w-4" />
            Review before submission
          </div>

        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Components                                                                 */
/* -------------------------------------------------------------------------- */

const ReviewSection = ({
  title,
  icon,
  section,
  expanded,
  onToggle,
  badge,
  children,
}) => {
  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

      <button
        type="button"
        onClick={() => onToggle(section)}
        className="flex min-h-[72px] w-full items-center gap-3 px-5 py-4 text-left transition hover:bg-slate-50 sm:px-6"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-base font-black text-slate-900">
            {title}
          </p>

          {badge && (
            <p className="mt-0.5 text-xs font-semibold text-slate-400">
              {badge}
            </p>
          )}
        </div>

        <ArrowRight
          className={`h-5 w-5 shrink-0 text-slate-400 transition ${
            expanded ? 'rotate-90' : ''
          }`}
        />
      </button>

      {expanded && (
        <div className="border-t border-slate-100 px-5 py-5 sm:px-6">
          {children}
        </div>
      )}
    </section>
  );
};

const SummaryField = ({ label, value }) => {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-bold text-slate-800">
        {value || 'Not provided'}
      </p>
    </div>
  );
};

const HistoryField = ({ label, value }) => {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-sm font-semibold leading-5 text-slate-700">
        {value || 'Not reported'}
      </p>
    </div>
  );
};

const AyushField = ({ traditional, value }) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-black text-teal-700">
        {traditional}
      </p>

      <p className="mt-1 text-sm font-bold text-slate-800">
        {value || 'Not recorded'}
      </p>
    </div>
  );
};

const VitalSummary = ({ label, value, unit }) => {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-xs font-bold text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-lg font-black text-slate-900">
        {value || '--'}

        {value && (
          <span className="ml-1 text-xs font-bold text-slate-400">
            {unit}
          </span>
        )}
      </p>
    </div>
  );
};

const CountCard = ({ value, label }) => {
  return (
    <div className="rounded-2xl bg-slate-50 p-4 text-center">
      <p className="text-2xl font-black text-slate-900">
        {value}
      </p>

      <p className="mt-1 text-xs font-bold text-slate-400">
        {label}
      </p>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const formatArray = (value) => {
  if (!value || value.length === 0) {
    return '';
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === 'string') return item;

        return (
          item?.name ||
          item?.label ||
          item?.title ||
          JSON.stringify(item)
        );
      })
      .join(', ');
  }

  return String(value);
};

const calculateAge = (dob) => {
  if (!dob) return null;

  const birthDate = new Date(dob);

  if (Number.isNaN(birthDate.getTime())) {
    return null;
  }

  const today = new Date();

  let age =
    today.getFullYear() -
    birthDate.getFullYear();

  const monthDifference =
    today.getMonth() -
    birthDate.getMonth();

  if (
    monthDifference < 0 ||
    (
      monthDifference === 0 &&
      today.getDate() < birthDate.getDate()
    )
  ) {
    age--;
  }

  return age;
};

export default Screen9_ReviewSubmission;
export { Screen9_ReviewSubmission };