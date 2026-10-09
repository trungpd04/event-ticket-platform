import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

// material-ui
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

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
    <Container maxWidth="xl" sx={{ py: 6 }}>
      <Typography variant="h3" mb={3}>
        {intl.formatMessage({ id: 'events.title', defaultMessage: 'Events' })}
      </Typography>

      {loading ? (
        <Typography color="text.secondary">{intl.formatMessage({ id: 'events.loading', defaultMessage: 'Loading...' })}</Typography>
      ) : events.length === 0 ? (
        <Typography color="text.secondary">
          {intl.formatMessage({ id: 'events.empty', defaultMessage: 'No events found.' })}
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {events.map((event) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={event.id}>
              <Box
                sx={{
                  borderRadius: 2,
                  overflow: 'hidden',
                  bgcolor: 'background.paper',
                  boxShadow: 1
                }}
              >
                <Box
                  component="img"
                  src={event.thumbnailUrl || event.bannerUrl}
                  alt={event.title}
                  sx={{ width: '100%', height: 180, objectFit: 'cover' }}
                />
                <Box sx={{ p: 2 }}>
                  <Typography variant="h6" noWrap>
                    {event.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
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
