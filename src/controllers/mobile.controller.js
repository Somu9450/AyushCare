import { ApiResponse } from '../utilities/ApiResponse.js';
import { asyncHandler } from '../utilities/asyncHandler.js';
import { ApiError } from '../utilities/ApiError.js';
import pool from '../database/dbConnection.js';
import jwt from 'jsonwebtoken';
import { createHash, randomBytes } from 'crypto';

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
        const aiStatus = String(extractedData?.processing_status || extractedData?.status || '').toLowerCase();
        const aiFailed = ['failed', 'ocr_failed', 'no_text_detected', 'error'].includes(aiStatus) || Boolean(extractedData?.error);
        const finalStatus = aiFailed ? 'failed' : 'completed';
        const processingError = aiFailed ? (extractedData?.error || `AI document processing returned status: ${aiStatus}`) : null;

        await pool.query(
            "UPDATE uploaded_documents SET extracted_data = $1, status = $2, processing_error=$3, source_mime_type=$5, updated_at=NOW() WHERE id = $4",
            [JSON.stringify(extractedData), finalStatus, processingError, documentId, mimeType]
        );
        if (aiFailed) throw new Error(processingError);

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


const hashQrToken = (token) => createHash('sha256').update(String(token)).digest('hex');

const signPatientToken = (patient) => jwt.sign(
    { id: patient.id, email: patient.mobile_number, role: 'patient' },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '1d' }
);

const normalizeMobileForLookup = (value) => {
    const digits = String(value || '').replace(/\D/g, '');
    if (digits.length === 10) return digits;
    if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
    return '';
};

