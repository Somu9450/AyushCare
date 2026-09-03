import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useKioskStore } from '../../store/useKioskStore';
import { useTranslation } from '../../hooks/useTranslation';

export const AudioButton = ({ textToRead, label, className = '' }) => {
  const { language, audioEnabled, toggleAudio } = useKioskStore();
  const { t } = useTranslation();
  const [isPlaying, setIsPlaying] = useState(false);

  // Stop speaking on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleSpeak = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported on this browser.');
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      window._activeKioskUtterance = null;
      return;
    }

    window.speechSynthesis.cancel();
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    // Default text fallback if not provided
    const text =
      textToRead ||
      (language === 'hi'
        ? 'आयुषकेयर डिजिटल स्वास्थ्य कियोस्क में आपका स्वागत है। आगे बढ़ने के लिए स्क्रीन पर स्पर्श करें।'
        : language === 'pa'
        ? 'ਆਯੁਸ਼ਕੇਅਰ ਡਿਜੀਟਲ ਸਿਹਤ ਕਿਓਸਕ ਵਿੱਚ ਤੁਹਾਡਾ ਸਵਾਗਤ ਹੈ। ਅੱਗੇ ਵਧਣ ਲਈ ਸਕ੍ਰੀਨ ਨੂੰ ਛੂਹੋ।'
        : language === 'bn'
        ? 'আয়ুষকেয়ার ডিজিটাল স্বাস্থ্য কিয়স্কে আপনাকে স্বাগতম। এগিয়ে যেতে স্ক্রিনে স্পর্শ করুন।'
        : 'Welcome to AyushCare Digital Health Kiosk. Touch the screen to begin.');

    const utterance = new SpeechSynthesisUtterance(text);

    if (language === 'hi') utterance.lang = 'hi-IN';
    else if (language === 'pa') utterance.lang = 'pa-IN';
    else if (language === 'bn') utterance.lang = 'bn-IN';
    else utterance.lang = 'en-IN';

    utterance.rate = 0.92;
    utterance.pitch = 1.0;

    // Retain global reference to avoid Chromium garbage collection bug!
    window._activeKioskUtterance = utterance;

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => {
      setIsPlaying(false);
      window._activeKioskUtterance = null;
    };
    utterance.onerror = () => {
      setIsPlaying(false);
      window._activeKioskUtterance = null;
    };

    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 40);

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
          : 'bg-teal-900/70 text-teal-100 hover:text-white hover:bg-teal-800 border border-teal-700/60'
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
