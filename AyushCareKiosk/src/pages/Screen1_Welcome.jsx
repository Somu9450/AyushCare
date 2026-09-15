import React from 'react';
import { ArrowRight, HeartPulse, ShieldCheck } from 'lucide-react';
import { useKioskStore } from '../store/useKioskStore';
import { useTranslation } from '../hooks/useTranslation';

export default function Screen1_Welcome(){
 const {nextScreen}=useKioskStore(); const {t}=useTranslation();
 return <section className="hero-card"><div className="hero-icon"><HeartPulse size={42}/></div><p className="eyebrow">AyushCare • Patient Intake</p><h1>{t('welcome')}</h1><div className="feature-row"><span><ShieldCheck size={18}/>{t('privateSecure','Private & secure')}</span><span>{t('languages22','22 Indian languages')}</span><span>{t('voiceTouch','Voice + touch')}</span></div><button className="primary-btn hero-cta" onClick={nextScreen}>{t('continue')}<ArrowRight/></button></section>;
}
