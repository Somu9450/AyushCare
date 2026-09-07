
import { apiRequest, unwrapApiResponse, API_BASE_URL } from "./apiClient";

export const DOCUMENT_TYPES = {
  PRESCRIPTION: "prescription",
  LAB_REPORT: "lab_report",
  DISCHARGE_SUMMARY: "discharge_summary",
  OTHER: "other",
};
const aliases = {
  prescription: "prescription", lab: "lab_report", labs: "lab_report", laboratory: "lab_report",
  lab_report: "lab_report", discharge: "discharge_summary", discharge_summary: "discharge_summary",
  other: "other", other_document: "other",
};
export function normalizeDocumentType(type) {
  const key = String(type || "other").trim().toLowerCase().replace(/\s+/g, "_").replace(/-/g, "_");
  return aliases[key] || "other";
}
export function getDocumentTypeLabel(type) {
  return ({ prescription: "Prescription", lab_report: "Lab report", discharge_summary: "Discharge summary", other: "Other document" })[normalizeDocumentType(type)];
}
export function createDocumentId(prefix = "doc") { return `${prefix}-${Date.now()}`; }
export function createDocumentPage({ source = {}, documentType, pageNumber = 1, id } = {}) {
  const preview = source.previewUrl || source.imageUrl || source.dataUrl || source.image || source.preview || "";
  return {
    id: id || source.id || createDocumentId("page"), pageNumber,
    documentType: normalizeDocumentType(documentType || source.documentType),
    previewUrl: preview, imageUrl: preview, dataUrl: source.dataUrl || preview, preview, image: source.image || preview,
    fileName: source.fileName || source.name || `document-page-${pageNumber}.jpg`,
    mimeType: source.mimeType || source.type || "image/jpeg",
    fileSize: source.fileSize || null, width: source.width || null, height: source.height || null,
    capturedAt: source.capturedAt || new Date().toISOString(), source: source.source || "mobile-camera",
    file: source.file instanceof Blob ? source.file : null,
  };
}
export function normalizeDocumentPages({ capturedDocuments, capturedDocument, documentType } = {}) {
  const pages = Array.isArray(capturedDocuments) && capturedDocuments.length
    ? capturedDocuments : capturedDocument?.pages?.length ? capturedDocument.pages : capturedDocument ? [capturedDocument] : [];
  return pages.filter(Boolean).map((p, i) => createDocumentPage({ source: p, documentType: p.documentType || documentType, pageNumber: i + 1, id: p.id }));
}
export function buildDocumentPayload({ capturedDocuments, capturedDocument, documentType } = {}) {
  const pages = normalizeDocumentPages({ capturedDocuments, capturedDocument, documentType });
  const type = normalizeDocumentType(documentType || capturedDocument?.documentType || pages[0]?.documentType);
  return { id: capturedDocument?.documentId || capturedDocument?.id || createDocumentId("document"), documentType: type, documentTypeLabel: getDocumentTypeLabel(type), pageCount: pages.length, pages, capturedAt: new Date().toISOString(), source: "AyushCareMobile" };
}
export function validateDocumentForAnalysis(payload) {
  const pages = normalizeDocumentPages({ capturedDocuments: payload?.pages, capturedDocument: payload?.document, documentType: payload?.documentType });
  return pages.length ? { valid: true, reason: "", pages } : { valid: false, reason: "No document pages were provided.", pages: [] };
}

