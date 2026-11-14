import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// material-ui
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// third-party
import { useIntl } from 'react-intl';

// project-imports
import { getOrder, getPaymentStatus } from 'features/booking/api/booking';
import { MockPayResponse, Order, PaymentInstruction, PaymentStatus } from 'features/booking/types';
import { EventDetail } from 'types/organizer';
import { formatCurrency, formatDateTime } from 'utils/format';

// assets
import { Calendar1, Copy, Location, TickCircle, Ticket2, WalletMoney } from 'iconsax-reactjs';

interface LocationState {
  order: Order;
  payment?: PaymentInstruction;
  mockPayment?: MockPayResponse;
  event?: EventDetail;
}

const TERMINAL_STATUSES = new Set(['PAID', 'CANCELLED', 'EXPIRED']);

// ==============================|| PAYMENT STATUS PAGE ||============================== //

export default function PaymentSuccessPage() {
  const intl = useIntl();
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as LocationState) || {};
  const [order, setOrder] = useState<Order | null>(state.order || null);
  const [status, setStatus] = useState<PaymentStatus | null>(
    state.mockPayment
      ? { orderId: state.mockPayment.orderId, status: 'PAID', paidAt: state.mockPayment.paidAt }
      : state.order
        ? { orderId: state.order.id, status: state.order.status, paidAt: state.order.paidAt }
        : null
  );
  const [pollCount, setPollCount] = useState(0);
  const [pollError, setPollError] = useState(false);

  const instruction = state.payment;
  const isPaid = status?.status === 'PAID';
  const isTerminal = status ? TERMINAL_STATUSES.has(status.status) : false;
  const maxPollCount = instruction?.maxPollCount || 300;
  const pollInterval = instruction?.frequenceCallApiPoll || 3000;

  useEffect(() => {
    if (!order || state.mockPayment || isTerminal || pollCount >= maxPollCount) return;

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      try {
        const nextStatus = await getPaymentStatus(order.id);
        if (cancelled) return;
        setStatus(nextStatus);
        setPollCount((current) => current + 1);
        setPollError(false);

        // Refresh the complete order once the webhook has confirmed payment
        // so the page shows the authoritative paidAt/status from the backend.
        if (nextStatus.status === 'PAID') {
          const updatedOrder = await getOrder(order.id);
          if (!cancelled) setOrder(updatedOrder);
        }
      } catch {
        if (!cancelled) {
          setPollError(true);
          setPollCount((current) => current + 1);
        }
      }
    }, pollInterval);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [order, state.mockPayment, isTerminal, pollCount, maxPollCount, pollInterval]);

  const title = useMemo(() => {
    if (isPaid) return intl.formatMessage({ id: 'paymentSuccess.title', defaultMessage: 'Payment successful!' });
    if (status?.status === 'CANCELLED') return intl.formatMessage({ id: 'paymentSuccess.cancelled', defaultMessage: 'Order cancelled' });
    if (status?.status === 'EXPIRED') return intl.formatMessage({ id: 'paymentSuccess.expired', defaultMessage: 'Payment expired' });
    return intl.formatMessage({ id: 'paymentSuccess.pendingTitle', defaultMessage: 'Waiting for payment' });
  }, [intl, isPaid, status?.status]);

  const copy = async (value?: string) => {
    if (!value) return;
    await navigator.clipboard?.writeText(value);
  };

  if (!order || !status) {
    return (
      <Container maxWidth="md" sx={{ py: 16, textAlign: 'center' }}>
        <Typography variant="h3" fontWeight={800} gutterBottom>
          {intl.formatMessage({ id: 'paymentSuccess.notFound', defaultMessage: 'Payment information not found.' })}
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
          <CardContent sx={{ p: { xs: 3, md: 5 } }}>
            <Stack spacing={3} alignItems="center">
              {isPaid ? <TickCircle size={64} color="#4caf50" variant="Bulk" /> : <WalletMoney size={64} color="#ff9800" variant="Bulk" />}
              <Typography variant="h2" fontWeight={800} textAlign="center">
                {title}
              </Typography>

              {!isPaid && status.status === 'PENDING_PAYMENT' && instruction && (
                <Stack spacing={2} alignItems="center" sx={{ width: '100%' }}>
                  <Typography color="text.secondary" textAlign="center">
                    {intl.formatMessage({
                      id: 'paymentSuccess.instructions',
                      defaultMessage: 'Complete the transfer below. This page will update automatically after the payment is confirmed.'
                    })}
                  </Typography>
                  {instruction.qrUrl && (
                    <Box component="img" src={instruction.qrUrl} alt="Payment QR code" sx={{ width: 260, height: 260, borderRadius: 2 }} />
                  )}
                  <Stack spacing={1} sx={{ width: '100%', bgcolor: 'secondary.100', borderRadius: 2, p: 2 }}>
                    <CopyRow
                      label={intl.formatMessage({ id: 'paymentSuccess.paymentCode', defaultMessage: 'Payment code' })}
                      value={instruction.paymentCode}
                      onCopy={copy}
                    />
                    {instruction.accountNumber && (
                      <CopyRow
                        label={intl.formatMessage({ id: 'paymentSuccess.accountNumber', defaultMessage: 'Account number' })}
                        value={instruction.accountNumber}
                        onCopy={copy}
                      />
                    )}
                    {instruction.bankName && (
                      <CopyRow
                        label={intl.formatMessage({ id: 'paymentSuccess.bank', defaultMessage: 'Bank' })}
                        value={instruction.bankName}
                        onCopy={copy}
                      />
                    )}
                    {instruction.content && (
                      <CopyRow
                        label={intl.formatMessage({ id: 'paymentSuccess.transferContent', defaultMessage: 'Transfer content' })}
                        value={instruction.content}
                        onCopy={copy}
                      />
                    )}
                    <CopyRow
                      label={intl.formatMessage({ id: 'paymentSuccess.amount', defaultMessage: 'Amount' })}
                      value={formatCurrency(instruction.amount, intl.locale)}
                    />
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center" color={pollError ? 'error.main' : 'text.secondary'}>
                    {!pollError && <CircularProgress size={16} />}
                    <Typography variant="body2">
                      {pollError
                        ? intl.formatMessage({ id: 'paymentSuccess.pollError', defaultMessage: 'Unable to check status. Retrying...' })
                        : intl.formatMessage({ id: 'paymentSuccess.checking', defaultMessage: 'Checking payment status...' })}
                    </Typography>
                  </Stack>
                </Stack>
              )}

              <Divider flexItem />
              <Box sx={{ width: '100%', textAlign: 'left', bgcolor: 'secondary.100', borderRadius: 2, p: 3 }}>
                {state.event && (
                  <>
                    <Typography variant="h5" fontWeight={800} gutterBottom>
                      {state.event.title}
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                      <Calendar1 size={18} />
                      <Typography>{formatDateTime(state.event.startTime, intl.locale)}</Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                      <Location size={18} />
                      <Typography>{state.event.location}</Typography>
                    </Stack>
                  </>
                )}
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
                  <CopyRow
                    label={intl.formatMessage({ id: 'paymentSuccess.orderCode', defaultMessage: 'Order code' })}
                    value={order.orderCode}
                  />
                  {isPaid && (
                    <CopyRow
                      label={intl.formatMessage({ id: 'paymentSuccess.paidAt', defaultMessage: 'Paid at' })}
                      value={formatDateTime(status.paidAt || order.paidAt || '', intl.locale)}
                    />
                  )}
                  <CopyRow
                    label={intl.formatMessage({ id: 'paymentSuccess.amount', defaultMessage: 'Amount' })}
                    value={formatCurrency(order.finalAmount, intl.locale)}
                  />
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

function CopyRow({ label, value, onCopy }: { label: string; value?: string; onCopy?: (value?: string) => void }) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
      <Typography color="text.secondary">{label}</Typography>
      <Stack direction="row" spacing={0.5} alignItems="center">
        <Typography fontWeight={700} textAlign="right">
          {value || '-'}
        </Typography>
        {onCopy && value && (
          <Button aria-label={`Copy ${label}`} onClick={() => onCopy(value)} size="small" sx={{ minWidth: 32, p: 0.5 }}>
            <Copy size={16} />
          </Button>
        )}
      </Stack>
    </Stack>
  );
}
