// material-ui
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// third-party
import { useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';

// project-imports
import AdminCard from 'features/admin/components/AdminCard';
import EventUpdateRequestStatusBadge from 'features/admin/components/event-update-requests/EventUpdateRequestStatusBadge';
import { EventUpdateRequest } from 'features/admin/types/admin';
import { formatDateTime } from 'utils/format';

// assets
import { ArrowRight2, Calendar, Profile, Tag } from 'iconsax-reactjs';

interface EventUpdateRequestTableProps {
  requests: EventUpdateRequest[];
}

export default function EventUpdateRequestTable({ requests }: EventUpdateRequestTableProps) {
  const intl = useIntl();
  const navigate = useNavigate();

  if (requests.length === 0) {
    return (
      <AdminCard>
        <Typography color="secondary.800" textAlign="center">
          {intl.formatMessage({ id: 'admin.eventUpdateRequest.empty' })}
        </Typography>
      </AdminCard>
    );
  }

  return (
    <Stack spacing={2}>
      {requests.map((request) => (
        <AdminCard key={request.id}>
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  {request.eventTitle || intl.formatMessage({ id: 'admin.eventUpdateRequest.noTitle' })}
                </Typography>
                <Typography variant="body2" color="secondary.800">
                  #{request.eventId} · Request #{request.id}
                </Typography>
              </Box>
              <EventUpdateRequestStatusBadge status={request.status} />
            </Box>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} color="secondary.800">
              <Stack direction="row" spacing={1} alignItems="center">
                <Profile size={18} />
                <Typography variant="body2">{request.organizerEmail || '-'}</Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <Calendar size={18} />
                <Typography variant="body2">{formatDateTime(request.createdAt, intl.locale)}</Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <Tag size={18} />
                <Typography variant="body2">{Object.keys(request.payload).length} fields</Typography>
              </Stack>
            </Stack>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="text"
                color="primary"
                endIcon={<ArrowRight2 size={18} />}
                onClick={() => navigate(`/admin/event-update-requests/${request.id}`)}
              >
                {intl.formatMessage({ id: 'admin.common.detail' })}
              </Button>
            </Box>
          </Stack>
        </AdminCard>
      ))}
    </Stack>
  );
}
