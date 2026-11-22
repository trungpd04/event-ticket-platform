// ==============================|| ADMIN - TYPES ||============================== //

// types
import { BankAccount, EventSettings } from 'types/organizer';

export interface AdminEvent {
  id: number;
  title: string;
  description: string;
  location: string;
  startTime: string;
  endTime: string;
  status: 'PENDING' | 'PENDING_REVIEW' | 'PUBLISHED' | 'CLOSED';
  organizerId: number;
  feePolicyId?: number;
  thumbnailUrl?: string;
  bannerUrl?: string;
  category?: {
    id: number;
    name: string;
  };
  province?: {
    id: number;
    name: string;
  };
}

export interface AdminEventDetail extends AdminEvent {
  ticketSaleStartTime: string;
  ticketSaleEndTime: string;
  ticketTypes: AdminTicketType[];
}

export interface AdminTicketType {
  id: number;
  name: string;
  price: number;
  totalQuantity: number;
  minPerOrder: number;
  maxPerOrder: number;
}

export interface Category {
  id: number;
  name: string;
  slug?: string;
  iconUrl?: string;
  isActive: boolean;
}

export interface FeePolicy {
  id: number;
  name: string;
  organizerCommissionRate: number;
  customerFeeRate: number;
  customerFlatFee: number;
  isActive: boolean;
  isDefault: boolean;
}

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export type EventStatus = 'PENDING' | 'PENDING_REVIEW' | 'PUBLISHED' | 'ONGOING' | 'CLOSED';

export interface SearchAdminEventsParams {
  title?: string;
  status?: EventStatus;
  categoryId?: number;
  provinceId?: number;
  page?: number;
  size?: number;
}

export interface UpdateEventStatusPayload {
  status: EventStatus;
}

export interface UpdateEventFeePolicyPayload {
  feePolicyId: number;
}

export type UserStatus = 'ACTIVE' | 'BANNED';

export interface Checker {
  id: number;
  email: string;
  fullName: string;
  phone?: string;
  roles: string[];
  status: UserStatus;
}

export interface CreateCheckerPayload {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
}

export type EventUpdateRequestStatus = 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';

export interface EventUpdateRequestPayload {
  description?: string;
  thumbnailFileId?: number | null;
  bannerFileId?: number | null;
  categoryId?: number | null;
  settings?: EventSettings;
  payoutInfo?: BankAccount;
}

export interface EventUpdateRequest {
  id: number;
  eventId: number;
  eventTitle?: string;
  organizerId: number;
  organizerEmail?: string;
  payload: EventUpdateRequestPayload;
  status: EventUpdateRequestStatus;
  rejectionReason?: string;
  reviewedBy?: number;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}
