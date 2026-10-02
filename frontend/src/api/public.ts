import { apiClient } from './client';
import { Election, PublicStats } from '../types';

export const publicApi = {
  getStats: async (): Promise<PublicStats> => {
    const res = await apiClient.get<PublicStats>('/public/stats');
    return res.data;
  },

  getFeaturedElections: async (): Promise<Election[]> => {
    const res = await apiClient.get<Election[]>('/public/featured');
    return res.data;
  },
};
