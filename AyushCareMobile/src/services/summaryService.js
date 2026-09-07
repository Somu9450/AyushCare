
import { apiRequest, unwrapApiResponse } from "./apiClient";

export async function fetchHealthSummary(state = {}) {
  const sessionId = state.kioskSession?.consultationId || state.session?.sessionId || state.kioskSession?.id;
  if (!sessionId) return { success: true, summary: { status: "EMPTY", title: "Health summary" } };
  try {
    const data = unwrapApiResponse(await apiRequest(`/intake/session/${encodeURIComponent(sessionId)}/summary`));
    return { success: true, summary: data?.ai_summary || data?.stored_summary || data || {} };
  } catch (error) {
    if (error.status === 404) return { success: true, summary: { status: "EMPTY", title: "Health summary" } };
    throw error;
  }
}
export async function fetchMedicalTimeline() { return { success: true, timeline: [], restricted: false }; }
export function buildDoctorHandoffPayload(state = {}) {
  return {
    patient: state.patient || null,
    kioskSession: state.kioskSession || null,
    summary: state.healthSummary || null,
    extracted: state.extractedData || {},
    timeline: state.timeline || [],
    records: state.medicalRecords || [],
    privacy: { historySharing: !state.isHealthHistoryLocked, restricted: !!state.isHealthHistoryLocked },
  };
}
export async function sendSummaryToDoctor(sessionId, payload = {}) {
  if (!sessionId) throw new Error("A valid kiosk session is required.");
  return { success: true, status: "LOCAL_HANDOFF_READY", sessionId, payload };
}
export async function sendCurrentStateToDoctor(state = {}) {
  return sendSummaryToDoctor(state.kioskSession?.id || state.session?.sessionId, buildDoctorHandoffPayload(state));
}
export default { fetchHealthSummary, fetchMedicalTimeline, buildDoctorHandoffPayload, sendSummaryToDoctor, sendCurrentStateToDoctor };
