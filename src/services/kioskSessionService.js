/**
 * Kiosk Session Service
 * Handles Kiosk ↔ Mobile companion QR session validation, connection, and disconnection.
 *
 * NOTE: Currently runs in prototype simulation mode using centralized mock data.
 * Real backend APIs should replace this service in production.
 */

import { mockSession } from "../data/mockData.js";

export const DEFAULT_DEMO_TOKEN = "MK-2026-0905-ABC123";

/**
 * Validates a scanned or demo kiosk session token.
 *
 * Security Rule: The QR code contains ONLY a short-lived session token/reference.
 * It NEVER encodes patient names, ABHA numbers, Aadhaar numbers, or medical records.
 *
 * @param {string} token - The raw session token or URL scanned from the kiosk screen.
 * @returns {Promise<{ valid: boolean, session?: object, patient?: object, errorType?: string, message?: string }>}
 */
export async function validateKioskSession(token) {
  // TODO: Replace mock kiosk session validation with backend API.
  // TODO: Replace mock QR session token with secure server-generated token.
  // TODO: In production, kiosk QR should reference a secure short-lived session.
  // TODO: Patient identity/session authorization must be validated server-side.
  // TODO: Never trust patient identity or medical data supplied directly by QR.

  return new Promise((resolve) => {
    setTimeout(() => {
      const cleanToken = (token || "").trim();

      // Simulated expired session test case
      if (cleanToken.toUpperCase().includes("EXPIRED")) {
        resolve({
          valid: false,
          errorType: "EXPIRED",
          message: "This kiosk session has expired.",
        });
        return;
      }

      // Simulated ended session test case
      if (cleanToken.toUpperCase().includes("ENDED")) {
        resolve({
          valid: false,
          errorType: "ENDED",
          message: "This kiosk session is no longer active.",
        });
        return;
      }

      // Simulated invalid session test case
      if (cleanToken.toUpperCase().includes("INVALID") || cleanToken.length < 5) {
        resolve({
          valid: false,
          errorType: "INVALID",
          message: "QR code not recognized",
        });
        return;
      }

      const now = new Date();
      const connectedTime = now.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }) + " · " + now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });

      // Valid session response
      resolve({
        valid: true,
        session: {
          id: "kiosk-session-001",
          sessionToken: cleanToken.includes("MK-") ? cleanToken : DEFAULT_DEMO_TOKEN,
          kioskName: "Hospital OPD Kiosk",
          terminalId: "KIOSK-DELHI-OPD-03",
          hospitalName: "MediKiosk Demo Hospital",
          department: "General OPD",
          location: "Civil Hospital Waiting Lobby, Ground Floor",
          status: "CONNECTED",
          startedAt: "05 Sep 2026 · 10:24 AM",
          connectedAt: connectedTime,
          expiresAt: "05 Sep 2026 · 11:24 AM",
          expiresInSeconds: 3600,
        },
        patient: {
          ...mockSession.patient,
        },
      });
    }, 450);
  });
}

/**
 * Disconnects the mobile companion from the kiosk session.
 *
 * @param {string} sessionId
 * @returns {Promise<{ success: boolean, message: string }>}
 */
export async function disconnectKioskSession(sessionId) {
  // TODO: Replace mock session termination with backend API.
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: "Session ended",
      });
    }, 200);
  });
}
