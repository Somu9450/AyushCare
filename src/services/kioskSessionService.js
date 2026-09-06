const SESSION_TTL_SECONDS = 5 * 60;

export const DEFAULT_DEMO_TOKEN = "AYUSH-DEMO-42";

const MOCK_KIOSK_SESSIONS = {
  "AYUSH-DEMO-42": {
    sessionToken: "AYUSH-DEMO-42",
    kioskName: "Hospital OPD Kiosk",
    terminalId: "KIOSK-DELHI-OPD-03",
    hospitalName: "Civil Hospital OPD",
    hindiHospitalName: "सिविल अस्पताल ओपीडी",
    department: "General Medicine OPD",
    location: "Central Delhi OPD Terminal",
  },

  "AYUSH-DEMO-45": {
    sessionToken: "AYUSH-DEMO-45",
    kioskName: "Hospital OPD Kiosk",
    terminalId: "KIOSK-DELHI-OPD-05",
    hospitalName: "Civil Hospital OPD",
    hindiHospitalName: "सिविल अस्पताल ओपीडी",
    department: "General Medicine OPD",
    location: "Central Delhi OPD Terminal",
  },
};

const wait = (milliseconds = 250) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

function createExpiryDate(seconds = SESSION_TTL_SECONDS) {
  return new Date(Date.now() + seconds * 1000).toISOString();
}

function clone(value) {
  if (value === undefined || value === null) {
    return value;
  }

  return JSON.parse(JSON.stringify(value));
}

/**
 * Accepts:
 *   AYUSH-DEMO-42
 *   ?session=AYUSH-DEMO-42
 *   ?token=AYUSH-DEMO-42
 *   https://example.com/connect?session=AYUSH-DEMO-42
 *   { sessionToken: "AYUSH-DEMO-42" }
 */
export function parseKioskQrReference(value) {
  if (!value) {
    return null;
  }

  if (typeof value === "object") {
    return (
      value.sessionToken ||
      value.session ||
      value.token ||
      value.reference ||
      null
    );
  }

  const rawValue = String(value).trim();

  if (!rawValue) {
    return null;
  }

  try {
    const url = new URL(rawValue);

    return (
      url.searchParams.get("session") ||
      url.searchParams.get("sessionToken") ||
      url.searchParams.get("token") ||
      url.searchParams.get("reference") ||
      url.pathname.split("/").filter(Boolean).pop() ||
      rawValue
    );
  } catch {
    // Not a URL. Continue with query-string parsing.
  }

  try {
    const params = new URLSearchParams(rawValue);

    return (
      params.get("session") ||
      params.get("sessionToken") ||
      params.get("token") ||
      params.get("reference") ||
      rawValue
    );
  } catch {
    return rawValue;
  }
}

function normalizeSessionReference(value) {
  const parsed = parseKioskQrReference(value);

  if (!parsed) {
    return null;
  }

  return String(parsed).trim();
}

function getRegisteredKioskSession(sessionToken) {
  if (!sessionToken) {
    return null;
  }

  const normalizedToken = String(sessionToken).trim();

  return (
    MOCK_KIOSK_SESSIONS[normalizedToken] ||
    null
  );
}

function buildConnectedSession(baseSession, sessionToken) {
  const now = new Date().toISOString();

  return {
    id: `kiosk-session-${Date.now()}`,
    sessionToken,
    kioskName: baseSession.kioskName,
    terminalId: baseSession.terminalId,
    hospitalName: baseSession.hospitalName,
    hindiHospitalName: baseSession.hindiHospitalName,
    department: baseSession.department,
    location: baseSession.location,

    status: "CONNECTED",

    startedAt: now,
    connectedAt: now,
    endedAt: null,

    expiresAt: createExpiryDate(SESSION_TTL_SECONDS),
    expiresInSeconds: SESSION_TTL_SECONDS,
  };
}

export async function connectKioskSession(sessionReference) {
  await wait();

  const sessionToken = normalizeSessionReference(sessionReference);

  if (!sessionToken) {
    return {
      success: false,
      error: "INVALID_SESSION_REFERENCE",
      message: "No kiosk session reference was provided.",
    };
  }

  const kiosk = getRegisteredKioskSession(sessionToken);

  if (!kiosk) {
    return {
      success: false,
      error: "SESSION_NOT_FOUND",
      message: "This kiosk session is invalid or has expired.",
    };
  }

  const session = buildConnectedSession(kiosk, sessionToken);

  return {
    success: true,
    session: clone(session),
    kiosk: clone(kiosk),
  };
}

export function validateKioskSession(session) {
  if (!session) {
    return {
      valid: false,
      reason: "NO_SESSION",
    };
  }

  if (!session.sessionToken) {
    return {
      valid: false,
      reason: "NO_SESSION_TOKEN",
    };
  }

  if (session.status !== "CONNECTED") {
    return {
      valid: false,
      reason: "SESSION_NOT_CONNECTED",
    };
  }

  if (!session.expiresAt) {
    return {
      valid: false,
      reason: "NO_EXPIRY",
    };
  }

  const expiresAt = new Date(session.expiresAt).getTime();

  if (Number.isNaN(expiresAt)) {
    return {
      valid: false,
      reason: "INVALID_EXPIRY",
    };
  }

  if (expiresAt <= Date.now()) {
    return {
      valid: false,
      reason: "SESSION_EXPIRED",
    };
  }

  return {
    valid: true,
    reason: null,
    remainingSeconds: Math.max(
      0,
      Math.ceil((expiresAt - Date.now()) / 1000)
    ),
  };
}

export function isKioskSessionActive(session) {
  return validateKioskSession(session).valid;
}

export function getRemainingSessionSeconds(session) {
  const validation = validateKioskSession(session);

  if (!validation.valid) {
    return 0;
  }

  return validation.remainingSeconds;
}

export async function disconnectKioskSession(session) {
  await wait(150);

  if (!session) {
    return {
      success: true,
      session: null,
    };
  }

  return {
    success: true,
    session: {
      ...clone(session),
      status: "DISCONNECTED",
      endedAt: new Date().toISOString(),
      expiresInSeconds: 0,
    },
  };
}

export async function endKioskSession(session) {
  return disconnectKioskSession(session);
}

export function createDemoKioskSession(
  token = DEFAULT_DEMO_TOKEN
) {
  const registered =
    getRegisteredKioskSession(token) ||
    MOCK_KIOSK_SESSIONS[DEFAULT_DEMO_TOKEN];

  const resolvedToken =
    registered?.sessionToken || DEFAULT_DEMO_TOKEN;

  return buildConnectedSession(
    registered,
    resolvedToken
  );
}

export function buildKioskQrValue(
  sessionToken = DEFAULT_DEMO_TOKEN
) {
  return String(sessionToken);
}

export function getDefaultDemoToken() {
  return DEFAULT_DEMO_TOKEN;
}

export { SESSION_TTL_SECONDS };

export default {
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