import React, { useState } from 'react';
import { Volume2, Loader2 } from 'lucide-react';
import { kioskApi } from '../../services/api';
import { useKioskStore } from '../../store/useKioskStore';

function browserSpeak(text, language) {
  if (!window.speechSynthesis || !text) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = language || 'en-IN';
  utterance.rate = 0.9;
  window.speechSynthesis.speak(utterance);
}

export default function AudioButton({ textToRead, label = 'Listen' }) {
  const { language, sessionData, audioEnabled } = useKioskStore();
  const [loading, setLoading] = useState(false);

  const speak = async () => {
    if (!audioEnabled || !textToRead) return;
    setLoading(true);
    try {
      const r = await kioskApi.tts(
        sessionData.consultationId,
        textToRead,
        language
      );
      const data = r?.audio_base64 || r?.audio?.base64;
      if (data) {
        const encoding = String(r?.encoding || '').toUpperCase();
        const mime = encoding === 'WAV' ? 'audio/wav' : 'audio/mpeg';
        const audio = new Audio(`data:${r?.mime_type || mime};base64,${data}`);
        await audio.play();
      } else {
        browserSpeak(textToRead, language);
      }
    } catch {
      browserSpeak(textToRead, language);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button className="audio-btn" onClick={speak} disabled={loading}>
      {loading ? <Loader2 className="spin" size={16} /> : <Volume2 size={16} />}
      {label}
    </button>
  );
}
