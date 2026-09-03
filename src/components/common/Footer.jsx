import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

import { useKioskStore } from '../../store/useKioskStore';
import { useTranslation } from '../../hooks/useTranslation';

const Footer = ({
  showContinue = false,
  onContinue,
  continueLabel,
  continueDisabled = false,
}) => {
  const {
    currentScreen,
    prevScreen,
  } = useKioskStore();

  const { t } = useTranslation();

  const resolvedContinueLabel = continueLabel || t('nav.continue', 'Continue');

  /*
   * Screen 1 has its own CTA.
   * We don't need a persistent footer there.
   */
  if (currentScreen === 1) {
    return null;
  }

  return (
    <footer className="w-full bg-white border-t border-slate-200 px-4 py-2 shrink-0">
      <div className="w-full max-w-[608px] mx-auto">

        <div className="flex items-center justify-between gap-3">

          {/* Back */}
          <button
            type="button"
            onClick={prevScreen}
            className="h-10 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer transition active:scale-95 shadow-xs flex-1 sm:flex-none"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('nav.back', 'Back')}</span>
          </button>

          {/* Continue */}
          {showContinue && (
            <button
              type="button"
              disabled={continueDisabled}
              onClick={onContinue}
              className="h-10 px-5 rounded-xl bg-teal-700 hover:bg-teal-800 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed transition active:scale-95 shadow-xs flex-1 sm:flex-none"
            >
              <span>{resolvedContinueLabel}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>
    </footer>
  );
};

export default Footer;