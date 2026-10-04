// material-ui
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

// third-party
import { useIntl } from 'react-intl';

// project-imports
import EventButton from 'components/event/EventButton';
import { CreateEventPayload, TicketType } from 'types/organizer';

// assets
import { Trash } from 'iconsax-reactjs';

interface StepTicketsProps {
  values: CreateEventPayload;
  ticketTypes: TicketType[];
  setTicketTypes: (types: TicketType[]) => void;
  handleChange: (e: React.ChangeEvent<any>) => void;
  handleBlur: (e: React.FocusEvent<any>) => void;
}

export default function StepTickets({ values, ticketTypes, setTicketTypes, handleChange, handleBlur }: StepTicketsProps) {
  const intl = useIntl();

  const addTicketType = () => {
    setTicketTypes([
      ...ticketTypes,
      { id: Math.random().toString(36).slice(2), name: '', price: 0, quantity: 0, minPerOrder: 1, maxPerOrder: 10 }
    ]);
  };

  const updateTicket = (id: string, field: keyof TicketType, value: string | number) => {
    setTicketTypes(ticketTypes.map((t) => (t.id === id ? { ...t, [field]: value } : t)));
  };

  const removeTicket = (id: string) => {
    setTicketTypes(ticketTypes.filter((t) => t.id !== id));
  };

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          fullWidth
          name="startTime"
          label={intl.formatMessage({ id: 'createEvent.eventStartTime' })}
          type="datetime-local"
          value={values.startTime}
          onChange={handleChange}
          onBlur={handleBlur}
          InputLabelProps={{ shrink: true }}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          fullWidth
          name="endTime"
          label={intl.formatMessage({ id: 'createEvent.eventEndTime' })}
          type="datetime-local"
          value={values.endTime}
          onChange={handleChange}
          onBlur={handleBlur}
          InputLabelProps={{ shrink: true }}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          fullWidth
          name="ticketSaleStartTime"
          label={intl.formatMessage({ id: 'createEvent.ticketSaleStart' })}
          type="datetime-local"
          value={values.ticketSaleStartTime}
          onChange={handleChange}
          onBlur={handleBlur}
          InputLabelProps={{ shrink: true }}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          fullWidth
          name="ticketSaleEndTime"
          label={intl.formatMessage({ id: 'createEvent.ticketSaleEnd' })}
          type="datetime-local"
          value={values.ticketSaleEndTime}
          onChange={handleChange}
          onBlur={handleBlur}
          InputLabelProps={{ shrink: true }}
        />
      </Grid>

      <Grid size={12}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
          <Typography variant="h5">{intl.formatMessage({ id: 'createEvent.ticketTypes' })}</Typography>
          <EventButton variant="outlined" color="primary" onClick={addTicketType}>
            {intl.formatMessage({ id: 'createEvent.addTicketType' })}
          </EventButton>
        </Stack>
      </Grid>

      {ticketTypes.map((ticket) => (
        <Grid size={12} key={ticket.id}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
            <TextField
              label={intl.formatMessage({ id: 'createEvent.ticketName' })}
              value={ticket.name}
              onChange={(e) => updateTicket(ticket.id, 'name', e.target.value)}
              sx={{ flex: 2 }}
            />
            <TextField
              label={intl.formatMessage({ id: 'createEvent.ticketPrice' })}
              type="number"
              value={ticket.price}
              onChange={(e) => updateTicket(ticket.id, 'price', Number(e.target.value))}
              sx={{ flex: 1 }}
            />
            <TextField
              label={intl.formatMessage({ id: 'createEvent.ticketQuantity' })}
              type="number"
              value={ticket.quantity}
              onChange={(e) => updateTicket(ticket.id, 'quantity', Number(e.target.value))}
              sx={{ flex: 1 }}
            />
            <TextField
              label={intl.formatMessage({ id: 'createEvent.ticketMin' })}
              type="number"
              value={ticket.minPerOrder}
              onChange={(e) => updateTicket(ticket.id, 'minPerOrder', Number(e.target.value))}
              sx={{ flex: 1 }}
            />
            <TextField
              label={intl.formatMessage({ id: 'createEvent.ticketMax' })}
              type="number"
              value={ticket.maxPerOrder}
              onChange={(e) => updateTicket(ticket.id, 'maxPerOrder', Number(e.target.value))}
              sx={{ flex: 1 }}
            />
            <IconButton color="error" onClick={() => removeTicket(ticket.id)}>
              <Trash />
            </IconButton>
          </Stack>
        </Grid>
      ))}
    </Grid>
  );
}
