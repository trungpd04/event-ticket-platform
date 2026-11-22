import { useEffect, useState } from 'react';

// material-ui
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

// third-party
import { useIntl } from 'react-intl';
import { useNavigate, useParams } from 'react-router-dom';

// project-imports
import { openSnackbar } from 'api/snackbar';
import AdminCard from 'features/admin/components/AdminCard';
import EventUpdateRequestStatusBadge from 'features/admin/components/event-update-requests/EventUpdateRequestStatusBadge';
import {
  approveEventUpdateRequest,
  getEventUpdateRequestDetail,
  rejectEventUpdateRequest
} from 'features/admin/api/admin';

// types
import { EventUpdateRequest } from 'features/admin/types/admin';
import { formatDateTime } from 'utils/format';

// ==============================|| EVENT UPDATE REQUEST DETAIL PAGE ||============================== //

export default function EventUpdateRequestApprovalDetailPage() {
  const intl = useIntl();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const requestId = Number(id);

  const [request, setRequest] = useState<EventUpdateRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const data = await getEventUpdateRequestDetail(requestId);
      setRequest(data);
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

  useEffect(() => {
    load();
  }, [requestId, intl]);

  const handleApprove = async () => {
    setProcessing(true);
    try {
      await approveEventUpdateRequest(requestId);
      openSnackbar({
        open: true,
        message: intl.formatMessage({ id: 'admin.eventUpdateRequest.approveSuccess' }),
        variant: 'alert',
        alert: { color: 'success' }
      } as any);
      load();
    } catch {
      openSnackbar({
        open: true,
        message: intl.formatMessage({ id: 'admin.eventUpdateRequest.approveError' }),
        variant: 'alert',
        alert: { color: 'error' }
      } as any);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) return;
    setProcessing(true);
    try {
      await rejectEventUpdateRequest(requestId, rejectReason.trim());
      setRejectDialogOpen(false);
      setRejectReason('');
      openSnackbar({
        open: true,
        message: intl.formatMessage({ id: 'admin.eventUpdateRequest.rejectSuccess' }),
        variant: 'alert',
        alert: { color: 'success' }
      } as any);
      load();
    } catch {
      openSnackbar({
        open: true,
        message: intl.formatMessage({ id: 'admin.eventUpdateRequest.rejectError' }),
        variant: 'alert',
        alert: { color: 'error' }
      } as any);
    } finally {
      setProcessing(false);
    }
  };

  if (loading || !request) {
    return (
      <Typography color="secondary.800" textAlign="center" py={4}>
        {intl.formatMessage({ id: 'admin.common.loading' })}
      </Typography>
    );
  }

  const isPending = request.status === 'PENDING_REVIEW';
  const payload = request.payload;

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h3">{intl.formatMessage({ id: 'admin.eventUpdateRequest.detailTitle' })}</Typography>
        <Button variant="outlined" color="secondary" onClick={() => navigate('/admin/event-update-requests')}>
          {intl.formatMessage({ id: 'admin.common.back' })}
        </Button>
      </Stack>

      <AdminCard sx={{ mb: 3 }}>
        <Stack spacing={2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" fontWeight={700}>
              {request.eventTitle || intl.formatMessage({ id: 'admin.eventUpdateRequest.noTitle' })}
            </Typography>
            <EventUpdateRequestStatusBadge status={request.status} />
          </Box>
          <Typography variant="body2" color="secondary.800">
            {intl.formatMessage({ id: 'admin.eventUpdateRequest.eventId' })}: #{request.eventId}
          </Typography>
          <Typography variant="body2" color="secondary.800">
            {intl.formatMessage({ id: 'admin.eventUpdateRequest.organizer' })}: {request.organizerEmail || '-'}
          </Typography>
          <Typography variant="body2" color="secondary.800">
            {intl.formatMessage({ id: 'admin.eventUpdateRequest.createdAt' })}: {formatDateTime(request.createdAt, intl.locale)}
          </Typography>
          {request.rejectionReason && (
            <Alert severity="error">{request.rejectionReason}</Alert>
          )}
        </Stack>
      </AdminCard>

      <AdminCard sx={{ mb: 3 }}>
        <Typography variant="h6" fontWeight={700} mb={2}>
          {intl.formatMessage({ id: 'admin.eventUpdateRequest.payload' })}
        </Typography>
        <Grid container spacing={2}>
          {payload.description !== undefined && (
            <Grid size={12}>
              <Typography variant="subtitle2" color="text.secondary">
                {intl.formatMessage({ id: 'createEvent.description' })}
              </Typography>
              <Typography whiteSpace="pre-wrap">{payload.description}</Typography>
            </Grid>
          )}
          {payload.categoryId !== undefined && (
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2" color="text.secondary">
                {intl.formatMessage({ id: 'createEvent.category' })}
              </Typography>
              <Typography>{payload.categoryId}</Typography>
            </Grid>
          )}
          {payload.thumbnailFileId !== undefined && (
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2" color="text.secondary">
                {intl.formatMessage({ id: 'createEvent.thumbnailImage' })}
              </Typography>
              <Typography>{payload.thumbnailFileId}</Typography>
            </Grid>
          )}
          {payload.bannerFileId !== undefined && (
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2" color="text.secondary">
                {intl.formatMessage({ id: 'createEvent.bannerImage' })}
              </Typography>
              <Typography>{payload.bannerFileId}</Typography>
            </Grid>
          )}
          {payload.settings && (
            <>
              <Grid size={12}>
                <Typography variant="subtitle1" fontWeight={700}>
                  {intl.formatMessage({ id: 'createEvent.steps.settings' })}
                </Typography>
              </Grid>
              {payload.settings.refundPolicy !== undefined && (
                <Grid size={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {intl.formatMessage({ id: 'createEvent.refundPolicy' })}
                  </Typography>
                  <Typography whiteSpace="pre-wrap">{payload.settings.refundPolicy}</Typography>
                </Grid>
              )}
              {payload.settings.ageRestriction !== undefined && (
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {intl.formatMessage({ id: 'createEvent.ageRestriction' })}
                  </Typography>
                  <Typography>{payload.settings.ageRestriction}</Typography>
                </Grid>
              )}
              {payload.settings.tags !== undefined && (
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {intl.formatMessage({ id: 'createEvent.tags' })}
                  </Typography>
                  <Typography>{payload.settings.tags.join(', ')}</Typography>
                </Grid>
              )}
              {payload.settings.isPublic !== undefined && (
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {intl.formatMessage({ id: 'createEvent.publicEvent' })}
                  </Typography>
                  <Typography>{payload.settings.isPublic ? 'Yes' : 'No'}</Typography>
                </Grid>
              )}
            </>
          )}
          {payload.payoutInfo && (
            <>
              <Grid size={12}>
                <Typography variant="subtitle1" fontWeight={700}>
                  {intl.formatMessage({ id: 'createEvent.steps.payout' })}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  {intl.formatMessage({ id: 'createEvent.bankName' })}
                </Typography>
                <Typography>{payload.payoutInfo.bankName}</Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  {intl.formatMessage({ id: 'createEvent.accountNumber' })}
                </Typography>
                <Typography>{payload.payoutInfo.accountNumber}</Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  {intl.formatMessage({ id: 'createEvent.accountHolder' })}
                </Typography>
                <Typography>{payload.payoutInfo.accountHolder}</Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  {intl.formatMessage({ id: 'createEvent.branch' })}
                </Typography>
                <Typography>{payload.payoutInfo.branch}</Typography>
              </Grid>
            </>
          )}
        </Grid>
      </AdminCard>

      {isPending && (
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button variant="outlined" color="error" disabled={processing} onClick={() => setRejectDialogOpen(true)}>
            {intl.formatMessage({ id: 'admin.eventUpdateRequest.reject' })}
          </Button>
          <Button variant="contained" color="primary" disabled={processing} onClick={handleApprove}>
            {intl.formatMessage({ id: 'admin.eventUpdateRequest.approve' })}
          </Button>
        </Stack>
      )}

      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{intl.formatMessage({ id: 'admin.eventUpdateRequest.rejectTitle' })}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            multiline
            rows={3}
            margin="dense"
            label={intl.formatMessage({ id: 'admin.eventUpdateRequest.rejectReason' })}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)} color="secondary">
            {intl.formatMessage({ id: 'admin.common.cancel' })}
          </Button>
          <Button onClick={handleReject} color="error" disabled={!rejectReason.trim() || processing}>
            {intl.formatMessage({ id: 'admin.eventUpdateRequest.reject' })}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
