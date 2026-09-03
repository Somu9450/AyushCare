import React, { useState, useEffect } from 'react';
import { Shield, Activity, Clock, AlertCircle, HeartPulse, Sparkles } from 'lucide-react';
import { useKioskStore } from '../../store/useKioskStore';
import { useTranslation } from '../../hooks/useTranslation';
import LanguageToggle from './LanguageToggle';
import AudioButton from './AudioButton';

export const Navbar = () => {
  const { currentScreen, toggleEmergencyModal, resetSession } = useKioskStore();
  const { t, language } = useTranslation();
  const [time, setTime] = useState('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        })
      );
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="bg-teal-900 border-b border-teal-800 text-white select-none sticky top-0 z-40 shadow-lg">
      {/* Top Ministry Banner */}
      <div className="bg-teal-950/80 px-4 py-1.5 border-b border-teal-800/60 text-[11px] sm:text-xs flex items-center justify-between font-medium text-teal-200">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-amber-300 font-semibold tracking-wide">
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            {t('app.ministry', 'Ministry of Ayush • Government of India')}
          </span>
          <span className="hidden md:inline text-teal-400">•</span>
          <span className="hidden md:inline text-teal-300">
            {t('app.nha', 'Ayushman Bharat Digital Mission (ABDM)')}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 bg-teal-800/80 px-2.5 py-0.5 rounded-full text-emerald-300 font-mono text-[10px] tracking-wider uppercase border border-teal-700">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            {t('app.kioskId', 'KIOSK-DEL-AIIMS-04')}
          </span>
          <span className="hidden sm:inline bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded text-[11px] font-semibold border border-amber-500/30">
            {t('app.poweredBy', 'Sanvad OS v2.4')}
          </span>
        </div>
      </div>

      {/* Main Kiosk Navigation Bar */}
      <div className="px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        {/* Brand & Emblem */}
        <div 
          onClick={resetSession}
          className="flex items-center gap-3 cursor-pointer group"
          title="Return to Welcome Screen"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-teal-500 to-emerald-400 p-0.5 shadow-md group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-teal-950 rounded-[14px] flex items-center justify-center">
              <HeartPulse className="w-7 h-7 text-amber-400 group-hover:text-amber-300 transition-colors" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center">
                Ayush<span className="text-amber-400">Care</span>
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-widest bg-teal-800 px-2 py-0.5 rounded-md text-teal-200 border border-teal-700">
                Kiosk
              </span>
            </div>
            <p className="text-xs text-teal-200 font-medium hidden sm:block">
              {language === 'hi' ? 'आयुष एवं आधुनिक स्वास्थ्य ओपीडी कियोस्क' : 'National Digital Health & Ayush Terminal'}
            </p>
          </div>
        </div>

        {/* Live Clock & Action Tools */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Live Clock */}
          <div className="hidden lg:flex items-center gap-2 bg-teal-950/40 px-3 py-1.5 rounded-xl border border-teal-700/50 text-teal-100 font-mono text-sm">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>{time || '--:--:--'}</span>
          </div>

          {/* Audio Instruction Button */}
          <AudioButton className="hidden md:inline-flex" />

          {/* Language Switcher */}
          <LanguageToggle variant="pill" />

          {/* Emergency SOS Button */}
          <button
            type="button"
            onClick={() => toggleEmergencyModal(true)}
            className="flex items-center gap-2 px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md cursor-pointer active:scale-95 transition-all min-h-[40px] border border-rose-500"
          >
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300 animate-pulse" />
            <span className="hidden sm:inline">{t('screen1.emergency', 'Emergency')}</span>
            <span className="sm:hidden">SOS</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
