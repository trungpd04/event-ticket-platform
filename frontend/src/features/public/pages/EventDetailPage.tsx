import { useEffect, useMemo, useState } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';

import { Add, ArrowLeft2, Calendar1, Location, Minus, People, Timer1 } from 'iconsax-reactjs';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useIntl } from 'react-intl';

import { getEventDetail } from 'api/events';
import { openSnackbar } from 'api/snackbar';
import { reserveTickets } from 'features/booking/api/booking';
import useAuth from 'hooks/useAuth';
import { EventDetail } from 'types/organizer';
import { formatCurrency, formatDateTime, formatLocation } from 'utils/format';

export default function EventDetailPage() {
  const intl = useIntl();
  const navigate = useNavigate();
  const { id } = useParams();
  const { isLoggedIn } = useAuth();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [bookingLoading, setBookingLoading] = useState(false);

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

  const handleQuantityChange = (ticketTypeId: string, delta: number) => {
    setQuantities((prev) => {
      const current = prev[ticketTypeId] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [ticketTypeId]: next };
    });
  };

  const totalQuantity = useMemo(
    () => Object.values(quantities).reduce((sum, qty) => sum + qty, 0),
    [quantities]
  );

  const totalAmount = useMemo(() => {
    if (!event) return 0;
    return event.ticketTypes?.reduce((sum, ticket) => {
      const qty = quantities[ticket.id] || 0;
      return sum + qty * Number(ticket.price);
    }, 0);
  }, [quantities, event]);

  const handleBook = async () => {
    if (!isLoggedIn) {
      navigate('/login', { state: { from: `/events/${id}` } });
      return;
    }

    if (!event || totalQuantity === 0) return;

    const items = Object.entries(quantities)
      .filter(([, qty]) => qty > 0)
      .map(([ticketTypeId, quantity]) => ({
        ticketTypeId: Number(ticketTypeId),
        quantity
      }));

    setBookingLoading(true);
    try {
      const reservation = await reserveTickets({
        eventId: event.id,
        items,
        reservationMinutes: 10
      });
      navigate('/checkout', { state: { reservation, event } });
    } catch {
      openSnackbar({
        open: true,
        message: intl.formatMessage({ id: 'eventDetail.reserveError', defaultMessage: 'Failed to reserve tickets. Please try again.' }),
        variant: 'alert',
        alert: { color: 'error' }
      } as any);
    } finally {
      setBookingLoading(false);
    }
  };

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
  const venue = formatLocation(event.location, event.ward?.name, event.province?.name);

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
                    <Typography>{formatDateTime(event.startTime, intl.locale)}</Typography>
                    <Typography color="rgba(255,255,255,.62)">→ {formatDateTime(event.endTime, intl.locale)}</Typography>
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
                        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" spacing={2}>
                          <Box>
                            <Typography variant="h6" fontWeight={800}>
                              {ticket.name}
                            </Typography>
                            <Typography variant="body2" color="rgba(255,255,255,.6)" sx={{ mt: 0.5 }}>
                              {ticket.description ||
                                intl.formatMessage({ id: 'eventDetail.ticketDescription', defaultMessage: 'Admission ticket' })}
                            </Typography>
                          </Box>
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Typography sx={{ color: '#d580f2', fontSize: 18, fontWeight: 800, minWidth: 100, textAlign: 'right' }}>
                              {formatCurrency(Number(ticket.price), intl.locale)}
                            </Typography>
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <IconButton
                                size="small"
                                onClick={() => handleQuantityChange(ticket.id, -1)}
                                disabled={(quantities[ticket.id] || 0) === 0}
                                sx={{ color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}
                              >
                                <Minus size={16} />
                              </IconButton>
                              <Typography sx={{ minWidth: 24, textAlign: 'center' }}>{quantities[ticket.id] || 0}</Typography>
                              <IconButton
                                size="small"
                                onClick={() => handleQuantityChange(ticket.id, 1)}
                                sx={{ color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}
                              >
                                <Add size={16} />
                              </IconButton>
                            </Stack>
                          </Stack>
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
                      <Typography>{formatDateTime(event.ticketSaleEndTime, intl.locale)}</Typography>
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
                  <Button
                    variant="contained"
                    size="large"
                    disabled={totalQuantity === 0 || bookingLoading}
                    onClick={handleBook}
                    sx={{ mt: 1, height: 52 }}
                  >
                    {bookingLoading
                      ? intl.formatMessage({ id: 'eventDetail.processing', defaultMessage: 'Processing...' })
                      : intl.formatMessage(
                          { id: 'eventDetail.bookNow', defaultMessage: 'Book now — {amount}' },
                          { amount: formatCurrency(totalAmount, intl.locale) }
                        )}
                  </Button>
                  {!isLoggedIn && (
                    <Typography variant="caption" color="rgba(255,255,255,.45)" textAlign="center">
                      {intl.formatMessage({
                        id: 'eventDetail.loginRequired',
                        defaultMessage: 'Please log in to book tickets.'
                      })}
                    </Typography>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
