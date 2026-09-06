import React from 'react';
import { Leaf, Volume2, VolumeX } from 'lucide-react';
import { useKioskStore } from '../../store/useKioskStore';
import LanguageToggle from './LanguageToggle';

export default function Navbar() {
  const { audioEnabled, toggleAudio } = useKioskStore();

  return (
    <header className="kiosk-nav">
      <div className="brand">
        <div className="brand-mark" aria-hidden="true"><Leaf size={27} strokeWidth={2.5} /></div>
        <div className="brand-copy">
          <strong>AyushCare</strong>
          <span>Digital Patient Care</span>
        </div>
      </div>

      <div className="brand-partner" aria-label="Ayushman Bharat">
        <span className="partner-emblem">✚</span>
        <span><b>AYUSHMAN</b><small>BHARAT</small></span>
      </div>

      <div className="nav-actions">
        <LanguageToggle />
        <button
          className="icon-button audio-header-button"
          onClick={toggleAudio}
          aria-label={audioEnabled ? 'Mute voice' : 'Enable voice'}
          title={audioEnabled ? 'Mute voice' : 'Enable voice'}
        >
          {audioEnabled ? <Volume2 size={22} /> : <VolumeX size={22} />}
        </button>
      </div>
    </header>
  );
}