const resolvePatientConsultation = async (patientId, requestedConsultationId = null) => {
    if (requestedConsultationId) {
        const result = await pool.query(
            `SELECT c.*, p.patient_code, p.full_name
             FROM consultations c JOIN patients p ON p.id=c.patient_id
             WHERE c.id=$1 AND c.patient_id=$2 LIMIT 1`,
            [requestedConsultationId, patientId]
        );
        if (!result.rowCount) throw new ApiError(403, 'The selected visit does not belong to this patient');
        return result.rows[0];
    }

    const result = await pool.query(
        `SELECT c.*, p.patient_code, p.full_name
         FROM consultations c JOIN patients p ON p.id=c.patient_id
         WHERE c.patient_id=$1 AND c.ai_session_id IS NOT NULL
         ORDER BY c.created_at DESC LIMIT 1`,
        [patientId]
    );
    if (result.rowCount) return result.rows[0];

    const hospitalId = process.env.DEFAULT_HOSPITAL_ID;
    if (!hospitalId) throw new ApiError(503, 'No hospital is configured for document uploads');
    const inserted = await pool.query(
        `INSERT INTO consultations (hospital_id,patient_id,status,intake_pathway,language)
         VALUES ($1,$2,'waiting_triage','general','en') RETURNING *`,
        [hospitalId, patientId]
    );
    const consultation = inserted.rows[0];
    try {
        const ai = await AiServiceGateway.createSession(patientId, hospitalId, 'en', 'general');
        const aiSessionId = ai?.id || ai?.session_id || null;
        if (aiSessionId) {
            const updated = await pool.query('UPDATE consultations SET ai_session_id=$1,updated_at=NOW() WHERE id=$2 RETURNING *', [aiSessionId, consultation.id]);
            return updated.rows[0];
        }
    } catch (error) {
        console.warn('[Portal Upload] Could not initialize AI session for new document visit:', error?.message || error);
    }
    return consultation;
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
    const { file_name, content_type, consultation_id, document_processing_consent } = req.body || {};
    if (!file_name || !content_type) throw new ApiError(400, 'file_name and content_type are required fields');

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(String(content_type).toLowerCase())) {
        throw new ApiError(415, 'Unsupported image type. Only JPEG, JPG, PNG, and WebP are allowed.');
    }

    let folder;
    if (req.user) {
        const consultation = await resolvePatientConsultation(req.user.id, consultation_id || null);
        let consent = await pool.query(
            `SELECT 1 FROM consent_records
             WHERE consultation_id=$1 AND scope_id='document_processing'
               AND status='granted' AND withdrawn_at IS NULL LIMIT 1`,
            [consultation.id]
        );
        if (!consent.rowCount && document_processing_consent === true) {
            await pool.query(
                `INSERT INTO consent_records(consultation_id,scope_id,title,purpose,required,status)
                 VALUES($1,'document_processing','Document Processing','Patient-authorized medical document analysis',FALSE,'granted')`,
                [consultation.id]
            );
            consent = { rowCount: 1 };
        }
        if (!consent.rowCount) throw new ApiError(403, 'Document processing consent is required before upload');
        folder = `vault/${req.user.id}`;
    } else {
        const kiosk = await pool.query(
            `SELECT id,consultation_id FROM kiosk_sessions
             WHERE id=$1 AND is_active=TRUE AND expires_at>NOW()`,
            [req.params.session_id]
        );
        if (!kiosk.rowCount) throw new ApiError(410, 'Kiosk pairing session expired or invalid');
        folder = `kiosk/${req.params.session_id}`;
    }

    const safeName = String(file_name).replace(/[^a-zA-Z0-9._-]/g, '_');
    const fileKey = `${folder}/${Date.now()}-${randomBytes(4).toString('hex')}-${safeName}`;
    try {
        const command = new PutObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: fileKey,
            ContentType: content_type,
        });
        const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });
        return res.status(200).json(new ApiResponse(200, { upload_url: presignedUrl, file_key: fileKey }, 'Presigned upload URL generated successfully'));
    } catch (error) {
        throw new ApiError(500, 'Failed to generate upload URL', [error.message]);
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


export const createPatientUploadQr = asyncHandler(async (req, res) => {
    const consultationId = req.params.session_id;
    const consultation = await pool.query(
        `SELECT c.id, c.patient_id, p.patient_code, p.full_name
         FROM consultations c JOIN patients p ON p.id=c.patient_id
         WHERE c.id=$1 LIMIT 1`,
        [consultationId]
    );
    if (!consultation.rowCount) throw new ApiError(404, 'Consultation not found');

    const rawToken = randomBytes(24).toString('base64url');
    const expiresAt = new Date(Date.now() + 45 * 1000);
    await pool.query(
        `UPDATE patient_qr_tokens SET used_at=COALESCE(used_at,NOW()) WHERE consultation_id=$1 AND used_at IS NULL AND expires_at>NOW()`,
        [consultationId]
    );
    const created = await pool.query(
        `INSERT INTO patient_qr_tokens(token_hash,patient_id,consultation_id,expires_at)
         VALUES($1,$2,$3,$4) RETURNING id,expires_at`,
        [hashQrToken(rawToken), consultation.rows[0].patient_id, consultationId, expiresAt]
    );
    return res.status(201).json(new ApiResponse(201, {
        token: rawToken,
        expires_at: created.rows[0].expires_at,
        expires_in_seconds: 45,
        patient_code: consultation.rows[0].patient_code,
        patient_name: consultation.rows[0].full_name,
    }, 'Patient document-upload QR generated'));
});

export const exchangePatientUploadQr = asyncHandler(async (req, res) => {
    const rawToken = String(req.body?.token || '').trim();
    if (!rawToken) throw new ApiError(400, 'QR token is required');
    const result = await pool.query(
        `SELECT q.id, q.patient_id, q.consultation_id, q.expires_at,
                p.id AS pid, p.patient_code, p.full_name, p.gender, p.date_of_birth, p.mobile_number, p.address,
                EXISTS(SELECT 1 FROM consent_records cr WHERE cr.consultation_id=q.consultation_id AND cr.scope_id='document_processing' AND cr.status='granted' AND cr.withdrawn_at IS NULL) AS document_processing_consent
         FROM patient_qr_tokens q JOIN patients p ON p.id=q.patient_id
         WHERE q.token_hash=$1 AND q.used_at IS NULL AND q.expires_at>NOW()
         LIMIT 1`,
        [hashQrToken(rawToken)]
    );
    if (!result.rowCount) throw new ApiError(410, 'This patient QR has expired or has already been used');
    const row = result.rows[0];
    await pool.query('UPDATE patient_qr_tokens SET used_at=NOW() WHERE id=$1 AND used_at IS NULL', [row.id]);
    const patient = {
        id: row.pid, patient_code: row.patient_code, full_name: row.full_name,
        gender: row.gender, date_of_birth: row.date_of_birth, mobile_number: row.mobile_number, address: row.address,
    };
    const accessToken = signPatientToken(patient);
    return res.json(new ApiResponse(200, {
        accessToken,
        patient,
        consultation_id: row.consultation_id,
        auth_mode: 'qr_patient_portal',
        document_processing_consent: Boolean(row.document_processing_consent),
    }, 'Patient QR login successful'));
});

export const registerPortalDocument = asyncHandler(async (req, res) => {
    const { file_key, document_type, consultation_id } = req.body || {};
    if (!file_key || !document_type) throw new ApiError(400, 'file_key and document_type are required');
    if (!/\.(jpe?g|png|webp)$/i.test(String(file_key))) throw new ApiError(415, 'Only JPEG, PNG and WebP images can be analyzed');
    if (!String(file_key).startsWith(`vault/${req.user.id}/`)) throw new ApiError(403, 'Document storage key does not belong to this patient');

    const consultation = await resolvePatientConsultation(req.user.id, consultation_id || null);
    const consent = await pool.query(
        `SELECT 1 FROM consent_records WHERE consultation_id=$1 AND scope_id='document_processing' AND status='granted' AND withdrawn_at IS NULL LIMIT 1`,
        [consultation.id]
    );
    if (!consent.rowCount) throw new ApiError(403, 'Document processing consent is not granted for this visit');
    if (!consultation.ai_session_id) throw new ApiError(409, 'AI session is not available for this visit yet');

    const sourceMimeType = /\.webp$/i.test(file_key) ? 'image/webp' : /\.png$/i.test(file_key) ? 'image/png' : 'image/jpeg';
    const document = await pool.query(
        `INSERT INTO uploaded_documents (consultation_id,file_path_hash,document_type,source_mime_type,status)
         VALUES($1,$2,$3,$4,'pending') RETURNING *`,
        [consultation.id, file_key, document_type, sourceMimeType]
    );
    const row = document.rows[0];
    executeOcrStreamingPipeline(consultation.id, row.id, file_key, document_type).catch((error) => console.error('[Portal OCR] background failure', error));
    return res.status(202).json(new ApiResponse(202, row, 'Document registered for OCR and medical extraction'));
});

export const getPortalDocument = asyncHandler(async (req, res) => {
    const result = await pool.query(
        `SELECT d.* FROM uploaded_documents d
         JOIN consultations c ON c.id=d.consultation_id
         WHERE d.id=$1 AND c.patient_id=$2 LIMIT 1`,
        [req.params.document_id, req.user.id]
    );
    if (!result.rowCount) throw new ApiError(404, 'Document not found');
    return res.json(new ApiResponse(200, await signedDocument(result.rows[0]), 'Document loaded'));
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
    const localNumber = normalizeMobileForLookup(rawNumber || formattedNumber);

    const patientQuery = await pool.query(
        `SELECT *
         FROM patients
         WHERE mobile_number = $1
            OR mobile_number = $2
         ORDER BY created_at DESC
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
    const privacyQuery = await pool.query('SELECT * FROM privacy_settings WHERE patient_id=$1', [patientId]);
    const privacy = privacyQuery.rows[0] || { share_previous_departments: true, share_previous_appointments: true, share_previous_reports: true };
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
            department: privacy.share_previous_departments === false ? null : (departmentQuery.rows[0]?.name || "AyushCare OPD")
        },
        ai_summary: summaryQuery.rows[0] || null
    };

    return res.status(200).json(new ApiResponse(200, dashboardData, "Dashboard data loaded"));
});

export const getPortalVisits = asyncHandler(async (req, res) => {
    const privacyQuery = await pool.query('SELECT share_previous_departments, share_previous_appointments FROM privacy_settings WHERE patient_id=$1', [req.user.id]);
    const privacy = privacyQuery.rows[0] || { share_previous_departments: true, share_previous_appointments: true };
    const appointmentFilter = privacy.share_previous_appointments === false ? "AND c.status NOT IN ('complete','cancelled')" : '';
    const result = await pool.query(
        `SELECT c.id, c.token_number, c.status, c.risk_level, c.intake_pathway,
                c.language, c.created_at, c.updated_at, h.name AS hospital_name,
                ${privacy.share_previous_departments === false ? 'NULL' : 'd.name'} AS department_name,
                u.name AS doctor_name
         FROM consultations c
         LEFT JOIN hospitals h ON h.id=c.hospital_id
         LEFT JOIN departments d ON d.id=c.department_id
         LEFT JOIN users u ON u.id=c.assigned_doctor_id
         WHERE c.patient_id=$1 ${appointmentFilter}
         ORDER BY c.created_at DESC LIMIT 50`,
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
    const privacyQuery = await pool.query('SELECT share_previous_reports FROM privacy_settings WHERE patient_id=$1', [req.user.id]);
    if (privacyQuery.rows[0]?.share_previous_reports === false) {
        return res.status(200).json(new ApiResponse(200, [], 'Previous reports are hidden by your privacy setting'));
    }
    const documents = await pool.query(
        `SELECT d.* FROM uploaded_documents d JOIN consultations c ON d.consultation_id=c.id
         WHERE c.patient_id=$1 ORDER BY d.created_at DESC`,
        [req.user.id]
    );
    const hydrated = await Promise.all(documents.rows.map(signedDocument));
    return res.status(200).json(new ApiResponse(200, hydrated, 'Patient Document Vault loaded'));
});

export const getPortalPrivacy = asyncHandler(async (req, res) => {
    let privacyQuery = await pool.query('SELECT * FROM privacy_settings WHERE patient_id = $1', [req.user.id]);

    if (privacyQuery.rowCount === 0) {
        const seedQuery = await pool.query(
            `INSERT INTO privacy_settings
             (patient_id, isolate_past_history, consent_voice_processing,
              share_previous_departments, share_previous_reports, share_previous_appointments)
             VALUES ($1, FALSE, TRUE, TRUE, TRUE, TRUE) RETURNING *`,
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
        share_previous_departments: true,
        share_previous_reports: true,
        share_previous_appointments: true,
    };
    const body = req.body || {};
    const isolate = body.isolate_past_history ?? base.isolate_past_history;
    const voice = body.consent_voice_processing ?? base.consent_voice_processing;
    const departments = body.share_previous_departments ?? base.share_previous_departments ?? true;
    const reports = body.share_previous_reports ?? base.share_previous_reports ?? true;
    const appointments = body.share_previous_appointments ?? base.share_previous_appointments ?? true;
    const privacyQuery = await pool.query(
        `INSERT INTO privacy_settings
            (patient_id, isolate_past_history, consent_voice_processing,
             share_previous_departments, share_previous_reports, share_previous_appointments,
             lock_diagnosis, lock_visits, lock_reports)
         VALUES ($1,$2,$3,$4,$5,$6,NOT $4,NOT $6,NOT $5)
         ON CONFLICT (patient_id)
         DO UPDATE SET isolate_past_history=$2,
                       consent_voice_processing=$3,
                       share_previous_departments=$4,
                       share_previous_reports=$5,
                       share_previous_appointments=$6,
                       lock_diagnosis=NOT $4,
                       lock_visits=NOT $6,
                       lock_reports=NOT $5,
                       updated_at=NOW()
         RETURNING *`,
        [req.user.id, Boolean(isolate), Boolean(voice), Boolean(departments), Boolean(reports), Boolean(appointments)]
    );
    return res.status(200).json(new ApiResponse(200, privacyQuery.rows[0], 'Preferences saved successfully'));
});
