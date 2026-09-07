import { apiRequest, unwrapApiResponse } from "./apiClient";

export const DOCUMENT_TYPES = {
  PRESCRIPTION: "prescription",
  LAB_REPORT: "lab_report",
  DISCHARGE_SUMMARY: "discharge_summary",
  OTHER: "other",
};

const aliases = {
  prescription: "prescription", rx: "prescription",
  lab: "lab_report", labs: "lab_report", laboratory: "lab_report",
  lab_report: "lab_report", "lab-report": "lab_report",
  discharge: "discharge_summary", discharge_summary: "discharge_summary",
  "discharge-summary": "discharge_summary", other: "other", other_document: "other",
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
    previewUrl: preview, imageUrl: preview, dataUrl: source.dataUrl || preview,
    preview, image: source.image || preview,
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

const ALLOWED = new Set(["image/jpeg", "image/png", "image/jpg", "image/webp"]);
const MAX_BYTES = 15 * 1024 * 1024;

async function toBlob(page) {
  if (page?.file instanceof Blob) return page.file;
  const url = page?.dataUrl || page?.previewUrl || page?.imageUrl;
  if (!url) throw new Error("Document image is unavailable.");
  const response = await fetch(url);
  if (!response.ok) throw new Error("Could not prepare the document image.");
  return response.blob();
}

async function uploadBlob(consultationId, page, documentType) {
  const blob = await toBlob(page);
  const type = String(blob.type || page.mimeType || "image/jpeg").split(";")[0].toLowerCase();
  if (!ALLOWED.has(type)) throw new Error("Only JPEG, PNG, and WebP images can be analyzed.");
  if (blob.size > MAX_BYTES) throw new Error("Each image must be 15 MB or smaller.");

  const fileName = page.fileName || `document-${page.pageNumber || 1}.jpg`;
  const uploadInfo = unwrapApiResponse(await apiRequest("/mobile/portal/documents/upload-url", {
    method: "POST",
    body: JSON.stringify({ file_name: fileName, content_type: type, consultation_id: consultationId || undefined, document_processing_consent: true }),
  }));

  let response;
  let lastError;
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      response = await fetch(uploadInfo.upload_url, { method: "PUT", headers: { "Content-Type": type }, body: blob });
      if (response.ok) break;
      lastError = new Error(`Cloud upload failed (${response.status}).`);
    } catch (error) { lastError = error; }
    if (attempt < 2) await new Promise((resolve) => setTimeout(resolve, 600));
  }
  if (!response?.ok) throw lastError || new Error("Cloud upload failed.");

  const registered = unwrapApiResponse(await apiRequest("/mobile/portal/documents/register", {
    method: "POST",
    body: JSON.stringify({ file_key: uploadInfo.file_key, document_type: normalizeDocumentType(documentType), consultation_id: consultationId || undefined }),
  }));
  return { ...registered, fileName, documentType: normalizeDocumentType(documentType) };
}

export async function uploadDocumentsToPortal(consultationId, pages, documentType, onProgress) {
  if (!pages?.length) throw new Error("Please capture at least one document page.");
  const results = [];
  for (let i = 0; i < pages.length; i += 1) {
    onProgress?.(Math.round((i / pages.length) * 45), `Uploading image ${i + 1} of ${pages.length}…`);
    results.push(await uploadBlob(consultationId, pages[i], documentType));
  }
  return results;
}

export async function getPortalDocument(documentId) {
  return unwrapApiResponse(await apiRequest(`/mobile/portal/documents/${encodeURIComponent(documentId)}`));
}

export async function getPortalDocuments() {
  return unwrapApiResponse(await apiRequest("/mobile/portal/documents"));
}

export async function waitForPortalDocumentProcessing(documentIds, onProgress, timeoutMs = 120000) {
  const ids = new Set((documentIds || []).filter(Boolean));
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const docs = [];
    for (const id of ids) {
      try { docs.push(await getPortalDocument(id)); } catch (error) { if (error.status !== 404) throw error; }
    }
    const finished = docs.length === ids.size && docs.every((d) => ["completed", "failed", "deleted"].includes(String(d.status || "").toLowerCase()));
    const completedCount = docs.filter((d) => String(d.status).toLowerCase() === "completed").length;
    onProgress?.(45 + Math.round((completedCount / Math.max(1, ids.size)) * 55), finished ? "Document analysis complete." : "Reading your document…");
    if (finished) return docs;
    await new Promise((resolve) => setTimeout(resolve, 1800));
  }
  throw new Error("Document analysis is taking longer than expected. Please open Records to check the result.");
}

export async function analyzeDocumentOCR(input, onProgress) {
  const consultationId = input?.consultationId || null;
  const pages = normalizeDocumentPages({ capturedDocuments: input?.pages, capturedDocument: input?.document, documentType: input?.documentType });
  if (!pages.length) throw new Error("Please capture at least one document page.");
  const registered = await uploadDocumentsToPortal(consultationId, pages, input.documentType, onProgress);
  const ids = registered.map((d) => d.id).filter(Boolean);
  const docs = await waitForPortalDocumentProcessing(ids, onProgress);
  const completed = docs.filter((d) => String(d.status).toLowerCase() === "completed");
  const failed = docs.filter((d) => String(d.status).toLowerCase() === "failed");
  const extracted = completed.reduce((acc, d) => ({ ...acc, ...(d.extracted_data || {}), documents: [...(acc.documents || []), d] }), {});
  return { success: completed.length > 0 && failed.length === 0, extractedData: extracted, documents: docs, registered };
}

export async function fetchMedicalRecords() { return getPortalDocuments(); }
export async function getDocumentDetails(id) { return getPortalDocument(id); }
export async function updateRecordExtraction(documentId, extraction) { return { success: true, documentId, extraction }; }
export default { DOCUMENT_TYPES, normalizeDocumentType, getDocumentTypeLabel, createDocumentId, createDocumentPage, normalizeDocumentPages, buildDocumentPayload, validateDocumentForAnalysis, uploadDocumentsToPortal, getPortalDocument, getPortalDocuments, waitForPortalDocumentProcessing, analyzeDocumentOCR, fetchMedicalRecords, getDocumentDetails, updateRecordExtraction };
