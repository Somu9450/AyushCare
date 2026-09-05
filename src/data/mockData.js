/**
 * Centralized Mock Data for AyushCare Mobile Companion
 *
 * This file maintains consistency with the AyushCare Hospital Kiosk data structures
 * (patient profile, session state, document models, timeline entries, clinical summaries).
 *
 * All data here acts as the local prototype source of truth until backend APIs are integrated.
 */

export const mockSession = {
  sessionId: "MKS-2026-9481",
  kioskId: "KIOSK-DELHI-OPD-03",
  terminalName: "Central Delhi OPD Terminal 03",
  status: "ACTIVE",
  expiresIn: "05:00",
  initialCountdownSeconds: 300,
  connectedAt: "Today, 10:24 AM",
  hospitalName: "Civil Hospital OPD",
  department: "General Medicine / Ayush OPD",
  patient: {
    id: "pat_88129012",
    name: "Rajesh Kumar Sharma",
    hindiName: "राजेश कुमार शर्मा",
    gender: "Male",
    age: 42,
    dob: "1984-06-15",
    mobile: "+91 98765 43210",
    abhaNumber: "91-4432-8812-9012",
    bloodGroup: "B+",
    district: "Central Delhi",
    state: "Delhi",
  },
};

export const mockAppointments = {
  today: {
    id: "apt_today_01",
    tokenNumber: "AY-OPD-108",
    doctorName: "Dr. A. K. Verma",
    specialty: "MD (General Medicine & Ayush)",
    department: "General Medicine OPD",
    room: "Room 104 · OPD Block B",
    hospitalName: "Civil Hospital OPD",
    date: "Today, 05 Sep 2026",
    timeSlot: "10:30 AM - 11:00 AM",
    status: "IN_QUEUE", // "IN_QUEUE" | "CALLED" | "COMPLETED"
    queuePosition: 3,
    estimatedWaitTime: "12 mins",
    checkInTime: "10:14 AM",
    kioskTerminal: "Terminal 03 (Central Delhi)",
    symptomsSummary: "Fever and joint pain (3 days duration, moderate severity)",
    vitalsRecorded: {
      bp: "120/80 mmHg",
      pulse: "76 bpm",
      temp: "98.4 °F",
      spo2: "98%",
    },
    instructions: "Please be seated near Room 104 waiting lobby. Your token will be announced on the digital display.",
  },
  upcoming: [
    {
      id: "apt_up_01",
      tokenNumber: "AY-OPD-108",
      doctorName: "Dr. A. K. Verma",
      specialty: "MD (General Medicine & Ayush)",
      department: "General Medicine OPD",
      room: "Room 104 · OPD Block B",
      hospitalName: "Civil Hospital OPD",
      date: "Today, 05 Sep 2026",
      timeSlot: "10:30 AM - 11:00 AM",
      status: "IN_QUEUE",
      isToday: true,
      queuePosition: 3,
      estimatedWaitTime: "12 mins",
      checkInTime: "10:14 AM",
      symptomsSummary: "Fever and joint pain (3 days)",
      vitalsRecorded: {
        bp: "120/80 mmHg",
        pulse: "76 bpm",
        temp: "98.4 °F",
        spo2: "98%",
      },
    },
    {
      id: "apt_up_02",
      tokenNumber: "AY-END-214",
      doctorName: "Dr. Sneha Roy",
      specialty: "MD (Endocrinology)",
      department: "Diabetes Care & Ayush Lifestyle",
      room: "Room 208 · Special Clinic",
      hospitalName: "Civil Hospital OPD",
      date: "18 Sep 2026",
      timeSlot: "11:15 AM - 11:45 AM",
      status: "SCHEDULED",
      isToday: false,
      symptomsSummary: "Routine HbA1c review and diabetic dietary follow-up",
    },
  ],
  past: [
    {
      id: "apt_past_01",
      tokenNumber: "OPD-MAY-4491",
      doctorName: "Dr. A. K. Verma",
      specialty: "MD (General Medicine)",
      department: "General Medicine OPD",
      room: "Room 104 · OPD Block B",
      hospitalName: "Civil Hospital OPD",
      date: "12 May 2026",
      diagnosis: "Viral Upper Respiratory Infection",
      prescriptionDocument: "Prescription_May2026.pdf",
      status: "COMPLETED",
      summary: "Prescribed Paracetamol 650mg BD and Metformin 500mg. Advised hydration and 3-day rest.",
    },
    {
      id: "apt_past_02",
      tokenNumber: "LAB-MAY-8812",
      doctorName: "Pathology Diagnostics",
      specialty: "Clinical Biochemistry",
      department: "Clinical Laboratory",
      room: "Lab Sample Counter 2",
      hospitalName: "Civil Hospital OPD",
      date: "10 May 2026",
      diagnosis: "Elevated Fasting Glucose (186 mg/dL) & HbA1c (8.4%)",
      prescriptionDocument: "LabReport_May2026.pdf",
      status: "COMPLETED",
      summary: "Routine diabetic panel completed. Endocrine consultation recommended.",
    },
    {
      id: "apt_past_03",
      tokenNumber: "AY-OPD-092",
      doctorName: "Dr. Ramesh Chander",
      specialty: "BAMS (Ayurveda Chikitsa)",
      department: "Panchakarma & General Ayush",
      room: "Room 12 · Ayush Wing",
      hospitalName: "Civil Hospital OPD",
      date: "14 Nov 2025",
      diagnosis: "Stage-1 Essential Hypertension",
      prescriptionDocument: "Prescription_Nov2025.pdf",
      status: "COMPLETED",
      summary: "Amlodipine 5mg initiated with lifestyle and dietary guidance.",
    },
  ],
};

