import React, { useState } from "react";
import {
  CalendarDays,
  Clock,
  MapPin,
  ChevronRight,
  FileText,
} from "lucide-react";
import useMobileStore, { SCREENS } from "../../store/useMobileStore";
import { mockAppointments } from "../../data/mockData";
import MobileHeader from "../../components/mobile/MobileHeader";
import BottomNavBar from "../../components/mobile/BottomNavBar";
import AppointmentDetailsModal from "../../components/mobile/AppointmentDetailsModal";
import useLanguage from "../../i18n/translations";

export const AppointmentsScreen = () => {
  const { setSelectedAppointment } = useMobileStore();
  const { t, isHindi } = useLanguage();
  const [activeTab, setActiveTab] = useState("UPCOMING"); // "UPCOMING" | "PAST"

  const upcomingList = mockAppointments.upcoming || [];
  const pastList = mockAppointments.past || [];

  return (
    <div className="min-h-full flex flex-col justify-between bg-slate-50 text-slate-900">
      {/* Header */}
      <MobileHeader
        title={t("apt_title")}
        showBack={true}
      />

      {/* Main Content Area */}
      <main className="flex-1 px-4 sm:px-6 py-4 sm:py-6 max-w-md md:max-w-3xl lg:max-w-4xl mx-auto w-full space-y-5">
        {/* Intro */}
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
            {t("apt_title")}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {isHindi
              ? "अपना लाइव ओपीडी कतार टोकन, आगामी डॉक्टर परामर्श और पिछले पर्चे ट्रैक करें।"
              : "Track your live OPD queue token, upcoming doctor check-ins, and past prescriptions."}
          </p>
        </div>

        {/* Tab Selector: Upcoming vs Past */}
        <div className="flex p-1.5 rounded-2xl bg-slate-200/80 border border-slate-200 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab("UPCOMING")}
            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "UPCOMING"
                ? "bg-white text-teal-900 shadow-xs border border-teal-700/20 font-black"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            <span>{isHindi ? `आगामी (${upcomingList.length})` : `Upcoming (${upcomingList.length})`}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("PAST")}
            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "PAST"
                ? "bg-white text-teal-900 shadow-xs border border-teal-700/20 font-black"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>{isHindi ? `पिछला इतिहास (${pastList.length})` : `Past History (${pastList.length})`}</span>
          </button>
        </div>

        {/* Tab 1: Upcoming Appointments */}
        {activeTab === "UPCOMING" && (
          <div className="space-y-3.5">
            {upcomingList.map((apt) => (
              <div
                key={apt.id}
                onClick={() => setSelectedAppointment(apt)}
                className={`p-4 sm:p-5 rounded-3xl border transition-all cursor-pointer select-none active:scale-[0.99] shadow-xs hover:shadow-md ${
                  apt.isToday
                    ? "bg-white border-2 border-teal-700 ring-2 ring-teal-600/10"
                    : "bg-white border-slate-200"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-black px-2.5 py-0.5 rounded-md bg-teal-800 text-white font-mono">
                        {apt.tokenNumber}
                      </span>
                      {apt.isToday && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          {isHindi ? "आज की मुलाकात · कतार में" : "Today's Visit · In Queue"}
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      {isHindi ? (apt.hindiDoctorName || apt.doctorName) : apt.doctorName}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      {isHindi ? (apt.hindiSpecialty || apt.specialty) : apt.specialty}
                    </p>
                  </div>

                  <ChevronRight className="w-5 h-5 text-slate-400 shrink-0 mt-2" />
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs text-slate-600 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                    <span>{apt.date} · {apt.timeSlot}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                    <MapPin className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                    <span>{isHindi ? `कक्ष ${apt.room?.replace(/\D/g, '') || apt.room}` : apt.room}</span>
                  </div>
                </div>

                {apt.isToday && apt.estimatedWaitTime && (
                  <div className="mt-2.5 p-2 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-between text-xs text-teal-950 font-bold">
                    <span>{isHindi ? `कतार स्थिति: आपके आगे ${apt.queuePosition} मरीज़` : `Queue Status: ${apt.queuePosition} patients ahead`}</span>
                    <span className="text-[11px] font-normal text-teal-800">{isHindi ? `अनुमानित: ${apt.estimatedWaitTime}` : `Est. ${apt.estimatedWaitTime}`}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Past Appointments */}
        {activeTab === "PAST" && (
          <div className="space-y-3">
            {pastList.map((apt) => (
              <div
                key={apt.id}
                onClick={() => setSelectedAppointment(apt)}
                className="p-4 sm:p-5 rounded-3xl border border-slate-200 bg-white shadow-xs hover:shadow-md transition-all cursor-pointer select-none active:scale-[0.99]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-mono">
                        {apt.tokenNumber}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400">
                        {apt.date}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 leading-snug">
                      {isHindi ? (apt.hindiDoctorName || apt.doctorName) : apt.doctorName}
                    </h3>
                    <p className="text-xs font-semibold text-teal-800">
                      {isHindi ? (apt.hindiDiagnosis || apt.diagnosis) : apt.diagnosis}
                    </p>
                  </div>

                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
                    {isHindi ? "पूर्ण" : "Completed"}
                  </span>
                </div>

                {apt.summary && (
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed line-clamp-2">
                    {apt.summary}
                  </p>
                )}

                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <span>{isHindi ? "दस्तावेज़" : "Document"}: {apt.prescriptionDocument}</span>
                  <span className="font-bold text-teal-700 hover:text-teal-900 flex items-center gap-0.5">
                    {isHindi ? "देखें" : "View"} <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Persistent Bottom Navigation */}
      <BottomNavBar />

      {/* Appointment Details Modal */}
      <AppointmentDetailsModal />
    </div>
  );
};

export default AppointmentsScreen;
