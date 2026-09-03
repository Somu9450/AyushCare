import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

import { useKioskStore } from '../../store/useKioskStore';

const Footer = ({
  showContinue = false,
  onContinue,
  continueLabel = 'Continue',
  continueDisabled = false,
}) => {
  const {
    currentScreen,
    prevScreen,
  } = useKioskStore();

  /*
   * Screen 1 has its own CTA.
   * We don't need a persistent footer there.
   */
  if (currentScreen === 1) {
    return null;
  }

  return (
    <footer className="w-full bg-white border-t border-slate-200 px-4 py-4">
      <div className="w-full max-w-[608px] mx-auto">

        <div className="flex items-center justify-between gap-3">

          {/* Back */}
          <button
            type="button"
            onClick={prevScreen}
            className="kiosk-secondary-button kiosk-focus flex-1 sm:flex-none"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>

          {/* Continue */}
          {showContinue && (
            <button
              type="button"
              disabled={continueDisabled}
              onClick={onContinue}
              className="kiosk-primary-button kiosk-focus flex-1 sm:flex-none"
            >
              <span>{continueLabel}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>

      </div>
    </footer>
  );
};

export default Footer;