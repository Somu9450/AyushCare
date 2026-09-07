
export function normalizeVisit(visit = {}) { return visit; }
export async function fetchVisits() { return { success: true, visits: [] }; }
export async function fetchVisitDetails() { return { success: false, visit: null, error: "Visit API is not exposed by the current backend." }; }
export async function fetchPastVisits() { return { success: true, visits: [] }; }
export async function fetchActiveVisit() { return { success: true, visit: null }; }
export async function getDocumentsForVisit() { return []; }
export async function attachDocumentToVisit(visitId, documentId) { return { success: true, visitId, documentId }; }
export function buildVisitWithDocuments(visit, records = []) { return { ...visit, documents: records }; }
export default { normalizeVisit, fetchVisits, fetchVisitDetails, fetchPastVisits, fetchActiveVisit, getDocumentsForVisit, attachDocumentToVisit, buildVisitWithDocuments };