/**
 * Healthcare Visits History (Actual encounters, distinct from scheduled appointments)
 */
export const mockVisits = [
  {
    id: "VISIT-001",
    date: "02 Sep 2026",
    rawDate: "2026-09-02",
    year: "2026",
    month: "September",
    type: "ALLOPATHY", // "ALLOPATHY" | "AYUSH"
    typeLabel: "Allopathy",
    department: "Neurology",
    doctor: "Dr. Atul Agarwal",
    hospital: "XYZ Hospital",
    room: "Room 204",
    status: "Visit completed",
    statusCode: "COMPLETED",

    symptoms: ["Fever", "Joint pain", "Headache"],
    duration: "3 days",
    severity: "Moderate",

    clinicalHistory: {
      complaint: "Fever and joint pain",
      duration: "3 days",
      additionalInfo: "Patient reported moderate discomfort with episodic headache. No history of recent travel.",
    },

    medications: [
      {
        name: "Paracetamol 650 mg",
        instructions: "As recorded in visit information",
      },
      {
        name: "Metformin 500 mg",
        instructions: "1-0-1",
      },
      {
        name: "Amlodipine 5 mg",
        instructions: "0-0-1",
      },
    ],

    vitals: {
      bp: "128/82 mmHg",
      pulse: "78 bpm",
      spo2: "98%",
      temperature: "99.1°F",
    },

    documentIds: ["DOC-001"],
    documents: [
      {
        id: "doc_v1_1",
        recordId: "DOC-001",
        type: "Prescription",
        date: "12 May 2026",
        fileName: "Prescription_May2026.pdf",
      },
      {
        id: "doc_v1_2",
        type: "Lab Report",
        date: "02 Sep 2026",
        fileName: "Neuro_EEG_Summary.pdf",
      },
    ],

    summary:
      "This visit included discussion of the patient's reported fever and joint pain and review of available medical information.",
  },
  {
    id: "VISIT-002",
    date: "18 Aug 2026",
    rawDate: "2026-08-18",
    year: "2026",
    month: "August",
    type: "ALLOPATHY",
    typeLabel: "Allopathy",
    department: "General Medicine",
    doctor: "Dr. Priya Sharma",
    hospital: "XYZ Hospital",
    room: "Room 108",
    status: "Visit completed",
    statusCode: "COMPLETED",

    symptoms: ["Cough", "Mild sore throat", "Fatigue"],
    duration: "5 days",
    severity: "Mild",

    clinicalHistory: {
      complaint: "Seasonal cough and sore throat",
      duration: "5 days",
      additionalInfo:
        "Patient reported mild throat irritation without chest pain or breathing difficulty.",
    },

    medications: [
      {
        name: "Cetirizine 10 mg",
        instructions: "0-0-1 at bedtime for 5 days",
      },
      {
        name: "Steam inhalation",
        instructions: "Twice daily as recorded",
      },
    ],

    vitals: {
      bp: "120/80 mmHg",
      pulse: "74 bpm",
      spo2: "99%",
      temperature: "98.6°F",
    },

    documents: [
      {
        id: "doc_v2_1",
        type: "Prescription",
        date: "18 Aug 2026",
        fileName: "GeneralMed_Aug2026.pdf",
      },
    ],

    summary:
      "This visit included review of upper respiratory symptoms and standard supportive medication guidance.",
  },
  {
    id: "VISIT-003",
    date: "12 Jul 2026",
    rawDate: "2026-07-12",
    year: "2026",
    month: "July",
    type: "AYUSH",
    typeLabel: "AYUSH",
    department: "AYUSH Department",
    doctor: "Dr. Neha Verma",
    hospital: "XYZ Hospital",
    room: "Ayush OPD 04",
    status: "AYUSH Consultation",
    statusCode: "COMPLETED",

    isAyush: true,
    ayushDetails: {
      prakriti: {
        term: "Prakriti",
        meaning: "Constitutional Body Type",
        value: "Vata-Pitta",
        description: "Predominance of air and fire biological humor",
      },
      agni: {
        term: "Agni",
        meaning: "Digestive Strength",
        value: "Normal",
        description: "Balanced digestive fire and metabolic capacity",
      },
      kostha: {
        term: "Kostha",
        meaning: "Bowel Habit",
        value: "Regular",
        description: "Normal gastrointestinal motility and regular elimination",
      },
      dhatus: "Balanced Rasa & Rakta",
    },

    symptoms: ["Indigestion", "Mild acidity", "Disturbed sleep"],
    duration: "2 weeks",
    severity: "Mild to Moderate",

    clinicalHistory: {
      complaint: "Episodic acidity and post-meal heaviness",
      duration: "2 weeks",
      additionalInfo: "Patient reported irregular meal timings due to shift work schedules.",
    },

    medications: [
      {
        name: "Avipattikar Churna 3g",
        instructions: "Before meals with lukewarm water",
      },
      {
        name: "Triphala Kwath 15ml",
        instructions: "At bedtime as recorded in visit information",
      },
    ],

    vitals: {
      bp: "122/82 mmHg",
      pulse: "72 bpm",
      spo2: "98%",
      temperature: "98.4°F",
    },

    documentIds: ["DOC-003"],
    documents: [
      {
        id: "doc_v3_1",
        recordId: "DOC-003",
        type: "Discharge Summary",
        date: "14 Nov 2025",
        fileName: "DischargeSummary_Nov2025.pdf",
      },
    ],

    summary:
      "This visit included assessment of constitutional factors (Prakriti, Agni), dietary counseling (Pathya-Apathya), and traditional herbal formulations.",
  },
  {
    id: "VISIT-004",
    date: "14 May 2026",
    rawDate: "2026-05-14",
    year: "2026",
    month: "May",
    type: "ALLOPATHY",
    typeLabel: "Allopathy",
    department: "Cardiology",
    doctor: "Dr. R. K. Bansal",
    hospital: "XYZ Hospital",
    room: "Cardio Wing 302",
    status: "Visit completed",
    statusCode: "COMPLETED",

    symptoms: ["Occasional palpitations", "Exertional fatigue"],
    duration: "10 days",
    severity: "Mild",

    clinicalHistory: {
      complaint: "Mild fatigue after climbing stairs",
      duration: "10 days",
      additionalInfo: "Baseline 12-lead ECG within normal limits. Advised lifestyle modifications.",
    },

    medications: [
      {
        name: "Amlodipine 5 mg",
        instructions: "0-0-1 morning after breakfast",
      },
    ],

    vitals: null, // Test case: vitals not recorded for this encounter

    documents: [
      {
        id: "doc_v4_1",
        type: "ECG Report",
        date: "14 May 2026",
        fileName: "ECG_Bansal_May2026.pdf",
      },
    ],

    summary:
      "This visit included cardiovascular follow-up, review of blood pressure records, and routine lifestyle advice.",
  },
];

