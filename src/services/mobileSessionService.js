/**
 * Mobile Session Service
 * Handles temporary session verification, heartbeat, and synchronization with the hospital kiosk.
 *
 * NOTE: Currently runs in prototype simulation mode using local promises and mock data.
 */

import { mockSession } from "../data/mockData";

/**
 * Verifies a temporary mobile session token initiated from the hospital kiosk QR code.
 *
 * Future API: POST /api/v1/mobile/session/verify
 * Request: { sessionToken: string, deviceFingerprint?: string }
 * Response: { valid: boolean, session: SessionObject, patient: PatientProfile }
 */
export async function verifyMobileSession(sessionToken) {
  // TODO: Replace mock promise with actual backend API call.
  // const response = await axios.post('/api/v1/mobile/session/verify', { sessionToken });
  // return response.data;

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        session: { ...mockSession, sessionToken: sessionToken || "MKS-TOKEN-DEFAULT" },
      });
    }, 250);
  });
}

/**
 * Notifies and synchronizes real-time status with the hospital kiosk terminal.
 *
 * Future API: POST /api/v1/mobile/session/sync
 * Or WebSocket event: emit('kiosk:sync_status', { kioskId, status, payload })
 */
export async function syncWithHospitalKiosk(kioskId, payload) {
  // TODO: Connect to production WebSocket / hospital kiosk synchronization gateway.
  // socket.emit('kiosk:sync', { kioskId, ...payload });

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        synced: true,
        timestamp: new Date().toISOString(),
      });
    }, 200);
  });
}

/**
 * Concludes or resets the mobile companion session.
 *
 * Future API: POST /api/v1/mobile/session/end
 */
export async function endMobileSession(sessionId) {
  // TODO: Replace with production session invalidation endpoint.
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, message: "Session closed successfully" });
    }, 150);
  });
}
