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
import { useTranslation } from '../hooks/useTranslation';

const Screen9_ReviewSubmission = () => {
  const {
    nextScreen,
    prevScreen,
    sessionData,
    language,
  } = useKioskStore();

  const { t, isHindi } = useTranslation();

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
    <div className="h-full w-full max-w-5xl mx-auto px-4 py-2 select-none flex flex-col justify-between">
      {/* --------------------------------------------------
          COMPACT HEADER
      --------------------------------------------------- */}
      <div className="flex items-center justify-between gap-3 mb-1.5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
              {t('screen9.stepLabel', 'Step 7 · Final Review')}
            </span>
            <h1 className="text-lg sm:text-xl font-black text-slate-900">
              {t('screen9.title', 'Review Consultation Details')}
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {t('screen9.subtitle', 'Please verify your check-in summary before generating your OPD token')}
          </p>
        </div>

        <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
          <ClipboardCheck className="w-4 h-4" />
        </div>
      </div>

      {/* Red flag warning */}
      {redFlags.length > 0 && (
        <div className="mb-2 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-2 text-xs text-rose-900">
          <AlertTriangle className="h-4 w-4 shrink-0 text-rose-700" />
          <span>Priority symptom reported. Hospital triage will be alerted.</span>
        </div>
      )}

      {/* --------------------------------------------------
          TWO-COLUMN ATM LAYOUT
      --------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_0.85fr] gap-3 items-start flex-1 min-h-0">

        {/* LEFT COLUMN: 4 Summary Cards in 2x2 Grid */}
        <div className="grid grid-cols-2 gap-2">
          {/* Card 1: Patient Details */}
          <div className="bg-white border border-slate-200 rounded-xl p-2.5 shadow-xs flex flex-col justify-between h-[115px]">
            <div className="flex items-center gap-1.5 text-xs font-black text-slate-800 border-b border-slate-100 pb-1">
              <UserRound className="w-3.5 h-3.5 text-teal-700" />
              <span>Patient Profile</span>
            </div>
            <div className="space-y-0.5 text-xs">
              <p className="font-bold text-slate-900 truncate">{summary.patientName}</p>
              <p className="text-[11px] text-slate-500">{summary.gender} • {summary.age ? `${summary.age} yrs` : 'Age N/A'}</p>
              <p className="text-[10px] text-teal-700 font-semibold truncate">{summary.abhaNumber || 'Direct Check-In'}</p>
            </div>
          </div>

          {/* Card 2: Consultation & Doctor */}
          <div className="bg-white border border-slate-200 rounded-xl p-2.5 shadow-xs flex flex-col justify-between h-[115px]">
            <div className="flex items-center gap-1.5 text-xs font-black text-slate-800 border-b border-slate-100 pb-1">
              <HeartPulse className="w-3.5 h-3.5 text-teal-700" />
              <span>Consultation</span>
            </div>
            <div className="space-y-0.5 text-xs">
              <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                {summary.trackLabel}
              </span>
              <p className="font-bold text-slate-900 truncate">{summary.department}</p>
              <p className="text-[11px] text-slate-500 truncate">{summary.doctor}</p>
            </div>
          </div>

          {/* Card 3: Symptoms & Complaints */}
          <div className="bg-white border border-slate-200 rounded-xl p-2.5 shadow-xs flex flex-col justify-between h-[115px]">
            <div className="flex items-center gap-1.5 text-xs font-black text-slate-800 border-b border-slate-100 pb-1">
              <FileText className="w-3.5 h-3.5 text-teal-700" />
              <span>Symptoms ({symptoms.length})</span>
            </div>
            <div className="overflow-y-auto max-h-14 flex flex-wrap gap-1">
              {symptoms.length === 0 ? (
                <p className="text-[11px] text-slate-400 italic">No symptoms entered</p>
              ) : (
                symptoms.slice(0, 4).map((s, idx) => (
                  <span key={idx} className="bg-teal-50 text-teal-800 rounded px-1.5 py-0.2 text-[10px] font-bold">
                    {s.name || s.label || String(s)}
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Card 4: Clinical Vitals & Docs */}
          <div className="bg-white border border-slate-200 rounded-xl p-2.5 shadow-xs flex flex-col justify-between h-[115px]">
            <div className="flex items-center gap-1.5 text-xs font-black text-slate-800 border-b border-slate-100 pb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
              <span>Vitals & Docs</span>
            </div>
            <div className="grid grid-cols-2 gap-1 text-[11px]">
              <div>
                <span className="text-slate-400 block text-[10px]">BP / Pulse</span>
                <strong className="text-slate-800">{vitals.bp || '120/80'}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">SpO2 / Temp</span>
                <strong className="text-slate-800">{vitals.spo2 || '98'}% • {vitals.temp || '98.4'}°F</strong>
              </div>
              <div className="col-span-2 pt-0.5">
                <span className="text-[10px] text-teal-800 font-bold bg-teal-50 px-1.5 py-0.2 rounded">
                  {documents.length} Records Uploaded
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Consent & Submit */}
        <div className="flex flex-col gap-2 bg-white border border-slate-200 rounded-2xl p-2.5 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-black text-slate-800">
              <LockKeyhole className="w-3.5 h-3.5 text-teal-700" />
              <span>Digital Consent</span>
            </div>
            <span className="text-[10px] text-teal-700 font-bold bg-teal-50 px-2 py-0.5 rounded-full">
              DPDP Compliant
            </span>
          </div>

          {/* Consent Checkbox */}
          <div className="rounded-xl border border-slate-200 p-2 bg-slate-50 flex items-start gap-2 cursor-pointer" onClick={() => setConsentGiven(!consentGiven)}>
            <button
              type="button"
              role="checkbox"
              aria-checked={consentGiven}
              className={`mt-0.5 h-5 w-5 shrink-0 rounded border flex items-center justify-center cursor-pointer transition ${
                consentGiven ? 'bg-teal-700 border-teal-700 text-white' : 'bg-white border-slate-300'
              }`}
            >
              {consentGiven && <Check className="w-3 h-3" />}
            </button>
            <div className="text-[11px] leading-tight select-none">
              <strong className="text-slate-900 block">{t('screen9.consentCheckbox', 'I give consent for OPD check-in')}</strong>
              <span className="text-slate-500 text-[10px]">
                I agree to share session summary with authorized hospital OPD.
              </span>
            </div>
          </div>

          <div className="p-2 rounded-xl bg-teal-50 border border-teal-100 text-[10px] text-teal-900">
            <strong>Ready:</strong> On confirmation, your token and QR card will be generated.
          </div>

          {/* Action Submit Button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!consentGiven}
            className="w-full h-11 rounded-xl bg-teal-700 hover:bg-teal-800 disabled:bg-slate-200 disabled:text-slate-400 text-white font-black flex items-center justify-between px-4 cursor-pointer disabled:cursor-not-allowed transition text-sm shadow-xs"
          >
            <span>{t('screen9.confirmAndPrint', 'Confirm & Generate Token')}</span>
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