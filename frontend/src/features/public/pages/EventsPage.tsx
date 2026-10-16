import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

// material-ui
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import { SearchNormal1, Calendar1, Location } from 'iconsax-reactjs';
import EventButton from 'components/event/EventButton';
import EventCard from 'components/event/EventCard';

// third-party
import { useIntl } from 'react-intl';

// project-imports
import { getPublicTicketTypes, searchEvents } from 'api/events';
import { Event } from 'types/organizer';

// ==============================|| EVENTS PAGE ||============================== //

export default function EventsPage() {
  const intl = useIntl();
  const [searchParams] = useSearchParams();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [pricesByEvent, setPricesByEvent] = useState<Record<number, number | null>>({});

  const title = searchParams.get('title') || undefined;
  const location = searchParams.get('location') || undefined;
  const when = searchParams.get('when') || undefined;
  const categoryIdParam = searchParams.get('categoryId');
  const parsedCategoryId = categoryIdParam ? Number(categoryIdParam) : undefined;
  const categoryId = parsedCategoryId && Number.isInteger(parsedCategoryId) ? parsedCategoryId : undefined;

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    searchEvents({
      title,
      location,
      when,
      categoryId,
      status: 'PUBLISHED',
      page: 0,
      size: 20
    })
      .then(async (data) => {
        if (cancelled) return;
        setEvents(data.content);

        const prices = await Promise.all(
          data.content.map(async (event) => {
            try {
              const ticketTypes = (await getPublicTicketTypes(event.id)) as Array<{ price?: number }>;
              const availablePrices = ticketTypes.map((ticket) => Number(ticket.price)).filter((price) => Number.isFinite(price));
              return [event.id, availablePrices.length ? Math.min(...availablePrices) : null] as const;
            } catch {
              return [event.id, null] as const;
            }
          })
        );
        if (!cancelled) setPricesByEvent(Object.fromEntries(prices));
      })
      .catch(() => {
        if (!cancelled) {
          setEvents([]);
          setPricesByEvent({});
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [title, location, when, categoryId]);

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 5, md: 9 } }}>
      <Typography variant="h2" mb={1} sx={{ fontWeight: 800, letterSpacing: '-0.06em' }}>
        {intl.formatMessage({ id: 'events.title', defaultMessage: 'Events' })}
      </Typography>
      <Typography color="text.secondary" mb={4}>Find your next unforgettable experience.</Typography>
      <Paper sx={{ p: 1.5, mb: 5, borderRadius: 3, display: 'flex', gap: 1.5, flexWrap: 'wrap', bgcolor: 'background.paper' }}>
        <TextField
          defaultValue={title}
          placeholder="Search event"
          size="small"
          sx={{ flex: 2, minWidth: 220 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchNormal1 size={18} />
              </InputAdornment>
            )
          }}
        />
        <TextField
          defaultValue={location}
          placeholder="Location"
          size="small"
          sx={{ flex: 1, minWidth: 160 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Location size={18} />
              </InputAdornment>
            )
          }}
        />
        <TextField
          defaultValue={when}
          type="date"
          size="small"
          sx={{ flex: 1, minWidth: 160 }}
          InputLabelProps={{ shrink: true }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Calendar1 size={18} />
              </InputAdornment>
            )
          }}
        />
        <EventButton variant="contained">Search</EventButton>
      </Paper>

      {loading ? (
        <Typography color="text.secondary">{intl.formatMessage({ id: 'events.loading', defaultMessage: 'Loading...' })}</Typography>
      ) : events.length === 0 ? (
        <Typography color="text.secondary">{intl.formatMessage({ id: 'events.empty', defaultMessage: 'No events found.' })}</Typography>
      ) : (
        <Grid container spacing={3}>
          {events.map((event) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={event.id}>
              <EventCard event={event} price={pricesByEvent[event.id]} />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}
