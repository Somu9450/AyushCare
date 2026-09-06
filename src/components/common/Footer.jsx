import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useKioskStore } from '../../store/useKioskStore';
import { useTranslation } from '../../hooks/useTranslation';

export default function Footer({ showContinue = false }) {
  const { currentScreen, prevScreen } = useKioskStore();
  const { t } = useTranslation();

  return (
    <footer className="kiosk-footer">
      <div className="footer-inner">
        <button
          className="footer-back"
          onClick={prevScreen}
          disabled={currentScreen === 1}
          aria-label={t('back')}
        >
          <ArrowLeft size={22} />
          <span>{t('back')}</span>
        </button>

        <div className="footer-step">Step {currentScreen} of 9</div>

        {showContinue ? <div /> : <div className="footer-spacer" />}
      </div>
    </footer>
  );
}
