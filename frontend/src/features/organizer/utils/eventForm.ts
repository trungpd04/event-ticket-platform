// types
import { BankAccount, CreateEventPayload, EventDetail, EventSettings, TicketType } from 'types/organizer';

export const initialSettings: EventSettings = {
  refundPolicy: '',
  ageRestriction: '',
  tags: [],
  isPublic: true
};

export const initialBankAccount: BankAccount = {
  bankName: '',
  accountNumber: '',
  accountHolder: '',
  branch: ''
};

export const initialEvent: CreateEventPayload = {
  title: '',
  description: '',
  location: '',
  thumbnailFileId: '',
  bannerFileId: '',
  thumbnailUrl: '',
  bannerUrl: '',
  categoryId: '',
  provinceId: '',
  wardId: '',
  startTime: '',
  endTime: '',
  ticketSaleStartTime: '',
  ticketSaleEndTime: '',
  ticketTypes: [],
  settings: initialSettings,
  payoutInfo: initialBankAccount
};

/** `datetime-local` inputs expect `YYYY-MM-DDTHH:mm`. */
export const toDateTimeInput = (value?: string | null): string => {
  if (!value) return '';
  return value.length >= 16 ? value.slice(0, 16) : value;
};

export const mapDetailToFormValues = (detail: EventDetail): CreateEventPayload => ({
  title: detail.title ?? '',
  description: detail.description ?? '',
  location: detail.location ?? '',
  thumbnailFileId: detail.thumbnailFileId ?? '',
  bannerFileId: detail.bannerFileId ?? '',
  thumbnailUrl: detail.thumbnailUrl ?? '',
  bannerUrl: detail.bannerUrl ?? '',
  categoryId: detail.category?.id ?? '',
  provinceId: detail.province?.id ?? '',
  wardId: detail.ward?.id ?? detail.wardId ?? '',
  startTime: toDateTimeInput(detail.startTime),
  endTime: toDateTimeInput(detail.endTime),
  ticketSaleStartTime: toDateTimeInput(detail.ticketSaleStartTime),
  ticketSaleEndTime: toDateTimeInput(detail.ticketSaleEndTime),
  ticketTypes: (detail.ticketTypes ?? []).map(
    (ticket): TicketType => ({
      id: String(ticket.id ?? `ticket-${Math.random().toString(36).slice(2)}`),
      ticketTypeId: Number(ticket.id) || undefined,
      name: ticket.name,
      description: ticket.description ?? '',
      price: Number(ticket.price),
      totalQuantity: Number(ticket.totalQuantity ?? 0),
      availableQuantity: ticket.availableQuantity,
      minPerOrder: Number(ticket.minPerOrder ?? 1),
      maxPerOrder: Number(ticket.maxPerOrder ?? ticket.totalQuantity ?? 1)
    })
  ),
  settings: {
    refundPolicy: detail.settings?.refundPolicy ?? '',
    ageRestriction: detail.settings?.ageRestriction ?? '',
    tags: detail.settings?.tags ?? [],
    isPublic: detail.settings?.isPublic ?? true
  },
  payoutInfo: {
    bankName: detail.payoutInfo?.bankName ?? '',
    accountNumber: detail.payoutInfo?.accountNumber ?? '',
    accountHolder: detail.payoutInfo?.accountHolder ?? '',
    branch: detail.payoutInfo?.branch ?? ''
  }
});
