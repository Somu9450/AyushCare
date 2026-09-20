import React from "react";
import { Volume2, VolumeX, ChevronDown } from "lucide-react";
import { useKioskStore } from "../../store/useKioskStore";
import LanguageToggle from "./LanguageToggle";
import { audioService } from '../../services/audioService';
import { useTranslation } from '../../hooks/useTranslation';

export default function Navbar() {
  const { audioEnabled, toggleAudio } = useKioskStore();
  const { t } = useTranslation();

  return (
    <header className="kiosk-nav">
      {/* Top Left: AyushCare Brand Logo + Title + Tagline */}
      <div className="brand">
        <div className="brand-logo-wrap" aria-hidden="true">
          <img
             src="/ayushCareLogo.png"
            alt="AyushCare Logo"
            className="brand-logo-img"
          />
        </div>
        <div className="brand-copy">
          <strong className="brand-title">
            <span className="brand-title-ayush">Ayush</span>
            <span className="brand-title-care">Care</span>
          </strong>
          <small className="brand-subtitle">{t('kioskTitle', 'Digital Patient Care Kiosk')}</small>
        </div>
        <div className="brand-divider" aria-hidden="true" />
        <div className="brand-tagline">
          <span>{t('traditionalWisdom', 'Traditional Wisdom')}</span>
          <span>{t('modernCare', 'Modern Care')}</span>
        </div>
      </div>

{/* Top Right: Language Toggle, Audio Toggle, and Ayushman Bharat Brand */}
      <div className="nav-actions">
        <LanguageToggle />
        <button
        type="button"
          className="icon-button nav-sound"
          onClick={() => { if (audioEnabled) audioService.stop(); toggleAudio(); }}
          aria-label={audioEnabled ? t('muteAudio', 'Mute audio') : t('enableAudio', 'Enable audio')}
          title={audioEnabled ? t('muteAudio', 'Mute audio') : t('enableAudio', 'Enable audio')}
        >
           {audioEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
        </button>
         <div className="nav-ayushman-brand">
          <img
            src="/ayushman-bharat-icon.png"
            alt="Ayushman Bharat"
            className="nav-ayushman-logo"
          />
          <div className="nav-ayushman-text">
            <strong className="nav-ayushman-title">Ayushman Bharat</strong>
            <small className="nav-ayushman-subtitle">Swasth Bharat, Samriddh Bharat</small>
          </div>
        </div>
      </div>
    </header>
  );
}
