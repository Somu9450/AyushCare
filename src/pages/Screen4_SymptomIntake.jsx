import React,{useEffect,useRef,useState} from 'react';
import { Mic, Send, Loader2, Square } from 'lucide-react';
import { kioskApi,getErrorMessage } from '../services/api';
import { useKioskStore } from '../store/useKioskStore';
import { useTranslation } from '../hooks/useTranslation';
import AudioButton from '../components/common/AudioButton';

export default function Screen4_SymptomIntake(){
 const {sessionData,language,updateSession,nextScreen}=useKioskStore();
 const {t}=useTranslation();
 const [question,setQuestion]=useState(sessionData.currentQuestion);
 const [answer,setAnswer]=useState('');
 const [history,setHistory]=useState(sessionData.questionHistory||[]);
 const [loading,setLoading]=useState(false);
 const [error,setError]=useState('');
 const [complete,setComplete]=useState(false);
 const [recording,setRecording]=useState(false);
 const recorder=useRef(null);
 const chunks=useRef([]);

 useEffect(()=>{
   const container=document.querySelector('.kiosk-main-scroll');
   if(container) container.scrollTo({top:0, behavior:'smooth'});
 },[question?.question_id]);

 useEffect(()=>{
   if(!sessionData.consultationId)return;

   // Safety guard: consent must be stored locally before the UI attempts
   // to start the AI conversation. The backend also enforces this rule.
   if(!sessionData.consent?.clinical_intake){
     setError('Clinical intake consent is required before starting the interview.');
     return;
   }

   setLoading(true);
   kioskApi.startDialogue(sessionData.consultationId)
     .then(r=>{
       const q=r?.next_question||r?.current_question;
       setQuestion(q);
       updateSession({
         currentQuestion:q,
         progress:r?.progress_percent||0,
         redFlags:r?.red_flags||[]
       });
     })
     .catch(e=>setError(getErrorMessage(e)))
     .finally(()=>setLoading(false));
 },[sessionData.consultationId,sessionData.consent?.clinical_intake,updateSession]);

 const applyResult=(r,answerText,inputMode)=>{
   const item={question,answer:answerText,input_mode:inputMode};
   const h=[...history,item];
   setHistory(h);
   setAnswer('');
   setQuestion(r?.next_question||null);
   updateSession({
     currentQuestion:r?.next_question||null,
     questionHistory:h,
     progress:r?.progress_percent||0,
     redFlags:r?.red_flags||[],
     isComplete:!!r?.is_complete
   });
   if(r?.is_complete)setComplete(true);
 };

 const submit=async()=>{
   if(!question||!answer.trim())return;
   setLoading(true);
   setError('');
   try{
     const r=await kioskApi.answer(sessionData.consultationId,{
       question_id:question.question_id,
       answer:answer.trim(),
       input_mode:'text',
       confidence:1
     });
     applyResult(r,answer.trim(),'text');
   }catch(e){
     setError(getErrorMessage(e));
   }finally{
     setLoading(false);
   }
 };

 const toggleRecording=async()=>{
   if(recording){recorder.current?.stop();return}
   try{
     const stream=await navigator.mediaDevices.getUserMedia({audio:true});
     const mr=new MediaRecorder(stream);
     chunks.current=[];
     mr.ondataavailable=e=>e.data.size&&chunks.current.push(e.data);
     mr.onstop=async()=>{
       stream.getTracks().forEach(t=>t.stop());
       setRecording(false);
       setLoading(true);
       try{
         const blob=new Blob(chunks.current,{type:mr.mimeType||'audio/webm'});
         const r=await kioskApi.speech(sessionData.consultationId,question.question_id,language,blob);
         const transcript=r?.transcript||r?.answer||'';
         if(transcript)setAnswer(transcript);
         applyResult(r,transcript,'speech');
       }catch(e){
         setError(getErrorMessage(e));
       }finally{
         setLoading(false);
       }
     };
     recorder.current=mr;
     mr.start();
     setRecording(true);
   }catch(e){
     setError('Microphone access is unavailable. You can type your answer instead.');
   }
 };

 return <section className="screen-card interview">
   <div className="section-head">
     <div>
       <p className="eyebrow">04 • {t('interview')}</p>
       <h2>{t('interview')}</h2>
       <p>{t('interviewHelp')}</p>
     </div>
     <div className="progress-ring">{Math.round(sessionData.progress||0)}%</div>
   </div>

   {history.slice(-3).map((h,i)=>
     <div className="answer-history" key={i}>
       <small>{h.question?.prompt_local||h.question?.prompt}</small>
       <p>{h.answer||'—'}</p>
     </div>
   )}

   {sessionData.redFlags?.length>0&&
     <div className="emergency-box">{t('emergency')}</div>
   }

   {complete||!question?
     <div className="complete-panel">
       <h3>{t('done')}</h3>
       <p>{t('summary')}</p>
       <button className="primary-btn" onClick={nextScreen}>{t('continue')}</button>
     </div>
     :
     <div className="question-box">
       <div className="question-top">
         <div className="question-text">{question.prompt_local||question.prompt}</div>
         <AudioButton textToRead={question.prompt_local||question.prompt} label={t('listen')}/>
       </div>
       {question.helper&&<p className="helper">{question.helper}</p>}
       {question.options?.length>0&&
         <div className="option-grid">
           {question.options.map(o=>
             <button key={o.value} className={answer===o.value?'selected':''} onClick={()=>setAnswer(o.value)}>
               {o.label_local||o.label}
             </button>
           )}
         </div>
       }
       {(!question.options||question.options.length===0)&&
         <textarea value={answer} onChange={e=>setAnswer(e.target.value)} placeholder={t('typeAnswer')}/>
       }
       <div className="answer-actions">
         <button className={`secondary-btn ${recording?'recording':''}`} onClick={toggleRecording} disabled={loading}>
           {recording?<><Square size={17}/>{t('listening')}</>:<><Mic size={17}/>{t('listen')}</>}
         </button>
         <button className="primary-btn" disabled={loading||!answer.trim()} onClick={submit}>
           {loading?<Loader2 className="spin"/>:<Send size={18}/>} {t('submit')}
         </button>
       </div>
     </div>
   }

   {loading&&!question&&<div className="loading-line"><Loader2 className="spin"/> {t('loading')}</div>}
   {error&&<div className="error-box">{error}</div>}
 </section>
}
