import { ApiResponse } from '../utilities/ApiResponse.js';
import { asyncHandler } from '../utilities/asyncHandler.js';
import { ApiError } from '../utilities/ApiError.js';
import pool from '../database/dbConnection.js';


import AiServiceGateway from '../services/aiService.js';


export const performAbhaRegister = asyncHandler(async (req, res) => {
    const { abhaNumber, fullName, gender, dob, mobileNumber, consent, tokenNumber, hospitalId } = req.body;

    if (!abhaNumber || !fullName || !gender || !dob) {
        throw new ApiError(400, "ABHA registration requires abhaNumber, fullName, gender, and dob.");
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        let resolvedHospitalId = hospitalId;
        if (!resolvedHospitalId) {
            const hospitalQuery = await client.query('SELECT id FROM hospitals LIMIT 1');
            if (hospitalQuery.rowCount > 0) {
                resolvedHospitalId = hospitalQuery.rows[0].id;
            } else {
                throw new ApiError(
                    500,
                    "No registered hospitals found in the database. Please register a hospital first."
                );
            }
        }

        const patientQuery = await client.query(
            `INSERT INTO patients (abha_number, full_name, gender, date_of_birth, mobile_number, consent_granted, consent_timestamp)
             VALUES ($1, $2, $3, $4, $5, $6, NOW()) 
             ON CONFLICT (abha_number) DO UPDATE SET consent_granted = $6, consent_timestamp = NOW()
             RETURNING id, full_name`,
            [abhaNumber, fullName, gender, dob, mobileNumber, consent || true]
        );
        const patient = patientQuery.rows[0];

        const assignedToken = tokenNumber || `T-${Math.floor(100 + Math.random() * 900)}`;
        const consultationQuery = await client.query(
            `INSERT INTO consultations (hospital_id, patient_id, token_number, status)
             VALUES ($1, $2, $3, 'waiting_triage') RETURNING id, token_number, status`,
            [resolvedHospitalId, patient.id, assignedToken]
        );
        const consultation = consultationQuery.rows[0];

        const pairingToken = Math.random().toString(36).substr(2, 6).toUpperCase(); 
        const sessionExpiry = new Date(Date.now() + 15 * 60 * 1000); 

        const sessionQuery = await client.query(
            `INSERT INTO kiosk_sessions (pairing_token, kiosk_id, consultation_id, expires_at)
             VALUES ($1, 'KIOSK-MAIN-01', $2, $3) RETURNING id, pairing_token`,
            [pairingToken, consultation.id, sessionExpiry]
        );
        const kioskSession = sessionQuery.rows[0];

        await AiServiceGateway.createSession(consultation.id);

        await client.query('COMMIT');

        return res.status(201).json(
            new ApiResponse(
                201,
                {
                    patient,
                    consultation_id: consultation.id,
                    token_number: consultation.token_number,
                    pairing_session: kioskSession
                },
                "Patient verified, queue token assigned, and AI session initialized."
            )
        );
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
});


export const nextDialogue = asyncHandler(async (req, res) => {
    const { consultationId, answerText } = req.body;

    if (!consultationId) {
        throw new ApiError(400, "consultationId is required to progress dialogue");
    }

    if (answerText && answerText.trim() !== "") {
        await AiServiceGateway.submitConversationAnswer(consultationId, answerText);
    }

    const state = await AiServiceGateway.getConversationState(consultationId);

    return res.status(200).json(
        new ApiResponse(200, state, "Next diagnostic question generated successfully")
    );
});


export const uploadIntakeDoc = asyncHandler(async (req, res) => {
    throw new ApiError(501, "Direct kiosk upload is obsolete. Use Flow A mobile direct uploads.");
});