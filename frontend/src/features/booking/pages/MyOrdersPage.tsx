import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// material-ui
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Container from '@mui/material/Container';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// third-party
import { useIntl } from 'react-intl';

// project-imports
import { openSnackbar } from 'api/snackbar';
import { cancelOrder, createPaymentInstruction, getMyOrders, getPaymentMethods } from 'features/booking/api/booking';
import OrderStatusBadge from 'features/booking/components/OrderStatusBadge';
import { Order } from 'features/booking/types';
import { formatCurrency, formatDateTime } from 'utils/format';

// assets
import { ArrowRight2, Calendar1, Ticket2 } from 'iconsax-reactjs';

const PAGE_SIZE = 10;

// ==============================|| MY ORDERS PAGE ||============================== //

export default function MyOrdersPage() {
  const intl = useIntl();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [payingOrderId, setPayingOrderId] = useState<number | null>(null);

  const load = async (currentPage: number) => {
    setLoading(true);
    try {
      const response = await getMyOrders({ page: currentPage, size: PAGE_SIZE });
      setOrders(response.content);
      setTotalPages(response.totalPages);
    } catch {
      openSnackbar({
        open: true,
        message: intl.formatMessage({ id: 'myOrders.loadError', defaultMessage: 'Failed to load orders.' }),
        variant: 'alert',
        alert: { color: 'error' }
      } as any);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(page);
  }, [page, intl]);

  const handleCancel = async (orderId: number) => {
    try {
      await cancelOrder(orderId);
      openSnackbar({
        open: true,
        message: intl.formatMessage({ id: 'myOrders.cancelSuccess', defaultMessage: 'Order cancelled.' }),
        variant: 'alert',
        alert: { color: 'success' }
      } as any);
      load(page);
    } catch {
      openSnackbar({
        open: true,
        message: intl.formatMessage({ id: 'myOrders.cancelError', defaultMessage: 'Failed to cancel order.' }),
        variant: 'alert',
        alert: { color: 'error' }
      } as any);
    }
  };

  const handleContinuePayment = async (order: Order) => {
    setPayingOrderId(order.id);
    try {
      const methods = await getPaymentMethods();
      const provider = methods[0]?.code;
      const payment = await createPaymentInstruction(order.id, provider);
      navigate('/payment/success', { state: { order, payment } });
    } catch {
      openSnackbar({
        open: true,
        message: intl.formatMessage({ id: 'myOrders.paymentError', defaultMessage: 'Unable to start payment.' }),
        variant: 'alert',
        alert: { color: 'error' }
      } as any);
    } finally {
      setPayingOrderId(null);
    }
  };

  return (
    <Box sx={{ bgcolor: 'background.default', pt: { xs: 10, sm: 11, md: 14 }, pb: { xs: 6, md: 10 } }}>
      <Container maxWidth="lg">
        <Typography variant="h3" fontWeight={800} mb={3}>
          {intl.formatMessage({ id: 'myOrders.title', defaultMessage: 'My orders' })}
        </Typography>

        {loading && (
          <Typography color="text.secondary" textAlign="center" py={4}>
            {intl.formatMessage({ id: 'myOrders.loading', defaultMessage: 'Loading...' })}
          </Typography>
        )}

        {!loading && orders.length === 0 && (
          <Card>
            <CardContent>
              <Typography color="text.secondary" textAlign="center">
                {intl.formatMessage({ id: 'myOrders.empty', defaultMessage: 'No orders found.' })}
              </Typography>
            </CardContent>
          </Card>
        )}

        {!loading && orders.length > 0 && (
          <>
            <Stack spacing={2}>
              {orders.map((order) => (
                <Card key={order.id}>
                  <CardContent>
                    <Stack spacing={2}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="h6" fontWeight={700} sx={{ overflowWrap: 'anywhere' }}>
                            {order.orderCode}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            #{order.id}
                          </Typography>
                        </Box>
                        <Box sx={{ flexShrink: 0 }}>
                          <OrderStatusBadge status={order.status} />
                        </Box>
                      </Stack>

                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1, sm: 3 }}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
                          <Calendar1 size={18} style={{ flexShrink: 0 }} />
                          <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
                            {formatDateTime(order.paidAt || order.expiredAt || '', intl.locale)}
                          </Typography>
                        </Stack>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0, flexShrink: 0 }}>
                          <Ticket2 size={18} style={{ flexShrink: 0 }} />
                          <Typography variant="body2">
                            {order.items.reduce((sum, item) => sum + item.quantity, 0)}{' '}
                            {intl.formatMessage({ id: 'myOrders.tickets', defaultMessage: 'tickets' })}
                          </Typography>
                        </Stack>
                      </Stack>

                      <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        justifyContent="space-between"
                        alignItems={{ xs: 'flex-start', sm: 'center' }}
                        spacing={2}
                      >
                        <Typography variant="h6" fontWeight={800} color="primary.main" sx={{ flexShrink: 0 }}>
                          {formatCurrency(order.finalAmount, intl.locale)}
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}>
                          {order.status === 'PENDING_PAYMENT' && (
                            <>
                              <Button
                                variant="contained"
                                size="small"
                                disabled={payingOrderId === order.id}
                                onClick={() => handleContinuePayment(order)}
                              >
                                {payingOrderId === order.id
                                  ? intl.formatMessage({ id: 'myOrders.paymentStarting', defaultMessage: 'Opening...' })
                                  : intl.formatMessage({ id: 'myOrders.pay', defaultMessage: 'Pay' })}
                              </Button>
                              <Button variant="outlined" color="error" size="small" onClick={() => handleCancel(order.id)}>
                                {intl.formatMessage({ id: 'myOrders.cancel', defaultMessage: 'Cancel' })}
                              </Button>
                            </>
                          )}
                          <Button
                            variant="text"
                            color="primary"
                            endIcon={<ArrowRight2 size={18} />}
                            onClick={() => navigate(`/my-orders/${order.id}`)}
                          >
                            {intl.formatMessage({ id: 'myOrders.detail', defaultMessage: 'Detail' })}
                          </Button>
                        </Stack>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>

            {totalPages > 1 && (
              <Stack alignItems="center" mt={3}>
                <Pagination count={totalPages} page={page + 1} onChange={(_, value) => setPage(value - 1)} color="primary" shape="rounded" />
              </Stack>
            )}
          </>
        )}
      </Container>
    </Box>
  );
}
