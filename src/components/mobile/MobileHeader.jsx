import React from "react";
import {
  ArrowLeft,
  CheckCircle2,
  CircleUserRound,
  Menu,
  Wifi,
  WifiOff,
} from "lucide-react";

import useMobileStore, {
  SCREENS,
} from "../../store/useMobileStore";
import LanguageSwitcher from "./LanguageSwitcher";

function MobileHeader({
  title,
  subtitle,
  showBack = true,
  showProfile = false,
  showMenu = false,
  onBack,
  onProfile,
  onMenu,
  rightContent,
}) {
  const {
    kioskSession,
    patient,
    prevScreen,
    setScreen,
  } = useMobileStore();

  const isConnected =
    kioskSession?.status === "CONNECTED" &&
    !kioskSession?.isSessionExpired;

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }

    if (typeof prevScreen === "function") {
      prevScreen();
    }
  };

  const handleProfile = () => {
    if (onProfile) {
      onProfile();
      return;
    }

    if (typeof setScreen === "function") {
      setScreen(SCREENS.PROFILE);
    }
  };

  const handleMenu = () => {
    if (onMenu) {
      onMenu();
      return;
    }

    if (typeof setScreen === "function") {
      setScreen(SCREENS.MORE);
    }
  };

  const patientName =
    patient?.name ||
    patient?.fullName ||
    "Patient";

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex min-h-[68px] max-w-5xl items-center gap-3 px-4 py-3">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {showBack && (
            <button
              type="button"
              onClick={handleBack}
              aria-label="Go back"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <ArrowLeft size={20} />
            </button>
          )}

          <div className="mobile-header-brand">
            <img
              src="https://www.uxdt.nic.in/wp-content/uploads/2025/09/ayushman-bharat-digital-mission-feature--ayushman-bharat-digital-mission.jpg"
              alt="Ayushman Bharat Digital Mission"
            />
          </div>

          <div className="min-w-0">
            {title && (
              <h1 className="truncate text-base font-bold text-slate-900 sm:text-lg">
                {title}
              </h1>
            )}

            {subtitle && (
              <p className="truncate text-xs text-slate-500 sm:text-sm">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {rightContent}

          <LanguageSwitcher />

          <div
            title={
              isConnected
                ? "Kiosk connected"
                : "Kiosk not connected"
            }
            className={`flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-semibold ${
              isConnected
                ? "bg-emerald-50 text-emerald-700"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            {isConnected ? (
              <CheckCircle2 size={14} />
            ) : (
              <WifiOff size={14} />
            )}

            <span className="hidden sm:inline">
              {isConnected
                ? "Connected"
                : "Not connected"}
            </span>
          </div>

          {showProfile && (
            <button
              type="button"
              onClick={handleProfile}
              aria-label={`Open profile for ${patientName}`}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <CircleUserRound size={21} />
            </button>
          )}

          {showMenu && (
            <button
              type="button"
              onClick={handleMenu}
              aria-label="Open menu"
              className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Menu size={21} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export default MobileHeader;