/**
 * Centralized Medical Records & Document Repository
 * Standalone document entities that may optionally be linked to a healthcare encounter (visitId).
 */
export const mockMedicalRecords = [
  {
    id: "DOC-001",
    type: "prescription",
    typeLabel: "Prescription",
    title: "Prescription_May2026.pdf",
    date: "2026-05-12",
    displayDate: "12 May 2026",
    monthGroup: "MAY 2026",
    source: "XYZ Hospital",
    doctor: "Dr. A. K. Verma, MD (Gen Med)",
    clinic: "Civil Hospital OPD - Room 104",
    status: "PROCESSED",
    statusLabel: "Processed",
    visitId: "VISIT-001",
    sessionId: "MKS-2026-9481",
    fileSize: "1.4 MB",
    dataUrl: null,
    extractedInformation: {
      medicines: [
        {
          id: "med_doc1_1",
          name: "Paracetamol 650 mg",
          dosage: "650 mg",
          schedule: "BD · Twice daily",
          instruction: "After meals (खाने के बाद)",
          confidence: "HIGH",
          isHighConfidence: true,
          needsVerification: false,
        },
        {
          id: "med_doc1_2",
          name: "Metformin 500 mg",
          dosage: "500 mg",
          schedule: "1-0-1 · After food",
          instruction: "Morning & Night with water",
          confidence: "HIGH",
          isHighConfidence: true,
          needsVerification: false,
        },
        {
          id: "med_doc1_3",
          name: "Amlodipine 5 mg",
          dosage: "5 mg",
          schedule: "0-0-1 · At night",
          instruction: "Bedtime (सोते समय)",
          confidence: "VERIFY",
          isHighConfidence: false,
          needsVerification: true,
          verificationReason: "Faint handwritten margin note",
        },
      ],
      diagnosis: [
        {
          id: "diag_doc1_1",
          value: "Viral Upper Respiratory Infection",
          confidence: "VERIFY",
          needsVerification: true,
          verificationReason: "Handwriting partially cursive near diagnosis line",
        },
      ],
      prescriptionDate: "12 May 2026",
    },
  },
  {
    id: "DOC-002",
    type: "lab_report",
    typeLabel: "Lab Report",
    title: "Blood_Test_April2026.pdf",
    date: "2026-04-18",
    displayDate: "18 Apr 2026",
    monthGroup: "APRIL 2026",
    source: "XYZ Hospital",
    doctor: "Clinical Biochemistry Lab",
    clinic: "Central Diagnostic Wing",
    status: "PROCESSED",
    statusLabel: "Processed",
    visitId: null, // Unlinked document
    sessionId: "SESSION-002",
    fileSize: "2.1 MB",
    dataUrl: null,
    extractedInformation: {
      medicines: [],
      diagnosis: [
        {
          id: "diag_doc2_1",
          value: "Elevated Fasting Glucose (186 mg/dL) & HbA1c (8.4%)",
          confidence: "HIGH",
          needsVerification: false,
        },
      ],
      prescriptionDate: "18 Apr 2026",
    },
  },
  {
    id: "DOC-003",
    type: "discharge_summary",
    typeLabel: "Discharge Summary",
    title: "DischargeSummary_Nov2025.pdf",
    date: "2025-11-14",
    displayDate: "14 Nov 2025",
    monthGroup: "NOVEMBER 2025",
    source: "Civil Hospital OPD",
    doctor: "Dr. Ramesh Chander",
    clinic: "Ayush Inpatient Wing",
    status: "CONFIRMED",
    statusLabel: "Confirmed",
    visitId: "VISIT-003",
    sessionId: "SESSION-003",
    fileSize: "3.4 MB",
    dataUrl: null,
    extractedInformation: {
      medicines: [
        {
          id: "med_doc3_1",
          name: "Amlodipine 5 mg",
          dosage: "5 mg",
          schedule: "0-0-1",
          instruction: "Daily morning with water",
          confidence: "HIGH",
          isHighConfidence: true,
          needsVerification: false,
        },
      ],
      diagnosis: [
        {
          id: "diag_doc3_1",
          value: "Stage-1 Essential Hypertension with Dyspepsia",
          confidence: "HIGH",
          needsVerification: false,
        },
      ],
      prescriptionDate: "14 Nov 2025",
    },
  },
  {
    id: "DOC-004",
    type: "other",
    typeLabel: "Other Medical Record",
    title: "Vaccination_Certificate_2024.pdf",
    date: "2024-03-22",
    displayDate: "22 Mar 2024",
    monthGroup: "MARCH 2024",
    source: "National Health Mission",
    doctor: "Public Health Centre",
    clinic: "Immunization Desk",
    status: "PROCESSED",
    statusLabel: "Processed",
    visitId: null, // Unlinked
    sessionId: "SESSION-004",
    fileSize: "850 KB",
    dataUrl: null,
    extractedInformation: {
      medicines: [],
      diagnosis: [
        {
          id: "diag_doc4_1",
          value: "Preventive Adult Immunization Verified",
          confidence: "HIGH",
          needsVerification: false,
        },
      ],
      prescriptionDate: "22 Mar 2024",
    },
  },
];

