/**
 * Visit Service
 * Handles historical patient encounter data (Allopathy and AYUSH visits).
 *
 * Distinct from Appointment Service:
 * - Appointments = Planned / scheduled doctor consultations
 * - Visits = Actual completed healthcare encounters with full clinical notes, vitals, and recorded medicines
 */

import { mockVisits } from "../data/mockData";

/**
 * Fetches healthcare visit history with optional filtering.
 * Filter options: 'ALL' | 'ALLOPATHY' | 'AYUSH'
 *
 * Future API: GET /api/v1/mobile/visits?filter=...
 */
export async function fetchVisits(filter = "ALL") {
  // TODO: Replace with GET /api/v1/mobile/visits
  return new Promise((resolve) => {
    setTimeout(() => {
      let filtered = [...mockVisits];
      if (filter === "ALLOPATHY") {
        filtered = filtered.filter((v) => v.type === "ALLOPATHY");
      } else if (filter === "AYUSH") {
        filtered = filtered.filter((v) => v.type === "AYUSH");
      }
      resolve({
        success: true,
        visits: filtered,
      });
    }, 120);
  });
}

/**
 * Fetches detailed encounter record for a specific visit.
 *
 * Future API: GET /api/v1/mobile/visits/:visitId
 */
export async function fetchVisitById(visitId) {
  // TODO: Replace with GET /api/v1/mobile/visits/:visitId
  return new Promise((resolve) => {
    setTimeout(() => {
      const visit = mockVisits.find((v) => v.id === visitId) || null;
      resolve({
        success: !!visit,
        visit,
      });
    }, 100);
  });
}

/**
 * Fetches the most recent completed healthcare visit (for Home screen display).
 *
 * Future API: GET /api/v1/mobile/visits/recent
 */
export async function fetchRecentVisit() {
  // TODO: Replace with GET /api/v1/mobile/visits/recent
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        visit: mockVisits[0] || null,
      });
    }, 80);
  });
}
