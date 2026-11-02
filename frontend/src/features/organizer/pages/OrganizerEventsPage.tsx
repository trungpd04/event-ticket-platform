import { useEffect, useMemo, useState } from 'react';

// material-ui
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// third-party
import { useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';

// project-imports
import { openSnackbar } from 'api/snackbar';
import AdminCard from 'features/admin/components/AdminCard';
import StatusBadge from 'features/admin/components/StatusBadge';
import { EventStatus } from 'features/admin/types/admin';
import { getOrganizerEvents, requestPublishEvent } from 'features/organizer/api/organizer';
import { Event } from 'types/organizer';
import { formatDateTime } from 'utils/format';

// assets
import { ArrowRight2, Calendar, Location, SearchNormal1, Tag, Ticket2 } from 'iconsax-reactjs';

const PAGE_SIZE = 10;

// ==============================|| ORGANIZER EVENTS PAGE ||============================== //

export default function OrganizerEventsPage() {
  const intl = useIntl();
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const loadEvents = async (currentPage: number) => {
    setLoading(true);
    try {
      const response = await getOrganizerEvents(currentPage, PAGE_SIZE);
      setEvents(response.content);
      setTotalPages(response.totalPages);
    } catch {
      openSnackbar({
        open: true,
        message: intl.formatMessage({ id: 'organizer.events.loadError' }),
        variant: 'alert',
        alert: { color: 'error' }
      } as any);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents(page);
  }, [page, intl]);

  const filteredEvents = useMemo(() => {
    if (!search.trim()) return events;
    const term = search.trim().toLowerCase();
    return events.filter((event) => event.title.toLowerCase().includes(term));
  }, [events, search]);

  const handleRequestPublish = async (eventId: number) => {
    try {
      await requestPublishEvent(eventId);
      openSnackbar({
        open: true,
        message: intl.formatMessage({ id: 'organizer.events.requestPublishSuccess' }),
        variant: 'alert',
        alert: { color: 'success' }
      } as any);
      loadEvents(page);
    } catch {
      openSnackbar({
        open: true,
        message: intl.formatMessage({ id: 'organizer.events.requestPublishError' }),
        variant: 'alert',
        alert: { color: 'error' }
      } as any);
    }
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h3">{intl.formatMessage({ id: 'organizer.events.title' })}</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Ticket2 size={18} />}
          onClick={() => navigate('/organizer/events/create')}
        >
          {intl.formatMessage({ id: 'organizer.events.create' })}
        </Button>
      </Stack>

      <AdminCard sx={{ mb: 3 }}>
        <OutlinedInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={intl.formatMessage({ id: 'organizer.events.search' })}
          startAdornment={
            <InputAdornment position="start">
              <SearchNormal1 size={20} />
            </InputAdornment>
          }
          sx={{
            bgcolor: 'secondary.200',
            borderRadius: 2,
            color: 'secondary.darker',
            '& fieldset': { borderColor: 'transparent' },
            '&:hover fieldset': { borderColor: 'secondary.500' },
            '&.Mui-focused fieldset': { borderColor: 'primary.main' },
            minWidth: { xs: '100%', md: 320 }
          }}
        />
      </AdminCard>

      {loading && (
        <Typography color="secondary.800" textAlign="center" py={4}>
          {intl.formatMessage({ id: 'organizer.events.loading' })}
        </Typography>
      )}

      {!loading && filteredEvents.length === 0 && (
        <AdminCard>
          <Typography color="secondary.800" textAlign="center">
            {intl.formatMessage({ id: 'organizer.events.empty' })}
          </Typography>
        </AdminCard>
      )}

      {!loading && filteredEvents.length > 0 && (
        <Stack spacing={2}>
          {filteredEvents.map((event) => (
            <AdminCard key={event.id}>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>
                  <Box>
                    <Typography variant="h6" fontWeight={700}>
                      {event.title}
                    </Typography>
                    <Typography variant="body2" color="secondary.800">
                      #{event.id}
                    </Typography>
                  </Box>
                  <StatusBadge status={event.status as EventStatus} />
                </Box>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} color="secondary.800">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Calendar size={18} />
                    <Typography variant="body2">{formatDateTime(event.startTime, intl.locale)}</Typography>
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
                <Stack direction="row" spacing={2} justifyContent="flex-end">
                  {event.status === 'PENDING' && (
                    <Button variant="outlined" color="primary" onClick={() => handleRequestPublish(event.id)}>
                      {intl.formatMessage({ id: 'organizer.events.requestPublish' })}
                    </Button>
                  )}
                  <Button
                    variant="text"
                    color="primary"
                    endIcon={<ArrowRight2 size={18} />}
                    onClick={() => navigate(`/events/${event.id}`)}
                  >
                    {intl.formatMessage({ id: 'organizer.events.detail' })}
                  </Button>
                </Stack>
              </Stack>
            </AdminCard>
          ))}
        </Stack>
      )}

      {!loading && totalPages > 1 && (
        <Stack alignItems="center" mt={3}>
          <Pagination count={totalPages} page={page + 1} onChange={(_, value) => setPage(value - 1)} color="primary" shape="rounded" />
        </Stack>
      )}
    </Box>
  );
}
