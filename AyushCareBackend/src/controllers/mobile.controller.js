import { ApiResponse } from '../utilities/ApiResponse.js';
import { asyncHandler } from '../utilities/asyncHandler.js';
import { ApiError } from '../utilities/ApiError.js';
import pool from '../database/dbConnection.js';
import jwt from 'jsonwebtoken';

import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import { sendSMS } from '../utilities/smsHelper.js';
import { saveOTP, verifyOTP } from '../utilities/otpStore.js';

import AiServiceGateway from '../services/aiService.js';

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax'
};


const streamToBuffer = async (stream) => {
    const chunks = [];
    for await (const chunk of stream) {
        chunks.push(chunk);
    }
    return Buffer.concat(chunks);
};


const executeOcrStreamingPipeline = async (consultationId, documentId, fileKey, docType) => {
    try {
        const consultation = await pool.query(
            "SELECT ai_session_id FROM consultations WHERE id = $1",
            [consultationId]
        );
        if (!consultation.rowCount || !consultation.rows[0]?.ai_session_id) {
            throw new Error("Consultation AI session is unavailable for document processing");
        }

        await pool.query("UPDATE uploaded_documents SET status = 'processing', processing_error=NULL, updated_at=NOW() WHERE id = $1", [documentId]);

        const command = new GetObjectCommand({ Bucket: process.env.AWS_BUCKET_NAME, Key: fileKey });
        const s3Object = await s3Client.send(command);
        if (!s3Object.Body) throw new Error(`S3 object has no body for key ${fileKey}`);

        const buffer = await streamToBuffer(s3Object.Body);
        if (!buffer.length) throw new Error(`Uploaded image is empty for key ${fileKey}`);

        const extension = String(fileKey.split('.').pop() || '').toLowerCase();
        const extensionMime = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' };
        const mimeType = extensionMime[extension] || s3Object.ContentType || 'application/octet-stream';
        const supported = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/jpg']);
        if (!supported.has(mimeType)) throw new Error(`Unsupported stored image type: ${mimeType}`);

        const fileName = fileKey.split('/').pop() || `document-${documentId}.jpg`;
        console.log(`[OCR Integration] Sending ${buffer.length} bytes (${mimeType}) to AI for document ${documentId}`);

        let extractedData;
        let lastError;
        for (let attempt = 1; attempt <= 2; attempt++) {
            try {
                extractedData = await AiServiceGateway.uploadDocument(
                    consultation.rows[0].ai_session_id,
                    buffer,
                    mimeType,
                    fileName,
                    docType || 'medical_document'
                );
                break;
            } catch (error) {
                lastError = error;
                console.error(`[OCR Integration] AI upload attempt ${attempt} failed for ${documentId}:`, error?.message || error);
                if (attempt < 2) await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        if (!extractedData) throw lastError || new Error('AI document upload returned no result');

        await pool.query(
            "UPDATE uploaded_documents SET extracted_data = $1, status = 'completed', processing_error=NULL, source_mime_type=$3, updated_at=NOW() WHERE id = $2",
            [JSON.stringify(extractedData), documentId, mimeType]
        );

        console.log(`[OCR Integration] Successfully processed document ID: ${documentId}`);
    } catch (error) {
        console.error(`[OCR Integration Error] Processing failed for document ID: ${documentId}`, error);
        try {
            await pool.query(
                "UPDATE uploaded_documents SET status = 'failed', extracted_data=$1, processing_error=$2, updated_at=NOW() WHERE id = $3",
                [JSON.stringify({ error: error?.message || 'Document processing failed' }), error?.message || 'Document processing failed', documentId]
            );
        } catch (dbError) {
            console.error(`[OCR Integration Error] Could not persist failure for ${documentId}:`, dbError);
        }
    }
};

// ==========================================
// --- FLOW A: Zero-Login QR Upload ---
// ==========================================

export const pairKioskSession = asyncHandler(async (req, res) => {
    const session = await pool.query(
        `SELECT ks.*, c.patient_id, c.department_id, c.language,
                d.name AS department_name,
                p.patient_code, p.full_name, p.gender, p.date_of_birth,
                p.mobile_number, p.address
         FROM kiosk_sessions ks
         JOIN consultations c ON c.id=ks.consultation_id
         LEFT JOIN departments d ON d.id=c.department_id
         LEFT JOIN patients p ON p.id=c.patient_id
         WHERE ks.pairing_token=$1 AND ks.is_active=TRUE AND ks.expires_at>NOW()
         LIMIT 1`,
        [req.params.pairing_token]
    );
    if (session.rowCount === 0) throw new ApiError(410, "Pairing token expired or invalid");
    return res.status(200).json(new ApiResponse(200, session.rows[0], "Mobile successfully paired to Kiosk"));
});


export const getUploadUrl = asyncHandler(async (req, res) => {
    const { file_name, content_type } = req.body;

    if (!file_name || !content_type) {
        throw new ApiError(400, "file_name and content_type are required fields");
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(content_type)) {
        throw new ApiError(415, "Unsupported image type. Only JPEG, JPG, PNG, and WebP are allowed.");
    }

    const folder = req.user ? `vault/${req.user.id}` : `kiosk/${req.params.session_id || 'uploads'}`;
    if (!req.user) {
        const kiosk = await pool.query(
            `SELECT id,consultation_id FROM kiosk_sessions
             WHERE id=$1 AND is_active=TRUE AND expires_at>NOW()`,
            [req.params.session_id]
        );
        if (!kiosk.rowCount) throw new ApiError(410, 'Kiosk pairing session expired or invalid');
        const consent = await pool.query(
            `SELECT 1 FROM consent_records
             WHERE consultation_id=$1 AND scope_id='document_processing'
               AND status='granted' AND withdrawn_at IS NULL LIMIT 1`,
            [kiosk.rows[0].consultation_id]
        );
        if (!consent.rowCount) throw new ApiError(403, 'Document processing consent is not granted for this kiosk session');
    }
    const safeName = String(file_name).replace(/[^a-zA-Z0-9._-]/g, '_');
    const fileKey = `${folder}/${Date.now()}-${safeName}`;

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
    const { session_id } = req.params;

    if (!file_key || !document_type) {
        throw new ApiError(400, "file_key and document_type are required fields");
    }

    const sessionQuery = await pool.query(
        "SELECT consultation_id FROM kiosk_sessions WHERE id = $1 AND is_active = TRUE AND expires_at > NOW()",
        [session_id]
    );
    if (!sessionQuery.rowCount || !sessionQuery.rows[0].consultation_id) throw new ApiError(410, 'Kiosk pairing session expired or invalid');
    const consultationId = sessionQuery.rows[0].consultation_id;
    const consent = await pool.query(
        `SELECT 1 FROM consent_records
         WHERE consultation_id=$1 AND scope_id='document_processing'
           AND status='granted' AND withdrawn_at IS NULL
         LIMIT 1`,
        [consultationId]
    );
    if (!consent.rowCount) throw new ApiError(403, 'Document processing consent is not granted for this kiosk session');
    const expectedPrefix = `kiosk/${session_id}/`;
    if (!String(file_key).startsWith(expectedPrefix)) {
        throw new ApiError(400, 'file_key does not belong to this kiosk session');
    }
    if (!/\.(jpe?g|png|webp)$/i.test(String(file_key))) {
        throw new ApiError(415, 'Only image files can be analyzed');
    }
    const consultation = await pool.query('SELECT ai_session_id FROM consultations WHERE id=$1', [consultationId]);
    if (!consultation.rowCount) throw new ApiError(404, 'Consultation not found');

    const sourceMimeType = /\.webp$/i.test(file_key)
        ? 'image/webp'
        : /\.png$/i.test(file_key)
            ? 'image/png'
            : 'image/jpeg';
    const document = await pool.query(
        "INSERT INTO uploaded_documents (consultation_id, file_path_hash, document_type, source_mime_type, status) VALUES ($1, $2, $3, $4, 'pending') RETURNING id, file_path_hash, document_type, source_mime_type, status",
        [consultationId, file_key, document_type, sourceMimeType]
    );

    const registeredDoc = document.rows[0];

    executeOcrStreamingPipeline(consultationId, registeredDoc.id, file_key, document_type)
        .catch(err => console.error("[OCR Background Process Crash] ", err));

    return res.status(202).json(
        new ApiResponse(
            202,
            registeredDoc,
            "Document registered. Processing asynchronously through FastAPI AI backend."
        )
    );
});

const signedDocument = async (row) => {
    if (!row?.file_path_hash || !process.env.AWS_BUCKET_NAME) return row;
    try {
        const url = await getSignedUrl(
            s3Client,
            new GetObjectCommand({ Bucket: process.env.AWS_BUCKET_NAME, Key: row.file_path_hash }),
            { expiresIn: 300 }
        );
        return { ...row, download_url: url, retrieval_expires_in: 300 };
    } catch (error) {
        console.error('[Document Retrieval] Failed to sign document', row.id, error?.message || error);
        return row;
    }
};

export const deleteDocument = asyncHandler(async (req, res) => {
    const result = await pool.query(
        `DELETE FROM uploaded_documents d
         USING kiosk_sessions k
         WHERE d.id=$1 AND k.id=$2 AND d.consultation_id=k.consultation_id
         RETURNING d.id,d.file_path_hash`,
        [req.params.document_id, req.params.session_id]
    );
    if (!result.rowCount) throw new ApiError(404, 'Document not found for this kiosk session');

    if (result.rows[0].file_path_hash && process.env.AWS_BUCKET_NAME) {
        try {
            await s3Client.send(new DeleteObjectCommand({
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: result.rows[0].file_path_hash
            }));
        } catch (error) {
            console.warn('[Document Delete] S3 cleanup failed:', error?.message || error);
        }
    }
    return res.status(200).json(new ApiResponse(200, {document_id:req.params.document_id}, 'File preview deleted'));
});

export const getKioskDocuments = asyncHandler(async (req,res)=>{
    const session=await pool.query('SELECT consultation_id FROM kiosk_sessions WHERE id=$1 AND is_active=TRUE AND expires_at>NOW()',[req.params.session_id]);
    if(!session.rowCount) throw new ApiError(410,'Kiosk pairing session expired or invalid');
    const docs=await pool.query('SELECT * FROM uploaded_documents WHERE consultation_id=$1 ORDER BY created_at DESC',[session.rows[0].consultation_id]);
    const hydrated = await Promise.all(docs.rows.map(signedDocument));
    return res.json(new ApiResponse(200,hydrated,'Kiosk documents loaded'));
});

export const updateKioskSessionLanguage = asyncHandler(async (req, res) => {
    const { language } = req.body || {};
    if (!language) throw new ApiError(400, 'language is required');
    const session = await pool.query(
        `SELECT ks.id, ks.consultation_id, c.ai_session_id
         FROM kiosk_sessions ks
         JOIN consultations c ON c.id=ks.consultation_id
         WHERE ks.id=$1 AND ks.is_active=TRUE AND ks.expires_at>NOW()
         LIMIT 1`,
        [req.params.session_id]
    );
    if (!session.rowCount) throw new ApiError(410, 'Kiosk pairing session expired or invalid');
    const row = session.rows[0];
    const ai = row.ai_session_id
        ? await AiServiceGateway.updateLanguage(row.ai_session_id, language)
        : null;
    const updated = await pool.query(
        'UPDATE consultations SET language=$1,updated_at=NOW() WHERE id=$2 RETURNING id,language',
        [language, row.consultation_id]
    );
    return res.json(new ApiResponse(200, { consultation: updated.rows[0], ai }, 'Kiosk language synchronized'));
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

    // Normalize the number in the same way as sendPortalOtp().
    // This allows both:
    //   8699085590
    //   +918699085590
    // to refer to the same patient.
    const rawNumber = String(mobileNumber).trim();

    const formattedNumber = rawNumber.startsWith('+')
        ? rawNumber
        : `+91${rawNumber}`;

    // Verify the OTP against the normalized number.
    const isValid = verifyOTP(formattedNumber, otp);

    if (!isValid) {
        throw new ApiError(401, "Invalid or expired verification OTP");
    }

    // Patient records created by the Kiosk may contain the local
    // 10-digit number, while portal login may provide +91XXXXXXXXXX.
    // Try both formats.
    const localNumber = formattedNumber.startsWith('+91')
        ? formattedNumber.substring(3)
        : rawNumber.replace(/^\+/, '');

    const patientQuery = await pool.query(
        `SELECT *
         FROM patients
         WHERE mobile_number = $1
            OR mobile_number = $2
         LIMIT 1`,
        [localNumber, formattedNumber]
    );

    const patient = patientQuery.rows[0];

    if (!patient) {
        throw new ApiError(
            404,
            'No registered patient found for this mobile number'
        );
    }

    const token = jwt.sign(
        {
            id: patient.id,
            email: patient.mobile_number,
            role: "patient"
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: '1d'
        }
    );

    return res
        .status(200)
        .cookie("accessToken", token, cookieOptions)
        .json(
            new ApiResponse(
                200,
                {
                    patient,
                    accessToken: token
                },
                "Home Portal access granted"
            )
        );
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

    const summaryQuery = await pool.query(`SELECT cs.* FROM clinical_summaries cs JOIN consultations c ON c.id=cs.consultation_id WHERE c.patient_id=$1 ORDER BY cs.generated_at DESC LIMIT 1`, [patientId]);
    const patientResult = await pool.query(
        `SELECT id, patient_code, full_name, gender, date_of_birth, mobile_number
         FROM patients WHERE id=$1 LIMIT 1`,
        [patientId]
    );
    const patient = patientResult.rows[0] || null;
    const departmentQuery = await pool.query(
        `SELECT d.name FROM consultations c
         LEFT JOIN departments d ON d.id=c.department_id
         WHERE c.patient_id=$1 ORDER BY c.created_at DESC LIMIT 1`,
        [patientId]
    );
    const dashboardData = {
        patient,
        patient_name: patient?.full_name || null,
        patient_id: patient?.patient_code || null,
        appointment: {
            token: appointment.token_number,
            status: appointment.status,
            hospital: appointment.hospital_name,
            department: departmentQuery.rows[0]?.name || "AyushCare OPD"
        },
        ai_summary: summaryQuery.rows[0] || null
    };

    return res.status(200).json(new ApiResponse(200, dashboardData, "Dashboard data loaded"));
});

export const getPortalVisits = asyncHandler(async (req, res) => {
    const result = await pool.query(
        `SELECT c.id, c.token_number, c.status, c.risk_level, c.intake_pathway,
                c.language, c.created_at, c.updated_at,
                h.name AS hospital_name, d.name AS department_name,
                u.name AS doctor_name
         FROM consultations c
         LEFT JOIN hospitals h ON h.id=c.hospital_id
         LEFT JOIN departments d ON d.id=c.department_id
         LEFT JOIN users u ON u.id=c.assigned_doctor_id
         WHERE c.patient_id=$1
         ORDER BY c.created_at DESC
         LIMIT 50`,
        [req.user.id]
    );
    return res.json(new ApiResponse(200, result.rows, 'Patient visits loaded'));
});

export const getAudioSummary = asyncHandler(async (req, res) => {
    const summary = await pool.query(`SELECT cs.ai_payload, cs.chief_complaint, cs.history_of_present_illness, c.ai_session_id, c.language FROM clinical_summaries cs JOIN consultations c ON c.id=cs.consultation_id WHERE c.patient_id=$1 ORDER BY cs.generated_at DESC LIMIT 1`, [req.user.id]);
    if (!summary.rowCount) throw new ApiError(404, 'No clinical summary is available');
    const row=summary.rows[0];
    const text=[row.chief_complaint,row.history_of_present_illness].filter(Boolean).join('. ');
    const audio=await AiServiceGateway.tts(row.ai_session_id,text,row.language||'en');
    return res.json(new ApiResponse(200,audio,'Text-to-speech audio generated'));
});

export const getPortalDocuments = asyncHandler(async (req, res) => {
    const documents = await pool.query(
        `SELECT d.* FROM uploaded_documents d
         JOIN consultations c ON d.consultation_id = c.id
         WHERE c.patient_id = $1
         ORDER BY d.created_at DESC`,
        [req.user.id]
    );
    const hydrated = await Promise.all(documents.rows.map(signedDocument));
    return res.status(200).json(new ApiResponse(200, hydrated, "Patient Document Vault loaded"));
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
    const current = await pool.query('SELECT * FROM privacy_settings WHERE patient_id=$1', [req.user.id]);
    const base = current.rows[0] || {
        isolate_past_history: false,
        consent_voice_processing: true,
        lock_diagnosis: false,
        lock_visits: false,
        lock_reports: false
    };
    const body = req.body || {};
    const isolate = body.isolate_past_history ?? base.isolate_past_history;
    const voice = body.consent_voice_processing ?? base.consent_voice_processing;
    const diagnosis = body.lock_diagnosis ?? base.lock_diagnosis;
    const visits = body.lock_visits ?? base.lock_visits;
    const reports = body.lock_reports ?? base.lock_reports;

    const privacyQuery = await pool.query(
        `INSERT INTO privacy_settings
            (patient_id, isolate_past_history, consent_voice_processing, lock_diagnosis, lock_visits, lock_reports)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (patient_id)
         DO UPDATE SET isolate_past_history=$2, consent_voice_processing=$3,
                       lock_diagnosis=$4, lock_visits=$5, lock_reports=$6, updated_at=NOW()
         RETURNING *`,
        [req.user.id, isolate, voice, diagnosis, visits, reports]
    );
    return res.status(200).json(new ApiResponse(200, privacyQuery.rows[0], "Preferences saved successfully"));
});