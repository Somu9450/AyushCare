import React, { useState, useRef, useEffect } from "react";
import {
  IdCard,
  Fingerprint,
  Phone,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Lock,
  Sparkles,
  Info,
  RefreshCw,
  QrCode,
} from "lucide-react";
import useMobileStore, { SCREENS } from "../../store/useMobileStore";
import {
  AUTH_METHODS,
  requestAbhaOtp,
  verifyAbhaOtp,
  requestAadhaarOtp,
  verifyAadhaarOtp,
  requestMobileOtp,
  verifyMobileOtp,
} from "../../services/authService";
import PrimaryButton from "../../components/mobile/PrimaryButton";
import SecondaryButton from "../../components/mobile/SecondaryButton";
import BottomActionBar from "../../components/mobile/BottomActionBar";

const TABS = [
  {
    id: AUTH_METHODS.ABHA,
    title: "ABHA Number",
    subtitle: "14-digit Health ID",
    icon: IdCard,
    length: 14,
    placeholder: "e.g. 91-4432-8812-9012",
    demoValue: "91443288129012",
  },
  {
    id: AUTH_METHODS.AADHAAR,
    title: "Aadhaar Card",
    subtitle: "12-digit UID",
    icon: Fingerprint,
    length: 12,
    placeholder: "e.g. 7288 9123 0144",
    demoValue: "728891230144",
  },
  {
    id: AUTH_METHODS.MOBILE,
    title: "Mobile Number",
    subtitle: "10-digit Phone",
    icon: Phone,
    length: 10,
    placeholder: "e.g. 98765 43210",
    demoValue: "9876543210",
  },
];

