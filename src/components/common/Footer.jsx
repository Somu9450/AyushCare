import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useKioskStore } from '../../store/useKioskStore';
import { useTranslation } from '../../hooks/useTranslation';

export default function Footer({ showContinue = false }) {
  const { currentScreen, prevScreen } = useKioskStore();
  const { t } = useTranslation();
  const progress = Math.max(0, Math.min(100, (currentScreen / 10) * 100));

  return (
    <footer className="kiosk-footer">
      <div className="footer-inner">
        <button
          className="secondary-btn footer-back"
          onClick={prevScreen}
          disabled={currentScreen === 1}
          aria-label={t('back')}
        >
          <ArrowLeft size={22} />
          <span>{t('back')}</span>
        </button>

        <div className="footer-progress" aria-label={`Step ${currentScreen} of 10`}>
          <div className="footer-progress-dots" aria-hidden="true">
            {Array.from({ length: 10 }, (_, index) => (
              <span key={index} className={index + 1 <= currentScreen ? 'active' : ''} />
            ))}
          </div>
          <span>Step {currentScreen} of 10</span>
          <div className="footer-progress-line" aria-hidden="true">
            <div style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="footer-spacer" />
      </div>
    </footer>
  );
}
