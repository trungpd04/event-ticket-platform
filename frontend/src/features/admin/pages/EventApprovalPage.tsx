import { useEffect, useState } from 'react';

// material-ui
import Box from '@mui/material/Box';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// third-party
import { useIntl } from 'react-intl';

// project-imports
import { openSnackbar } from 'api/snackbar';
import AdminCard from 'features/admin/components/AdminCard';
import EventApprovalFilters from 'features/admin/components/event-approval/EventApprovalFilters';
import EventApprovalTable from 'features/admin/components/event-approval/EventApprovalTable';
import { searchAdminEvents } from 'features/admin/api/admin';

// types
import { AdminEvent, EventStatus, PagedResponse } from 'features/admin/types/admin';

// ==============================|| EVENT APPROVAL PAGE ||============================== //

const PAGE_SIZE = 10;

export default function EventApprovalPage() {
  const intl = useIntl();
  const [status, setStatus] = useState<EventStatus | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [data, setData] = useState<PagedResponse<AdminEvent> | null>(null);
  const [loading, setLoading] = useState(false);

  const [counts, setCounts] = useState<Record<EventStatus | 'ALL', number>>({
    ALL: 0,
    PENDING: 0,
    PUBLISHED: 0,
    CLOSED: 0
  });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [allRes, pendingRes, publishedRes, closedRes] = await Promise.all([
          searchAdminEvents({ size: 1 }),
          searchAdminEvents({ status: 'PENDING', size: 1 }),
          searchAdminEvents({ status: 'PUBLISHED', size: 1 }),
          searchAdminEvents({ status: 'CLOSED', size: 1 })
        ]);
        setCounts({
          ALL: allRes.totalElements,
          PENDING: pendingRes.totalElements,
          PUBLISHED: publishedRes.totalElements,
          CLOSED: closedRes.totalElements
        });

        const response = await searchAdminEvents({
          status: status === 'ALL' ? undefined : status,
          title: search || undefined,
          page,
          size: PAGE_SIZE
        });
        setData(response);
      } catch {
        openSnackbar({
          open: true,
          message: intl.formatMessage({ id: 'admin.events.loadError' }),
          variant: 'alert',
          alert: { color: 'error' }
        } as any);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [status, search, page, intl]);

  return (
    <Box>
      <Typography variant="h3" mb={3}>
        {intl.formatMessage({ id: 'admin.eventApproval' })}
      </Typography>

      <AdminCard sx={{ mb: 3 }}>
        <EventApprovalFilters
          status={status}
          onStatusChange={(value) => {
            setStatus(value);
            setPage(0);
          }}
          search={search}
          onSearchChange={(value) => {
            setSearch(value);
            setPage(0);
          }}
          counts={counts}
        />
      </AdminCard>

      {loading && (
        <Typography color="secondary.800" textAlign="center" py={4}>
          {intl.formatMessage({ id: 'admin.common.loading' })}
        </Typography>
      )}

      {!loading && data && <EventApprovalTable events={data.content} />}

      {data && data.totalPages > 1 && (
        <Stack alignItems="center" mt={3}>
          <Pagination count={data.totalPages} page={page + 1} onChange={(_, value) => setPage(value - 1)} color="primary" shape="rounded" />
        </Stack>
      )}
    </Box>
  );
}