export const mockDocumentTypes = [
  {
    id: "prescription",
    title: "Prescription",
    hi: "डॉक्टर की पर्ची",
    subtitle: "Doctor prescription or OPD slip from a previous consultation",
    iconName: "FileText",
    examples: "OPD slip, written Rx, consultation memo",
  },
  {
    id: "lab_report",
    title: "Lab Report",
    hi: "जांच रिपोर्ट",
    subtitle: "Blood, urine, radiology or other diagnostic investigations",
    iconName: "FileSpreadsheet",
    examples: "CBC, Blood sugar, Lipid profile, Urine test",
  },
  {
    id: "discharge_summary",
    title: "Discharge Summary",
    hi: "डिस्चार्ज समरी",
    subtitle: "Hospital admission, procedure or surgery discharge records",
    iconName: "Building2",
    examples: "Inpatient summary, OT notes, hospital discharge card",
  },
  {
    id: "other",
    title: "Other Medical Record",
    hi: "अन्य मेडिकल दस्तावेज़",
    subtitle: "Vaccination cards, medical certificates or referral slips",
    iconName: "FolderHeart",
    examples: "Immunization record, disability cert, imaging scan",
  },
];

export const mockDefaultDocument = {
  id: "doc_rx_2026_05_12",
  fileName: "Prescription_May2026.pdf",
  fileType: "application/pdf",
  documentType: "prescription",
  date: "12 May 2026",
  sourceLabel: "Source document · 12 May 2026",
  clinic: "Civil Hospital OPD - Room 104",
  doctor: "Dr. A. K. Verma, MD (Gen Med)",
  fileSize: "1.4 MB",
};

