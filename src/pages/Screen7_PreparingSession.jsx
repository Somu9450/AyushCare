import React, { useEffect, useState } from 'react';
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  HeartPulse,
  Info,
  Minus,
  Plus,
  Thermometer,
  Droplets,
  Gauge,
  UserRound,
} from 'lucide-react';

import { useKioskStore } from '../store/useKioskStore';

const Screen7_PreparingSession = () => {
  const {
    nextScreen,
    prevScreen,
    sessionData,
    updateSessionData,
  } = useKioskStore();

  const { vitals } = sessionData;

  const [bp, setBp] = useState(vitals?.bp || '');
  const [pulse, setPulse] = useState(vitals?.pulse || '');
  const [temp, setTemp] = useState(vitals?.temp || '');
  const [spo2, setSpo2] = useState(vitals?.spo2 || '');

  const [isCapturing, setIsCapturing] = useState(false);
  const [completed, setCompleted] = useState(false);

  /*
   * Mock peripheral capture.
   *
   * In the production version this can be replaced with:
   * - BP monitor API
   * - Pulse oximeter
   * - Temperature sensor
   *
   * No UI architecture change will be required.
   */
  const simulateVitalsCapture = () => {
    setIsCapturing(true);

    setTimeout(() => {
      setBp('120/80');
      setPulse('76');
      setTemp('98.4');
      setSpo2('98');

      setIsCapturing(false);
      setCompleted(true);
    }, 1200);
  };

  /*
   * Keep store synchronized with the local vitals.
   *
   * Existing store has vitals inside sessionData,
   * so we use updateSessionData instead of adding
   * another store action.
   */
  useEffect(() => {
    updateSessionData({
      vitals: {
        bp,
        pulse,
        temp,
        spo2,
      },
    });
  }, [bp, pulse, temp, spo2, updateSessionData]);

  const handleContinue = () => {
    updateSessionData({
      vitals: {
        bp,
        pulse,
        temp,
        spo2,
      },
    });

    nextScreen();
  };

  const hasAnyVitals = bp || pulse || temp || spo2;

  return (
    <div className="flex-1 w-full bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-bold text-teal-700">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-100">
                7
              </span>

              <span>Clinical preparation</span>
            </div>

            <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              Let&apos;s prepare your clinical session
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
              We&apos;ll capture a few basic vitals before you meet the doctor.
              You can review everything before submission.
            </p>
          </div>

          <div className="hidden h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-rose-100 text-rose-700 sm:flex">
            <HeartPulse className="h-8 w-8" />
          </div>
        </div>

        {/* Information banner */}
        <div className="flex items-start gap-3 rounded-2xl border border-teal-100 bg-teal-50 p-4">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-teal-700" />

          <div>
            <p className="text-sm font-bold text-teal-900">
              Your vitals help the doctor prepare
            </p>

            <p className="mt-1 text-sm leading-5 text-teal-800">
              These measurements are only recorded for your clinical visit.
              They do not replace the doctor&apos;s examination.
            </p>
          </div>
        </div>

        {/* Main content */}
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">

          {/* Vitals card */}
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">

            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-900">
                  Basic vitals
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  You may enter them manually or use the kiosk sensors.
                </p>
              </div>

              {completed && (
                <div className="flex items-center gap-2 text-sm font-bold text-emerald-700">
                  <CheckCircle2 className="h-5 w-5" />
                  Captured
                </div>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">

              {/* Blood Pressure */}
              <VitalInput
                icon={<Gauge className="h-6 w-6" />}
                title="Blood pressure"
                subtitle="Systolic / Diastolic"
                value={bp}
                placeholder="120/80"
                onChange={setBp}
                suffix="mmHg"
              />

              {/* Pulse */}
              <VitalInput
                icon={<Activity className="h-6 w-6" />}
                title="Pulse"
                subtitle="Heart beats per minute"
                value={pulse}
                placeholder="76"
                onChange={setPulse}
                suffix="bpm"
              />

              {/* Temperature */}
              <VitalInput
                icon={<Thermometer className="h-6 w-6" />}
                title="Temperature"
                subtitle="Body temperature"
                value={temp}
                placeholder="98.4"
                onChange={setTemp}
                suffix="°F"
              />

              {/* SpO2 */}
              <VitalInput
                icon={<Droplets className="h-6 w-6" />}
                title="SpO₂"
                subtitle="Blood oxygen level"
                value={spo2}
                placeholder="98"
                onChange={setSpo2}
                suffix="%"
              />

            </div>

            {/* Sensor capture */}
            <button
              type="button"
              onClick={simulateVitalsCapture}
              disabled={isCapturing}
              className="mt-6 flex min-h-[58px] w-full items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-teal-200 bg-teal-50 px-5 py-4 text-base font-black text-teal-800 transition hover:border-teal-300 hover:bg-teal-100 active:scale-[0.99] disabled:cursor-wait disabled:opacity-60"
            >
              <HeartPulse className="h-5 w-5" />

              {isCapturing
                ? 'Reading kiosk sensors...'
                : 'Capture vitals automatically'}
            </button>
          </section>

          {/* Side summary */}
          <aside className="flex flex-col gap-4">

            {/* Patient */}
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                  <UserRound className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Patient
                  </p>

                  <p className="truncate text-base font-black text-slate-900">
                    {sessionData.patientProfile?.name || 'Patient'}
                  </p>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-black text-slate-900">
                Session status
              </p>

              <div className="mt-4 space-y-3">

                <StatusRow
                  label="Patient verified"
                  done={sessionData.isVerified}
                />

                <StatusRow
                  label="Clinical history"
                  done={
                    Boolean(sessionData.chiefComplaint) ||
                    sessionData.symptoms?.length > 0
                  }
                />

                <StatusRow
                  label="Vitals"
                  done={Boolean(hasAnyVitals)}
                />

                <StatusRow
                  label="Documents"
                  done={sessionData.documents?.length > 0}
                />

              </div>
            </div>

            <div className="rounded-2xl bg-slate-100 p-4 text-xs leading-5 text-slate-500">
              <strong className="text-slate-700">
                Important:
              </strong>{' '}
              The information collected here is presented to the doctor for
              review. The kiosk does not make an autonomous diagnosis.
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
            Continue to documents
            <ArrowRight className="h-5 w-5" />
          </button>

        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Reusable components                                                        */
/* -------------------------------------------------------------------------- */

const VitalInput = ({
  icon,
  title,
  subtitle,
  value,
  placeholder,
  onChange,
  suffix,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">

      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-teal-700 shadow-sm">
          {icon}
        </div>

        <div>
          <p className="text-sm font-black text-slate-900">
            {title}
          </p>

          <p className="text-xs text-slate-500">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="relative">
        <input
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="min-h-[56px] w-full rounded-xl border border-slate-200 bg-white px-4 pr-16 text-lg font-bold text-slate-900 outline-none transition placeholder:text-slate-300 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
        />

        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
          {suffix}
        </span>
      </div>
    </div>
  );
};

const StatusRow = ({ label, done }) => {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm font-semibold text-slate-600">
        {label}
      </span>

      <span
        className={`flex h-7 w-7 items-center justify-center rounded-full ${
          done
            ? 'bg-emerald-100 text-emerald-700'
            : 'bg-slate-100 text-slate-300'
        }`}
      >
        <CheckCircle2 className="h-4 w-4" />
      </span>
    </div>
  );
};

export default Screen7_PreparingSession;
export { Screen7_PreparingSession };