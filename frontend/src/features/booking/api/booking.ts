// project-imports
import axios from 'utils/axios';

// types
import {
  CreateOrderRequest,
  MockPayRequest,
  MockPayResponse,
  Order,
  ReleaseRequest,
  ReserveRequest,
  ReserveResponse,
  ValidatePromotionRequest,
  ValidatePromotionResponse
} from 'features/booking/types';
import { PagedResponse } from 'types/organizer';

// ==============================|| BOOKING API ||============================== //

export const reserveTickets = async (payload: ReserveRequest): Promise<ReserveResponse> => {
  const response = await axios.post('/api/v1/tickets/reserve', payload);
  return response.data as ReserveResponse;
};

export const releaseTickets = async (payload: ReleaseRequest): Promise<void> => {
  await axios.post('/api/v1/tickets/release', payload);
};

export const createOrder = async (payload: CreateOrderRequest): Promise<Order> => {
  const response = await axios.post('/api/v1/orders', payload);
  return response.data as Order;
};

export const getOrder = async (orderId: number): Promise<Order> => {
  const response = await axios.get(`/api/v1/orders/${orderId}`);
  return response.data as Order;
};

export const getMyOrders = async (params?: { page?: number; size?: number; status?: string }): Promise<PagedResponse<Order>> => {
  const response = await axios.get('/api/v1/orders/my-orders', { params });
  return response.data as PagedResponse<Order>;
};

export const cancelOrder = async (orderId: number): Promise<void> => {
  await axios.post(`/api/v1/orders/${orderId}/cancel`);
};

export const mockPayOrder = async (orderId: number, payload: MockPayRequest): Promise<MockPayResponse> => {
  const response = await axios.post(`/api/v1/orders/${orderId}/mock-pay`, payload);
  return response.data as MockPayResponse;
};

export const validatePromotion = async (payload: ValidatePromotionRequest): Promise<ValidatePromotionResponse> => {
  const response = await axios.post('/api/v1/promotions/validate', payload);
  return response.data as ValidatePromotionResponse;
};

export const getPaymentMethods = async (): Promise<{ code: string; name: string }[]> => {
  const response = await axios.get('/api/v1/payment-methods');
  return response.data as { code: string; name: string }[];
};
