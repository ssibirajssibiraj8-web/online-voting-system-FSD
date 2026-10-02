import apiClient from './client';
import { State, District, Constituency, Candidate, ElectionResults } from '../types';

export const geographicApi = {
  getStates: async (): Promise<State[]> => {
    const res = await apiClient.get<State[]>('/states');
    return res.data;
  },

  getStateDistricts: async (stateId: number): Promise<District[]> => {
    const res = await apiClient.get<District[]>(`/states/${stateId}/districts`);
    return res.data;
  },

  getStateConstituencies: async (
    stateId: number,
    params?: {
      constituency_type?: string;
      district_id?: number;
      search?: string;
      limit?: number;
    }
  ): Promise<Constituency[]> => {
    const res = await apiClient.get<Constituency[]>(`/states/${stateId}/constituencies`, { params });
    return res.data;
  },

  getConstituency: async (constituencyId: number): Promise<Constituency> => {
    const res = await apiClient.get<Constituency>(`/constituencies/${constituencyId}`);
    return res.data;
  },

  getConstituencyCandidates: async (
    constituencyId: number,
    electionId?: number
  ): Promise<Candidate[]> => {
    const res = await apiClient.get<Candidate[]>(`/constituencies/${constituencyId}/candidates`, {
      params: electionId ? { election_id: electionId } : undefined,
    });
    return res.data;
  },

  getConstituencyResults: async (
    constituencyId: number,
    electionId?: number
  ): Promise<ElectionResults> => {
    const res = await apiClient.get<ElectionResults>(`/constituencies/${constituencyId}/results`, {
      params: electionId ? { election_id: electionId } : undefined,
    });
    return res.data;
  },
};
