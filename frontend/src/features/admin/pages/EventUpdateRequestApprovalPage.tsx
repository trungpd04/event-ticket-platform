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
import EventUpdateRequestFilters from 'features/admin/components/event-update-requests/EventUpdateRequestFilters';
import EventUpdateRequestTable from 'features/admin/components/event-update-requests/EventUpdateRequestTable';
import { getEventUpdateRequests } from 'features/admin/api/admin';

// types
import { EventUpdateRequest, PagedResponse } from 'features/admin/types/admin';

const PAGE_SIZE = 10;

// ==============================|| EVENT UPDATE REQUEST APPROVAL PAGE ||============================== //

export default function EventUpdateRequestApprovalPage() {
  const intl = useIntl();
  const [status, setStatus] = useState<string>('PENDING_REVIEW');
  const [page, setPage] = useState(0);
  const [data, setData] = useState<PagedResponse<EventUpdateRequest> | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const response = await getEventUpdateRequests({
          status: status === 'ALL' ? undefined : status,
          page,
          size: PAGE_SIZE
        });
        setData(response);
      } catch {
        openSnackbar({
          open: true,
          message: intl.formatMessage({ id: 'admin.eventUpdateRequest.loadError' }),
          variant: 'alert',
          alert: { color: 'error' }
        } as any);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [status, page, intl]);

  return (
    <Box>
      <Typography variant="h3" mb={3}>
        {intl.formatMessage({ id: 'admin.eventUpdateRequest.title' })}
      </Typography>

      <AdminCard sx={{ mb: 3 }}>
        <EventUpdateRequestFilters
          status={status}
          onStatusChange={(value) => {
            setStatus(value);
            setPage(0);
          }}
        />
      </AdminCard>

      {loading && (
        <Typography color="secondary.800" textAlign="center" py={4}>
          {intl.formatMessage({ id: 'admin.common.loading' })}
        </Typography>
      )}

      {!loading && data && <EventUpdateRequestTable requests={data.content} />}

      {data && data.totalPages > 1 && (
        <Stack alignItems="center" mt={3}>
          <Pagination count={data.totalPages} page={page + 1} onChange={(_, value) => setPage(value - 1)} color="primary" shape="rounded" />
        </Stack>
      )}
    </Box>
  );
}
