
import { apiRequest, unwrapApiResponse } from "./apiClient";
export async function fetchAppointments() { return { success: true, appointments: [] }; }
export async function fetchTodayAppointment() { return { success: true, appointment: null }; }
export async function fetchUpcomingAppointments() { return { success: true, appointments: [] }; }
export async function fetchPastAppointments() { return { success: true, appointments: [] }; }
export async function fetchAppointmentDetails() { return { success: false, appointment: null, error: "Appointment API is not exposed by the current backend." }; }
export async function fetchActiveAppointment() { return { success: true, appointment: null }; }
export default { fetchAppointments, fetchTodayAppointment, fetchUpcomingAppointments, fetchPastAppointments, fetchAppointmentDetails, fetchActiveAppointment };
