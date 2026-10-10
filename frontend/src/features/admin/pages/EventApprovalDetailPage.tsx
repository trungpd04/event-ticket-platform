import { useEffect, useState } from 'react';

// material-ui
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// third-party
import { useIntl } from 'react-intl';
import { useNavigate, useParams } from 'react-router-dom';

// project-imports
import { openSnackbar } from 'api/snackbar';
import AdminCard from 'features/admin/components/AdminCard';
import { getEventDetail, getFeePolicies, updateEventFeePolicy, updateEventStatus } from 'features/admin/api/admin';

// types
import { AdminEventDetail, EventStatus, FeePolicy } from 'features/admin/types/admin';

// ==============================|| EVENT APPROVAL DETAIL PAGE ||============================== //

export default function EventApprovalDetailPage() {
  const intl = useIntl();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [event, setEvent] = useState<AdminEventDetail | null>(null);
  const [feePolicies, setFeePolicies] = useState<FeePolicy[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<EventStatus>('PENDING');
  const [selectedFeePolicyId, setSelectedFeePolicyId] = useState<number | ''>('');
  const [savingStatus, setSavingStatus] = useState(false);
  const [savingFeePolicy, setSavingFeePolicy] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [eventData, policies] = await Promise.all([getEventDetail(Number(id)), getFeePolicies()]);
        setEvent(eventData);
        setSelectedStatus(eventData.status);
        setSelectedFeePolicyId(eventData.feePolicyId || '');
        setFeePolicies(policies);
      } catch {
        openSnackbar({
          open: true,
          message: intl.formatMessage({ id: 'admin.events.loadError' }),
          variant: 'alert',
          alert: { color: 'error' }
        } as any);
      }
    };
    load();
  }, [id, intl]);

  const handleSaveStatus = async () => {
    setSavingStatus(true);
    try {
      await updateEventStatus(Number(id), { status: selectedStatus });
      openSnackbar({
        open: true,
        message: intl.formatMessage({ id: 'admin.events.statusUpdated' }),
        variant: 'alert',
        alert: { color: 'success' }
      } as any);
    } catch {
      openSnackbar({
        open: true,
        message: intl.formatMessage({ id: 'admin.events.statusUpdateError' }),
        variant: 'alert',
        alert: { color: 'error' }
      } as any);
    } finally {
      setSavingStatus(false);
    }
  };

  const handleSaveFeePolicy = async () => {
    if (!selectedFeePolicyId) return;
    setSavingFeePolicy(true);
    try {
      await updateEventFeePolicy(Number(id), { feePolicyId: Number(selectedFeePolicyId) });
      openSnackbar({
        open: true,
        message: intl.formatMessage({ id: 'admin.events.feePolicyUpdated' }),
        variant: 'alert',
        alert: { color: 'success' }
      } as any);
    } catch {
      openSnackbar({
        open: true,
        message: intl.formatMessage({ id: 'admin.events.feePolicyUpdateError' }),
        variant: 'alert',
        alert: { color: 'error' }
      } as any);
    } finally {
      setSavingFeePolicy(false);
    }
  };

  if (!event) {
    return (
      <Typography color="secondary.800" textAlign="center" py={4}>
        {intl.formatMessage({ id: 'admin.common.loading' })}
      </Typography>
    );
  }

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={2} mb={3}>
        <Button variant="outlined" color="secondary" onClick={() => navigate('/admin/events/approval')}>
          {intl.formatMessage({ id: 'admin.common.back' })}
        </Button>
        <Typography variant="h3">{event.title}</Typography>
      </Stack>

      <Stack spacing={3}>
        <AdminCard>
          <Typography variant="h5" mb={2}>
            {intl.formatMessage({ id: 'admin.events.detail' })}
          </Typography>
          <Stack spacing={1} color="secondary.800">
            <Typography>
              <strong>{intl.formatMessage({ id: 'admin.events.location' })}:</strong> {event.location}
            </Typography>
            <Typography>
              <strong>{intl.formatMessage({ id: 'admin.events.startTime' })}:</strong>{' '}
              {new Date(event.startTime).toLocaleString(intl.locale)}
            </Typography>
            <Typography>
              <strong>{intl.formatMessage({ id: 'admin.events.endTime' })}:</strong> {new Date(event.endTime).toLocaleString(intl.locale)}
            </Typography>
            <Typography>
              <strong>{intl.formatMessage({ id: 'admin.events.category' })}:</strong> {event.category?.name || '-'}
            </Typography>
          </Stack>
        </AdminCard>

        <AdminCard>
          <Typography variant="h5" mb={2}>
            {intl.formatMessage({ id: 'admin.events.updateStatus' })}
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="flex-start">
            <FormControl fullWidth>
              <InputLabel id="status-label">{intl.formatMessage({ id: 'admin.events.status' })}</InputLabel>
              <Select
                labelId="status-label"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as EventStatus)}
                input={<OutlinedInput label={intl.formatMessage({ id: 'admin.events.status' })} />}
              >
                <MenuItem value="PENDING">{intl.formatMessage({ id: 'admin.status.pending' })}</MenuItem>
                <MenuItem value="PUBLISHED">{intl.formatMessage({ id: 'admin.status.published' })}</MenuItem>
                <MenuItem value="CLOSED">{intl.formatMessage({ id: 'admin.status.closed' })}</MenuItem>
              </Select>
            </FormControl>
            <Button variant="contained" onClick={handleSaveStatus} disabled={savingStatus}>
              {intl.formatMessage({ id: 'admin.events.save' })}
            </Button>
          </Stack>
        </AdminCard>

        <AdminCard>
          <Typography variant="h5" mb={2}>
            {intl.formatMessage({ id: 'admin.events.assignFeePolicy' })}
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="flex-start">
            <FormControl fullWidth>
              <InputLabel id="fee-policy-label">{intl.formatMessage({ id: 'admin.feePolicies.title' })}</InputLabel>
              <Select
                labelId="fee-policy-label"
                value={selectedFeePolicyId}
                onChange={(e) => setSelectedFeePolicyId(e.target.value as number)}
                input={<OutlinedInput label={intl.formatMessage({ id: 'admin.feePolicies.title' })} />}
              >
                {feePolicies.map((policy) => (
                  <MenuItem key={policy.id} value={policy.id}>
                    {policy.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button variant="contained" onClick={handleSaveFeePolicy} disabled={savingFeePolicy || !selectedFeePolicyId}>
              {intl.formatMessage({ id: 'admin.events.save' })}
            </Button>
          </Stack>
        </AdminCard>
      </Stack>
    </Box>
  );
}
