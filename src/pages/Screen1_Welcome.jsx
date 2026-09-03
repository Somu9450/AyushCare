import React from 'react';
import {
  ArrowRight,
  AlertTriangle,
  HeartPulse,
  Languages,
  Mic,
  ShieldCheck,
  Accessibility,
} from 'lucide-react';

import { useKioskStore } from '../store/useKioskStore';
import { useTranslation } from '../hooks/useTranslation';
import LanguageToggle from '../components/common/LanguageToggle';
import AudioButton from '../components/common/AudioButton';

const Screen1_Welcome = () => {
  const {
    nextScreen,
    toggleEmergencyModal,
    language,
  } = useKioskStore();

  const { t } = useTranslation();

  const welcomeSpeech =
    language === 'hi'
      ? 'आयुषकेयर में आपका स्वागत है। अपनी ओपीडी प्रक्रिया शुरू करने के लिए नीचे दिए बटन को दबाएं। आप आवाज़ या स्क्रीन के माध्यम से अपनी जानकारी दे सकते हैं।'
      : 'Welcome to AyushCare. Touch the button below to begin your OPD visit. You can communicate using your voice or the touchscreen.';

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-6 sm:px-6 md:px-10">
      <div className="w-full max-w-5xl">

        {/* --------------------------------------------------
            MAIN WELCOME CARD
        --------------------------------------------------- */}

        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">

          {/* Top identity strip */}

          <div className="px-5 py-4 sm:px-8 border-b border-slate-100 flex items-center justify-between gap-4">

            <div className="flex items-center gap-3">

              <div className="w-11 h-11 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center">
                <HeartPulse className="w-6 h-6 text-teal-700" />
              </div>

              <div>
                <p className="font-black text-slate-900 leading-tight">
                  AyushCare
                </p>

                <p className="text-xs text-slate-500">
                  Digital Patient Kiosk
                </p>
              </div>

            </div>

            <AudioButton
              textToRead={welcomeSpeech}
              label={
                language === 'hi'
                  ? 'सुनें'
                  : 'Listen'
              }
            />

          </div>

          {/* ------------------------------------------------
              HERO
          ------------------------------------------------- */}

          <div className="px-5 py-10 sm:px-10 sm:py-14 text-center">

            <div className="mx-auto w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-teal-700 flex items-center justify-center shadow-lg">
              <HeartPulse className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
            </div>

            <div className="mt-7">

              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900">
                Welcome to{' '}
                <span className="text-teal-700">
                  AyushCare
                </span>
              </h1>

              <p className="mt-3 text-xl sm:text-2xl font-bold text-slate-700">
                आयुषकेयर में आपका स्वागत है
              </p>

              <p className="mt-4 max-w-2xl mx-auto text-sm sm:text-base leading-7 text-slate-500">
                Start your OPD visit by identifying yourself,
                choosing your department and answering a few
                simple health questions.
              </p>

              <p className="mt-1 text-sm sm:text-base text-slate-500">
                अपनी पहचान सत्यापित करें, विभाग चुनें और कुछ
                आसान स्वास्थ्य प्रश्नों के उत्तर दें।
              </p>

            </div>

            {/* ------------------------------------------------
                ACCESSIBILITY / COMMUNICATION FEATURES
            ------------------------------------------------- */}

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl mx-auto">

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-left flex gap-3">

                <Mic className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />

                <div>
                  <p className="text-sm font-bold text-slate-800">
                    Voice supported
                  </p>

                  <p className="text-xs text-slate-500 mt-1">
                    आवाज़ से जवाब दें
                  </p>
                </div>

              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-left flex gap-3">

                <Accessibility className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />

                <div>
                  <p className="text-sm font-bold text-slate-800">
                    Touch friendly
                  </p>

                  <p className="text-xs text-slate-500 mt-1">
                    बोलना जरूरी नहीं है
                  </p>
                </div>

              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-left flex gap-3">

                <ShieldCheck className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />

                <div>
                  <p className="text-sm font-bold text-slate-800">
                    Privacy first
                  </p>

                  <p className="text-xs text-slate-500 mt-1">
                    आपकी जानकारी सुरक्षित
                  </p>
                </div>

              </div>

            </div>

            {/* ------------------------------------------------
                LANGUAGE
            ------------------------------------------------- */}

            <div className="mt-8">

              <div className="flex items-center justify-center gap-2 mb-3">

                <Languages className="w-4 h-4 text-slate-500" />

                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {t(
                    'screen1.selectLanguage',
                    'Select Language / भाषा चुनें'
                  )}
                </p>

              </div>

              <div className="flex justify-center">
                <LanguageToggle variant="grid" />
              </div>

            </div>

            {/* ------------------------------------------------
                PRIMARY ACTION
            ------------------------------------------------- */}

            <div className="mt-8 max-w-2xl mx-auto">

              <button
                type="button"
                onClick={nextScreen}
                className="
                  w-full
                  min-h-[82px]
                  px-6
                  sm:px-8
                  rounded-2xl
                  bg-teal-700
                  hover:bg-teal-800
                  active:scale-[0.99]
                  text-white
                  flex
                  items-center
                  justify-between
                  gap-4
                  shadow-lg
                  transition
                  cursor-pointer
                  kiosk-focus
                "
              >

                <div className="text-left">

                  <span className="block text-lg sm:text-xl font-black">
                    Start OPD Check-In
                  </span>

                  <span className="block mt-1 text-sm text-teal-100">
                    ओपीडी चेक-इन शुरू करें
                  </span>

                </div>

                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-white/15 flex items-center justify-center shrink-0">

                  <ArrowRight className="w-7 h-7" />

                </div>

              </button>

            </div>

            {/* ------------------------------------------------
                EMERGENCY
            ------------------------------------------------- */}

            <div className="mt-5 max-w-2xl mx-auto">

              <button
                type="button"
                onClick={() =>
                  toggleEmergencyModal(true)
                }
                className="
                  w-full
                  min-h-[68px]
                  px-5
                  rounded-xl
                  border-2
                  border-red-200
                  bg-red-50
                  hover:bg-red-100
                  text-left
                  flex
                  items-center
                  gap-4
                  transition
                  cursor-pointer
                "
              >

                <div className="w-11 h-11 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0">

                  <AlertTriangle className="w-6 h-6" />

                </div>

                <div className="flex-1">

                  <p className="font-black text-red-800">
                    Emergency Assistance
                  </p>

                  <p className="text-xs sm:text-sm text-red-700 mt-1">
                    आपातकालीन सहायता के लिए यहां दबाएं
                  </p>

                </div>

                <span className="hidden sm:block px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-black">
                  SOS
                </span>

              </button>

            </div>

          </div>

        </div>

        {/* Footer note */}

        <p className="text-center text-xs text-slate-400 mt-4">
          Please ask hospital staff for assistance if required.
          &nbsp;•&nbsp;
          आवश्यकता होने पर अस्पताल के कर्मचारी से सहायता लें।
        </p>

      </div>
    </div>
  );
};

export default Screen1_Welcome;