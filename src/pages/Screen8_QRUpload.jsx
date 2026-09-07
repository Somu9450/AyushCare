import React,{useEffect,useRef,useState} from 'react';
import { CheckCircle2, Loader2, RefreshCw, Smartphone, Clock3 } from 'lucide-react';
import { kioskApi,getErrorMessage } from '../services/api';
import { useKioskStore } from '../store/useKioskStore';
import { useTranslation } from '../hooks/useTranslation';

export default function Screen8_QRUpload(){
 const {sessionData,updateSession,nextScreen}=useKioskStore(); const {t}=useTranslation();
 const [docs,setDocs]=useState(sessionData.documents||[]); const [pair,setPair]=useState(sessionData.pairingSession); const [loading,setLoading]=useState(false); const [error,setError]=useState(''); const [seconds,setSeconds]=useState(45); const advanced=useRef(false); const docsRef=useRef(docs);
 useEffect(()=>{docsRef.current=docs},[docs]);
 const makePair=async()=>{setLoading(true);setError('');try{const p=await kioskApi.createPairing(sessionData.consultationId,import.meta.env.VITE_KIOSK_ID||'KIOSK-MAIN-01');setPair(p);updateSession({pairingSession:p});setSeconds(45);advanced.current=false}catch(e){setError(getErrorMessage(e))}finally{setLoading(false)}};
 useEffect(()=>{if(!pair)makePair()},[]);
 useEffect(()=>{if(!pair?.id)return;const timer=setInterval(()=>kioskApi.mobileDocuments(pair.id).then(d=>setDocs(Array.isArray(d)?d:[])).catch(()=>{}),3000);return()=>clearInterval(timer)},[pair?.id]);
 useEffect(()=>{
  if(!pair?.id)return;
  const timer=setInterval(()=>setSeconds((s)=>{
    if(s<=1){
      clearInterval(timer);
      if(!advanced.current){
        advanced.current=true;
        // Close the kiosk/mobile bridge before moving the queue forward.
        kioskApi.mobileSync(pair.id).catch(()=>{});
        updateSession({documents:docsRef.current});
        nextScreen();
      }
      return 0;
    }
    return s-1;
  }),1000);
  return()=>clearInterval(timer);
},[pair?.id,nextScreen,updateSession]);
 const sync=async()=>{if(advanced.current)return;advanced.current=true;if(pair?.id){try{await kioskApi.mobileSync(pair.id)}catch{}}updateSession({documents:docsRef.current});nextScreen()};
 const token=pair?.pairing_token||''; const mobileBase=import.meta.env.VITE_MOBILE_PAIR_URL||window.location.origin; const pairUrl=`${mobileBase.replace(/\/$/,'')}?pairing_token=${encodeURIComponent(token)}`; const qrImage=token?`https://quickchart.io/qr?size=280&text=${encodeURIComponent(pairUrl)}`:'';
 return <section className="screen-card qr-screen"><div className="qr-timebar"><span><Clock3 size={18}/> Mobile upload window</span><strong>{seconds}s</strong></div><p className="eyebrow">06 • {t('documents')}</p><h2>{t('mobileUpload')}</h2><p>{t('mobileHelp')}</p><div className="qr-layout"><div className="qr-placeholder">{qrImage?<img className="qr-image" src={qrImage} alt="Mobile upload QR code"/>:<div className="qr-pattern">{token.slice(0,12).split('').map((x,i)=><span key={i} style={{opacity:(x.charCodeAt(0)%5+2)/6}}/> )}</div>}<strong>{token||'Generating…'}</strong><small>Scan with AyushCare Mobile. This QR expires automatically after 45 seconds.</small></div><div className="document-panel"><div className="panel-title"><span>{t('documents')}</span><button className="icon-button" onClick={()=>pair&&kioskApi.mobileDocuments(pair.id).then(d=>setDocs(d||[]))}><RefreshCw size={17}/></button></div>{docs.length===0?<p className="muted">{t('noDocuments')}</p>:docs.map(d=><div className="doc-row" key={d.id}><CheckCircle2 size={18}/><span>{d.document_type||d.file_path_hash?.split('/').pop()||'Document'}</span><small>{d.status}</small></div>)}<button className="secondary-btn" onClick={makePair} disabled={loading}>{loading?<Loader2 className="spin"/>:<Smartphone size={18}/>} {t('refresh')}</button></div></div><button className="primary-btn wide" onClick={sync}>{docs.length?t('continue'):t('skip')}</button>{error&&<div className="error-box">{error}</div>}</section>
}
