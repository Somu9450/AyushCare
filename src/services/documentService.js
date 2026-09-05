/**
 * Document Service
 * Handles uploading scanned images, running OCR analysis, and entity extraction.
 *
 * NOTE: Currently runs in prototype simulation mode using local promises and mock data.
 */

import {
  mockExtractedData,
  mockDefaultDocument,
  mockMedicalRecords,
} from "../data/mockData";

/**
 * Uploads a captured or selected document image to the healthcare backend.
 *
 * Future API: POST /api/v1/mobile/documents/upload
 * Content-Type: multipart/form-data
 * Request: FormData { file: Blob/File, documentType: string, sessionId: string }
 * Response: { documentId: string, url: string, status: 'UPLOADED' }
 */
export async function uploadDocument(fileOrBlob, documentType, sessionId) {
  // TODO: Replace mock response with actual backend API call.
  // const formData = new FormData();
  // formData.append('file', fileOrBlob);
  // formData.append('documentType', documentType);
  // formData.append('sessionId', sessionId);
  // const response = await axios.post('/api/v1/mobile/documents/upload', formData);
  // return response.data;

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        document: {
          ...mockDefaultDocument,
          id: `doc_${Date.now()}`,
          documentType,
          fileName: fileOrBlob?.name || "Prescription_May2026.pdf",
          fileSize: fileOrBlob?.size ? `${(fileOrBlob.size / 1024).toFixed(1)} KB` : "1.4 MB",
          uploadedAt: new Date().toISOString(),
        },
      });
    }, 400);
  });
}

/**
 * Triggers backend AI and OCR document extraction pipeline.
 *
 * Future API: POST /api/v1/mobile/documents/analyse
 * Request: { documentId: string, modelVersion?: string }
 * Response: {
 *   documentId: string,
 *   medicines: Array<MedicineEntity>,
 *   diagnosis: DiagnosisEntity,
 *   confidenceScores: Record<string, number>,
 *   verificationRequired: Array<string>
 * }
 */
export async function analyzeDocumentOCR(documentId, progressCallback) {
  // TODO: Replace simulated processing with backend OCR/document-processing API.
  // In production, subscribe to Server-Sent Events (SSE) or polling endpoint:
  // GET /api/v1/mobile/documents/:id/status
  
  const stages = [
    { step: 0, label: "Image Captured", delay: 400 },
    { step: 1, label: "Image Enhanced", delay: 700 },
    { step: 2, label: "Reading Text", delay: 1000 },
    { step: 3, label: "Understanding Medical Information", delay: 1200 },
    { step: 4, label: "Extracting Important Details", delay: 800 },
  ];

  for (const stage of stages) {
    if (progressCallback) {
      progressCallback(stage.step);
    }
    await new Promise((r) => setTimeout(r, stage.delay));
  }

  return {
    success: true,
    documentId,
    extractedData: mockExtractedData,
  };
}

/**
 * Retrieves all medical records with optional category filtering.
 * Categories: 'ALL' | 'prescription' | 'lab_report' | 'discharge_summary' | 'other'
 *
 * Future API: GET /api/v1/mobile/documents?category=...
 */
export async function fetchMedicalRecords(category = "ALL") {
  // TODO: Replace mock document retrieval with backend API.
  // TODO: Replace local/mock document storage with secure backend storage.
  return new Promise((resolve) => {
    setTimeout(() => {
      let filtered = [...mockMedicalRecords];
      if (category !== "ALL") {
        filtered = filtered.filter((r) => r.type === category);
      }
      resolve({
        success: true,
        records: filtered,
      });
    }, 120);
  });
}

/**
 * Retrieves an existing uploaded document with its OCR entities.
 *
 * Future API: GET /api/v1/mobile/documents/:id
 */
export async function getDocumentDetails(documentId) {
  // TODO: Replace with GET /api/v1/mobile/documents/:id
  // TODO: Replace mock OCR result with backend extraction service.
  // TODO: Replace local/mock document storage with secure backend storage.
  return new Promise((resolve) => {
    setTimeout(() => {
      const record = mockMedicalRecords.find((r) => r.id === documentId);
      if (record) {
        resolve({
          success: true,
          document: record,
          extractedData: record.extractedInformation,
        });
      } else {
        resolve({
          success: true,
          document: mockDefaultDocument,
          extractedData: mockExtractedData,
        });
      }
    }, 150);
  });
}

/**
 * Updates corrected entity data for a specific document.
 *
 * Future API: PATCH /api/v1/mobile/documents/:id
 */
export async function updateRecordExtraction(documentId, updatedEntity) {
  // TODO: Persist corrected extraction through document API.
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        documentId,
        updatedEntity,
      });
    }, 100);
  });
}
