import React, { useEffect } from "react";
import {
  UploadCloud,
  FileHeart,
  Clock,
  ShieldCheck,
  ArrowRight,
  ChevronRight,
  CalendarDays,
  MapPin,
  Stethoscope,
  Activity,
  HeartPulse,
  User,
  MonitorCheck,
  CheckCircle2,
  FileText,
} from "lucide-react";
import useMobileStore, { SCREENS } from "../../store/useMobileStore";
import { mockAppointments, mockVisits } from "../../data/mockData";
import MobileHeader from "../../components/mobile/MobileHeader";
import BottomNavBar from "../../components/mobile/BottomNavBar";
import AppointmentDetailsModal from "../../components/mobile/AppointmentDetailsModal";

/**
 * M1 — MOBILE HOME
 * Central patient companion dashboard featuring:
 * 1. Current Kiosk Session (Live timer, Terminal ID, sync status)
 * 2. Today's Appointment (Token #, doctor info, OPD room, live queue tracker)
 * 3. Recent Healthcare Visit (Direct link to latest clinical visit encounter)
 * 4. Recent Medical Document (Direct link to latest uploaded/processed document)
 * 5. Quick Actions (Upload Documents, Health Summary, Timeline, All Visits)
 * 6. Persistent Bottom Navigation (Home, Visits, Records, More)
 */
