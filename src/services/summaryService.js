import {
  mockHealthSummary,
  mockTimeline,
  mockMedicalRecords,
} from "../data/mockData.js";

const wait = (milliseconds = 250) =>
  new Promise((resolve) =>
    setTimeout(resolve, milliseconds)
  );

function clone(value) {
  if (value === undefined || value === null) {
    return value;
  }

  return JSON.parse(JSON.stringify(value));
}

function getPatientName(state = {}) {
  return (
    state.patient?.name ||
    state.session?.patient?.name ||
    "Patient"
  );
}

function getPatientId(state = {}) {
  return (
    state.patient?.id ||
    state.patient?.patientId ||
    state.session?.patient?.id ||
    state.session?.patient?.patientId ||
    null
  );
}

function isHistoryRestricted(state = {}) {
  return Boolean(
    state.isHealthHistoryLocked ||
      state.healthHistoryLocked ||
      state.historySharingEnabled === false ||
      state.privacyData?.healthHistoryAccess
        ?.locked === true ||
      state.privacyData?.healthHistorySharing ===
        false
  );
}

function normalizeTimeline(timeline) {
  if (!Array.isArray(timeline)) {
    return [];
  }

  return timeline.map((item, index) => ({
    id:
      item?.id ||
      `timeline-${index + 1}`,

    year:
      item?.year ||
      new Date().getFullYear().toString(),

    timeLabel:
      item?.timeLabel ||
      item?.date ||
      "RECENT",

    title:
      item?.title ||
      item?.name ||
      "Healthcare record",

    subtitle:
      item?.subtitle ||
      item?.description ||
      "",

    source:
      item?.source ||
      item?.clinic ||
      "Patient record",

    sourceType:
      item?.sourceType ||
      "RECORD",

    documentId:
      item?.documentId ||
      item?.recordId ||
      null,

    visitId:
      item?.visitId ||
      null,

    badgeColor:
      item?.badgeColor ||
      "blue",

    isLatest:
      Boolean(item?.isLatest),
  }));
}

function normalizeRecords(records) {
  if (!Array.isArray(records)) {
    return [];
  }

  return records.map((record) => ({
    id: record?.id || null,

    type:
      record?.type ||
      "other",

    typeLabel:
      record?.typeLabel ||
      record?.type ||
      "Medical record",

    title:
      record?.title ||
      record?.fileName ||
      "Medical record",

    date:
      record?.date ||
      null,

    displayDate:
      record?.displayDate ||
      record?.date ||
      "Not available",

    source:
      record?.source ||
      record?.clinic ||
      "Patient upload",

    doctor:
      record?.doctor ||
      null,

    clinic:
      record?.clinic ||
      null,

    status:
      record?.status ||
      "AVAILABLE",

    visitId:
      record?.visitId ||
      null,

    patientId:
      record?.patientId ||
      null,

    totalPages:
      record?.totalPages ||
      record?.pages?.length ||
      1,

    extraction:
      record?.extraction ||
      record?.extractedInformation ||
      null,
  }));
}

function buildRestrictedSummary() {
  return {
    status: "RESTRICTED",

    title: "Health summary",

    disclaimer:
      "This summary is not a diagnosis. It is based on information available in the patient record.",

    privacyNotice:
      "Health history sharing is turned off. Only information permitted by the patient can be used for this handoff.",

    complaints: [],
    history: [],
    medicines: [],
    investigations: [],
    diagnoses: [],
    procedures: [],
    recordDetails: [],

    timeline: [],
    records: [],
  };
}

function buildSummaryFromState(state = {}) {
  if (isHistoryRestricted(state)) {
    return buildRestrictedSummary();
  }

  const extraction =
    state.extractedData || {};

  const records =
    normalizeRecords(
      state.medicalRecords?.length
        ? state.medicalRecords
        : mockMedicalRecords
    );

  const timeline =
    normalizeTimeline(
      state.timeline?.length
        ? state.timeline
        : mockTimeline
    );

  const diagnosis =
    extraction.diagnosis
      ? [extraction.diagnosis]
      : [];

  return {
    status: "AVAILABLE",

    title: "Health summary",

    patientId:
      getPatientId(state),

    patientName:
      getPatientName(state),

    disclaimer:
      "This summary is not a diagnosis. It is based on patient-provided documents and available extracted information.",

    complaints:
      clone(
        extraction.complaints ||
          extraction.chiefComplaints ||
          extraction.symptoms ||
          []
      ),

    history:
      clone(
        extraction.history ||
          extraction.medicalHistory ||
          []
      ),

    medicines:
      clone(
        extraction.medicines || []
      ),

    investigations:
      clone(
        extraction.investigations || []
      ),

    diagnoses:
      clone(diagnosis),

    procedures:
      clone(
        extraction.procedures || []
      ),

    recordDetails:
      clone(
        extraction.recordDetails || []
      ),

    summary:
      extraction.summary ||
      extraction.overview ||
      mockHealthSummary?.summary ||
      "",

    timeline:
      clone(timeline),

    records:
      clone(records),
  };
}

