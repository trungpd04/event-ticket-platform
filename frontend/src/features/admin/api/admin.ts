// project-imports
import axios from 'utils/axios';

// types
import {
  AdminEvent,
  AdminEventDetail,
  Category,
  EventUpdateRequest,
  FeePolicy,
  PagedResponse,
  SearchAdminEventsParams,
  UpdateEventFeePolicyPayload,
  UpdateEventStatusPayload,
  Checker,
  CreateCheckerPayload,
  UserStatus
} from '../types/admin';

// ==============================|| ADMIN API ||============================== //

export const searchAdminEvents = async (params: SearchAdminEventsParams = {}): Promise<PagedResponse<AdminEvent>> => {
  const response = await axios.get('/api/v1/admin/events', { params });
  return response.data as PagedResponse<AdminEvent>;
};

export const getEventDetail = async (id: number): Promise<AdminEventDetail> => {
  const response = await axios.get(`/api/v1/admin/events/${id}`);
  return response.data as AdminEventDetail;
};

export const updateEventStatus = async (id: number, payload: UpdateEventStatusPayload): Promise<AdminEvent> => {
  const response = await axios.put(`/api/v1/admin/events/${id}/status`, payload);
  return response.data as AdminEvent;
};

export const updateEventFeePolicy = async (id: number, payload: UpdateEventFeePolicyPayload): Promise<AdminEvent> => {
  const response = await axios.put(`/api/v1/admin/events/${id}/fee-policy`, payload);
  return response.data as AdminEvent;
};

export const getCategoriesAdmin = async (): Promise<Category[]> => {
  const response = await axios.get('/api/v1/admin/categories');
  return response.data as Category[];
};

export const createCategory = async (payload: Omit<Category, 'id'>): Promise<Category> => {
  const response = await axios.post('/api/v1/admin/categories', payload);
  return response.data as Category;
};

export const updateCategory = async (id: number, payload: Omit<Category, 'id'>): Promise<Category> => {
  const response = await axios.put(`/api/v1/admin/categories/${id}`, payload);
  return response.data as Category;
};

export const getFeePolicies = async (): Promise<FeePolicy[]> => {
  const response = await axios.get('/api/v1/admin/fee-policies');
  return response.data as FeePolicy[];
};

export const createFeePolicy = async (payload: Omit<FeePolicy, 'id'>): Promise<FeePolicy> => {
  const response = await axios.post('/api/v1/admin/fee-policies', payload);
  return response.data as FeePolicy;
};

export const updateFeePolicy = async (id: number, payload: Omit<FeePolicy, 'id'>): Promise<FeePolicy> => {
  const response = await axios.put(`/api/v1/admin/fee-policies/${id}`, payload);
  return response.data as FeePolicy;
};

export const getCheckers = async (): Promise<Checker[]> => {
  const response = await axios.get('/api/v1/admin/checkers');
  return response.data as Checker[];
};

export const createChecker = async (payload: CreateCheckerPayload): Promise<Checker> => {
  const response = await axios.post('/api/v1/admin/checkers', payload);
  return response.data as Checker;
};

export const updateCheckerStatus = async (id: number, status: UserStatus): Promise<Checker> => {
  const response = await axios.put(`/api/v1/admin/checkers/${id}/status`, { status });
  return response.data as Checker;
};

export const getEventUpdateRequests = async (params: { status?: string; page?: number; size?: number } = {}): Promise<PagedResponse<EventUpdateRequest>> => {
  const response = await axios.get('/api/v1/admin/event-update-requests', { params });
  return response.data as PagedResponse<EventUpdateRequest>;
};

export const getEventUpdateRequestDetail = async (id: number): Promise<EventUpdateRequest> => {
  const response = await axios.get(`/api/v1/admin/event-update-requests/${id}`);
  return response.data as EventUpdateRequest;
};

export const approveEventUpdateRequest = async (id: number): Promise<EventUpdateRequest> => {
  const response = await axios.post(`/api/v1/admin/event-update-requests/${id}/approve`);
  return response.data as EventUpdateRequest;
};

export const rejectEventUpdateRequest = async (id: number, reason: string): Promise<EventUpdateRequest> => {
  const response = await axios.post(`/api/v1/admin/event-update-requests/${id}/reject`, { rejectionReason: reason });
  return response.data as EventUpdateRequest;
};
