import React, { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Fingerprint,
  Loader2,
  LockKeyhole,
  QrCode,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';

import {
  MOCK_PATIENTS,
  useKioskStore,
} from '../store/useKioskStore';

import { useTranslation } from '../hooks/useTranslation';
import VirtualKeypad from '../components/common/VirtualKeypad';
import AudioButton from '../components/common/AudioButton';

const AUTH_TYPES = {
  ABHA: {
    label: 'ABHA',
    hindi: 'आभा',
    icon: CreditCard,
    placeholder: '91-XXXX-XXXX-XXXX',
  },

  Aadhaar: {
    label: 'Aadhaar',
    hindi: 'आधार',
    icon: Fingerprint,
    placeholder: 'XXXX XXXX XXXX',
  },

  Mobile: {
    label: 'Mobile OTP',
    hindi: 'मोबाइल OTP',
    icon: Smartphone,
    placeholder: '98765 43210',
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

  const { t } = useTranslation();

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
     TAB CHANGE
  -------------------------------------------------------- */

  const handleTabChange = (type) => {

    setActiveTab(type);
    setInputValue('');
    setOtpValue('');
    setOtpSent(false);

    updateSessionData({
      authType: type,
      identifier: '',
      otp: '',
      isVerified: false,
      patientProfile: null,
    });
  };

  /* -------------------------------------------------------
     INPUT
  -------------------------------------------------------- */

  const handleKeyPress = (value) => {

    if (otpSent) {

      if (otpValue.length < 6) {
        setOtpValue(
          (previous) =>
            `${previous}${value}`
        );
      }

      return;
    }

    const clean =
      `${inputValue}${value}`.replace(
        /\D/g,
        ''
      );

    if (activeTab === 'ABHA') {

      if (clean.length > 14) {
        return;
      }

      let formatted = clean;

      if (clean.length > 2) {
        formatted =
          `${clean.slice(0, 2)}-${clean.slice(2)}`;
      }

      if (clean.length > 6) {
        formatted =
          `${clean.slice(0, 2)}-${clean.slice(2, 6)}-${clean.slice(6)}`;
      }

      if (clean.length > 10) {
        formatted =
          `${clean.slice(0, 2)}-${clean.slice(2, 6)}-${clean.slice(6, 10)}-${clean.slice(10, 14)}`;
      }

      setInputValue(formatted);

      return;
    }

    if (activeTab === 'Aadhaar') {

      if (clean.length > 12) {
        return;
      }

      let formatted = clean;

      if (clean.length > 4) {
        formatted =
          `${clean.slice(0, 4)} ${clean.slice(4)}`;
      }

      if (clean.length > 8) {
        formatted =
          `${clean.slice(0, 4)} ${clean.slice(4, 8)} ${clean.slice(8)}`;
      }

      setInputValue(formatted);

      return;
    }

    if (activeTab === 'Mobile') {

      if (clean.length <= 10) {
        setInputValue(clean);
      }
    }
  };

  const handleBackspace = () => {

    if (otpSent) {
      setOtpValue(
        (previous) =>
          previous.slice(0, -1)
      );
      return;
    }

    setInputValue(
      (previous) =>
        previous.slice(0, -1)
    );
  };

  const handleClear = () => {

    if (otpSent) {
      setOtpValue('');
      return;
    }

    setInputValue('');
  };

  /* -------------------------------------------------------
     MOCK VERIFICATION
  -------------------------------------------------------- */

  const triggerVerification = () => {

    if (isVerifying) {
      return;
    }

    setIsVerifying(true);

    window.setTimeout(() => {

      const mockUser =
        activeTab === 'Aadhaar'
          ? MOCK_PATIENTS.aadhaar
          : MOCK_PATIENTS.abha;

      setVerifiedPatient(
        mockUser,
        activeTab,
        inputValue ||
          mockUser.abhaNumber
      );

      setIsVerifying(false);

    }, 900);
  };

  /* -------------------------------------------------------
     MOBILE OTP
  -------------------------------------------------------- */

  const handleSendOtp = () => {

    if (inputValue.length !== 10) {
      return;
    }

    setOtpSent(true);
  };

  /* -------------------------------------------------------
     DEMO QUICK FILL
  -------------------------------------------------------- */

  const handleDemoPatient = () => {

    const patient =
      MOCK_PATIENTS.abha;

    setActiveTab('ABHA');

    setInputValue(
      patient.abhaNumber
    );

    setIsVerifying(true);

    window.setTimeout(() => {

      setVerifiedPatient(
        patient,
        'ABHA',
        patient.abhaNumber
      );

      setIsVerifying(false);

    }, 600);
  };

  /* -------------------------------------------------------
     CONTINUE
  -------------------------------------------------------- */

  const handleContinue = () => {

    if (!isVerified) {
      return;
    }

    nextScreen();
  };

  const audioPrompt =
    language === 'hi'
      ? 'अपना आभा नंबर, आधार या मोबाइल नंबर दर्ज करके पहचान सत्यापित करें।'
      : 'Enter your ABHA number, Aadhaar or registered mobile number to verify your identity.';

  const ActiveIcon =
    AUTH_TYPES[activeTab].icon;

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-6 sm:px-6 md:px-10">

      <div className="w-full max-w-5xl">

        {/* --------------------------------------------------
            HEADER
        --------------------------------------------------- */}

        <div className="mb-5 flex items-start justify-between gap-4">

          <div>

            <p className="text-xs font-black uppercase tracking-wider text-teal-700">
              Step 1 · Identity
            </p>

            <h1 className="mt-2 text-2xl sm:text-3xl font-black text-slate-900">
              Verify your identity
            </h1>

            <p className="mt-1 text-sm sm:text-base text-slate-500">
              अपनी पहचान सत्यापित करें
            </p>

          </div>

          <AudioButton
            textToRead={audioPrompt}
            label={
              language === 'hi'
                ? 'सुनें'
                : 'Listen'
            }
          />

        </div>

        {/* --------------------------------------------------
            MAIN CARD
        --------------------------------------------------- */}

        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">

          {/* Security strip */}

          <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2">

            <LockKeyhole className="w-4 h-4 text-teal-700" />

            <p className="text-xs font-semibold text-slate-600">
              Your information is handled securely for this kiosk session.
            </p>

          </div>

          <div className="p-5 sm:p-8">

            {/* ------------------------------------------------
                AUTH TYPE
            ------------------------------------------------- */}

            <div className="grid grid-cols-3 gap-2 sm:gap-3">

              {Object.entries(AUTH_TYPES).map(
                ([type, config]) => {

                  const Icon =
                    config.icon;

                  const active =
                    activeTab === type;

                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() =>
                        handleTabChange(type)
                      }
                      className={`
                        min-h-[78px]
                        rounded-xl
                        border-2
                        px-2
                        sm:px-4
                        flex
                        flex-col
                        sm:flex-row
                        items-center
                        justify-center
                        gap-2
                        cursor-pointer
                        transition
                        ${
                          active
                            ? 'border-teal-700 bg-teal-50 text-teal-900'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                        }
                      `}
                    >

                      <Icon className="w-6 h-6" />

                      <span className="text-xs sm:text-sm font-black text-center">
                        {config.label}

                        <small className="block font-medium mt-1">
                          {config.hindi}
                        </small>
                      </span>

                    </button>
                  );
                }
              )}

            </div>

            {/* ------------------------------------------------
                INPUT
            ------------------------------------------------- */}

            <div className="mt-6">

              <label className="block text-sm font-black text-slate-800 mb-2">

                {activeTab === 'ABHA' &&
                  'Enter your ABHA number'}

                {activeTab === 'Aadhaar' &&
                  'Enter your Aadhaar number'}

                {activeTab === 'Mobile' &&
                  (!otpSent
                    ? 'Enter registered mobile number'
                    : 'Enter OTP')}

                <span className="block text-xs font-medium text-slate-500 mt-1">
                  {activeTab === 'ABHA' &&
                    'अपना आभा नंबर दर्ज करें'}

                  {activeTab === 'Aadhaar' &&
                    'अपना आधार नंबर दर्ज करें'}

                  {activeTab === 'Mobile' &&
                    (!otpSent
                      ? 'पंजीकृत मोबाइल नंबर दर्ज करें'
                      : 'OTP दर्ज करें')}
                </span>

              </label>

              <div className="relative">

                <input
                  readOnly
                  value={
                    otpSent
                      ? otpValue
                      : inputValue
                  }
                  placeholder={
                    otpSent
                      ? '• • • • • •'
                      : AUTH_TYPES[
                          activeTab
                        ].placeholder
                  }
                  className={`
                    w-full
                    min-h-[76px]
                    rounded-xl
                    border-2
                    px-5
                    text-center
                    font-mono
                    text-2xl
                    sm:text-3xl
                    font-black
                    tracking-wider
                    outline-none
                    ${
                      isVerified
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                        : 'border-slate-300 bg-slate-50 text-slate-900'
                    }
                  `}
                />

                {isVerified && (
                  <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 w-7 h-7 text-emerald-600" />
                )}

              </div>

              {/* Mobile OTP helper */}

              {otpSent && (
                <div className="mt-3 flex items-center justify-between gap-3">

                  <p className="text-xs text-slate-500">
                    OTP sent to +91 {inputValue}
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      setOtpSent(false)
                    }
                    className="min-h-[44px] px-3 text-xs font-bold text-teal-700 underline cursor-pointer"
                  >
                    Change number
                  </button>

                </div>
              )}

            </div>

            {/* ------------------------------------------------
                KEYPAD
            ------------------------------------------------- */}

            {!isVerified && showKeypad && (
              <div className="mt-5">

                <VirtualKeypad
                  onKeyPress={handleKeyPress}
                  onBackspace={handleBackspace}
                  onClear={handleClear}
                  onSubmit={
                    activeTab === 'Mobile' &&
                    !otpSent
                      ? handleSendOtp
                      : triggerVerification
                  }
                  submitLabel={
                    activeTab === 'Mobile' &&
                    !otpSent
                      ? 'Send OTP'
                      : 'Verify'
                  }
                />

              </div>
            )}

            <div className="mt-4 flex items-center justify-between">

              <button
                type="button"
                onClick={() =>
                  setShowKeypad(
                    (previous) =>
                      !previous
                  )
                }
                className="min-h-[44px] px-2 text-xs font-bold text-teal-700 underline cursor-pointer"
              >
                {showKeypad
                  ? 'Hide keypad'
                  : 'Show on-screen keypad'}
              </button>

              <button
                type="button"
                onClick={handleDemoPatient}
                className="min-h-[44px] px-3 text-xs font-bold text-slate-500 hover:text-teal-700 cursor-pointer"
              >
                Demo patient
              </button>

            </div>

            {/* ------------------------------------------------
                VERIFIED PATIENT
            ------------------------------------------------- */}

            {isVerified && (
              <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">

                <div className="flex items-start gap-4">

                  <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>

                  <div className="flex-1">

                    <p className="text-xs font-black uppercase tracking-wider text-emerald-700">
                      Identity verified
                    </p>

                    <h2 className="mt-1 text-lg font-black text-slate-900">
                      {language === 'hi'
                        ? sessionData.patientProfile?.hindiName ||
                          sessionData.patientProfile?.name
                        : sessionData.patientProfile?.name}
                    </h2>

                    <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-3">

                      <div>
                        <p className="text-[11px] text-slate-500">
                          Age
                        </p>
                        <p className="text-sm font-bold">
                          {sessionData.patientProfile?.age}
                        </p>
                      </div>

                      <div>
                        <p className="text-[11px] text-slate-500">
                          Gender
                        </p>
                        <p className="text-sm font-bold">
                          {sessionData.patientProfile?.gender}
                        </p>
                      </div>

                      <div>
                        <p className="text-[11px] text-slate-500">
                          ABHA
                        </p>
                        <p className="text-sm font-bold">
                          {sessionData.patientProfile?.abhaNumber}
                        </p>
                      </div>

                      <div>
                        <p className="text-[11px] text-slate-500">
                          State
                        </p>
                        <p className="text-sm font-bold">
                          {sessionData.patientProfile?.state}
                        </p>
                      </div>

                    </div>

                  </div>

                </div>

              </div>
            )}

            {/* ------------------------------------------------
                CONTINUE
            ------------------------------------------------- */}

            <button
              type="button"
              disabled={!isVerified || isVerifying}
              onClick={handleContinue}
              className="
                mt-6
                w-full
                min-h-[76px]
                rounded-2xl
                bg-teal-700
                hover:bg-teal-800
                disabled:bg-slate-200
                disabled:text-slate-400
                text-white
                font-black
                flex
                items-center
                justify-between
                px-6
                cursor-pointer
                disabled:cursor-not-allowed
                transition
              "
            >

              <span className="text-left">

                <span className="block text-lg">
                  Continue
                </span>

                <span className="block text-xs font-medium mt-1 opacity-80">
                  विभाग चयन पर जाएं
                </span>

              </span>

              {isVerifying ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <ArrowRight className="w-6 h-6" />
              )}

            </button>

          </div>

        </div>

        {/* Bottom information */}

        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400">

          <ShieldCheck className="w-4 h-4" />

          <span>
            Identity verification is simulated in this prototype.
          </span>

        </div>

      </div>

    </div>
  );
};

export default Screen2_Auth;