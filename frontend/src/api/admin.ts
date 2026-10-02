import apiClient from './client';
import {
  AdminDashboardStats,
  User,
  AuditLog,
  DataImportResponse,
} from '../types';

export const adminApi = {
  getDashboard: async (): Promise<AdminDashboardStats> => {
    const res = await apiClient.get<AdminDashboardStats>('/admin/dashboard');
    return res.data;
  },

  getDashboardStats: async (): Promise<AdminDashboardStats> => {
    const res = await apiClient.get<AdminDashboardStats>('/admin/dashboard');
    return res.data;
  },

  importData: async (
    data: any,
    format: 'csv' | 'json' = 'json'
  ): Promise<DataImportResponse> => {
    const res = await apiClient.post<DataImportResponse>('/admin/import-data', {
      data,
      format,
    });
    return res.data;
  },

  getUsers: async (params?: {
    skip?: number;
    limit?: number;
    role?: string;
    search?: string;
  }): Promise<User[]> => {
    const res = await apiClient.get<User[]>('/admin/users', { params });
    return res.data;
  },

  updateUserRole: async (
    userId: number,
    data: { role?: string; is_active?: boolean }
  ): Promise<User> => {
    const res = await apiClient.patch<User>(`/admin/users/${userId}`, data);
    return res.data;
  },

  updateUser: async (
    userId: number,
    data: { role?: string; is_active?: boolean }
  ): Promise<User> => {
    const res = await apiClient.patch<User>(`/admin/users/${userId}`, data);
    return res.data;
  },

  addCandidate: async (
    electionId: number,
    data: any
  ): Promise<any> => {
    const res = await apiClient.post(`/elections/${electionId}/candidates`, data);
    return res.data;
  },

  getAuditLogs: async (params?: {
    skip?: number;
    limit?: number;
    action?: string;
  }): Promise<AuditLog[]> => {
    const res = await apiClient.get<AuditLog[]>('/admin/audit-logs', { params });
    return res.data;
  },

  setVoterEligibility: async (
    electionId: number,
    voterId: number,
    isEligible: boolean
  ): Promise<{ message: string }> => {
    const res = await apiClient.post(`/admin/elections/${electionId}/voter-eligibility`, {
      voter_id: voterId,
      is_eligible: isEligible,
    });
    return res.data;
  },
};
