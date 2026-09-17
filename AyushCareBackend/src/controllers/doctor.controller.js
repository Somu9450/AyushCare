import { ApiResponse } from '../utilities/ApiResponse.js';
import { asyncHandler } from '../utilities/asyncHandler.js';
import { ApiError } from '../utilities/ApiError.js';
import pool from '../database/dbConnection.js';
import { canDoctorAccess } from '../services/privacyService.js';

export const getDoctorQueue = asyncHandler(async (req, res) => {
    const queue = await pool.query(
        `SELECT c.id, c.token_number, c.status, c.risk_level, p.full_name, p.abha_number, c.hospital_id, c.department_id
         FROM consultations c 
         JOIN patients p ON c.patient_id = p.id 
         WHERE c.assigned_doctor_id = $1 AND c.status != 'complete'
         ORDER BY c.risk_level DESC, c.created_at ASC`,
        [req.user.id]
    );
    return res.status(200).json(new ApiResponse(200, queue.rows, "Queue active list retrieved"));
});

export const getPatientSummary = asyncHandler(async (req, res) => {
    const consultation = await pool.query(`SELECT c.*, p.abha_number FROM consultations c JOIN patients p ON p.id=c.patient_id WHERE c.id=$1 LIMIT 1`, [req.params.id]);
    if (!consultation.rowCount) throw new ApiError(404, 'Consultation not found');
    if (String(consultation.rows[0].assigned_doctor_id) !== String(req.user.id)) throw new ApiError(403, 'This consultation is not assigned to you');
    const allowed = await canDoctorAccess({ patientId: consultation.rows[0].patient_id, hospitalId: consultation.rows[0].hospital_id, consultationId: consultation.rows[0].id, category: 'visits' });
    if (!allowed) return res.status(200).json(new ApiResponse(200, { consultation_id: consultation.rows[0].id, abha_number: consultation.rows[0].abha_number, restricted: true }, 'Patient has restricted this visit from doctor view'));
    const summary = await pool.query('SELECT * FROM clinical_summaries WHERE consultation_id = $1', [req.params.id]);
    const summaryData = summary.rows[0] || {};
    return res.status(200).json(new ApiResponse(200, {
        ...summaryData,
        intake_mode: consultation.rows[0].intake_mode || 'interview',
        patient_audio_url: consultation.rows[0].patient_audio_url || null,
        patient_transcript: consultation.rows[0].patient_transcript || null,
    }, "AI clinical history loaded"));
});

export const getPatientReports = asyncHandler(async (req, res) => {
    const consultation = await pool.query(`SELECT c.*, p.id AS patient_uuid, p.abha_number FROM consultations c JOIN patients p ON p.id=c.patient_id WHERE c.id=$1 LIMIT 1`, [req.params.id]);
    if (!consultation.rowCount) throw new ApiError(404, 'Consultation not found');
    if (String(consultation.rows[0].assigned_doctor_id) !== String(req.user.id)) throw new ApiError(403, 'This consultation is not assigned to you');
    const reports = await pool.query('SELECT * FROM uploaded_documents WHERE consultation_id = $1 ORDER BY created_at DESC', [req.params.id]);
    const visible = [];
    for (const report of reports.rows) {
        if (await canDoctorAccess({ patientId: consultation.rows[0].patient_uuid, hospitalId: consultation.rows[0].hospital_id, consultationId: consultation.rows[0].id, documentId: report.id, category: 'reports' })) visible.push(report);
    }
    return res.status(200).json(new ApiResponse(200, visible, "Chronological medical files loaded"));
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