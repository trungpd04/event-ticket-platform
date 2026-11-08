import { useLocation, useNavigate } from 'react-router-dom';

// material-ui
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// third-party
import { useIntl } from 'react-intl';

// types
import { MockPayResponse, Order } from 'features/booking/types';
import { EventDetail } from 'types/organizer';
import { formatCurrency, formatDateTime } from 'utils/format';

// assets
import { Calendar1, Location, TickCircle, Ticket2 } from 'iconsax-reactjs';

interface LocationState {
  order: Order;
  payment: MockPayResponse;
  event: EventDetail;
}

// ==============================|| PAYMENT SUCCESS PAGE ||============================== //

export default function PaymentSuccessPage() {
  const intl = useIntl();
  const navigate = useNavigate();
  const location = useLocation();
  const { order, payment, event } = (location.state as LocationState) || {};

  if (!order || !payment || !event) {
    return (
      <Container maxWidth="md" sx={{ py: 16, textAlign: 'center' }}>
        <Typography variant="h3" fontWeight={800} gutterBottom>
          {intl.formatMessage({ id: 'paymentSuccess.notFound', defaultMessage: 'Payment information not found' })}
        </Typography>
        <Button variant="contained" onClick={() => navigate('/events')}>
          {intl.formatMessage({ id: 'paymentSuccess.backToEvents', defaultMessage: 'Back to events' })}
        </Button>
      </Container>
    );
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: { xs: 4, md: 6 } }}>
      <Container maxWidth="md">
        <Card>
          <CardContent sx={{ p: { xs: 3, md: 5 }, textAlign: 'center' }}>
            <Stack spacing={3} alignItems="center">
              <TickCircle size={64} color="#4caf50" variant="Bulk" />
              <Typography variant="h2" fontWeight={800}>
                {intl.formatMessage({ id: 'paymentSuccess.title', defaultMessage: 'Payment successful!' })}
              </Typography>
              <Typography color="text.secondary">{payment.message}</Typography>

              <Box sx={{ width: '100%', textAlign: 'left', bgcolor: 'secondary.100', borderRadius: 2, p: 3 }}>
                <Typography variant="h5" fontWeight={800} gutterBottom>
                  {event.title}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                  <Calendar1 size={18} />
                  <Typography>{formatDateTime(event.startTime, intl.locale)}</Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                  <Location size={18} />
                  <Typography>{event.location}</Typography>
                </Stack>

                <Typography variant="h6" fontWeight={700} mb={1}>
                  {intl.formatMessage({ id: 'paymentSuccess.tickets', defaultMessage: 'Your tickets' })}
                </Typography>
                {order.items.map((item) => (
                  <Stack key={item.ticketTypeId} direction="row" spacing={1} alignItems="center" mb={0.5}>
                    <Ticket2 size={18} />
                    <Typography>
                      {item.ticketTypeName} x {item.quantity}
                    </Typography>
                  </Stack>
                ))}

                <Stack spacing={1} mt={2}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography color="text.secondary">
                      {intl.formatMessage({ id: 'paymentSuccess.orderCode', defaultMessage: 'Order code' })}
                    </Typography>
                    <Typography fontWeight={700}>{order.orderCode}</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography color="text.secondary">
                      {intl.formatMessage({ id: 'paymentSuccess.paidAt', defaultMessage: 'Paid at' })}
                    </Typography>
                    <Typography fontWeight={700}>{formatDateTime(payment.paidAt, intl.locale)}</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography color="text.secondary">
                      {intl.formatMessage({ id: 'paymentSuccess.amount', defaultMessage: 'Amount' })}
                    </Typography>
                    <Typography fontWeight={700}>{formatCurrency(payment.finalAmount, intl.locale)}</Typography>
                  </Stack>
                </Stack>
              </Box>

              <Stack direction="row" spacing={2}>
                <Button variant="outlined" onClick={() => navigate('/my-orders')}>
                  {intl.formatMessage({ id: 'paymentSuccess.viewOrders', defaultMessage: 'My orders' })}
                </Button>
                <Button variant="contained" onClick={() => navigate('/events')}>
                  {intl.formatMessage({ id: 'paymentSuccess.backToEvents', defaultMessage: 'Back to events' })}
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
