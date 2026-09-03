import React from 'react';
import { useKioskStore } from '../../store/useKioskStore';
import { Globe } from 'lucide-react';

const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'pa', label: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  { code: 'bn', label: 'Bengali', native: 'বাংলা' }
];

export const LanguageToggle = ({ variant = 'default' }) => {
  const { language, setLanguage } = useKioskStore();

  if (variant === 'grid') {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-2xl">
        {LANGUAGES.map((lang) => {
          const isActive = language === lang.code;
          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => setLanguage(lang.code)}
              className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer min-h-[72px] text-center ${
                isActive
                  ? 'bg-teal-900 text-white border-amber-400 shadow-md ring-2 ring-amber-400/40 transform scale-[1.02]'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-teal-600 hover:bg-teal-50/50'
              }`}
            >
              <span className="text-xl font-bold tracking-wide">{lang.native}</span>
              <span className={`text-xs mt-0.5 ${isActive ? 'text-teal-200' : 'text-slate-500'}`}>
                {lang.label}
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  // Pill variant for Navbar
  return (
    <div className="inline-flex items-center bg-teal-950/40 p-1 rounded-xl border border-teal-700/50 backdrop-blur-sm">
      <Globe className="w-4 h-4 text-teal-300 ml-2 mr-1 hidden sm:inline" />
      <div className="flex gap-1">
        {LANGUAGES.map((lang) => {
          const isActive = language === lang.code;
          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => setLanguage(lang.code)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-colors cursor-pointer min-h-[38px] ${
                isActive
                  ? 'bg-amber-400 text-teal-950 font-bold shadow-sm'
                  : 'text-teal-100 hover:text-white hover:bg-teal-800/60'
              }`}
            >
              {lang.native}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default LanguageToggle;
