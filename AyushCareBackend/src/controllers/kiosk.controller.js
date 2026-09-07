import { randomBytes } from 'crypto';
import { ApiResponse } from '../utilities/ApiResponse.js';
import { asyncHandler } from '../utilities/asyncHandler.js';
import { ApiError } from '../utilities/ApiError.js';
import pool from '../database/dbConnection.js';
import AiServiceGateway from '../services/aiService.js';
import { createRawQrToken, hashQrToken } from '../services/patientQrService.js';

const DEFAULT_HOSPITAL = () => process.env.DEFAULT_HOSPITAL_ID || null;

const normalizeMobile = (value) => {
    const raw = String(value || '').replace(/\D/g, '');
    if (raw.length === 10) return raw;
    if (raw.length === 12 && raw.startsWith('91')) return raw.slice(2);
    return '';
};

const normalizeDigits = (value, length, label) => {
    if (value === undefined || value === null || value === '') return null;
    const digits = String(value).replace(/\D/g, '');
    if (digits.length !== length) throw new ApiError(400, `${label} must contain exactly ${length} digits`);
    return digits;
};

const generatePatientCode = async (client) => {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    for (let attempt = 0; attempt < 20; attempt++) {
        let code = '';
        for (let i = 0; i < 6; i++) code += alphabet[Math.floor(Math.random() * alphabet.length)];
        const found = await client.query('SELECT 1 FROM patients WHERE patient_code=$1', [code]);
        if (!found.rowCount) return code;
    }
    throw new ApiError(500, 'Unable to generate a unique patient ID');
};

const dateOfBirthFromAge = (age) => {
    if (age === undefined || age === null || age === '') return null;
    const n = Number(age);
    if (!Number.isInteger(n) || n < 0 || n > 120) throw new ApiError(400, 'age must be an integer between 0 and 120');
    const d = new Date();
    d.setFullYear(d.getFullYear() - n);
    return d.toISOString().slice(0, 10);
};
const pathway = (value) => {
    const p = String(value || 'general').toLowerCase();
    if (!['general', 'allopathy', 'ayurveda'].includes(p)) throw new ApiError(400, 'intake_pathway must be general, allopathy, or ayurveda');
    return p;
};

const audit = (client, consultationId, eventType, metadata = {}) => client.query(
    `INSERT INTO audit_events (consultation_id, actor_type, event_type, metadata) VALUES ($1,'patient',$2,$3)`,
    [consultationId, eventType, JSON.stringify(metadata)]
);

const getConsultation = async (consultationId) => {
    const result = await pool.query('SELECT * FROM consultations WHERE id = $1', [consultationId]);
    if (!result.rowCount) throw new ApiError(404, 'Consultation not found');
    return result.rows[0];
};

