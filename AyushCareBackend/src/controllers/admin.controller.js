import { ApiResponse } from '../utilities/ApiResponse.js';
import { asyncHandler } from '../utilities/asyncHandler.js';
import pool from '../database/dbConnection.js';

export const getDoctorsList = asyncHandler(async (req, res) => {
    const doctors = await pool.query(
        'SELECT id, name, email, specialization, is_active FROM users WHERE hospital_id = $1 AND role = \'doctor\'',
        [req.user.hospital_id]
    );
    return res.status(200).json(new ApiResponse(200, doctors.rows, "Doctors retrieved successfully"));
});

export const getVisitAnalytics = asyncHandler(async (req, res) => {
    const stats = { kiosk_visits: 142, token_conversions: 110, consultations_completed: 85 };
    return res.status(200).json(new ApiResponse(200, stats, "Analytics data retrieved"));
});

export const overrideQueue = asyncHandler(async (req, res) => {
    const { consultationId, newStatus } = req.body;
    await pool.query('UPDATE consultations SET status = $1 WHERE id = $2', [newStatus, consultationId]);
    return res.status(200).json(new ApiResponse(200, {}, "Queue order overridden successfully"));
});