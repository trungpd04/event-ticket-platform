// material-ui
import Chip from '@mui/material/Chip';
import { useIntl } from 'react-intl';

// types
import { EventStatus } from '../types/admin';

// ==============================|| STATUS BADGE ||============================== //

interface StatusBadgeProps {
  status: EventStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const intl = useIntl();

  const config: Record<EventStatus, { color: 'default' | 'primary' | 'success' | 'error'; bg: string; label: string }> = {
    PENDING: {
      color: 'default',
      bg: 'rgba(193, 79, 230, 0.08)',
      label: intl.formatMessage({ id: 'admin.status.pending' })
    },
    PUBLISHED: {
      color: 'success',
      bg: 'rgba(76, 175, 80, 0.08)',
      label: intl.formatMessage({ id: 'admin.status.published' })
    },
    CLOSED: {
      color: 'error',
      bg: 'rgba(244, 67, 54, 0.08)',
      label: intl.formatMessage({ id: 'admin.status.closed' })
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
