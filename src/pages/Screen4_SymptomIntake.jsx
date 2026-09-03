import React, { useEffect, useMemo, useRef, useState } from "react";
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
} from "lucide-react";
import { useKioskStore } from "../store/useKioskStore";
import { useTranslation } from "../hooks/useTranslation";
import { useKeyboard } from "../context/KeyboardContext";
import AudioButton from "../components/common/AudioButton";
import KioskInput from "../components/common/KioskInput";
import { SkeletonSymptomGrid } from "../components/common/KioskSkeleton";

const SYMPTOM_GROUPS = [
  {
    id: "general",
    label: "General",
    hi: "सामान्य लक्षण",
    icon: Activity,
    symptoms: [
      { id: "fever", label: "Fever", hi: "बुखार" },
      { id: "fatigue", label: "Weakness / Fatigue", hi: "कमज़ोरी / थकान" },
      { id: "dizziness", label: "Dizziness", hi: "चक्कर" },
      {
        id: "weight_loss",
        label: "Unexplained Weight Loss",
        hi: "अचानक वजन कम होना",
      },
    ],
  },
  {
    id: "head",
    label: "Head & Neck",
    hi: "सिर एवं गर्दन",
    icon: Ear,
    symptoms: [
      { id: "headache", label: "Headache", hi: "सिरदर्द" },
      { id: "migraine", label: "Migraine", hi: "माइग्रेन" },
      { id: "neck_pain", label: "Neck Pain", hi: "गर्दन में दर्द" },
      {
        id: "vision_problem",
        label: "Vision Problem",
        hi: "दृष्टि में समस्या",
      },
    ],
  },
  {
    id: "chest",
    label: "Chest & Breathing",
    hi: "सीना व श्वसन",
    icon: HeartPulse,
    symptoms: [
      { id: "chest_pain", label: "Chest Pain", hi: "सीने में दर्द" },
      {
        id: "breathlessness",
        label: "Breathing Difficulty",
        hi: "सांस लेने में तकलीफ",
      },
      {
        id: "palpitations",
        label: "Palpitations",
        hi: "दिल की धड़कन तेज़ होना",
      },
      { id: "cough", label: "Cough", hi: "खांसी" },
    ],
  },
  {
    id: "abdomen",
    label: "Stomach & Digestion",
    hi: "पेट व पाचन",
    icon: Activity,
    symptoms: [
      { id: "abdominal_pain", label: "Stomach Pain", hi: "पेट में दर्द" },
      { id: "acidity", label: "Acidity / Heartburn", hi: "एसिडिटी / जलन" },
      { id: "vomiting", label: "Vomiting", hi: "उल्टी" },
      { id: "diarrhea", label: "Loose Motions", hi: "दस्त" },
    ],
  },
  {
    id: "musculoskeletal",
    label: "Bones & Joints",
    hi: "जोड़ व मांसपेशियां",
    icon: Activity,
    symptoms: [
      { id: "joint_pain", label: "Joint Pain", hi: "जोड़ों में दर्द" },
      { id: "back_pain", label: "Back Pain", hi: "कमर / पीठ में दर्द" },
      { id: "swelling", label: "Swelling", hi: "सूजन" },
      { id: "stiffness", label: "Stiffness", hi: "जकड़न" },
    ],
  },
];

const DURATION_OPTIONS = [
  { id: "today", label: "Today", hi: "आज" },
  { id: "2_3_days", label: "2–3 days", hi: "2–3 दिन" },
  { id: "1_week", label: "About a week", hi: "लगभग एक सप्ताह" },
  { id: "2_weeks", label: "2–4 weeks", hi: "2–4 सप्ताह" },
  { id: "months", label: "More than a month", hi: "एक महीने से अधिक" },
];

const RED_FLAG_SYMPTOMS = [
  "chest_pain",
  "breathlessness",
  "stroke_symptoms",
  "severe_bleeding",
  "loss_of_consciousness",
];

