import apiClient from './client';
import { Party } from '../types';

export const partiesApi = {
  getParties: async (search?: string): Promise<Party[]> => {
    const res = await apiClient.get<Party[]>('/parties', {
      params: search ? { search } : undefined,
    });
    return res.data;
  },

  getParty: async (id: number): Promise<Party> => {
    const res = await apiClient.get<Party>(`/parties/${id}`);
    return res.data;
  },

  createParty: async (data: Partial<Party>): Promise<Party> => {
    const res = await apiClient.post<Party>('/parties', data);
    return res.data;
  },

  updateParty: async (id: number, data: Partial<Party>): Promise<Party> => {
    const res = await apiClient.patch<Party>(`/parties/${id}`, data);
    return res.data;
  },

  deleteParty: async (id: number): Promise<{ message: string }> => {
    const res = await apiClient.delete<{ message: string }>(`/parties/${id}`);
    return res.data;
  },
};