export const mockExtractedData = {
  documentName: "Prescription_May2026.pdf",
  sourceInfo: "Source document · 12 May 2026",
  prescriptionDate: "12 May 2026",
  doctorName: "Dr. A. K. Verma, MD (Gen Med)",
  clinic: "Civil Hospital OPD - Room 104",
  confidenceScore: 92,
  medicines: [
    {
      id: "med_1",
      name: "Paracetamol 650 mg",
      dosage: "650 mg",
      schedule: "BD · Twice daily",
      instruction: "After meals (खाने के बाद)",
      confidence: "High confidence",
      isHighConfidence: true,
      needsVerification: false,
    },
    {
      id: "med_2",
      name: "Metformin 500 mg",
      dosage: "500 mg",
      schedule: "1-0-1 · After food",
      instruction: "Morning & Night with water",
      confidence: "High confidence",
      isHighConfidence: true,
      needsVerification: false,
    },
    {
      id: "med_3",
      name: "Amlodipine 5 mg",
      dosage: "5 mg",
      schedule: "0-0-1 · At night",
      instruction: "Bedtime (सोते समय)",
      confidence: "Verify",
      isHighConfidence: false,
      needsVerification: true,
      verificationReason: "Dosage frequency handwritten faintly in margin",
    },
  ],
  diagnosis: {
    name: "Viral Upper Respiratory Infection",
    confidence: "Verify",
    isHighConfidence: false,
    needsVerification: true,
    verificationReason: "Handwriting partially cursive near diagnosis line",
  },
  clinicalDisclaimer: {
    title: "Please verify highlighted information.",
    message:
      "We are only correcting document reading. This is not a clinical decision.",
    subtext:
      "The highlighted items with 'Verify' badges should be checked against your original paper slip.",
  },
};

