// material-ui
import Chip from '@mui/material/Chip';

// third-party
import { useIntl } from 'react-intl';

// types
import { EventUpdateRequestStatus } from 'features/admin/types/admin';

interface EventUpdateRequestStatusBadgeProps {
  status: EventUpdateRequestStatus;
}

export default function EventUpdateRequestStatusBadge({ status }: EventUpdateRequestStatusBadgeProps) {
  const intl = useIntl();

  const config: Record<EventUpdateRequestStatus, { color: 'default' | 'primary' | 'success' | 'error'; bg: string; label: string }> = {
    PENDING_REVIEW: {
      color: 'primary',
      bg: 'rgba(255, 152, 0, 0.08)',
      label: intl.formatMessage({ id: 'admin.eventUpdateRequest.status.pendingReview' })
    },
    APPROVED: {
      color: 'success',
      bg: 'rgba(76, 175, 80, 0.08)',
      label: intl.formatMessage({ id: 'admin.eventUpdateRequest.status.approved' })
    },
    REJECTED: {
      color: 'error',
      bg: 'rgba(244, 67, 54, 0.08)',
      label: intl.formatMessage({ id: 'admin.eventUpdateRequest.status.rejected' })
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
