// project-imports
import axios from 'utils/axios';

// types
import { PagedResponse } from 'types/organizer';
import { Payout, PayoutStatus } from 'features/organizer/api/payout';

// ==============================|| ADMIN PAYOUT API ||============================== //

export const getPayoutRequests = async (params?: {
  status?: PayoutStatus;
  organizerId?: number;
  eventId?: number;
  page?: number;
  size?: number;
}): Promise<PagedResponse<Payout>> => {
  const response = await axios.get('/api/v1/admin/payout-requests', { params });
  return response.data as PagedResponse<Payout>;
};

export const getPayoutRequest = async (id: number): Promise<Payout> => {
  const response = await axios.get(`/api/v1/admin/payout-requests/${id}`);
  return response.data as Payout;
};

export const approvePayoutRequest = async (id: number, approvedNetAmount?: number, note?: string): Promise<Payout> => {
  const response = await axios.post(`/api/v1/admin/payout-requests/${id}/approve`, { approvedNetAmount, note });
  return response.data as Payout;
};

export const rejectPayoutRequest = async (id: number, reason: string): Promise<Payout> => {
  const response = await axios.post(`/api/v1/admin/payout-requests/${id}/reject`, { reason });
  return response.data as Payout;
};

export const markPayoutPaid = async (
  id: number,
  transactionRef: string,
  paidAt: string,
  proofFileId?: number
): Promise<Payout> => {
  const response = await axios.post(`/api/v1/admin/payout-requests/${id}/mark-paid`, {
    transactionRef,
    paidAt,
    proofFileId
  });
  return response.data as Payout;
};

export const getPendingPayoutCount = async (): Promise<number> => {
  const response = await axios.get('/api/v1/admin/payout-requests/pending-count');
  return response.data as number;
};
