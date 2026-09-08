import React, { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  LockKeyhole,
  ShieldCheck,
  Stethoscope,
  User,
  UserCheck,
} from "lucide-react";
import useMobileStore, { SCREENS } from "../../store/useMobileStore";
import {
  requestOtp,
  verifyOtp,
  selectPatientAccount,
} from "../../services/authService";
import { useLanguage } from "../../i18n/translations";

const AUTH_METHODS = [
  {
    id: "MOBILE",
    label: "Mobile Number",
    hindi: "मोबाइल नंबर",
    placeholder: "Enter 10-digit mobile number",
    hindiPlaceholder: "10 अंकों का मोबाइल नंबर दर्ज करें",
    maxLength: 10,
    isDemo: false,
  },
  {
    id: "AADHAAR",
    label: "Aadhaar",
    hindi: "आधार",
    placeholder: "Enter 12-digit Aadhaar number",
    hindiPlaceholder: "12 अंकों का आधार नंबर दर्ज करें",
    maxLength: 12,
    isDemo: false,
  },
  {
    id: "ABHA",
    label: "ABHA",
    hindi: "आभा",
    placeholder: "Enter 14-digit ABHA number",
    hindiPlaceholder: "14 अंकों का आभा नंबर दर्ज करें",
    maxLength: 14,
    isDemo: false,
  },
];

function maskIdentifierValue(identifier, method) {
  const value = String(identifier || "").trim();

  if (!value) return "";

  if (method === "MOBILE") {
    if (value.length <= 4) return `••••${value}`;
    return `••••••${value.slice(-4)}`;
  }

  if (method === "AADHAAR") {
    return `•••• •••• ${value.slice(-4)}`;
  }

  if (method === "ABHA") {
    return `${value.slice(0, 2)}-••••-••••-${value.slice(-4)}`;
  }

  return `••••${value.slice(-4)}`;
}