export const AuthScreen = () => {
  const { setScreen, setVerifiedPatient } = useMobileStore();

  const [activeTab, setActiveTab] = useState(AUTH_METHODS.ABHA);
  const [identifier, setIdentifier] = useState("");
  const [step, setStep] = useState("INPUT"); // "INPUT" | "OTP"
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [transactionData, setTransactionData] = useState(null);

  const otpInputsRef = useRef([]);

  const currentTabConfig = TABS.find((t) => t.id === activeTab);

  // Clean and format input value
  const handleInputChange = (e) => {
    const rawValue = e.target.value.replace(/\D/g, "");
    if (rawValue.length <= currentTabConfig.length) {
      setIdentifier(rawValue);
      setError("");
    }
  };

  const formatDisplayValue = (raw) => {
    if (!raw) return "";
    if (activeTab === AUTH_METHODS.ABHA) {
      // Format as 12-3456-7890-1234
      const parts = [];
      if (raw.length > 0) parts.push(raw.slice(0, 2));
      if (raw.length > 2) parts.push(raw.slice(2, 6));
      if (raw.length > 6) parts.push(raw.slice(6, 10));
      if (raw.length > 10) parts.push(raw.slice(10, 14));
      return parts.join("-");
    }
    if (activeTab === AUTH_METHODS.AADHAAR) {
      // Format as 1234 5678 9012
      const parts = [];
      for (let i = 0; i < raw.length; i += 4) {
        parts.push(raw.slice(i, i + 4));
      }
      return parts.join(" ");
    }
    if (activeTab === AUTH_METHODS.MOBILE) {
      if (raw.length > 5) {
        return `${raw.slice(0, 5)} ${raw.slice(5, 10)}`;
      }
      return raw;
    }
    return raw;
  };

  // Request OTP handler
  const handleSendOtp = async () => {
    if (identifier.length !== currentTabConfig.length) {
      setError(`Please enter a valid ${currentTabConfig.length}-digit ${currentTabConfig.title}`);
      return;
    }

    setLoading(true);
    setError("");

    try {
      let res;
      if (activeTab === AUTH_METHODS.ABHA) {
        res = await requestAbhaOtp(identifier);
      } else if (activeTab === AUTH_METHODS.AADHAAR) {
        res = await requestAadhaarOtp(identifier);
      } else {
        res = await requestMobileOtp(identifier);
      }

      setTransactionData(res);
      setStep("OTP");
      setOtp(["", "", "", "", "", ""]);
      // Focus first OTP field
      setTimeout(() => {
        otpInputsRef.current[0]?.focus();
      }, 100);
    } catch (err) {
      setError("Failed to generate OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle single OTP digit input
  const handleOtpDigitChange = (index, value) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    setError("");

    // Auto advance
    if (digit && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  // Handle backspace in OTP
  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  // Handle pasting full 6 digits
  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length > 0) {
      const newOtp = [...otp];
      for (let i = 0; i < pasted.length; i++) {
        newOtp[i] = pasted[i];
      }
      setOtp(newOtp);
      const nextFocus = Math.min(pasted.length, 5);
      otpInputsRef.current[nextFocus]?.focus();
    }
  };

  // Verify OTP handler
  const handleVerifyOtp = async () => {
    const fullOtp = otp.join("");
    if (fullOtp.length !== 6) {
      setError("Please enter the complete 6-digit OTP");
      return;
    }

    setLoading(true);
    setError("");

    try {
      let res;
      if (activeTab === AUTH_METHODS.ABHA) {
        res = await verifyAbhaOtp(transactionData?.transactionId, fullOtp, identifier);
      } else if (activeTab === AUTH_METHODS.AADHAAR) {
        res = await verifyAadhaarOtp(transactionData?.txnId, fullOtp, identifier);
      } else {
        res = await verifyMobileOtp(transactionData?.txnId, fullOtp, identifier);
      }

      if (res.success && res.patient) {
        setVerifiedPatient(res.patient);
        // Login successful -> navigate to M1
        setScreen(SCREENS.M1);
      } else {
        setError("Invalid OTP. Please try again.");
      }
    } catch (err) {
      setError("Authentication failed. Please verify the OTP.");
    } finally {
      setLoading(false);
    }
  };

  // Fill sample demo data for quick testing
  const handleFillDemo = () => {
    setIdentifier(currentTabConfig.demoValue);
    setError("");
  };

  // Fill sample 6-digit OTP
  const handleFillDemoOtp = () => {
    setOtp(["1", "2", "3", "4", "5", "6"]);
    setError("");
  };

  return (
    <div className="min-h-full flex flex-col justify-between bg-slate-50 text-slate-900 selection:bg-teal-100 selection:text-teal-900">
      {/* Top Header */}
      <header className="w-full px-4 sm:px-6 pt-safe pb-3 bg-white border-b border-slate-200/80">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3 h-14">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-800 text-white flex items-center justify-center font-black text-sm">
              +
            </div>
            <div>
              <span className="text-sm font-black tracking-wider text-teal-800">
                AYUSHCARE
              </span>
              <span className="text-[10px] ml-2 font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                PATIENT PORTAL
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
            <span className="hidden xs:inline">ABDM / UIDAI Compliant</span>
            <span className="xs:hidden">Secure</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 px-4 sm:px-6 py-6 max-w-md md:max-w-2xl lg:max-w-3xl mx-auto w-full space-y-6">
        {step === "INPUT" ? (
          <>
            {/* Step 1 Title */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-black uppercase tracking-wider bg-teal-100 text-teal-800 px-2.5 py-0.5 rounded-full">
                Step 1 of 2 · Patient Authentication
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                Log in to AyushCare
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Connect your health records securely via ABHA, Aadhaar, or your registered mobile number.
              </p>
            </div>

            {/* 3-Method Tabs */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Select Login Method
              </p>
              <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-slate-200/70 border border-slate-200">
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isSelected = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        setActiveTab(tab.id);
                        setIdentifier("");
                        setError("");
                      }}
                      className={`min-h-[58px] p-2 rounded-xl text-center flex flex-col items-center justify-center gap-1 transition-all cursor-pointer select-none ${
                        isSelected
                          ? "bg-white text-teal-900 font-bold shadow-xs border border-teal-600/30"
                          : "text-slate-600 hover:text-slate-900 hover:bg-white/50 font-medium"
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isSelected ? "text-teal-700" : "text-slate-400"}`} />
                      <span className="text-xs leading-none truncate w-full">
                        {tab.title}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Input Card */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    {currentTabConfig.title}
                  </label>
                  <button
                    type="button"
                    onClick={handleFillDemo}
                    className="text-[11px] font-bold text-teal-700 hover:text-teal-900 bg-teal-50 px-2 py-0.5 rounded transition"
                  >
                    Use Sample {currentTabConfig.title}
                  </button>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formatDisplayValue(identifier)}
                    onChange={handleInputChange}
                    placeholder={currentTabConfig.placeholder}
                    className="w-full h-14 px-4 pr-16 rounded-2xl border-2 border-slate-200 text-base font-bold text-slate-900 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100 placeholder:text-slate-400 placeholder:font-normal"
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-400">
                    {identifier.length}/{currentTabConfig.length}
                  </div>
                </div>

                {error && (
                  <p className="text-xs font-bold text-rose-600 mt-2 flex items-center gap-1">
                    <span>⚠</span> {error}
                  </p>
                )}
              </div>

              {/* Notice Banner */}
              <div className="p-3 rounded-2xl bg-teal-50/80 border border-teal-200/60 text-xs text-teal-900 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  A 6-digit OTP will be sent to the mobile number registered with your{" "}
                  <strong>{currentTabConfig.title}</strong>. For prototype testing, entering any 6-digit number will authenticate you.
                </p>
              </div>
            </div>

            {/* PATH B: KIOSK QR AUTO-CONNECT (Prompt 5) */}
            {/* TODO: In production, kiosk QR should reference a secure short-lived session. */}
            {/* TODO: Patient identity/session authorization must be validated server-side. */}
            {/* TODO: Never trust patient identity or medical data supplied directly by QR. */}
            <div className="p-4 rounded-3xl bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200/80 shadow-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-800 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-[10px] font-black uppercase tracking-wider text-teal-800">
                      At Hospital?
                    </h4>
                    <span className="text-[9px] font-bold bg-teal-200/70 text-teal-900 px-1.5 py-0.2 rounded">
                      Fast Track
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-900">
                    Scan Kiosk QR to Auto-Connect
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Skip login and link companion session directly
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setScreen(SCREENS.KIOSK_CONNECT)}
                className="px-3 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs flex items-center gap-1 transition cursor-pointer shrink-0 shadow-xs active:scale-95"
              >
                <span>Scan QR</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </>
        ) : (
          /* Step 2: OTP Verification */
          <>
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => setStep("INPUT")}
                className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 hover:text-teal-900 mb-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Change {currentTabConfig.title}</span>
              </button>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                Enter 6-Digit OTP
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                We sent a 6-digit one-time password to your registered mobile number:{" "}
                <strong className="text-slate-800">{transactionData?.maskedMobile || "+91 ******3210"}</strong>.
              </p>
            </div>

            {/* OTP Input Card */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    One-Time Password
                  </label>
                  <button
                    type="button"
                    onClick={handleFillDemoOtp}
                    className="text-[11px] font-bold text-teal-700 hover:text-teal-900 bg-teal-50 px-2 py-0.5 rounded transition"
                  >
                    Autofill (123456)
                  </button>
                </div>

                {/* 6 OTP boxes */}
                <div className="grid grid-cols-6 gap-2 sm:gap-3" onPaste={handleOtpPaste}>
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (otpInputsRef.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className="w-full h-14 sm:h-16 text-center text-xl sm:text-2xl font-black rounded-2xl border-2 border-slate-200 focus:border-teal-600 focus:ring-4 focus:ring-teal-100 outline-none text-slate-900 transition"
                    />
                  ))}
                </div>

                {error && (
                  <p className="text-xs font-bold text-rose-600 mt-2.5 flex items-center gap-1">
                    <span>⚠</span> {error}
                  </p>
                )}
              </div>

              <div className="pt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100">
                <span>Didn't receive OTP?</span>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading}
                  className="font-bold text-teal-700 hover:text-teal-900 cursor-pointer disabled:opacity-50"
                >
                  Resend OTP
                </button>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Bottom Action Bar */}
      <BottomActionBar>
        {step === "INPUT" ? (
          <PrimaryButton
            onClick={handleSendOtp}
            loading={loading}
            disabled={identifier.length !== currentTabConfig.length}
            icon={ArrowRight}
          >
            Get 6-Digit OTP →
          </PrimaryButton>
        ) : (
          <PrimaryButton
            onClick={handleVerifyOtp}
            loading={loading}
            disabled={otp.join("").length !== 6}
            icon={CheckCircle2}
          >
            Verify & Proceed to AyushCare
          </PrimaryButton>
        )}
      </BottomActionBar>
    </div>
  );
};

export default AuthScreen;
