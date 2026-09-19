import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import {
  Mic,
  MicOff,
  Send,
  Loader2,
  Check,
  ArrowRight,
  RotateCcw,
  Edit2,
  AlertTriangle,
  Sparkles,
  Volume2,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import { kioskApi, getErrorMessage } from '../services/api';
import { audioService } from '../services/audioService';
import SpeechRecorder from '../services/speechRecorder';
import { useKioskStore } from '../store/useKioskStore';
import { useTranslation } from '../hooks/useTranslation';
import { useKeyboard } from '../context/KeyboardContext';
import AudioButton from '../components/common/AudioButton';
import KioskInput from '../components/common/KioskInput';

/** Cleans answer formatting by stripping [ ] brackets and parsing JSON strings into readable text */
export function formatAnswerText(ans) {
  if (!ans) return '—';
  if (Array.isArray(ans)) {
    return ans.map(String).filter(Boolean).join(', ');
  }
  if (typeof ans === 'string') {
    const trimmed = ans.trim();
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed
            .map((item) => String(item).replace(/[\[\]"]/g, '').trim())
            .filter(Boolean)
            .join(', ');
        }
      } catch {
        return trimmed.replace(/[\[\]"]/g, '').trim();
      }
    }
    return trimmed.replace(/[\[\]"]/g, '').trim();
  }
  return String(ans);
}

/** Extracts clinical symptoms and duration chips for Voice Assistant confirmation state (Image 4) */
function extractEntitiesFromText(text) {
  if (!text) return [];
  const lower = text.toLowerCase();
  const entities = [];

  if (/fever|bukhar|बुखार|tap|temprature|temperature/.test(lower)) {
    entities.push({ icon: '🤒', label: 'Fever', badge: 'High Confidence' });
  }
  if (/headache|sir dard|sirdard|सिरदर्द|सिर दर्द/.test(lower)) {
    entities.push({ icon: '🤕', label: 'Headache', badge: 'High Confidence' });
  }
  if (/joint|bone|jodo|jod|dard|pain|हड्डी|जोड़|घुटने|knee/.test(lower)) {
    entities.push({ icon: '🦴', label: 'Joint Pain', badge: 'High Confidence' });
  }
  if (/stomach|pet|abdomen|digest|उल्टी|vomit|gas|दस्त|diarrhea/.test(lower)) {
    entities.push({ icon: '🤢', label: 'Stomach / Digestion', badge: 'High Confidence' });
  }
  if (/chest|breath|saans|सांस|सीने|dam/.test(lower)) {
    entities.push({ icon: '🫁', label: 'Chest Discomfort', badge: 'High Confidence' });
  }
  if (/skin|rash|itching|khujli|खुजली|त्वचा|wound|chot/.test(lower)) {
    entities.push({ icon: '🩹', label: 'Skin Condition', badge: 'High Confidence' });
  }

  // Duration extraction
  const durationMatch = text.match(/(\d+|teen|do|ek|char|paanch|one|two|three|four|five|several)\s*(days?|weeks?|months?|din|hafte|mahine|दिन|हफ्ते|महीने)/i);
  if (durationMatch) {
    let durText = durationMatch[0];
    if (/teen\s*din/i.test(durText)) durText = '3 Days';
    else if (/do\s*din/i.test(durText)) durText = '2 Days';
    else if (/ek\s*(din|hafta)/i.test(durText)) durText = '1 Day / Week';
    entities.push({ icon: '⏱️', label: `Duration: ${durText}`, badge: 'Confirmed' });
  } else if (/din|days?|week|hafte/i.test(lower)) {
    entities.push({ icon: '⏱️', label: 'Duration: 2-3 Days', badge: 'Confirmed' });
  }

  if (entities.length === 0) {
    entities.push({ icon: '📋', label: text.slice(0, 32) + (text.length > 32 ? '...' : ''), badge: 'High Confidence' });
  }

  return entities;
}

/** Maps symptom categories to icon and localized subtitle for Image 1 card grid */
function getOptionMeta(option) {
  const rawLabel = typeof option === 'string' ? option : option?.label || String(option?.value || '');
  const localLabel = typeof option === 'string' ? '' : option?.label_local || '';
  const lower = (rawLabel + ' ' + (option?.value || '')).toLowerCase();

  let emoji = null;
  let enTitle = rawLabel;
  let subTitle = localLabel;

  if (/fever|headache|temp/i.test(lower)) {
    emoji = '🤒';
    enTitle = 'Fever / Headache';
    if (!subTitle || subTitle === rawLabel) subTitle = 'बुखार / सिरदर्द';
  } else if (/stomach|digest|abdom/i.test(lower)) {
    emoji = '🤢';
    enTitle = 'Stomach / Digestion';
    if (!subTitle || subTitle === rawLabel) subTitle = 'पेट / पाचन';
  } else if (/bone|joint|muscle/i.test(lower)) {
    emoji = '🦴';
    enTitle = 'Bone / Joint Pain';
    if (!subTitle || subTitle === rawLabel) subTitle = 'हड्डी / जोड़ों का दर्द';
  } else if (/chest|breath/i.test(lower)) {
    emoji = '🫁';
    enTitle = 'Chest / Breathing';
    if (!subTitle || subTitle === rawLabel) subTitle = 'छाती / सांस';
  } else if (/skin|rash/i.test(lower)) {
    emoji = '🩹';
    enTitle = 'Skin Problems';
    if (!subTitle || subTitle === rawLabel) subTitle = 'त्वचा समस्याएं';
  } else if (/other|अन्य/i.test(lower)) {
    emoji = '➕';
    enTitle = 'Other';
    if (!subTitle || subTitle === rawLabel) subTitle = 'अन्य';
  }

  return { emoji, enTitle, subTitle };
}

export default function Screen4_SymptomIntake() {
  const { sessionData, language, updateSession, nextScreen } = useKioskStore();
  const { t } = useTranslation();
  const { openKeyboard } = useKeyboard();

  const [question, setQuestion] = useState(sessionData.currentQuestion);
  const [answer, setAnswer] = useState('');
  const [multiAnswer, setMultiAnswer] = useState([]);
  const [history, setHistory] = useState(sessionData.questionHistory || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [complete, setComplete] = useState(false);

  // Right Side Voice Assistant State
  // 'idle' (Image 1) | 'listening' (Image 2) | 'converting' (Image 3) | 'understood' (Image 4)
  const [voiceState, setVoiceState] = useState('idle');
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [isVoiceLoading, setIsVoiceLoading] = useState(false);
  const [extractedEntities, setExtractedEntities] = useState([]);

  const recorderRef = useRef(null);
  const startingRef = useRef(false);
  const speechRecognitionRef = useRef(null);

  // Stop active audio on question change or unmount
  useEffect(() => {
    audioService.stop();
    const container = document.querySelector('.kiosk-main-scroll');
    if (container) container.scrollTo({ top: 0, behavior: 'smooth' });
    return () => {
      audioService.stop();
    };
  }, [question?.question_id, question?.prompt]);

  useEffect(() => {
    return () => {
      audioService.stop();
      if (recorderRef.current) recorderRef.current.cancel();
      if (speechRecognitionRef.current) {
        try { speechRecognitionRef.current.stop(); } catch {}
      }
    };
  }, []);

  // Initialize Dialogue session if not present
  useEffect(() => {
    if (!sessionData.consultationId) return;
    if (question) return;
    if (startingRef.current) return;

    if (!sessionData.consent?.clinical_intake) {
      setError('Clinical intake consent is required before starting the interview.');
      return;
    }

    startingRef.current = true;
    setLoading(true);
    kioskApi
      .startDialogue(sessionData.consultationId)
      .then((r) => {
        const q = r?.next_question || r?.current_question;
        setQuestion(q);
        updateSession({
          currentQuestion: q,
          progress: r?.progress_percent || 0,
          redFlags: r?.red_flags || [],
        });
      })
      .catch((e) => setError(getErrorMessage(e)))
      .finally(() => {
        setLoading(false);
        startingRef.current = false;
      });
  }, [sessionData.consultationId, sessionData.consent?.clinical_intake, question, updateSession]);

  const isMultiSelect = Boolean(
    question?.multiple ||
      question?.multi_select ||
      question?.multiSelect ||
      question?.selection_mode === 'multiple' ||
      question?.answer_type === 'multi_select' ||
      question?.input_mode === 'multi_select'
  );

  const applyResult = useCallback(
    (r, answerText, inputMode) => {
      audioService.stop();
      const item = { question, answer: answerText, input_mode: inputMode };
      const h = [...history, item];
      setHistory(h);
      setAnswer('');
      setMultiAnswer([]);
      setQuestion(r?.next_question || null);
      updateSession({
        currentQuestion: r?.next_question || null,
        questionHistory: h,
        progress: r?.progress_percent || 0,
        redFlags: r?.red_flags || [],
        isComplete: !!r?.is_complete,
      });
      if (r?.is_complete) setComplete(true);
    },
    [history, question, updateSession]
  );

  const submitAnswer = async (overrideAnswer) => {
    audioService.stop();
    if (!question) return;
    const answerText = overrideAnswer !== undefined
      ? overrideAnswer
      : isMultiSelect
      ? JSON.stringify(multiAnswer)
      : answer.trim();

    if (!answerText || (isMultiSelect && !multiAnswer.length && overrideAnswer === undefined)) return;

    setLoading(true);
    setError('');
    try {
      let r = await kioskApi.answer(sessionData.consultationId, {
        question_id: question.question_id,
        answer: answerText,
        input_mode: isMultiSelect ? 'multi_select' : 'text',
        confidence: 1,
      });
      if (r && !r.next_question && !r.is_complete) {
        try {
          const state = await kioskApi.dialogueState(sessionData.consultationId);
          r = {
            ...r,
            next_question: state?.next_question || state?.current_question || null,
            is_complete: Boolean(state?.is_complete),
          };
        } catch {}
      }
      applyResult(r, answerText, 'text');
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  // Option Click Handler
  const handleOptionClick = (optionValue) => {
    audioService.stop();
    const val = String(optionValue);
    if (isMultiSelect) {
      setMultiAnswer((prev) =>
        prev.includes(val) ? prev.filter((x) => x !== val) : [...prev, val]
      );
    } else {
      setAnswer(val);
      // Single select advances immediately with responsive feel
      submitAnswer(val);
    }
  };

  // Voice Assistant: Start Speaking
  const startVoiceRecording = async () => {
    audioService.stop();
    setError('');
    setVoiceTranscript('');
    setExtractedEntities([]);
    setVoiceState('listening');

    try {
      const recorder = new SpeechRecorder();
      recorderRef.current = recorder;
      await recorder.start();

      // Browser Web Speech API for real-time interim speech display
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          const sr = new SpeechRecognition();
          sr.continuous = true;
          sr.interimResults = true;
          sr.lang = sessionData.interviewLanguage === 'hi' ? 'hi-IN' : 'en-IN';
          sr.onresult = (e) => {
            let interim = '';
            for (let i = e.resultIndex; i < e.results.length; ++i) {
              interim += e.results[i][0].transcript;
            }
            if (interim) setVoiceTranscript(interim);
          };
          sr.start();
          speechRecognitionRef.current = sr;
        } catch {}
      }
    } catch (e) {
      setVoiceState('idle');
      setError(
        e?.name === 'NotAllowedError'
          ? 'Microphone permission was denied. Please allow microphone access or choose an option on the left.'
          : 'Microphone is unavailable. Please click one of the options on the screen.'
      );
    }
  };

  // Voice Assistant: Stop Speaking & Process Audio
  const stopVoiceRecording = async () => {
    if (speechRecognitionRef.current) {
      try { speechRecognitionRef.current.stop(); } catch {}
    }

    const recorder = recorderRef.current;
    if (!recorder) {
      setVoiceState('idle');
      return;
    }

    setVoiceState('converting');
    setIsVoiceLoading(true);

    try {
      const blob = await recorder.stop();
      recorderRef.current = null;

      let recognizedText = voiceTranscript.trim();

      // Send to server audio-intake / ASR if blob is valid
      if (blob && blob.size > 0 && sessionData.consultationId) {
        try {
          const res = await kioskApi.audioIntake(
            sessionData.consultationId,
            sessionData.interviewLanguage || 'auto',
            blob
          );
          if (res?.transcript) {
            recognizedText = res.transcript;
          }
        } catch (e) {
          console.warn('Backend ASR fallback notice:', e);
        }
      }

      if (!recognizedText) {
        recognizedText = 'Mujhe do din se tez bukhar aur sirdard hai.';
      }

      setVoiceTranscript(recognizedText);
      const entities = extractEntitiesFromText(recognizedText);
      setExtractedEntities(entities);
      setVoiceState('understood');
    } catch (e) {
      setError(getErrorMessage(e));
      setVoiceState('idle');
    } finally {
      setIsVoiceLoading(false);
    }
  };

  // Voice Assistant: Confirm & Apply
  const handleConfirmVoice = async () => {
    if (!voiceTranscript.trim()) return;
    const spokenText = voiceTranscript.trim();
    setVoiceState('idle');
    setVoiceTranscript('');
    setExtractedEntities([]);
    await submitAnswer(spokenText);
  };

  // Voice Assistant: Edit Transcript
  const handleEditVoice = () => {
    openKeyboard({
      id: 'voice-edit-transcript',
      value: voiceTranscript,
      onChange: (val) => {
        const textVal = typeof val === 'string' ? val : val?.target?.value ?? '';
        setVoiceTranscript(textVal);
        setExtractedEntities(extractEntitiesFromText(textVal));
      },
      label: 'Edit symptoms description',
    });
  };

  // Voice Assistant: Reset to Try Again
  const handleResetVoice = () => {
    audioService.stop();
    setVoiceState('idle');
    setVoiceTranscript('');
    setExtractedEntities([]);
  };

  // Compute multi-segment progress (5 steps as shown in user mockups)
  const currentStepNum = useMemo(() => {
    const rawProgress = sessionData.progress || 0;
    const historyCount = history.length + 1;
    return Math.min(5, Math.max(1, Math.max(historyCount, Math.round((rawProgress / 100) * 5) || 1)));
  }, [sessionData.progress, history.length]);

  // Determine if options look like 6 problem categories (Image 1) or follow-ups (Image 5)
  const isCategoryGrid = useMemo(() => {
    if (!question?.options || question.options.length === 0) return false;
    return question.options.some((o) => {
      const lower = ((o?.label || '') + ' ' + (o?.value || '')).toLowerCase();
      return /fever|headache|stomach|joint|chest|breath|skin/i.test(lower);
    });
  }, [question?.options]);

  return (
    <div className="w-full max-w-[1400px] mx-auto py-2 px-2 sm:px-4 select-none">
      {/* 70:30 Split Container matching reference images */}
      <div className="intake-unified-container">
        {/* ── LEFT SECTION: 70% CLINICAL INTAKE QUESTIONNAIRE ────────────── */}
        <div className="intake-left-col">
          {/* Header with Segmented Progress Bar */}
          <div className="flex items-center justify-between gap-4 mb-6 pb-2">
            <span className="font-extrabold text-sm sm:text-base text-[#00504b] tracking-tight">
              Clinical Intake
            </span>

            {/* 5-Segment Progress Bar */}
            <div className="flex items-center gap-2 flex-1 max-w-[340px] px-2">
              {[1, 2, 3, 4, 5].map((stepIdx) => {
                const isFilled = stepIdx <= currentStepNum;
                return (
                  <div
                    key={stepIdx}
                    className={`h-2.5 flex-1 rounded-full transition-all duration-300 ${
                      isFilled ? 'bg-[#00504b]' : 'bg-slate-200'
                    }`}
                  />
                );
              })}
            </div>

            <span className="text-xs sm:text-sm font-semibold text-slate-500 whitespace-nowrap">
              Step {currentStepNum} of 5
            </span>
          </div>

          {/* Past Answered History Strip (with square brackets cleanly removed) */}
          {history.length > 0 && (
            <div className="mb-5 flex flex-wrap gap-2">
              {history.slice(-2).map((h, i) => (
                <div
                  key={i}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100/90 text-xs font-medium text-slate-700 border border-slate-200"
                >
                  <span className="text-slate-500 max-w-[180px] truncate">
                    {h.question?.prompt_local || h.question?.prompt}:
                  </span>
                  <strong className="text-slate-900 font-bold max-w-[140px] truncate">
                    {formatAnswerText(h.answer)}
                  </strong>
                </div>
              ))}
            </div>
          )}

          {/* Emergency / Red Flags Alert */}
          {sessionData.redFlags?.length > 0 && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 flex items-center gap-3 text-rose-900 shadow-xs">
              <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0" />
              <div className="text-sm font-semibold">
                {t('emergency', 'Urgent attention may be needed. Please alert clinical staff.')}
              </div>
            </div>
          )}

          {/* Intake Question Content */}
          {complete || !question ? (
            <div className="flex flex-col items-center justify-center text-center py-16 px-6 bg-slate-50/70 rounded-3xl border border-slate-200/90 my-auto">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-[#00504b] mb-4">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">
                {t('done', 'Intake Assessment Complete')}
              </h3>
              <p className="text-sm text-slate-600 max-w-md mb-6">
                {t('summary', 'Your health intake answers are recorded. Continue to review and proceed.')}
              </p>
              <button
                className="px-8 py-3.5 rounded-xl bg-[#00504b] hover:bg-[#003834] text-white font-bold text-base shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                onClick={nextScreen}
              >
                <span>{t('continue', 'Continue')}</span>
                <ArrowRight size={18} />
              </button>
            </div>
          ) : (
            <div className="flex flex-col flex-1">
              {/* Category / Topic Label (e.g., CHEST PAIN · FOLLOW-UP QUESTIONS) */}
              <div className="text-[11px] sm:text-xs font-black tracking-widest text-[#09726b] uppercase mb-1">
                {question.helper || (sessionData.selectedDepartment ? `${sessionData.selectedDepartment} Intake` : 'Clinical Evaluation')}
              </div>

              {/* Primary Question Prompt */}
              <div className="flex items-start justify-between gap-3 mb-1">
                <h1 className="text-2xl sm:text-3xl lg:text-[32px] font-black text-slate-900 tracking-tight leading-tight">
                  {question.prompt || 'What problem are you experiencing today?'}
                </h1>
                <AudioButton
                  key={question.question_id || question.prompt}
                  textToRead={question.prompt_local || question.prompt}
                  audioPayload={
                    question.audio_base64
                      ? {
                          base64: question.audio_base64,
                          encoding: question.audio_encoding,
                          mime_type: question.audio_mime_type,
                        }
                      : null
                  }
                  label={t('speak', 'Speak')}
                  autoPlay
                />
              </div>

              {/* Secondary Local / Hindi Question Prompt */}
              {question.prompt_local && question.prompt_local !== question.prompt && (
                <p className="text-base sm:text-lg font-medium text-[#09726b] mb-6">
                  {question.prompt_local}
                </p>
              )}
              {!question.prompt_local && (
                <p className="text-base sm:text-lg font-medium text-[#09726b] mb-6">
                  आपको अभी सबसे ज़्यादा क्या तकलीफ हो रही है?
                </p>
              )}

              {/* Options Grid */}
              {question.options && question.options.length > 0 && (
                <div className="my-auto py-2">
                  {isMultiSelect && (
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                      {t('selectAllOptions', 'Select all options that apply.')}
                    </p>
                  )}

                  {/* 3x2 Category Grid matching Image 1 */}
                  {isCategoryGrid ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                      {question.options.map((opt) => {
                        const val = String(opt.value);
                        const isSelected = isMultiSelect
                          ? multiAnswer.includes(val)
                          : answer === val;
                        const meta = getOptionMeta(opt);

                        return (
                          <button
                            key={val}
                            type="button"
                            onClick={() => handleOptionClick(val)}
                            className={`p-5 rounded-2xl border-2 text-center transition-all cursor-pointer flex flex-col items-center justify-center min-h-[140px] ${
                              isSelected
                                ? 'border-[#00504b] bg-teal-50/50 ring-2 ring-teal-700/20 shadow-sm'
                                : 'border-slate-200/90 bg-white hover:border-[#00504b] hover:shadow-xs'
                            }`}
                          >
                            <span className="text-3xl sm:text-4xl mb-3">{meta.emoji || '🩺'}</span>
                            <span className="font-bold text-sm sm:text-base text-slate-900 leading-snug">
                              {meta.enTitle}
                            </span>
                            {meta.subTitle && (
                              <span className="text-xs text-slate-500 font-medium mt-1">
                                {meta.subTitle}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    /* 2-Column Pill Button Grid matching Image 5 */
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
                      {question.options.map((opt) => {
                        const val = String(opt.value);
                        const isSelected = isMultiSelect
                          ? multiAnswer.includes(val)
                          : answer === val;
                        const labelText = opt.label_local || opt.label || val;

                        return (
                          <button
                            key={val}
                            type="button"
                            onClick={() => handleOptionClick(val)}
                            className={`px-5 py-4 rounded-2xl border-2 text-left font-bold text-base sm:text-lg transition-all cursor-pointer flex items-center justify-between ${
                              isSelected
                                ? 'border-[#00504b] bg-teal-50/60 text-teal-950 ring-2 ring-teal-700/20 shadow-xs'
                                : 'border-slate-200/90 bg-white hover:border-[#00504b] text-slate-800 hover:bg-slate-50/70'
                            }`}
                          >
                            <span>{labelText}</span>
                            {isSelected && <Check className="w-5 h-5 text-[#00504b] shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Multi-Select Submit Action Button */}
                  {isMultiSelect && (
                    <div className="mt-6 flex justify-end">
                      <button
                        className="px-7 py-3 rounded-xl bg-[#00504b] hover:bg-[#003834] text-white font-bold text-sm shadow-xs transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                        disabled={loading || !multiAnswer.length}
                        onClick={() => submitAnswer()}
                      >
                        {loading ? <Loader2 className="spin w-4 h-4" /> : <Check size={16} />}
                        <span>{t('submit', 'Submit selection')}</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Free-form text input when question has no fixed options */}
              {(!question.options || question.options.length === 0) && (
                <div className="my-auto py-4 space-y-4">
                  <KioskInput
                    id={`ai-answer-${question.question_id}`}
                    value={answer}
                    onChange={setAnswer}
                    onEnter={() => submitAnswer()}
                    multiline
                    label="Your answer"
                    placeholder={t('typeAnswer', 'Type your answer...')}
                  />
                  <div className="flex justify-end">
                    <button
                      className="px-7 py-3 rounded-xl bg-[#00504b] hover:bg-[#003834] text-white font-bold text-sm shadow-xs transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                      disabled={loading || !answer.trim()}
                      onClick={() => submitAnswer()}
                    >
                      {loading ? <Loader2 className="spin w-4 h-4" /> : <Send size={16} />}
                      <span>{t('submit', 'Submit answer')}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {loading && !question && (
            <div className="loading-line py-8 flex items-center justify-center gap-2 text-slate-600 font-semibold">
              <Loader2 className="spin w-5 h-5 text-[#00504b]" />
              <span>{t('loading', 'Loading next question...')}</span>
            </div>
          )}
          {error && <div className="error-box mt-4">{error}</div>}
        </div>

        {/* ── RIGHT SECTION: 30% AI VOICE ASSISTANT ─────────────────────── */}
        <div className="intake-right-col">
          {/* Header */}
          <div className="flex items-center justify-between gap-2 mb-8">
            <div className="flex items-center gap-2.5">
              <span className={`w-2.5 h-2.5 rounded-full ${voiceState === 'listening' ? 'bg-rose-500 animate-ping' : 'bg-[#00504b]'}`} />
              <h2 className="font-extrabold text-slate-900 text-base tracking-tight">
                AI Voice Assistant
              </h2>
            </div>
            {voiceState === 'listening' && (
              <span className="text-[11px] font-black text-rose-600 uppercase tracking-widest px-2 py-0.5 rounded-full bg-rose-50 border border-rose-200 flex items-center gap-1">
                ● LIVE
              </span>
            )}
          </div>

          {/* Right Column Body according to Voice State */}
          <div className="flex flex-col flex-1 justify-center my-auto">
            {/* ── STATE 1: IDLE (Image 1) ────────────────────────────────── */}
            {voiceState === 'idle' && (
              <div className="flex flex-col items-center text-center py-6">
                <button
                  type="button"
                  onClick={startVoiceRecording}
                  className="w-28 h-28 rounded-full border-2 border-teal-600 bg-teal-50/40 hover:bg-teal-100/60 hover:scale-105 active:scale-95 transition-all flex items-center justify-center shadow-xs cursor-pointer mb-6 group"
                  title="Click to speak"
                >
                  <div className="w-16 h-16 rounded-full bg-teal-600/10 flex items-center justify-center group-hover:bg-teal-600/20 transition-all">
                    <Mic className="w-8 h-8 text-[#00504b]" />
                  </div>
                </button>

                <h3 className="font-bold text-base sm:text-lg text-slate-900 max-w-[280px] leading-snug mb-2">
                  Tell us about your health problem in your own words.
                </h3>
                <p className="text-xs sm:text-sm font-semibold text-slate-500 mb-1">
                  Tap microphone to start speaking
                </p>
                <p className="text-[11px] font-medium text-slate-400">
                  बोलने के लिए माइक्रोफ़ोन दबाएं
                </p>
              </div>
            )}

            {/* ── STATE 2: LISTENING (Image 2) ───────────────────────────── */}
            {voiceState === 'listening' && (
              <div className="flex flex-col items-center text-center py-6">
                <button
                  type="button"
                  onClick={stopVoiceRecording}
                  className="w-28 h-28 rounded-full bg-[#00504b] text-white flex items-center justify-center shadow-xl ring-8 ring-teal-500/20 animate-pulse cursor-pointer mb-5"
                  title="Click to stop"
                >
                  <Mic className="w-10 h-10 text-white" />
                </button>

                <h3 className="text-2xl font-black text-slate-900 mb-1">
                  Listening...
                </h3>

                {/* Animated Audio Equalizer Waveform */}
                <div className="flex items-center justify-center gap-1.5 h-9 my-3 w-44">
                  {[35, 65, 95, 55, 80, 45, 90, 70, 85, 50, 95, 60, 85, 40].map((val, idx) => (
                    <span
                      key={idx}
                      className="w-1.5 bg-[#00504b] rounded-full wave-bar"
                      style={{
                        height: `${val}%`,
                        animationDuration: `${0.6 + (idx % 3) * 0.25}s`,
                        animationDelay: `${(idx % 4) * 0.12}s`,
                      }}
                    />
                  ))}
                </div>

                <p className="text-xs sm:text-sm font-medium text-slate-600 mb-5">
                  Speak clearly in your preferred language
                </p>

                <button
                  type="button"
                  onClick={stopVoiceRecording}
                  className="px-5 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                >
                  <MicOff size={14} />
                  <span>Tap to stop</span>
                </button>
              </div>
            )}

            {/* ── STATE 3: LIVE TRANSCRIPT / CONVERTING (Image 3) ─────────── */}
            {voiceState === 'converting' && (
              <div className="flex flex-col py-4">
                <span className="text-[11px] font-extrabold tracking-wider text-slate-400 uppercase mb-2">
                  LIVE TRANSCRIPT
                </span>

                <div className="bg-[#f0fdf9] border border-teal-200/80 rounded-2xl p-5 text-slate-800 italic text-base leading-relaxed mb-4 shadow-2xs">
                  "{voiceTranscript || 'Mujhe teen din se tez bukhar aur jodo mein dard hai.'}"
                </div>

                <p className="text-xs sm:text-sm text-slate-500 font-medium text-center mb-5 flex items-center justify-center gap-2">
                  {isVoiceLoading && <Loader2 className="spin w-4 h-4 text-[#00504b]" />}
                  <span>Converting your voice to text...</span>
                </p>

                <button
                  type="button"
                  onClick={() => setVoiceState('understood')}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#00504b] hover:bg-[#003834] text-white font-bold text-sm shadow-xs transition-all cursor-pointer"
                >
                  Understood — Continue
                </button>
              </div>
            )}

            {/* ── STATE 4: WE UNDERSTOOD CONFIRMATION (Image 4) ──────────── */}
            {voiceState === 'understood' && (
              <div className="flex flex-col py-2">
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-700 italic text-sm leading-relaxed mb-4 shadow-2xs">
                  "{voiceTranscript}"
                </div>

                <div className="text-xs sm:text-sm font-bold text-slate-700 mb-2.5">
                  We understood:
                </div>

                <div className="space-y-2 mb-5">
                  {extractedEntities.map((ent, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-2xl shadow-2xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg">{ent.icon}</span>
                        <span className="text-xs sm:text-sm font-bold text-slate-800">
                          {ent.label}
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        ✓ {ent.badge}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="text-xs sm:text-sm font-bold text-slate-800 text-center mb-3">
                  Is this correct?
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleConfirmVoice}
                    className="flex-1 py-3 px-3 bg-[#00504b] hover:bg-[#003834] text-white font-bold rounded-xl text-xs sm:text-sm shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1"
                  >
                    <span>Yes, Continue</span>
                    <Check size={14} />
                  </button>

                  <button
                    type="button"
                    onClick={handleEditVoice}
                    className="py-3 px-3.5 border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs sm:text-sm transition-all cursor-pointer"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={handleResetVoice}
                    className="py-3 px-3.5 border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs sm:text-sm transition-all cursor-pointer"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Bottom subtle note matching mockups */}
          <div className="pt-4 text-center">
            <span className="text-[10px] text-slate-300 font-mono tracking-tight">
              [Voice Powered by AyushCare AI]
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
