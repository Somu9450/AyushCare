import React from 'react';
import { Volume2, VolumeX, ChevronDown } from 'lucide-react';
import { useKioskStore } from '../../store/useKioskStore';
import LanguageToggle from './LanguageToggle';

export default function Navbar() {
  const { audioEnabled, toggleAudio } = useKioskStore();

  return (
    <header className="kiosk-nav">
      <div className="brand">
        <div className="brand-ayushman" aria-hidden="true">
          <img src="/ayushman-bharat-logo.png" alt="" />
        </div>
        <div className="brand-divider" />
        <div className="brand-copy">
          <strong><span>Ayush</span>Care</strong>
          <small>Digital Patient Care Kiosk</small>
        </div>
        <div className="brand-tagline">
          <span>Healthier India</span>
          <span>Stronger Tomorrow</span>
        </div>
      </div>

      <div className="nav-actions">
        <LanguageToggle />
        <button
          className="icon-button nav-sound"
          onClick={toggleAudio}
          aria-label={audioEnabled ? 'Mute audio' : 'Enable audio'}
          title={audioEnabled ? 'Mute audio' : 'Enable audio'}
        >
          {audioEnabled ? <Volume2 size={22} /> : <VolumeX size={22} />}
        </button>
      </div>
    </header>
  );
}
