// project-imports
import axios from 'utils/axios';

// types
import { PagedResponse } from 'types/organizer';

// ==============================|| ORGANIZER PAYOUT API ||============================== //

export interface PayoutSummary {
  eventId: number;
  eventTitle: string;
  eventStatus: string;
  canRequest: boolean;
  reason: string | null;
  holdUntil: string;
  orderCount: number;
  grossTicketAmount: number;
  discountAmount: number;
  grossRevenue: number;
  platformFee: number;
  commissionFee: number;
  netRevenue: number;
  existingPayout: Payout | null;
}

export type PayoutStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAID' | 'CANCELLED';

export interface Payout {
  id: number;
  requestCode: string;
  eventId: number;
  eventTitle: string;
  status: PayoutStatus;
  orderCount: number;
  grossTicketAmount: number;
  discountAmount: number;
  grossRevenue: number;
  platformFee: number;
  commissionFee: number;
  netRevenue: number;
  approvedNetAmount: number;
  eventEndTimeSnapshot: string;
  holdUntil: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  note: string;
  rejectionReason: string;
  approvedBy: number;
  approvedAt: string;
  paidAt: string;
  transactionRef: string;
  proofFileId: number;
  createdAt: string;
  updatedAt: string;
}

export const getPayoutSummary = async (eventId: number): Promise<PayoutSummary> => {
  const response = await axios.get('/api/v1/organizer/payout-requests/summary', { params: { eventId } });
  return response.data as PayoutSummary;
};

export const createPayoutRequest = async (eventId: number, note?: string): Promise<Payout> => {
  const response = await axios.post('/api/v1/organizer/payout-requests', { eventId, note });
  return response.data as Payout;
};

export const getMyPayoutRequests = async (params?: { status?: PayoutStatus; page?: number; size?: number }): Promise<PagedResponse<Payout>> => {
  const response = await axios.get('/api/v1/organizer/payout-requests', { params });
  return response.data as PagedResponse<Payout>;
};

export const cancelPayoutRequest = async (id: number): Promise<Payout> => {
  const response = await axios.post(`/api/v1/organizer/payout-requests/${id}/cancel`);
  return response.data as Payout;
};
