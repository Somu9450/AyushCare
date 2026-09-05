import React from "react";
import { Home, CalendarDays, FileText, UserRound } from "lucide-react";
import useMobileStore, { SCREENS } from "../../store/useMobileStore";

/**
 * BottomNavBar
 * Persistent main navigation bar for the AyushCare mobile companion app.
 * Exposes 4 primary navigation tabs:
 * - Home (Active Kiosk Session, Today's Appointment, Quick Actions)
 * - Visits (Appointments: Upcoming, Past, Appointment Details)
 * - Records (Medical Documents, OCR Entities, Timeline)
 * - More (Patient Profile, ABHA ID Card, Settings, Logout)
 */
export const BottomNavBar = () => {
  const { currentScreen, setScreen, activeNavTab, setActiveNavTab } =
    useMobileStore();

  const navItems = [
    {
      id: "home",
      label: "Home",
      icon: Home,
      screen: SCREENS.M1,
    },
    {
      id: "visits",
      label: "Visits",
      icon: CalendarDays,
      screen: SCREENS.VISITS,
      badge: "Today",
    },
    {
      id: "records",
      label: "Records",
      icon: FileText,
      screen: SCREENS.RECORDS,
    },
    {
      id: "more",
      label: "More",
      icon: UserRound,
      screen: SCREENS.MORE,
    },
  ];

  const handleNav = (item) => {
    setActiveNavTab(item.id);
    setScreen(item.screen);
  };

  // Determine active tab
  const getIsActive = (item) => {
    if (activeNavTab) return activeNavTab === item.id;
    if (item.id === "home" && currentScreen === SCREENS.M1) return true;
    if (
      item.id === "visits" &&
      (currentScreen === SCREENS.VISITS || currentScreen === SCREENS.VISIT_DETAILS)
    )
      return true;
    if (
      item.id === "records" &&
      (currentScreen === SCREENS.RECORDS ||
        currentScreen === SCREENS.DOCUMENT_DETAILS ||
        currentScreen === SCREENS.M7)
    )
      return true;
    if (
      item.id === "more" &&
      (currentScreen === SCREENS.MORE ||
        currentScreen === SCREENS.PRIVACY ||
        currentScreen === SCREENS.CONSENT_DETAILS ||
        currentScreen === SCREENS.PROFILE ||
        currentScreen === SCREENS.SETTINGS ||
        currentScreen === SCREENS.KIOSK_SESSION)
    )
      return true;
    return false;
  };

  return (
    <nav
      aria-label="Main Navigation"
      className="shrink-0 w-full px-4 pt-2 pb-safe bg-white border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.04)] z-30 transition-colors"
    >
      <div className="max-w-md md:max-w-2xl lg:max-w-4xl mx-auto flex items-center justify-around gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = getIsActive(item);

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNav(item)}
              aria-label={item.label}
              className={`flex-1 min-h-[54px] py-1 px-2 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all select-none cursor-pointer active:scale-95 relative ${
                isActive
                  ? "text-teal-800 font-bold"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-50 font-medium"
              }`}
            >
              {/* Active Tab Highlight Indicator */}
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? "scale-110 stroke-[2.4] text-teal-800" : "stroke-[1.8]"
                  }`}
                />
                {item.badge && (
                  <span className="absolute -top-1.5 -right-3.5 bg-amber-500 text-white font-bold text-[9px] px-1 py-0.2 rounded-full uppercase tracking-wider leading-none shadow-2xs">
                    {item.badge}
                  </span>
                )}
              </div>

              <span
                className={`text-[11px] leading-tight tracking-tight transition-colors ${
                  isActive ? "text-teal-800 font-extrabold" : "text-slate-500"
                }`}
              >
                {item.label}
              </span>

              {/* Active dot */}
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-teal-800 -mb-1"></span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavBar;
