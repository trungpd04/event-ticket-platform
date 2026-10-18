import { useEffect, useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';

import { ArrowLeft2, Calendar1, Location, People, Timer1 } from 'iconsax-reactjs';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useIntl } from 'react-intl';

import { getEventDetail } from 'api/events';
import { EventDetail } from 'types/organizer';

function formatDate(value: string, locale: string, withTime = false) {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    ...(withTime ? { timeStyle: 'short' } : {})
  }).format(new Date(value));
}

function formatMoney(value: number, locale: string) {
  return `${value.toLocaleString(locale)} VND`;
}

export default function EventDetailPage() {
  const intl = useIntl();
  const { id } = useParams();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const eventId = Number(id);
    if (!Number.isInteger(eventId) || eventId <= 0) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setNotFound(false);

    getEventDetail(eventId)
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
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ minHeight: '70vh', display: 'grid', placeItems: 'center' }}>
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
            defaultMessage: 'This event may have been removed or is no longer available.'
          })}
        </Typography>
        <Button component={RouterLink} to="/events" variant="contained">
          {intl.formatMessage({ id: 'eventDetail.backToEvents', defaultMessage: 'Back to events' })}
        </Button>
      </Container>
    );
  }

  const eventImage = event.bannerUrl || event.thumbnailUrl;
  const venue = [event.location, event.ward?.name, event.province?.name].filter(Boolean).join(', ');

  return (
    <Box sx={{ bgcolor: '#0b0b0c', color: 'common.white', pb: { xs: 8, md: 14 } }}>
      <Box
        sx={{
          minHeight: { xs: 360, md: 520 },
          display: 'flex',
          alignItems: 'flex-end',
          position: 'relative',
          backgroundImage: `linear-gradient(180deg, rgba(10, 8, 12, .12) 20%, rgba(10, 8, 12, .96) 100%), url(${eventImage || ''})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <Container maxWidth="xl" sx={{ position: 'relative', pb: { xs: 5, md: 8 } }}>
          <Button component={RouterLink} to="/events" startIcon={<ArrowLeft2 size={18} />} sx={{ color: 'rgba(255,255,255,.8)', mb: 4 }}>
            {intl.formatMessage({ id: 'eventDetail.backToEvents', defaultMessage: 'Back to events' })}
          </Button>
          <Typography variant="h1" sx={{ maxWidth: 900, fontSize: { xs: '2.5rem', md: '4.5rem' }, lineHeight: 1.05, fontWeight: 800 }}>
            {event.title}
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ mt: { xs: 5, md: 8 } }}>
        <Grid container spacing={{ xs: 4, md: 8 }}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Stack spacing={5}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} flexWrap="wrap" useFlexGap>
                <Stack direction="row" spacing={1.2} alignItems="center">
                  <Calendar1 size={22} color="#d580f2" />
                  <Box>
                    <Typography variant="caption" color="rgba(255,255,255,.55)">
                      {intl.formatMessage({ id: 'eventDetail.date', defaultMessage: 'Date and time' })}
                    </Typography>
                    <Typography>{formatDate(event.startTime, intl.locale, true)}</Typography>
                    <Typography color="rgba(255,255,255,.62)">→ {formatDate(event.endTime, intl.locale, true)}</Typography>
                  </Box>
                </Stack>
                <Stack direction="row" spacing={1.2} alignItems="center">
                  <Location size={22} color="#d580f2" />
                  <Box>
                    <Typography variant="caption" color="rgba(255,255,255,.55)">
                      {intl.formatMessage({ id: 'eventDetail.location', defaultMessage: 'Location' })}
                    </Typography>
                    <Typography>{venue || '-'}</Typography>
                  </Box>
                </Stack>
              </Stack>

              <Box>
                <Typography variant="h4" fontWeight={800} gutterBottom>
                  {intl.formatMessage({ id: 'eventDetail.about', defaultMessage: 'About this event' })}
                </Typography>
                <Typography color="rgba(255,255,255,.68)" sx={{ whiteSpace: 'pre-line', lineHeight: 1.8 }}>
                  {event.description ||
                    intl.formatMessage({ id: 'eventDetail.noDescription', defaultMessage: 'No description available.' })}
                </Typography>
              </Box>

              <Box>
                <Typography variant="h4" fontWeight={800} gutterBottom>
                  {intl.formatMessage({ id: 'eventDetail.tickets', defaultMessage: 'Ticket types' })}
                </Typography>
                <Stack spacing={2}>
                  {event.ticketTypes?.map((ticket) => (
                    <Card key={ticket.id} sx={{ bgcolor: '#181719', border: '1px solid #2c292e', color: 'white' }}>
                      <CardContent>
                        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2}>
                          <Box>
                            <Typography variant="h6" fontWeight={800}>
                              {ticket.name}
                            </Typography>
                            <Typography variant="body2" color="rgba(255,255,255,.6)" sx={{ mt: 0.5 }}>
                              {ticket.description ||
                                intl.formatMessage({ id: 'eventDetail.ticketDescription', defaultMessage: 'Admission ticket' })}
                            </Typography>
                            <Typography variant="body2" color="rgba(255,255,255,.55)" sx={{ mt: 1 }}>
                              {ticket.availableQuantity ?? ticket.totalQuantity}{' '}
                              {intl.formatMessage({ id: 'eventDetail.remaining', defaultMessage: 'tickets remaining' })}
                            </Typography>
                          </Box>
                          <Typography sx={{ color: '#d580f2', fontSize: 20, fontWeight: 800 }}>
                            {formatMoney(Number(ticket.price), intl.locale)}
                          </Typography>
                        </Stack>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              </Box>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ bgcolor: '#181719', border: '1px solid #2c292e', color: 'white', position: { md: 'sticky' }, top: { md: 110 } }}>
              <CardContent sx={{ p: 3 }}>
                <Stack spacing={2.5}>
                  <Stack direction="row" spacing={1.2} alignItems="center">
                    <Timer1 size={22} color="#d580f2" />
                    <Box>
                      <Typography variant="caption" color="rgba(255,255,255,.55)">
                        {intl.formatMessage({ id: 'eventDetail.ticketSale', defaultMessage: 'Ticket sale' })}
                      </Typography>
                      <Typography>{formatDate(event.ticketSaleEndTime, intl.locale, true)}</Typography>
                    </Box>
                  </Stack>
                  <Divider sx={{ borderColor: '#302c32' }} />
                  <Stack direction="row" spacing={1.2} alignItems="center">
                    <People size={22} color="#d580f2" />
                    <Box>
                      <Typography variant="caption" color="rgba(255,255,255,.55)">
                        {intl.formatMessage({ id: 'eventDetail.organizer', defaultMessage: 'Organizer' })}
                      </Typography>
                      <Typography>
                        {intl.formatMessage(
                          { id: 'eventDetail.organizerId', defaultMessage: 'Organizer #{id}' },
                          { id: event.organizerId }
                        )}
                      </Typography>
                    </Box>
                  </Stack>
                  <Button variant="contained" size="large" disabled sx={{ mt: 1, height: 52 }}>
                    {intl.formatMessage({ id: 'eventDetail.chooseTicket', defaultMessage: 'Choose tickets' })}
                  </Button>
                  <Typography variant="caption" color="rgba(255,255,255,.45)" textAlign="center">
                    {intl.formatMessage({
                      id: 'eventDetail.phaseNote',
                      defaultMessage: 'Ticket selection will be available in the next phase.'
                    })}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
