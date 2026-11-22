import { useEffect, useState } from 'react';

// material-ui
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
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
  getCategoriesAdmin,
  getEventUpdateRequestDetail,
  rejectEventUpdateRequest
} from 'features/admin/api/admin';

// types
import { Category, EventUpdateRequest } from 'features/admin/types/admin';
import { formatDateTime } from 'utils/format';

// assets
import { Calendar, Profile, Tag, User } from 'iconsax-reactjs';

// ==============================|| EVENT UPDATE REQUEST DETAIL PAGE ||============================== //

export default function EventUpdateRequestApprovalDetailPage() {
  const intl = useIntl();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const requestId = Number(id);

  const [request, setRequest] = useState<EventUpdateRequest | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [data, cats] = await Promise.all([getEventUpdateRequestDetail(requestId), getCategoriesAdmin()]);
      setRequest(data);
      setCategories(cats);
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

  const categoryName =
    request.categoryName || categories.find((c) => c.id === payload.categoryId)?.name || String(payload.categoryId ?? '-');

  const InfoItem = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <Box>
      <Typography variant="caption" color="text.secondary" fontWeight={600}>
        {label}
      </Typography>
      <Box sx={{ mt: 0.5 }}>{children}</Box>
    </Box>
  );

  const SectionTitle = ({ title }: { title: string }) => (
    <Typography variant="h6" fontWeight={700} mb={2}>
      {title}
    </Typography>
  );

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h3">{intl.formatMessage({ id: 'admin.eventUpdateRequest.detailTitle' })}</Typography>
        <Button variant="outlined" color="secondary" onClick={() => navigate('/admin/event-update-requests')}>
          {intl.formatMessage({ id: 'admin.common.back' })}
        </Button>
      </Stack>

      {/* Overview */}
      <AdminCard sx={{ mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid size={{ xs: 12, md: 8 }}>
            <Stack spacing={1}>
              <Typography variant="h4" fontWeight={700}>
                {request.eventTitle || intl.formatMessage({ id: 'admin.eventUpdateRequest.noTitle' })}
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} color="secondary.800">
                <Stack direction="row" spacing={1} alignItems="center">
                  <User size={18} />
                  <Typography variant="body2">{request.organizerEmail || '-'}</Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Calendar size={18} />
                  <Typography variant="body2">{formatDateTime(request.createdAt, intl.locale)}</Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Tag size={18} />
                  <Typography variant="body2">Event #{request.eventId}</Typography>
                </Stack>
              </Stack>
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }} sx={{ textAlign: { md: 'right' } }}>
            <EventUpdateRequestStatusBadge status={request.status} />
          </Grid>
        </Grid>
        {request.rejectionReason && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {request.rejectionReason}
          </Alert>
        )}
      </AdminCard>

      <Grid container spacing={3}>
        {/* Basic info */}
        {(payload.description !== undefined || payload.categoryId !== undefined) && (
          <Grid size={{ xs: 12, lg: 6 }}>
            <AdminCard sx={{ height: '100%' }}>
              <SectionTitle title={intl.formatMessage({ id: 'admin.eventUpdateRequest.section.basicInfo' })} />
              <Stack spacing={2}>
                {payload.description !== undefined && (
                  <InfoItem label={intl.formatMessage({ id: 'createEvent.description' })}>
                    <Typography whiteSpace="pre-wrap">{payload.description}</Typography>
                  </InfoItem>
                )}
                {payload.categoryId !== undefined && (
                  <InfoItem label={intl.formatMessage({ id: 'createEvent.category' })}>
                    <Typography>{categoryName}</Typography>
                  </InfoItem>
                )}
              </Stack>
            </AdminCard>
          </Grid>
        )}

        {/* Images */}
        {(payload.thumbnailFileId !== undefined || payload.bannerFileId !== undefined) && (
          <Grid size={{ xs: 12, lg: 6 }}>
            <AdminCard sx={{ height: '100%' }}>
              <SectionTitle title={intl.formatMessage({ id: 'admin.eventUpdateRequest.section.images' })} />
              <Stack spacing={2}>
                {payload.thumbnailFileId !== undefined && (
                  <InfoItem label={intl.formatMessage({ id: 'createEvent.thumbnailImage' })}>
                    {request.thumbnailUrl ? (
                      <Box
                        component="img"
                        src={request.thumbnailUrl}
                        alt="thumbnail"
                        sx={{ width: '100%', maxHeight: 160, borderRadius: 2, objectFit: 'cover', mt: 1 }}
                      />
                    ) : (
                      <Chip label={`File ID: ${payload.thumbnailFileId}`} size="small" sx={{ mt: 1 }} />
                    )}
                  </InfoItem>
                )}
                {payload.bannerFileId !== undefined && (
                  <InfoItem label={intl.formatMessage({ id: 'createEvent.bannerImage' })}>
                    {request.bannerUrl ? (
                      <Box
                        component="img"
                        src={request.bannerUrl}
                        alt="banner"
                        sx={{ width: '100%', maxHeight: 160, borderRadius: 2, objectFit: 'cover', mt: 1 }}
                      />
                    ) : (
                      <Chip label={`File ID: ${payload.bannerFileId}`} size="small" sx={{ mt: 1 }} />
                    )}
                  </InfoItem>
                )}
              </Stack>
            </AdminCard>
          </Grid>
        )}

        {/* Settings */}
        {payload.settings && (
          <Grid size={{ xs: 12, lg: 6 }}>
            <AdminCard sx={{ height: '100%' }}>
              <SectionTitle title={intl.formatMessage({ id: 'createEvent.steps.settings' })} />
              <Stack spacing={2}>
                {payload.settings.refundPolicy !== undefined && (
                  <InfoItem label={intl.formatMessage({ id: 'createEvent.refundPolicy' })}>
                    <Typography whiteSpace="pre-wrap">{payload.settings.refundPolicy}</Typography>
                  </InfoItem>
                )}
                {payload.settings.ageRestriction !== undefined && (
                  <InfoItem label={intl.formatMessage({ id: 'createEvent.ageRestriction' })}>
                    <Typography>{payload.settings.ageRestriction}</Typography>
                  </InfoItem>
                )}
                {payload.settings.tags !== undefined && (
                  <InfoItem label={intl.formatMessage({ id: 'createEvent.tags' })}>
                    <Typography>{payload.settings.tags.join(', ')}</Typography>
                  </InfoItem>
                )}
                {payload.settings.isPublic !== undefined && (
                  <InfoItem label={intl.formatMessage({ id: 'createEvent.publicEvent' })}>
                    <Chip
                      label={payload.settings.isPublic ? intl.formatMessage({ id: 'admin.common.yes' }) : intl.formatMessage({ id: 'admin.common.no' })}
                      color={payload.settings.isPublic ? 'success' : 'default'}
                      size="small"
                    />
                  </InfoItem>
                )}
              </Stack>
            </AdminCard>
          </Grid>
        )}

        {/* Payout */}
        {payload.payoutInfo && (
          <Grid size={{ xs: 12, lg: 6 }}>
            <AdminCard sx={{ height: '100%' }}>
              <SectionTitle title={intl.formatMessage({ id: 'createEvent.steps.payout' })} />
              <Stack spacing={2}>
                <InfoItem label={intl.formatMessage({ id: 'createEvent.bankName' })}>
                  <Typography>{payload.payoutInfo.bankName}</Typography>
                </InfoItem>
                <InfoItem label={intl.formatMessage({ id: 'createEvent.accountNumber' })}>
                  <Typography>{payload.payoutInfo.accountNumber}</Typography>
                </InfoItem>
                <InfoItem label={intl.formatMessage({ id: 'createEvent.accountHolder' })}>
                  <Typography>{payload.payoutInfo.accountHolder}</Typography>
                </InfoItem>
                <InfoItem label={intl.formatMessage({ id: 'createEvent.branch' })}>
                  <Typography>{payload.payoutInfo.branch}</Typography>
                </InfoItem>
              </Stack>
            </AdminCard>
          </Grid>
        )}

        {/* Actions */}
        {isPending && (
          <Grid size={12}>
            <AdminCard>
              <SectionTitle title={intl.formatMessage({ id: 'admin.eventUpdateRequest.section.actions' })} />
              <Stack direction="row" spacing={2}>
                <Button variant="contained" color="primary" disabled={processing} onClick={handleApprove} size="large" sx={{ flex: 1 }}>
                  {intl.formatMessage({ id: 'admin.eventUpdateRequest.approve' })}
                </Button>
                <Button variant="outlined" color="error" disabled={processing} onClick={() => setRejectDialogOpen(true)} size="large" sx={{ flex: 1 }}>
                  {intl.formatMessage({ id: 'admin.eventUpdateRequest.reject' })}
                </Button>
              </Stack>
            </AdminCard>
          </Grid>
        )}
      </Grid>

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
