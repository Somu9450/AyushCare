import React from 'react';
import { ArrowRight, HeartPulse } from 'lucide-react';
import { useKioskStore } from '../store/useKioskStore';
import { useTranslation } from '../hooks/useTranslation';

export default function Screen1_Welcome() {
  const { nextScreen } = useKioskStore();
  const { t } = useTranslation();

  return (
    <section className="hero-card">
      <div className="hero-icon"><HeartPulse size={48} strokeWidth={2} /></div>
      <p className="eyebrow">AyushCare</p>
      <h1>{t('welcome')}</h1>
      <p className="hero-copy">{t('subtitle')}</p>
      <button className="primary-btn hero-cta" onClick={nextScreen}>
        {t('continue')} <ArrowRight size={22} />
      </button>
    </section>
  );
}
