import { ApiResponse } from '../utilities/ApiResponse.js';
import { asyncHandler } from '../utilities/asyncHandler.js';
import { ApiError } from '../utilities/ApiError.js';
import pool from '../database/dbConnection.js';
import jwt from 'jsonwebtoken';

// Import S3 SDK Client modules
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Import SMS and OTP helpers
import { sendSMS } from '../utilities/smsHelper.js';
import { saveOTP, verifyOTP } from '../utilities/otpStore.js';

// Initialize S3 Client
const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: 'None'
};

// ==========================================
// --- FLOW A: Zero-Login QR Upload ---
// ==========================================

export const pairKioskSession = asyncHandler(async (req, res) => {
    const session = await pool.query('SELECT * FROM kiosk_sessions WHERE pairing_token = $1 AND is_active = TRUE', [req.params.pairing_token]);
    if (session.rowCount === 0) throw new ApiError(410, "Pairing token expired or invalid");
    return res.status(200).json(new ApiResponse(200, session.rows[0], "Mobile successfully paired to Kiosk"));
});

/**
 * Generates a real S3 Presigned PUT URL.
 * Shared by both Flow A (Kiosk Session Uploads) and Flow B (Portal Vault uploads) .
 */
export const getUploadUrl = asyncHandler(async (req, res) => {
    const { file_name, content_type } = req.body;

    if (!file_name || !content_type) {
        throw new ApiError(400, "file_name and content_type are required fields");
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(content_type)) {
        throw new ApiError(415, "Unsupported image type. Only JPEG, JPG, and PNG are allowed.");
    }

    // Determine path based on user context (Patient Portal Vault vs Kiosk Intake)
    const folder = req.user ? `vault/${req.user.id}` : 'uploads';
    const fileKey = `${folder}/${Date.now()}-${file_name}`;

    try {
        const command = new PutObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: fileKey,
            ContentType: content_type
        });

        const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });

        return res.status(200).json(
            new ApiResponse(
                200,
                { upload_url: presignedUrl, file_key: fileKey },
                "Presigned upload URL generated successfully"
            )
        );
    } catch (error) {
        throw new ApiError(500, "Failed to generate upload URL", [error.message]);
    }
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
    await pool.query('UPDATE kiosk_sessions SET is_active = FALSE WHERE id = $1', [req.params.session_id]);
    return res.status(200).json(new ApiResponse(200, {}, "Mobile sync completed. Connection purged."));
});

// ==========================================
// --- FLOW B: SMS Portal & Authentication ---
// ==========================================

export const sendPortalOtp = asyncHandler(async (req, res) => {
    const { mobileNumber } = req.body;

    if (!mobileNumber) {
        throw new ApiError(400, "Mobile number is required");
    }

    const formattedNumber = mobileNumber.startsWith('+') ? mobileNumber : `+91${mobileNumber}`;
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

    saveOTP(formattedNumber, generatedOtp, 300); // 5 mins expiry

    const message = `Your AyushCare Patient Portal verification OTP is: ${generatedOtp}. Valid for 5 minutes.`;
    await sendSMS(formattedNumber, message);

    return res.status(200).json(
        new ApiResponse(200, { mobile: formattedNumber }, "Verification OTP sent successfully")
    );
});

export const verifyPortalOtp = asyncHandler(async (req, res) => {
    const { mobileNumber, otp } = req.body;

    if (!mobileNumber || !otp) {
        throw new ApiError(400, "Mobile number and OTP are required");
    }

    const formattedNumber = mobileNumber.startsWith('+') ? mobileNumber : `+91${mobileNumber}`;

    const isValid = verifyOTP(formattedNumber, otp);
    if (!isValid) {
        throw new ApiError(401, "Invalid or expired verification OTP");
    }

    let patientQuery = await pool.query('SELECT * FROM patients WHERE mobile_number = $1', [mobileNumber]);
    let patient = patientQuery.rows[0];

    if (!patient) {
        const insertQuery = await pool.query(
            `INSERT INTO patients (full_name, gender, date_of_birth, mobile_number, consent_granted)
             VALUES ($1, 'U', '1990-01-01', $2, TRUE) RETURNING *`,
            ["Somu Sharma", mobileNumber]
        );
        patient = insertQuery.rows[0];
    }

    const token = jwt.sign(
        { id: patient.id, email: patient.mobile_number, role: "patient" },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '1d' }
    );

    return res
        .status(200)
        .cookie("accessToken", token, cookieOptions)
        .json(new ApiResponse(200, { patient, accessToken: token }, "Home Portal access granted"));
});

export const getPortalDashboard = asyncHandler(async (req, res) => {
    const patientId = req.user.id;

    const appointmentQuery = await pool.query(
        `SELECT c.token_number, c.status, h.name as hospital_name 
         FROM consultations c
         JOIN hospitals h ON c.hospital_id = h.id
         WHERE c.patient_id = $1 AND c.status != 'complete'
         ORDER BY c.created_at DESC LIMIT 1`,
        [patientId]
    );

    const appointment = appointmentQuery.rows[0] || {
        token_number: "None",
        status: "No active appointment",
        hospital_name: "AyushCare Center"
    };

    const dashboardData = {
        patient_name: req.user.full_name,
        appointment: {
            token: appointment.token_number,
            status: appointment.status,
            hospital: appointment.hospital_name,
            department: "Ayush General OPD"
        },
        ai_summary: "Patient has structured history logs matching standard allergy classifications. Vitals are currently recorded as stable. Next visit schedule queued."
    };

    return res.status(200).json(new ApiResponse(200, dashboardData, "Dashboard data loaded"));
});

export const getAudioSummary = asyncHandler(async (req, res) => {
    const audioPayload = { audio_url: "https://ayushcare-tts.s3.ap-south-1.amazonaws.com/samples/summary_eng.mp3" };
    return res.status(200).json(new ApiResponse(200, audioPayload, "Text-to-speech audio url generated"));
});

export const getPortalDocuments = asyncHandler(async (req, res) => {
    const documents = await pool.query(
        `SELECT d.* FROM uploaded_documents d
         JOIN consultations c ON d.consultation_id = c.id
         WHERE c.patient_id = $1
         ORDER BY d.created_at DESC`,
        [req.user.id]
    );
    return res.status(200).json(new ApiResponse(200, documents.rows, "Patient Document Vault loaded"));
});

export const getPortalPrivacy = asyncHandler(async (req, res) => {
    let privacyQuery = await pool.query('SELECT * FROM privacy_settings WHERE patient_id = $1', [req.user.id]);

    if (privacyQuery.rowCount === 0) {
        const seedQuery = await pool.query(
            'INSERT INTO privacy_settings (patient_id, isolate_past_history, consent_voice_processing) VALUES ($1, FALSE, TRUE) RETURNING *',
            [req.user.id]
        );
        privacyQuery = seedQuery;
    }

    return res.status(200).json(new ApiResponse(200, privacyQuery.rows[0], "Patient privacy records loaded"));
});

export const updatePortalPrivacy = asyncHandler(async (req, res) => {
    const { isolate_past_history, consent_voice_processing } = req.body;

    const privacyQuery = await pool.query(
        `INSERT INTO privacy_settings (patient_id, isolate_past_history, consent_voice_processing)
         VALUES ($1, $2, $3)
         ON CONFLICT (patient_id) 
         DO UPDATE SET isolate_past_history = $2, consent_voice_processing = $3, updated_at = NOW()
         RETURNING *`,
        [req.user.id, isolate_past_history, consent_voice_processing]
    );

    return res.status(200).json(new ApiResponse(200, privacyQuery.rows[0], "Preferences saved successfully"));
});