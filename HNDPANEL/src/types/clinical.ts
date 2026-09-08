export type PriorityStatus = 'Urgent' | 'Waiting' | 'History Ready' | 'Completed';

export interface SocratesField {
  label: string;
  value: string;
  confidence: 'High' | 'Verify' | 'Critical';
}

export interface LabResult {
  investigation: string;
  result: string;
  reference: string;
  status: 'High' | 'Normal' | 'Critical' | 'Low';
  date: string;
}

export interface DocumentFile {
  id: string;
  name: string;
  date: string;
  type: 'pdf' | 'image';
  size: string;
  url?: string;
  filePath?: string;
  status?: string;
}

export interface ExtractedDrug {
  drug: string;
  dosage: string;
  frequency: string;
  confidence: number;
  status: 'Verified' | 'Verify' | 'Critical';
}

export interface TranscriptItem {
  id: string;
  speaker: 'bot' | 'patient';
  text: string;
  audioUrl?: string;
  audioDuration?: string;
}

export interface MedicalHistoryItem {
  category: string;
  condition: string;
  since: string;
  status: 'Active' | 'Resolved' | 'Chronic';
  notes?: string;
}

export interface PrescriptionItem {
  id: string;
  drugName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export interface Patient {
  id: string;
  tokenNumber: string;
  name: string;
  initials: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  uhid: string;
  department: string;
  chiefComplaint: string;
  complaintConfidence: 'High' | 'Verify' | 'Critical';
  priority: PriorityStatus;
  abhaLinked: boolean;
  alertMessage?: string;
  createdAt?: string;
  socrates: {
    site: SocratesField;
    onset: SocratesField;
    character: SocratesField;
    radiation: SocratesField;
    associated: SocratesField;
    timing: SocratesField;
    aggravating: SocratesField;
    relieving: SocratesField;
    severity: SocratesField;
  };
  labs: LabResult[];
  documents: DocumentFile[];
  extractions: ExtractedDrug[];
  transcripts: TranscriptItem[];
  medicalHistory: MedicalHistoryItem[];
  prescriptions: PrescriptionItem[];
}