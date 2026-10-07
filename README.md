<div align="center">

![AyushCare](./AyushCareKiosk/public/ayushCareLogo.png)

![Smart India Hackathon 2026](./AyushCareKiosk/public/sih-2026-dark.png)

<br>

# AyushCare MediKiosk

**AI-assisted multilingual patient intake and clinical handoff**<br>
*From registration and triage to documents, vitals, queueing, and physician review*

<br>

[![Kiosk](https://img.shields.io/badge/patient-kiosk-00796B?style=flat-square)](AyushCareKiosk/)
[![AI](https://img.shields.io/badge/AI-FastAPI-415861?style=flat-square)](AyushCareAI/)
[![Backend](https://img.shields.io/badge/API-Express.js-149447?style=flat-square)](AyushCareBackend/)
[![Mobile](https://img.shields.io/badge/mobile-QR%20portal-F48C22?style=flat-square)](AyushCareMobile/)
[![Panel](https://img.shields.io/badge/clinical-panel-Next.js-415861?style=flat-square)](HNDPANEL/)

</div>

<br>

> **A better first five minutes of care.** AyushCare turns a patient’s arrival into a structured,
> multilingual clinical intake that can be reviewed by the right doctor with less repetition and
> less paperwork.

AyushCare is a connected healthcare platform for hospitals and clinics. A patient can begin at a
physical kiosk, continue on a phone through a QR handoff, and arrive in a doctor workspace with
structured history, vitals, documents, consent, risk signals, and queue context.

## Why it matters

The front desk is often where clinical information gets fragmented. Patients repeat the same story,
reports stay in paper folders, and doctors spend valuable consultation time reconstructing context.
AyushCare moves that work earlier in the journey while keeping clinical decisions with the physician.

| Before the consultation | AyushCare workflow |
| --- | --- |
| Repeated registration questions | Guided, stateful patient intake |
| Paper prescriptions and reports | QR-assisted phone upload and document processing |
| Unstructured patient history | AI-assisted clinical summary with source context |
| Unclear department routing | Department, pathway, doctor, and token flow |
| Language and accessibility barriers | Multilingual UI plus voice input and narration |
| Uncontrolled record sharing | Granular consent and patient privacy controls |

## What it does

- **Guided patient intake** — identity, consent, language, department, pathway, symptoms, and history.
- **AI clinical interview** — adaptive SOCRATES-style questioning with text and speech input.
- **Safety-first triage** — deterministic red-flag rules, compound pattern detection, and escalation signals.
- **Document intelligence** — upload prescriptions, laboratory reports, and medical documents for OCR and structured extraction.
- **Clinical summary generation** — physician-ready sections with patient-reported and document-derived context.
- **Vitals and queue management** — kiosk measurements, OPD tokens, consultation status, and doctor assignment.
- **QR continuity** — pair a kiosk session with a mobile portal so patients can upload documents from their own phone.
- **Privacy and consent** — DPDPA-oriented consent receipts, privacy settings, scoped sharing rules, and audit events.
- **Clinician workspace** — doctor queue, patient summary, reports, vitals, notes, and consultation sign-off.

## Patient journey

```mermaid
flowchart LR
  A[Patient arrives] --> B[Choose language]
  B --> C[Identity and consent]
  C --> D[Department and doctor routing]
  D --> E[AI clinical interview]
  E --> F[Vitals and red-flag checks]
  F --> G[Upload documents by QR]
  G --> H[Generate clinical summary]
  H --> I[Token and queue]
  I --> J[Doctor review and sign-off]
```

## System architecture

```mermaid
flowchart TD
  Kiosk[AyushCare Kiosk<br/>React + Vite] --> API[AyushCare Backend<br/>Node.js + Express]
  Mobile[Patient Mobile Portal<br/>React + Vite] --> API
  Panel[Doctor and Admin Panel<br/>Next.js + TypeScript] --> API
  API --> DB[(PostgreSQL / Neon)]
  API --> S3[(S3-compatible document storage)]
  API --> AI[AyushCare AI<br/>FastAPI]
  AI --> Providers[LLM / ASR / TTS / OCR / Translation providers]
  AI --> AIDB[(AI session store)]
```

The core API owns identity, consultations, routing, queue state, document registration, consent,
privacy, and portal access. The Python service owns the clinical conversation, document intelligence,
summary generation, safety checks, and FHIR preview. Frontends remain presentation and workflow clients.

## AI and clinical safety

The AI layer is assistive by design. It does **not** diagnose, prescribe, or replace clinical judgement.

| Capability | Implementation |
| --- | --- |
| Clinical interview | Adaptive history collection following SOCRATES-style questioning |
| Speech | Server-side ASR and TTS integration with multilingual support |
| Document processing | OCR, medical entity extraction, abnormal-value flagging, and image quality checks |
| Safety | Deterministic red-flag rules plus LLM-assisted compound pattern detection |
| Summary | Structured clinical summary with clinician accept, reject, and edit workflow |
| Interoperability | FHIR R4 bundle preview |
| Governance | Consent receipts, audit logging, privacy settings, and scoped access rules |

## Product surfaces

### Patient kiosk

![AyushCare kiosk](./AyushCareKiosk/public/KioskScreenBg.png)

Guided intake, language selection, consent, health interview, vitals, and queue registration.

### Mobile portal

![AyushCare mobile portal](./AyushCareMobile/src/assets/hero.png)

QR-linked document upload, visits, appointments, records, vitals, and privacy controls.

### Clinical workspace

![AyushCare clinical workspace](./HNDPANEL/public/KioskScreenBg.png)

Doctor queue, patient summary, reports, consultation status, and sign-off workflows.

The repository also contains the full interface screens shown in the product walkthrough: welcome,
language selection, health interview, document upload, patient visits, vitals, privacy controls, and
doctor/admin operations. The supplied application screenshots represent these flows across desktop,
kiosk, and mobile layouts.

## Repository structure

```text
Medikiosk/
├── AyushCareAI/              # FastAPI clinical AI service and tests
├── AyushCareBackend/         # Express API, PostgreSQL access, auth, queue, QR, and storage
├── AyushCareKiosk/           # React/Vite patient kiosk experience
├── AyushCareMobile/          # React/Vite mobile portal and document flow
├── HNDPANEL/                 # Next.js doctor and hospital admin panel
├── MEDIKIOSK_CURRENT_STATE_AUDIT.md
└── MEDIKIOSK_CURRENT_STATE_AUDIT.json
```

## Core data model

```mermaid
erDiagram
  PATIENTS ||--o{ CONSULTATIONS : has
  HOSPITALS ||--o{ DEPARTMENTS : contains
  CONSULTATIONS ||--o| CLINICAL_SUMMARIES : produces
  CONSULTATIONS ||--o| VITALS : records
  CONSULTATIONS ||--o{ UPLOADED_DOCUMENTS : contains
  CONSULTATIONS ||--o{ CONSENT_RECORDS : requires
  PATIENTS ||--o| PRIVACY_SETTINGS : controls
  PATIENTS ||--o{ PATIENT_PRIVACY_RULES : defines
  CONSULTATIONS ||--o| KIOSK_SESSIONS : pairs
  PATIENTS ||--o{ PATIENT_QR_TOKENS : receives
```

The backend uses PostgreSQL with UUID-based internal identities and unique ABHA identifiers. The AI
service has its own session and audit persistence boundary, with Redis support and an in-memory fallback
for development. Documents are stored through an S3-compatible object-storage integration.

## Technology stack

| Layer | Technology |
| --- | --- |
| Patient kiosk | React, Vite, Zustand, Axios, Lucide |
| Mobile portal | React, Vite, React Router, React Hook Form, Zod, Zustand |
| Doctor/admin panel | Next.js App Router, React, TypeScript, Tailwind CSS |
| Core backend | Node.js, Express, PostgreSQL, JWT, AWS S3 SDK |
| AI service | Python, FastAPI, Pydantic, SQLAlchemy, Redis |
| AI integrations | Gemini, Groq, Bhashini, Azure Document Intelligence, Azure Language, Tesseract |
| Testing | Pytest safety and service suites, frontend lint/build scripts |

## Current implementation status

The repository contains an end-to-end working prototype spanning five applications:

- 10 kiosk screens and a multilingual patient intake flow.
- 23 mobile/portal screens covering home, visits, appointments, records, privacy, and QR connection.
- Doctor queue and clinical workspace with summary, reports, vitals, and sign-off paths.
- AI tests covering conversation, clinical summaries, document intelligence, FHIR, red flags, and safety.
- Backend routes for auth, intake, mobile portal, language, documents, consent, privacy, routing, and queueing.

Some infrastructure capabilities remain environment-dependent. For example, production credentials,
PostgreSQL, object storage, provider APIs, and SMS configuration must be supplied separately. The audit
file is the source of truth for the current implementation boundaries and known gaps.

## Run locally

### Prerequisites

- Python 3.10+
- Node.js and npm
- PostgreSQL for the core backend
- Redis is recommended for the AI service
- Provider credentials configured in server-side `.env` files

### Start the AI service

```bash
cd AyushCareAI
python -m venv .venv
.venv\Scripts\activate        # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```

Run the AI tests:

```bash
pytest tests/ -v
```

### Start the core backend

```bash
cd AyushCareBackend
npm install
npm run dev                    # port 8000
```

### Start the patient applications

```bash
cd AyushCareKiosk
npm install
npm run dev                    # Vite, normally port 5173
```

```bash
cd AyushCareMobile
npm install
npm run dev                    # Vite, normally port 5174
```

### Start the doctor/admin panel

```bash
cd HNDPANEL
npm install
npm run dev                    # Next.js, normally port 3000
```

Each service should be configured with the API URL expected by its local environment. Keep database,
AI, storage, SMS, and authentication secrets on the server and never commit `.env` files.

## Documentation

- [Current state audit](MEDIKIOSK_CURRENT_STATE_AUDIT.md) — architecture, routes, database, privacy, and integration findings.
- [AI service README](AyushCareAI/README.md) — AI endpoints, providers, safety modules, and test commands.
- [Backend README](AyushCareBackend/README.md) — core API setup and integration notes.
- [Kiosk README](AyushCareKiosk/README.md) — kiosk workflow and frontend setup.
- [Mobile README](AyushCareMobile/README.md) — patient portal and QR upload flow.
- [Doctor panel README](HNDPANEL/README.md) — clinician and admin application setup.

## Safety and privacy note

AyushCare is a clinical intake and decision-support prototype. AI output must be reviewed by qualified
clinical staff before it is used in care. Deployments must complete their own security, privacy,
clinical-safety, consent, and regulatory review before handling real patient data.

## Licence

See the package and project metadata in each module for the applicable licensing terms before public
deployment or distribution.
