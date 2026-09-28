import axios from 'utils/axios';
import { Category, CreateEventPayload, Province } from 'types/organizer';

// ==============================|| EVENTS API ||============================== //

export const getCategories = async (): Promise<Category[]> => {
  const response = await axios.get('/api/v1/categories');
  return response.data as Category[];
};

export const getProvinces = async (): Promise<Province[]> => {
  const response = await axios.get('/api/v1/provinces');
  return response.data as Province[];
};

export const createEvent = async (payload: CreateEventPayload) => {
  const response = await axios.post('/api/v1/events', {
    ...payload,
    categoryId: Number(payload.categoryId),
    provinceId: Number(payload.provinceId)
  });
  return response.data;
};
