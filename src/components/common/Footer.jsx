import React from 'react';
import { ArrowLeft, ArrowRight, Home, Eye, Phone, ShieldCheck } from 'lucide-react';
import { useKioskStore } from '../../store/useKioskStore';
import { useTranslation } from '../../hooks/useTranslation';

export const Footer = ({ showContinue = false, onContinue, continueLabel, continueDisabled = false }) => {
  const { currentScreen, prevScreen, resetSession, nextScreen, highContrast, toggleHighContrast } = useKioskStore();
  const { t } = useTranslation();

  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-300 py-3 px-4 sm:px-8 select-none mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Left Side: Terminal ID & Helplines */}
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>DPDP Act 2023 Compliant</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-slate-400">
            <Phone className="w-3.5 h-3.5 text-amber-400" />
            <span>AYUSH Helpline: <strong className="text-white font-mono">14443</strong></span>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 text-slate-400">
            <span>ABDM Helpline: <strong className="text-white font-mono">1075</strong> (Toll Free)</span>
          </div>

          {/* High Contrast Toggle */}
          <button
            type="button"
            onClick={toggleHighContrast}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${
              highContrast
                ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white hover:bg-slate-700'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{highContrast ? t('nav.normalContrast', 'Standard') : t('nav.highContrast', 'High Contrast')}</span>
          </button>
        </div>

        {/* Right Side: Navigation buttons when in workflow */}
        {currentScreen > 1 && (
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            {/* Back Button */}
            <button
              type="button"
              onClick={prevScreen}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm border border-slate-700 active:scale-95 transition-all cursor-pointer min-h-[52px]"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>{t('nav.back', 'Back')}</span>
            </button>

            {/* Cancel / Home Button */}
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Do you want to cancel and return to the main screen?')) {
                  resetSession();
                }
              }}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-800/80 hover:bg-rose-900/60 hover:text-rose-200 text-slate-300 font-medium text-sm border border-slate-700 active:scale-95 transition-all cursor-pointer min-h-[52px]"
            >
              <Home className="w-5 h-5" />
              <span className="hidden sm:inline">{t('nav.cancel', 'Cancel')}</span>
            </button>

            {/* Next / Continue Button (if enabled for this screen via props) */}
            {showContinue && (
              <button
                type="button"
                disabled={continueDisabled}
                onClick={onContinue || nextScreen}
                className={`flex items-center gap-2 px-7 py-3 rounded-xl font-bold text-base shadow-lg active:scale-95 transition-all cursor-pointer min-h-[52px] ${
                  continueDisabled
                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed opacity-60'
                    : 'bg-gradient-to-r from-teal-700 to-teal-800 hover:from-teal-600 hover:to-teal-700 text-white ring-2 ring-teal-500/50'
                }`}
              >
                <span>{continueLabel || t('nav.continue', 'Continue')}</span>
                <ArrowRight className="w-5 h-5 text-amber-300" />
              </button>
            )}
          </div>
        )}
      </div>
    </footer>
  );
};

export default Footer;
