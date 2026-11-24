import { useEffect, useState } from 'react';

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
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

// third-party
import { useIntl } from 'react-intl';

// project-imports
import { openSnackbar } from 'api/snackbar';
import {
  approvePayoutRequest,
  getPayoutRequests,
  markPayoutPaid,
  rejectPayoutRequest
} from 'features/admin/api/payout';
import { Payout, PayoutStatus } from 'features/organizer/api/payout';
import { PagedResponse } from 'types/organizer';
import { formatCurrency, formatDateTime } from 'utils/format';

// assets
import { Bank, CloseCircle, Eye, MoneySend, TickCircle } from 'iconsax-reactjs';

const statusColor: Record<PayoutStatus, 'default' | 'primary' | 'success' | 'error' | 'warning'> = {
  PENDING: 'warning',
  APPROVED: 'primary',
  PAID: 'success',
  REJECTED: 'error',
  CANCELLED: 'default'
};

// ==============================|| ADMIN PAYOUT PAGE ||============================== //

export default function AdminPayoutPage() {
  const intl = useIntl();

  const [requests, setRequests] = useState<PagedResponse<Payout> | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<PayoutStatus | ''>('');
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);

  const [selected, setSelected] = useState<Payout | null>(null);
  const [action, setAction] = useState<'approve' | 'reject' | 'paid' | null>(null);
  const [note, setNote] = useState('');
  const [transactionRef, setTransactionRef] = useState('');
  const [paidAt, setPaidAt] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getPayoutRequests({
        status: statusFilter || undefined,
        page,
        size
      });
      setRequests(data);
    } catch {
      openSnackbar({
        open: true,
        message: intl.formatMessage({ id: 'adminPayout.loadError', defaultMessage: 'Unable to load payout requests.' }),
        variant: 'alert',
        alert: { color: 'error' }
      } as any);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, page, size]);

  const resetDialog = () => {
    setSelected(null);
    setAction(null);
    setNote('');
    setTransactionRef('');
    setPaidAt('');
  };

  const handleSubmit = async () => {
    if (!selected || !action) return;
    setSubmitting(true);
    try {
      if (action === 'approve') {
        await approvePayoutRequest(selected.id, selected.netRevenue, note.trim() || undefined);
      } else if (action === 'reject') {
        await rejectPayoutRequest(selected.id, note.trim());
      } else if (action === 'paid') {
        await markPayoutPaid(selected.id, transactionRef.trim(), paidAt);
      }
      openSnackbar({
        open: true,
        message: intl.formatMessage({ id: 'adminPayout.actionSuccess', defaultMessage: 'Action completed.' }),
        variant: 'alert',
        alert: { color: 'success' }
      } as any);
      resetDialog();
      await load();
    } catch (err: any) {
      openSnackbar({
        open: true,
        message: err?.response?.data?.message || intl.formatMessage({ id: 'adminPayout.actionError', defaultMessage: 'Action failed.' }),
        variant: 'alert',
        alert: { color: 'error' }
      } as any);
    } finally {
      setSubmitting(false);
    }
  };

  const openDialog = (req: Payout, a: 'approve' | 'reject' | 'paid') => {
    setSelected(req);
    setAction(a);
    setNote('');
    setTransactionRef('');
    setPaidAt(new Date().toISOString().slice(0, 16));
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pt: { xs: 10, sm: 11, md: 14 }, pb: { xs: 6, md: 10 } }}>
      <Container maxWidth="xl">
        <Typography variant="h3" fontWeight={800} mb={1}>
          {intl.formatMessage({ id: 'adminPayout.title', defaultMessage: 'Payout approval' })}
        </Typography>
        <Typography color="text.secondary" mb={4}>
          {intl.formatMessage({ id: 'adminPayout.subtitle', defaultMessage: 'Review and process organizer payout requests.' })}
        </Typography>

        <Card>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }} mb={2}>
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel>{intl.formatMessage({ id: 'adminPayout.status', defaultMessage: 'Status' })}</InputLabel>
                <Select
                  value={statusFilter}
                  label={intl.formatMessage({ id: 'adminPayout.status', defaultMessage: 'Status' })}
                  onChange={(e) => {
                    setStatusFilter(e.target.value as PayoutStatus | '');
                    setPage(0);
                  }}
                >
                  <MenuItem value="">{intl.formatMessage({ id: 'common.all', defaultMessage: 'All' })}</MenuItem>
                  <MenuItem value="PENDING">PENDING</MenuItem>
                  <MenuItem value="APPROVED">APPROVED</MenuItem>
                  <MenuItem value="PAID">PAID</MenuItem>
                  <MenuItem value="REJECTED">REJECTED</MenuItem>
                  <MenuItem value="CANCELLED">CANCELLED</MenuItem>
                </Select>
              </FormControl>
            </Stack>

            {loading ? (
              <Stack alignItems="center" py={4}>
                <CircularProgress />
              </Stack>
            ) : !requests || requests.content.length === 0 ? (
              <Typography color="text.secondary" py={4} textAlign="center">
                {intl.formatMessage({ id: 'adminPayout.noRequests', defaultMessage: 'No payout requests found.' })}
              </Typography>
            ) : (
              <>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>{intl.formatMessage({ id: 'adminPayout.requestCode', defaultMessage: 'Request' })}</TableCell>
                        <TableCell>{intl.formatMessage({ id: 'adminPayout.event', defaultMessage: 'Event' })}</TableCell>
                        <TableCell align="right">{intl.formatMessage({ id: 'finance.grossRevenue', defaultMessage: 'Gross revenue' })}</TableCell>
                        <TableCell align="right">{intl.formatMessage({ id: 'finance.commission', defaultMessage: 'Commission' })}</TableCell>
                        <TableCell align="right">{intl.formatMessage({ id: 'finance.netRevenue', defaultMessage: 'Net revenue' })}</TableCell>
                        <TableCell>{intl.formatMessage({ id: 'finance.status', defaultMessage: 'Status' })}</TableCell>
                        <TableCell align="right">{intl.formatMessage({ id: 'adminPayout.action', defaultMessage: 'Action' })}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {requests.content.map((req) => (
                        <TableRow key={req.id} hover>
                          <TableCell>
                            <Typography fontWeight={700}>{req.requestCode}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatDateTime(req.createdAt, intl.locale)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography>{req.eventTitle}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {req.bankName} - {req.accountNumber}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">{formatCurrency(req.grossRevenue, intl.locale)}</TableCell>
                          <TableCell align="right">{formatCurrency(req.commissionFee, intl.locale)}</TableCell>
                          <TableCell align="right">
                            <Typography fontWeight={700}>
                              {formatCurrency(req.approvedNetAmount ?? req.netRevenue, intl.locale)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip label={req.status} color={statusColor[req.status]} size="small" />
                          </TableCell>
                          <TableCell align="right">
                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                              <Button size="small" variant="outlined" startIcon={<Eye size={16} />} onClick={() => openDialog(req, 'approve')}>
                                {intl.formatMessage({ id: 'common.view', defaultMessage: 'View' })}
                              </Button>
                              {req.status === 'PENDING' && (
                                <>
                                  <Button size="small" color="success" startIcon={<TickCircle size={16} />} onClick={() => openDialog(req, 'approve')}>
                                    {intl.formatMessage({ id: 'adminPayout.approve', defaultMessage: 'Approve' })}
                                  </Button>
                                  <Button size="small" color="error" startIcon={<CloseCircle size={16} />} onClick={() => openDialog(req, 'reject')}>
                                    {intl.formatMessage({ id: 'adminPayout.reject', defaultMessage: 'Reject' })}
                                  </Button>
                                </>
                              )}
                              {req.status === 'APPROVED' && (
                                <Button size="small" color="primary" startIcon={<MoneySend size={16} />} onClick={() => openDialog(req, 'paid')}>
                                  {intl.formatMessage({ id: 'adminPayout.markPaid', defaultMessage: 'Mark paid' })}
                                </Button>
                              )}
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination
                  component="div"
                  count={requests.totalElements}
                  page={page}
                  onPageChange={(_, next) => setPage(next)}
                  rowsPerPage={size}
                  onRowsPerPageChange={(e) => {
                    setSize(Number(e.target.value));
                    setPage(0);
                  }}
                  rowsPerPageOptions={[5, 10, 20]}
                />
              </>
            )}
          </CardContent>
        </Card>
      </Container>

      <Dialog open={!!selected} onClose={resetDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{selected?.requestCode}</DialogTitle>
        <DialogContent>
          {selected && (
            <Stack spacing={2} pt={1}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <Typography color="text.secondary" variant="body2">
                    {intl.formatMessage({ id: 'finance.grossRevenue', defaultMessage: 'Gross revenue' })}
                  </Typography>
                  <Typography fontWeight={700}>{formatCurrency(selected.grossRevenue, intl.locale)}</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography color="text.secondary" variant="body2">
                    {intl.formatMessage({ id: 'finance.commission', defaultMessage: 'Commission' })}
                  </Typography>
                  <Typography fontWeight={700}>{formatCurrency(selected.commissionFee, intl.locale)}</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography color="text.secondary" variant="body2">
                    {intl.formatMessage({ id: 'finance.netRevenue', defaultMessage: 'Net revenue' })}
                  </Typography>
                  <Typography fontWeight={700}>{formatCurrency(selected.netRevenue, intl.locale)}</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography color="text.secondary" variant="body2">
                    {intl.formatMessage({ id: 'adminPayout.platformFee', defaultMessage: 'Platform fee' })}
                  </Typography>
                  <Typography fontWeight={700}>{formatCurrency(selected.platformFee, intl.locale)}</Typography>
                </Grid>
              </Grid>

              <Divider />

              <Stack direction="row" spacing={1.5} alignItems="center">
                <Bank size={18} />
                <Typography variant="body2">
                  {selected.bankName} - {selected.accountNumber} - {selected.accountHolder}
                </Typography>
              </Stack>

              {action === 'approve' && (
                <TextField
                  label={intl.formatMessage({ id: 'adminPayout.approvalNote', defaultMessage: 'Approval note (optional)' })}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  multiline
                  rows={2}
                  fullWidth
                />
              )}

              {action === 'reject' && (
                <TextField
                  label={intl.formatMessage({ id: 'adminPayout.rejectionReason', defaultMessage: 'Rejection reason' })}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  multiline
                  rows={2}
                  fullWidth
                  required
                />
              )}

              {action === 'paid' && (
                <Stack spacing={2}>
                  <TextField
                    label={intl.formatMessage({ id: 'adminPayout.transactionRef', defaultMessage: 'Transaction reference' })}
                    value={transactionRef}
                    onChange={(e) => setTransactionRef(e.target.value)}
                    fullWidth
                    required
                  />
                  <TextField
                    label={intl.formatMessage({ id: 'adminPayout.paidAt', defaultMessage: 'Paid at' })}
                    type="datetime-local"
                    value={paidAt}
                    onChange={(e) => setPaidAt(e.target.value)}
                    fullWidth
                    required
                  />
                </Stack>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={resetDialog} color="secondary">
            {intl.formatMessage({ id: 'common.cancel', defaultMessage: 'Cancel' })}
          </Button>
          {action && (
            <Button
              variant="contained"
              color={action === 'reject' ? 'error' : 'primary'}
              onClick={handleSubmit}
              disabled={
                submitting ||
                (action === 'reject' && !note.trim()) ||
                (action === 'paid' && (!transactionRef.trim() || !paidAt))
              }
            >
              {submitting
                ? intl.formatMessage({ id: 'common.processing', defaultMessage: 'Processing...' })
                : action === 'approve'
                ? intl.formatMessage({ id: 'adminPayout.approve', defaultMessage: 'Approve' })
                : action === 'reject'
                ? intl.formatMessage({ id: 'adminPayout.reject', defaultMessage: 'Reject' })
                : intl.formatMessage({ id: 'adminPayout.markPaid', defaultMessage: 'Mark paid' })}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
