// project-imports
import axios from 'utils/axios';

// types
import {
  AdminEvent,
  AdminEventDetail,
  Category,
  FeePolicy,
  PagedResponse,
  SearchAdminEventsParams,
  UpdateEventFeePolicyPayload,
  UpdateEventStatusPayload
} from '../types/admin';

// ==============================|| ADMIN API ||============================== //

export const searchAdminEvents = async (params: SearchAdminEventsParams = {}): Promise<PagedResponse<AdminEvent>> => {
  const response = await axios.get('/api/v1/events', { params });
  return response.data as PagedResponse<AdminEvent>;
};

export const getEventDetail = async (id: number): Promise<AdminEventDetail> => {
  const response = await axios.get(`/api/v1/events/${id}`);
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