export const performAbhaRegister = asyncHandler(async (req, res) => {
    const {
        abhaNumber, abhaAddress, fullName, gender, dob, age, mobileNumber, address,
        aadhaarNumber, patientId, registrationType = 'new', consent = false,
        hospitalId, language = 'en', intakePathway = 'general', kioskId = 'KIOSK-MAIN-01', departmentId, doctorId
    } = req.body;

    const selectedPathway = pathway(intakePathway);
    const type = String(registrationType).toLowerCase() === 'old' ? 'old' : 'new';
    const mobile = normalizeMobile(mobileNumber);
    const aadhaar = normalizeDigits(aadhaarNumber, 12, 'Aadhaar number');
    const abha = normalizeDigits(abhaNumber, 14, 'ABHA number');
    const resolvedDob = dob || dateOfBirthFromAge(age);

    if (!consent) throw new ApiError(403, 'Explicit clinical intake consent is required');
    if (type === 'new' && (!fullName || !gender || !resolvedDob || !mobile)) {
        throw new ApiError(400, 'New registration requires fullName, gender, age/dob and a 10-digit mobile number');
    }
    if (type === 'old' && !patientId && !mobile) {
        throw new ApiError(400, 'Existing patient lookup requires patientId or mobileNumber');
    }

    const client = await pool.connect();
    let createdAiSessionId = null;
    try {
        await client.query('BEGIN');
        let resolvedHospitalId = hospitalId || DEFAULT_HOSPITAL();
        if (!resolvedHospitalId) {
            const h = await client.query('SELECT id FROM hospitals ORDER BY created_at LIMIT 1');
            if (!h.rowCount) throw new ApiError(400, 'No hospital is configured for kiosk intake');
            resolvedHospitalId = h.rows[0].id;
        }

        let patient;
        if (type === 'old') {
            const conditions = [];
            const params = [];
            if (patientId) { params.push(String(patientId).trim().toUpperCase()); conditions.push(`patient_code=$${params.length}`); }
            if (mobile) { params.push(mobile); conditions.push(`mobile_number=$${params.length}`); }
            let existing;
            if (patientId && mobile) {
                existing = await client.query(
                    `SELECT * FROM patients
                     WHERE patient_code=$1 AND mobile_number=$2
                     ORDER BY created_at DESC`,
                    [String(patientId).trim().toUpperCase(), mobile]
                );
            } else {
                existing = await client.query(
                    `SELECT * FROM patients WHERE ${conditions.join(' OR ')} ORDER BY created_at DESC`,
                    params
                );
            }
            if (!existing.rowCount) throw new ApiError(404, 'No existing patient found for the supplied Patient ID or mobile number');
            if (existing.rowCount > 1 && !patientId) {
                await client.query('ROLLBACK');
                return res.status(200).json(new ApiResponse(200, {
                    multiple: true,
                    patients: existing.rows
                }, 'Multiple patients found for this mobile number'));
            }
            patient = existing.rows[0];
            await client.query('UPDATE patients SET consent_granted=TRUE, consent_timestamp=NOW() WHERE id=$1', [patient.id]);
        } else {
            if (abha) {
                const existing = await client.query('SELECT * FROM patients WHERE abha_number = $1', [abha]);
                if (existing.rowCount) patient = existing.rows[0];
            }
            if (!patient && aadhaar) {
                const existing = await client.query('SELECT * FROM patients WHERE aadhaar_number = $1', [aadhaar]);
                if (existing.rowCount) patient = existing.rows[0];
            }
            const patientCode = patient?.patient_code || await generatePatientCode(client);
            if (patient) {
                const updated = await client.query(
                    `UPDATE patients SET patient_code=$1, full_name=$2, gender=$3, date_of_birth=$4, mobile_number=COALESCE($5,mobile_number), abha_number=COALESCE($6,abha_number), abha_address=COALESCE($7,abha_address), address=COALESCE($8,address), aadhaar_number=COALESCE($9,aadhaar_number), registration_type='new', consent_granted=TRUE, consent_timestamp=NOW() WHERE id=$10 RETURNING *`,
                    [patientCode, fullName, gender, resolvedDob, mobile || null, abha, abhaAddress || null, address || null, aadhaar, patient.id]
                );
                patient = updated.rows[0];
            } else {
                const inserted = await client.query(
                    `INSERT INTO patients (patient_code,abha_number,abha_address,full_name,gender,date_of_birth,mobile_number,address,aadhaar_number,registration_type,consent_granted,consent_timestamp) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'new',TRUE,NOW()) RETURNING *`,
                    [patientCode, abha, abhaAddress || null, fullName, gender, resolvedDob, mobile, address || null, aadhaar]
                );
                patient = inserted.rows[0];
            }
        }

        let validatedDepartmentId = departmentId || null;
        let validatedDoctorId = doctorId || null;

        if (validatedDepartmentId) {
            const department = await client.query(
                `SELECT id,hospital_id,pathway FROM departments
                 WHERE id=$1 AND is_active=TRUE LIMIT 1`,
                [validatedDepartmentId]
            );
            if (!department.rowCount || String(department.rows[0].hospital_id) !== String(resolvedHospitalId)) {
                throw new ApiError(400, 'Selected department is invalid for this hospital');
            }
            if (department.rows[0].pathway !== selectedPathway && !(selectedPathway === 'general' && department.rows[0].pathway === 'allopathy')) {
                throw new ApiError(400, 'Selected department does not match the intake pathway');
            }
        }

        if (validatedDoctorId) {
            const doctor = await client.query(
                `SELECT id,hospital_id FROM users
                 WHERE id=$1 AND role='doctor' AND is_active=TRUE LIMIT 1`,
                [validatedDoctorId]
            );
            if (!doctor.rowCount || String(doctor.rows[0].hospital_id) !== String(resolvedHospitalId)) {
                throw new ApiError(400, 'Selected doctor is invalid for this hospital');
            }
        }

        const consultation = (await client.query(
            `INSERT INTO consultations (hospital_id,patient_id,status,intake_pathway,language,department_id,assigned_doctor_id) VALUES ($1,$2,'waiting_triage',$3,$4,$5,$6) RETURNING *`,
            [resolvedHospitalId, patient.id, selectedPathway, language, validatedDepartmentId, validatedDoctorId]
        )).rows[0];

        let aiSession;
        try {
            aiSession = await AiServiceGateway.createSession(patient.id, resolvedHospitalId, language, selectedPathway);
        } catch (error) {
            throw new ApiError(502, 'Patient registered, but MediKiosk AI session could not be initialized', [error.message]);
        }
        const aiSessionId = aiSession?.id || aiSession?.session_id;
        createdAiSessionId = aiSessionId || null;
        await client.query('UPDATE consultations SET ai_session_id=$1, updated_at=NOW() WHERE id=$2', [aiSessionId || null, consultation.id]);

        const pairingToken = randomBytes(12).toString('hex').toUpperCase();
        const expiresAt = new Date(Date.now() + Number(process.env.KIOSK_SESSION_TTL_MINUTES || 30) * 60 * 1000);
        const kioskSession = (await client.query(
            `INSERT INTO kiosk_sessions (pairing_token,kiosk_id,consultation_id,expires_at) VALUES ($1,$2,$3,$4) RETURNING id,pairing_token,kiosk_id,consultation_id,is_active,expires_at`,
            [pairingToken, kioskId, consultation.id, expiresAt]
        )).rows[0];
        await audit(client, consultation.id, 'patient_verified', { pathway: selectedPathway, language, registration_type: type, patient_code: patient.patient_code });
        await client.query('COMMIT');

        return res.status(201).json(new ApiResponse(201, {
            patient,
            consultation_id: consultation.id,
            session_id: consultation.id,
            ai_session_id: aiSessionId,
            language,
            intake_pathway: selectedPathway,
            registration_type: type,
            pairing_session: kioskSession
        }, 'Patient verified and kiosk consultation initialized'));
    } catch (error) {
        await client.query('ROLLBACK');
        try {
            if (typeof createdAiSessionId !== 'undefined' && createdAiSessionId) {
                await AiServiceGateway.deleteSession(createdAiSessionId);
            }
        } catch (cleanupError) {
            console.error('[Kiosk] AI session cleanup failed after transaction rollback:', cleanupError?.message || cleanupError);
        }
        throw error;
    } finally { client.release(); }
});

