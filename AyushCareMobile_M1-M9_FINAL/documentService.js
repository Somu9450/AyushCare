import {
  mockExtractionByType,
  getMockExtractionForDocument,
  mockMedicalRecords,
} from "../data/mockData";

export const DOCUMENT_TYPES = {
  PRESCRIPTION: "prescription",
  LAB_REPORT: "lab_report",
  DISCHARGE_SUMMARY: "discharge_summary",
  OTHER: "other",
};

const DOCUMENT_TYPE_ALIASES = {
  prescription: DOCUMENT_TYPES.PRESCRIPTION,
  prescription_document: DOCUMENT_TYPES.PRESCRIPTION,

  lab: DOCUMENT_TYPES.LAB_REPORT,
  labs: DOCUMENT_TYPES.LAB_REPORT,
  laboratory: DOCUMENT_TYPES.LAB_REPORT,
  lab_report: DOCUMENT_TYPES.LAB_REPORT,
  laboratory_report: DOCUMENT_TYPES.LAB_REPORT,

  discharge: DOCUMENT_TYPES.DISCHARGE_SUMMARY,
  discharge_summary: DOCUMENT_TYPES.DISCHARGE_SUMMARY,
  discharge_document: DOCUMENT_TYPES.DISCHARGE_SUMMARY,

  other: DOCUMENT_TYPES.OTHER,
  other_document: DOCUMENT_TYPES.OTHER,
};

const clone = (value) => {
  if (value === undefined || value === null) {
    return value;
  }

  try {
    return structuredClone(value);
  } catch {
    return JSON.parse(JSON.stringify(value));
  }
};

export function normalizeDocumentType(type) {
  if (!type) {
    return DOCUMENT_TYPES.OTHER;
  }

  const normalized = String(type)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/-/g, "_");

  return (
    DOCUMENT_TYPE_ALIASES[normalized] ||
    DOCUMENT_TYPES.OTHER
  );
}

export function getDocumentTypeLabel(type) {
  switch (normalizeDocumentType(type)) {
    case DOCUMENT_TYPES.PRESCRIPTION:
      return "Prescription";

    case DOCUMENT_TYPES.LAB_REPORT:
      return "Lab report";

    case DOCUMENT_TYPES.DISCHARGE_SUMMARY:
      return "Discharge summary";

    default:
      return "Other document";
  }
}

