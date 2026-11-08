// material-ui
import Chip from '@mui/material/Chip';
import { useIntl } from 'react-intl';

// types
import { Order } from 'features/booking/types';

type OrderStatus = Order['status'];

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

export default function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const intl = useIntl();

  const config: Record<OrderStatus, { color: 'default' | 'primary' | 'success' | 'error' | 'warning'; bg: string; label: string }> = {
    PENDING_PAYMENT: {
      color: 'warning',
      bg: 'rgba(255, 152, 0, 0.08)',
      label: intl.formatMessage({ id: 'orderStatus.pendingPayment' })
    },
    PAID: {
      color: 'success',
      bg: 'rgba(76, 175, 80, 0.08)',
      label: intl.formatMessage({ id: 'orderStatus.paid' })
    },
    CANCELLED: {
      color: 'error',
      bg: 'rgba(244, 67, 54, 0.08)',
      label: intl.formatMessage({ id: 'orderStatus.cancelled' })
    },
    EXPIRED: {
      color: 'default',
      bg: 'rgba(158, 158, 158, 0.08)',
      label: intl.formatMessage({ id: 'orderStatus.expired' })
    }
  };

  const { color, bg, label } = config[status];

  return (
    <Chip
      label={label}
      color={color}
      size="small"
      sx={{
        bgcolor: bg,
        fontWeight: 500,
        textTransform: 'capitalize'
      }}
    />
  );
}