export const lookupPatients = asyncHandler(async (req, res) => {
    const patientId = String(req.query.patient_id || '').trim().toUpperCase();
    const mobile = normalizeMobile(req.query.mobile_number || req.query.mobileNumber);
    if (!patientId && !mobile) throw new ApiError(400, 'patient_id or mobile_number is required');

    const params = [];
    const conditions = [];
    if (patientId) { params.push(patientId); conditions.push(`p.patient_code=$${params.length}`); }
    if (mobile) { params.push(mobile); conditions.push(`p.mobile_number=$${params.length}`); }
    const joiner = patientId && mobile ? ' AND ' : ' OR ';

    const result = await pool.query(
        `SELECT p.id,p.patient_code,p.full_name,p.gender,p.date_of_birth,
                EXTRACT(YEAR FROM AGE(p.date_of_birth))::int AS age,
                p.mobile_number,p.address,p.aadhaar_number,p.abha_number,p.abha_address,p.created_at,
                COALESCE(
                  jsonb_agg(DISTINCT jsonb_build_object(
                    'department_id', d.id,
                    'department_name', d.name,
                    'pathway', c.intake_pathway,
                    'visited_at', c.created_at
                  ) ORDER BY c.created_at DESC) FILTER (WHERE c.id IS NOT NULL),
                  '[]'::jsonb
                ) AS recent_visits
         FROM patients p
         LEFT JOIN consultations c ON c.patient_id=p.id
         LEFT JOIN departments d ON d.id=c.department_id
         WHERE ${conditions.join(joiner)}
         GROUP BY p.id
         ORDER BY MAX(c.created_at) DESC NULLS LAST, p.created_at DESC`,
        params
    );
    return res.json(new ApiResponse(200, { multiple: result.rowCount > 1, patients: result.rows }, 'Patient lookup completed'));
});

