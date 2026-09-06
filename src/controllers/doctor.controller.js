import { ApiResponse } from '../utilities/ApiResponse.js';
import { asyncHandler } from '../utilities/asyncHandler.js';
import { ApiError } from '../utilities/ApiError.js';
import pool from '../database/dbConnection.js';

export const getDoctorQueue = asyncHandler(async (req, res) => {
    const queue = await pool.query(
        `SELECT c.id, c.token_number, c.status, c.risk_level, p.full_name 
         FROM consultations c 
         JOIN patients p ON c.patient_id = p.id 
         WHERE c.assigned_doctor_id = $1 AND c.status != 'complete'
         ORDER BY c.risk_level DESC, c.created_at ASC`,
        [req.user.id]
    );
    return res.status(200).json(new ApiResponse(200, queue.rows, "Queue active list retrieved"));
});

export const getPatientSummary = asyncHandler(async (req, res) => {
    const summary = await pool.query(
        'SELECT * FROM clinical_summaries WHERE consultation_id = $1',
        [req.params.id]
    );
    return res.status(200).json(new ApiResponse(200, summary.rows[0] || {}, "AI clinical history loaded"));
});

export const getPatientReports = asyncHandler(async (req, res) => {
    const reports = await pool.query(
        'SELECT * FROM uploaded_documents WHERE consultation_id = $1 ORDER BY created_at DESC',
        [req.params.id]
    );
    return res.status(200).json(new ApiResponse(200, reports.rows, "Chronological medical files loaded"));
});

export const updateConsultationStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    await pool.query('UPDATE consultations SET status = $1 WHERE id = $2', [status, req.params.id]);
    return res.status(200).json(new ApiResponse(200, {}, `Token updated to state: ${status}`));
});

export const signOffConsultation = asyncHandler(async (req, res) => {
    const { remarks } = req.body;
    await pool.query(
        'UPDATE consultations SET status = \'complete\', remarks = $1 WHERE id = $2',
        [remarks, req.params.id]
    );
    return res.status(200).json(new ApiResponse(200, {}, "Consultation completed and saved"));
});