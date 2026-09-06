import React, { useState } from 'react';
import { Languages, ChevronDown } from 'lucide-react';
import { useKioskStore } from '../../store/useKioskStore';
import { OFFICIAL_INDIAN_LANGUAGES } from '../../constants/indianLanguages';

export default function LanguageToggle() {
  const { language, setLanguage } = useKioskStore();
  const [open, setOpen] = useState(false);
  const selected = OFFICIAL_INDIAN_LANGUAGES.find((l) => l.code === language) || OFFICIAL_INDIAN_LANGUAGES.find((l) => l.code === 'en');
  return <div className="relative">
    <button className="kiosk-language" onClick={() => setOpen(!open)}><Languages size={18}/><span>{selected.native}</span><ChevronDown size={16}/></button>
    {open && <div className="language-menu">
      {OFFICIAL_INDIAN_LANGUAGES.map((l) => <button key={l.code} onClick={() => { setLanguage(l.code); setOpen(false); }} className={l.code === language ? 'active' : ''}><span>{l.native}</span><small>{l.name}</small></button>)}
    </div>}
  </div>;
}
