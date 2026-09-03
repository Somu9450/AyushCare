import React from 'react';
import { 
  HeartPulse, 
  ArrowRight, 
  AlertTriangle, 
  ShieldCheck, 
  Sparkles, 
  Clock, 
  Users, 
  Leaf, 
  Activity,
  Fingerprint,
  QrCode
} from 'lucide-react';
import { useKioskStore } from '../store/useKioskStore';
import { useTranslation } from '../hooks/useTranslation';
import LanguageToggle from '../components/common/LanguageToggle';
import AudioButton from '../components/common/AudioButton';

export const Screen1_Welcome = () => {
  const { nextScreen, toggleEmergencyModal, language } = useKioskStore();
  const { t } = useTranslation();

  const welcomeSpeechText = language === 'hi'
    ? 'आयुषकेयर डिजिटल स्वास्थ्य कियोस्क में आपका स्वागत है। ओपीडी चेक-इन शुरू करने के लिए हरे बटन पर स्पर्श करें। आपातकालीन सहायता के लिए लाल बटन दबाएं।'
    : 'Welcome to AyushCare Digital Health Kiosk. Touch the start check-in button to begin your OPD registration. For emergency assistance, press the red emergency button.';

  return (
    <div className="flex-1 flex flex-col justify-between p-4 sm:p-8 md:p-12 max-w-7xl mx-auto w-full select-none animate-in fade-in duration-300">
      
      {/* Top Banner / Announcement Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-teal-900/10 border border-teal-800/20 backdrop-blur-sm">
        <div className="flex items-center gap-3 text-teal-900 font-semibold text-sm">
          <div className="w-8 h-8 rounded-xl bg-teal-700 text-amber-300 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <span>
            {language === 'hi' 
              ? 'आयुष मंत्रालय एवं एनएचए (ABDM) द्वारा प्रमाणित स्व-सेवा ओपीडी टर्मिनल'
              : 'Ministry of Ayush & NHA (ABDM) Certified Self-Service OPD Terminal'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <AudioButton 
            textToRead={welcomeSpeechText} 
            label={language === 'hi' ? 'बोलकर सुनें' : 'Listen Voice Prompt'}
          />
        </div>
      </div>

      {/* Center Hero Section */}
      <div className="my-6 md:my-10 flex flex-col items-center text-center space-y-6 max-w-4xl mx-auto">
        
        {/* Emblem & Branding Glow */}
        <div className="relative">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-teal-800 via-teal-700 to-emerald-600 p-1 shadow-2xl flex items-center justify-center ring-8 ring-teal-500/15">
            <div className="w-full h-full bg-teal-950 rounded-[22px] flex items-center justify-center">
              <HeartPulse className="w-14 h-14 sm:w-16 sm:h-16 text-amber-400 animate-pulse" />
            </div>
          </div>
          <div className="absolute -bottom-2 -right-2 bg-emerald-600 text-white p-2 rounded-xl shadow-lg border-2 border-white">
            <Leaf className="w-5 h-5 text-emerald-100" />
          </div>
        </div>

        {/* Dynamic Dual Language Main Titles */}
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight">
            Welcome to <span className="text-teal-800">Ayush</span><span className="text-amber-600">Care</span>
          </h1>
          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-teal-900/90 font-serif">
            आयुषकेयर डिजिटल स्वास्थ्य कियोस्क में आपका स्वागत है
          </p>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto font-medium pt-1">
            {t('screen1.instructions', 'Touch anywhere to begin or select your preferred language below. Assistance is available at any time.')}
          </p>
        </div>

        {/* Language Grid Selector */}
        <div className="w-full pt-2 flex flex-col items-center">
          <p className="text-xs uppercase font-bold tracking-widest text-slate-500 mb-3">
            {t('screen1.selectLanguage', 'Select Your Language / भाषा चुनें')}
          </p>
          <LanguageToggle variant="grid" />
        </div>

        {/* Massive Touch-Optimized Action Buttons */}
        <div className="w-full max-w-2xl pt-4 space-y-4">
          
          {/* Primary Action Button (min 72px touch height) */}
          <button
            type="button"
            onClick={nextScreen}
            className="w-full min-h-[76px] px-8 py-5 rounded-2xl bg-gradient-to-r from-teal-800 via-teal-700 to-teal-800 hover:from-teal-700 hover:to-teal-600 text-white shadow-xl shadow-teal-900/20 active:scale-[0.98] transition-all duration-150 flex items-center justify-between border-2 border-teal-600/50 cursor-pointer group"
          >
            <div className="flex items-center gap-4 text-left">
              <div className="w-14 h-14 rounded-xl bg-white/15 flex items-center justify-center text-amber-300 group-hover:scale-110 transition-transform">
                <Fingerprint className="w-8 h-8" />
              </div>
              <div>
                <span className="block text-xl sm:text-2xl font-black tracking-wide">
                  {t('screen1.startCheckIn', 'Touch Here to Start Check-In')}
                </span>
                <span className="text-xs sm:text-sm text-teal-100 font-medium">
                  {t('screen1.startCheckInSub', 'Fast track OPD token in under 60 seconds')}
                </span>
              </div>
            </div>

            <div className="w-12 h-12 rounded-xl bg-amber-400 text-teal-950 flex items-center justify-center font-bold shadow-md group-hover:translate-x-1 transition-transform shrink-0">
              <ArrowRight className="w-7 h-7" />
            </div>
          </button>

          {/* Emergency Assistance Button (min 64px touch height) */}
          <button
            type="button"
            onClick={() => toggleEmergencyModal(true)}
            className="w-full min-h-[64px] px-6 py-4 rounded-2xl bg-rose-50 hover:bg-rose-100/90 text-rose-900 border-2 border-rose-300 shadow-md active:scale-[0.98] transition-all flex items-center justify-between cursor-pointer group"
          >
            <div className="flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center animate-pulse shrink-0">
                <AlertTriangle className="w-6 h-6 text-amber-300" />
              </div>
              <div>
                <span className="block text-base sm:text-lg font-bold text-rose-800">
                  {t('screen1.emergency', 'Emergency Assistance')}
                </span>
                <span className="text-xs text-rose-700/80 font-medium">
                  {t('screen1.emergencySub', 'Severe chest pain, bleeding, or unconsciousness')}
                </span>
              </div>
            </div>

            <span className="text-xs uppercase font-extrabold tracking-wider bg-rose-600 text-white px-3 py-1 rounded-lg">
              SOS
            </span>
          </button>
        </div>
      </div>

      {/* Hospital Kiosk Live Metadata Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-4xl mx-auto w-full pt-4">
        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center gap-3">
          <Clock className="w-5 h-5 text-teal-700 shrink-0" />
          <div className="text-left">
            <p className="text-xs font-bold text-slate-800">{t('screen1.quickStats.avgWait')}</p>
            <p className="text-[11px] text-slate-500">Live queue optimization</p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center gap-3">
          <Users className="w-5 h-5 text-emerald-700 shrink-0" />
          <div className="text-left">
            <p className="text-xs font-bold text-slate-800">{t('screen1.quickStats.doctorsOnDuty')}</p>
            <p className="text-[11px] text-slate-500">Allopathy & Ayush OPD</p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0" />
          <div className="text-left">
            <p className="text-xs font-bold text-slate-800">ABDM M1/M2 Certified</p>
            <p className="text-[11px] text-slate-500">Encrypted data terminal</p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Screen1_Welcome;
