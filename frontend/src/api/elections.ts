import apiClient from './client';
import { Election, Candidate, State, Constituency } from '../types';

export const electionsApi = {
  getElections: async (
    params?: string | { status?: string; limit?: number; skip?: number }
  ): Promise<Election[]> => {
    const queryParams = typeof params === 'string' ? { status: params } : params;
    const res = await apiClient.get<Election[]>('/elections', {
      params: queryParams,
    });
    return res.data;
  },

  getElection: async (idOrSlug: string, constituencyId?: number): Promise<Election> => {
    const res = await apiClient.get<Election>(`/elections/${idOrSlug}`, {
      params: constituencyId ? { constituency_id: constituencyId } : undefined,
    });
    return res.data;
  },

  getElectionStates: async (electionId: number): Promise<State[]> => {
    const res = await apiClient.get<State[]>(`/elections/${electionId}/states`);
    return res.data;
  },

  getElectionConstituencies: async (
    electionId: number,
    params?: {
      state_id?: number;
      district_id?: number;
      search?: string;
      limit?: number;
    }
  ): Promise<Constituency[]> => {
    const res = await apiClient.get<Constituency[]>(`/elections/${electionId}/constituencies`, { params });
    return res.data;
  },

  getCandidates: async (electionId: number, constituencyId?: number): Promise<Candidate[]> => {
    const res = await apiClient.get<Candidate[]>(`/elections/${electionId}/candidates`, {
      params: constituencyId ? { constituency_id: constituencyId } : undefined,
    });
    return res.data;
  },

  createElection: async (data: Partial<Election>): Promise<Election> => {
    const res = await apiClient.post<Election>('/elections', data);
    return res.data;
  },

  updateElection: async (id: number, data: Partial<Election>): Promise<Election> => {
    const res = await apiClient.patch<Election>(`/elections/${id}`, data);
    return res.data;
  },

  publishElection: async (id: number): Promise<Election> => {
    const res = await apiClient.post<Election>(`/elections/${id}/publish`);
    return res.data;
  },

  archiveElection: async (id: number): Promise<Election> => {
    const res = await apiClient.post<Election>(`/elections/${id}/archive`);
    return res.data;
  },

  deleteElection: async (id: number): Promise<{ message: string }> => {
    const res = await apiClient.delete<{ message: string }>(`/elections/${id}`);
    return res.data;
  },

  duplicateElection: async (id: number): Promise<Election> => {
    const res = await apiClient.post<Election>(`/elections/${id}/duplicate`);
    return res.data;
  },
};
