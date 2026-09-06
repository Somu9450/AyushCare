import {
  DEFAULT_DEMO_TOKEN,
  SESSION_TTL_SECONDS,
  parseKioskQrReference,
  connectKioskSession,
  validateKioskSession,
  isKioskSessionActive,
  getRemainingSessionSeconds,
  disconnectKioskSession,
  endKioskSession,
  createDemoKioskSession,
  buildKioskQrValue,
  getDefaultDemoToken,
} from "./kioskSessionService";

/* -------------------------------------------------------------------------- */
/* MOBILE SESSION                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Creates a lightweight mobile application session.
 *
 * This is intentionally separate from the kiosk session.
 * Authentication creates the mobile session, while a kiosk QR connection
 * creates/attaches a temporary kiosk session.
 */
export function createMobileSession({
  patient = null,
  authType = null,
  sessionId = null,
  expiresInSeconds = 60 * 60,
} = {}) {
  const now = new Date();
  const resolvedSessionId =
    sessionId ||
    `mobile-session-${Date.now()}`;

  return {
    sessionId: resolvedSessionId,
    patient,
    authType,
    createdAt: now.toISOString(),
    lastActiveAt: now.toISOString(),
    expiresAt: new Date(
      now.getTime() +
        expiresInSeconds * 1000
    ).toISOString(),
    expiresInSeconds,
  };
}

/**
 * Updates the activity timestamp of an existing mobile session.
 *
 * Kept as a pure helper so AuthScreen and other callers can safely use it
 * without needing a backend/session store yet.
 */
export function touchMobileSession(
  session
) {
  if (!session) {
    return null;
  }

  return {
    ...session,
    lastActiveAt:
      new Date().toISOString(),
  };
}

/* -------------------------------------------------------------------------- */
/* KIOSK SESSION RE-EXPORTS                                                   */
/* -------------------------------------------------------------------------- */

export {
  DEFAULT_DEMO_TOKEN,
  SESSION_TTL_SECONDS,
  parseKioskQrReference,
  connectKioskSession,
  validateKioskSession,
  isKioskSessionActive,
  getRemainingSessionSeconds,
  disconnectKioskSession,
  endKioskSession,
  createDemoKioskSession,
  buildKioskQrValue,
  getDefaultDemoToken,
};

/* -------------------------------------------------------------------------- */
/* MOBILE/KIOSK NORMALIZATION                                                */
/* -------------------------------------------------------------------------- */

export function normalizeMobileSession(
  session
) {
  if (!session) {
    return null;
  }

  const validation =
    validateKioskSession(session);

  return {
    ...session,
    isActive: validation.valid,
    remainingSeconds: validation.valid
      ? validation.remainingSeconds
      : 0,
  };
}

export function getMobileSessionStatus(
  session
) {
  if (!session) {
    return {
      connected: false,
      expired: false,
      remainingSeconds: 0,
    };
  }

  const validation =
    validateKioskSession(session);

  return {
    connected: validation.valid,
    expired:
      validation.reason ===
      "SESSION_EXPIRED",
    remainingSeconds: validation.valid
      ? validation.remainingSeconds
      : 0,
  };
}

/* -------------------------------------------------------------------------- */
/* MOBILE → KIOSK CONNECTION                                                 */
/* -------------------------------------------------------------------------- */

export async function connectMobileToKiosk(
  sessionReference
) {
  const result =
    await connectKioskSession(
      sessionReference
    );

  if (!result.success) {
    return result;
  }

  return {
    ...result,
    session:
      normalizeMobileSession(
        result.session
      ),
  };
}

/* -------------------------------------------------------------------------- */
/* MOBILE → KIOSK DISCONNECTION                                              */
/* -------------------------------------------------------------------------- */

export async function disconnectMobileFromKiosk(
  session
) {
  const result =
    await disconnectKioskSession(
      session
    );

  return {
    ...result,
    session:
      normalizeMobileSession(
        result.session
      ),
  };
}

/* -------------------------------------------------------------------------- */
/* END KIOSK SESSION                                                          */
/* -------------------------------------------------------------------------- */

export async function endMobileKioskSession(
  session
) {
  const result =
    await endKioskSession(session);

  return {
    ...result,
    session:
      normalizeMobileSession(
        result.session
      ),
  };
}

/* -------------------------------------------------------------------------- */
/* DEFAULT EXPORT                                                            */
/* -------------------------------------------------------------------------- */

export default {
  createMobileSession,
  touchMobileSession,

  DEFAULT_DEMO_TOKEN,
  SESSION_TTL_SECONDS,

  parseKioskQrReference,
  connectKioskSession,
  validateKioskSession,
  isKioskSessionActive,
  getRemainingSessionSeconds,
  disconnectKioskSession,
  endKioskSession,
  createDemoKioskSession,
  buildKioskQrValue,
  getDefaultDemoToken,

  normalizeMobileSession,
  getMobileSessionStatus,

  connectMobileToKiosk,
  disconnectMobileFromKiosk,
  endMobileKioskSession,
};