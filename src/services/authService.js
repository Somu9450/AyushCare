/**
 * Authentication Service
 *
 * Current version:
 * - Mock OTP authentication
 * - No real credentials are stored
 * - Designed to mirror the future backend API boundary
 *
 * Supported authentication methods:
 * - Mobile number
 * - ABHA ID
 * - Aadhaar
 *
 * Kiosk QR sessions intentionally do NOT use this service.
 * A QR-connected patient already has a short-lived kiosk session.
 */

const MOCK_OTP = "123456";

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function normalizeIdentifier(identifier) {
  return String(identifier || "").trim();
}

function normalizeAuthType(authType) {
  const value = String(authType || "mobile").toLowerCase();

  if (value === "abha" || value === "abha_id") {
    return "abha";
  }

  if (value === "aadhaar" || value === "aadhar") {
    return "aadhaar";
  }

  return "mobile";
}

function createSessionId() {
  return `mob_sess_${Date.now()}_${Math.floor(
    100 + Math.random() * 900,
  )}`;
}

/**
 * Request an OTP.
 *
 * Production API:
 * POST /api/v1/mobile/auth/request-otp
 *
 * Request:
 * {
 *   authType: "mobile" | "abha" | "aadhaar",
 *   identifier: "..."
 * }
 */
export async function requestOtp({
  authType = "mobile",
  identifier = "",
} = {}) {
  await wait(400);

  const normalizedIdentifier = normalizeIdentifier(identifier);
  const normalizedAuthType = normalizeAuthType(authType);

  if (!normalizedIdentifier) {
    return {
      success: false,
      error: "Please enter your registered identifier.",
    };
  }

  return {
    success: true,
    authType: normalizedAuthType,
    maskedIdentifier: maskIdentifier(
      normalizedIdentifier,
      normalizedAuthType,
    ),
    otpSent: true,

    // Prototype-only information.
    // A real backend must NEVER return the OTP to the client.
    demoOtp: MOCK_OTP,

    expiresInSeconds: 300,
  };
}

/**
 * Verify OTP and create a mobile session.
 *
 * Production API:
 * POST /api/v1/mobile/auth/verify-otp
 */
export async function verifyOtp({
  authType = "mobile",
  identifier = "",
  otp = "",
} = {}) {
  await wait(500);

  const normalizedIdentifier = normalizeIdentifier(identifier);
  const normalizedAuthType = normalizeAuthType(authType);
  const normalizedOtp = String(otp || "").trim();

  if (!normalizedIdentifier) {
    return {
      success: false,
      error: "Identifier is required.",
    };
  }

  if (!/^\d{6}$/.test(normalizedOtp)) {
    return {
      success: false,
      error: "Enter the 6-digit OTP.",
    };
  }

  if (normalizedOtp !== MOCK_OTP) {
    return {
      success: false,
      error: "Invalid OTP. Use 123456 in this prototype.",
    };
  }

  return {
    success: true,

    user: {
      id: "pat_88129012",
      patientId: "PATIENT-001",
      authType: normalizedAuthType,
      identifier: normalizedIdentifier,
    },

    session: {
      sessionId: createSessionId(),
      authenticatedAt: new Date().toISOString(),
      expiresInSeconds: 3600,
    },
  };
}

/**
 * Convenience login function used by AuthScreen.
 *
 * Production implementation can collapse this into the backend
 * request/verify flow while keeping the UI contract unchanged.
 */
export async function loginPatient({
  authType = "mobile",
  identifier = "",
  otp = MOCK_OTP,
} = {}) {
  const otpRequest = await requestOtp({
    authType,
    identifier,
  });

  if (!otpRequest.success) {
    return otpRequest;
  }

  return verifyOtp({
    authType,
    identifier,
    otp,
  });
}

/**
 * End the authenticated mobile session.
 *
 * Production API:
 * POST /api/v1/mobile/auth/logout
 */
export async function logoutPatient(sessionId) {
  await wait(150);

  return {
    success: true,
    sessionId: sessionId || null,
    loggedOutAt: new Date().toISOString(),
  };
}

/**
 * Mask identifiers before displaying them in the UI.
 */
function maskIdentifier(identifier, authType) {
  if (authType === "mobile") {
    const digits = identifier.replace(/\D/g, "");

    if (digits.length >= 4) {
      return `${"*".repeat(Math.max(0, digits.length - 4))}${digits.slice(
        -4,
      )}`;
    }

    return "****";
  }

  if (authType === "aadhaar") {
    const digits = identifier.replace(/\D/g, "");

    if (digits.length >= 4) {
      return `XXXX XXXX ${digits.slice(-4)}`;
    }

    return "XXXX XXXX XXXX";
  }

  if (authType === "abha") {
    const compact = identifier.replace(/\s/g, "");

    if (compact.length >= 4) {
      return `${compact.slice(0, 2)}-XXXX-XXXX-${compact.slice(-4)}`;
    }

    return "XX-XXXX-XXXX-XXXX";
  }

  return "********";
}

export { MOCK_OTP };