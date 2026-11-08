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
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

// third-party
import { useIntl } from 'react-intl';

// project-imports
import { openSnackbar } from 'api/snackbar';
import {
  cancelOrder,
  createOrder,
  getPaymentMethods,
  mockPayOrder,
  validatePromotion
} from 'features/booking/api/booking';
import { Order, ReserveResponse } from 'features/booking/types';
import { EventDetail } from 'types/organizer';
import { formatCurrency, formatDateTime } from 'utils/format';

// assets
import { Calendar1, Clock, Location, Ticket2 } from 'iconsax-reactjs';

interface LocationState {
  reservation: ReserveResponse;
  event: EventDetail;
}

// ==============================|| CHECKOUT PAGE ||============================== //

export default function CheckoutPage() {
  const intl = useIntl();
  const navigate = useNavigate();
  const location = useLocation();
  const { reservation, event } = (location.state as LocationState) || {};

  const [promotionCode, setPromotionCode] = useState('');
  const [appliedPromotion, setAppliedPromotion] = useState<{ discountAmount: number; code: string } | null>(null);
  const [validating, setValidating] = useState(false);
  const [creating, setCreating] = useState(false);
  const [paying, setPaying] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<{ code: string; name: string }[]>([]);
  const [selectedMethod, setSelectedMethod] = useState('');
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (!reservation || !event) {
      navigate('/events', { replace: true });
      return;
    }

    getPaymentMethods()
      .then((methods) => {
        setPaymentMethods(methods);
        if (methods.length > 0) setSelectedMethod(methods[0].code);
      })
      .catch(() => setPaymentMethods([]));
  }, [reservation, event, navigate]);

  useEffect(() => {
    if (!reservation) return;
    const end = new Date(reservation.reservedUntil).getTime();

    const tick = () => {
      const remaining = Math.max(0, Math.floor((end - Date.now()) / 1000));
      setCountdown(remaining);
      if (remaining === 0 && !order) {
        openSnackbar({
          open: true,
          message: intl.formatMessage({ id: 'checkout.reservationExpired', defaultMessage: 'Reservation expired.' }),
          variant: 'alert',
          alert: { color: 'error' }
        } as any);
        navigate('/events', { replace: true });
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [reservation, order, navigate, intl]);

  const subtotal = useMemo(() => reservation?.items.reduce((sum, item) => sum + item.subtotal, 0) || 0, [reservation]);

  const discountAmount = appliedPromotion?.discountAmount || 0;
  const platformFee = order?.platformFee || 0;
  const finalAmount = order?.finalAmount || subtotal - discountAmount + platformFee;

  const handleValidatePromotion = async () => {
    if (!promotionCode.trim() || !event) return;
    setValidating(true);
    try {
      const result = await validatePromotion({ code: promotionCode.trim(), eventId: event.id });
      if (result.valid && result.discountAmount !== undefined) {
        setAppliedPromotion({ code: promotionCode.trim(), discountAmount: result.discountAmount });
        openSnackbar({
          open: true,
          message: intl.formatMessage({ id: 'checkout.promotionApplied', defaultMessage: 'Promotion applied.' }),
          variant: 'alert',
          alert: { color: 'success' }
        } as any);
      } else {
        setAppliedPromotion(null);
        openSnackbar({
          open: true,
          message: result.message || intl.formatMessage({ id: 'checkout.promotionInvalid', defaultMessage: 'Invalid promotion code.' }),
          variant: 'alert',
          alert: { color: 'error' }
        } as any);
      }
    } catch {
      openSnackbar({
        open: true,
        message: intl.formatMessage({ id: 'checkout.promotionError', defaultMessage: 'Failed to validate promotion.' }),
        variant: 'alert',
        alert: { color: 'error' }
      } as any);
    } finally {
      setValidating(false);
    }
  };

  const handleCreateOrder = async () => {
    if (!reservation) return;
    setCreating(true);
    try {
      const created = await createOrder({
        reservationId: reservation.reservationId,
        promotionCode: appliedPromotion?.code
      });
      setOrder(created);
    } catch {
      openSnackbar({
        open: true,
        message: intl.formatMessage({ id: 'checkout.createOrderError', defaultMessage: 'Failed to create order.' }),
        variant: 'alert',
        alert: { color: 'error' }
      } as any);
    } finally {
      setCreating(false);
    }
  };

  const handlePay = async () => {
    if (!order) return;
    setPaying(true);
    try {
      const result = await mockPayOrder(order.id, {
        paymentMethod: selectedMethod || 'MOCK_VNPAY',
        returnMessage: 'Pay Successfully'
      });
      navigate('/payment/success', { state: { order, payment: result, event } });
    } catch {
      openSnackbar({
        open: true,
        message: intl.formatMessage({ id: 'checkout.paymentError', defaultMessage: 'Payment failed.' }),
        variant: 'alert',
        alert: { color: 'error' }
      } as any);
    } finally {
      setPaying(false);
    }
  };

  const handleCancel = async () => {
    if (!order) return;
    try {
      await cancelOrder(order.id);
      navigate('/events', { replace: true });
    } catch {
      openSnackbar({
        open: true,
        message: intl.formatMessage({ id: 'checkout.cancelError', defaultMessage: 'Failed to cancel order.' }),
        variant: 'alert',
        alert: { color: 'error' }
      } as any);
    }
  };

  const formatCountdown = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (!reservation || !event) {
    return (
      <Box sx={{ minHeight: '70vh', display: 'grid', placeItems: 'center' }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: { xs: 4, md: 6 } }}>
      <Container maxWidth="xl">
      <Typography variant="h2" fontWeight={800} mb={1}>
        {intl.formatMessage({ id: 'checkout.title', defaultMessage: 'Checkout' })}
      </Typography>
      <Typography color="text.secondary" mb={4}>
        {intl.formatMessage({ id: 'checkout.subtitle', defaultMessage: 'Review your reservation and complete payment.' })}
      </Typography>

      <Grid container spacing={4} alignItems="flex-start">
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>
              <Stack spacing={3}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="h4" fontWeight={800}>
                    {event.title}
                  </Typography>
                  {!order && countdown > 0 && (
                    <Stack direction="row" spacing={1} alignItems="center" color="warning.main">
                      <Clock size={20} />
                      <Typography fontWeight={700}>{formatCountdown(countdown)}</Typography>
                    </Stack>
                  )}
                </Stack>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} flexWrap="wrap" useFlexGap>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Calendar1 size={20} />
                    <Typography>{formatDateTime(event.startTime, intl.locale)}</Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Location size={20} />
                    <Typography>{event.location}</Typography>
                  </Stack>
                </Stack>

                <Divider />

                <Typography variant="h6" fontWeight={700}>
                  {intl.formatMessage({ id: 'checkout.tickets', defaultMessage: 'Tickets' })}
                </Typography>
                {reservation.items.map((item) => (
                  <Stack key={item.ticketTypeId} direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Ticket2 size={18} />
                      <Typography>
                        {item.ticketTypeName} x {item.quantity}
                      </Typography>
                    </Stack>
                    <Typography fontWeight={700}>{formatCurrency(item.subtotal, intl.locale)}</Typography>
                  </Stack>
                ))}

                <Divider />

                {!order ? (
                  <Stack spacing={2}>
                    <Typography variant="h6" fontWeight={700}>
                      {intl.formatMessage({ id: 'checkout.promotion', defaultMessage: 'Promotion code' })}
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      <TextField
                        fullWidth
                        size="small"
                        value={promotionCode}
                        onChange={(e) => setPromotionCode(e.target.value)}
                        placeholder={intl.formatMessage({ id: 'checkout.promotionPlaceholder', defaultMessage: 'Enter code' })}
                      />
                      <Button variant="outlined" onClick={handleValidatePromotion} disabled={validating || !promotionCode.trim()}>
                        {validating
                          ? intl.formatMessage({ id: 'checkout.validating', defaultMessage: '...' })
                          : intl.formatMessage({ id: 'checkout.apply', defaultMessage: 'Apply' })}
                      </Button>
                    </Stack>
                    {appliedPromotion && (
                      <Typography color="success.main">
                        {intl.formatMessage(
                          { id: 'checkout.promotionDiscount', defaultMessage: 'Discount: -{amount}' },
                          { amount: formatCurrency(appliedPromotion.discountAmount, intl.locale) }
                        )}
                      </Typography>
                    )}
                  </Stack>
                ) : (
                  <Stack spacing={1}>
                    <Typography variant="h6" fontWeight={700}>
                      {intl.formatMessage({ id: 'checkout.orderSummary', defaultMessage: 'Order summary' })}
                    </Typography>
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
                    <SummaryRow
                      label={intl.formatMessage({ id: 'checkout.total', defaultMessage: 'Total' })}
                      value={formatCurrency(order.finalAmount, intl.locale)}
                      bold
                    />
                  </Stack>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ position: { md: 'sticky' }, top: 110 }}>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h5" fontWeight={800}>
                  {intl.formatMessage({ id: 'checkout.total', defaultMessage: 'Total' })}
                </Typography>
                <Typography variant="h3" fontWeight={800} color="primary.main">
                  {formatCurrency(finalAmount, intl.locale)}
                </Typography>

                {!order ? (
                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    disabled={creating}
                    onClick={handleCreateOrder}
                    sx={{ height: 48 }}
                  >
                    {creating
                      ? intl.formatMessage({ id: 'checkout.processing', defaultMessage: 'Processing...' })
                      : intl.formatMessage({ id: 'checkout.createOrder', defaultMessage: 'Create order' })}
                  </Button>
                ) : (
                  <>
                    <TextField
                      select
                      size="small"
                      fullWidth
                      value={selectedMethod}
                      onChange={(e) => setSelectedMethod(e.target.value)}
                      SelectProps={{ native: true }}
                      label={intl.formatMessage({ id: 'checkout.paymentMethod', defaultMessage: 'Payment method' })}
                    >
                      {paymentMethods.map((method) => (
                        <option key={method.code} value={method.code}>
                          {method.name}
                        </option>
                      ))}
                    </TextField>
                    <Button
                      variant="contained"
                      size="large"
                      fullWidth
                      disabled={paying}
                      onClick={handlePay}
                      sx={{ height: 48 }}
                    >
                      {paying
                        ? intl.formatMessage({ id: 'checkout.processing', defaultMessage: 'Processing...' })
                        : intl.formatMessage({ id: 'checkout.payNow', defaultMessage: 'Pay now' })}
                    </Button>
                    <Button variant="outlined" color="secondary" fullWidth onClick={handleCancel}>
                      {intl.formatMessage({ id: 'checkout.cancel', defaultMessage: 'Cancel order' })}
                    </Button>
                  </>
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

function SummaryRow({ label, value, bold = false }: { label: string; value: string; bold?: boolean }) {
  return (
    <Stack direction="row" justifyContent="space-between">
      <Typography color="text.secondary">{label}</Typography>
      <Typography fontWeight={bold ? 700 : 400}>{value}</Typography>
    </Stack>
  );
}