export default function AuthScreen() {
  const {
    setScreen,
    setVerifiedPatient,
    loadPortalData,
  } = useMobileStore();

  const { isHindi } = useLanguage();

  const [method, setMethod] = useState("MOBILE");
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("identifier"); // "identifier" | "otp" | "select_patient"
  const [availablePatients, setAvailablePatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState("");
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
    setAvailablePatients([]);
    setSelectedPatientId("");
    setError("");
  };

  const handleInputChange = (event) => {
    const raw = event.target.value.replace(/\D/g, "");
    const limit = selectedMethod.maxLength || 14;
    setIdentifier(raw.slice(0, limit));
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

    if (method === "MOBILE") {
      if (cleanIdentifier.length !== 10) {
        setError(isHindi ? "10 अंकों का वैध मोबाइल नंबर दर्ज करें।" : "Enter a valid 10-digit mobile number.");
        return;
      }

      setLoading(true);
      setError("");

      try {
        const result = await requestOtp({
          authType: "MOBILE",
          identifier: cleanIdentifier,
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
      return;
    }

    if (method === "AADHAAR") {
      if (cleanIdentifier.length !== 12) {
        setError(isHindi ? "12 अंकों का आधार नंबर दर्ज करें।" : "Enter a valid 12-digit Aadhaar number.");
        return;
      }

      setLoading(true);
      setTimeout(() => {
        setMaskedIdentifier(maskIdentifierValue(cleanIdentifier, "AADHAAR"));
        setExpiresIn(300);
        setStep("otp");
        setLoading(false);
      }, 350);
      return;
    }

    if (method === "ABHA") {
      if (cleanIdentifier.length !== 14) {
        setError(isHindi ? "14 अंकों का आभा नंबर दर्ज करें।" : "Enter a valid 14-digit ABHA number.");
        return;
      }

      setLoading(true);
      setTimeout(() => {
        setMaskedIdentifier(maskIdentifierValue(cleanIdentifier, "ABHA"));
        setExpiresIn(300);
        setStep("otp");
        setLoading(false);
      }, 350);
      return;
    }
  };

  const handleVerifyOtp = async () => {
    const cleanOtp = otp.trim();
    if (!/^\d{6}$/.test(cleanOtp)) {
      setError(isHindi ? "6 अंकों का OTP दर्ज करें।" : "Enter the 6-digit OTP.");
      return;
    }

    setLoading(true);
    setError("");

    if (method === "AADHAAR" || method === "ABHA") {
      setTimeout(() => {
        const demoPatient = {
          id: `demo-${identifier.slice(-4)}`,
          patientId: `DEMO-${identifier.slice(-4)}`,
          patient_code: `DEMO-${identifier.slice(-4)}`,
          full_name: method === "AADHAAR" ? "Aadhaar Demo Patient" : "ABHA Demo Patient",
          name: method === "AADHAAR" ? "Aadhaar Demo Patient" : "ABHA Demo Patient",
          gender: "Male",
          age: 32,
          last_visit: "Today",
          department: "Ayush OPD",
          doctor: "Dr. Sharma",
          mobile_number: "+919876543210",
          abha_number: method === "ABHA" ? identifier : "12-3456-7890-1234",
          authMethod: method,
          isDemo: true,
          verifiedAt: new Date().toISOString(),
        };
        setAvailablePatients([demoPatient]);
        setSelectedPatientId(demoPatient.id);
        setStep("select_patient");
        setLoading(false);
      }, 350);
      return;
    }

    try {
      const result = await verifyOtp({
        authType: "MOBILE",
        identifier: identifier.trim(),
        otp: cleanOtp,
      });

      if (!result?.success) {
        throw new Error(
          result?.message || "OTP verification failed."
        );
      }

      const patients = Array.isArray(result?.patients) && result.patients.length > 0
        ? result.patients
        : [result?.patient || {}];

      setAvailablePatients(patients);
      setSelectedPatientId(patients[0]?.id || "");
      setStep("select_patient");
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

  const handleConfirmPatient = async () => {
    const chosen = availablePatients.find((p) => p.id === selectedPatientId) || availablePatients[0];
    if (!chosen) return;

    setLoading(true);
    setError("");

    try {
      let activePatient = chosen;
      let activeToken = chosen.accessToken;

      if (!chosen.isDemo) {
        const response = await selectPatientAccount(chosen.id);
        activePatient = response.patient || chosen;
        activeToken = response.accessToken;
      }

      const normalized = {
        id: activePatient.id,
        patientId: activePatient.patient_code || activePatient.patientId || activePatient.id,
        patient_code: activePatient.patient_code,
        name: activePatient.full_name || activePatient.name || "Patient",
        full_name: activePatient.full_name || activePatient.name || "Patient",
        gender: activePatient.gender,
        age: activePatient.age,
        date_of_birth: activePatient.date_of_birth,
        mobile_number: activePatient.mobile_number || identifier.trim(),
        authMethod: method,
        identifier: identifier.trim(),
        accessToken: activeToken,
        verifiedAt: new Date().toISOString(),
      };

      setVerifiedPatient(normalized, method);
      await loadPortalData?.();
      setScreen(SCREENS.M1);
    } catch (err) {
      setError(err?.message || (isHindi ? "प्रोफ़ाइल सक्रिय करने में विफल।" : "Failed to activate profile."));
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === "select_patient") {
      setStep("otp");
      setError("");
      return;
    }

    if (step === "otp") {
      setStep("identifier");
      setOtp("");
      setError("");
      return;
    }

    setScreen(SCREENS.M1);
  };

  return (
    <div className="mobile-auth-shell">
      <div className="mobile-auth-brand">
        <img
          src="https://www.uxdt.nic.in/wp-content/uploads/2025/09/ayushman-bharat-digital-mission-feature--ayushman-bharat-digital-mission.jpg"
          alt="Ayushman Bharat Digital Mission"
        />
        <div>
          <strong><span>Ayush</span>Care</strong>
          <small>Digital Patient Care</small>
        </div>
      </div>

      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-md flex-col pb-10">
        {step !== "identifier" && (
          <button
            type="button"
            onClick={handleBack}
            className="mb-4 flex w-fit items-center gap-2 rounded-xl px-2 py-2 text-sm font-medium text-slate-600 transition active:scale-[0.98]"
          >
            <ArrowLeft size={18} />
            {isHindi ? "वापस" : "Back"}
          </button>
        )}

        <div className="mb-6 mt-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {step === "select_patient"
              ? isHindi ? "मरीज़ प्रोफ़ाइल चुनें" : "Select Patient Account"
              : isHindi ? "आयुषकेयर में प्रवेश करें" : "Sign In to AyushCare"}
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-600 max-w-xs mx-auto">
            {step === "select_patient"
              ? isHindi
                ? "इस मोबाइल नंबर से जुड़े खाते नीचे दिए गए हैं। जिस प्रोफ़ाइल को आप खोलना चाहते हैं उसे चुनें।"
                : "Choose the patient profile registered with this number that you want to access."
              : isHindi
                ? "अपनी पहचान सत्यापित करके अपने स्वास्थ्य रिकॉर्ड और विज़िट देखें।"
                : "Verify your identity to access your visits and health records."}
          </p>
        </div>

        {step !== "select_patient" && (
          <div className="mb-4 grid grid-cols-3 gap-2 rounded-2xl bg-white p-1.5 shadow-sm ring-1 ring-slate-200">
            {AUTH_METHODS.map((item) => {
              const active = item.id === method;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => changeMethod(item.id)}
                  className={`rounded-xl px-2 py-3 text-xs font-semibold transition flex flex-col items-center gap-0.5 ${
                    active
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span>{isHindi ? item.hindi : item.label}</span>
                  {item.isDemo && (
                    <span className={`text-[9px] px-1 py-0.2 rounded font-normal ${active ? "text-emerald-100" : "text-amber-600"}`}>Demo</span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {selectedMethod.isDemo && step === "identifier" && (
          <div className="mb-4 rounded-2xl bg-amber-50 border border-amber-200 p-2.5 text-center text-xs text-amber-800">
            {isHindi
              ? `डेमो मोड: ${selectedMethod.label} के लिए कोई भी ${selectedMethod.maxLength} अंक और 6-अंकीय OTP दर्ज करें।`
              : `Demo mode: Enter any ${selectedMethod.maxLength} digits for ${selectedMethod.label} and any 6-digit OTP to preview.`}
          </div>
        )}

        {step === "select_patient" ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-800">
                {isHindi ? "उपलब्ध खाते" : "Registered Profiles"} ({availablePatients.length})
              </span>
              <span className="text-xs text-slate-500">
                {identifier.slice(0, 10)}
              </span>
            </div>

            <div className="space-y-3">
              {availablePatients.map((patient) => {
                const isSelected = patient.id === selectedPatientId;

                return (
                  <div
                    key={patient.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedPatientId(patient.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedPatientId(patient.id);
                      }
                    }}
                    className={`relative flex flex-col gap-3 rounded-3xl p-5 shadow-sm transition-all duration-200 cursor-pointer select-none active:scale-[0.99] ${
                      isSelected
                        ? "border-2 border-teal-600 bg-white ring-4 ring-teal-100/70"
                        : "border border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    {/* Card Header */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-colors ${
                            isSelected
                              ? "bg-teal-700 text-white shadow-sm"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          <User size={22} />
                        </div>

                        <div>
                          <h2 className="text-base font-bold text-slate-900 leading-tight">
                            {patient.name || patient.full_name}
                          </h2>
                          <p className="mt-0.5 text-xs text-slate-500 font-medium">
                            {patient.age ? `${patient.age} yrs` : "Age N/A"} • {patient.gender || "Patient"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold font-mono text-slate-700">
                          {patient.patient_code || patient.patientId || patient.id.slice(0, 8)}
                        </span>
                        <div
                          className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition ${
                            isSelected
                              ? "border-teal-700 bg-teal-700 text-white"
                              : "border-slate-300 bg-white"
                          }`}
                        >
                          {isSelected && <div className="h-2 w-2 rounded-full bg-white" />}
                        </div>
                      </div>
                    </div>

                    {/* Card Metadata Grid */}
                    <div className="mt-1 grid grid-cols-2 gap-2 rounded-2xl bg-slate-50 p-3 text-xs">
                      <div className="flex items-center gap-2 text-slate-700">
                        <CalendarDays size={15} className="text-slate-400 shrink-0" />
                        <span className="truncate">
                          <strong className="font-semibold text-slate-800">{isHindi ? "अंतिम विज़िट: " : "Last: "}</strong>
                          {patient.last_visit || "None"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-slate-700">
                        <Building2 size={15} className="text-slate-400 shrink-0" />
                        <span className="truncate">
                          {patient.department || "General OPD"}
                        </span>
                      </div>

                      <div className="col-span-2 flex items-center gap-2 text-slate-700 pt-1 border-t border-slate-200/60">
                        <Stethoscope size={15} className="text-teal-700 shrink-0" />
                        <span className="truncate font-medium text-slate-800">
                          {patient.doctor || "Duty Medical Officer"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {error && (
              <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-700">
                {error}
              </p>
            )}

            <div className="pt-2 space-y-3">
              <button
                type="button"
                onClick={handleConfirmPatient}
                disabled={loading || !selectedPatientId}
                className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-teal-700 px-5 text-base font-bold text-white shadow-sm transition hover:bg-teal-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    {isHindi ? "प्रोफ़ाइल खुल रही है..." : "Opening profile..."}
                  </>
                ) : (
                  <>
                    <UserCheck size={20} />
                    {isHindi ? "प्रोफ़ाइल खोलें (आगे बढ़ें)" : "Go to Profile"}
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep("identifier");
                  setOtp("");
                  setError("");
                }}
                className="flex h-12 w-full items-center justify-center rounded-2xl text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                {isHindi ? "दूसरा नंबर उपयोग करें" : "Use a different number"}
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            {step === "identifier" ? (
              <>
                <label className="mb-2 block text-sm font-semibold text-slate-800">
                  {isHindi
                    ? selectedMethod.hindi
                    : selectedMethod.label}
                </label>

                <input
                  type="tel"
                  value={identifier}
                  onChange={handleInputChange}
                  placeholder={
                    isHindi
                      ? selectedMethod.hindiPlaceholder
                      : selectedMethod.placeholder
                  }
                  inputMode="numeric"
                  maxLength={selectedMethod.maxLength}
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
        )}

        <div className="mt-auto pt-6">
          <div className="flex items-start gap-3 rounded-2xl bg-slate-100 p-4">
            <LockKeyhole
              size={18}
              className="mt-0.5 shrink-0 text-slate-600"
            />

            <p className="text-xs leading-5 text-slate-600">
              {isHindi
                ? "सुरक्षित सत्र 8 घंटे तक सक्रिय रहता है। आपके स्वास्थ्य डेटा की पूर्ण गोपनीयता सुनिश्चित की जाती है।"
                : "Secure 8-hour sessions keep you logged in. Your health records are protected with digital privacy controls."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}