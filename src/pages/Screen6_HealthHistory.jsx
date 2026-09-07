import React, { useState } from 'react';
import { Activity, Save, Loader2 } from 'lucide-react';
import { kioskApi, getErrorMessage } from '../services/api';
import { useKioskStore } from '../store/useKioskStore';
import { useTranslation } from '../hooks/useTranslation';
import KioskInput from '../components/common/KioskInput';

export default function Screen6_HealthHistory(){
 const {sessionData,updateSession,nextScreen}=useKioskStore(); const {t}=useTranslation();
 const [v,setV]=useState(sessionData.vitals||{systolic:'',diastolic:'',pulse:'',temperature:'',spo2:''}); const [error,setError]=useState(''); const [loading,setLoading]=useState(false);
 const set=(k,val)=>setV((prev)=>({...prev,[k]:val}));
 const save=async()=>{setLoading(true);setError('');try{const d=await kioskApi.vitals(sessionData.consultationId,{...v,source:'manual'});updateSession({vitals:d});nextScreen()}catch(e){setError(getErrorMessage(e))}finally{setLoading(false)}};
 return <section className="screen-card"><p className="eyebrow">05 • {t('history')}</p><h2>{t('history')}</h2><p>Review the basic information needed for safe triage. You may leave readings blank if the kiosk has no connected sensor.</p><div className="vitals-grid">
 {['systolic','diastolic','pulse','temperature','spo2'].map((k)=><label key={k}><span>{{systolic:'Systolic BP',diastolic:'Diastolic BP',pulse:'Pulse / min',temperature:'Temperature °F',spo2:'SpO₂ %'}[k]}</span><KioskInput id={`vital-${k}`} value={v[k]||''} onChange={(x)=>set(k,x)} type="number" allowDecimal={k==='temperature'} maxLength={5} label={{systolic:'Systolic BP',diastolic:'Diastolic BP',pulse:'Pulse',temperature:'Temperature',spo2:'SpO₂'}[k]} placeholder="Enter reading"/></label>)}
 </div><div className="info-strip"><Activity size={20}/><span>Only enter readings you know. Connected sensor integration can be enabled later.</span></div>{error&&<div className="error-box">{error}</div>}<button className="primary-btn wide" onClick={save} disabled={loading}>{loading?<Loader2 className="spin"/>:<Save size={18}/>} {t('continue')}</button></section>
}
