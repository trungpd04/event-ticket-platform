// material-ui
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project-imports
import { BankAccount, CreateEventPayload, EventSettings, TicketType } from 'types/organizer';

interface SummaryProps {
  event: CreateEventPayload;
  ticketTypes: TicketType[];
  settings: EventSettings;
  bankAccount: BankAccount;
  createdEvent?: any;
}

export default function Summary({ event, ticketTypes, settings, bankAccount, createdEvent }: SummaryProps) {
  const toDate = (value: string) => (value ? new Date(value).toLocaleString('vi-VN') : '-');

  return (
    <Grid container spacing={3}>
      <Grid size={12}>
        <Typography variant="h5" color="primary">
          Event created successfully!
        </Typography>
        {createdEvent?.id && (
          <Typography variant="body2" color="text.secondary">
            Event ID: {createdEvent.id}
          </Typography>
        )}
      </Grid>

      <Grid size={12}>
        <Typography variant="h6">Event information</Typography>
        <Typography>Title: {event.title}</Typography>
        <Typography>Location: {event.location}</Typography>
        <Typography>Category ID: {event.categoryId}</Typography>
        <Typography>Province ID: {event.provinceId}</Typography>
      </Grid>

      <Grid size={12}>
        <Typography variant="h6">Date &amp; ticket sale window</Typography>
        <Typography>Start: {toDate(event.startTime)}</Typography>
        <Typography>End: {toDate(event.endTime)}</Typography>
        <Typography>Sale start: {toDate(event.ticketSaleStartTime)}</Typography>
        <Typography>Sale end: {toDate(event.ticketSaleEndTime)}</Typography>
      </Grid>

      <Grid size={12}>
        <Typography variant="h6">Ticket types ({ticketTypes.length})</Typography>
        <Stack spacing={1}>
          {ticketTypes.map((t) => (
            <Typography key={t.id}>
              {t.name} — {t.price.toLocaleString('vi-VN')} VND, qty {t.quantity}, min/max {t.minPerOrder}/{t.maxPerOrder}
            </Typography>
          ))}
        </Stack>
      </Grid>

      <Grid size={12}>
        <Typography variant="h6">Settings</Typography>
        <Typography>Refund policy: {settings.refundPolicy || '-'}</Typography>
        <Typography>Age restriction: {settings.ageRestriction || '-'}</Typography>
        <Typography>Visibility: {settings.isPublic ? 'Public' : 'Private'}</Typography>
        <Stack direction="row" spacing={0.5} mt={1}>
          {settings.tags.map((tag) => (
            <Chip key={tag} label={tag} size="small" />
          ))}
        </Stack>
      </Grid>

      <Grid size={12}>
        <Divider />
      </Grid>

      <Grid size={12}>
        <Typography variant="h6">Payout bank account</Typography>
        <Typography>Bank: {bankAccount.bankName}</Typography>
        <Typography>Account number: {bankAccount.accountNumber}</Typography>
        <Typography>Holder: {bankAccount.accountHolder}</Typography>
        <Typography>Branch: {bankAccount.branch}</Typography>
      </Grid>
    </Grid>
  );
}
