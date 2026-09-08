import apiClient from '../lib/axios';
import {
  ApiResponse,
  ClinicalSummary,
  ConsultationQueueItem,
  ConsultationStatus,
  UploadedDocument,
} from '../types/api';

export const doctorService = {
  getQueue: async (): Promise<ConsultationQueueItem[]> => {
    const response = await apiClient.get<ApiResponse<ConsultationQueueItem[]>>('/doctor/queue');
    return response.data.data;
  },

  getPatientSummary: async (consultationId: string): Promise<ClinicalSummary> => {
    const response = await apiClient.get<ApiResponse<ClinicalSummary>>(`/doctor/patients/${consultationId}/summary`);
    return response.data.data;
  },

  getPatientReports: async (consultationId: string): Promise<UploadedDocument[]> => {
    const response = await apiClient.get<ApiResponse<UploadedDocument[]>>(`/doctor/patients/${consultationId}/reports`);
    return response.data.data;
  },

  updateConsultationStatus: async (consultationId: string, status: ConsultationStatus): Promise<void> => {
    await apiClient.patch<ApiResponse<any>>(`/doctor/consultations/${consultationId}/status`, { status });
  },

  signOffConsultation: async (consultationId: string, remarks: string): Promise<void> => {
    await apiClient.post<ApiResponse<any>>(`/doctor/consultations/${consultationId}/sign-off`, { remarks });
  },
};