export const mockTimeline = [
  {
    id: "tl_1",
    year: "2024",
    timeLabel: "2024",
    title: "Diabetes diagnosed",
    subtitle: "Type-2 Diabetes Mellitus confirmed during routine health checkup",
    source: "Medical document",
    sourceType: "DOCUMENT",
    badgeColor: "teal",
  },
  {
    id: "tl_2",
    year: "2025",
    timeLabel: "2025",
    title: "Blood pressure medicine started",
    subtitle: "Amlodipine 5mg daily prescribed for stage-1 hypertension",
    source: "Prescription",
    sourceType: "PRESCRIPTION",
    badgeColor: "blue",
  },
  {
    id: "tl_3",
    year: "2026",
    timeLabel: "MAY 2026",
    title: "Lab report uploaded",
    subtitle: "HbA1c 8.4% · Fasting Blood Sugar 186 mg/dL",
    source: "Lab report",
    sourceType: "LAB_REPORT",
    badgeColor: "amber",
  },
  {
    id: "tl_4",
    year: "2026",
    timeLabel: "TODAY",
    title: "Fever and joint pain",
    subtitle: "Duration: 3 days · Severity: Moderate",
    source: "Patient Reported",
    sourceType: "PATIENT",
    badgeColor: "emerald",
    isLatest: true,
  },
];

