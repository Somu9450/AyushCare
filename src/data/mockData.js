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
