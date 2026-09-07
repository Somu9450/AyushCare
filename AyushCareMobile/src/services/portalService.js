import { apiRequest, unwrapApiResponse } from "./apiClient";

export async function getPortalDashboard() {
  return unwrapApiResponse(await apiRequest("/mobile/portal/dashboard"));
}

export async function getPortalVisits() {
  return unwrapApiResponse(await apiRequest("/mobile/portal/visits"));
}

export async function getPortalDocuments() {
  return unwrapApiResponse(await apiRequest("/mobile/portal/documents"));
}

export async function getPortalPrivacySettings() {
  return unwrapApiResponse(await apiRequest("/mobile/portal/privacy-settings"));
}

export function normalizePortalDocument(doc) {
  const type = doc?.document_type || "other";
  const status = String(doc?.status || "pending").toUpperCase();
  return {
    ...doc,
    id: doc?.id,
    title: doc?.file_path_hash?.split("/").pop() || "Medical document",
    type,
    typeLabel: type === "lab_report" ? "Lab Report" : type === "discharge_summary" ? "Discharge Summary" : type === "prescription" ? "Prescription" : "Medical Record",
    status: status === "COMPLETED" ? "PROCESSED" : status,
    createdAt: doc?.created_at,
    uploadedAt: doc?.created_at,
    download_url: doc?.download_url || null,
    pages: doc?.download_url ? [{
      id: `${doc.id}-page-1`,
      fileName: doc?.file_path_hash?.split("/").pop() || "Medical document",
      previewUrl: doc.download_url,
      imageUrl: doc.download_url,
      dataUrl: doc.download_url,
      mimeType: doc?.source_mime_type || "image/jpeg",
    }] : [],
    extractedInformation: doc?.extracted_data || {},
  };
}
