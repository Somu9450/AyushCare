import React from 'react';
import { Volume2, VolumeX, HelpCircle, ArrowLeft, X } from 'lucide-react';

import { useKioskStore } from '../../store/useKioskStore';
import LanguageToggle from './LanguageToggle';

const Navbar = () => {
  const {
    currentScreen,
    audioEnabled,
    toggleAudio,
    resetSession,
  } = useKioskStore();

  const handleExit = () => {
    const confirmed = window.confirm(
      'Do you want to exit this session and return to the welcome screen?'
    );

    if (confirmed) {
      resetSession();
    }
  };

  return (
    <header className="kiosk-header">
      {/* Government / institution branding */}
      <div className="kiosk-header-left">
        <div className="kiosk-header-brand">
          <strong>Government of India</strong>
          Ministry of Ayush
        </div>
      </div>

      {/* Main product title */}
      <div className="kiosk-header-title">
        MEDIKIOSK
      </div>

      {/* Patient-facing controls */}
      <div className="kiosk-header-actions">

        {/* Audio */}
        <button
          type="button"
          onClick={toggleAudio}
          className="kiosk-header-button kiosk-focus"
          aria-label={audioEnabled ? 'Turn audio off' : 'Turn audio on'}
        >
          {audioEnabled ? (
            <Volume2 className="w-5 h-5" />
          ) : (
            <VolumeX className="w-5 h-5" />
          )}

          <span>
            {audioEnabled ? 'Audio On' : 'Audio'}
          </span>
        </button>

        {/* Language */}
        <LanguageToggle variant="pill" />

        {/* Help */}
        <button
          type="button"
          className="kiosk-header-button kiosk-focus"
          aria-label="Help"
          onClick={() => {
            // Keep this hook simple for now.
            // Help modal can be connected later.
            window.alert(
              'You can answer using voice or touch. Ask hospital staff for assistance if needed.'
            );
          }}
        >
          <HelpCircle className="w-5 h-5" />
          <span>Help</span>
        </button>

        {/* Back */}
        {currentScreen > 1 && (
          <button
            type="button"
            className="kiosk-header-button kiosk-focus"
            onClick={() => useKioskStore.getState().prevScreen()}
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
        )}

        {/* Exit */}
        {currentScreen > 1 && (
          <button
            type="button"
            className="kiosk-header-button kiosk-focus"
            onClick={handleExit}
            aria-label="Exit session"
          >
            <X className="w-5 h-5" />
            <span>Exit</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default Navbar;