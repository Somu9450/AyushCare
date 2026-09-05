/**
 * Appointment Service
 * Provides upcoming, past, and today's appointment data integrated with hospital OPD queue.
 *
 * NOTE: Currently operates in prototype simulation mode with mock promises.
 */

import { mockAppointments } from "../data/mockData";

/**
 * Fetches today's active checked-in appointment and live queue tracking.
 * Future API: GET /api/v1/mobile/appointments/today?patientId=...
 */
export async function fetchTodayAppointment(patientId) {
  // TODO: Replace with GET /api/v1/mobile/appointments/today
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        appointment: mockAppointments.today,
      });
    }, 150);
  });
}

/**
 * Fetches upcoming scheduled hospital appointments.
 * Future API: GET /api/v1/mobile/appointments/upcoming
 */
export async function fetchUpcomingAppointments() {
  // TODO: Replace with GET /api/v1/mobile/appointments/upcoming
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        appointments: mockAppointments.upcoming,
      });
    }, 150);
  });
}

/**
 * Fetches historical OPD consultations, diagnoses, and issued prescriptions.
 * Future API: GET /api/v1/mobile/appointments/past
 */
export async function fetchPastAppointments() {
  // TODO: Replace with GET /api/v1/mobile/appointments/past
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        appointments: mockAppointments.past,
      });
    }, 150);
  });
}

/**
 * Fetches detailed info for a single appointment.
 * Future API: GET /api/v1/mobile/appointments/:id
 */
export async function fetchAppointmentDetails(appointmentId) {
  // TODO: Replace with GET /api/v1/mobile/appointments/:id
  return new Promise((resolve) => {
    setTimeout(() => {
      const all = [
        mockAppointments.today,
        ...mockAppointments.upcoming,
        ...mockAppointments.past,
      ];
      const match = all.find((a) => a.id === appointmentId) || mockAppointments.today;
      resolve({
        success: true,
        appointment: match,
      });
    }, 100);
  });
}
