/**
 * Summary Service
 * Handles medical chronological timeline, patient health summary, and doctor handoff.
 *
 * NOTE: Currently runs in prototype simulation mode using local promises and mock data.
 */

import { mockTimeline, mockHealthSummary } from "../data/mockData";

/**
 * Fetches the synthesized medical timeline combining EHR, Kiosk intake, and newly uploaded documents.
 *
 * Future API: GET /api/v1/mobile/timeline?sessionId=...
 * Response: Array<TimelineItem>
 */
export async function fetchMedicalTimeline(sessionId) {
  // TODO: Replace with GET /api/v1/mobile/timeline
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        timeline: mockTimeline,
      });
    }, 200);
  });
}

/**
 * Fetches the patient-friendly plain-language health summary.
 *
 * Future API: GET /api/v1/mobile/summary?sessionId=...
 * Response: HealthSummaryObject
 */
export async function fetchHealthSummary(sessionId) {
  // TODO: Replace with GET /api/v1/mobile/summary
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        summary: mockHealthSummary,
      });
    }, 200);
  });
}

/**
 * Dispatches the validated patient summary and uploaded documents to the assigned OPD doctor.
 *
 * Future API: POST /api/v1/mobile/send-to-doctor
 * Request: {
 *   sessionId: string,
 *   patientId: string,
 *   confirmedExtractedItems: object,
 *   timeline: array,
 *   doctorDeskId?: string
 * }
 * Response: { sent: boolean, doctorHandoffId: string, kioskNotified: boolean }
 */
export async function sendSummaryToDoctor(sessionId, payload) {
  // TODO: Replace with POST /api/v1/mobile/send-to-doctor
  // In production, also emit socket event to the kiosk terminal:
  // socket.emit('mobile:doc_uploaded_and_sent', { sessionId, ... });

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        sentAt: new Date().toISOString(),
        handoffToken: `HNDF-${Math.floor(100000 + Math.random() * 900000)}`,
        kioskSynced: true,
      });
    }, 500);
  });
}
