import { useCallback, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useIntl } from 'react-intl';
import { openSnackbar } from 'api/snackbar';
import AdminCard from 'features/admin/components/AdminCard';
import CheckerForm from 'features/admin/components/checkers/CheckerForm';
import CheckerTable from 'features/admin/components/checkers/CheckerTable';
import { createChecker, getCheckers, updateCheckerStatus } from 'features/admin/api/admin';
import { Checker, CreateCheckerPayload } from 'features/admin/types/admin';

export default function CheckerManagementPage() {
  const intl = useIntl();
  const [checkers, setCheckers] = useState<Checker[]>([]);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);

  const loadCheckers = useCallback(async () => {
    setLoading(true);
    try {
      setCheckers(await getCheckers());
    } catch {
      openSnackbar({ open: true, message: intl.formatMessage({ id: 'admin.checkers.loadError' }), variant: 'alert', alert: { color: 'error' } } as any);
    } finally {
      setLoading(false);
    }
  }, [intl]);

  useEffect(() => { loadCheckers(); }, [loadCheckers]);

  const handleCreate = async (payload: CreateCheckerPayload) => {
    try {
      await createChecker(payload);
      setFormOpen(false);
      await loadCheckers();
      openSnackbar({ open: true, message: intl.formatMessage({ id: 'admin.checkers.createSuccess' }), variant: 'alert', alert: { color: 'success' } } as any);
    } catch {
      openSnackbar({ open: true, message: intl.formatMessage({ id: 'admin.checkers.createError' }), variant: 'alert', alert: { color: 'error' } } as any);
    }
  };

  const handleToggleStatus = async (checker: Checker) => {
    try {
      await updateCheckerStatus(checker.id, checker.status === 'ACTIVE' ? 'BANNED' : 'ACTIVE');
      await loadCheckers();
      openSnackbar({ open: true, message: intl.formatMessage({ id: 'admin.checkers.statusSuccess' }), variant: 'alert', alert: { color: 'success' } } as any);
    } catch {
      openSnackbar({ open: true, message: intl.formatMessage({ id: 'admin.checkers.statusError' }), variant: 'alert', alert: { color: 'error' } } as any);
    }
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h3">{intl.formatMessage({ id: 'admin.checkers.title' })}</Typography>
        <Button variant="contained" onClick={() => setFormOpen(true)}>{intl.formatMessage({ id: 'admin.checkers.add' })}</Button>
      </Stack>
      <AdminCard>
        {loading ? <Typography textAlign="center" py={4}>{intl.formatMessage({ id: 'admin.common.loading' })}</Typography> : <CheckerTable checkers={checkers} onToggleStatus={handleToggleStatus} />}
      </AdminCard>
      <CheckerForm open={formOpen} onClose={() => setFormOpen(false)} onSubmit={handleCreate} />
    </Box>
  );
}
