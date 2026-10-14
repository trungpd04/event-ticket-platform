import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

// material-ui
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import { SearchNormal1, Calendar1, Location } from 'iconsax-reactjs';
import EventButton from 'components/event/EventButton';

// third-party
import { useIntl } from 'react-intl';

// project-imports
import { searchEvents } from 'api/events';
import { Event } from 'types/organizer';

// ==============================|| EVENTS PAGE ||============================== //

export default function EventsPage() {
  const intl = useIntl();
  const [searchParams] = useSearchParams();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const title = searchParams.get('title') || undefined;
  const location = searchParams.get('location') || undefined;
  const when = searchParams.get('when') || undefined;

  useEffect(() => {
    setLoading(true);
    searchEvents({ title, location, when, status: 'PUBLISHED', page: 0, size: 20 })
      .then((data) => setEvents(data.content))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, [title, location, when]);

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 5, md: 9 } }}>
      <Typography variant="h2" mb={1} sx={{ fontWeight: 800, letterSpacing: '-0.06em' }}>
        {intl.formatMessage({ id: 'events.title', defaultMessage: 'Events' })}
      </Typography>
      <Typography color="text.secondary" mb={4}>Find your next unforgettable experience.</Typography>
      <Paper sx={{ p: 1.5, mb: 5, borderRadius: 3, display: 'flex', gap: 1.5, flexWrap: 'wrap', bgcolor: 'background.paper' }}>
        <TextField defaultValue={title} placeholder="Search event" size="small" sx={{ flex: 2, minWidth: 220 }} InputProps={{ startAdornment: <InputAdornment position="start"><SearchNormal1 size={18} /></InputAdornment> }} />
        <TextField defaultValue={location} placeholder="Location" size="small" sx={{ flex: 1, minWidth: 160 }} InputProps={{ startAdornment: <InputAdornment position="start"><Location size={18} /></InputAdornment> }} />
        <TextField defaultValue={when} type="date" size="small" sx={{ flex: 1, minWidth: 160 }} InputLabelProps={{ shrink: true }} InputProps={{ startAdornment: <InputAdornment position="start"><Calendar1 size={18} /></InputAdornment> }} />
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
              <Box
                sx={{
                borderRadius: 3,
                  overflow: 'hidden',
                  bgcolor: 'background.paper',
                border: 1,
                borderColor: 'rgba(255,255,255,0.08)',
                transition: 'transform .2s, box-shadow .2s',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 16px 40px rgba(0,0,0,.25)' }
                }}
              >
                <Box
                  component="img"
                  src={event.thumbnailUrl || event.bannerUrl}
                  alt={event.title}
                  sx={{ width: '100%', height: 210, objectFit: 'cover' }}
                />
                <Box sx={{ p: 2 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="caption" color="primary.light" fontWeight={700}>{event.category?.name || 'EVENT'}</Typography>
                    <Typography variant="caption" color="text.secondary">{new Date(event.startTime).toLocaleDateString()}</Typography>
                  </Stack>
                  <Typography variant="h6" noWrap fontWeight={700}>
                    {event.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap sx={{ mt: 0.5 }}>
                    {event.location}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}
