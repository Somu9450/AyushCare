# AyushCare / MediKiosk — Orchestration & State Backend

This is the primary orchestration, database state-holder, and security gateway backend for the **AyushCare / MediKiosk** clinical history-taking platform [1]. 

Built with Node.js and Express, this service manages transactional database states (PostgreSQL on Neon), patient identity verification, S3 presigned upload generation, and DPDPA-compliant data-sharing locks [2, 4]. It serves as the core broker to coordinate operations with your team's dedicated **FastAPI AI microservice** [1, 2, 4].

---

## 1. System Architecture

```
                       +-------------------------+
                       |   Kiosk / Mobile Web    |
                       +-------------------------+
                                    |
                                    v
                       +-------------------------+
                       |   Express Gateway       |
                       |   (This Service)        |
                       +-------------------------+
                         /          |          \
                        /           |           \
                       v            v            v
           +--------------+  +-------------+  +--------------------+
           |  PostgreSQL  |  |   S3 Standard|  | FastAPI AI Backend |
           |  (Neon RDBMS)|  | (1-Day Life)|  | (OCR/LLM Engine)   |
           +--------------+  +-------------+  +--------------------+
```

*   **Express Gateway (Orchestration):** Holds the transactional state of the patient queue, logins, and patient profiles [3].
*   **PostgreSQL (Neon):** Houses relational metadata (hospitals, doctors, consultations, and document registries).
*   **FastAPI AI Backend:** Consumes raw file buffers and dialogue text to return structured OCR medical entities, dialogue trees, and clinical summaries [1, 2, 4].

---

## 2. Directory Structure

```
backend/
├── src/
│   ├── controllers/
│   ├── database/
│   ├── middleware/
│   ├── routes/
│   ├── services/
│   ├── utilities/
│   ├── app.js
│   └── index.js
├── .env
├── .gitignore
└── package.json
```

---

## 3. Technology Stack

*   **Runtime Engine:** Node.js (ES Modules, `"type": "module"` enabled)
*   **Web Framework:** Express
*   **Database Client:** `pg` (PostgreSQL Connection Pooling to Neon)
*   **Storage Access:** `@aws-sdk/client-s3` (S3 Put/Get file streaming) [4]
*   **SMS Gateway:** Twilio / Custom mock console fallbacks
*   **Cryptographic Libraries:** `bcryptjs` (password hashing) and `jsonwebtoken` (session handling)

---

## 4. API Reference Map

All endpoints are mounted under the base path `/api/v1`.

### 4.1 Admin Endpoints (`/admin`)
*   `GET /doctors` - Lists registered doctors assigned to the admin's hospital.
*   `GET /analytics/visits` - Displays kiosk throughput metrics.
*   `POST /queue/override` - Modifies patient queue status manually.

### 4.2 Doctor Endpoints (`/doctor`)
*   `GET /queue` - Retrieves the active patient queue, ordered by triage risk.
*   `GET /patients/:id/summary` - Loads the AI-generated history summary [3, 4].
*   `GET /patients/:id/reports` - Compiles the chronological timeline of past uploaded files [3, 4].
*   `PATCH /consultations/:id/status` - Switches token statuses (`call`, `hold`, `complete`).
*   `POST /consultations/:id/sign-off` - Finalizes clinical remarks and saves the encounter.

### 4.3 Kiosk Intake Endpoints (`/intake`)
*   `POST /auth/abha` - Registers ABDM ABHA ID profile records locally [4].
*   `POST /dialogue/next` - Evaluates patient input and returns the next adaptive diagnostic question [3].

### 4.4 Mobile Companion Endpoints (`/mobile`)
*   `GET /kiosk-session/pair/:pairing_token` - Handshakes a kiosk QR code with the mobile client.
*   `POST /kiosk-session/:session_id/upload-url` - Returns an S3 presigned PUT URL for direct camera upload [4].
*   `POST /kiosk-session/:session_id/register-document` - Registers the file key and triggers background OCR extraction.
*   `POST /portal/auth/send-otp` - Sends a verification SMS OTP to verify patient portals.
*   `POST /portal/auth/verify-otp` - Validates OTP to generate authenticated patient JWTs.
*   `GET /portal/dashboard` - Fetches active portal data, appointments, and general health summaries.
*   `GET /portal/privacy-settings` & `PATCH /portal/privacy-settings` - Retrieves and saves DPDP-compliant settings (including the history isolation toggle) [4].

---

## 5. Privacy, Security, & DPDP Compliance

*   **History Isolation (`isolate_past_history`):** Fully integrated into patient portal settings. When enabled, database queries block historical medical records from doctor visibility, complying with the Digital Personal Data Protection (DPDP) Act 2023 [4].
*   **Dual JWT Authentication:** Separates Patient validation from Doctor/Staff validation to prevent cross-account JWT compromise.
*   **Ephemeral S3 Lifecycles:** The backend coordinates S3 storage parameters using standard S3 lifecycles to automatically purge raw temporary camera-captured files after 24 hours, keeping data storage minimized [4].