import React, { useMemo } from "react";
import {
  CalendarDays,
  Stethoscope,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  Building2,
  Clock,
  Filter,
  FileQuestion,
  RotateCcw,
  Lock,
} from "lucide-react";
import useMobileStore, { SCREENS } from "../../store/useMobileStore";
import { mockVisits } from "../../data/mockData";
import MobileHeader from "../../components/mobile/MobileHeader";
import BottomNavBar from "../../components/mobile/BottomNavBar";

/**
 * MY VISITS SCREEN
 * Healthcare visit history (actual encounters with doctors, distinct from scheduled appointments).
 * Features:
 * - Clean chronological grouping (Year -> Month)
 * - Filtering: All, Allopathy, AYUSH
 * - Rich, comfortable mobile cards
 * - Empty state handling
 * - Tappable navigation to Visit Details
 */
export const MyVisitsScreen = () => {
  const {
    visitFilter,
    setVisitFilter,
    setSelectedVisit,
    setScreen,
    prevScreen,
    isHealthHistoryLocked,
  } = useMobileStore();

  // Filter options
  const filterTabs = [
    { id: "ALL", label: "All" },
    { id: "ALLOPATHY", label: "Allopathy" },
    { id: "AYUSH", label: "AYUSH" },
  ];

  // Filtered visits
  const filteredVisits = useMemo(() => {
    if (visitFilter === "ALLOPATHY") {
      return mockVisits.filter((v) => v.type === "ALLOPATHY");
    }
    if (visitFilter === "AYUSH") {
      return mockVisits.filter((v) => v.type === "AYUSH");
    }
    return mockVisits;
  }, [visitFilter]);

  // Group visits chronologically: Year -> Month
  const groupedVisits = useMemo(() => {
    const groups = {};
    filteredVisits.forEach((visit) => {
      const year = visit.year || "2026";
      const month = visit.month || "Recent";
      if (!groups[year]) {
        groups[year] = {};
      }
      if (!groups[year][month]) {
        groups[year][month] = [];
      }
      groups[year][month].push(visit);
    });
    return groups;
  }, [filteredVisits]);

  const handleSelectVisit = (visit) => {
    setSelectedVisit(visit);
    setScreen(SCREENS.VISIT_DETAILS);
  };

  return (
    <div className="min-h-full flex flex-col justify-between bg-slate-50 text-slate-900">
      {/* Mobile Header with brand status */}
      <MobileHeader
        title="My Visits"
        showBack={true}
        onBack={prevScreen}
      />

      {/* Main Content Area */}
      <main className="flex-1 px-4 sm:px-6 py-4 sm:py-6 max-w-md md:max-w-2xl lg:max-w-3xl mx-auto w-full space-y-5">
        {/* Main Heading & Subheading */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
              My Visits
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
              Your previous healthcare visits and consultation history.
            </p>
          </div>

          {isHealthHistoryLocked && (
            <span className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-300 shadow-2xs">
              <Lock className="w-3 h-3 text-amber-700" />
              <span>Sharing restricted</span>
            </span>
          )}
        </div>

        {/* Visit Filters (Horizontally scrollable if needed) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none select-none">
          {filterTabs.map((tab) => {
            const isSelected = visitFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setVisitFilter(tab.id)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer border active:scale-95 ${
                  isSelected
                    ? "bg-teal-50 border-teal-700 text-teal-800 shadow-xs ring-1 ring-teal-600/30"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 shadow-2xs"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Visit Chronological Grouping & Cards */}
        {filteredVisits.length === 0 ? (
          /* Empty State */
          <div className="p-8 rounded-3xl bg-white border border-slate-200/90 text-center space-y-3 shadow-xs my-6">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-800 border border-teal-200 flex items-center justify-center mx-auto">
              <FileQuestion className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              No visits found
            </h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
              Your previous healthcare visits will appear here.
            </p>
            <button
              type="button"
              onClick={() => setVisitFilter("ALL")}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Show All Visits</span>
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedVisits).map(([year, months]) => (
              <section key={year} aria-label={`Visits in ${year}`} className="space-y-4">
                {/* Year Marker */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                    {year}
                  </span>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>

                {/* Months within Year */}
                {Object.entries(months).map(([month, visits]) => (
                  <div key={month} className="space-y-3">
                    <h4 className="text-xs font-bold text-teal-800 uppercase tracking-wide px-1">
                      {month}
                    </h4>

                    {/* Visit Cards */}
                    <div className="space-y-3">
                      {visits.map((visit) => {
                        const isAyush = visit.type === "AYUSH";
                        const Icon = isAyush ? Sparkles : Stethoscope;

                        return (
                          <div
                            key={visit.id}
                            onClick={() => handleSelectVisit(visit)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                handleSelectVisit(visit);
                              }
                            }}
                            className="w-full p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/90 hover:border-teal-600/40 hover:shadow-md transition-all active:scale-[0.99] text-left cursor-pointer space-y-3.5 group shadow-xs select-none"
                          >
                            {/* Card Header: Date & Status Badge */}
                            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                              <div className="flex items-center gap-2">
                                <CalendarDays className="w-4 h-4 text-slate-400" />
                                <span className="text-sm sm:text-base font-black text-slate-900">
                                  {visit.date}
                                </span>
                              </div>

                              <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span>{visit.status}</span>
                              </div>
                            </div>

                            {/* Card Body: Doctor & Department Info */}
                            <div className="flex items-start justify-between gap-3">
                              <div className="space-y-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-xs font-bold uppercase tracking-wider text-teal-800">
                                    {visit.department}
                                  </span>
                                  {/* Visit Type Badge */}
                                  <span
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                                      isAyush
                                        ? "bg-amber-50 text-amber-900 border-amber-200"
                                        : "bg-teal-50 text-teal-800 border-teal-200"
                                    }`}
                                  >
                                    <Icon className="w-3 h-3" />
                                    <span>{visit.typeLabel || visit.type}</span>
                                  </span>
                                </div>

                                <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                                  {visit.doctor}
                                </h3>

                                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                  <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                  <span>{visit.hospital}</span>
                                  {visit.room && (
                                    <>
                                      <span>·</span>
                                      <span>{visit.room}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Card Footer: Action */}
                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                              <span className="text-slate-400">
                                {visit.documents?.length || 0} document{visit.documents?.length === 1 ? "" : "s"} attached
                              </span>
                              <span className="font-bold text-teal-800 group-hover:text-teal-950 flex items-center gap-1 transition-transform group-hover:translate-x-0.5">
                                <span>View Visit</span>
                                <ChevronRight className="w-4 h-4" />
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </section>
            ))}
          </div>
        )}
      </main>

      {/* Persistent Bottom Navigation */}
      <BottomNavBar />
    </div>
  );
};

export default MyVisitsScreen;
