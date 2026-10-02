import apiClient from './client';
import {
  VoterEligibility,
  VoteStatus,
  VoteReceipt,
  ElectionResults,
  ReceiptVerification,
} from '../types';

export const votingApi = {
  getEligibility: async (electionId: number, constituencyId?: number): Promise<VoterEligibility> => {
    const res = await apiClient.get<VoterEligibility>(
      `/elections/${electionId}/eligibility`,
      { params: constituencyId ? { constituency_id: constituencyId } : undefined }
    );
    return res.data;
  },

  getVoteStatus: async (electionId: number, constituencyId?: number): Promise<VoteStatus> => {
    const res = await apiClient.get<VoteStatus>(
      `/elections/${electionId}/vote-status`,
      { params: constituencyId ? { constituency_id: constituencyId } : undefined }
    );
    return res.data;
  },

  castVote: async (
    electionId: number,
    candidateId: number,
    constituencyId?: number
  ): Promise<VoteReceipt> => {
    const res = await apiClient.post<VoteReceipt>(`/elections/${electionId}/vote`, {
      candidate_id: candidateId,
      constituency_id: constituencyId,
    });
    return res.data;
  },

  getResults: async (electionId: number, constituencyId?: number): Promise<ElectionResults> => {
    const res = await apiClient.get<ElectionResults>(
      `/elections/${electionId}/results`,
      { params: constituencyId ? { constituency_id: constituencyId } : undefined }
    );
    return res.data;
  },

  verifyReceipt: async (receiptCode: string): Promise<ReceiptVerification> => {
    const res = await apiClient.get<ReceiptVerification>(
      `/voting/verify-receipt/${encodeURIComponent(receiptCode)}`
    );
    return res.data;
  },
};
