import apiClient from '../lib/axios';
import { ApiResponse, ConsultationQueueItem, ConsultationStatus, Doctor, VisitAnalytics } from '../types/api';

export interface AdminQueueItem extends ConsultationQueueItem {
  department?: string;
  doctor_name?: string;
}

export const adminService = {
  getDoctors: async (): Promise<Doctor[]> => {
    const response = await apiClient.get<ApiResponse<Doctor[]>>('/admin/doctors');
    return response.data.data;
  },

  getVisitAnalytics: async (): Promise<VisitAnalytics> => {
    const response = await apiClient.get<ApiResponse<VisitAnalytics>>('/admin/analytics/visits');
    return response.data.data;
  },

  getQueue: async (): Promise<AdminQueueItem[]> => {
    const response = await apiClient.get<ApiResponse<AdminQueueItem[]>>('/admin/queue');
    return response.data.data;
  },

  overrideQueue: async (consultationId: string, newStatus: ConsultationStatus): Promise<void> => {
    await apiClient.post<ApiResponse<any>>('/admin/queue/override', { consultationId, newStatus });
  },
};