export const integrationHealth = asyncHandler(async (req, res) => {
    const checks = { database: false, ai: false, s3_configured: false };
    try {
        await pool.query('SELECT 1');
        checks.database = true;
    } catch (error) {
        checks.database_error = error?.message || 'database unavailable';
    }
    try {
        const ai = await AiServiceGateway.health();
        checks.ai = Boolean(ai);
    } catch (error) {
        checks.ai_error = error?.message || 'AI unavailable';
    }
    checks.s3_configured = Boolean(
        process.env.AWS_BUCKET_NAME &&
        process.env.AWS_REGION &&
        process.env.AWS_ACCESS_KEY_ID &&
        process.env.AWS_SECRET_ACCESS_KEY
    );
    const healthy = checks.database && checks.ai && checks.s3_configured;
    return res.status(healthy ? 200 : 503).json(
        new ApiResponse(healthy ? 200 : 503, checks, healthy ? 'All integrations healthy' : 'One or more integrations unavailable')
    );
});

export const createKioskSession = asyncHandler(async (req, res) => {
    const { consultationId, kioskId = 'KIOSK-MAIN-01' } = req.body;
    if (!consultationId) throw new ApiError(400, 'consultationId is required');
    await getConsultation(consultationId);
    const token = randomBytes(12).toString('hex').toUpperCase();
    const expiresAt = new Date(Date.now() + Number(process.env.KIOSK_SESSION_TTL_MINUTES || 30) * 60 * 1000);
    const result = await pool.query(`INSERT INTO kiosk_sessions (pairing_token,kiosk_id,consultation_id,expires_at) VALUES ($1,$2,$3,$4) RETURNING *`, [token,kioskId,consultationId,expiresAt]);
    return res.status(201).json(new ApiResponse(201, result.rows[0], 'Kiosk pairing session created'));
});

export const createPatientUploadQr = asyncHandler(async (req, res) => {
    const consultationId = req.params.session_id;
    const result = await pool.query(
        `SELECT c.id, c.patient_id, p.patient_code, p.full_name
         FROM consultations c
         JOIN patients p ON p.id=c.patient_id
         WHERE c.id=$1 LIMIT 1`,
        [consultationId]
    );
    if (!result.rowCount) throw new ApiError(404, 'Consultation not found');

    const rawToken = createRawQrToken();
    const expiresAt = new Date(Date.now() + 45 * 1000);

    await pool.query(
        `UPDATE patient_qr_tokens
         SET used_at=COALESCE(used_at,NOW())
         WHERE consultation_id=$1 AND used_at IS NULL AND expires_at>NOW()`,
        [consultationId]
    );

    const created = await pool.query(
        `INSERT INTO patient_qr_tokens(token_hash,patient_id,consultation_id,expires_at)
         VALUES($1,$2,$3,$4) RETURNING id,expires_at`,
        [hashQrToken(rawToken), result.rows[0].patient_id, consultationId, expiresAt]
    );

    return res.status(201).json(new ApiResponse(201, {
        token: rawToken,
        expires_at: created.rows[0].expires_at,
        expires_in_seconds: 45,
        patient_code: result.rows[0].patient_code,
        patient_name: result.rows[0].full_name
    }, 'Patient document-upload QR generated'));
});

