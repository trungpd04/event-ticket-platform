// ==============================|| TYPES - ORGANIZER / EVENTS ||============================== //

export interface Category {
  id: number;
  name: string;
  description?: string;
}

export interface Province {
  id: number;
  name: string;
  code?: string;
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
  coverImageUrl: string;
  categoryId: number | '';
  provinceId: number | '';
  startTime: string;
  endTime: string;
  ticketSaleStartTime: string;
  ticketSaleEndTime: string;
}

export interface EventWizardState {
  event: CreateEventPayload;
  ticketTypes: TicketType[];
  settings: EventSettings;
  bankAccount: BankAccount;
}
