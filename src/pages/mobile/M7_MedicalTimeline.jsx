import React from "react";
import {
  Clock,
  Calendar,
  FileText,
  User,
  Activity,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import useMobileStore, { SCREENS } from "../../store/useMobileStore";
import MobileHeader from "../../components/mobile/MobileHeader";
import PrimaryButton from "../../components/mobile/PrimaryButton";
import BottomActionBar from "../../components/mobile/BottomActionBar";

/**
 * M7 — MEDICAL TIMELINE
 * Synthesizes patient medical history across past records, newly uploaded Rx, and current kiosk symptoms into a clean vertical timeline.
 */
export const M7_MedicalTimeline = () => {
  const { timeline, setScreen, prevScreen } = useMobileStore();

  const handleContinue = () => {
    setScreen(SCREENS.M8);
  };

  return (
    <div className="min-h-full flex flex-col justify-between bg-slate-50">
      {/* Header */}
      <MobileHeader
        title="Medical Timeline"
        showBack={true}
        onBack={prevScreen}
      />

      {/* Main Content Area */}
      <main className="flex-1 px-4 sm:px-6 py-4 sm:py-6 max-w-md md:max-w-3xl lg:max-w-4xl mx-auto w-full space-y-5">
        {/* Intro heading */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-black tracking-wider uppercase bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full">
              Chronological Record
            </span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
            Medical Timeline
          </h2>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Your combined health journey: past records, uploaded documents, and today's hospital visit.
          </p>
        </div>

        {/* Vertical Timeline Container */}
        <div className="relative pl-6 space-y-6 pt-2 pb-2">
          {/* Vertical Connecting Line */}
          <div className="absolute left-[11px] top-3 bottom-4 w-0.5 bg-slate-200"></div>

          {timeline.map((item, index) => {
            const isToday = item.timeLabel === "TODAY";

            return (
              <div key={item.id || index} className="relative group">
                {/* Timeline node icon / bullet */}
                <div
                  className={`absolute -left-6 top-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    isToday
                      ? "bg-teal-700 border-teal-800 text-white shadow-xs ring-4 ring-teal-100"
                      : "bg-white border-teal-600 text-teal-700 shadow-2xs"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-current"></span>
                </div>

                {/* Timeline Card */}
                <div
                  className={`rounded-2xl p-4 border transition-all ${
                    isToday
                      ? "bg-teal-50/80 border-teal-300 shadow-xs"
                      : "bg-white border-slate-200/90 shadow-2xs"
                  }`}
                >
                  {/* Year / Date Pill */}
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span
                      className={`text-xs font-black tracking-wider uppercase px-2 py-0.5 rounded-md ${
                        isToday
                          ? "bg-teal-800 text-white"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {item.timeLabel}
                    </span>

                    {/* Source label */}
                    <span className="text-[11px] font-semibold text-slate-400">
                      Source: <span className="text-slate-600 font-bold">{item.source}</span>
                    </span>
                  </div>

                  {/* Title & details */}
                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {item.title}
                  </h3>

                  {item.subtitle && (
                    <p className="text-xs font-semibold text-teal-900 mt-1 bg-white/70 px-2 py-1 rounded-lg border border-slate-100 inline-block">
                      {item.subtitle}
                    </p>
                  )}

                  {item.details && (
                    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                      {item.details}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Informational reassurance */}
        <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-500 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-teal-800 shrink-0" />
          <span>Timeline is compiled to assist doctor review during consultation.</span>
        </div>
      </main>

      {/* Bottom Action Bar */}
      <BottomActionBar>
        <PrimaryButton onClick={handleContinue} icon={ArrowRight}>
          View Your Summary
        </PrimaryButton>
      </BottomActionBar>
    </div>
  );
};

export default M7_MedicalTimeline;
