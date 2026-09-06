import {
  mockVisits,
  mockMedicalRecords,
} from "../data/mockData.js";

const wait = (milliseconds = 200) =>
  new Promise((resolve) =>
    setTimeout(resolve, milliseconds)
  );

function clone(value) {
  if (value === undefined || value === null) {
    return value;
  }

  return JSON.parse(JSON.stringify(value));
}

function normalizeDate(value) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date
    .toISOString()
    .split("T")[0];
}

function getVisitDate(visit) {
  return (
    visit?.date ||
    visit?.visitDate ||
    visit?.appointmentDate ||
    visit?.createdAt ||
    null
  );
}

export function normalizeVisit(
  visit = {}
) {
  const date =
    normalizeDate(
      getVisitDate(visit)
    );

  const documents =
    Array.isArray(
      visit.documents
    )
      ? visit.documents
      : [];

  return {
    ...visit,

    id:
      visit.id ||
      visit.visitId ||
      `VISIT-${Date.now()}`,

    visitId:
      visit.visitId ||
      visit.id ||
      null,

    date,

    displayDate:
      visit.displayDate ||
      date ||
      "Not available",

    hospitalName:
      visit.hospitalName ||
      visit.hospital ||
      visit.facilityName ||
      "Civil Hospital OPD",

    department:
      visit.department ||
      visit.specialty ||
      "General Medicine OPD",

    doctorName:
      visit.doctorName ||
      visit.doctor?.name ||
      visit.providerName ||
      "Not assigned",

    status:
      visit.status ||
      "COMPLETED",

    documents:
      clone(documents),
  };
}

function sortNewestFirst(
  visits
) {
  return [...visits].sort(
    (a, b) => {
      const aTime =
        new Date(
          getVisitDate(a) || 0
        ).getTime();

      const bTime =
        new Date(
          getVisitDate(b) || 0
        ).getTime();

      return bTime - aTime;
    }
  );
}

function getSourceVisits() {
  return Array.isArray(mockVisits)
    ? mockVisits
    : [];
}

function matchesPatient(
  visit,
  patientId
) {
  if (!patientId) {
    return true;
  }

  const visitPatientId =
    visit?.patientId ||
    visit?.patient?.id ||
    visit?.patient?.patientId;

  return (
    !visitPatientId ||
    visitPatientId === patientId
  );
}

export async function fetchVisits(
  patientId = null
) {
  await wait();

  const visits =
    getSourceVisits()
      .filter((visit) =>
        matchesPatient(
          visit,
          patientId
        )
      )
      .map(normalizeVisit);

  return {
    success: true,

    visits:
      sortNewestFirst(visits),
  };
}

export async function fetchVisitDetails(
  visitId,
  patientId = null
) {
  await wait();

  if (!visitId) {
    return {
      success: false,
      error:
        "Visit ID is required.",
    };
  }

  const visit =
    getSourceVisits().find(
      (item) =>
        item.id === visitId ||
        item.visitId === visitId
    );

  if (!visit) {
    return {
      success: false,
      error:
        "Visit was not found.",
    };
  }

  if (
    !matchesPatient(
      visit,
      patientId
    )
  ) {
    return {
      success: false,
      error:
        "This visit is not available for the selected patient.",
    };
  }

  const normalized =
    normalizeVisit(visit);

  const documents =
    await getDocumentsForVisit(
      normalized.id
    );

  return {
    success: true,

    visit: {
      ...normalized,
      documents,
    },
  };
}

export async function fetchPastVisits(
  patientId = null
) {
  const result =
    await fetchVisits(
      patientId
    );

  if (!result.success) {
    return result;
  }

  const today =
    new Date()
      .toISOString()
      .split("T")[0];

  return {
    ...result,

    visits:
      result.visits.filter(
        (visit) =>
          !visit.date ||
          visit.date <= today
      ),
  };
}

export async function fetchActiveVisit(
  patientId = null
) {
  const result =
    await fetchVisits(
      patientId
    );

  if (!result.success) {
    return result;
  }

  const active =
    result.visits.find(
      (visit) =>
        visit.status ===
          "ACTIVE" ||
        visit.status ===
          "IN_PROGRESS" ||
        visit.status ===
          "ONGOING"
    );

  return {
    success: true,

    visit:
      active || null,
  };
}

export async function getDocumentsForVisit(
  visitId
) {
  await wait(100);

  if (!visitId) {
    return [];
  }

  return mockMedicalRecords
    .filter(
      (record) =>
        record.visitId ===
        visitId
    )
    .map(clone);
}

export async function attachDocumentToVisit(
  visitId,
  documentId
) {
  await wait(150);

  if (!visitId || !documentId) {
    return {
      success: false,
      error:
        "Both visit ID and document ID are required.",
    };
  }

  return {
    success: true,

    visitId,

    documentId,

    attachedAt:
      new Date().toISOString(),
  };
}

export function buildVisitWithDocuments(
  visit,
  records = []
) {
  const normalized =
    normalizeVisit(visit);

  const documents =
    Array.isArray(records)
      ? records.filter(
          (record) =>
            record.visitId ===
            normalized.id
        )
      : [];

  return {
    ...normalized,

    documents:
      clone(documents),
  };
}

export default {
  normalizeVisit,
  fetchVisits,
  fetchVisitDetails,
  fetchPastVisits,
  fetchActiveVisit,
  getDocumentsForVisit,
  attachDocumentToVisit,
  buildVisitWithDocuments,
};