import axios from 'utils/axios';
import { Category, CreateEventPayload, Province, Ward } from 'types/organizer';

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
    wardId: Number(payload.wardId)
  });
  return response.data;
};
