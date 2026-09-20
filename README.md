# AyushCare - AI MediKiosk

A smart healthcare intake and digital triage platform built to reduce patient wait time, improve documentation quality, and bring AI-assisted clinical workflows to public and private healthcare environments.

## Problem we are solving

Healthcare systems in many hospitals still rely on slow, manual intake processes:

- long queues and waiting times at registration counters
- repetitive patient data collection across departments
- fragmented medical records and poor documentation consistency
- heavy dependence on staff for initial case history capture
- limited accessibility for patients with language barriers or low digital literacy
- weak digital handoff between kiosk, mobile, and doctor workflows

This often creates delays, inefficiencies, and inconsistent clinical records before a doctor even sees the patient.

## Our solution

MediKiosk is a multi-module digital health ecosystem that transforms the front-end patient journey into a structured, AI-assisted clinical intake workflow.

It connects:

- kiosk-based patient intake
- mobile document upload and QR-based data exchange
- AI-powered medical history collection
- consent-driven privacy and record handling
- routing to appropriate departments and doctors
- clinician-ready summary generation for review

The platform is designed to keep the patient journey simple while giving doctors a more complete and organized clinical picture earlier in the consultation process.

---

## Why this matters

At the time of consultation, a doctor needs accurate, structured, and accessible information about the patient. Our platform helps capture this information in a guided, multilingual, and privacy-aware way before the doctor begins treatment.

This reduces:

- repeated questioning
- documentation gaps
- patient confusion during registration
- delays caused by manual paperwork
- loss of information between intake and review stages

---

## Key features

### 1. Multilingual patient experience
- bilingual and multilingual support for patient interaction
- language-aware interface for kiosk and mobile users
- easier adoption in diverse hospital environments

### 2. AI-assisted clinical intake
- adaptive conversation flow for symptom and history collection
- guided responses for patient inputs
- structured clinical summary generation for doctor review
- safety checks and emergency flagging logic

### 3. Document and record handling
- upload prescriptions, reports, labs, and related documents
- AI-driven document-processing workflow
- extraction of medical information for later review

### 4. Privacy-aware consent handling
- patient consent records
- privacy controls for sharing health data
- secure views and access boundaries across hospital workflows

### 5. Hospital operations support
- department and doctor routing
- queueing and token-based flow
- patient session continuity across kiosk and mobile

### 6. Mobile + kiosk integration
- QR-based pairing between kiosk and mobile
- patient can upload documents using phone without visiting a desk again
- smoother continuity between intake and review stages

---

## Architecture overview

```text
Patient / Kiosk / Mobile App
          |            |
          v            v
  AyushCareKiosk   AyushCareMobile
          \        /
           \      /
            v    v
      AyushCareBackend
            |
            +------------------+
            |                  |
            v                  v
     Auth / Queue /         AyushCareAI
     Patient Flow /         - conversation
     Consent / Routing      - summary generation
     Storage / APIs        - document intelligence
                              - safety rules

         +-------------------------------+
         |                               |
         v                               v
      PostgreSQL                     Cloud/Object Storage

```
      
```
Doctor/Admin Panel
      |
      v
  HNDPANEL
```

---

## Repository structure

```text
Medikiosk/
├── AyushCareAI/              # Python FastAPI AI backend
├── AyushCareBackend/         # Node.js/Express core application backend
├── AyushCareKiosk/           # Kiosk frontend for patient intake
├── AyushCareMobile/          # Mobile patient companion app
├── HNDPANEL/                 # Doctor and admin panel
├── README.md                 # Project overview and entry point
├── MEDIKIOSK_CURRENT_STATE_AUDIT.md
├── MEDIKIOSK_CURRENT_STATE_AUDIT.json
├── ...
└── project documentation and migration notes
```

---

## Project modules

### AyushCareAI
Python-based AI engine for:
- clinical conversation workflow
- document intelligence and OCR support
- summary generation
- safety/flagging logic
- multilingual and consent-aware processing

### AyushCareBackend
Core backend that powers:
- auth and patient identity flow
- consultation and routing logic
- queue and token management
- mobile and kiosk integrations
- data persistence and service coordination

### AyushCareKiosk
Patient-facing kiosk frontend built for:
- check-in and identification
- department selection
- guided intake
- vitals collection
- consent and summary review

### AyushCareMobile
Companion mobile experience for:
- QR-based session linking
- document upload
- patient portal access
- record visibility and privacy settings

### HNDPANEL
Doctor/admin dashboard for:
- patient queue management
- doctor assignment
- clinical review
- operational monitoring

---

## Typical user flow

1. Patient arrives at hospital kiosk
2. Patient identity and consent are captured
3. Department and doctor routing is selected
4. AI-assisted intake conversation begins
5. Medical history and symptoms are collected
6. Documents and reports are uploaded from kiosk or mobile
7. AI generates a structured clinical summary
8. Doctor reviews patient status and proceeds with treatment
9. Queue and patient journey continue seamlessly

---

## Technology stack

### AI & backend services
- Python
- FastAPI
- Node.js
- Express.js
- PostgreSQL
- AWS S3 / cloud object storage
- JWT authentication
- AI-enabled document and intake workflows

### Frontend applications
- React
- Vite
- Next.js
- Zustand
- Tailwind CSS
- modern component-based interfaces

---

## Getting started

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd Medikiosk
```

### 2. Run the AI service

```bash
cd AyushCareAI
python -m venv .venv
# Windows
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```

### 3. Run the backend

```bash
cd AyushCareBackend
npm install
npm run dev
```

The backend runs on port 8000 by default.

### 4. Run the kiosk frontend

```bash
cd AyushCareKiosk
npm install
npm run dev
```

### 5. Run the mobile app

```bash
cd AyushCareMobile
npm install
npm run dev
```

### 6. Run the doctor/admin panel

```bash
cd HNDPANEL
npm install
npm run dev
```

---

## Environment and security notes

This project handles healthcare data, so all sensitive settings should remain server-side.

Keep these in environment variables and do not expose them in frontend code:

- database credentials
- AI service keys
- cloud storage credentials
- SMS / notification credentials
- hospital-specific configuration values

Do not commit secrets or `.env` files to the repository.

---

## Why this project is strong for SIH judging

MediKiosk stands out because it combines:

- real-world healthcare problem relevance
- complete digital intake workflow
- multilingual accessibility
- AI-assisted clinical support
- mobile + kiosk integration
- hospital operations thinking
- privacy-conscious patient data handling

It is not only a prototype UI; it is a system designed around the full patient journey from intake to summary review.

---

## Documentation

Additional project details are available in:

- [MEDIKIOSK_CURRENT_STATE_AUDIT.md](MEDIKIOSK_CURRENT_STATE_AUDIT.md)
- [AyushCareAI/README.md](AyushCareAI/README.md)
- [AyushCareBackend/README.md](AyushCareBackend/README.md)
- [AyushCareKiosk/README.md](AyushCareKiosk/README.md)
- [AyushCareMobile/README.md](AyushCareMobile/README.md)

These files provide deeper implementation and integration details for the platform.

---

## Project status

This repository is a working multi-service healthcare platform prototype built to demonstrate an end-to-end digital intake and clinician-assist workflow across kiosk, mobile, AI, and hospital operations.

---

## License

Please review the repository-specific package and project metadata for the applicable licensing terms before public deployment or distribution.