const flattenSymptoms = () => SYMPTOM_GROUPS.flatMap((group) => group.symptoms);

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

  const [activeGroup, setActiveGroup] = useState("general");
  const [selectedSymptoms, setSelectedSymptoms] = useState(
    sessionData.symptoms || [],
  );
  const [duration, setDuration] = useState(sessionData.symptomDuration || "");
  const [customText, setCustomText] = useState(
    sessionData.symptomNarrative || "",
  );
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [showAccessibility, setShowAccessibility] = useState(false);
  const [redFlagDetected, setRedFlagDetected] = useState(
    Boolean(sessionData.redFlagDetected),
  );
  const [isAnalyzingML, setIsAnalyzingML] = useState(false);

  const recognitionRef = useRef(null);

  const { t, isHindi } = useTranslation();
  const { openKeyboard } = useKeyboard();

  const activeSymptoms = useMemo(
    () =>
      SYMPTOM_GROUPS.find((group) => group.id === activeGroup)?.symptoms || [],
    [activeGroup],
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
      recognition.lang = isHindi ? "hi-IN" : "en-IN";

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
        const transcript = event.results?.[0]?.[0]?.transcript?.trim() || "";

        if (!transcript) return;

        setCustomText((previous) =>
          previous ? `${previous} ${transcript}` : transcript,
        );

        const lowerTranscript = transcript.toLowerCase();

        const matched = symptomDictionary.filter((symptom) => {
          const englishMatch = lowerTranscript.includes(
            symptom.label.toLowerCase(),
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
    return symptoms.some((symptom) => RED_FLAG_SYMPTOMS.includes(symptom));
  };

  useEffect(() => {
    const hasRedFlag = detectRedFlags(selectedSymptoms);

    if (hasRedFlag && !redFlagDetected) {
      setRedFlagDetected(true);
      updateSessionData({
        redFlagDetected: true,
        redFlagSymptoms: selectedSymptoms.filter((symptom) =>
          RED_FLAG_SYMPTOMS.includes(symptom),
        ),
      });
    }
  }, [selectedSymptoms, redFlagDetected, updateSessionData]);

  const handleContinue = () => {
    updateSessionData({
      symptoms: selectedSymptoms,
      symptomDuration: duration,
      symptomNarrative: customText,
      redFlagDetected,
      intakeMode: isListening ? "VOICE" : "MULTIMODAL",
    });

    nextScreen();
  };

  const audioPrompt = t(
    "screen4.subtitle",
    "What problem brings you to the hospital today? You can speak naturally or tap the options on the screen.",
  );

  return (
    <div className="h-full w-full max-w-5xl mx-auto px-4 py-2 select-none flex flex-col justify-between">
      {/* --------------------------------------------------
          COMPACT HEADER
      --------------------------------------------------- */}
      <div className="flex items-center justify-between gap-3 mb-1.5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
              {t("screen4.stepLabel", "Step 3 · Symptoms")}
            </span>
            <h1 className="text-lg sm:text-xl font-black text-slate-900">
              {t("screen4.title", "What symptoms are you experiencing?")}
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {t(
              "screen4.subtitle",
              "Speak into the microphone or tap the common symptoms below",
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Voice Input Button */}
          <button
            type="button"
            onClick={toggleListening}
            className={`h-8 px-2.5 rounded-xl border font-bold text-xs flex items-center gap-1.5 cursor-pointer transition ${
              isListening
                ? "bg-amber-400 text-slate-950 border-amber-500 animate-pulse"
                : "bg-white text-teal-900 border-teal-200 hover:bg-teal-50"
            }`}
          >
            {isListening ? (
              <MicOff className="w-3.5 h-3.5" />
            ) : (
              <Mic className="w-3.5 h-3.5 text-teal-700" />
            )}
            <span>{isListening ? "Listening..." : "Voice"}</span>
          </button>

          <AudioButton
            textToRead={audioPrompt}
            label={t("nav.listen", isHindi ? "सुनें" : "Listen")}
            className="min-h-[32px] py-1 text-xs"
          />
        </div>
      </div>

      {/* --------------------------------------------------
          TWO-COLUMN ATM LAYOUT
      --------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_0.85fr] gap-3 items-start flex-1 min-h-0">
        {/* LEFT COLUMN: Categories & Symptoms Grid */}
        <div className="bg-white border border-slate-200 rounded-2xl p-2.5 shadow-xs flex flex-col gap-2">
          {/* Category Tabs */}
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {SYMPTOM_GROUPS.map((group) => {
              const Icon = group.icon;
              return (
                <button
                  type="button"
                  key={group.id}
                  onClick={() => setActiveGroup(group.id)}
                  className={`shrink-0 h-7 px-2.5 rounded-lg border font-bold text-[11px] flex items-center gap-1 cursor-pointer transition ${
                    activeGroup === group.id
                      ? "bg-teal-700 text-white border-teal-700 shadow-xs"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{isHindi ? group.hi || group.label : group.label}</span>
                </button>
              );
            })}
          </div>

          {/* Symptoms 4-Column Compact Grid */}
          {isAnalyzingML ? (
            <SkeletonSymptomGrid />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {activeSymptoms.map((symptom) => {
                const selected = selectedSymptoms.includes(symptom.id);
                return (
                  <button
                    type="button"
                    key={symptom.id}
                    onClick={() => toggleSymptom(symptom.id)}
                    className={`h-[66px] rounded-xl border-2 p-1.5 text-left transition flex flex-col justify-between cursor-pointer ${
                      selected
                        ? "border-teal-700 bg-teal-50 shadow-xs"
                        : "border-slate-200 bg-white hover:border-teal-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-base">{symptom.icon}</span>
                      {selected && (
                        <span className="w-4 h-4 rounded-full bg-teal-700 text-white flex items-center justify-center shrink-0">
                          <Check className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-black text-slate-900 text-xs truncate leading-tight">
                        {isHindi ? symptom.hi || symptom.label : symptom.label}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        {isHindi ? symptom.label : symptom.hi || ""}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Custom Narrative Input with On-Screen Keyboard */}
          <div className="pt-1">
            <KioskInput
              id="symptom-custom-narrative"
              value={customText}
              onChange={setCustomText}
              placeholder="Type additional symptoms or specific details (e.g. fever since night)..."
              label="Additional Notes"
              prefixIcon={MessageSquareText}
              inputClassName="h-8 text-xs py-0.5"
            />
          </div>
        </div>

        {/* RIGHT COLUMN: Selection Summary, Duration & Continue */}
        <div className="flex flex-col gap-2 bg-white border border-slate-200 rounded-2xl p-2.5 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-black text-slate-800">
              <ShieldCheck className="w-4 h-4 text-teal-700" />
              <span>{t("screen4.selectedSymptoms", "Selected Symptoms")}</span>
            </div>
            <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full">
              {selectedSymptoms.length} Selected
            </span>
          </div>

          {/* Selected Symptoms Chips */}
          <div className="min-h-[50px] max-h-24 overflow-y-auto rounded-xl bg-slate-50 border border-slate-200 p-1.5 flex flex-wrap gap-1">
            {selectedSymptomObjects.length === 0 ? (
              <p className="text-slate-400 text-xs italic m-auto">
                {t("screen4.noneSelected", "Tap symptoms on the left")}
              </p>
            ) : (
              selectedSymptomObjects.map((symptom) => (
                <span
                  key={symptom.id}
                  className="inline-flex items-center gap-1 bg-teal-100 text-teal-900 rounded-lg px-2 py-0.5 text-xs font-bold"
                >
                  <span>
                    {isHindi ? symptom.hi || symptom.label : symptom.label}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleSymptom(symptom.id)}
                    className="hover:text-red-700 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))
            )}
          </div>

          {/* Duration Selector */}
          <div>
            <div className="flex items-center gap-1 text-slate-700 text-xs font-bold mb-1">
              <Clock3 className="w-3.5 h-3.5 text-slate-500" />
              <span>{t("screen4.durationLabel", "Duration")}</span>
            </div>
            <div className="grid grid-cols-3 gap-1">
              {DURATION_OPTIONS.map((option) => (
                <button
                  type="button"
                  key={option.id}
                  onClick={() => setDuration(option.id)}
                  className={`h-7 rounded-lg border text-[11px] font-bold cursor-pointer transition ${
                    duration === option.id
                      ? "bg-teal-700 text-white border-teal-700 shadow-xs"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {isHindi ? option.hi || option.label : option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Red Flag Warning */}
          {redFlagDetected && (
            <div className="p-2 rounded-xl bg-red-50 border border-red-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-red-800 font-bold">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>Priority Symptom Detected</span>
              </div>
              <button
                type="button"
                onClick={() => toggleEmergencyModal(true)}
                className="h-6 px-2 rounded-md bg-red-600 text-white text-[10px] font-black cursor-pointer"
              >
                Alert Staff
              </button>
            </div>
          )}

          {/* Action Continue Button */}
          <button
            type="button"
            onClick={handleContinue}
            disabled={selectedSymptoms.length === 0}
            className="w-full h-11 rounded-xl bg-teal-700 hover:bg-teal-800 disabled:bg-slate-200 disabled:text-slate-400 text-white font-black flex items-center justify-between px-4 cursor-pointer disabled:cursor-not-allowed transition text-sm shadow-xs"
          >
            <span>{t("nav.continue", "Continue to Health History")}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Screen4_SymptomIntake;
