import React, { useState } from 'react';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';
import { useKioskStore } from '../../store/useKioskStore';
import { useTranslation } from '../../hooks/useTranslation';

export const AudioButton = ({ textToRead, label, className = '' }) => {
  const { language, audioEnabled, toggleAudio } = useKioskStore();
  const { t } = useTranslation();
  const [isPlaying, setIsPlaying] = useState(false);

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in this browser.');
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    window.speechSynthesis.cancel();

    // Default text fallback if not provided
    const text = textToRead || (language === 'hi' 
      ? 'आयुषकेयर डिजिटल स्वास्थ्य कियोस्क में आपका स्वागत है। आगे बढ़ने के लिए स्क्रीन पर स्पर्श करें।' 
      : 'Welcome to AyushCare Digital Health Kiosk. Touch the screen to begin.');

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.92; // Slightly slower for clarity in hospital kiosk environment
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
    if (!audioEnabled) toggleAudio();
  };

  return (
    <button
      type="button"
      onClick={handleSpeak}
      aria-label="Audio Instructions"
      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer min-h-[44px] ${
        isPlaying
          ? 'bg-amber-400 text-teal-950 ring-2 ring-amber-300 animate-pulse font-bold shadow-md'
          : 'bg-teal-900/60 text-teal-100 hover:text-white hover:bg-teal-800 border border-teal-700/60'
      } ${className}`}
    >
      {isPlaying ? (
        <>
          <Volume2 className="w-5 h-5 text-teal-950 animate-bounce" />
          <span>{label || t('nav.audioPlaying', 'Playing Audio...')}</span>
        </>
      ) : (
        <>
          <Volume2 className="w-5 h-5 text-amber-400" />
          <span>{label || t('nav.audioHelp', 'Audio Instructions')}</span>
        </>
      )}
    </button>
  );
};

export default AudioButton;
