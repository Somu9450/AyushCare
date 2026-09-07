import React, { useState } from 'react';
import { Globe, Loader2, Check, Volume2, ArrowRight } from 'lucide-react';
import { kioskApi, getErrorMessage } from '../services/api';
import { useKioskStore } from '../store/useKioskStore';
import { useTranslation } from '../hooks/useTranslation';

/**
 * Languages supported by the AI backend's TTS engine (Edge Neural Voices).
 * Only these are shown so the patient gets a working audio experience.
 */
const INTERVIEW_LANGUAGES = [
  { code: 'en', name: 'English', native: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', native: 'मराठी', flag: '🇮🇳' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം', flag: '🇮🇳' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
];

export default function Screen3b_LanguageSelect() {
  const { sessionData, language, setLanguage, updateSession, setScreen } = useKioskStore();
  const { t } = useTranslation();
  const [selected, setSelected] = useState(language || 'en');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSelect = (code) => {
    setSelected(code);
    setError('');
  };

  const handleContinue = async () => {
    setSaving(true);
    setError('');
    try {
      // Update language in both kiosk store and AI backend session
      setLanguage(selected);
      updateSession({ interviewLanguage: selected });

      if (sessionData.consultationId) {
        await kioskApi.updateLanguage(sessionData.consultationId, selected);
      }

      // Proceed to AI interview (screen 6)
      setScreen(6);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="screen-card language-select-screen">
      <div className="section-head">
        <div>
          <p className="eyebrow">04 • {t('language')}</p>
          <h2>{t('selectInterviewLanguage') || 'Select Interview Language'}</h2>
          <p>{t('selectInterviewLanguageHelp') || 'Choose the language for your AI health interview. Questions and voice will be in your selected language.'}</p>
        </div>
        <Globe size={42} className="language-select-icon" />
      </div>

      <div className="language-select-grid">
        {INTERVIEW_LANGUAGES.map((lang) => {
          const isSelected = selected === lang.code;
          return (
            <button
              key={lang.code}
              type="button"
              className={`language-select-card ${isSelected ? 'selected' : ''}`}
              onClick={() => handleSelect(lang.code)}
              aria-pressed={isSelected}
            >
              <div className="language-select-card-top">
                <span className="language-select-native">{lang.native}</span>
                {isSelected && (
                  <div className="language-select-check">
                    <Check size={16} />
                  </div>
                )}
              </div>
              <span className="language-select-name">{lang.name}</span>
              <div className="language-select-features">
                <Volume2 size={12} />
                <span>Voice supported</span>
              </div>
            </button>
          );
        })}
      </div>

      {error && <div className="error-box">{error}</div>}

      <button
        className="primary-btn wide"
        disabled={!selected || saving}
        onClick={handleContinue}
      >
        {saving ? (
          <><Loader2 className="spin" /> Setting up interview…</>
        ) : (
          <><ArrowRight size={18} /> {t('continue')}</>
        )}
      </button>
    </section>
  );
}
