import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  CircleHelp,
  Clock3,
  Ear,
  HeartPulse,
  Keyboard,
  Leaf,
  Mic,
  MicOff,
  MessageSquareText,
  ShieldCheck,
  Stethoscope,
  Volume2,
  X,
} from 'lucide-react';
import { useKioskStore } from '../store/useKioskStore';
import AudioButton from '../components/common/AudioButton';

const SYMPTOM_GROUPS = [
  {
    id: 'general',
    label: 'General',
    icon: Activity,
    symptoms: [
      { id: 'fever', label: 'Fever', hi: 'बुखार', icon: '🌡️' },
      { id: 'fatigue', label: 'Weakness / Fatigue', hi: 'कमज़ोरी / थकान', icon: '😴' },
      { id: 'dizziness', label: 'Dizziness', hi: 'चक्कर', icon: '🌀' },
      { id: 'weight_loss', label: 'Unexplained Weight Loss', hi: 'अचानक वजन कम होना', icon: '⚖️' },
    ],
  },
  {
    id: 'head',
    label: 'Head & Neck',
    icon: Ear,
    symptoms: [
      { id: 'headache', label: 'Headache', hi: 'सिरदर्द', icon: '🤕' },
      { id: 'migraine', label: 'Migraine', hi: 'माइग्रेन', icon: '💫' },
      { id: 'neck_pain', label: 'Neck Pain', hi: 'गर्दन में दर्द', icon: '🧍' },
      { id: 'vision_problem', label: 'Vision Problem', hi: 'दृष्टि में समस्या', icon: '👁️' },
    ],
  },
  {
    id: 'chest',
    label: 'Chest & Breathing',
    icon: HeartPulse,
    symptoms: [
      { id: 'chest_pain', label: 'Chest Pain', hi: 'सीने में दर्द', icon: '❤️' },
      { id: 'breathlessness', label: 'Breathing Difficulty', hi: 'सांस लेने में तकलीफ', icon: '🫁' },
      { id: 'palpitations', label: 'Palpitations', hi: 'दिल की धड़कन तेज़ होना', icon: '💓' },
      { id: 'cough', label: 'Cough', hi: 'खांसी', icon: '😷' },
    ],
  },
  {
    id: 'abdomen',
    label: 'Stomach & Digestion',
    icon: Activity,
    symptoms: [
      { id: 'abdominal_pain', label: 'Stomach Pain', hi: 'पेट में दर्द', icon: '🤢' },
      { id: 'acidity', label: 'Acidity / Heartburn', hi: 'एसिडिटी / जलन', icon: '🔥' },
      { id: 'vomiting', label: 'Vomiting', hi: 'उल्टी', icon: '🤮' },
      { id: 'diarrhea', label: 'Loose Motions', hi: 'दस्त', icon: '🚽' },
    ],
  },
  {
    id: 'musculoskeletal',
    label: 'Bones & Joints',
    icon: Activity,
    symptoms: [
      { id: 'joint_pain', label: 'Joint Pain', hi: 'जोड़ों में दर्द', icon: '🦴' },
      { id: 'back_pain', label: 'Back Pain', hi: 'कमर / पीठ में दर्द', icon: '🔄' },
      { id: 'swelling', label: 'Swelling', hi: 'सूजन', icon: '🫳' },
      { id: 'stiffness', label: 'Stiffness', hi: 'जकड़न', icon: '🦵' },
    ],
  },
];

const DURATION_OPTIONS = [
  { id: 'today', label: 'Today', hi: 'आज' },
  { id: '2_3_days', label: '2–3 days', hi: '2–3 दिन' },
  { id: '1_week', label: 'About a week', hi: 'लगभग एक सप्ताह' },
  { id: '2_weeks', label: '2–4 weeks', hi: '2–4 सप्ताह' },
  { id: 'months', label: 'More than a month', hi: 'एक महीने से अधिक' },
];

const RED_FLAG_SYMPTOMS = [
  'chest_pain',
  'breathlessness',
  'stroke_symptoms',
  'severe_bleeding',
  'loss_of_consciousness',
];

const flattenSymptoms = () =>
  SYMPTOM_GROUPS.flatMap((group) => group.symptoms);