export const getSession = asyncHandler(async (req,res) => {
    const consultation = await getConsultation(req.params.session_id || req.params.consultation_id);
    const [docs,vitals,summary] = await Promise.all([
        pool.query('SELECT * FROM uploaded_documents WHERE consultation_id=$1 ORDER BY created_at DESC',[consultation.id]),
        pool.query('SELECT * FROM vitals WHERE consultation_id=$1',[consultation.id]),
        pool.query('SELECT * FROM clinical_summaries WHERE consultation_id=$1',[consultation.id])
    ]);
    return res.json(new ApiResponse(200,{consultation,documents:docs.rows,vitals:vitals.rows[0]||null,summary:summary.rows[0]||null},'Session state loaded'));
});

export const updateSessionLanguage = asyncHandler(async(req,res)=>{
    const { language }=req.body;
    if(!language) throw new ApiError(400,'language is required');
    const consultation=await getConsultation(req.params.session_id);
    const ai=await AiServiceGateway.updateLanguage(consultation.ai_session_id,language);
    const result=await pool.query('UPDATE consultations SET language=$1,updated_at=NOW() WHERE id=$2 RETURNING *',[language,consultation.id]);
    return res.json(new ApiResponse(200,{consultation:result.rows[0],ai},'Language updated'));
});

export const updateConsultationRouting = asyncHandler(async (req, res) => {
    const c = await getConsultation(req.params.session_id);
    const { departmentId, doctorId } = req.body || {};
    if (!departmentId) throw new ApiError(400, 'departmentId is required');

    const department = await pool.query(
        `SELECT id, name, pathway, hospital_id FROM departments
         WHERE id=$1 AND is_active=TRUE LIMIT 1`,
        [departmentId]
    );
    if (!department.rowCount) throw new ApiError(404, 'Department not found or inactive');
    if (String(department.rows[0].hospital_id) !== String(c.hospital_id)) {
        throw new ApiError(400, 'Department does not belong to the consultation hospital');
    }

    let doctor = null;
    if (doctorId) {
        const doctorResult = await pool.query(
            `SELECT u.id,u.name,u.specialization,u.hospital_id
             FROM users u
             WHERE u.id=$1 AND u.role='doctor' AND u.is_active=TRUE
             LIMIT 1`,
            [doctorId]
        );
        if (!doctorResult.rowCount) throw new ApiError(404, 'Doctor not found or inactive');
        if (String(doctorResult.rows[0].hospital_id) !== String(c.hospital_id)) {
            throw new ApiError(400, 'Doctor does not belong to the consultation hospital');
        }
        doctor = doctorResult.rows[0];
    }

    const updated = await pool.query(
        `UPDATE consultations
         SET department_id=$1, assigned_doctor_id=$2, updated_at=NOW()
         WHERE id=$3 RETURNING *`,
        [departmentId, doctorId || null, c.id]
    );

    await pool.query(
        `INSERT INTO audit_events (consultation_id, actor_type, event_type, metadata)
         VALUES ($1,'patient','routing_selected',$2)`,
        [c.id, JSON.stringify({
            department_id: departmentId,
            department_name: department.rows[0].name,
            doctor_id: doctor?.id || null,
            doctor_name: doctor?.name || null
        })]
    );

    return res.json(new ApiResponse(200, {
        consultation: updated.rows[0],
        department: department.rows[0],
        doctor
    }, 'Department and doctor routing saved'));
});

export const startDialogue = asyncHandler(async(req,res)=>{
    const c=await getConsultation(req.params.session_id);
    const result=await AiServiceGateway.startConversation(c.ai_session_id,c.intake_pathway);
    return res.json(new ApiResponse(200,result,'AI conversation started'));
});

export const getDialogueState = asyncHandler(async(req,res)=>{
    const c=await getConsultation(req.params.session_id);
    return res.json(new ApiResponse(200,await AiServiceGateway.getConversationState(c.ai_session_id),'AI conversation state loaded'));
});

export const answerDialogue = asyncHandler(async(req,res)=>{
    const c=await getConsultation(req.params.session_id);
    const {question_id,answer,input_mode='text',confidence=1}=req.body;
    if(!question_id || answer === undefined) throw new ApiError(400,'question_id and answer are required');
    const result=await AiServiceGateway.submitConversationAnswer(c.ai_session_id,question_id,String(answer),input_mode,confidence);
    const flags=result.red_flags || [];
    if(flags.length) await pool.query(`UPDATE consultations SET risk_level='high_risk',updated_at=NOW() WHERE id=$1`,[c.id]);
    await pool.query(`UPDATE consultations SET updated_at=NOW() WHERE id=$1`,[c.id]);
    return res.json(new ApiResponse(200,result,'Answer recorded'));
});

