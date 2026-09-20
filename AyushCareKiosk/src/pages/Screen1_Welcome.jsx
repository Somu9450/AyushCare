import { ArrowRight, ShieldCheck, Globe, Mic } from 'lucide-react';
import { useKioskStore } from '../store/useKioskStore';
import { useTranslation } from '../hooks/useTranslation';

export default function Screen1_Welcome(){
 const {nextScreen}=useKioskStore(); const {t}=useTranslation();
        return (
    <div className="welcome-screen-container">
      {/* Center Welcome Hero Content */}
      <div className="welcome-hero-content">
        {/* Top Eyebrow Tagline */}
        <p className="welcome-eyebrow">
          {t('swasthBharatTagline', 'SWASTH BHARAT • SAMRIDDH BHARAT')}
        </p>
        {/* Center AyushCare Lotus Logo */}
        <div className="welcome-logo-wrap">
          <img
            src="/ayushCareLogo.png"
            alt="AyushCare Logo"
            className="welcome-logo-img"
          />
        </div>
        {/* Welcome Headings */}
        <h2 className="welcome-heading-small">
          {t('welcomeTo', 'Welcome to')}
        </h2>
        <h1 className="welcome-brand-name">
          <span className="welcome-brand-ayush">Ayush</span>
          <span className="welcome-brand-care">Care</span>
        </h1>
        <p className="welcome-tagline">
          {t('yourHealthOurTradition', 'Your Health, Our Tradition')}
        </p>
        {/* 3 Feature Badges in a Row */}
        <div className="welcome-features-grid">
          <div className="welcome-feature-item">
            <div className="welcome-feature-icon-circle">
              <ShieldCheck size={26} className="welcome-feature-icon" />
            </div>
            <h3 className="welcome-feature-title">
              {t('privateSecure', 'Private & Secure')}
            </h3>
            <p className="welcome-feature-desc">
              {t('dataSafeWithUs', 'Your data is safe with us')}
            </p>
          </div>
          <div className="welcome-feature-item">
            <div className="welcome-feature-icon-circle">
              <Globe size={26} className="welcome-feature-icon" />
            </div>
            <h3 className="welcome-feature-title">
              {t('languages22', '22 Indian Languages')}
            </h3>
            <p className="welcome-feature-desc">
              {t('accessibleForEveryIndian', 'Accessible for every Indian')}
            </p>
          </div>
          <div className="welcome-feature-item">
            <div className="welcome-feature-icon-circle">
              <Mic size={26} className="welcome-feature-icon" />
            </div>
            <h3 className="welcome-feature-title">
              {t('voiceTouch', 'Voice + Touch')}
            </h3>
            <p className="welcome-feature-desc">
              {t('usePreferredWay', 'Use your preferred way to interact')}
            </p>
          </div>
        </div>
        {/* Large Continue Action Button */}
        <button
          type="button"
          className="welcome-continue-btn"
          onClick={nextScreen}
          aria-label={t('continue', 'Continue')}
        >
          <span>{t('continue', 'Continue')}</span>
          <ArrowRight size={20} className="welcome-continue-arrow" />
        </button>
      </div>
      {/* Bottom Corner Decorative Texts */}
      <div className="welcome-bottom-row">
        <div className="welcome-corner-left">
               <p className="welcome-corner-italic">
            Ancient Wisdom<br />
            for a Healthier<br />
            Tomorrow
          </p>
          <div className="welcome-corner-bar" />
        </div>
        <div className="welcome-corner-right">
          <p className="welcome-corner-caps">
            AYUSH<br />
            FOR A HEALTHIER<br />
            INDIA
          </p>
          <div className="welcome-corner-bar-right" />
        </div>
      </div>
    </div>
  );
}
