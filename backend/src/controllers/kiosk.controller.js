import { ApiResponse } from '../utilities/ApiResponse.js';
import { asyncHandler } from '../utilities/asyncHandler.js';
import pool from '../database/dbConnection.js';

export const performAbhaRegister = asyncHandler(async (req, res) => {
    const { abhaNumber, fullName, gender, dob, mobileNumber, consent } = req.body;

    // ABDM registration gateway bridge mock/real integration
    const patientQuery = await pool.query(
        `INSERT INTO patients (abha_number, full_name, gender, date_of_birth, mobile_number, consent_granted, consent_timestamp)
         VALUES ($1, $2, $3, $4, $5, $6, NOW()) 
         ON CONFLICT (abha_number) DO UPDATE SET consent_granted = $6, consent_timestamp = NOW()
         RETURNING id, full_name`,
        [abhaNumber, fullName, gender, dob, mobileNumber, consent]
    );

    return res.status(201).json(new ApiResponse(201, patientQuery.rows[0], "Patient verified & registered under ABDM"));
});

export const nextDialogue = asyncHandler(async (req, res) => {
    // Dynamic Bhashini ASR/Dialogue branching simulation
    const nextQuestion = { question_id: "q_chest_pain_02", text: "Does the chest pain radiate to your left shoulder?" };
    return res.status(200).json(new ApiResponse(200, nextQuestion, "Next diagnostic question generated"));
});

export const uploadIntakeDoc = asyncHandler(async (req, res) => {
    // Mock direct physical document capture ingestion pipeline
    const documentMeta = { status: "queued", ocr_job_id: "ocr_job_7716" };
    return res.status(202).json(new ApiResponse(202, documentMeta, "Scan payload queued for asynchronous processing"));
});