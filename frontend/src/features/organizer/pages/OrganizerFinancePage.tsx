import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// material-ui
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

// third-party
import { useIntl } from 'react-intl';

// project-imports
import { openSnackbar } from 'api/snackbar';
import { getOrganizerEvents } from 'features/organizer/api/organizer';
import {
  cancelPayoutRequest,
  createPayoutRequest,
  getMyPayoutRequests,
  getPayoutSummary,
  Payout,
  PayoutStatus,
  PayoutSummary
} from 'features/organizer/api/payout';
import { Event, PagedResponse } from 'types/organizer';
import { formatCurrency, formatDateTime } from 'utils/format';

// assets
import { Bank, EmptyWallet, MoneyRecive, MoneySend, ReceiptItem, WalletMoney } from 'iconsax-reactjs';

interface EventWithSummary extends Event {
  summary?: PayoutSummary;
  summaryLoading?: boolean;
}

const statusColor: Record<PayoutStatus, 'default' | 'primary' | 'success' | 'error' | 'warning'> = {
  PENDING: 'warning',
  APPROVED: 'primary',
  PAID: 'success',
  REJECTED: 'error',
  CANCELLED: 'default'
};

// ==============================|| ORGANIZER FINANCE PAGE ||============================== //

export default function OrganizerFinancePage() {
  const intl = useIntl();
  const navigate = useNavigate();

  const [events, setEvents] = useState<EventWithSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<Payout[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(true);

  const [selected, setSelected] = useState<EventWithSummary | null>(null);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    setRequestsLoading(true);
    try {
      const eventsPage = await getOrganizerEvents(0, 1000);
      const eventsData = (eventsPage as PagedResponse<Event>).content || [];

      // Prefetch summaries for closed events in parallel.
      const closed = eventsData.filter((e) => e.status === 'CLOSED');
      if (closed.length > 0) {
        const summaries = await Promise.all(
          closed.map((e) =>
            getPayoutSummary(e.id).catch(() => null)
          )
        );
        const merged = eventsData.map((e) => {
          const idx = closed.findIndex((c) => c.id === e.id);
          if (idx >= 0) {
            return { ...e, summary: summaries[idx] ?? undefined, summaryLoading: false };
          }
          return e;
        });
        setEvents(merged);
      } else {
        setEvents(eventsData);
      }

      const requestsPage = await getMyPayoutRequests({ page: 0, size: 100 });
      setRequests((requestsPage as PagedResponse<Payout>).content || []);
    } catch {
      openSnackbar({
        open: true,
        message: intl.formatMessage({ id: 'finance.loadError', defaultMessage: 'Unable to load finance data.' }),
        variant: 'alert',
        alert: { color: 'error' }
      } as any);
    } finally {
      setLoading(false);
      setRequestsLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRequest = async () => {
    if (!selected) return;
    setSubmitting(true);
    try {
      await createPayoutRequest(selected.id, note.trim() || undefined);
      openSnackbar({
        open: true,
        message: intl.formatMessage({ id: 'finance.requestSent', defaultMessage: 'Payout request sent.' }),
        variant: 'alert',
        alert: { color: 'success' }
      } as any);
      setSelected(null);
      setNote('');
      await load();
    } catch (err: any) {
      openSnackbar({
        open: true,
        message: err?.response?.data?.message || intl.formatMessage({ id: 'finance.requestError', defaultMessage: 'Failed to send payout request.' }),
        variant: 'alert',
        alert: { color: 'error' }
      } as any);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (id: number) => {
    try {
      await cancelPayoutRequest(id);
      openSnackbar({
        open: true,
        message: intl.formatMessage({ id: 'finance.cancelSuccess', defaultMessage: 'Payout request cancelled.' }),
        variant: 'alert',
        alert: { color: 'success' }
      } as any);
      await load();
    } catch {
      openSnackbar({
        open: true,
        message: intl.formatMessage({ id: 'finance.cancelError', defaultMessage: 'Failed to cancel payout request.' }),
        variant: 'alert',
        alert: { color: 'error' }
      } as any);
    }
  };

  const getRequestStatus = (eventId: number): PayoutStatus | undefined => {
    return requests.find((r) => r.eventId === eventId)?.status;
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pt: { xs: 10, sm: 11, md: 14 }, pb: { xs: 6, md: 10 } }}>
      <Container maxWidth="xl">
        <Typography variant="h3" fontWeight={800} mb={1}>
          {intl.formatMessage({ id: 'finance.title', defaultMessage: 'Finance' })}
        </Typography>
        <Typography color="text.secondary" mb={4}>
          {intl.formatMessage({ id: 'finance.subtitle', defaultMessage: 'Track event revenue and payout requests.' })}
        </Typography>

        <Grid container spacing={{ xs: 2, md: 4 }} alignItems="flex-start">
          <Grid size={{ xs: 12, lg: 8 }}>
            <Card>
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Stack direction="row" spacing={1.5} alignItems="center" mb={2}>
                  <MoneyRecive size={22} />
                  <Typography variant="h5" fontWeight={800}>
                    {intl.formatMessage({ id: 'finance.events', defaultMessage: 'Event revenue' })}
                  </Typography>
                </Stack>

                {loading ? (
                  <Stack alignItems="center" py={4}>
                    <CircularProgress />
                  </Stack>
                ) : events.length === 0 ? (
                  <Typography color="text.secondary" py={4} textAlign="center">
                    {intl.formatMessage({ id: 'finance.noEvents', defaultMessage: 'No events yet.' })}
                  </Typography>
                ) : (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>{intl.formatMessage({ id: 'finance.event', defaultMessage: 'Event' })}</TableCell>
                          <TableCell align="right">{intl.formatMessage({ id: 'finance.grossRevenue', defaultMessage: 'Gross revenue' })}</TableCell>
                          <TableCell align="right">{intl.formatMessage({ id: 'finance.commission', defaultMessage: 'Commission' })}</TableCell>
                          <TableCell align="right">{intl.formatMessage({ id: 'finance.netRevenue', defaultMessage: 'Net revenue' })}</TableCell>
                          <TableCell>{intl.formatMessage({ id: 'finance.status', defaultMessage: 'Payout status' })}</TableCell>
                          <TableCell align="right">{intl.formatMessage({ id: 'finance.action', defaultMessage: 'Action' })}</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {events.map((event) => {
                          const summary = event.summary;
                          const requestStatus = getRequestStatus(event.id);
                          return (
                            <TableRow key={event.id} hover>
                              <TableCell>
                                <Typography fontWeight={700}>{event.title}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {formatDateTime(event.endTime, intl.locale)}
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                {summary ? formatCurrency(summary.grossRevenue, intl.locale) : '-'}
                              </TableCell>
                              <TableCell align="right">
                                {summary ? formatCurrency(summary.commissionFee, intl.locale) : '-'}
                              </TableCell>
                              <TableCell align="right">
                                {summary ? (
                                  <Typography fontWeight={700} color="success.main">
                                    {formatCurrency(summary.netRevenue, intl.locale)}
                                  </Typography>
                                ) : (
                                  '-'
                                )}
                              </TableCell>
                              <TableCell>
                                {requestStatus ? (
                                  <Chip label={requestStatus} color={statusColor[requestStatus]} size="small" />
                                ) : (
                                  '-'
                                )}
                              </TableCell>
                              <TableCell align="right">
                                {event.status === 'CLOSED' && summary ? (
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    disabled={!summary.canRequest}
                                    onClick={() => {
                                      setSelected(event);
                                      setNote('');
                                    }}
                                  >
                                    {intl.formatMessage({ id: 'finance.requestPayout', defaultMessage: 'Request payout' })}
                                  </Button>
                                ) : (
                                  '-'
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, lg: 4 }}>
            <Card>
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Stack direction="row" spacing={1.5} alignItems="center" mb={2}>
                  <WalletMoney size={22} />
                  <Typography variant="h5" fontWeight={800}>
                    {intl.formatMessage({ id: 'finance.requests', defaultMessage: 'Payout requests' })}
                  </Typography>
                </Stack>

                {requestsLoading ? (
                  <Stack alignItems="center" py={4}>
                    <CircularProgress />
                  </Stack>
                ) : requests.length === 0 ? (
                  <Typography color="text.secondary" py={4} textAlign="center">
                    {intl.formatMessage({ id: 'finance.noRequests', defaultMessage: 'No payout requests yet.' })}
                  </Typography>
                ) : (
                  <Stack spacing={2}>
                    {requests.map((req) => (
                      <Card key={req.id} variant="outlined">
                        <CardContent sx={{ p: 2 }}>
                          <Stack spacing={1}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Typography fontWeight={700}>{req.requestCode}</Typography>
                              <Chip label={req.status} color={statusColor[req.status]} size="small" />
                            </Stack>
                            <Typography variant="body2" color="text.secondary">
                              {req.eventTitle}
                            </Typography>
                            <Typography variant="body2">
                              {intl.formatMessage({ id: 'finance.netRevenue', defaultMessage: 'Net revenue' })}:{' '}
                              {formatCurrency(req.approvedNetAmount ?? req.netRevenue, intl.locale)}
                            </Typography>
                            {req.status === 'PENDING' && (
                              <Button
                                size="small"
                                color="error"
                                variant="outlined"
                                fullWidth
                                onClick={() => handleCancel(req.id)}
                              >
                                {intl.formatMessage({ id: 'finance.cancel', defaultMessage: 'Cancel' })}
                              </Button>
                            )}
                          </Stack>
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      <Dialog open={!!selected} onClose={() => setSelected(null)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {intl.formatMessage({ id: 'finance.requestPayout', defaultMessage: 'Request payout' })}
        </DialogTitle>
        <DialogContent>
          {selected?.summary && (
            <Stack spacing={2} pt={1}>
              <Typography fontWeight={700}>{selected.title}</Typography>
              <Stack direction="row" justifyContent="space-between">
                <Typography color="text.secondary">
                  {intl.formatMessage({ id: 'finance.grossRevenue', defaultMessage: 'Gross revenue' })}
                </Typography>
                <Typography fontWeight={600}>{formatCurrency(selected.summary.grossRevenue, intl.locale)}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography color="text.secondary">
                  {intl.formatMessage({ id: 'finance.commission', defaultMessage: 'Commission' })}
                </Typography>
                <Typography fontWeight={600}>{formatCurrency(selected.summary.commissionFee, intl.locale)}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography color="text.secondary">
                  {intl.formatMessage({ id: 'finance.netRevenue', defaultMessage: 'Net revenue' })}
                </Typography>
                <Typography fontWeight={700} color="success.main">
                  {formatCurrency(selected.summary.netRevenue, intl.locale)}
                </Typography>
              </Stack>

              <Divider />

              <Stack direction="row" spacing={1.5} alignItems="center">
                <Bank size={18} />
                <Typography variant="body2" color="text.secondary">
                  {selected.summary.canRequest
                    ? intl.formatMessage({ id: 'finance.bankReady', defaultMessage: 'Bank info verified.' })
                    : selected.summary.reason || intl.formatMessage({ id: 'finance.notReady', defaultMessage: 'Not ready for payout.' })}
                </Typography>
              </Stack>

              <TextField
                label={intl.formatMessage({ id: 'finance.note', defaultMessage: 'Note (optional)' })}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                multiline
                rows={2}
                fullWidth
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelected(null)} color="secondary">
            {intl.formatMessage({ id: 'common.cancel', defaultMessage: 'Cancel' })}
          </Button>
          <Button
            variant="contained"
            onClick={handleRequest}
            disabled={submitting || !selected?.summary?.canRequest}
            startIcon={<MoneySend size={18} />}
          >
            {submitting
              ? intl.formatMessage({ id: 'common.processing', defaultMessage: 'Processing...' })
              : intl.formatMessage({ id: 'finance.confirmRequest', defaultMessage: 'Send request' })}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