export const speechDialogue = asyncHandler(async(req,res)=>{
    const c=await getConsultation(req.params.session_id);
    const {question_id,language=c.language||'en'}=req.query;
    if(!question_id || !req.body?.length) throw new ApiError(400,'Audio body and question_id are required');
    const result=await AiServiceGateway.submitSpeech(c.ai_session_id,question_id,language,req.body,req.headers['content-type']||'audio/wav');
    if((result.red_flags||[]).length) await pool.query(`UPDATE consultations SET risk_level='high_risk',updated_at=NOW() WHERE id=$1`,[c.id]);
    return res.json(new ApiResponse(200,result,'Speech answer processed'));
});

export const ttsDialogue = asyncHandler(async(req,res)=>{
    const c=await getConsultation(req.params.session_id);
    const {text,language=c.language||'en'}=req.query;
    if(!text) throw new ApiError(400,'text is required');
    const result=await AiServiceGateway.tts(c.ai_session_id,text,language);
    return res.json(new ApiResponse(200,result,'TTS generated'));
});

export const saveVitals = asyncHandler(async(req,res)=>{
    const c=await getConsultation(req.params.session_id);
    const {systolic,diastolic,pulse,temperature,spo2,source='manual'}=req.body;
    const result=await pool.query(`INSERT INTO vitals(consultation_id,systolic,diastolic,pulse,temperature,spo2,source) VALUES($1,$2,$3,$4,$5,$6,$7) ON CONFLICT(consultation_id) DO UPDATE SET systolic=$2,diastolic=$3,pulse=$4,temperature=$5,spo2=$6,source=$7,recorded_at=NOW() RETURNING *`,[c.id,systolic||null,diastolic||null,pulse||null,temperature||null,spo2||null,source]);
    await pool.query('UPDATE consultations SET updated_at=NOW() WHERE id=$1',[c.id]);
    return res.status(201).json(new ApiResponse(201,result.rows[0],'Vitals saved'));
});

export const listDepartments = asyncHandler(async(req,res)=>{
    const hospitalId=req.query.hospital_id || DEFAULT_HOSPITAL();
    if(!hospitalId) throw new ApiError(400,'hospital_id is required');
    const params=[hospitalId]; let sql='SELECT id,name,pathway,is_active FROM departments WHERE hospital_id=$1 AND is_active=TRUE';
    if(req.query.pathway){sql+=' AND pathway=$2';params.push(pathway(req.query.pathway));}
    sql+=' ORDER BY name';
    const result=await pool.query(sql,params); return res.json(new ApiResponse(200,result.rows,'Departments loaded'));
});

export const listDepartmentDoctors = asyncHandler(async(req,res)=>{
    const result=await pool.query(`SELECT u.id,u.name,u.email,u.specialization,u.is_active FROM users u JOIN departments d ON d.hospital_id=u.hospital_id WHERE d.id=$1 AND u.role='doctor' AND u.is_active=TRUE ORDER BY u.name`,[req.params.department_id]);
    return res.json(new ApiResponse(200,result.rows,'Doctors loaded'));
});

export const generateSummary = asyncHandler(async(req,res)=>{
    const c=await getConsultation(req.params.session_id);
    const {language=c.language||'en',include_documents=true,include_ayush=c.intake_pathway==='ayurveda'}=req.body||{};
    const result=await AiServiceGateway.generateSummary(c.ai_session_id,language,include_documents,include_ayush);
    await pool.query(`INSERT INTO clinical_summaries(consultation_id,chief_complaint,history_of_present_illness,ayush_attributes,ai_payload) VALUES($1,$2,$3,$4,$5) ON CONFLICT(consultation_id) DO UPDATE SET chief_complaint=EXCLUDED.chief_complaint,history_of_present_illness=EXCLUDED.history_of_present_illness,ayush_attributes=EXCLUDED.ayush_attributes,ai_payload=EXCLUDED.ai_payload,updated_at=NOW(),generated_at=NOW()`,[c.id,result?.sections?.find(s=>/complaint/i.test(s.heading_en||''))?.body||null,result?.sections?.find(s=>/history/i.test(s.heading_en||''))?.body||null,JSON.stringify(c.intake_pathway==='ayurveda'?{pathway:'ayurveda'}:{}),JSON.stringify(result)]);
    return res.json(new ApiResponse(200,result,'AI summary generated'));
});

