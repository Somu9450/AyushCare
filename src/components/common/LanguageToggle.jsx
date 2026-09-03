import React, { useState, useRef, useEffect } from 'react';
import { useKioskStore } from '../../store/useKioskStore';
import { Globe, ChevronDown, Check, X, Search } from 'lucide-react';
import { OFFICIAL_INDIAN_LANGUAGES, PRIMARY_LANGUAGES } from '../../constants/indianLanguages';

export const LanguageToggle = ({ variant = 'default' }) => {
  const { language, setLanguage } = useKioskStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const popoverRef = useRef(null);

  useEffect(() => {
    const handleOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [dropdownOpen]);

  const currentLangObj = OFFICIAL_INDIAN_LANGUAGES.find((l) => l.code === language);
  const isPrimary = PRIMARY_LANGUAGES.some((l) => l.code === language);

  const filtered = OFFICIAL_INDIAN_LANGUAGES.filter(
    (l) =>
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.native.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative inline-flex items-center bg-teal-950/50 p-1 rounded-xl border border-teal-700/50 backdrop-blur-sm" ref={popoverRef}>
      <Globe className="w-4 h-4 text-teal-300 ml-2 mr-1 hidden sm:inline" />
      
      <div className="flex gap-1 items-center">
        {PRIMARY_LANGUAGES.map((lang) => {
          const isActive = language === lang.code;
          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => setLanguage(lang.code)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-colors cursor-pointer min-h-[36px] ${
                isActive
                  ? 'bg-amber-400 text-teal-950 font-bold shadow-sm'
                  : 'text-teal-100 hover:text-white hover:bg-teal-800/60'
              }`}
            >
              {lang.native}
            </button>
          );
        })}

        {/* If an other language is chosen from the 22 languages */}
        {!isPrimary && currentLangObj && (
          <button
            type="button"
            className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-amber-400 text-teal-950 shadow-sm min-h-[36px]"
          >
            {currentLangObj.native}
          </button>
        )}

        {/* More 22 Languages toggle */}
        <button
          type="button"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="px-2 py-1.5 rounded-lg text-xs font-semibold text-teal-200 hover:text-white hover:bg-teal-800/60 flex items-center gap-0.5 cursor-pointer min-h-[36px]"
          title="Other Official Languages"
        >
          <span>More</span>
          <ChevronDown className="w-3 h-3" />
        </button>
      </div>

      {dropdownOpen && (
        <div className="absolute right-0 top-12 z-50 w-72 bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 p-3 animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-700">Official Indian Languages</span>
            <button
              type="button"
              onClick={() => setDropdownOpen(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-2 relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search language..."
              className="w-full h-8 pl-8 pr-2 rounded-lg border border-slate-200 bg-slate-50 text-xs focus:outline-none focus:ring-1 focus:ring-teal-600"
            />
          </div>

          <div className="mt-2 grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
            {filtered.map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => {
                  setLanguage(l.code);
                  setDropdownOpen(false);
                }}
                className={`p-1.5 rounded-lg text-left text-xs transition flex items-center justify-between ${
                  language === l.code
                    ? 'bg-teal-700 text-white font-bold'
                    : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                <span className="truncate">{l.native}</span>
                {language === l.code && <Check className="w-3 h-3 text-amber-300 ml-1" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageToggle;
