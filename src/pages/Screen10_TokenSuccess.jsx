import React from 'react';
import { CheckCircle2, Printer, RotateCcw } from 'lucide-react';
import { useKioskStore } from '../store/useKioskStore';
import { useTranslation } from '../hooks/useTranslation';
export default function Screen10_TokenSuccess(){const {sessionData,resetSession}=useKioskStore();const {t}=useTranslation();return <section className="success-card"><CheckCircle2 size={70}/><p className="eyebrow">08 • AyushCare OPD</p><h1>{t('token')}</h1><div className="token-number">{sessionData.token?.token_number||sessionData.token||'—'}</div><p>{t('queue')}</p><div className="success-actions"><button className="secondary-btn" onClick={()=>window.print()}><Printer size={18}/>Print</button><button className="primary-btn" onClick={resetSession}><RotateCcw size={18}/>{t('restart')}</button></div></section>}