export const mockHealthSummary = {
  disclaimer: {
    heading: "Not a diagnosis",
    body: "This is a plain-language summary of the information you provided and the documents you uploaded.",
    safetyNote:
      "Your treating doctor will make all clinical decisions based on a full physical assessment.",
  },
  sections: {
    patientReported: {
      title: "What you told us",
      iconName: "MessageSquare",
      items: [
        { label: "Chief Complaint", value: "Fever and joint pain" },
        { label: "Duration", value: "Duration: about 3 days" },
        { label: "Severity", value: "Moderate (rated 5/10 on check-in)" },
      ],
    },
    documentsShow: {
      title: "What your documents show",
      iconName: "FileCheck",
      items: [
        { label: "Prescription 1", value: "Paracetamol 650 mg (Twice daily)" },
        { label: "Prescription 2", value: "Metformin 500 mg (After food)" },
        { label: "Prescription 3", value: "Amlodipine 5 mg (At bedtime - verified)" },
      ],
    },
    medicalHistory: {
      title: "Your medical history",
      iconName: "History",
      items: [
        { label: "Endocrine", value: "Diabetes since 2024" },
        { label: "Cardiovascular", value: "High Blood Pressure" },
      ],
    },
    recentResults: {
      title: "Recent results",
      iconName: "Activity",
      dateBadge: "May 2026",
      items: [
        { test: "HbA1c", result: "8.4%", status: "Elevated" },
        { test: "Fasting Glucose", result: "186 mg/dL", status: "Elevated" },
      ],
    },
  },
  sources: [
    {
      category: "Patient Reported",
      count: 2,
      unit: "items",
      description: "Symptoms & duration reported during kiosk check-in",
    },
    {
      category: "Medical Documents",
      count: 3,
      unit: "documents",
      description: "Prescription May 2026, Lab report, Previous summary",
    },
  ],
  hindiAudioText:
    "नमस्ते राजेश जी। यह आपकी स्वास्थ्य सारांश है। आपने पिछले तीन दिनों से बुखार और जोड़ों के दर्द की शिकायत बताई है। आपके दस्तावेज़ों के अनुसार आप पैरासिटामोल 650 मिलीग्राम और मेटफ़ॉर्मिन 500 मिलीग्राम ले रहे हैं। आपका 2024 से मधुमेह और उच्च रक्तचाप का इतिहास है। मई 2026 में आपकी एचबीए1सी 8.4 प्रतिशत थी। यह कोई अंतिम निदान नहीं है, केवल आपके डॉक्टर की सहायता के लिए तैयार सारांश है।",
};

/**
 * Privacy & Data Control Mock Data
 * Product-level patient privacy & consent governance models.
 * Note: These controls represent prototype product features for patient transparency and control,
 * structured to be easily replaceable with actual backend and ABDM consent APIs in the future.
 */
