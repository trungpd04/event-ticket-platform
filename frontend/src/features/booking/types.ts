// ==============================|| TYPES - BOOKING ||============================== //

export interface ReserveItemRequest {
  ticketTypeId: number;
  quantity: number;
}

export interface ReserveRequest {
  eventId: number;
  items: ReserveItemRequest[];
  reservationMinutes?: number;
}

export interface ReservedItem {
  ticketTypeId: number;
  ticketTypeName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  ticketIds: number[];
}

export interface ReserveResponse {
  reservationId: string;
  reservedUntil: string;
  items: ReservedItem[];
  totalAmount: number;
}

export interface ReleaseRequest {
  reservationId: string;
}

export interface OrderItem {
  ticketTypeId: number;
  ticketTypeName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Order {
  id: number;
  orderCode: string;
  customerId: number;
  eventId: number;
  status: 'PENDING_PAYMENT' | 'PAID' | 'CANCELLED' | 'EXPIRED';
  totalTicketAmount: number;
  discountAmount: number;
  platformFee: number;
  commissionFee: number;
  finalAmount: number;
  paidAt?: string;
  expiredAt?: string;
  items: OrderItem[];
}

export interface CreateOrderRequest {
  reservationId: string;
  promotionCode?: string;
}

export interface MockPayRequest {
  paymentMethod: string;
  returnMessage?: string;
}

export interface MockPayResponse {
  orderId: number;
  status: string;
  paidAt: string;
  finalAmount: number;
  message: string;
}

export interface Promotion {
  id: number;
  code: string;
  name: string;
  discountPercent: number;
  maxDiscount: number;
  usedCount: number;
  maxUsage: number;
  startTime: string;
  endTime: string;
}

export interface ValidatePromotionRequest {
  code: string;
  eventId: number;
}

export interface ValidatePromotionResponse {
  valid: boolean;
  promotion?: Promotion;
  discountAmount?: number;
  message?: string;
}

export interface PaymentMethod {
  code: string;
  name: string;
}
