import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// material-ui
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

// third-party
import { useIntl } from 'react-intl';
import { QRCodeSVG } from 'qrcode.react';

// project-imports
import { getEventDetail } from 'api/events';
import { openSnackbar } from 'api/snackbar';
import { cancelOrder, createPaymentInstruction, getOrder, getOrderTickets, getPaymentMethods } from 'features/booking/api/booking';
import OrderStatusBadge from 'features/booking/components/OrderStatusBadge';
import { Order, OrderTicket } from 'features/booking/types';
import { EventDetail } from 'types/organizer';
import { formatCurrency, formatDateTime, formatLocation } from 'utils/format';

// assets
import { ArrowLeft2, Calendar1, Clock, Location, Receipt21, Ticket2, WalletMoney } from 'iconsax-reactjs';

// ==============================|| ORDER DETAIL PAGE ||============================== //

const getRemainingSeconds = (expiresAt?: string) => {
  if (!expiresAt) return 0;
  return Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 1000));
};

const formatCountdown = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map((part) => String(part).padStart(2, '0')).join(':');
};

export default function OrderDetailPage() {
  const intl = useIntl();
  const navigate = useNavigate();
  const { orderId } = useParams();

  const [order, setOrder] = useState<Order | null>(null);
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [tickets, setTickets] = useState<OrderTicket[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [paying, setPaying] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  const parsedOrderId = Number(orderId);

  const load = async () => {
    if (!Number.isFinite(parsedOrderId)) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const nextOrder = await getOrder(parsedOrderId);
      setOrder(nextOrder);
      setNotFound(false);

      if (nextOrder.eventId) {
        try {
          const nextEvent = await getEventDetail(nextOrder.eventId);
          setEvent(nextEvent);
        } catch {
          setEvent(null);
        }
      }

      if (nextOrder.status === 'PAID') {
        setTicketsLoading(true);
        try {
          const nextTickets = await getOrderTickets(nextOrder.id);
          setTickets(nextTickets);
        } catch {
          setTickets([]);
        } finally {
          setTicketsLoading(false);
        }
      } else {
        setTickets([]);
      }
    } catch {
      setNotFound(true);
      openSnackbar({
        open: true,
        message: intl.formatMessage({ id: 'orderDetail.loadError', defaultMessage: 'Unable to load this order.' }),
        variant: 'alert',
        alert: { color: 'error' }
      } as any);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parsedOrderId]);

  const isPending = order?.status === 'PENDING_PAYMENT';

  useEffect(() => {
    if (!isPending || !order?.expiredAt) {
      setRemainingSeconds(0);
      return;
    }

    setRemainingSeconds(getRemainingSeconds(order.expiredAt));
    const timer = window.setInterval(() => {
      const next = getRemainingSeconds(order.expiredAt);
      setRemainingSeconds(next);
      if (next === 0) window.clearInterval(timer);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isPending, order?.expiredAt]);

  const handlePay = async () => {
    if (!order) return;
    setPaying(true);
    try {
      const methods = await getPaymentMethods();
      const provider = methods[0]?.code;
      const payment = await createPaymentInstruction(order.id, provider);
      navigate('/payment/success', { state: { order, payment, event: event || undefined } });
    } catch {
      openSnackbar({
        open: true,
        message: intl.formatMessage({ id: 'orderDetail.paymentError', defaultMessage: 'Unable to start payment.' }),
        variant: 'alert',
        alert: { color: 'error' }
      } as any);
    } finally {
      setPaying(false);
    }
  };

  const handleCancel = async () => {
    if (!order) return;
    setCancelling(true);
    try {
      await cancelOrder(order.id);
      openSnackbar({
        open: true,
        message: intl.formatMessage({ id: 'myOrders.cancelSuccess', defaultMessage: 'Order cancelled.' }),
        variant: 'alert',
        alert: { color: 'success' }
      } as any);
      await load();
    } catch {
      openSnackbar({
        open: true,
        message: intl.formatMessage({ id: 'myOrders.cancelError', defaultMessage: 'Failed to cancel order.' }),
        variant: 'alert',
        alert: { color: 'error' }
      } as any);
    } finally {
      setCancelling(false);
    }
  };

  const venue = useMemo(
    () => (event ? formatLocation(event.location, event.ward?.name, event.province?.name) : ''),
    [event]
  );

  if (loading) {
    return (
      <Box sx={{ minHeight: '60vh', display: 'grid', placeItems: 'center' }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (notFound || !order) {
    return (
      <Box sx={{ bgcolor: 'background.default', pt: { xs: 10, sm: 11, md: 14 }, pb: { xs: 6, md: 10 } }}>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography variant="h3" fontWeight={800} gutterBottom>
            {intl.formatMessage({ id: 'orderDetail.notFound', defaultMessage: 'Order not found' })}
          </Typography>
          <Typography color="text.secondary" mb={4}>
            {intl.formatMessage({
              id: 'orderDetail.notFoundDescription',
              defaultMessage: 'This order may have been removed or you do not have permission to view it.'
            })}
          </Typography>
          <Button variant="contained" startIcon={<ArrowLeft2 size={18} />} onClick={() => navigate('/my-orders')}>
            {intl.formatMessage({ id: 'orderDetail.backToOrders', defaultMessage: 'Back to my orders' })}
          </Button>
        </Container>
      </Box>
    );
  }

  const ticketCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Box sx={{ bgcolor: 'background.default', pt: { xs: 10, sm: 11, md: 14 }, pb: { xs: 6, md: 10 } }}>
      <Container maxWidth="lg">
        <Button
          startIcon={<ArrowLeft2 size={18} />}
          onClick={() => navigate('/my-orders')}
          sx={{ mb: 2, color: 'text.secondary' }}
        >
          {intl.formatMessage({ id: 'orderDetail.backToOrders', defaultMessage: 'Back to my orders' })}
        </Button>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={1.5}
          mb={3}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h3" fontWeight={800} sx={{ overflowWrap: 'anywhere' }}>
              {intl.formatMessage({ id: 'orderDetail.title', defaultMessage: 'Order detail' })}
            </Typography>
            <Typography color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>
              {order.orderCode}
            </Typography>
          </Box>
          <Box sx={{ flexShrink: 0 }}>
            <OrderStatusBadge status={order.status} />
          </Box>
        </Stack>

        <Grid container spacing={{ xs: 2, md: 4 }} alignItems="flex-start">
          <Grid size={{ xs: 12, md: 8 }}>
            <Stack spacing={3}>
              <Card sx={{ overflow: 'hidden' }}>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  <Stack spacing={2}>
                    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
                      <Receipt21 size={22} style={{ flexShrink: 0 }} />
                      <Typography variant="h5" fontWeight={800}>
                        {intl.formatMessage({ id: 'orderDetail.eventInfo', defaultMessage: 'Event information' })}
                      </Typography>
                    </Stack>

                    {event?.thumbnailUrl || event?.bannerUrl ? (
                      <Box
                        component="img"
                        src={event.bannerUrl || event.thumbnailUrl}
                        alt={event.title}
                        sx={{
                          width: '100%',
                          height: { xs: 160, sm: 220 },
                          objectFit: 'cover',
                          borderRadius: 2
                        }}
                      />
                    ) : null}

                    <Typography variant="h5" fontWeight={800} sx={{ overflowWrap: 'anywhere' }}>
                      {event?.title ||
                        intl.formatMessage({ id: 'orderDetail.unknownEvent', defaultMessage: 'Event #{id}' }, { id: order.eventId })}
                    </Typography>

                    {event && (
                      <Stack spacing={1}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
                          <Calendar1 size={18} style={{ flexShrink: 0 }} />
                          <Typography sx={{ overflowWrap: 'anywhere' }}>
                            {formatDateTime(event.startTime, intl.locale)}
                            {event.endTime ? ` → ${formatDateTime(event.endTime, intl.locale)}` : ''}
                          </Typography>
                        </Stack>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
                          <Location size={18} style={{ flexShrink: 0 }} />
                          <Typography sx={{ overflowWrap: 'anywhere' }}>{venue || '-'}</Typography>
                        </Stack>
                      </Stack>
                    )}
                  </Stack>
                </CardContent>
              </Card>

              {order.status === 'PAID' && (ticketsLoading || tickets.length > 0) && (
                <Card sx={{ overflow: 'hidden' }}>
                  <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    <Stack spacing={2}>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Ticket2 size={22} />
                        <Typography variant="h5" fontWeight={800}>
                          {intl.formatMessage({ id: 'orderDetail.yourTickets', defaultMessage: 'Your e-tickets' })}
                        </Typography>
                      </Stack>
                      <Typography variant="body2" color="text.secondary">
                        {intl.formatMessage({
                          id: 'orderDetail.qrHint',
                          defaultMessage: 'Show this QR code at the entrance to check in.'
                        })}
                      </Typography>
                      <Typography variant="caption" color="warning.main">
                        {intl.formatMessage({
                          id: 'orderDetail.qrSingleUse',
                          defaultMessage:
                            'Each QR code is valid for one entry only. Do not share or screenshot it — repeated scans are logged and may be treated as fraud.'
                        })}
                      </Typography>

                      {ticketsLoading && (
                        <Stack alignItems="center" py={2}>
                          <CircularProgress size={24} />
                        </Stack>
                      )}

                      <Box
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
                          gap: 2
                        }}
                      >
                        {tickets.map((ticket) => (
                          <Stack
                            key={ticket.id}
                            spacing={1}
                            alignItems="center"
                            sx={{
                              p: 2,
                              borderRadius: 2,
                              border: '1px solid',
                              borderColor: 'divider',
                              bgcolor: 'background.paper',
                              minWidth: 0
                            }}
                          >
                            <Box
                              sx={{
                                p: 1.5,
                                borderRadius: 2,
                                bgcolor: '#fff',
                                display: 'inline-flex',
                                justifyContent: 'center',
                                alignItems: 'center'
                              }}
                            >
                              {ticket.qrCode ? (
                                <QRCodeSVG value={ticket.qrCode} size={148} level="M" />
                              ) : (
                                <Typography variant="body2" color="error.main">
                                  {intl.formatMessage({ id: 'orderDetail.qrUnavailable', defaultMessage: 'QR unavailable' })}
                                </Typography>
                              )}
                            </Box>
                            <Typography fontWeight={700} textAlign="center" sx={{ overflowWrap: 'anywhere' }}>
                              {ticket.ticketTypeName ||
                                intl.formatMessage({ id: 'orderDetail.ticket', defaultMessage: 'Ticket' })}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              #{ticket.id}
                            </Typography>
                          </Stack>
                        ))}
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              )}

              <Card sx={{ overflow: 'hidden' }}>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  <Stack spacing={2}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Ticket2 size={22} />
                      <Typography variant="h5" fontWeight={800}>
                        {intl.formatMessage({ id: 'orderDetail.tickets', defaultMessage: 'Tickets' })}
                      </Typography>
                    </Stack>

                    {order.items.map((item) => (
                      <Stack
                        key={item.ticketTypeId}
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        spacing={2}
                      >
                        <Box sx={{ minWidth: 0 }}>
                          <Typography fontWeight={700} sx={{ overflowWrap: 'anywhere' }}>
                            {item.ticketTypeName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>
                            {formatCurrency(item.unitPrice, intl.locale)} × {item.quantity}
                          </Typography>
                        </Box>
                        <Typography fontWeight={700} sx={{ flexShrink: 0 }}>
                          {formatCurrency(item.subtotal, intl.locale)}
                        </Typography>
                      </Stack>
                    ))}

                    <Divider />

                    <Stack direction="row" justifyContent="space-between" spacing={2}>
                      <Typography color="text.secondary">
                        {intl.formatMessage({ id: 'orderDetail.totalTickets', defaultMessage: 'Total tickets' })}
                      </Typography>
                      <Typography fontWeight={700}>{ticketCount}</Typography>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>

              <Card sx={{ overflow: 'hidden' }}>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  <Stack spacing={1.5}>
                    <Typography variant="h5" fontWeight={800} mb={0.5}>
                      {intl.formatMessage({ id: 'orderDetail.orderInfo', defaultMessage: 'Order information' })}
                    </Typography>
                    <InfoRow
                      label={intl.formatMessage({ id: 'orderDetail.orderCode', defaultMessage: 'Order code' })}
                      value={order.orderCode}
                    />
                    <InfoRow
                      label={intl.formatMessage({ id: 'orderDetail.orderId', defaultMessage: 'Order ID' })}
                      value={`#${order.id}`}
                    />
                    {order.paidAt && (
                      <InfoRow
                        label={intl.formatMessage({ id: 'orderDetail.paidAt', defaultMessage: 'Paid at' })}
                        value={formatDateTime(order.paidAt, intl.locale)}
                      />
                    )}
                    {order.expiredAt && !order.paidAt && (
                      <InfoRow
                        label={intl.formatMessage({ id: 'orderDetail.expiredAt', defaultMessage: 'Expires at' })}
                        value={formatDateTime(order.expiredAt, intl.locale)}
                      />
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ position: { md: 'sticky' }, top: 24 }}>
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Stack spacing={1.5}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <WalletMoney size={22} />
                    <Typography variant="h5" fontWeight={800}>
                      {intl.formatMessage({ id: 'orderDetail.summary', defaultMessage: 'Payment summary' })}
                    </Typography>
                  </Stack>

                  <SummaryRow
                    label={intl.formatMessage({ id: 'checkout.subtotal', defaultMessage: 'Subtotal' })}
                    value={formatCurrency(order.totalTicketAmount, intl.locale)}
                  />
                  <SummaryRow
                    label={intl.formatMessage({ id: 'checkout.discount', defaultMessage: 'Discount' })}
                    value={`-${formatCurrency(order.discountAmount, intl.locale)}`}
                  />
                  <SummaryRow
                    label={intl.formatMessage({ id: 'checkout.platformFee', defaultMessage: 'Platform fee' })}
                    value={formatCurrency(order.platformFee, intl.locale)}
                  />

                  <Divider />

                  <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                    <Typography fontWeight={700}>
                      {intl.formatMessage({ id: 'checkout.total', defaultMessage: 'Total' })}
                    </Typography>
                    <Typography variant="h4" fontWeight={800} color="primary.main" sx={{ flexShrink: 0 }}>
                      {formatCurrency(order.finalAmount, intl.locale)}
                    </Typography>
                  </Stack>

                  {isPending && remainingSeconds > 0 && (
                    <Stack direction="row" spacing={1} alignItems="center" color="warning.main">
                      <Clock size={18} />
                      <Typography fontWeight={700}>{formatCountdown(remainingSeconds)}</Typography>
                    </Stack>
                  )}

                  {isPending && (
                    <Stack spacing={1.5} pt={1}>
                      <Button variant="contained" size="large" fullWidth disabled={paying} onClick={handlePay} sx={{ height: 48 }}>
                        {paying
                          ? intl.formatMessage({ id: 'checkout.processing', defaultMessage: 'Processing...' })
                          : intl.formatMessage({ id: 'orderDetail.payNow', defaultMessage: 'Pay now' })}
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        fullWidth
                        disabled={cancelling}
                        onClick={handleCancel}
                      >
                        {cancelling
                          ? intl.formatMessage({ id: 'checkout.processing', defaultMessage: 'Processing...' })
                          : intl.formatMessage({ id: 'myOrders.cancel', defaultMessage: 'Cancel order' })}
                      </Button>
                    </Stack>
                  )}

                  {!isPending && (
                    <Button variant="outlined" fullWidth onClick={() => navigate('/my-orders')}>
                      {intl.formatMessage({ id: 'orderDetail.backToOrders', defaultMessage: 'Back to my orders' })}
                    </Button>
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

// ==============================|| SUB COMPONENTS ||============================== //

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <Stack direction="row" justifyContent="space-between" spacing={2}>
      <Typography color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>
        {label}
      </Typography>
      <Typography fontWeight={500} sx={{ flexShrink: 0 }}>
        {value}
      </Typography>
    </Stack>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <Stack direction="row" justifyContent="space-between" spacing={2} sx={{ minWidth: 0 }}>
      <Typography color="text.secondary" sx={{ flexShrink: 0 }}>
        {label}
      </Typography>
      <Typography fontWeight={600} textAlign="right" sx={{ overflowWrap: 'anywhere' }}>
        {value}
      </Typography>
    </Stack>
  );
}