async function uploadBlob(sessionId, page, documentType) {
  const blob = page.file instanceof Blob
    ? page.file
    : await (async () => {
        const url = page.dataUrl || page.previewUrl || page.imageUrl;
        if (!url) throw new Error("Document image is unavailable.");
        const response = await fetch(url);
        return response.blob();
      })();

  if (!["image/jpeg", "image/png", "image/jpg", "image/webp"].includes(blob.type || page.mimeType)) {
    throw new Error("The kiosk upload flow accepts JPEG, PNG, or WebP images.");
  }

  const fileName = page.fileName || `document-${page.pageNumber}.jpg`;
  const type = blob.type || page.mimeType || "image/jpeg";

  const uploadInfo = unwrapApiResponse(await apiRequest(`/mobile/kiosk-session/${encodeURIComponent(sessionId)}/upload-url`, {
    method: "POST",
    body: JSON.stringify({ file_name: fileName, content_type: type }),
  }));

  let putResponse = null;
  let lastUploadError = null;
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      putResponse = await fetch(uploadInfo.upload_url, {
        method: "PUT",
        headers: { "Content-Type": type },
        body: blob,
      });
      if (putResponse.ok) break;
      lastUploadError = new Error(`Cloud upload failed (${putResponse.status}).`);
    } catch (error) {
      lastUploadError = error;
    }
    if (attempt < 2) await new Promise((resolve) => setTimeout(resolve, 700));
  }
  if (!putResponse?.ok) {
    throw lastUploadError || new Error("Cloud upload failed.");
  }

  const registered = unwrapApiResponse(await apiRequest(`/mobile/kiosk-session/${encodeURIComponent(sessionId)}/register-document`, {
    method: "POST",
    body: JSON.stringify({ file_key: uploadInfo.file_key, document_type: documentType }),
  }));

  return { ...registered, fileName, documentType };
}

export async function uploadDocumentsToKiosk(sessionId, pages, documentType, onProgress) {
  if (!sessionId) throw new Error("Kiosk session is required for document upload.");
  const results = [];
  for (let i = 0; i < pages.length; i += 1) {
    if (onProgress) onProgress(Math.round((i / pages.length) * 50), `Uploading page ${i + 1} of ${pages.length}...`);
    results.push(await uploadBlob(sessionId, pages[i], normalizeDocumentType(documentType)));
  }
  return results;
}

export async function getKioskDocuments(sessionId) {
  return unwrapApiResponse(await apiRequest(`/mobile/kiosk-session/${encodeURIComponent(sessionId)}/documents`));
}

export async function waitForDocumentProcessing(sessionId, documentIds = [], onProgress, timeoutMs = 120000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const docs = await getKioskDocuments(sessionId);
    const relevant = docs.filter((d) => !documentIds.length || documentIds.includes(d.id));
    const done = relevant.length > 0 && relevant.every((d) => ["completed", "failed", "deleted"].includes(String(d.status).toLowerCase()));
    const pct = relevant.length ? 50 + Math.round((relevant.filter((d) => d.status === "completed").length / relevant.length) * 50) : 50;
    if (onProgress) onProgress(pct, done ? "Document processing complete." : "Waiting for OCR and medical extraction...");
    if (done) return relevant;
    await new Promise((r) => setTimeout(r, 2000));
  }
  throw new Error("Document processing timed out. Please check the kiosk session and try again.");
}

export async function analyzeDocumentOCR(input, onProgress) {
  const sessionId = input?.kioskSessionId;
  const pages = normalizeDocumentPages({ capturedDocuments: input?.pages, capturedDocument: input?.document, documentType: input?.documentType });
  if (!sessionId) throw new Error("Connect to a kiosk before analyzing a document.");
  if (!pages.length) throw new Error("Please capture at least one document page.");
  const registered = await uploadDocumentsToKiosk(sessionId, pages, input.documentType, onProgress);
  const ids = registered.map((d) => d.id).filter(Boolean);
  const docs = await waitForDocumentProcessing(sessionId, ids, onProgress);
  const completed = docs.filter((d) => d.status === "completed");
  const extracted = completed.reduce((acc, d) => {
    const data = d.extracted_data || d.extractedData || {};
    return {
      ...acc,
      ...data,
      documents: [...(acc.documents || []), d],
    };
  }, {});
  return { success: completed.length > 0, extractedData: extracted, documents: docs, registered };
}

export async function fetchMedicalRecords() {
  return [];
}
export async function getDocumentDetails() { return null; }
export async function updateRecordExtraction(documentId, extraction) { return { success: true, documentId, extraction }; }
export default {
  DOCUMENT_TYPES, normalizeDocumentType, getDocumentTypeLabel, createDocumentId, createDocumentPage,
  normalizeDocumentPages, buildDocumentPayload, validateDocumentForAnalysis, uploadDocumentsToKiosk,
  getKioskDocuments, waitForDocumentProcessing, analyzeDocumentOCR, fetchMedicalRecords, getDocumentDetails, updateRecordExtraction,
};
