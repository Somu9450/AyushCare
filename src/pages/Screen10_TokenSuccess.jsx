import React from 'react';
import { CheckCircle2, Printer, RotateCcw, UserRound, CalendarDays } from 'lucide-react';
import { useKioskStore } from '../store/useKioskStore';
import { useTranslation } from '../hooks/useTranslation';

export default function Screen10_TokenSuccess(){
 const {sessionData,resetSession}=useKioskStore(); const {t}=useTranslation(); const p=sessionData.patientProfile||{}; const token=sessionData.token?.token_number||sessionData.token||'—'; const date=new Date().toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'});
 return <section className="success-card"><CheckCircle2 size={70}/><p className="eyebrow">08 • AyushCare OPD</p><h1>{t('token')}</h1><div className="token-number">{token}</div><div className="token-print-card"><div><small>Patient ID</small><strong>{sessionData.patientId||p.patientId||'—'}</strong></div><div><small>Patient name</small><strong>{p.full_name||p.name||'—'}</strong></div><div><small>Age / Gender</small><strong>{p.age||'—'} / {p.gender||'—'}</strong></div><div><small>Date</small><strong><CalendarDays size={15}/> {date}</strong></div></div><p>{t('queue')}</p><div className="success-actions"><button className="secondary-btn" onClick={()=>window.print()}><Printer size={18}/>Print Token</button><button className="primary-btn" onClick={resetSession}><RotateCcw size={18}/>{t('restart')}</button></div></section>
}
