import { ApiResponse } from '../utilities/ApiResponse.js';
import { asyncHandler } from '../utilities/asyncHandler.js';
import { ApiError } from '../utilities/ApiError.js';
import pool from '../database/dbConnection.js';
import jwt from 'jsonwebtoken';

// --- Flow A Controller Skeletons ---
export const pairKioskSession = asyncHandler(async (req, res) => {
    const session = await pool.query('SELECT * FROM kiosk_sessions WHERE pairing_token = $1 AND is_active = TRUE', [req.params.pairing_token]);
    if (session.rowCount === 0) throw new ApiError(410, "Pairing token expired or invalid");
    return res.status(200).json(new ApiResponse(200, session.rows[0], "Mobile successfully paired to Kiosk"));
});

export const getUploadUrl = asyncHandler(async (req, res) => {
    // Generate S3 presigned URL placeholder
    const presigned = { url: "https://medikiosk-s3.amazonaws.com/uploads/temp_file.jpg?sig=xyz", file_key: "uploads/temp_file.jpg" };
    return res.status(200).json(new ApiResponse(200, presigned, "Presigned secure upload URL generated"));
});

export const registerDocument = asyncHandler(async (req, res) => {
    const { file_key, document_type } = req.body;
    const document = await pool.query(
        'INSERT INTO uploaded_documents (consultation_id, file_path_hash, document_type, status) VALUES ($1, $2, $3, \'pending\') RETURNING id',
        [req.params.session_id, file_key, document_type]
    );
    return res.status(202).json(new ApiResponse(202, document.rows[0], "Document registered for extraction"));
});

export const deleteDocument = asyncHandler(async (req, res) => {
    await pool.query('DELETE FROM uploaded_documents WHERE id = $1', [req.params.document_id]);
    return res.status(200).json(new ApiResponse(200, {}, "File preview deleted"));
});

export const syncKioskUpload = asyncHandler(async (req, res) => {
    // Terminates temporary mobile pairing and pushes state update triggers
    await pool.query('UPDATE kiosk_sessions SET is_active = FALSE WHERE id = $1', [req.params.session_id]);
    return res.status(200).json(new ApiResponse(200, {}, "Mobile sync completed. Connection purged."));
});

// --- Flow B Controller Skeletons ---
export const sendPortalOtp = asyncHandler(async (req, res) => {
    return res.status(200).json(new ApiResponse(200, { txn_id: "txn_portal_881" }, "Verification OTP sent successfully"));
});

export const verifyPortalOtp = asyncHandler(async (req, res) => {
    const { abhaId } = req.body;
    // Generate login credentials mock based on registered ABHA profile
    const token = jwt.sign({ id: "mock_patient_uuid", email: abhaId, role: "patient" }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' });
    return res.status(200).json(new ApiResponse(200, { accessToken: token }, "Home Portal access granted"));
});

export const getPortalDashboard = asyncHandler(async (req, res) => {
    const dashboardData = { patient_name: "Somu Sharma", appointment: "Allergy OPD", token: "A-104", summary: "Completed last consultation diagnostic summaries" };
    return res.status(200).json(new ApiResponse(200, dashboardData, "Dashboard loaded successfully"));
});

export const getAudioSummary = asyncHandler(async (req, res) => {
    return res.status(200).json(new ApiResponse(200, { audio_stream_url: "https://cdn.audio/tts_771.mp3" }, "TTS payload generated"));
});

export const getPortalDocuments = asyncHandler(async (req, res) => {
    return res.status(200).json(new ApiResponse(200, [], "Chronological past document vault loaded"));
});

export const getPortalPrivacy = asyncHandler(async (req, res) => {
    return res.status(200).json(new ApiResponse(200, { isolate_past_history: false }, "DPDP privacy metrics loaded"));
});

export const updatePortalPrivacy = asyncHandler(async (req, res) => {
    const { isolatePastHistory } = req.body;
    return res.status(200).json(new ApiResponse(200, { isolate_past_history: isolatePastHistory }, "Data Privacy parameters updated"));
});