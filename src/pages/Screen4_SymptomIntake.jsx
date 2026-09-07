import React,{useEffect,useRef,useState,useCallback} from 'react';
import { Mic, Send, Loader2, Square } from 'lucide-react';
import { kioskApi,getErrorMessage } from '../services/api';
import { useKioskStore } from '../store/useKioskStore';
import { useTranslation } from '../hooks/useTranslation';
import AudioButton from '../components/common/AudioButton';
import KioskInput from '../components/common/KioskInput';

export default function Screen4_SymptomIntake(){
 const {sessionData,language,updateSession,nextScreen}=useKioskStore();
 const {t}=useTranslation();
 const [question,setQuestion]=useState(sessionData.currentQuestion);
 const [answer,setAnswer]=useState('');
 const [multiAnswer,setMultiAnswer]=useState([]);
 const [history,setHistory]=useState(sessionData.questionHistory||[]);
 const [loading,setLoading]=useState(false);
 const [error,setError]=useState('');
 const [complete,setComplete]=useState(false);
 const [recording,setRecording]=useState(false);
 const recorder=useRef(null);
 const chunks=useRef([]);
 const streamRef=useRef(null);

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

 const isMultiSelect=Boolean(question?.multiple || question?.multi_select || question?.multiSelect || question?.selection_mode==='multiple' || question?.answer_type==='multi_select' || question?.input_mode==='multi_select');
 const applyResult=(r,answerText,inputMode)=>{
   const item={question,answer:answerText,input_mode:inputMode};
   const h=[...history,item];
   setHistory(h);
   setAnswer('');
   setMultiAnswer([]);
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
   if(!question)return;
   const answerText=isMultiSelect ? JSON.stringify(multiAnswer) : answer.trim();
   if(!answerText || (isMultiSelect && !multiAnswer.length))return;
   setLoading(true);
   setError('');
   try{
     let r=await kioskApi.answer(sessionData.consultationId,{
       question_id:question.question_id,
       answer:answerText,
       input_mode:isMultiSelect ? 'multi_select' : 'text',
       confidence:1
     });
     if(r && !r.next_question && !r.is_complete){
       try{
         const state=await kioskApi.dialogueState(sessionData.consultationId);
         r={...r,next_question:state?.next_question||state?.current_question||null,is_complete:Boolean(state?.is_complete)};
       }catch{}
     }
     applyResult(r,answerText,'text');
   }catch(e){
     setError(getErrorMessage(e));
   }finally{
     setLoading(false);
   }
 };

 // -- Hold-to-speak: start recording on press, stop + send on release --
 const startRecording=useCallback(async()=>{
   if(recording || loading)return;
   try{
     const stream=await navigator.mediaDevices.getUserMedia({audio:true});
     streamRef.current=stream;
     const mr=new MediaRecorder(stream);
     chunks.current=[];
     mr.ondataavailable=e=>e.data.size&&chunks.current.push(e.data);
     mr.onstop=async()=>{
       stream.getTracks().forEach(t=>t.stop());
       streamRef.current=null;
       setRecording(false);
       if(chunks.current.length===0)return;
       setLoading(true);
       try{
         const blob=new Blob(chunks.current,{type:mr.mimeType||'audio/webm'});
         let r=await kioskApi.speech(sessionData.consultationId,question.question_id,language,blob);
         // If speech processing returns no next question, recover the canonical
         // conversation state instead of ending the interview accidentally.
         if(r && !r.next_question && !r.is_complete){
           try{
             const state=await kioskApi.dialogueState(sessionData.consultationId);
             r={...r,next_question:state?.next_question||state?.current_question||null,is_complete:Boolean(state?.is_complete)};
           }catch{}
         }
         // The speech endpoint returns a ConversationTurnResponse.
         // answer_confirmed contains the transcribed text; next_question has the follow-up.
         const transcript=r?.answer_confirmed||r?.transcript||r?.answer||'';
         if(transcript){
           setAnswer(transcript);
         }
         // Only apply the result if we got a valid response with next_question or is_complete
         if(r && (r.next_question !== undefined || r.is_complete !== undefined)){
           applyResult(r,transcript,'speech');
         } else if(!transcript){
           setError('Could not understand the speech. Please try again or type your answer.');
         }
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
 },[recording,loading,sessionData.consultationId,question,language]);

 const stopRecording=useCallback(()=>{
   if(recorder.current && recorder.current.state==='recording'){
     recorder.current.stop();
   }
 },[]);

 // Clean up stream on unmount
 useEffect(()=>{
   return ()=>{
     if(streamRef.current){
       streamRef.current.getTracks().forEach(t=>t.stop());
     }
   };
 },[]);

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
         <AudioButton textToRead={question.prompt_local||question.prompt} label={t('speak') || 'Speak'}/>
       </div>
       {question.helper&&<p className="helper">{question.helper}</p>}
       {question.options?.length>0&&
         <>
           {isMultiSelect&&<p className="multi-select-hint">Select all options that apply.</p>}
           <div className="option-grid">
             {question.options.map(o=>{
               const value=String(o.value);
               const selectedOption=isMultiSelect ? multiAnswer.includes(value) : answer===value;
               return (
                 <button key={value} className={selectedOption?'selected':''} onClick={()=>{
                   if(isMultiSelect){
                     setMultiAnswer(prev=>prev.includes(value)?prev.filter(x=>x!==value):[...prev,value]);
                   }else{
                     setAnswer(value);
                   }
                 }}>
                   {o.label_local||o.label}
                 </button>
               );
             })}
           </div>
         </>
       }
       {(!question.options||question.options.length===0)&&
         <KioskInput id={`ai-answer-${question.question_id}`} value={answer} onChange={setAnswer} multiline label="Your answer" placeholder={t('typeAnswer')} />
       }
       <div className="answer-actions">
         <button
           className={`secondary-btn hold-to-speak-btn ${recording?'recording':''}`}
           onMouseDown={startRecording}
           onMouseUp={stopRecording}
           onMouseLeave={stopRecording}
           onTouchStart={(e)=>{e.preventDefault();startRecording();}}
           onTouchEnd={(e)=>{e.preventDefault();stopRecording();}}
           disabled={loading}
         >
           {recording?<><Mic size={17} className="pulse-mic"/>{t('releaseToSend') || 'Release to send'}</>:<><Mic size={17}/>{t('speak') || 'Speak'}</>}
         </button>
         {!recording && <small className="hold-hint">{t('holdToSpeak') || 'Hold to speak'}</small>}
         <button className="primary-btn" disabled={loading||(isMultiSelect ? !multiAnswer.length : !answer.trim())} onClick={submit}>
           {loading?<Loader2 className="spin"/>:<Send size={18}/>} {t('submit')}
         </button>
       </div>
     </div>
   }

   {loading&&!question&&<div className="loading-line"><Loader2 className="spin"/> {t('loading')}</div>}
   {error&&<div className="error-box">{error}</div>}
 </section>
}

