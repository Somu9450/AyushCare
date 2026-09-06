import React, { useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, LockKeyhole, ShieldCheck } from "lucide-react";
import useMobileStore, { SCREENS } from "../../store/useMobileStore";
import {
  loginPatient,
  MOCK_OTP,
} from "../../services/authService";
import {
  createMobileSession,
  touchMobileSession,
} from "../../services/mobileSessionService";
import { useLanguage } from "../../i18n/translations";

const AUTH_METHODS = [
  {
    id: "ABHA",
    label: "ABHA ID",
    hindi: "ABHA ID",
    placeholder: "Enter your ABHA ID",
    hindiPlaceholder: "अपना ABHA ID दर्ज करें",
  },
  {
    id: "AADHAAR",
    label: "Aadhaar",
    hindi: "आधार",
    placeholder: "Enter Aadhaar number",
    hindiPlaceholder: "आधार नंबर दर्ज करें",
  },
  {
    id: "MOBILE",
    label: "Mobile Number",
    hindi: "मोबाइल नंबर",
    placeholder: "Enter mobile number",
    hindiPlaceholder: "मोबाइल नंबर दर्ज करें",
  },
];

function maskIdentifierValue(identifier, method) {
  const value = String(identifier || "").trim();

  if (!value) return "";

  if (method === "MOBILE" || method === "AADHAAR") {
    if (value.length <= 4) {
      return `••••${value}`;
    }

    return `••••••${value.slice(-4)}`;
  }

  if (value.length <= 4) {
    return `••${value}`;
  }

  return `${value.slice(0, 2)}••••${value.slice(-2)}`;
}

function normalizePatient(authResult, method, identifier) {
  const user = authResult?.user || {};
  const session = authResult?.session || {};

  return {
    id: user.id || user.patientId || "PATIENT-001",
    patientId: user.patientId || "PATIENT-001",
    name: user.name || "Rajesh Kumar Sharma",
    authMethod: method,
    identifier,
    verifiedAt: new Date().toISOString(),
    sessionId: session.sessionId || null,
  };
}

