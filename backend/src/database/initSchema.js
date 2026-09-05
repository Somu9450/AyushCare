import pool from './dbConnection.js';

export const initializeSchema = async () => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        await client.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
                    CREATE TYPE user_role AS ENUM ('hospital_admin', 'doctor');
                END IF;
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'consultation_status') THEN
                    CREATE TYPE consultation_status AS ENUM ('waiting_triage', 'in_queue', 'call', 'hold', 'complete');
                END IF;
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'risk_level') THEN
                    CREATE TYPE risk_level AS ENUM ('routine', 'high_risk');
                END IF;
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'document_status') THEN
                    CREATE TYPE document_status AS ENUM ('pending', 'processing', 'completed', 'failed');
                END IF;
            END;
            $$;
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS hospitals (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(255) NOT NULL,
                state_code VARCHAR(10) NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                role user_role NOT NULL,
                specialization VARCHAR(100),
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS patients (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                abha_number VARCHAR(17) UNIQUE,
                abha_address VARCHAR(100) UNIQUE,
                full_name VARCHAR(255) NOT NULL,
                gender VARCHAR(10) NOT NULL,
                date_of_birth DATE NOT NULL,
                mobile_number VARCHAR(15),
                consent_granted BOOLEAN DEFAULT FALSE,
                consent_timestamp TIMESTAMP WITH TIME ZONE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS consultations (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
                patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
                assigned_doctor_id UUID REFERENCES users(id) ON DELETE SET NULL,
                token_number VARCHAR(20) NOT NULL,
                status consultation_status DEFAULT 'waiting_triage',
                risk_level risk_level DEFAULT 'routine',
                remarks TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS clinical_summaries (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                consultation_id UUID REFERENCES consultations(id) ON DELETE CASCADE,
                chief_complaint TEXT NOT NULL,
                history_of_present_illness TEXT,
                past_medical_history JSONB,
                drug_allergies JSONB,
                ayush_attributes JSONB,
                generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS uploaded_documents (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                consultation_id UUID REFERENCES consultations(id) ON DELETE CASCADE,
                file_path_hash VARCHAR(512) NOT NULL,
                document_type VARCHAR(100),
                extracted_data JSONB,
                status document_status DEFAULT 'pending',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS kiosk_sessions (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                pairing_token VARCHAR(255) UNIQUE NOT NULL,
                kiosk_id VARCHAR(100) NOT NULL,
                consultation_id UUID REFERENCES consultations(id) ON DELETE CASCADE,
                is_active BOOLEAN DEFAULT TRUE,
                expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS privacy_settings (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
                isolate_past_history BOOLEAN DEFAULT FALSE,
                consent_voice_processing BOOLEAN DEFAULT TRUE,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error initializing advanced schemas:', error);
        throw error;
    } finally {
        client.release();
    }
};