export const Screen4_SymptomIntake = () => {
  const {
    sessionData,
    updateSessionData,
    nextScreen,
    prevScreen,
    language,
    audioEnabled,
    toggleAudio,
    toggleEmergencyModal,
  } = useKioskStore();

  const [activeGroup, setActiveGroup] = useState('general');
  const [selectedSymptoms, setSelectedSymptoms] = useState(
    sessionData.symptoms || []
  );
  const [duration, setDuration] = useState(
    sessionData.symptomDuration || ''
  );
  const [customText, setCustomText] = useState(
    sessionData.symptomNarrative || ''
  );
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [showAccessibility, setShowAccessibility] = useState(false);
  const [redFlagDetected, setRedFlagDetected] = useState(
    Boolean(sessionData.redFlagDetected)
  );

  const recognitionRef = useRef(null);

  const isHindi = language === 'hi';

  const activeSymptoms = useMemo(
    () =>
      SYMPTOM_GROUPS.find((group) => group.id === activeGroup)?.symptoms || [],
    [activeGroup]
  );

  const symptomDictionary = useMemo(() => flattenSymptoms(), []);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      setVoiceSupported(true);

      const recognition = new SpeechRecognition();

      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = isHindi ? 'hi-IN' : 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onresult = (event) => {
        const transcript =
          event.results?.[0]?.[0]?.transcript?.trim() || '';

        if (!transcript) return;

        setCustomText((previous) =>
          previous ? `${previous} ${transcript}` : transcript
        );

        const lowerTranscript = transcript.toLowerCase();

        const matched = symptomDictionary.filter((symptom) => {
          const englishMatch = lowerTranscript.includes(
            symptom.label.toLowerCase()
          );

          const hindiMatch = transcript.includes(symptom.hi);

          return englishMatch || hindiMatch;
        });

        if (matched.length > 0) {
          setSelectedSymptoms((previous) => {
            const existing = new Set(previous);
            matched.forEach((item) => existing.add(item.id));
            return Array.from(existing);
          });
        }
      };

      recognitionRef.current = recognition;
    }

    return () => {
      recognitionRef.current?.stop();
    };
  }, [isHindi, symptomDictionary]);

  const toggleListening = () => {
    if (!voiceSupported) {
      setShowKeyboard(true);
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    try {
      recognitionRef.current?.start();
    } catch {
      // Browser can throw if recognition is already starting.
    }
  };

  const toggleSymptom = (symptomId) => {
    setSelectedSymptoms((previous) => {
      if (previous.includes(symptomId)) {
        return previous.filter((item) => item !== symptomId);
      }

      return [...previous, symptomId];
    });
  };

  const selectedSymptomObjects = selectedSymptoms
    .map((id) => symptomDictionary.find((symptom) => symptom.id === id))
    .filter(Boolean);

  const detectRedFlags = (symptoms) => {
    return symptoms.some((symptom) =>
      RED_FLAG_SYMPTOMS.includes(symptom)
    );
  };

  useEffect(() => {
    const hasRedFlag = detectRedFlags(selectedSymptoms);

    if (hasRedFlag && !redFlagDetected) {
      setRedFlagDetected(true);
      updateSessionData({
        redFlagDetected: true,
        redFlagSymptoms: selectedSymptoms.filter((symptom) =>
          RED_FLAG_SYMPTOMS.includes(symptom)
        ),
      });
    }
  }, [
    selectedSymptoms,
    redFlagDetected,
    updateSessionData,
  ]);

  const handleContinue = () => {
    updateSessionData({
      symptoms: selectedSymptoms,
      symptomDuration: duration,
      symptomNarrative: customText,
      redFlagDetected,
      intakeMode: isListening ? 'VOICE' : 'MULTIMODAL',
    });

    nextScreen();
  };

  const audioPrompt = isHindi
    ? 'आपको आज किस समस्या के कारण अस्पताल आना पड़ा है? आप बोलकर या स्क्रीन पर दिए गए विकल्पों को छूकर अपनी समस्या बता सकते हैं।'
    : 'What problem brings you to the hospital today? You can speak naturally or tap the options on the screen.';

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex flex-col select-none">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-teal-700 text-xs font-black uppercase tracking-widest">
            <Stethoscope className="w-4 h-4" />
            <span>Step 4 · Symptom Intake</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            {isHindi
              ? 'आज आपको क्या परेशानी है?'
              : 'What brings you here today?'}
          </h1>

          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            {isHindi
              ? 'अपनी समस्या बोलकर बताएं या नीचे दिए गए विकल्पों को स्पर्श करें।'
              : 'Tell us naturally by voice, or simply tap your symptoms below.'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <AudioButton textToRead={audioPrompt} />

          <button
            type="button"
            onClick={() => setShowAccessibility((value) => !value)}
            className="min-h-[44px] px-4 rounded-xl border border-slate-300 bg-white text-slate-700 font-bold text-sm flex items-center gap-2 hover:bg-slate-50"
          >
            <CircleHelp className="w-4 h-4" />
            Accessibility
          </button>
        </div>
      </div>

      {/* Accessibility controls */}
      {showAccessibility && (
        <div className="mt-4 p-4 rounded-2xl bg-slate-100 border border-slate-200 flex flex-wrap gap-3 items-center">
          <div className="font-bold text-slate-800 text-sm">
            Need a silent / touch-only experience?
          </div>

          <button
            type="button"
            onClick={() => {
              if (audioEnabled) toggleAudio();
            }}
            className={`min-h-[46px] px-4 rounded-xl font-bold border flex items-center gap-2 ${
              !audioEnabled
                ? 'bg-teal-800 text-white border-teal-800'
                : 'bg-white text-slate-700 border-slate-300'
            }`}
          >
            <Volume2 className="w-4 h-4" />
            Audio Off
          </button>

          <button
            type="button"
            onClick={() => setShowKeyboard(true)}
            className="min-h-[46px] px-4 rounded-xl bg-white border border-slate-300 text-slate-700 font-bold flex items-center gap-2"
          >
            <Keyboard className="w-4 h-4" />
            Type Instead
          </button>
        </div>
      )}

      {/* Main interaction */}
      <div className="grid lg:grid-cols-[1fr_330px] gap-5 mt-5 flex-1">
        <section className="min-w-0">
          {/* Voice / Touch choice */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
            <button
              type="button"
              onClick={toggleListening}
              className={`min-h-[92px] rounded-2xl border-2 p-4 text-left flex items-center gap-4 transition-all ${
                isListening
                  ? 'border-amber-400 bg-amber-50 shadow-md'
                  : 'border-teal-200 bg-teal-50 hover:border-teal-400'
              }`}
            >
              <div
                className={`w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center ${
                  isListening
                    ? 'bg-amber-400 text-slate-950 animate-pulse'
                    : 'bg-teal-800 text-white'
                }`}
              >
                {isListening ? (
                  <MicOff className="w-7 h-7" />
                ) : (
                  <Mic className="w-7 h-7" />
                )}
              </div>

              <div>
                <div className="font-black text-slate-900">
                  {isListening
                    ? 'Listening…'
                    : 'Tell me by speaking'}
                </div>
                <div className="text-xs text-slate-600 mt-1">
                  {voiceSupported
                    ? 'Speak naturally in Hindi or English'
                    : 'Voice unavailable — use touch or keyboard'}
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setShowKeyboard(true)}
              className="min-h-[92px] rounded-2xl border-2 border-slate-200 bg-white p-4 text-left flex items-center gap-4 hover:border-teal-300"
            >
              <div className="w-14 h-14 shrink-0 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center">
                <MessageSquareText className="w-7 h-7" />
              </div>

              <div>
                <div className="font-black text-slate-900">
                  I prefer not to speak
                </div>
                <div className="text-xs text-slate-600 mt-1">
                  Choose symptoms or type your answer
                </div>
              </div>
            </button>
          </div>

          {/* Category tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
            {SYMPTOM_GROUPS.map((group) => {
              const Icon = group.icon;

              return (
                <button
                  type="button"
                  key={group.id}
                  onClick={() => setActiveGroup(group.id)}
                  className={`shrink-0 min-h-[48px] px-4 rounded-xl border font-bold text-sm flex items-center gap-2 ${
                    activeGroup === group.id
                      ? 'bg-teal-800 text-white border-teal-800'
                      : 'bg-white text-slate-700 border-slate-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {group.label}
                </button>
              );
            })}
          </div>

          {/* Symptoms */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {activeSymptoms.map((symptom) => {
              const selected = selectedSymptoms.includes(symptom.id);

              return (
                <button
                  type="button"
                  key={symptom.id}
                  onClick={() => toggleSymptom(symptom.id)}
                  className={`relative min-h-[120px] rounded-2xl border-2 p-4 text-left transition-all active:scale-[0.98] ${
                    selected
                      ? 'border-teal-700 bg-teal-50 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-teal-300'
                  }`}
                >
                  {selected && (
                    <span className="absolute top-3 right-3 w-6 h-6 rounded-full bg-teal-800 text-white flex items-center justify-center">
                      <Check className="w-4 h-4" />
                    </span>
                  )}

                  <div className="text-3xl mb-3">{symptom.icon}</div>

                  <div className="font-black text-slate-900 text-sm">
                    {symptom.label}
                  </div>

                  {isHindi && (
                    <div className="text-xs text-slate-500 mt-1">
                      {symptom.hi}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Custom narrative */}
          <div className="mt-5">
            <div className="flex items-center justify-between mb-2">
              <label className="font-black text-slate-800 text-sm">
                Anything else you want to tell us?
              </label>

              <button
                type="button"
                onClick={() => setShowKeyboard(true)}
                className="text-xs font-bold text-teal-800 flex items-center gap-1"
              >
                <Keyboard className="w-3.5 h-3.5" />
                Type
              </button>
            </div>

            <textarea
              value={customText}
              onChange={(event) => setCustomText(event.target.value)}
              placeholder="For example: pain started after dinner and gets worse at night…"
              className="w-full min-h-[92px] rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-teal-500 resize-none text-sm"
            />
          </div>
        </section>

        {/* Right summary panel */}
        <aside className="rounded-2xl border border-slate-200 bg-white p-5 h-fit lg:sticky lg:top-4 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="w-5 h-5 text-teal-700" />
            <h2 className="font-black text-slate-900">
              Your answers
            </h2>
          </div>

          {selectedSymptomObjects.length === 0 ? (
            <div className="rounded-xl bg-slate-50 border border-dashed border-slate-300 p-4 text-sm text-slate-500">
              Select one or more symptoms. You can change them anytime.
            </div>
          ) : (
            <div className="space-y-2">
              {selectedSymptomObjects.map((symptom) => (
                <div
                  key={symptom.id}
                  className="flex items-center justify-between gap-2 bg-teal-50 border border-teal-100 rounded-xl px-3 py-2"
                >
                  <span className="text-sm font-bold text-slate-800">
                    {symptom.label}
                  </span>

                  <button
                    type="button"
                    onClick={() => toggleSymptom(symptom.id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white"
                    aria-label={`Remove ${symptom.label}`}
                  >
                    <X className="w-4 h-4 text-slate-500" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="mt-5">
            <div className="flex items-center gap-2 mb-3">
              <Clock3 className="w-4 h-4 text-slate-600" />
              <span className="font-black text-slate-800 text-sm">
                How long?
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {DURATION_OPTIONS.map((option) => (
                <button
                  type="button"
                  key={option.id}
                  onClick={() => setDuration(option.id)}
                  className={`min-h-[50px] rounded-xl border px-2 text-xs font-bold ${
                    duration === option.id
                      ? 'bg-teal-800 text-white border-teal-800'
                      : 'bg-white text-slate-700 border-slate-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {redFlagDetected && (
            <div className="mt-5 p-4 rounded-xl bg-red-50 border-2 border-red-300">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-black text-red-900 text-sm">
                    Priority symptom detected
                  </div>
                  <p className="text-xs text-red-800 mt-1 leading-relaxed">
                    Please do not wait in the regular queue. A triage staff
                    member should review your symptoms.
                  </p>
                  <button
                    type="button"
                    onClick={() => toggleEmergencyModal(true)}
                    className="mt-3 min-h-[44px] px-4 rounded-xl bg-red-600 text-white font-black text-sm"
                  >
                    Alert Triage Staff
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="mt-5 flex flex-col gap-2">
            <button
              type="button"
              onClick={handleContinue}
              disabled={selectedSymptoms.length === 0}
              className="min-h-[56px] rounded-2xl bg-teal-800 text-white font-black flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continue
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={prevScreen}
              className="min-h-[50px] rounded-2xl bg-slate-100 text-slate-700 font-bold flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          </div>
        </aside>
      </div>

      {/* Silent keyboard modal */}
      {showKeyboard && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl p-5 sm:p-7">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-black uppercase tracking-widest text-teal-700">
                  Silent Input
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                  Type what you are experiencing
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setShowKeyboard(false)}
                className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <textarea
              autoFocus
              value={customText}
              onChange={(event) => setCustomText(event.target.value)}
              placeholder="Describe your problem here…"
              className="w-full min-h-[180px] mt-5 rounded-2xl border-2 border-slate-200 p-4 text-base outline-none focus:border-teal-500 resize-none"
            />

            <div className="grid grid-cols-2 gap-3 mt-4">
              <button
                type="button"
                onClick={() => setShowKeyboard(false)}
                className="min-h-[54px] rounded-2xl bg-slate-100 font-black text-slate-700"
              >
                Done
              </button>

              <button
                type="button"
                onClick={() => {
                  setCustomText('');
                  setShowKeyboard(false);
                }}
                className="min-h-[54px] rounded-2xl bg-teal-800 text-white font-black"
              >
                Save Answer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Screen4_SymptomIntake;