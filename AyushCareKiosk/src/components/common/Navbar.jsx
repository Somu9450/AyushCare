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
      <div className="brand">
        <div className="brand-ayushman" aria-hidden="true">
          <img
            src="https://www.uxdt.nic.in/wp-content/uploads/2025/09/ayushman-bharat-digital-mission-feature--ayushman-bharat-digital-mission.jpg"
            alt="Ayushman Bharat Digital Mission"
          />
        </div>
        <div className="brand-divider" />
        <div className="brand-copy">
          <strong>
            <span>Ayush</span>Care
          </strong>
          <small>{t('kioskTitle','Digital Patient Care Kiosk')}</small>
        </div>
        <div className="brand-tagline">
          <span>{t('healthierIndia','Healthier India')}</span>
          <span>{t('strongerTomorrow','Stronger Tomorrow')}</span>
        </div>
      </div>

      <div className="nav-actions">
        <LanguageToggle />
        <button
          className="icon-button nav-sound"
          onClick={() => { if (audioEnabled) audioService.stop(); toggleAudio(); }}
          aria-label={audioEnabled ? t('muteAudio','Mute audio') : t('enableAudio','Enable audio')}
          title={audioEnabled ? t('muteAudio','Mute audio') : t('enableAudio','Enable audio')}
        >
          {audioEnabled ? <Volume2 size={22} /> : <VolumeX size={22} />}
        </button>
      </div>
    </header>
  );
}
