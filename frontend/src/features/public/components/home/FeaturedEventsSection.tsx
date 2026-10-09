import { useEffect, useState } from 'react';

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

// ==============================|| FEATURED EVENTS SECTION ||============================== //

export default function FeaturedEventsSection() {
  const intl = useIntl();
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    searchEvents({ status: 'PUBLISHED', timeFilter: 'UPCOMING', page: 0, size: 8 })
      .then((data) => setEvents(data.content))
      .catch(() => setEvents([]));
  }, []);

  return (
    <Box sx={{ py: 6 }}>
      <Container maxWidth="xl">
        <Typography variant="h4" mb={3}>
          {intl.formatMessage({ id: 'home.featured.title', defaultMessage: 'Featured events' })}
        </Typography>

        {events.length === 0 ? (
          <Typography color="text.secondary">
            {intl.formatMessage({ id: 'home.featured.empty', defaultMessage: 'No featured events yet.' })}
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
    </Box>
  );
}