export const mockPrivacyData = {
  healthHistoryAccess: {
    locked: false,
    updatedAt: "05 Sep 2026, 10:24 AM",
    description:
      "Control whether your saved health history and medical documents can be shared with connected healthcare sessions.",
  },

  activeConsents: [
    {
      id: "consent-001",
      title: "Hospital Consultation Access",
      purpose: "Share your health history and documents with the care team for your consultation.",
      whyNeeded:
        "Allows the consulting physician to review previous diagnoses, current medications, and past lab investigations during your clinical consultation.",
      informationShared: [
        "Patient-reported symptoms and intake vitals",
        "Recorded healthcare visits and clinical history",
        "Relevant medical documents and test reports",
        "Active prescription history and clinical summary",
      ],
      accessedBy: "Connected hospital care team · Civil Hospital OPD",
      status: "ACTIVE",
      grantedAt: "05 Sep 2026 · 10:24 AM",
      expiresAt: "Today, end of consultation",
      lastUpdated: "05 Sep 2026 · 10:24 AM",
      scope: "Current consultation encounter (#AY-OPD-108)",
    },
    {
      id: "consent-002",
      title: "Medical Document Processing",
      purpose: "Allow uploaded medical documents to be processed for extracting information.",
      whyNeeded:
        "Enables optical character recognition (OCR) to read medicines, dosages, and diagnostic observations from paper slips to fast-track your consultation.",
      informationShared: [
        "Uploaded prescription and report images",
        "Extracted medication names and dosage schedules",
        "Extracted clinical diagnosis terms",
      ],
      accessedBy: "AyushCare Automated Document Engine",
      status: "ACTIVE",
      grantedAt: "05 Sep 2026 · 10:25 AM",
      expiresAt: "Valid for active session",
      lastUpdated: "05 Sep 2026 · 10:25 AM",
      scope: "Patient-uploaded documents in current session",
    },
  ],

  consentHistory: [
    {
      id: "ch-001",
      title: "Hospital Consultation Access",
      purpose: "Consultation sharing with attending doctor",
      status: "ACTIVE",
      grantedAt: "05 Sep 2026 · 10:24 AM",
      withdrawnAt: null,
      notes: "Granted at Kiosk check-in terminal 03",
    },
    {
      id: "ch-002",
      title: "Medical Document Processing",
      purpose: "Extraction of medications from paper prescription",
      status: "ACTIVE",
      grantedAt: "05 Sep 2026 · 10:25 AM",
      withdrawnAt: null,
      notes: "Granted on mobile companion",
    },
    {
      id: "ch-003",
      title: "Previous OPD Consultation Access",
      purpose: "Clinical evaluation for Neurology follow-up",
      status: "WITHDRAWN",
      grantedAt: "02 Sep 2026 · 09:15 AM",
      withdrawnAt: "03 Sep 2026 · 11:30 AM",
      notes: "Access withdrawn after visit completion",
    },
    {
      id: "ch-004",
      title: "Diagnostic Lab Sharing",
      purpose: "Biochemistry blood panel report access",
      status: "EXPIRED",
      grantedAt: "18 Aug 2026 · 08:30 AM",
      withdrawnAt: null,
      notes: "Single-day access expired automatically",
    },
  ],

  accessHistory: [
    {
      id: "acc-001",
      organization: "Civil Hospital OPD",
      department: "General Medicine OPD (Room 104)",
      accessedByRole: "Attending Doctor (Dr. A. K. Verma)",
      informationAccessed: "Clinical history and relevant documents",
      purpose: "Consultation",
      date: "05 Sep 2026",
      time: "10:42 AM",
      status: "ALLOWED",
      details: "Reviewed intake vitals and previous prescription (Prescription_May2026.pdf)",
    },
    {
      id: "acc-002",
      organization: "AyushCare Document Processing",
      department: "Automated OCR Engine",
      accessedByRole: "System Processor",
      informationAccessed: "Uploaded prescription",
      purpose: "Document processing",
      date: "05 Sep 2026",
      time: "10:35 AM",
      status: "ALLOWED",
      details: "Recognized Paracetamol 650mg, Metformin 500mg, Amlodipine 5mg",
    },
    {
      id: "acc-003",
      organization: "Central Delhi Kiosk Terminal 03",
      department: "Patient Triage & Registration",
      accessedByRole: "Self-service kiosk check-in",
      informationAccessed: "ABHA demographic profile & upcoming appointment",
      purpose: "Queue check-in & token generation",
      date: "05 Sep 2026",
      time: "10:24 AM",
      status: "ALLOWED",
      details: "Issued appointment token #AY-OPD-108",
    },
    {
      id: "acc-004",
      organization: "Neurology Specialty Clinic",
      department: "Outpatient Department",
      accessedByRole: "Consulting Physician (Dr. Atul Agarwal)",
      informationAccessed: "Previous clinical consultation notes & vitals",
      purpose: "Follow-up review",
      date: "02 Sep 2026",
      time: "02:15 PM",
      status: "ALLOWED",
      details: "Historical encounter documentation for headache and joint symptoms",
    },
  ],

  activeSessions: [
    {
      id: "sess-001",
      name: "Hospital Kiosk",
      purpose: "Patient consultation",
      startedAt: "05 Sep 2026 · 10:30 AM",
      device: "Hospital OPD Kiosk (KIOSK-DELHI-OPD-03)",
      location: "Civil Hospital Waiting Lobby, Ground Floor",
      status: "ACTIVE",
    },
    {
      id: "sess-002",
      name: "Doctor Consultation Station",
      purpose: "Doctor review & consultation notes",
      startedAt: "05 Sep 2026 · 10:38 AM",
      device: "Doctor Desktop Console (DESK-ROOM-104)",
      location: "OPD Block B, Room 104",
      status: "ACTIVE",
    },
  ],
};

