/**
 * Appointment Service
 *
 * Appointment = planned/scheduled consultation.
 *
 * Visit = actual healthcare encounter.
 *
 * Current implementation:
 * - local mock data
 * - async service boundary
 *
 * Production:
 * - authenticated hospital API
 * - real-time queue events
 */

import { mockAppointments } from "../data/mockData.js";

const wait = (ms) =>
  new Promise((resolve) =>
    setTimeout(resolve, ms),
  );

const clone = (value) => {
  if (
    value === undefined ||
    value === null
  ) {
    return value;
  }

  try {
    return structuredClone(value);
  } catch {
    try {
      return JSON.parse(
        JSON.stringify(value),
      );
    } catch {
      return value;
    }
  }
};

const normalizeId = (
  value,
) =>
  String(value || "")
    .trim();

const getAllAppointments =
  () => {
    if (
      Array.isArray(
        mockAppointments,
      )
    ) {
      return mockAppointments.filter(
        Boolean,
      );
    }

    return [
      mockAppointments?.today,

      ...(Array.isArray(
        mockAppointments?.upcoming,
      )
        ? mockAppointments.upcoming
        : []),

      ...(Array.isArray(
        mockAppointments?.past,
      )
        ? mockAppointments.past
        : []),
    ].filter(Boolean);
  };

const filterByPatient = (
  appointments,
  patientId,
) => {
  if (!patientId) {
    return appointments;
  }

  const normalizedPatientId =
    normalizeId(
      patientId,
    );

  return appointments.filter(
    (appointment) => {
      const candidate =
        normalizeId(
          appointment?.patientId ||
            appointment?.patient?.id ||
            appointment?.patient?.patientId,
        );

      return (
        !candidate ||
        candidate ===
          normalizedPatientId
      );
    },
  );
};

const sortByDateTime = (
  appointments,
) =>
  [...appointments].sort(
    (a, b) => {
      const aTime =
        new Date(
          `${a?.date || ""} ${
            a?.time || ""
          }`,
        ).getTime();

      const bTime =
        new Date(
          `${b?.date || ""} ${
            b?.time || ""
          }`,
        ).getTime();

      if (
        Number.isNaN(aTime) ||
        Number.isNaN(bTime)
      ) {
        return 0;
      }

      return aTime - bTime;
    },
  );

/**
 * Fetch today's appointment.
 *
 * Production:
 * GET /api/v1/mobile/appointments/today
 */
export async function fetchTodayAppointment(
  patientId,
) {
  await wait(150);

  const appointment =
    mockAppointments?.today ||
    null;

  return {
    success: true,

    patientId:
      patientId || null,

    appointment:
      clone(appointment),
  };
}

/**
 * Fetch upcoming appointments.
 *
 * Production:
 * GET /api/v1/mobile/appointments/upcoming
 */
export async function fetchUpcomingAppointments(
  patientId,
) {
  await wait(150);

  let appointments =
    Array.isArray(
      mockAppointments?.upcoming,
    )
      ? mockAppointments.upcoming
      : [];

  appointments =
    filterByPatient(
      appointments,
      patientId,
    );

  appointments =
    sortByDateTime(
      appointments,
    );

  return {
    success: true,

    patientId:
      patientId || null,

    appointments:
      clone(appointments),
  };
}

/**
 * Fetch historical appointments.
 *
 * Production:
 * GET /api/v1/mobile/appointments/past
 */
export async function fetchPastAppointments(
  patientId,
) {
  await wait(150);

  let appointments =
    Array.isArray(
      mockAppointments?.past,
    )
      ? mockAppointments.past
      : [];

  appointments =
    filterByPatient(
      appointments,
      patientId,
    );

  appointments =
    sortByDateTime(
      appointments,
    ).reverse();

  return {
    success: true,

    patientId:
      patientId || null,

    appointments:
      clone(appointments),
  };
}

/**
 * Fetch one appointment by ID.
 *
 * Production:
 * GET /api/v1/mobile/appointments/:appointmentId
 */
export async function fetchAppointmentDetails(
  appointmentId,
) {
  await wait(100);

  const normalizedId =
    normalizeId(
      appointmentId,
    );

  if (!normalizedId) {
    return {
      success: false,

      appointment:
        null,

      error:
        "Appointment ID is required.",
    };
  }

  const appointment =
    getAllAppointments().find(
      (item) =>
        normalizeId(
          item?.id ||
            item?.appointmentId,
        ) ===
        normalizedId,
    ) || null;

  if (!appointment) {
    return {
      success: false,

      appointment:
        null,

      error:
        "Appointment not found.",
    };
  }

  return {
    success: true,

    appointment:
      clone(appointment),
  };
}

/**
 * Fetch every appointment.
 *
 * Useful for dashboard aggregation.
 */
export async function fetchAppointments(
  patientId,
) {
  await wait(150);

  const appointments =
    filterByPatient(
      getAllAppointments(),
      patientId,
    );

  return {
    success: true,

    patientId:
      patientId || null,

    appointments:
      clone(appointments),
  };
}

/**
 * Get the currently active queue appointment.
 */
export async function fetchActiveAppointment(
  patientId,
) {
  await wait(120);

  const appointments =
    filterByPatient(
      getAllAppointments(),
      patientId,
    );

  const appointment =
    appointments.find(
      (item) => {
        const status =
          String(
            item?.status || "",
          ).toUpperCase();

        return (
          status ===
            "IN_QUEUE" ||
          status ===
            "WAITING" ||
          status ===
            "CONFIRMED" ||
          status ===
            "ACTIVE"
        );
      },
    ) || null;

  return {
    success: true,

    patientId:
      patientId || null,

    appointment:
      clone(appointment),
  };
}

export default {
  fetchAppointments,

  fetchTodayAppointment,

  fetchUpcomingAppointments,

  fetchPastAppointments,

  fetchAppointmentDetails,

  fetchActiveAppointment,
};