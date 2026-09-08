import { getPortalVisits } from "./portalService.js";

export function normalizeVisit(visit = {}) {
  const createdDate = visit.created_at || visit.date || "";
  const isComplete = String(visit.status || "").toLowerCase() === "complete" || String(visit.status || "").toLowerCase() === "completed";
  return {
    ...visit,
    id: visit.id,
    visitId: visit.id,
    date: createdDate,
    visitDate: createdDate,
    appointmentDate: createdDate,
    doctor: visit.doctor_name || visit.doctor || "AyushCare Medical Officer",
    doctorName: visit.doctor_name || visit.doctor || "AyushCare Medical Officer",
    department: visit.department_name || visit.department || "General OPD",
    departmentName: visit.department_name || visit.department || "General OPD",
    facility: visit.hospital_name || visit.facility || "AyushCare Center",
    hospitalName: visit.hospital_name || visit.facility || "AyushCare Center",
    status: isComplete ? "Completed" : (visit.status || "Waiting Triage"),
    summary: visit.remarks || visit.chief_complaint || (visit.intake_pathway ? `Intake: ${visit.intake_pathway}` : "Clinical consultation"),
    chiefComplaint: visit.remarks || visit.chief_complaint || "",
    riskLevel: visit.risk_level || "routine",
    tokenNumber: visit.token_number || null,
  };
}

export async function fetchVisits() {
  try {
    const raw = await getPortalVisits();
    const list = Array.isArray(raw) ? raw : (raw?.visits || raw?.data || []);
    const visits = list.map(normalizeVisit);
    return { success: true, visits };
  } catch (error) {
    console.error("fetchVisits error:", error);
    return { success: false, visits: [], error: error.message };
  }
}

export async function fetchVisitDetails(visitId) {
  try {
    const res = await fetchVisits();
    const visit = res.visits.find((v) => v.id === visitId) || null;
    return { success: Boolean(visit), visit };
  } catch (error) {
    return { success: false, visit: null, error: error.message };
  }
}

export async function fetchPastVisits() {
  const res = await fetchVisits();
  const past = res.visits.filter((v) => ["completed", "complete", "cancelled"].includes(String(v.status).toLowerCase()));
  return { success: true, visits: past };
}

export async function fetchActiveVisit() {
  const res = await fetchVisits();
  const active = res.visits.find((v) => !["completed", "complete", "cancelled"].includes(String(v.status).toLowerCase())) || null;
  return { success: true, visit: active };
}

export async function getDocumentsForVisit(visitId) {
  return [];
}

export async function attachDocumentToVisit(visitId, documentId) {
  return { success: true, visitId, documentId };
}

export function buildVisitWithDocuments(visit, records = []) {
  return { ...visit, documents: records };
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
