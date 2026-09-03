import React, { useState } from 'react';
import { 
  CreditCard, 
  Fingerprint, 
  Smartphone, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  QrCode, 
  ArrowRight, 
  Loader2, 
  AlertCircle,
  UserCheck,
  Building2
} from 'lucide-react';
import { useKioskStore, MOCK_PATIENTS } from '../store/useKioskStore';
import { useTranslation } from '../hooks/useTranslation';
import VirtualKeypad from '../components/common/VirtualKeypad';
import AudioButton from '../components/common/AudioButton';

export const Screen2_Auth = () => {
  const { sessionData, updateSessionData, setVerifiedPatient, nextScreen, language } = useKioskStore();
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState(sessionData.authType || 'ABHA');
  const [inputValue, setInputValue] = useState(sessionData.identifier || '');
  const [otpValue, setOtpValue] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showKeypad, setShowKeypad] = useState(true);

  const isVerified = sessionData.isVerified && sessionData.patientProfile;

  // Handle Tab Switch
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setInputValue('');
    setOtpSent(false);
    setOtpValue('');
    updateSessionData({ authType: tab, isVerified: false, patientProfile: null });
  };

  // Virtual Keypad input handler
  const handleKeyPress = (num) => {
    if (otpSent) {
      if (otpValue.length < 6) setOtpValue((prev) => prev + num);
    } else {
      if (activeTab === 'ABHA' && inputValue.length < 17) {
        // Auto format 14-digit ABHA: XX-XXXX-XXXX-XXXX
        const clean = (inputValue + num).replace(/\D/g, '');
        let formatted = clean;
        if (clean.length > 2 && clean.length <= 6) {
          formatted = `${clean.slice(0, 2)}-${clean.slice(2)}`;
        } else if (clean.length > 6 && clean.length <= 10) {
          formatted = `${clean.slice(0, 2)}-${clean.slice(2, 6)}-${clean.slice(6)}`;
        } else if (clean.length > 10) {
          formatted = `${clean.slice(0, 2)}-${clean.slice(2, 6)}-${clean.slice(6, 10)}-${clean.slice(10, 14)}`;
        }
        setInputValue(formatted);
      } else if (activeTab === 'Aadhaar' && inputValue.length < 14) {
        // Format XXXX XXXX XXXX
        const clean = (inputValue + num).replace(/\D/g, '');
        let formatted = clean;
        if (clean.length > 4 && clean.length <= 8) {
          formatted = `${clean.slice(0, 4)} ${clean.slice(4)}`;
        } else if (clean.length > 8) {
          formatted = `${clean.slice(0, 4)} ${clean.slice(4, 8)} ${clean.slice(8, 12)}`;
        }
        setInputValue(formatted);
      } else if (activeTab === 'Mobile' && inputValue.length < 10) {
        setInputValue((prev) => prev + num);
      }
    }
  };

  const handleBackspace = () => {
    if (otpSent) {
      setOtpValue((prev) => prev.slice(0, -1));
    } else {
      setInputValue((prev) => prev.slice(0, -1));
    }
  };

  const handleClear = () => {
    if (otpSent) {
      setOtpValue('');
    } else {
      setInputValue('');
    }
  };

  // Simulated NHA verification flow
  const triggerVerification = () => {
    setIsVerifying(true);

    setTimeout(() => {
      setIsVerifying(false);
      const mockUser = activeTab === 'Aadhaar' ? MOCK_PATIENTS.aadhaar : MOCK_PATIENTS.abha;
      setVerifiedPatient(mockUser, activeTab, inputValue || mockUser.abhaNumber);
    }, 1200);
  };

  // Demo Quick-Fill button
  const handleQuickFill = () => {
    const mock = MOCK_PATIENTS.abha;
    setInputValue(mock.abhaNumber);
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setVerifiedPatient(mock, 'ABHA', mock.abhaNumber);
    }, 800);
  };

  const handleSendOtp = () => {
    if (inputValue.length < 10) {
      alert('Please enter a valid 10-digit mobile number');
      return;
    }
    setOtpSent(true);
  };

  const audioPrompt = language === 'hi'
    ? 'कृपया अपना 14 अंकों का आभा नंबर, आधार अथवा पंजीकृत मोबाइल नंबर दर्ज करें और सत्यापन करें।'
    : 'Please enter your 14 digit ABHA number, Aadhaar or registered mobile number to verify your health profile.';

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full select-none animate-in fade-in duration-300">
      
      {/* Screen Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-teal-800 font-bold text-xs uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>NHA ABDM Gateway Security</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {t('screen2.title', 'Patient Identification & Verification')}
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            {t('screen2.subtitle', 'Verify your identity using official Government of India health credentials')}
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <button
            type="button"
            onClick={handleQuickFill}
            className="px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-bold text-xs rounded-xl shadow-sm cursor-pointer active:scale-95 transition-all flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>{t('screen2.demoQuickFill', '⚡ Demo Quick Fill')}</span>
          </button>
          <AudioButton textToRead={audioPrompt} />
        </div>
      </div>

      {/* Main Content Grid: Verification Form vs Patient Card / Scanner */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-6 items-start">
        
        {/* Left Form Column (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Government Style Tab Switcher */}
          <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            {/* ABHA Tab */}
            <button
              type="button"
              onClick={() => handleTabChange('ABHA')}
              className={`flex flex-col sm:flex-row items-center justify-center gap-2 py-3 px-2 rounded-xl font-bold text-xs sm:text-sm cursor-pointer transition-all min-h-[56px] ${
                activeTab === 'ABHA'
                  ? 'bg-white text-teal-900 shadow-md border border-teal-700/30'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <CreditCard className={`w-5 h-5 ${activeTab === 'ABHA' ? 'text-teal-700' : 'text-slate-400'}`} />
              <span>{t('screen2.tabAbha', 'ABHA (ABDM)')}</span>
            </button>

            {/* Aadhaar Tab */}
            <button
              type="button"
              onClick={() => handleTabChange('Aadhaar')}
              className={`flex flex-col sm:flex-row items-center justify-center gap-2 py-3 px-2 rounded-xl font-bold text-xs sm:text-sm cursor-pointer transition-all min-h-[56px] ${
                activeTab === 'Aadhaar'
                  ? 'bg-white text-teal-900 shadow-md border border-teal-700/30'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Fingerprint className={`w-5 h-5 ${activeTab === 'Aadhaar' ? 'text-teal-700' : 'text-slate-400'}`} />
              <span>{t('screen2.tabAadhaar', 'Aadhaar')}</span>
            </button>

            {/* Mobile Tab */}
            <button
              type="button"
              onClick={() => handleTabChange('Mobile')}
              className={`flex flex-col sm:flex-row items-center justify-center gap-2 py-3 px-2 rounded-xl font-bold text-xs sm:text-sm cursor-pointer transition-all min-h-[56px] ${
                activeTab === 'Mobile'
                  ? 'bg-white text-teal-900 shadow-md border border-teal-700/30'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Smartphone className={`w-5 h-5 ${activeTab === 'Mobile' ? 'text-teal-700' : 'text-slate-400'}`} />
              <span>{t('screen2.tabMobile', 'Mobile OTP')}</span>
            </button>
          </div>

          {/* Form Input Display Area */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            
            <label className="block text-sm font-bold text-slate-800">
              {activeTab === 'ABHA' && t('screen2.abhaPrompt')}
              {activeTab === 'Aadhaar' && t('screen2.aadhaarPrompt')}
              {activeTab === 'Mobile' && (!otpSent ? t('screen2.mobilePrompt') : t('screen2.otpPrompt'))}
            </label>

            {!otpSent ? (
              <div className="relative">
                <input
                  type="text"
                  readOnly
                  value={inputValue}
                  placeholder={
                    activeTab === 'ABHA'
                      ? '91-XXXX-XXXX-XXXX'
                      : activeTab === 'Aadhaar'
                      ? 'XXXX XXXX XXXX'
                      : '98765 43210'
                  }
                  className="w-full text-2xl sm:text-3xl font-mono tracking-wider px-5 py-4 rounded-xl border-2 border-slate-300 bg-slate-50 text-slate-900 focus:outline-none focus:border-teal-700 font-bold"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                  <span>OTP sent to: <strong>+91 {inputValue}</strong></span>
                  <button 
                    type="button" 
                    onClick={() => setOtpSent(false)} 
                    className="text-teal-700 underline font-bold cursor-pointer"
                  >
                    Change Number
                  </button>
                </div>
                <input
                  type="text"
                  readOnly
                  value={otpValue}
                  placeholder="• • • • • •"
                  className="w-full text-center text-3xl font-mono tracking-widest px-5 py-4 rounded-xl border-2 border-teal-600 bg-teal-50/40 text-teal-950 font-black focus:outline-none"
                />
              </div>
            )}

            {/* Action Bar inside Input Box */}
            <div className="flex items-center justify-between pt-2 gap-3">
              <button
                type="button"
                onClick={() => setShowKeypad(!showKeypad)}
                className="text-xs text-teal-700 font-bold underline cursor-pointer"
              >
                {showKeypad ? 'Hide On-Screen Keypad' : 'Show On-Screen Keypad'}
              </button>

              {activeTab === 'Mobile' && !otpSent ? (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={inputValue.length < 10}
                  className="px-6 py-3 bg-teal-800 hover:bg-teal-700 disabled:bg-slate-300 text-white font-bold text-sm rounded-xl cursor-pointer shadow-md transition-all"
                >
                  {t('screen2.sendOtp', 'Send OTP')}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={triggerVerification}
                  disabled={isVerifying || (!otpSent && inputValue.length < 10) || (otpSent && otpValue.length < 4)}
                  className="px-6 py-3 bg-teal-800 hover:bg-teal-700 disabled:bg-slate-300 text-white font-bold text-sm rounded-xl cursor-pointer shadow-md transition-all flex items-center gap-2"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                      <span>{t('screen2.verifying', 'Verifying...')}</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-5 h-5 text-amber-300" />
                      <span>{t('screen2.verifyOtp', 'Verify & Retrieve Profile')}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Virtual Keypad for Kiosk Touch Screens */}
          {showKeypad && !isVerified && (
            <div className="pt-2">
              <VirtualKeypad
                onKeyPress={handleKeyPress}
                onBackspace={handleBackspace}
                onClear={handleClear}
                onSubmit={activeTab === 'Mobile' && !otpSent ? handleSendOtp : triggerVerification}
                submitLabel={activeTab === 'Mobile' && !otpSent ? 'Send OTP' : 'Verify'}
              />
            </div>
          )}

          {/* QR Barcode scan mock helper */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-800 flex items-center justify-center">
                <QrCode className="w-6 h-6" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-amber-950">
                  {t('screen2.scanQr', 'Scan ABHA / QR Code on Scanner Below')}
                </p>
                <p className="text-[11px] text-amber-800">
                  Hold your ABHA Card or Ayushman App QR Code near the optical scanner
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleQuickFill}
              className="text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white px-3.5 py-2 rounded-xl cursor-pointer whitespace-nowrap shadow-sm"
            >
              Simulate Scan
            </button>
          </div>

        </div>

        {/* Right Preview Column (5 Cols): NHA Verified Card / Preview */}
        <div className="lg:col-span-5 space-y-4">
          
          {isVerified ? (
            /* Official NHA ABDM Card Preview */
            <div className="bg-white rounded-3xl border-2 border-emerald-500 shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
              
              {/* Card Header */}
              <div className="bg-gradient-to-r from-teal-800 to-teal-900 text-white p-5 flex items-center justify-between border-b-4 border-amber-400">
                <div className="flex items-center gap-3">
                  <Building2 className="w-7 h-7 text-amber-300" />
                  <div>
                    <h3 className="text-base font-black tracking-wide uppercase">Ayushman Bharat</h3>
                    <p className="text-[10px] text-teal-200 font-semibold tracking-wider uppercase">Digital Health Account (ABDM)</p>
                  </div>
                </div>
                <div className="bg-emerald-500 text-white text-xs font-black px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>VERIFIED</span>
                </div>
              </div>

              {/* Patient Details */}
              <div className="p-6 space-y-5">
                <div className="flex items-center gap-4">
                  <img
                    src={sessionData.patientProfile.photoUrl}
                    alt={sessionData.patientProfile.name}
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-teal-700 shadow-md"
                  />
                  <div>
                    <h4 className="text-xl font-black text-slate-900 leading-tight">
                      {sessionData.patientProfile.name}
                    </h4>
                    <p className="text-sm font-semibold text-teal-800 font-serif">
                      {sessionData.patientProfile.hindiName}
                    </p>
                    <div className="mt-1 flex items-center gap-2 text-xs font-bold text-slate-600">
                      <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {sessionData.patientProfile.gender}, {sessionData.patientProfile.age} yrs
                      </span>
                      <span className="bg-rose-50 text-rose-700 px-2 py-0.5 rounded border border-rose-200">
                        Blood: {sessionData.patientProfile.bloodGroup}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Key-Value details */}
                <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="block text-slate-500 font-medium">ABHA Number</span>
                    <span className="font-mono font-bold text-slate-900 text-sm">{sessionData.patientProfile.abhaNumber}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="block text-slate-500 font-medium">ABHA Address</span>
                    <span className="font-mono font-bold text-teal-800 text-sm truncate block">{sessionData.patientProfile.abhaAddress}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="block text-slate-500 font-medium">Mobile Number</span>
                    <span className="font-mono font-bold text-slate-800">{sessionData.patientProfile.mobile}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="block text-slate-500 font-medium">State / District</span>
                    <span className="font-semibold text-slate-800">{sessionData.patientProfile.district}, {sessionData.patientProfile.state}</span>
                  </div>
                </div>

                {/* Ayurvedic Prakriti Tag if recorded */}
                {sessionData.patientProfile.prakriti && (
                  <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-teal-900 uppercase tracking-wider block">
                        Ayush Health Profile (आयुष प्रकृति)
                      </span>
                      <span className="text-sm font-extrabold text-teal-800">
                        {sessionData.patientProfile.prakriti}
                      </span>
                    </div>
                    <span className="text-xs bg-teal-700 text-white font-bold px-2 py-1 rounded-lg">
                      Synchronized
                    </span>
                  </div>
                )}

                {/* Continue to Next Screen button */}
                <button
                  type="button"
                  onClick={nextScreen}
                  className="w-full min-h-[60px] bg-gradient-to-r from-teal-800 to-teal-700 hover:from-teal-700 hover:to-teal-600 text-white font-black text-lg rounded-2xl shadow-lg flex items-center justify-center gap-3 cursor-pointer active:scale-98 transition-all"
                >
                  <span>Proceed to Medical Track Selection</span>
                  <ArrowRight className="w-6 h-6 text-amber-300" />
                </button>
              </div>

            </div>
          ) : (
            /* Standby Card placeholder */
            <div className="bg-slate-50 rounded-3xl border-2 border-dashed border-slate-300 p-8 text-center flex flex-col items-center justify-center min-h-[380px] space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 text-slate-400 flex items-center justify-center shadow-sm">
                <UserCheck className="w-8 h-8" />
              </div>
              <div className="max-w-xs">
                <h4 className="font-bold text-slate-800 text-base">Awaiting Verification</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Enter your ABHA or Aadhaar details on the left, or use the Demo Quick Fill button to test instantly.
                </p>
              </div>
              <div className="pt-2">
                <span className="text-[11px] font-bold text-teal-800 bg-teal-50 px-3 py-1.5 rounded-full border border-teal-200">
                  Government of India • NHA M1/M2 Standard
                </span>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default Screen2_Auth;
