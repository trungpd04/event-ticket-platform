// material-ui
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// third-party
import { useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';

// project-imports
import { ArrowRight2, Calendar, Location, Tag } from 'iconsax-reactjs';
import AdminCard from 'features/admin/components/AdminCard';
import StatusBadge from 'features/admin/components/StatusBadge';

// types
import { AdminEvent } from 'features/admin/types/admin';

// ==============================|| EVENT APPROVAL TABLE ||============================== //

interface EventApprovalTableProps {
  events: AdminEvent[];
}

export default function EventApprovalTable({ events }: EventApprovalTableProps) {
  const intl = useIntl();
  const navigate = useNavigate();

  if (events.length === 0) {
    return (
      <AdminCard>
        <Typography color="secondary.800" textAlign="center">
          {intl.formatMessage({ id: 'admin.events.empty' })}
        </Typography>
      </AdminCard>
    );
  }

  return (
    <Stack spacing={2}>
      {events.map((event) => (
        <AdminCard key={event.id}>
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  {event.title}
                </Typography>
                <Typography variant="body2" color="secondary.800">
                  #{event.id}
                </Typography>
              </Box>
              <StatusBadge status={event.status} />
            </Box>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} color="secondary.800">
              <Stack direction="row" spacing={1} alignItems="center">
                <Calendar size={18} />
                <Typography variant="body2">{new Date(event.startTime).toLocaleString(intl.locale)}</Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <Location size={18} />
                <Typography variant="body2">{event.location}</Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <Tag size={18} />
                <Typography variant="body2">{event.category?.name || '-'}</Typography>
              </Stack>
            </Stack>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="text"
                color="primary"
                endIcon={<ArrowRight2 size={18} />}
                onClick={() => navigate(`/admin/events/approval/${event.id}`)}
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
