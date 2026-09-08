export type UserRole = 'hospital_admin' | 'doctor';

export type ConsultationStatus = 'waiting_triage' | 'in_queue' | 'call' | 'hold' | 'complete' | 'cancelled';

export type RiskLevel = 'routine' | 'high_risk' | 'emergency';

export type DocumentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'deleted';

export interface ApiResponse<T = any> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
}

export interface User {
  id: string;
  hospital_id: string;
  name: string;
  email: string;
  role: UserRole;
  specialization?: string;
  is_active: boolean;
  created_at?: string;
}

export interface AuthLoginResponse {
  user: User;
  accessToken: string;
}

export interface Doctor {
  id: string;
  name: string;
  email: string;
  specialization?: string;
  is_active: boolean;
}

export interface ConsultationQueueItem {
  id: string;
  token_number: string;
  status: ConsultationStatus;
  risk_level: RiskLevel;
  full_name: string;
  department_id?: string;
  assigned_doctor_id?: string;
  created_at?: string;
}

export interface ClinicalSummary {
  id?: string;
  consultation_id?: string;
  chief_complaint?: string;
  history_of_present_illness?: string;
  past_medical_history?: Array<{
    category?: string;
    condition?: string;
    title?: string;
    since?: string;
    year?: string;
    status?: 'Active' | 'Resolved' | 'Chronic';
    notes?: string;
  }> | Record<string, any>;
  drug_allergies?: string[] | Array<{ drug?: string; reaction?: string; severity?: string }> | Record<string, any>;
  medications?: Array<{
    drugName?: string;
    name?: string;
    dosage?: string;
    frequency?: string;
    duration?: string;
    instructions?: string;
  }> | Record<string, any>;
  ayush_attributes?: Record<string, any>;
  ai_payload?: Record<string, any>;
  socrates?: Record<string, any>;
  generated_at?: string;
  updated_at?: string;
}

export interface UploadedDocument {
  id: string;
  consultation_id: string;
  file_path_hash: string;
  document_type: string;
  page_number?: number;
  total_pages?: number;
  extracted_data?: Record<string, any>;
  status: DocumentStatus;
  created_at: string;
  updated_at?: string;
}

export interface VisitAnalytics {
  kiosk_visits: number;
  token_conversions: number;
  consultations_completed: number;
}