/**
 * Return the current patient health summary.
 *
 * Prototype implementation:
 * Uses local mock/store data until the backend API is connected.
 */
export async function fetchHealthSummary(
  state = {}
) {
  await wait();

  return {
    success: true,
    summary:
      buildSummaryFromState(state),
  };
}

/**
 * Return the patient's medical timeline.
 */
export async function fetchMedicalTimeline(
  state = {}
) {
  await wait();

  if (isHistoryRestricted(state)) {
    return {
      success: true,
      timeline: [],
      restricted: true,
      privacyNotice:
        "Health history sharing is turned off.",
    };
  }

  const timeline =
    normalizeTimeline(
      state.timeline?.length
        ? state.timeline
        : mockTimeline
    );

  return {
    success: true,
    timeline: clone(timeline),
    restricted: false,
  };
}

/**
 * Build the exact information that can be handed to a doctor.
 *
 * Privacy is evaluated here as a final safety boundary.
 */
export function buildDoctorHandoffPayload(
  state = {}
) {
  const restricted =
    isHistoryRestricted(state);

  const summary =
    buildSummaryFromState(state);

  const kiosk =
    state.kioskSession || null;

  const patient =
    state.patient ||
    state.session?.patient ||
    null;

  if (restricted) {
    return {
      patient: patient
        ? {
            id:
              patient.id ||
              patient.patientId ||
              null,

            name:
              patient.name ||
              null,
          }
        : null,

      kioskSession: kiosk
        ? {
            id: kiosk.id || null,
            hospitalName:
              kiosk.hospitalName || null,
            department:
              kiosk.department || null,
          }
        : null,

      summary,

      extracted: {},

      timeline: [],

      records: [],

      privacy: {
        historySharing: false,
        restricted: true,
      },
    };
  }

  return {
    patient: patient
      ? clone(patient)
      : null,

    kioskSession: kiosk
      ? {
          id: kiosk.id || null,
          terminalId:
            kiosk.terminalId || null,
          hospitalName:
            kiosk.hospitalName || null,
          department:
            kiosk.department || null,
          status:
            kiosk.status || null,
        }
      : null,

    summary,

    extracted:
      clone(state.extractedData || {}),

    timeline:
      clone(state.timeline || []),

    records:
      clone(state.medicalRecords || []),

    document:
      clone(state.documentDraft || null),

    privacy: {
      historySharing: true,
      restricted: false,
    },
  };
}

/**
 * Simulate sending the current summary to the doctor.
 */
export async function sendSummaryToDoctor(
  sessionId,
  payload = {}
) {
  await wait(500);

  if (!sessionId) {
    throw new Error(
      "A valid session ID is required."
    );
  }

  const normalizedPayload =
    payload?.state
      ? buildDoctorHandoffPayload(
          payload.state
        )
      : {
          ...payload,
        extracted:
          clone(payload.extracted || {}),
        timeline:
          clone(payload.timeline || []),
      };

  return {
    success: true,

    status: "SENT",

    handoffId:
      `HANDOFF-${Date.now()}`,

    sessionId,

    sentAt:
      new Date().toISOString(),

    payload:
      normalizedPayload,

    message:
      "Information was prepared for doctor review.",
  };
}

/**
 * Preferred API for sending the complete current application state.
 */
export async function sendCurrentStateToDoctor(
  state = {}
) {
  const sessionId =
    state.session?.sessionId ||
    state.kioskSession?.id ||
    "mobile-session";

  const payload =
    buildDoctorHandoffPayload(state);

  return sendSummaryToDoctor(
    sessionId,
    payload
  );
}

export default {
  fetchHealthSummary,
  fetchMedicalTimeline,
  buildDoctorHandoffPayload,
  sendSummaryToDoctor,
  sendCurrentStateToDoctor,
};