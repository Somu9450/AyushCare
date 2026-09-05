import React from "react";
import {
  X,
  MapPin,
  Stethoscope,
  HeartPulse,
  ShieldCheck,
} from "lucide-react";
import useMobileStore from "../../store/useMobileStore";
import useLanguage from "../../i18n/translations";

export const AppointmentDetailsModal = () => {
  const { selectedAppointment, setSelectedAppointment } = useMobileStore();
  const { isHindi } = useLanguage();

  if (!selectedAppointment) return null;

  const apt = selectedAppointment;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={() => setSelectedAppointment(null)}
    >
      <div
        className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 animate-in slide-in-from-bottom duration-250"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between gap-3 bg-slate-50/80">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-teal-800 text-white flex items-center justify-center shrink-0 shadow-xs font-black text-xs">
              Rx
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-bold truncate text-slate-900 leading-tight">
                {isHindi ? "परामर्श विवरण" : "Appointment Details"}
              </h3>
              <p className="text-xs text-slate-500 truncate mt-0.5">
                {isHindi ? "टोकन" : "Token"}: <strong className="text-teal-800">{apt.tokenNumber}</strong> · {apt.date}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSelectedAppointment(null)}
            aria-label={isHindi ? "विवरण बंद करें" : "Close Appointment Details"}
            className="w-9 h-9 rounded-full bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-200/80 flex items-center justify-center transition active:scale-95 cursor-pointer border border-slate-200 shadow-2xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Status & Queue Banner */}
          <div className="p-3.5 rounded-2xl bg-teal-50/90 border border-teal-200 flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-teal-700 block">
                {isHindi ? "कतार स्थिति" : "Queue Status"}
              </span>
              <p className="text-sm font-black text-slate-900 mt-0.5">
                {apt.status === "IN_QUEUE"
                  ? (isHindi ? `आपके आगे ${apt.queuePosition} मरीज़` : `${apt.queuePosition} patients ahead`)
                  : apt.status === "CONFIRMED"
                  ? (isHindi ? "पुष्ट बुकिंग" : "Confirmed Booking")
                  : (isHindi ? "परामर्श पूर्ण" : "Consultation Completed")}
              </p>
            </div>
            {apt.estimatedWaitTime && (
              <span className="text-xs font-bold text-teal-900 bg-white px-3 py-1 rounded-full border border-teal-200 shadow-2xs">
                ⏱ {isHindi ? `अनुमानित: ${apt.estimatedWaitTime}` : `Est. Wait: ${apt.estimatedWaitTime}`}
              </span>
            )}
          </div>

          {/* Doctor & Department Info */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-xl bg-slate-100 text-teal-800 flex items-center justify-center shrink-0">
                <Stethoscope className="w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-base font-bold text-slate-900 leading-tight">
                  {isHindi ? (apt.hindiDoctorName || apt.doctorName) : apt.doctorName}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isHindi ? (apt.hindiSpecialty || apt.specialty || apt.department) : (apt.specialty || apt.department)}
                </p>
                <div className="flex items-center gap-1.5 text-teal-800 font-semibold mt-1">
                  <MapPin className="w-3.5 h-3.5 shrink-0 text-teal-700" />
                  <span className="truncate">
                    {isHindi ? `कक्ष ${apt.room?.replace(/\D/g, '') || apt.room || "104 · ब्लॉक बी"}` : (apt.room || "Room 104 · Block B")}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-slate-600">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                  {isHindi ? "दिनांक व समय" : "Date & Time"}
                </span>
                <span className="font-semibold text-slate-800 mt-0.5 block">{apt.date} · {apt.timeSlot || apt.time}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                  {isHindi ? "अस्पताल" : "Facility"}
                </span>
                <span className="font-semibold text-slate-800 mt-0.5 block">
                  {isHindi ? (apt.hindiHospitalName || "नागरिक अस्पताल ओपीडी") : (apt.hospitalName || "Civil Hospital OPD")}
                </span>
              </div>
            </div>
          </div>

          {/* Recorded Vitals (If available) */}
          {apt.vitalsRecorded && (
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <HeartPulse className="w-4 h-4 text-teal-700" />
                  {isHindi ? "चेक-इन वाइटल्स" : "Checked-in Vitals"}
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {isHindi ? "कियोस्क दर्ज" : "Kiosk Recorded"}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="bg-white p-2 rounded-xl border border-slate-200">
                  <span className="text-[9px] text-slate-400 uppercase font-bold block">{isHindi ? "बीपी" : "BP"}</span>
                  <span className="font-bold text-slate-800 text-xs">{apt.vitalsRecorded.bp}</span>
                </div>
                <div className="bg-white p-2 rounded-xl border border-slate-200">
                  <span className="text-[9px] text-slate-400 uppercase font-bold block">{isHindi ? "नाड़ी" : "Pulse"}</span>
                  <span className="font-bold text-slate-800 text-xs">{apt.vitalsRecorded.pulse}</span>
                </div>
                <div className="bg-white p-2 rounded-xl border border-slate-200">
                  <span className="text-[9px] text-slate-400 uppercase font-bold block">{isHindi ? "तापमान" : "Temp"}</span>
                  <span className="font-bold text-slate-800 text-xs">{apt.vitalsRecorded.temp}</span>
                </div>
                <div className="bg-white p-2 rounded-xl border border-slate-200">
                  <span className="text-[9px] text-slate-400 uppercase font-bold block">SpO2</span>
                  <span className="font-bold text-slate-800 text-xs">{apt.vitalsRecorded.spo2}</span>
                </div>
              </div>
            </div>
          )}

          {/* Reported Symptoms */}
          {apt.symptomsSummary && (
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                {isHindi ? "दर्ज लक्षण" : "Reported Complaint"}
              </span>
              <p className="text-slate-800 font-semibold leading-relaxed">
                {apt.symptomsSummary}
              </p>
            </div>
          )}

          {/* Past Diagnosis / Summary (For past visits) */}
          {apt.diagnosis && (
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                {isHindi ? "डॉक्टर का निदान" : "Doctor Diagnosis"}
              </span>
              <p className="text-sm font-bold text-slate-900">{isHindi ? (apt.hindiDiagnosis || apt.diagnosis) : apt.diagnosis}</p>
              {apt.summary && (
                <p className="text-slate-500 leading-relaxed mt-1">{apt.summary}</p>
              )}
            </div>
          )}

          {/* Guidance note */}
          <div className="p-3 rounded-xl bg-slate-100 text-slate-600 text-[11px] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-800 shrink-0" />
            <span>
              {isHindi
                ? "ओपीडी काउंटर या डॉक्टर कक्ष में बुलाए जाने पर यह टोकन नंबर दिखाएं।"
                : "Show this token number at the OPD counter or doctor room upon calling."}
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-2">
          <button
            type="button"
            onClick={() => setSelectedAppointment(null)}
            className="w-full min-h-[46px] rounded-xl bg-teal-800 hover:bg-teal-900 active:bg-teal-950 text-white font-bold text-sm cursor-pointer transition"
          >
            {isHindi ? "विवरण बंद करें" : "Close Details"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetailsModal;
