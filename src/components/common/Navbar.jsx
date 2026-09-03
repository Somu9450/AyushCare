import React from 'react';
import { Volume2, VolumeX, HelpCircle, ArrowLeft, X } from 'lucide-react';

import { useKioskStore } from '../../store/useKioskStore';
import { useTranslation } from '../../hooks/useTranslation';
import LanguageToggle from './LanguageToggle';

const Navbar = () => {
  const {
    currentScreen,
    audioEnabled,
    toggleAudio,
    resetSession,
  } = useKioskStore();

  const { t } = useTranslation();

  const handleExit = () => {
    const confirmed = window.confirm(
      t('nav.exitConfirm', 'Do you want to exit this session and return to the welcome screen?')
    );

    if (confirmed) {
      resetSession();
    }
  };

  return (
    <header className="kiosk-header bg-[#0d3b36]">
      {/* Left branding: AyushCare OS */}
      <div className="kiosk-header-left flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-teal-800/80 border border-teal-600/50 flex items-center justify-center text-teal-200 shrink-0">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="M12 8v8" />
            <path d="M8 12h8" />
          </svg>
        </div>
        <div className="kiosk-header-brand leading-tight">
          <strong className="text-white font-black text-sm tracking-wide">AyushCare</strong>
          <span className="text-[11px] text-teal-200/80 block">Smart Health Kiosk OS</span>
        </div>
      </div>

      {/* Main product title (center) */}
      <div className="kiosk-header-title text-center">
        <div className="font-black text-lg sm:text-xl tracking-widest text-white uppercase">
          {t('app.name', 'AYUSHCARE')}
        </div>
        <div className="text-[11px] text-teal-200/80 font-medium tracking-wide">
          {t('app.kioskTitle', 'Digital Health Kiosk')}
        </div>
      </div>

      {/* Patient-facing controls */}
      <div className="kiosk-header-actions">

        {/* Audio */}
        <button
          type="button"
          onClick={toggleAudio}
          className="kiosk-header-button kiosk-focus"
          aria-label={audioEnabled ? t('nav.audioHelp', 'Turn audio off') : t('nav.audioHelp', 'Turn audio on')}
        >
          {audioEnabled ? (
            <Volume2 className="w-5 h-5" />
          ) : (
            <VolumeX className="w-5 h-5" />
          )}

          <span>
            {audioEnabled ? t('nav.audioOn', 'Audio On') : t('nav.audio', 'Audio')}
          </span>
        </button>

        {/* Language - on Screen > 1 */}
        {currentScreen > 1 && <LanguageToggle variant="pill" />}

        {/* Help */}
        <button
          type="button"
          className="kiosk-header-button kiosk-focus"
          aria-label={t('nav.help', 'Help')}
          onClick={() => {
            window.alert(
              t('screen1.instructions', 'Complete your health information before meeting your doctor. Tap any language to switch, or press audio for voice instructions.')
            );
          }}
        >
          <HelpCircle className="w-4 h-4 text-teal-200" />
          <span>{t('nav.help', 'Help')}</span>
        </button>

        {/* Back */}
        {currentScreen > 1 && (
          <button
            type="button"
            className="kiosk-header-button kiosk-focus"
            onClick={() => useKioskStore.getState().prevScreen()}
            aria-label={t('nav.back', 'Go back')}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('nav.back', 'Back')}</span>
          </button>
        )}

        {/* Exit */}
        <button
          type="button"
          className="kiosk-header-button kiosk-focus"
          onClick={handleExit}
          aria-label={t('nav.exit', 'Exit session')}
        >
          <X className="w-4 h-4 text-teal-200" />
          <span>{t('nav.exit', 'Exit')}</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;