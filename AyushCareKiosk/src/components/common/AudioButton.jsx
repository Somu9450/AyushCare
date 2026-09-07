import React, { useState } from 'react';
import { Volume2, Loader2 } from 'lucide-react';
import { kioskApi } from '../../services/api';
import { useKioskStore } from '../../store/useKioskStore';

function browserSpeak(text, language) {
  if (!window.speechSynthesis || !text) return;
  const localeMap = { en: 'en-IN', hi: 'hi-IN', bn: 'bn-IN', ta: 'ta-IN', te: 'te-IN', mr: 'mr-IN', gu: 'gu-IN', kn: 'kn-IN', ml: 'ml-IN', pa: 'pa-IN' };
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = localeMap[language] || language || 'en-IN';
  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find((voice) => voice.lang?.toLowerCase().startsWith(utterance.lang.toLowerCase().split('-')[0]));
  if (preferred) utterance.voice = preferred;
  utterance.rate = 0.9;
  window.speechSynthesis.speak(utterance);
}

export default function AudioButton({ textToRead, label = 'Speak' }) {
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
