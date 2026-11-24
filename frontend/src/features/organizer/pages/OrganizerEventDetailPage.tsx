import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// material-ui
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// third-party
import { useIntl } from 'react-intl';
import { ArrowLeft2, Calendar1, Edit2, Location, Tag, Ticket } from 'iconsax-reactjs';

// project-imports
import { getOrganizerEventDetail } from 'api/events';
import { openSnackbar } from 'api/snackbar';
import StatusBadge from 'features/admin/components/StatusBadge';
import { EventStatus } from 'features/admin/types/admin';
import { EventDetail } from 'types/organizer';
import { formatCurrency, formatDateTime, formatLocation } from 'utils/format';

// ==============================|| ORGANIZER EVENT DETAIL PAGE ||============================== //

export default function OrganizerEventDetailPage() {
  const intl = useIntl();
  const navigate = useNavigate();
  const { eventId } = useParams();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const id = Number(eventId);
    if (!Number.isInteger(id) || id <= 0) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setNotFound(false);

    getOrganizerEventDetail(id)
      .then((data) => {
        if (!cancelled) setEvent(data);
      })
      .catch(() => {
        if (!cancelled) {
          setEvent(null);
          setNotFound(true);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [eventId]);

  if (loading) {
    return (
      <Box sx={{ minHeight: '60vh', display: 'grid', placeItems: 'center' }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (notFound || !event) {
    return (
      <Container maxWidth="md" sx={{ py: 16, textAlign: 'center' }}>
        <Typography variant="h3" fontWeight={800} gutterBottom>
          {intl.formatMessage({ id: 'eventDetail.notFound', defaultMessage: 'Event not found' })}
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>
          {intl.formatMessage({
            id: 'eventDetail.notFoundDescription',
            defaultMessage: 'This event may have been removed or you do not have permission to view it.'
          })}
        </Typography>
        <Button variant="contained" onClick={() => navigate('/organizer/events')}>
          {intl.formatMessage({ id: 'organizer.events.backToList', defaultMessage: 'Back to my events' })}
        </Button>
      </Container>
    );
  }

  const eventImage = event.bannerUrl || event.thumbnailUrl;
  const isEditable = event.status !== 'CLOSED';

  return (
    <Box>
      <Button
        variant="text"
        color="secondary"
        startIcon={<ArrowLeft2 size={18} />}
        onClick={() => navigate('/organizer/events')}
        sx={{ mb: 2 }}
      >
        {intl.formatMessage({ id: 'organizer.events.backToList', defaultMessage: 'Back to my events' })}
      </Button>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="flex-start">
        <Box sx={{ flex: 1, width: '100%' }}>
          {eventImage && (
            <Box
              component="img"
              src={eventImage}
              alt={event.title}
              sx={{
                width: '100%',
                height: { xs: 220, md: 360 },
                objectFit: 'cover',
                borderRadius: 2,
                mb: 3
              }}
            />
          )}

          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
            <StatusBadge status={event.status as EventStatus} />
            {event.category?.name && <Chip size="small" label={event.category.name} />}
          </Stack>

          <Typography variant="h2" fontWeight={800} gutterBottom>
            {event.title}
          </Typography>

          <Stack spacing={2} color="text.secondary" sx={{ mb: 3 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Calendar1 size={20} />
              <Typography>
                {formatDateTime(event.startTime, intl.locale)} - {formatDateTime(event.endTime, intl.locale)}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <Location size={20} />
              <Typography>{formatLocation(event.location, event.province?.name, event.ward?.name)}</Typography>
            </Stack>
          </Stack>

          <Typography variant="h5" fontWeight={700} gutterBottom>
            {intl.formatMessage({ id: 'eventDetail.about', defaultMessage: 'About the event' })}
          </Typography>
          <Typography color="text.secondary" sx={{ whiteSpace: 'pre-line', mb: 4 }}>
            {event.description || intl.formatMessage({ id: 'eventDetail.noDescription', defaultMessage: 'No description.' })}
          </Typography>
        </Box>

        <Box sx={{ width: { xs: '100%', md: 360 } }}>
          <Card variant="outlined">
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h6" fontWeight={700}>
                  {intl.formatMessage({ id: 'eventDetail.tickets', defaultMessage: 'Tickets' })}
                </Typography>

                {event.ticketTypes?.length === 0 && (
                  <Typography color="text.secondary">
                    {intl.formatMessage({ id: 'eventDetail.noTickets', defaultMessage: 'No ticket types available.' })}
                  </Typography>
                )}

                {event.ticketTypes?.map((ticket) => (
                  <Stack key={ticket.id} spacing={0.5}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Ticket size={18} />
                        <Typography fontWeight={600}>{ticket.name}</Typography>
                      </Stack>
                      <Typography fontWeight={700}>{formatCurrency(Number(ticket.price), intl.locale)}</Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      {intl.formatMessage(
                        { id: 'eventDetail.availableTickets', defaultMessage: '{available} of {total} available' },
                        { available: ticket.availableQuantity, total: ticket.totalQuantity }
                      )}
                    </Typography>
                    <Divider sx={{ mt: 1 }} />
                  </Stack>
                ))}

                {isEditable && (
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<Edit2 size={18} />}
                    onClick={() => navigate(`/organizer/events/${event.id}/edit`)}
                  >
                    {intl.formatMessage({ id: 'organizer.events.edit', defaultMessage: 'Edit event' })}
                  </Button>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Stack>
    </Box>
  );
}
