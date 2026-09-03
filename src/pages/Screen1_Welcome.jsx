import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowRight,
  Globe,
  Check,
  ChevronDown,
  Volume2,
  VolumeX,
  X,
  Search,
} from 'lucide-react';

import { useKioskStore } from '../store/useKioskStore';
import { useTranslation } from '../hooks/useTranslation';
import { OFFICIAL_INDIAN_LANGUAGES } from '../constants/indianLanguages';
import KioskInput from '../components/common/KioskInput';

const Screen1_Welcome = () => {
  const { nextScreen, language, setLanguage } = useKioskStore();
  const { t, isHindi, isPunjabi, isBengali } = useTranslation();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  const handleAudio = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported on this browser.');
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      window._activeKioskUtterance = null;
      return;
    }

    window.speechSynthesis.cancel();
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    const textToSpeak = isPunjabi
      ? 'ਆਯੁਸ਼ਕੇਅਰ ਡਿਜੀਟਲ ਸਿਹਤ ਕਿਓਸਕ ਵਿੱਚ ਤੁਹਾਡਾ ਸਵਾਗਤ ਹੈ। ਡਾਕਟਰ ਨੂੰ ਮਿਲਣ ਤੋਂ ਪਹਿਲਾਂ ਜਾਣਕਾਰੀ ਪੂਰੀ ਕਰਨ ਲਈ ਆਪਣੀ ਭਾਸ਼ਾ ਚੁਣੋ ਅਤੇ ਅੱਗੇ ਵਧੋ।'
      : isBengali
      ? 'আয়ুষকেয়ার ডিজিটাল স্বাস্থ্য কিয়স্কে আপনাকে স্বাগতম। ডাক্তারের সাথে দেখা করার আগে তথ্য পূরণ করতে ভাষা বেছে নিন এবং এগিয়ে যান।'
      : isHindi
      ? 'आयुषकेयर डिजिटल स्वास्थ्य कियोस्क में आपका स्वागत है। डॉक्टर से मिलने से पहले अपनी जानकारी पूरी करने के लिए भाषा चुनें और आगे बढ़ें।'
      : 'Welcome to AyushCare digital health kiosk. Complete your health information before meeting your doctor. Please select your language and press continue.';

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    if (isHindi) utterance.lang = 'hi-IN';
    else if (isPunjabi) utterance.lang = 'pa-IN';
    else if (isBengali) utterance.lang = 'bn-IN';
    else utterance.lang = 'en-IN';

    utterance.rate = 0.92;
    window._activeKioskUtterance = utterance;

    utterance.onstart = () => setIsPlayingAudio(true);
    utterance.onend = () => {
      setIsPlayingAudio(false);
      window._activeKioskUtterance = null;
    };
    utterance.onerror = () => {
      setIsPlayingAudio(false);
      window._activeKioskUtterance = null;
    };

    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 40);
  };

  // Check if current language is one of the 4 primary quick-pick languages
  const isPrimaryQuickPick = ['en', 'hi', 'pa', 'bn'].includes(language);
  const currentLangObj = OFFICIAL_INDIAN_LANGUAGES.find((l) => l.code === language);

  const filteredLanguages = OFFICIAL_INDIAN_LANGUAGES.filter(
    (lang) =>
      lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lang.native.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lang.region.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full w-full flex flex-col justify-center items-center px-4 py-2 bg-white select-none">
      <div className="w-full max-w-3xl mx-auto flex flex-col items-center text-center my-auto">

        {/* ----------------------------------------------------
            HEADINGS (Compact ATM Style)
        ----------------------------------------------------- */}
        <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-tight">
          Welcome to AyushCare
        </h1>

        <h2 className="text-sm sm:text-base font-bold text-teal-800 mt-0.5 leading-tight">
          {t('screen1.welcomeHindiTitle', 'डिजिटल स्वास्थ्य कियोस्क में आपका स्वागत है')}
        </h2>

        <p className="text-xs text-slate-600 mt-1 max-w-xl leading-relaxed">
          {t('screen1.welcomeDesc', 'Complete your health information before meeting your doctor.')}
        </p>

        <p className="text-xs text-slate-500 mt-0.5 max-w-xl leading-relaxed">
          {t('screen1.welcomeHindiDesc', 'अपने डॉक्टर से मिलने से पहले अपनी स्वास्थ्य जानकारी पूरी करें')}
        </p>

        {/* ----------------------------------------------------
            LANGUAGE SELECTOR TITLE
        ----------------------------------------------------- */}
        <p className="text-xs font-black text-slate-800 mt-2.5 mb-2">
          {t('screen1.selectLanguage', 'Please select your language • अपनी भाषा चुनें')}
        </p>

        {/* ----------------------------------------------------
            LANGUAGE CARDS ROW (4 Quick-Picks + 1 Dropdown)
        ----------------------------------------------------- */}
        <div className="relative w-full max-w-2xl flex justify-center z-30">
          <div className="grid grid-cols-5 gap-2 sm:gap-2.5 w-full justify-items-center">

            {/* 1. English */}
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`w-full max-w-[130px] h-[92px] rounded-xl flex flex-col items-center justify-center p-1.5 transition-all cursor-pointer select-none ${
                language === 'en'
                  ? 'border-2 border-teal-700 bg-[#eef7f6] shadow-xs ring-1 ring-teal-700/20'
                  : 'border border-slate-200 bg-white hover:border-teal-400 hover:bg-slate-50/70 shadow-xs'
              }`}
            >
              <svg className="w-7 h-4.5 rounded shadow-xs" viewBox="0 0 60 30">
                <clipPath id="ukClip">
                  <path d="M0,0 v30 h60 v-30 z"/>
                </clipPath>
                <clipPath id="ukDiag">
                  <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z"/>
                </clipPath>
                <g clipPath="url(#ukClip)">
                  <path d="M0,0 v30 h60 v-30 z" fill="#012169"/>
                  <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/>
                  <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#ukDiag)" stroke="#C8102E" strokeWidth="4"/>
                  <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10"/>
                  <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6"/>
                </g>
              </svg>

              <span className="text-xs sm:text-sm font-black text-slate-900 mt-1.5">
                English
              </span>

              {language === 'en' ? (
                <span className="text-[10px] font-bold text-teal-800 flex items-center gap-0.5 mt-0.5">
                  <Check className="w-2.5 h-2.5" /> Selected
                </span>
              ) : (
                <span className="text-[10px] text-slate-400 mt-0.5">Language</span>
              )}
            </button>

            {/* 2. Hindi */}
            <button
              type="button"
              onClick={() => setLanguage('hi')}
              className={`w-full max-w-[130px] h-[92px] rounded-xl flex flex-col items-center justify-center p-1.5 transition-all cursor-pointer select-none ${
                language === 'hi'
                  ? 'border-2 border-teal-700 bg-[#eef7f6] shadow-xs ring-1 ring-teal-700/20'
                  : 'border border-slate-200 bg-white hover:border-teal-400 hover:bg-slate-50/70 shadow-xs'
              }`}
            >
              <svg className="w-7 h-4.5 rounded shadow-xs overflow-hidden" viewBox="0 0 60 40">
                <rect width="60" height="13.33" fill="#FF9933" />
                <rect y="13.33" width="60" height="13.34" fill="#FFFFFF" />
                <rect y="26.67" width="60" height="13.33" fill="#138808" />
                <circle cx="30" cy="20" r="4.5" fill="none" stroke="#000080" strokeWidth="1" />
              </svg>

              <span className="text-xs sm:text-sm font-black text-slate-900 mt-1.5">
                हिन्दी
              </span>

              {language === 'hi' ? (
                <span className="text-[10px] font-bold text-teal-800 flex items-center gap-0.5 mt-0.5">
                  <Check className="w-2.5 h-2.5" /> Selected
                </span>
              ) : (
                <span className="text-[10px] text-slate-400 mt-0.5">Hindi</span>
              )}
            </button>

            {/* 3. Punjabi */}
            <button
              type="button"
              onClick={() => setLanguage('pa')}
              className={`w-full max-w-[130px] h-[92px] rounded-xl flex flex-col items-center justify-center p-1.5 transition-all cursor-pointer select-none ${
                language === 'pa'
                  ? 'border-2 border-teal-700 bg-[#eef7f6] shadow-xs ring-1 ring-teal-700/20'
                  : 'border border-slate-200 bg-white hover:border-teal-400 hover:bg-slate-50/70 shadow-xs'
              }`}
            >
              <div className="w-5 h-5 rounded-full bg-gradient-to-b from-amber-400 via-orange-500 to-amber-600 shadow-xs ring-1 ring-orange-400/30" />

              <span className="text-xs sm:text-sm font-black text-slate-900 mt-1.5">
                ਪੰਜਾਬੀ
              </span>

              {language === 'pa' ? (
                <span className="text-[10px] font-bold text-teal-800 flex items-center gap-0.5 mt-0.5">
                  <Check className="w-2.5 h-2.5" /> Selected
                </span>
              ) : (
                <span className="text-[10px] text-slate-400 mt-0.5">Punjabi</span>
              )}
            </button>

            {/* 4. Bengali */}
            <button
              type="button"
              onClick={() => setLanguage('bn')}
              className={`w-full max-w-[130px] h-[92px] rounded-xl flex flex-col items-center justify-center p-1.5 transition-all cursor-pointer select-none ${
                language === 'bn'
                  ? 'border-2 border-teal-700 bg-[#eef7f6] shadow-xs ring-1 ring-teal-700/20'
                  : 'border border-slate-200 bg-white hover:border-teal-400 hover:bg-slate-50/70 shadow-xs'
              }`}
            >
              <div className="w-5 h-5 rounded-full bg-teal-50 border border-teal-300 text-teal-800 font-bold text-[11px] flex items-center justify-center">
                অ
              </div>

              <span className="text-xs sm:text-sm font-black text-slate-900 mt-1.5">
                বাংলা
              </span>

              {language === 'bn' ? (
                <span className="text-[10px] font-bold text-teal-800 flex items-center gap-0.5 mt-0.5">
                  <Check className="w-2.5 h-2.5" /> Selected
                </span>
              ) : (
                <span className="text-[10px] text-slate-400 mt-0.5">Bengali</span>
              )}
            </button>

            {/* 5. Dropdown Menu for 22 Official Indian Languages */}
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className={`w-full max-w-[130px] h-[92px] rounded-xl flex flex-col items-center justify-center p-1.5 transition-all cursor-pointer select-none ${
                !isPrimaryQuickPick
                  ? 'border-2 border-teal-700 bg-[#eef7f6] shadow-xs ring-1 ring-teal-700/20'
                  : 'border border-slate-200 bg-white hover:border-teal-400 hover:bg-slate-50/70 shadow-xs'
              }`}
            >
              <div className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center shadow-xs">
                <Globe className="w-3.5 h-3.5 text-teal-700" />
              </div>

              <span className="text-[11px] sm:text-xs font-black text-slate-900 mt-1.5 text-center leading-tight truncate max-w-[110px]">
                {!isPrimaryQuickPick && currentLangObj ? currentLangObj.native : '22 Languages'}
              </span>

              {!isPrimaryQuickPick && currentLangObj ? (
                <span className="text-[10px] font-bold text-teal-800 flex items-center gap-0.5 mt-0.5">
                  <Check className="w-2.5 h-2.5" /> Selected
                </span>
              ) : (
                <span className="text-[10px] text-teal-700 font-semibold flex items-center gap-0.5 mt-0.5">
                  Select <ChevronDown className="w-2.5 h-2.5" />
                </span>
              )}
            </button>

          </div>

          {/* --------------------------------------------------
              DROPDOWN MODAL: 22 OFFICIAL INDIAN LANGUAGES
          --------------------------------------------------- */}
          {dropdownOpen && (
            <div
              ref={dropdownRef}
              className="absolute top-[102px] z-50 w-full max-w-xl bg-white rounded-2xl shadow-2xl border-2 border-teal-600 p-4 text-left animate-in fade-in zoom-in-95 duration-150"
            >
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                <div>
                  <div className="font-black text-slate-900 text-sm">
                    Recognized Languages of India (8th Schedule)
                  </div>
                  <div className="text-[11px] text-slate-500">
                    भारत के संविधान की 22 आधिकारिक भाषाएं
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setDropdownOpen(false)}
                  className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Quick Search with On-Screen Keyboard */}
              <div className="mt-2.5">
                <KioskInput
                  id="search-language"
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search language or state (उदा. Gujarati, Tamil, Marathi)..."
                  label="Search Language"
                  prefixIcon={Search}
                  inputClassName="h-9 text-xs py-1"
                />
              </div>

              {/* Grid of 22 Official Languages */}
              <div className="mt-2.5 grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-52 overflow-y-auto pr-1">
                {filteredLanguages.map((lang) => {
                  const isSelected = language === lang.code;
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => {
                        setLanguage(lang.code);
                        setDropdownOpen(false);
                      }}
                      className={`p-2 rounded-lg border text-left flex items-center justify-between transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-teal-700 text-white border-teal-800 font-bold shadow-xs'
                          : 'bg-white hover:bg-teal-50 border-slate-200 text-slate-800'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-xs leading-tight truncate">
                          {lang.native}
                        </div>
                        <div className={`text-[10px] truncate ${isSelected ? 'text-teal-100' : 'text-slate-500'}`}>
                          {lang.name}
                        </div>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 shrink-0 text-amber-300" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ----------------------------------------------------
            AUDIO INSTRUCTION BAR
        ----------------------------------------------------- */}
        <div className="mt-3.5 inline-flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[#eef7f6] border border-teal-100 shadow-xs">
          <button
            type="button"
            onClick={handleAudio}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs ${
              isPlayingAudio
                ? 'bg-amber-400 text-slate-900 animate-pulse'
                : 'bg-white text-teal-900 hover:bg-teal-50 border border-teal-200'
            }`}
          >
            {isPlayingAudio ? (
              <VolumeX className="w-3.5 h-3.5 text-slate-900" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-teal-700" />
            )}
            <span>
              {isPlayingAudio ? 'Stop' : 'Listen'}
            </span>
          </button>

          <span className="text-[11px] text-slate-600 font-medium">
            {t('screen1.needHelpAudio', 'Need help? Tap the audio button. • सहायता के लिए ऑडियो बटन दबाएं')}
          </span>
        </div>

        {/* ----------------------------------------------------
            PRIMARY ACTION BUTTON (Exact match to reference image)
        ----------------------------------------------------- */}
        <button
          type="button"
          onClick={nextScreen}
          className="mt-7 min-h-[54px] px-10 rounded-2xl bg-[#005f56] hover:bg-[#004f47] active:scale-[0.98] text-white font-black text-lg flex items-center justify-center gap-2 shadow-md shadow-teal-900/15 cursor-pointer transition-transform"
        >
          <span>Continue</span>
          <ArrowRight className="w-5 h-5" />
        </button>

      </div>
    </div>
  );
};

export default Screen1_Welcome;