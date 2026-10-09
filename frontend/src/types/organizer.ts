// ==============================|| TYPES - ORGANIZER / EVENTS ||============================== //

export interface Category {
  id: number;
  name: string;
  description?: string;
}

export interface Province {
  id: number;
  name: string;
  provinceCode?: string;
}

export interface Ward {
  id: number;
  wardCode: string;
  name: string;
}

export interface TicketType {
  id: string;
  name: string;
  price: number;
  quantity: number;
  minPerOrder: number;
  maxPerOrder: number;
}

export interface EventSettings {
  refundPolicy: string;
  ageRestriction: string;
  tags: string[];
  isPublic: boolean;
}

export interface BankAccount {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  branch: string;
}

export interface CreateEventPayload {
  title: string;
  description: string;
  location: string;
  thumbnailFileId: number | '';
  bannerFileId: number | '';
  thumbnailUrl?: string;
  bannerUrl?: string;
  categoryId: number | '';
  provinceId: number | '';
  wardId: number | '';
  startTime: string;
  endTime: string;
  ticketSaleStartTime: string;
  ticketSaleEndTime: string;
}

export interface Event {
  id: number;
  title: string;
  description: string;
  location: string;
  startTime: string;
  endTime: string;
  thumbnailUrl?: string;
  bannerUrl?: string;
  status: string;
  organizerId: number;
  category?: Category;
  province?: Province;
  ticketSaleStartTime: string;
  ticketSaleEndTime: string;
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

export interface EventWizardState {
  event: CreateEventPayload;
  ticketTypes: TicketType[];
  settings: EventSettings;
  bankAccount: BankAccount;
}
