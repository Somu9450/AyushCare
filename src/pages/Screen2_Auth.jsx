import React, { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Fingerprint,
  IdCard,
  Loader2,
  LockKeyhole,
  Phone,
  QrCode,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';

import { useKioskStore } from '../store/useKioskStore';
import { useTranslation } from '../hooks/useTranslation';
import VirtualKeypad from '../components/common/VirtualKeypad';
import AudioButton from '../components/common/AudioButton';
import { SkeletonPatientVerification } from '../components/common/KioskSkeleton';

/* =========================================================
   AUTH TYPE CONFIGURATIONS
========================================================= */

const AUTH_TYPES = {
  ABHA: {
    key: 'tabAbha',
    label: 'ABHA Number',
    icon: IdCard,
    placeholder: '14-digit ABHA ID',
    maxLength: 14,
  },
  Aadhaar: {
    key: 'tabAadhaar',
    label: 'Aadhaar Card',
    icon: Fingerprint,
    placeholder: '12-digit Aadhaar Number',
    maxLength: 12,
  },
  Mobile: {
    key: 'tabMobile',
    label: 'Mobile & OTP',
    icon: Phone,
    placeholder: '10-digit Mobile Number',
    maxLength: 10,
  },
};

const Screen2_Auth = () => {
  const {
    sessionData,
    updateSessionData,
    setVerifiedPatient,
    nextScreen,
    language,
  } = useKioskStore();

  const { t, isHindi, isPunjabi, isBengali } = useTranslation();

  const [activeTab, setActiveTab] = useState(
    sessionData.authType || 'ABHA'
  );

  const [inputValue, setInputValue] = useState(
    sessionData.identifier || ''
  );

  const [otpValue, setOtpValue] = useState('');

  const [otpSent, setOtpSent] = useState(false);

  const [isVerifying, setIsVerifying] = useState(false);

  const [showKeypad, setShowKeypad] = useState(true);

  const isVerified =
    Boolean(
      sessionData.isVerified &&
      sessionData.patientProfile
    );

  /* -------------------------------------------------------
      HANDLERS
  ------------------------------------------------------- */

  const handleTabChange = (type) => {
    setActiveTab(type);
    setInputValue('');
    setOtpValue('');
    setOtpSent(false);

    updateSessionData({
      authType: type,
      identifier: '',
      isVerified: false,
      patientProfile: null,
    });
  };

  const handleKeyPress = (char) => {
    if (otpSent) {
      if (otpValue.length < 6) {
        setOtpValue((previous) => previous + char);
      }
      return;
    }

    const maxLength = AUTH_TYPES[activeTab].maxLength;

    if (inputValue.length < maxLength) {
      const nextValue = inputValue + char;
      setInputValue(nextValue);

      updateSessionData({
        identifier: nextValue,
      });
    }
  };

  const handleBackspace = () => {
    if (otpSent) {
      setOtpValue((previous) => previous.slice(0, -1));
      return;
    }

    const nextValue = inputValue.slice(0, -1);
    setInputValue(nextValue);

    updateSessionData({
      identifier: nextValue,
    });
  };

  const handleClear = () => {
    if (otpSent) {
      setOtpValue('');
      return;
    }

    setInputValue('');
    updateSessionData({
      identifier: '',
    });
  };

  const handleSendOtp = () => {
    if (inputValue.length < 10) {
      alert('Please enter a valid 10-digit mobile number');
      return;
    }

    setOtpSent(true);
  };

  const triggerVerification = () => {
    setIsVerifying(true);

    window.setTimeout(() => {
      setIsVerifying(false);

      const mockPatient =
        activeTab === 'Aadhaar'
          ? MOCK_PATIENTS.aadhaar
          : MOCK_PATIENTS.abha;

      setVerifiedPatient(mockPatient);
    }, 900);
  };

  const handleDemoPatient = () => {
    setInputValue('91443288129012');
    setIsVerifying(true);

    window.setTimeout(() => {
      setIsVerifying(false);

      setVerifiedPatient({
        name: 'Rajesh Sharma',
        hindiName: 'राजेश शर्मा',
        age: 42,
        gender: 'Male',
        abhaNumber: '91-4432-8812-9012',
        state: 'Delhi',
      });
    }, 400);
  };

  const handleContinue = () => {
    if (!isVerified) {
      return;
    }

    nextScreen();
  };

  const audioPrompt = t(
    'screen2.subtitle',
    'Enter your ABHA number, Aadhaar or registered mobile number to verify your identity.'
  );

  return (
    <div className="h-full w-full flex flex-col justify-center items-center px-4 py-2 select-none">

      <div className="w-full max-w-4xl">

        {/* --------------------------------------------------
            COMPACT HEADER
        --------------------------------------------------- */}
        <div className="mb-2.5 flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                {t('screen2.stepLabel', 'Step 1 · Identity')}
              </span>
              <h1 className="text-lg sm:text-xl font-black text-slate-900">
                {t('screen2.title', 'Verify your identity')}
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {t('screen2.subtitle', 'Enter your ABHA number, Aadhaar or registered mobile number.')}
            </p>
          </div>

          <AudioButton
            textToRead={audioPrompt}
            label={t('nav.listen', isHindi ? 'सुनें' : 'Listen')}
            className="min-h-[38px] py-1 text-xs"
          />
        </div>

        {/* --------------------------------------------------
            MAIN ATM CARD (2-COLUMN)
        --------------------------------------------------- */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">

          {/* Security strip */}
          <div className="px-4 py-1.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LockKeyhole className="w-3.5 h-3.5 text-teal-700" />
              <p className="text-[11px] font-semibold text-slate-600">
                {t('screen1.securityNote', 'ABHA & Aadhaar Integrated Terminal • Data Protected')}
              </p>
            </div>

            <button
              type="button"
              onClick={handleDemoPatient}
              className="text-[11px] font-bold text-teal-700 hover:underline cursor-pointer flex items-center gap-1"
            >
              <span>{t('screen2.demoQuickFill', 'Demo Quick Fill')}</span>
            </button>
          </div>

          <div className="p-3 sm:p-4">
            <div className="grid grid-cols-1 md:grid-cols-[1.1fr_0.9fr] gap-4 items-center">

              {/* LEFT COLUMN: Tabs + Input + Patient Info */}
              <div className="flex flex-col gap-2.5">

                {/* 3 Tabs */}
                <div className="grid grid-cols-3 gap-1.5">
                  {Object.entries(AUTH_TYPES).map(([type, config]) => {
                    const Icon = config.icon;
                    const active = activeTab === type;
                    const labelText = t(`screen2.${config.key}`, config.label);

                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => handleTabChange(type)}
                        className={`
                          h-11
                          rounded-xl
                          border-2
                          px-1.5
                          flex
                          items-center
                          justify-center
                          gap-1.5
                          cursor-pointer
                          transition
                          text-xs
                          font-black
                          ${
                            active
                              ? 'border-teal-700 bg-teal-50 text-teal-900 shadow-xs'
                              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                          }
                        `}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="truncate">{labelText}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Input with prompt */}
                <div>
                  <label className="block text-[11px] font-black text-slate-700 mb-1">
                    {activeTab === 'ABHA' &&
                      t('screen2.abhaPrompt', '14-Digit ABHA Number or ABHA Address')}
                    {activeTab === 'Aadhaar' &&
                      t('screen2.aadhaarPrompt', '12-Digit Aadhaar Number')}
                    {activeTab === 'Mobile' &&
                      (!otpSent
                        ? t('screen2.mobilePrompt', '10-Digit Registered Mobile Number')
                        : t('screen2.otpPrompt', '6-Digit SMS Verification Code'))}
                  </label>

                  <div className="relative flex items-center">
                    <input
                      readOnly
                      value={otpSent ? otpValue : inputValue}
                      placeholder={
                        otpSent
                          ? '• • • • • •'
                          : activeTab === 'ABHA'
                          ? '14-digit ABHA Number'
                          : activeTab === 'Aadhaar'
                          ? '12-digit Aadhaar Number'
                          : '10-digit Mobile Number'
                      }
                      className={`
                        w-full
                        h-12
                        rounded-xl
                        border-2
                        px-4
                        text-center
                        font-mono
                        text-xl
                        sm:text-2xl
                        font-black
                        tracking-widest
                        outline-none
                        ${
                          isVerified
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                            : 'border-slate-300 bg-slate-50 text-slate-900'
                        }
                      `}
                    />

                    {isVerified && (
                      <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 text-emerald-600" />
                    )}
                  </div>

                  {otpSent && (
                    <div className="mt-1 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">OTP sent to +91 {inputValue}</span>
                      <button
                        type="button"
                        onClick={() => setOtpSent(false)}
                        className="font-bold text-teal-700 underline cursor-pointer"
                      >
                        {t('screen2.reenter', 'Change')}
                      </button>
                    </div>
                  )}
                </div>

                {/* Patient Verification Card / Skeleton Loader */}
                {isVerifying ? (
                  <SkeletonPatientVerification />
                ) : isVerified ? (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-2.5 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-emerald-900 truncate">
                        {isHindi
                          ? sessionData.patientProfile?.hindiName || sessionData.patientProfile?.name
                          : sessionData.patientProfile?.name}
                      </p>
                      <div className="flex flex-wrap gap-x-3 text-[11px] text-emerald-700 font-medium">
                        <span>{sessionData.patientProfile?.age} Yrs • {sessionData.patientProfile?.gender}</span>
                        <span className="font-mono">ABHA: {sessionData.patientProfile?.abhaNumber}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-2 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center">
                    <p className="text-[11px] text-slate-500">
                      Tap digits on keypad to enter your details, then tap Verify
                    </p>
                  </div>
                )}

                {/* Primary Action Button */}
                <button
                  type="button"
                  disabled={!isVerified || isVerifying}
                  onClick={handleContinue}
                  className="
                    w-full
                    h-11
                    rounded-xl
                    bg-teal-700
                    hover:bg-teal-800
                    disabled:bg-slate-200
                    disabled:text-slate-400
                    text-white
                    font-black
                    flex
                    items-center
                    justify-between
                    px-4
                    cursor-pointer
                    disabled:cursor-not-allowed
                    transition
                    text-sm
                    shadow-xs
                  "
                >
                  <span>{t('nav.continue', 'Continue to Care Track')}</span>
                  {isVerifying ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <ArrowRight className="w-5 h-5" />
                  )}
                </button>

              </div>

              {/* RIGHT COLUMN: Virtual Keypad */}
              <div className="flex flex-col items-center justify-center">
                <VirtualKeypad
                  onKeyPress={handleKeyPress}
                  onBackspace={handleBackspace}
                  onClear={handleClear}
                  onSubmit={
                    activeTab === 'Mobile' && !otpSent
                      ? handleSendOtp
                      : triggerVerification
                  }
                  submitLabel={
                    activeTab === 'Mobile' && !otpSent
                      ? t('screen2.sendOtp', 'Send OTP')
                      : t('screen2.verifyOtp', 'Verify ID')
                  }
                />
              </div>

            </div>
          </div>
        </div>

        {/* Bottom security assurance */}
        <div className="mt-2 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{t('screen2.noAccount', 'AyushCare OS • DPDP Compliant Patient Terminal')}</span>
        </div>

      </div>

    </div>
  );
};

export default Screen2_Auth;