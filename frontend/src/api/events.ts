import axios from 'utils/axios';
import { Category, CreateEventPayload, Event, PagedResponse, Province, Ward } from 'types/organizer';

// ==============================|| EVENTS API ||============================== //

export const getCategories = async (): Promise<Category[]> => {
  const response = await axios.get('/api/v1/categories');
  return response.data as Category[];
};

export const getProvinces = async (): Promise<Province[]> => {
  const response = await axios.get('/api/v1/provinces');
  return response.data as Province[];
};

export const getWards = async (provinceCode: string): Promise<Ward[]> => {
  const response = await axios.get(`/api/v1/provinces/${provinceCode}/wards`);
  return response.data as Ward[];
};

export const createEvent = async (payload: CreateEventPayload) => {
  const response = await axios.post('/api/v1/events', {
    ...payload,
    categoryId: Number(payload.categoryId),
    provinceId: Number(payload.provinceId),
    wardId: Number(payload.wardId),
    thumbnailFileId: Number(payload.thumbnailFileId),
    bannerFileId: Number(payload.bannerFileId)
  });
  return response.data;
};

interface SearchEventsParams {
  title?: string;
  location?: string;
  when?: string;
  status?: string;
  timeFilter?: string;
  categoryId?: number;
  provinceId?: number;
  page?: number;
  size?: number;
}

export const searchEvents = async (params: SearchEventsParams = {}): Promise<PagedResponse<Event>> => {
  const searchParams = new URLSearchParams();
  if (params.title) searchParams.set('title', params.title);
  if (params.location) searchParams.set('location', params.location);
  if (params.when) searchParams.set('fromDate', `${params.when}T00:00:00`);
  if (params.status) searchParams.set('status', params.status);
  if (params.timeFilter) searchParams.set('timeFilter', params.timeFilter);
  if (params.categoryId) searchParams.set('categoryId', String(params.categoryId));
  if (params.provinceId) searchParams.set('provinceId', String(params.provinceId));
  if (params.page !== undefined) searchParams.set('page', String(params.page));
  if (params.size !== undefined) searchParams.set('size', String(params.size));

  const response = await axios.get(`/api/v1/events?${searchParams.toString()}`);
  return response.data as PagedResponse<Event>;
};
