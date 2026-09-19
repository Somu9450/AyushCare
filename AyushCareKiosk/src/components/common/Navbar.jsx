import React from "react";
import { Volume2, VolumeX, ArrowLeft, X, HelpCircle, Landmark } from "lucide-react";
import { useKioskStore } from "../../store/useKioskStore";
import LanguageToggle from "./LanguageToggle";
import { audioService } from '../../services/audioService';
import { useTranslation } from '../../hooks/useTranslation';

export default function Navbar() {
  const { audioEnabled, toggleAudio, currentScreen, prevScreen, resetSession } = useKioskStore();
  const { t } = useTranslation();

  return (
    <header className="kiosk-nav h-[72px] bg-[#00504b] text-white px-4 sm:px-8 flex items-center justify-between shadow-md border-b border-[#003834] select-none shrink-0 relative z-40">
      {/* Left Branding: Ministry of Health, Govt of India */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
          <Landmark className="w-5 h-5 text-teal-100" />
        </div>
        <div className="flex flex-col text-left">
          <span className="font-bold text-xs sm:text-sm tracking-tight text-white leading-tight">
            Ministry of Health
          </span>
          <span className="text-[10px] sm:text-xs text-teal-200/85 font-medium leading-tight">
            Government of India
          </span>
        </div>
      </div>

      {/* Center Branding: MEDIKIOSK Digital Health Kiosk */}
      <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center text-center pointer-events-none">
        <span className="font-black text-base lg:text-lg tracking-[0.18em] text-white uppercase leading-tight">
          MEDIKIOSK
        </span>
        <span className="text-[10px] lg:text-xs text-teal-200/90 font-medium tracking-wide">
          Digital Health Kiosk
        </span>
      </div>

      {/* Right Controls: Audio, Help, Back, Exit */}
      <div className="flex items-center gap-2 sm:gap-3">
        <LanguageToggle />

        <button
          type="button"
          onClick={() => { if (audioEnabled) audioService.stop(); toggleAudio(); }}
          className="px-3 py-1.5 rounded-lg bg-[#003834] hover:bg-[#002b28] text-teal-100 border border-teal-600/50 flex items-center gap-1.5 text-xs font-semibold cursor-pointer transition-colors"
          title={audioEnabled ? t('muteAudio','Mute audio') : t('enableAudio','Enable audio')}
        >
          {audioEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
          <span className="hidden sm:inline">Audio</span>
        </button>

        {currentScreen > 1 && (
          <button
            type="button"
            onClick={prevScreen}
            className="px-3 py-1.5 rounded-lg bg-[#003834] hover:bg-[#002b28] text-teal-100 border border-teal-600/50 flex items-center gap-1 text-xs font-semibold cursor-pointer transition-colors"
            title="Go Back"
          >
            <ArrowLeft size={14} />
            <span className="hidden sm:inline">Back</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => {
            if (window.confirm('Are you sure you want to exit and cancel this session?')) {
              audioService.stop();
              resetSession();
            }
          }}
          className="px-2.5 py-1.5 rounded-lg bg-[#003834] hover:bg-rose-950/60 text-teal-100 hover:text-rose-200 border border-teal-600/50 hover:border-rose-700/60 flex items-center gap-1 text-xs font-semibold cursor-pointer transition-colors"
          title="Exit Session"
        >
          <X size={14} />
          <span className="hidden sm:inline">Exit</span>
        </button>
      </div>
    </header>
  );
}
