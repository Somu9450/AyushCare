import React, { useState } from 'react';
import { Volume2, Loader2 } from 'lucide-react';
import { kioskApi } from '../../services/api';
import { useKioskStore } from '../../store/useKioskStore';

export default function AudioButton({ textToRead, label = 'Listen' }) {
  const { language, sessionData, audioEnabled } = useKioskStore();
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const speak = async () => {
    if (!audioEnabled || !textToRead || loading) return;

    setLoading(true);
    setSpeaking(true);

    const finish = () => {
      setLoading(false);
      setSpeaking(false);
    };

    try {
      const r = await kioskApi.tts(sessionData.consultationId, textToRead, language);
      const data = r?.audio_base64 || r?.audio?.base64;

      if (data) {
        const audio = new Audio(`data:${r?.mime_type || 'audio/wav'};base64,${data}`);
        audio.onended = finish;
        audio.onerror = finish;
        await audio.play();
        return;
      }

      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(textToRead);
        utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
        utterance.rate = 0.92;
        utterance.onend = finish;
        utterance.onerror = finish;
        window.speechSynthesis.speak(utterance);
        return;
      }
    } catch {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(textToRead);
        utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
        utterance.rate = 0.92;
        utterance.onend = finish;
        utterance.onerror = finish;
        window.speechSynthesis.speak(utterance);
        return;
      }
    }

    finish();
  };

  return (
    <button
      className={`audio-btn ${speaking ? 'is-speaking' : ''}`}
      onClick={speak}
      disabled={!audioEnabled || loading}
      aria-label={label}
      title={label}
    >
      {loading ? <Loader2 className="spin" size={22} /> : <Volume2 size={22} />}
      <span>{label}</span>
    </button>
  );
}
