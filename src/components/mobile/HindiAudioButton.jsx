import React, { useEffect, useState, useRef } from "react";
import { Volume2, VolumeX, Pause, Play } from "lucide-react";
import useMobileStore from "../../store/useMobileStore";
import { useLanguage } from "../../i18n/translations";

/**
 * HindiAudioButton
 * Allows patients (especially low-literacy or audio-preference users) to listen to the health summary.
 * Uses Web SpeechSynthesis API. Displays strictly single language (pure English or pure Hindi).
 */
export const HindiAudioButton = ({ text, className = "" }) => {
  const { isHindiSpeechPlaying, setIsHindiSpeechPlaying } = useMobileStore();
  const { isHindi } = useLanguage();
  const [speechSupported, setSpeechSupported] = useState(true);
  const utteranceRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setSpeechSupported(false);
    }

    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleToggleAudio = () => {
    if (!speechSupported) {
      alert(isHindi ? "इस ब्राउज़र में टेक्स्ट-टू-स्पीच समर्थित नहीं है।" : "Text-to-speech is not supported in this browser.");
      return;
    }

    const synth = window.speechSynthesis;

    if (isHindiSpeechPlaying) {
      synth.cancel();
      setIsHindiSpeechPlaying(false);
      return;
    }

    // Cancel any previous speech
    synth.cancel();

    const textToSpeak =
      text ||
      (isHindi
        ? "नमस्ते राजेश जी। यह आपकी स्वास्थ्य सारांश है। आप अपने डॉक्टर को यह जानकारी दिखा सकते हैं।"
        : "Hello Rajesh. This is your health summary. You can review and share this information with your doctor.");

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = isHindi ? "hi-IN" : "en-IN";
    utterance.rate = 0.92;

    const voices = synth.getVoices();
    const voice = voices.find(
      (v) => (isHindi ? (v.lang.includes("hi") || v.name.toLowerCase().includes("hindi")) : (v.lang.includes("en-IN") || v.lang.includes("en")))
    );
    if (voice) {
      utterance.voice = voice;
    }

    utterance.onstart = () => {
      setIsHindiSpeechPlaying(true);
    };

    utterance.onend = () => {
      setIsHindiSpeechPlaying(false);
    };

    utterance.onerror = () => {
      setIsHindiSpeechPlaying(false);
    };

    utteranceRef.current = utterance;
    synth.speak(utterance);
  };

  const titleText = isHindi
    ? (isHindiSpeechPlaying ? "ऑडियो सारांश चल रहा है..." : "स्वास्थ्य सारांश सुनें")
    : (isHindiSpeechPlaying ? "Playing Audio Summary..." : "Listen to Health Summary");

  const subtitleText = isHindi
    ? (isHindiSpeechPlaying ? "रोकने के लिए दोबारा दबाएं" : "स्पष्ट आवाज़ में सारांश सुनें")
    : (isHindiSpeechPlaying ? "Tap again to pause playback" : "Read aloud with clear voice guidance");

  return (
    <button
      type="button"
      onClick={handleToggleAudio}
      aria-label={titleText}
      className={`w-full min-h-[50px] p-3 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 active:scale-[0.99] select-none ${
        isHindiSpeechPlaying
          ? "bg-teal-900 border-teal-950 text-white shadow-md ring-2 ring-teal-500/20"
          : "bg-teal-50/80 hover:bg-teal-100/90 border-teal-300 text-teal-950 shadow-xs"
      } ${className}`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition ${
            isHindiSpeechPlaying ? "bg-teal-800 text-teal-200" : "bg-white text-teal-800 shadow-xs"
          }`}
        >
          {isHindiSpeechPlaying ? (
            <Pause className="w-5 h-5 text-white animate-pulse" />
          ) : (
            <Volume2 className="w-5 h-5 text-teal-800" />
          )}
        </div>

        <div className="text-left">
          <p
            className={`text-sm font-bold leading-tight ${
              isHindiSpeechPlaying ? "text-white" : "text-teal-950"
            }`}
          >
            {titleText}
          </p>
          <p
            className={`text-xs mt-0.5 ${
              isHindiSpeechPlaying ? "text-teal-200" : "text-teal-800"
            }`}
          >
            {subtitleText}
          </p>
        </div>
      </div>

      {/* Audio Wave Bars or Listen Badge */}
      <div className="shrink-0 flex items-center gap-1 pr-1">
        {isHindiSpeechPlaying ? (
          <div className="flex items-end gap-1 h-5">
            <span className="w-1 bg-teal-300 rounded-full h-3 animate-bounce [animation-delay:0.1s]"></span>
            <span className="w-1 bg-teal-200 rounded-full h-5 animate-bounce [animation-delay:0.25s]"></span>
            <span className="w-1 bg-teal-400 rounded-full h-4 animate-bounce [animation-delay:0.15s]"></span>
            <span className="w-1 bg-teal-100 rounded-full h-2 animate-bounce [animation-delay:0.3s]"></span>
          </div>
        ) : (
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white/80 text-teal-900 border border-teal-300/60 shadow-2xs">
            🔊 {isHindi ? "चलाएं" : "Play"}
          </span>
        )}
      </div>
    </button>
  );
};

export default HindiAudioButton;
