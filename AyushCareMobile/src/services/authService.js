
import { apiRequest, unwrapApiResponse } from "./apiClient";

function normalizeMobile(value) {
  const raw = String(value || "").trim();
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
  return raw.startsWith("+") ? raw : raw;
}

function maskMobile(value) {
  const digits = String(value || "").replace(/\D/g, "");
  return digits.length >= 4 ? `${"*".repeat(Math.max(0, digits.length - 4))}${digits.slice(-4)}` : "****";
}

export async function requestOtp({ authType = "MOBILE", identifier = "" } = {}) {
  if (String(authType).toUpperCase() !== "MOBILE") {
    return { success: false, error: "The current backend supports patient portal OTP through a mobile number." };
  }
  const mobileNumber = normalizeMobile(identifier);
  if (!/^\+91\d{10}$/.test(mobileNumber)) {
    return { success: false, error: "Enter a valid 10-digit Indian mobile number." };
  }

  const payload = unwrapApiResponse(await apiRequest("/mobile/portal/auth/send-otp", {
    method: "POST",
    body: JSON.stringify({ mobileNumber }),
  }));

  return {
    success: true,
    authType: "MOBILE",
    mobileNumber,
    maskedIdentifier: maskMobile(mobileNumber),
    otpSent: true,
    expiresInSeconds: 300,
    ...payload,
  };
}

export async function verifyOtp({ authType = "MOBILE", identifier = "", otp = "" } = {}) {
  if (String(authType).toUpperCase() !== "MOBILE") {
    return { success: false, error: "The current backend supports mobile OTP authentication." };
  }

  const mobileNumber = normalizeMobile(identifier);
  if (!/^\d{6}$/.test(String(otp).trim())) {
    return { success: false, error: "Enter the 6-digit OTP." };
  }

  const payload = unwrapApiResponse(await apiRequest("/mobile/portal/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify({ mobileNumber, otp: String(otp).trim() }),
  }));

  const accessToken = payload?.accessToken;
  if (accessToken) {
    try { localStorage.setItem("ayushcare_access_token", accessToken); } catch {}
  }

  return {
    success: true,
    ...payload,
    user: payload?.patient ? {
      id: payload.patient.id,
      patientId: payload.patient.id,
      name: payload.patient.full_name,
      mobile: payload.patient.mobile_number,
    } : payload?.user,
    session: {
      sessionId: payload?.patient?.id || null,
      expiresInSeconds: 86400,
    },
  };
}

export async function loginPatient({ authType = "MOBILE", identifier = "", otp = "" } = {}) {
  return verifyOtp({ authType, identifier, otp });
}

export async function logoutPatient() {
  try { localStorage.removeItem("ayushcare_access_token"); } catch {}
  return { success: true };
}