export const getSummary = asyncHandler(async(req,res)=>{const c=await getConsultation(req.params.session_id); const ai=await AiServiceGateway.getSummary(c.ai_session_id); const local=await pool.query('SELECT * FROM clinical_summaries WHERE consultation_id=$1',[c.id]); return res.json(new ApiResponse(200,{ai_summary:ai,stored_summary:local.rows[0]||null},'Summary loaded'));});

export const grantConsent = asyncHandler(async(req,res)=>{const c=await getConsultation(req.params.session_id); const scopes=req.body||{}; const scopeMap={clinical_intake:'Clinical Intake',document_processing:'Document Processing',his_abdm_sharing:'ABDM/HIS Sharing'}; if(c.ai_session_id) await AiServiceGateway.grantConsent(c.ai_session_id,scopes); const client=await pool.connect(); try{await client.query('BEGIN'); for(const [scopeId,title] of Object.entries(scopeMap)){if(scopes[scopeId]===true){await client.query(`INSERT INTO consent_records(consultation_id,scope_id,title,purpose,required,status) VALUES($1,$2,$3,$4,$5,'granted')`,[c.id,scopeId,title,`AyushCare ${title.toLowerCase()}`,scopeId==='clinical_intake']);}} await client.query('UPDATE patients SET consent_granted=TRUE,consent_timestamp=NOW() WHERE id=(SELECT patient_id FROM consultations WHERE id=$1)',[c.id]); await audit(client,c.id,'consent_granted',scopes); await client.query('COMMIT'); }catch(e){await client.query('ROLLBACK');throw e;}finally{client.release();} const scopesResult=await pool.query('SELECT * FROM consent_records WHERE consultation_id=$1 ORDER BY granted_at DESC',[c.id]); return res.json(new ApiResponse(200,scopesResult.rows,'Consent recorded'));});

export const getConsent = asyncHandler(async(req,res)=>{const c=await getConsultation(req.params.session_id); const scopes=await pool.query('SELECT * FROM consent_records WHERE consultation_id=$1 ORDER BY granted_at',[c.id]); return res.json(new ApiResponse(200,scopes.rows,'Consent loaded'));});

export const generateToken = asyncHandler(async(req,res)=>{const c=await getConsultation(req.params.session_id); const patientResult=await pool.query('SELECT id,patient_code,full_name,gender,date_of_birth,mobile_number,address FROM patients WHERE id=$1',[c.patient_id]); const patient=patientResult.rows[0]||null; if(c.token_number) return res.json(new ApiResponse(200,{token_number:c.token_number,status:c.status,consultation_id:c.id,patient},'Token already assigned'));
    const client=await pool.connect(); try{
        await client.query('BEGIN');
        const lock=await client.query('SELECT * FROM consultations WHERE id=$1 FOR UPDATE',[c.id]); const current=lock.rows[0]; if(current.token_number){await client.query('COMMIT');return res.json(new ApiResponse(200,{token_number:current.token_number,status:current.status},'Token already assigned'));} const prefix=c.intake_pathway==='ayurveda'?'AY':'AL';
    await client.query(`SELECT pg_advisory_xact_lock(hashtext($1))`, [`token:${c.hospital_id}:${c.intake_pathway}:${new Date().toISOString().slice(0,10)}`]);
    const count=await client.query(`SELECT COUNT(*)::int AS n FROM consultations WHERE hospital_id=$1 AND intake_pathway=$2 AND DATE(created_at)=CURRENT_DATE`,[c.hospital_id,c.intake_pathway]); const token=`${prefix}-${String(count.rows[0].n+1).padStart(3,'0')}`; const updated=await client.query(`UPDATE consultations SET token_number=$1,status='in_queue',updated_at=NOW() WHERE id=$2 RETURNING *`,[token,c.id]); await audit(client,c.id,'token_generated',{token_number:token}); await client.query('COMMIT'); return res.status(201).json(new ApiResponse(201,{token_number:token,status:updated.rows[0].status,consultation_id:c.id,intake_pathway:c.intake_pathway,patient},'Queue token generated'));}catch(e){await client.query('ROLLBACK');throw e;}finally{client.release();}});

