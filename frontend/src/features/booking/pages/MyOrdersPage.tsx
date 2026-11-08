import { useEffect, useState } from 'react';

// material-ui
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// third-party
import { useIntl } from 'react-intl';

// project-imports
import { openSnackbar } from 'api/snackbar';
import { cancelOrder, getMyOrders } from 'features/booking/api/booking';
import OrderStatusBadge from 'features/booking/components/OrderStatusBadge';
import { Order } from 'features/booking/types';
import { formatCurrency, formatDateTime } from 'utils/format';

// assets
import { ArrowRight2, Calendar1, Ticket2 } from 'iconsax-reactjs';

const PAGE_SIZE = 10;

// ==============================|| MY ORDERS PAGE ||============================== //

export default function MyOrdersPage() {
  const intl = useIntl();
  const [orders, setOrders] = useState<Order[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);

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

  return (
    <Box sx={{ py: { xs: 4, md: 6 } }}>
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
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Box>
                        <Typography variant="h6" fontWeight={700}>
                          {order.orderCode}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          #{order.id}
                        </Typography>
                      </Box>
                      <OrderStatusBadge status={order.status} />
                    </Stack>

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Calendar1 size={18} />
                        <Typography variant="body2">{formatDateTime(order.paidAt || order.expiredAt || '', intl.locale)}</Typography>
                      </Stack>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Ticket2 size={18} />
                        <Typography variant="body2">
                          {order.items.reduce((sum, item) => sum + item.quantity, 0)}{' '}
                          {intl.formatMessage({ id: 'myOrders.tickets', defaultMessage: 'tickets' })}
                        </Typography>
                      </Stack>
                    </Stack>

                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="h6" fontWeight={800} color="primary.main">
                        {formatCurrency(order.finalAmount, intl.locale)}
                      </Typography>
                      <Stack direction="row" spacing={1}>
                        {order.status === 'PENDING_PAYMENT' && (
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            onClick={() => handleCancel(order.id)}
                          >
                            {intl.formatMessage({ id: 'myOrders.cancel', defaultMessage: 'Cancel' })}
                          </Button>
                        )}
                        <Button variant="text" color="primary" endIcon={<ArrowRight2 size={18} />}>
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
    </Box>
  );
}