export default function AuthScreen() {
  const {
    setScreen,
    setVerifiedPatient,
    selectedLanguage,
  } = useMobileStore();

  const { isHindi } = useLanguage();

  const [method, setMethod] = useState("ABHA");
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("identifier");
  const [maskedIdentifier, setMaskedIdentifier] = useState("");
  const [expiresIn, setExpiresIn] = useState(300);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedMethod = useMemo(
    () =>
      AUTH_METHODS.find((item) => item.id === method) ||
      AUTH_METHODS[0],
    [method]
  );

  const changeMethod = (nextMethod) => {
    setMethod(nextMethod);
    setIdentifier("");
    setOtp("");
    setStep("identifier");
    setError("");
  };

  const handleRequestOtp = async () => {
    const cleanIdentifier = identifier.trim();

    if (!cleanIdentifier) {
      setError(
        isHindi
          ? "कृपया अपना विवरण दर्ज करें।"
          : "Please enter your details."
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await loginPatient({
        authType: method,
        identifier: cleanIdentifier,
        otp: MOCK_OTP,
      });

      if (!result?.success) {
        throw new Error(
          result?.message || "Unable to verify details."
        );
      }

      setMaskedIdentifier(
        result.maskedIdentifier ||
          maskIdentifierValue(cleanIdentifier, method)
      );

      setExpiresIn(
        result?.session?.expiresInSeconds || 300
      );

      setStep("otp");
    } catch (requestError) {
      setError(
        requestError?.message ||
          (isHindi
            ? "सत्यापन अनुरोध पूरा नहीं हो सका।"
            : "Verification request failed.")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.trim() !== MOCK_OTP) {
      setError(
        isHindi
          ? `डेमो OTP ${MOCK_OTP} दर्ज करें।`
          : `For this demo, enter OTP ${MOCK_OTP}.`
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await loginPatient({
        authType: method,
        identifier: identifier.trim(),
        otp: otp.trim(),
      });

      if (!result?.success) {
        throw new Error(
          result?.message || "OTP verification failed."
        );
      }

      const patient = normalizePatient(
        result,
        method,
        identifier.trim()
      );

      setVerifiedPatient(patient, method);

      createMobileSession({
        patientId: patient.patientId,
        authType: method,
        sessionId: patient.sessionId,
        language: selectedLanguage || "en",
      });

      touchMobileSession();

      setScreen(SCREENS.M1);
    } catch (verifyError) {
      setError(
        verifyError?.message ||
          (isHindi
            ? "OTP सत्यापन विफल हुआ।"
            : "OTP verification failed.")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === "otp") {
      setStep("identifier");
      setOtp("");
      setError("");
      return;
    }

    setScreen(SCREENS.M1);
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-md flex-col">
        <button
          type="button"
          onClick={handleBack}
          className="mb-6 flex w-fit items-center gap-2 rounded-xl px-2 py-2 text-sm font-medium text-slate-600 transition active:scale-[0.98]"
        >
          <ArrowLeft size={18} />
          {isHindi ? "वापस" : "Back"}
        </button>

        <div className="mb-7">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
            <ShieldCheck size={28} />
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {isHindi
              ? "AyushCare में प्रवेश करें"
              : "Sign in to AyushCare"}
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            {isHindi
              ? "अपनी पहचान सत्यापित करके अपने स्वास्थ्य रिकॉर्ड और विज़िट देखें।"
              : "Verify your identity to access your visits and health records."}
          </p>
        </div>

        <div className="mb-5 grid grid-cols-3 gap-2 rounded-2xl bg-white p-1.5 shadow-sm ring-1 ring-slate-200">
          {AUTH_METHODS.map((item) => {
            const active = item.id === method;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => changeMethod(item.id)}
                className={`rounded-xl px-2 py-3 text-xs font-semibold transition ${
                  active
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {isHindi ? item.hindi : item.label}
              </button>
            );
          })}
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          {step === "identifier" ? (
            <>
              <label className="mb-2 block text-sm font-semibold text-slate-800">
                {isHindi
                  ? selectedMethod.hindi
                  : selectedMethod.label}
              </label>

              <input
                type={method === "MOBILE" ? "tel" : "text"}
                value={identifier}
                onChange={(event) => {
                  setIdentifier(event.target.value);
                  setError("");
                }}
                placeholder={
                  isHindi
                    ? selectedMethod.hindiPlaceholder
                    : selectedMethod.placeholder
                }
                inputMode={
                  method === "MOBILE" || method === "AADHAAR"
                    ? "numeric"
                    : "text"
                }
                autoComplete="off"
                className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
              />

              {error ? (
                <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </p>
              ) : null}

              <button
                type="button"
                onClick={handleRequestOtp}
                disabled={loading}
                className="mt-5 flex h-14 w-full items-center justify-center rounded-2xl bg-emerald-600 px-5 text-base font-bold text-white shadow-sm transition hover:bg-emerald-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? isHindi
                    ? "जाँच हो रही है..."
                    : "Checking..."
                  : isHindi
                    ? "OTP भेजें"
                    : "Send OTP"}
              </button>
            </>
          ) : (
            <>
              <div className="mb-5 rounded-2xl bg-emerald-50 p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2
                    size={20}
                    className="mt-0.5 shrink-0 text-emerald-700"
                  />

                  <div>
                    <p className="text-sm font-semibold text-emerald-900">
                      {isHindi
                        ? "OTP भेज दिया गया है"
                        : "OTP sent"}
                    </p>

                    <p className="mt-1 text-xs leading-5 text-emerald-800">
                      {maskedIdentifier ||
                        maskIdentifierValue(
                          identifier,
                          method
                        )}
                    </p>
                  </div>
                </div>
              </div>

              <label className="mb-2 block text-sm font-semibold text-slate-800">
                {isHindi ? "OTP दर्ज करें" : "Enter OTP"}
              </label>

              <input
                type="tel"
                value={otp}
                onChange={(event) => {
                  setOtp(
                    event.target.value
                      .replace(/\D/g, "")
                      .slice(0, 6)
                  );
                  setError("");
                }}
                placeholder={
                  isHindi
                    ? "6 अंकों का OTP"
                    : "6-digit OTP"
                }
                inputMode="numeric"
                maxLength={6}
                autoComplete="one-time-code"
                className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-center text-xl font-bold tracking-[0.35em] text-slate-900 outline-none transition placeholder:tracking-normal placeholder:text-sm placeholder:font-normal placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
              />

              <p className="mt-3 text-xs text-slate-500">
                {isHindi
                  ? `OTP की वैधता लगभग ${Math.ceil(
                      expiresIn / 60
                    )} मिनट है।`
                  : `OTP is valid for about ${Math.ceil(
                      expiresIn / 60
                    )} minutes.`}
              </p>

              {error ? (
                <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </p>
              ) : null}

              <button
                type="button"
                onClick={handleVerifyOtp}
                disabled={loading || otp.length !== 6}
                className="mt-5 flex h-14 w-full items-center justify-center rounded-2xl bg-emerald-600 px-5 text-base font-bold text-white shadow-sm transition hover:bg-emerald-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? isHindi
                    ? "सत्यापन हो रहा है..."
                    : "Verifying..."
                  : isHindi
                    ? "सत्यापित करें"
                    : "Verify & Continue"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep("identifier");
                  setOtp("");
                  setError("");
                }}
                className="mt-3 flex h-12 w-full items-center justify-center rounded-2xl text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                {isHindi ? "विवरण बदलें" : "Change details"}
              </button>
            </>
          )}
        </div>

        <div className="mt-auto pt-6">
          <div className="flex items-start gap-3 rounded-2xl bg-slate-100 p-4">
            <LockKeyhole
              size={18}
              className="mt-0.5 shrink-0 text-slate-600"
            />

            <p className="text-xs leading-5 text-slate-600">
              {isHindi
                ? "यह डेमो वातावरण है। वास्तविक OTP सेवा के स्थान पर परीक्षण OTP का उपयोग किया जाता है।"
                : "This is a demo environment. A test OTP is used instead of a live OTP service."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}