export const completeSession = asyncHandler(async(req,res)=>{const c=await getConsultation(req.params.session_id); await pool.query(`UPDATE consultations SET status='in_queue',updated_at=NOW() WHERE id=$1`,[c.id]); await pool.query('UPDATE kiosk_sessions SET is_active=FALSE WHERE consultation_id=$1',[c.id]); return res.json(new ApiResponse(200,{consultation_id:c.id,status:'in_queue',token_number:c.token_number},'Kiosk intake completed'))});

export const cancelSession = asyncHandler(async(req,res)=>{const c=await getConsultation(req.params.session_id); await pool.query(`UPDATE consultations SET status='cancelled',updated_at=NOW() WHERE id=$1`,[c.id]); await pool.query('UPDATE kiosk_sessions SET is_active=FALSE WHERE consultation_id=$1',[c.id]); return res.json(new ApiResponse(200,{consultation_id:c.id,status:'cancelled'},'Kiosk session cancelled'))});


export const deleteAiSession = asyncHandler(async(req,res)=>{ const c=await getConsultation(req.params.session_id); if(c.ai_session_id) await AiServiceGateway.deleteSession(c.ai_session_id); await pool.query(`UPDATE consultations SET status='cancelled',updated_at=NOW() WHERE id=$1`,[c.id]); await pool.query('UPDATE kiosk_sessions SET is_active=FALSE WHERE consultation_id=$1',[c.id]); return res.json(new ApiResponse(200,{},'AI session deleted and consultation cancelled')); });
export const listAiDocuments = asyncHandler(async(req,res)=>{ const c=await getConsultation(req.params.session_id); return res.json(new ApiResponse(200,await AiServiceGateway.listDocuments(c.ai_session_id),'AI documents loaded')); });
export const verifyAiDocumentEntity = asyncHandler(async(req,res)=>{ const c=await getConsultation(req.params.session_id); return res.json(new ApiResponse(200,await AiServiceGateway.verifyDocumentEntity(c.ai_session_id,req.params.document_id,req.params.entity_id,req.query.status||'verified'),'Document entity verification updated')); });
export const editSummarySection = asyncHandler(async(req,res)=>{ const c=await getConsultation(req.params.session_id); const {edited_body,edit_reason}=req.body; if(!edited_body||!edit_reason) throw new ApiError(400,'edited_body and edit_reason are required'); return res.json(new ApiResponse(200,await AiServiceGateway.editSummarySection(c.ai_session_id,req.params.section_id,edited_body,edit_reason),'Summary section updated')); });
export const getConsentReceipt = asyncHandler(async(req,res)=>{ const c=await getConsultation(req.params.session_id); return res.json(new ApiResponse(200,await AiServiceGateway.getConsentReceipt(c.ai_session_id),'Consent receipt loaded')); });
export const withdrawConsent = asyncHandler(async(req,res)=>{ const c=await getConsultation(req.params.session_id); const {scope_id}=req.body; if(!scope_id) throw new ApiError(400,'scope_id is required'); return res.json(new ApiResponse(200,await AiServiceGateway.withdrawConsent(c.ai_session_id,scope_id),'Consent withdrawn')); });
export const getConsentScopes = asyncHandler(async(req,res)=>{ const c=await getConsultation(req.params.session_id); return res.json(new ApiResponse(200,await AiServiceGateway.getConsentScopes(c.ai_session_id),'Consent scopes loaded')); });

export const fhirPreview = asyncHandler(async(req,res)=>{const c=await getConsultation(req.params.session_id); return res.json(new ApiResponse(200,await AiServiceGateway.fhirPreview(c.ai_session_id),'FHIR preview loaded'));});
