import React from "react";
import { ArrowLeft, Wifi, CheckCircle2 } from "lucide-react";
import useMobileStore, { SCREENS } from "../../store/useMobileStore";

/**
 * MobileHeader component
 * Minimal patient-focused mobile header.
 * Shows back button (when screen allows), Screen Title, and AYUSHCARE brand status.
 */
export const MobileHeader = ({
  title,
  showBack = true,
  onBack,
  rightElement,
  subtitle,
  dark = false,
}) => {
  const { currentScreen, prevScreen } = useMobileStore();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      prevScreen();
    }
  };

  const canGoBack = showBack && currentScreen !== SCREENS.M1 && currentScreen !== SCREENS.M9;

  return (
    <header
      className={`w-full shrink-0 px-4 pt-safe pb-2.5 transition-colors ${
        dark ? "bg-slate-950 text-white border-b border-slate-800/80" : "bg-white text-slate-900 border-b border-slate-200/80"
      }`}
    >
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-3 h-12 sm:h-14">
        {/* Left: Back Button or Brand */}
        <div className="flex items-center gap-2.5 min-w-0">
          {canGoBack ? (
            <button
              type="button"
              onClick={handleBack}
              aria-label="Go Back"
              className={`w-10 h-10 -ml-1.5 rounded-xl flex items-center justify-center transition active:scale-95 cursor-pointer ${
                dark
                  ? "text-slate-300 hover:bg-slate-800 active:bg-slate-700"
                  : "text-slate-700 hover:bg-slate-100 active:bg-slate-200"
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          ) : null}

          <div className="min-w-0">
            {title ? (
              <h1 className={`text-base font-bold truncate leading-tight ${dark ? "text-white" : "text-slate-900"}`}>
                {title}
              </h1>
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black tracking-wider text-teal-800">
                  AYUSHCARE
                </span>
                <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                  COMPANION
                </span>
              </div>
            )}
            {subtitle && (
              <p className={`text-xs truncate leading-none mt-0.5 ${dark ? "text-slate-400" : "text-slate-500"}`}>
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right Element or Kiosk Connection Indicator */}
        <div className="shrink-0 flex items-center gap-2">
          {rightElement ? (
            rightElement
          ) : (
            <div
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-tight ${
                dark
                  ? "bg-teal-950/80 text-teal-300 border border-teal-800"
                  : "bg-teal-50 text-teal-800 border border-teal-200"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="hidden xs:inline">Connected</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default MobileHeader;