export function createDocumentId(prefix = "doc") {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

export function createDocumentPage({
  source,
  documentType,
  pageNumber = 1,
  id,
}) {
  const normalizedType = normalizeDocumentType(documentType);

  const pageId =
    id ||
    source?.id ||
    createDocumentId("page");

  return {
    id: pageId,
    pageNumber,
    documentType: normalizedType,

    previewUrl:
      source?.previewUrl ||
      source?.preview ||
      source?.imageUrl ||
      source?.url ||
      source?.dataUrl ||
      "",

    imageUrl:
      source?.imageUrl ||
      source?.previewUrl ||
      source?.preview ||
      source?.url ||
      source?.dataUrl ||
      "",

    dataUrl: source?.dataUrl || "",

    fileName:
      source?.fileName ||
      source?.name ||
      `document-page-${pageNumber}`,

    mimeType:
      source?.mimeType ||
      source?.type ||
      "image/jpeg",

    width: source?.width || null,
    height: source?.height || null,

    capturedAt:
      source?.capturedAt ||
      new Date().toISOString(),

    source: source?.source || "mobile-camera",
  };
}

export function normalizeDocumentPages({
  capturedDocuments,
  capturedDocument,
  documentType,
}) {
  let sourcePages = [];

  if (
    Array.isArray(capturedDocuments) &&
    capturedDocuments.length > 0
  ) {
    sourcePages = capturedDocuments;
  } else if (
    capturedDocument?.pages &&
    Array.isArray(capturedDocument.pages) &&
    capturedDocument.pages.length > 0
  ) {
    sourcePages = capturedDocument.pages;
  } else if (capturedDocument) {
    sourcePages = [capturedDocument];
  }

  return sourcePages
    .filter(Boolean)
    .map((page, index) =>
      createDocumentPage({
        source: page,
        documentType:
          page?.documentType ||
          documentType ||
          capturedDocument?.documentType,
        pageNumber: index + 1,
        id: page?.id,
      })
    );
}

export function buildDocumentPayload({
  capturedDocuments,
  capturedDocument,
  documentType,
}) {
  const pages = normalizeDocumentPages({
    capturedDocuments,
    capturedDocument,
    documentType,
  });

  const normalizedType = normalizeDocumentType(
    documentType ||
      capturedDocument?.documentType ||
      pages[0]?.documentType
  );

  return {
    id:
      capturedDocument?.documentId ||
      capturedDocument?.id ||
      createDocumentId("document"),

    documentType: normalizedType,

    documentTypeLabel: getDocumentTypeLabel(normalizedType),

    pageCount: pages.length,

    pages,

    capturedAt:
      capturedDocument?.capturedAt ||
      pages[0]?.capturedAt ||
      new Date().toISOString(),

    source: "AyushCareMobile",
  };
}

export function validateDocumentForAnalysis(payload) {
  const document = payload || {};

  const pages = normalizeDocumentPages({
    capturedDocuments: document.pages,
    capturedDocument: document.document,
    documentType: document.documentType,
  });

  if (!pages.length) {
    return {
      valid: false,
      reason: "No document pages were provided.",
      pages: [],
    };
  }

  const missingPreview = pages.filter(
    (page) =>
      !page.previewUrl &&
      !page.imageUrl &&
      !page.dataUrl
  );

  if (missingPreview.length === pages.length) {
    return {
      valid: false,
      reason: "Document images are unavailable.",
      pages,
    };
  }

  return {
    valid: true,
    reason: "",
    pages,
  };
}

const wait = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export async function analyzeDocumentOCR(
  input,
  onProgress
) {
  const payload = input || {};

  const document = buildDocumentPayload({
    capturedDocuments:
      payload.pages ||
      payload.images ||
      payload.capturedDocuments,

    capturedDocument:
      payload.document ||
      payload.capturedDocument,

    documentType: payload.documentType,
  });

  const validation = validateDocumentForAnalysis(document);

  if (!validation.valid) {
    throw new Error(validation.reason);
  }

  const totalSteps = 4;

  const report = async (
    step,
    progress,
    label
  ) => {
    if (typeof onProgress === "function") {
      onProgress({
        step,
        totalSteps,
        progress,
        label,
      });
    }

    await wait(120);
  };

  await report(
    1,
    15,
    "Preparing document pages..."
  );

  await report(
    2,
    40,
    "Reading document text..."
  );

  await report(
    3,
    70,
    "Identifying medical information..."
  );

  const type = normalizeDocumentType(
    document.documentType
  );

  const pageCount = document.pages.length;

  const documentTitle =
    payload.documentTitle ||
    getDocumentTypeLabel(type);

  let extraction;

  if (
    typeof getMockExtractionForDocument ===
    "function"
  ) {
    extraction = getMockExtractionForDocument(
      type,
      documentTitle,
      pageCount
    );
  } else {
    extraction =
      mockExtractionByType?.[type] ||
      mockExtractionByType?.[DOCUMENT_TYPES.OTHER] ||
      {};
  }

  await report(
    4,
    92,
    "Preparing extracted information..."
  );

  const result = {
    extraction_status: "success",

    extractionStatus: "success",

    document_id: document.id,

    documentId: document.id,

    document_type: type,

    documentType: type,

    document_title: documentTitle,

    documentTitle,

    page_count: pageCount,

    pageCount,

    parsed_date:
      extraction?.parsed_date ||
      extraction?.parsedDate ||
      extraction?.date ||
      null,

    parsedDate:
      extraction?.parsedDate ||
      extraction?.parsed_date ||
      extraction?.date ||
      null,

    detected_entities:
      clone(
        extraction?.detected_entities ||
          extraction?.detectedEntities ||
          {}
      ),

    medicines: clone(
      extraction?.medicines ||
        extraction?.medications ||
        []
    ),

    medications: clone(
      extraction?.medications ||
        extraction?.medicines ||
        []
    ),

    diagnoses: clone(
      extraction?.diagnoses ||
        extraction?.conditions ||
        []
    ),

    conditions: clone(
      extraction?.conditions ||
        extraction?.diagnoses ||
        []
    ),

    investigations: clone(
      extraction?.investigations ||
        extraction?.tests ||
        extraction?.labResults ||
        []
    ),

    tests: clone(
      extraction?.tests ||
        extraction?.investigations ||
        []
    ),

    symptoms: clone(
      extraction?.symptoms ||
        extraction?.complaints ||
        []
    ),

    allergies: clone(
      extraction?.allergies ||
        []
    ),

    raw_text:
      extraction?.raw_text ||
      extraction?.rawText ||
      "",

    rawText:
      extraction?.rawText ||
      extraction?.raw_text ||
      "",

    sourceDocument: {
      id: document.id,
      documentType: type,
      documentTypeLabel:
        getDocumentTypeLabel(type),
      pageCount,
      pages: clone(document.pages),
    },
  };

  await report(
    4,
    100,
    "Analysis complete"
  );

  return result;
}

export async function fetchMedicalRecords() {
  await wait(100);

  return clone(mockMedicalRecords || []);
}

export async function getDocumentDetails(documentId) {
  await wait(100);

  const records = await fetchMedicalRecords();

  return (
    records.find(
      (record) =>
        record.id === documentId ||
        record.documentId === documentId
    ) || null
  );
}

export async function updateRecordExtraction(
  documentId,
  extraction
) {
  await wait(100);

  return {
    success: true,
    documentId,
    extraction: clone(extraction),
    updatedAt: new Date().toISOString(),
  };
}

export default {
  DOCUMENT_TYPES,
  normalizeDocumentType,
  getDocumentTypeLabel,
  createDocumentId,
  createDocumentPage,
  normalizeDocumentPages,
  buildDocumentPayload,
  validateDocumentForAnalysis,
  analyzeDocumentOCR,
  fetchMedicalRecords,
  getDocumentDetails,
  updateRecordExtraction,
};