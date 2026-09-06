import React, { useState } from 'react';
import { Volume2, Loader2 } from 'lucide-react';
import { kioskApi } from '../../services/api';
import { useKioskStore } from '../../store/useKioskStore';
export default function AudioButton({ textToRead, label='Listen' }) {
 const { language, sessionData, audioEnabled }=useKioskStore(); const [loading,setLoading]=useState(false);
 const speak=async()=>{ if(!audioEnabled||!textToRead)return; setLoading(true); try { const r=await kioskApi.tts(sessionData.consultationId,textToRead,language); const data=r?.audio_base64||r?.audio?.base64; if(data){ const audio=new Audio(`data:${r?.mime_type||'audio/wav'};base64,${data}`); await audio.play(); } else if(window.speechSynthesis){ window.speechSynthesis.cancel(); window.speechSynthesis.speak(new SpeechSynthesisUtterance(textToRead)); } } catch { if(window.speechSynthesis) window.speechSynthesis.speak(new SpeechSynthesisUtterance(textToRead)); } finally { setLoading(false); } };
 return <button className="audio-btn" onClick={speak}>{loading?<Loader2 className="spin" size={16}/>:<Volume2 size={16}/>} {label}</button>;
}