export const M1_MobileHome = () => {
  const {
    session,
    kioskSession,
    timerSecondsRemaining,
    decrementTimer,
    isSessionExpired,
    setScreen,
    setSelectedAppointment,
    setSelectedVisit,
    medicalRecords,
    setSelectedMedicalRecord,
    setActiveNavTab,
  } = useMobileStore();

  const todayAppointment = mockAppointments.today;
  const patient = session.patient || {};
  const isKioskConnected = kioskSession?.status === "CONNECTED";
  const isKioskExpired = kioskSession?.status === "EXPIRED" || (isKioskConnected && isSessionExpired);

  // Live session countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      decrementTimer();
    }, 1000);
    return () => clearInterval(interval);
  }, [decrementTimer]);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const handleOpenAppointment = () => {
    setSelectedAppointment(todayAppointment);
  };

  return (
    <div className="min-h-full flex flex-col justify-between bg-slate-50 text-slate-900">
      {/* Mobile Header with AyushCare brand and patient status */}
      <MobileHeader showBack={false} />

      {/* Main Content Area */}
      <main className="flex-1 px-4 sm:px-6 py-4 sm:py-6 max-w-md md:max-w-3xl lg:max-w-4xl mx-auto w-full space-y-5">
        {/* Patient Greeting & Demographics Bar */}
        <div className="flex items-center justify-between gap-2 px-1">
          <div>
            <p className="text-xs text-slate-500 font-medium">Welcome back,</p>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
              {patient.name || "Rajesh Kumar Sharma"}
            </h2>
          </div>
          <div className="text-right">
            <span className="text-[11px] font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200 block">
              ABHA: {patient.abhaNumber || "91-4432-8812-9012"}
            </span>
          </div>
        </div>

        {/* -------------------------------------------------------------
            1. CURRENT KIOSK SESSION CARD (Prompt 5)
        -------------------------------------------------------------- */}
        <section
          aria-label="Current Kiosk Session"
          className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-3"
        >
          {isKioskConnected && !isKioskExpired ? (
            <>
              <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
                  </span>
                  <h3 className="text-xs font-black uppercase tracking-wider text-teal-800">
                    Connected to Hospital Kiosk ✓
                  </h3>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-bold text-teal-900 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                  <Clock className="w-3.5 h-3.5 text-teal-700" />
                  <span>Expires in {formatTimer(timerSecondsRemaining)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <MonitorCheck className="w-4 h-4 text-teal-700 shrink-0" />
                  <div>
                    <p className="font-bold text-slate-800">
                      {kioskSession?.kioskName || "Hospital OPD Kiosk"}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Session Active · Started {kioskSession?.connectedAt || "just now"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setScreen(SCREENS.KIOSK_SESSION)}
                  className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-xs flex items-center gap-1 transition cursor-pointer border border-teal-200 shrink-0 active:scale-95"
                >
                  <span>View Session</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          ) : isKioskExpired ? (
            <>
              <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <h3 className="text-xs font-black uppercase tracking-wider text-amber-800">
                    Kiosk session expired
                  </h3>
                </div>

                <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                  Expired
                </span>
              </div>

              <div className="flex items-center justify-between gap-3 text-xs text-slate-600">
                <p className="text-slate-500">
                  Your previous kiosk connection has timed out for security.
                </p>

                <button
                  type="button"
                  onClick={() => setScreen(SCREENS.KIOSK_CONNECT)}
                  className="px-3 py-1.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs flex items-center gap-1 transition cursor-pointer shrink-0 active:scale-95 shadow-xs"
                >
                  <span>Connect Again</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">
                    Not connected to a kiosk
                  </h3>
                </div>

                <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                  Standby
                </span>
              </div>

              <div className="flex items-center justify-between gap-3 text-xs text-slate-600">
                <div>
                  <p className="font-bold text-slate-800">
                    Sync with Hospital Kiosk
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Scan kiosk QR to sync appointments and queue tokens
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setScreen(SCREENS.KIOSK_CONNECT)}
                  className="px-3 py-1.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs flex items-center gap-1 transition cursor-pointer shrink-0 active:scale-95 shadow-xs"
                >
                  <span>Connect to Kiosk</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          )}
        </section>

        {/* -------------------------------------------------------------
            2. TODAY'S APPOINTMENT CARD
        -------------------------------------------------------------- */}
        <section
          aria-label="Today's Appointment"
          className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-teal-800 to-teal-950 text-white shadow-md space-y-4"
        >
          <div className="flex items-center justify-between gap-2 border-b border-white/15 pb-3">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-teal-300" />
              <span className="text-xs font-bold uppercase tracking-wider text-teal-200">
                Today's Consultation
              </span>
            </div>

            <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 px-2.5 py-0.5 rounded-full">
              In Queue
            </span>
          </div>

          {/* Token & Doctor Summary */}
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-teal-200 uppercase tracking-wide">
                Your OPD Token
              </p>
              <h3 className="text-3xl font-black font-mono tracking-tight text-white leading-none">
                {todayAppointment.tokenNumber}
              </h3>
              <p className="text-sm font-bold text-teal-100 pt-1">
                {todayAppointment.doctorName}
              </p>
              <p className="text-xs text-teal-200/80">
                {todayAppointment.specialty}
              </p>
            </div>

            <div className="text-right shrink-0 bg-white/10 p-3 rounded-2xl border border-white/10">
              <p className="text-[10px] font-bold text-teal-200 uppercase">Room No.</p>
              <p className="text-base font-black text-white">{todayAppointment.room}</p>
              <p className="text-[10px] text-teal-200 mt-0.5">{todayAppointment.timeSlot}</p>
            </div>
          </div>

          {/* Live Queue Tracker Bar */}
          <div className="p-3 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              <span className="font-semibold text-white">
                {todayAppointment.queuePosition} patients ahead of you
              </span>
            </div>
            <span className="text-teal-200 font-bold">
              Est: ~{todayAppointment.estimatedWaitTime}
            </span>
          </div>

          {/* View Details Action */}
          <button
            type="button"
            onClick={handleOpenAppointment}
            className="w-full h-11 rounded-2xl bg-white text-teal-950 font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-[0.99] hover:bg-teal-50 cursor-pointer shadow-xs"
          >
            <span>View Appointment & Vitals Details</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </section>

        {/* -------------------------------------------------------------
            3. RECENT HEALTHCARE VISIT
        -------------------------------------------------------------- */}
        <section
          aria-label="Recent Healthcare Visit"
          className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-3"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-teal-800" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                Recent Visit
              </h3>
            </div>
            <button
              type="button"
              onClick={() => {
                setActiveNavTab("visits");
                setScreen(SCREENS.VISITS);
              }}
              className="text-xs font-bold text-teal-800 hover:text-teal-950 cursor-pointer"
            >
              All Visits →
            </button>
          </div>

          <div className="flex items-start justify-between gap-3 text-xs">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-400">
                Last visit · {mockVisits[0]?.date || "02 Sep 2026"}
              </span>
              <h4 className="text-base font-black text-slate-900">
                {mockVisits[0]?.doctor || "Dr. Atul Agarwal"}
              </h4>
              <p className="text-slate-500 font-medium">
                {mockVisits[0]?.department || "Neurology"} · {mockVisits[0]?.hospital || "XYZ Hospital"}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setSelectedVisit(mockVisits[0]);
                setScreen(SCREENS.VISIT_DETAILS);
              }}
              className="px-3.5 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-xs flex items-center gap-1 transition cursor-pointer border border-teal-200 shrink-0 self-center active:scale-95"
            >
              <span>View Visit</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </section>

        {/* -------------------------------------------------------------
            4. RECENT MEDICAL DOCUMENT (Prompt 3)
        -------------------------------------------------------------- */}
        {medicalRecords && medicalRecords.length > 0 && (
          <section
            aria-label="Recent Medical Document"
            className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-3"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-800" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                  Recent Document
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveNavTab("records");
                  setScreen(SCREENS.RECORDS);
                }}
                className="text-xs font-bold text-teal-800 hover:text-teal-950 cursor-pointer"
              >
                All Records →
              </button>
            </div>

            <div className="flex items-start justify-between gap-3 text-xs">
              <div className="space-y-1 min-w-0">
                <span className="text-[11px] font-bold text-slate-400">
                  {medicalRecords[0]?.displayDate || "12 May 2026"} · {medicalRecords[0]?.typeLabel || "Prescription"}
                </span>
                <h4 className="text-base font-black text-slate-900 truncate">
                  {medicalRecords[0]?.title || "Prescription_May2026.pdf"}
                </h4>
                <p className="text-slate-500 font-medium truncate">
                  {medicalRecords[0]?.source || "XYZ Hospital"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedMedicalRecord(medicalRecords[0]);
                  setScreen(SCREENS.DOCUMENT_DETAILS);
                }}
                className="px-3.5 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-xs flex items-center gap-1 transition cursor-pointer border border-teal-200 shrink-0 self-center active:scale-95"
              >
                <span>View Record</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </section>
        )}

        {/* -------------------------------------------------------------
            5. QUICK ACTIONS
        -------------------------------------------------------------- */}
        <section aria-label="Quick Actions" className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Quick Actions
            </h3>
            <button
              type="button"
              onClick={() => {
                setScreen(SCREENS.APPOINTMENTS);
              }}
              className="text-xs font-bold text-teal-800 hover:text-teal-950 cursor-pointer"
            >
              All Appointments →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* Action 1: Upload Medical Documents */}
            <button
              type="button"
              onClick={() => setScreen(SCREENS.M2)}
              className="w-full p-4 sm:p-5 rounded-3xl border-2 border-teal-700 bg-white hover:bg-teal-50/50 shadow-sm active:scale-[0.99] transition-all text-left flex items-start justify-between gap-3.5 cursor-pointer group"
            >
              <div className="flex items-start gap-3.5 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-800 border border-teal-200 flex items-center justify-center shrink-0 group-hover:bg-[#006666] group-hover:text-white transition-colors">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-bold text-slate-900 leading-tight">
                      Upload Medical Documents
                    </h4>
                    <span className="text-[10px] font-bold bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded">
                      Fast Track
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Scan previous prescriptions, lab reports, or discharge slips.
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-teal-700 shrink-0 mt-3 transition-transform group-hover:translate-x-0.5" />
            </button>

            {/* Action 2: View My Health Summary */}
            <button
              type="button"
              onClick={() => setScreen(SCREENS.M8)}
              className="w-full p-4 sm:p-5 rounded-3xl border border-slate-200 bg-white hover:bg-slate-50 shadow-xs active:scale-[0.99] transition-all text-left flex items-start justify-between gap-3.5 cursor-pointer group"
            >
              <div className="flex items-start gap-3.5 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 group-hover:bg-slate-200 transition-colors">
                  <FileHeart className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-base font-bold text-slate-900 leading-tight">
                    View My Health Summary
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Review plain-language symptoms, medications, and Hindi audio.
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-700 shrink-0 mt-3 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </section>

        {/* Security Reassurance */}
        <div className="p-3 rounded-2xl bg-slate-100 border border-slate-200/80 flex items-center gap-2.5 text-xs text-slate-600">
          <ShieldCheck className="w-4 h-4 text-teal-800 shrink-0" />
          <p className="leading-snug">
            Your consultation token & documents are securely linked with ABDM OPD Desk.
          </p>
        </div>
      </main>

      {/* -------------------------------------------------------------
          4. BOTTOM NAVIGATION
      -------------------------------------------------------------- */}
      <BottomNavBar />

      {/* Appointment Details Modal */}
      <AppointmentDetailsModal />
    </div>
  );
};

export default M1_MobileHome;
