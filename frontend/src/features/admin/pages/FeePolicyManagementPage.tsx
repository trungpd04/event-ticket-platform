import { useCallback, useEffect, useState } from 'react';

// material-ui
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// third-party
import { useIntl } from 'react-intl';

// project-imports
import { openSnackbar } from 'api/snackbar';
import AdminCard from 'features/admin/components/AdminCard';
import FeePolicyForm from 'features/admin/components/fee-policies/FeePolicyForm';
import FeePolicyTable from 'features/admin/components/fee-policies/FeePolicyTable';
import { createFeePolicy, getFeePolicies, updateFeePolicy } from 'features/admin/api/admin';

// types
import { FeePolicy } from 'features/admin/types/admin';

// ==============================|| FEE POLICY MANAGEMENT PAGE ||============================== //

export default function FeePolicyManagementPage() {
  const intl = useIntl();
  const [feePolicies, setFeePolicies] = useState<FeePolicy[]>([]);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingFeePolicy, setEditingFeePolicy] = useState<FeePolicy | null>(null);

  const loadFeePolicies = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getFeePolicies();
      setFeePolicies(data);
    } catch {
      openSnackbar({
        open: true,
        message: intl.formatMessage({ id: 'admin.feePolicies.loadError' }),
        variant: 'alert',
        alert: { color: 'error' }
      } as any);
    } finally {
      setLoading(false);
    }
  }, [intl]);

  useEffect(() => {
    loadFeePolicies();
  }, [loadFeePolicies]);

  const handleSubmit = async (payload: Omit<FeePolicy, 'id'>) => {
    try {
      if (editingFeePolicy) {
        await updateFeePolicy(editingFeePolicy.id, payload);
      } else {
        await createFeePolicy(payload);
      }
      setFormOpen(false);
      setEditingFeePolicy(null);
      await loadFeePolicies();
      openSnackbar({
        open: true,
        message: intl.formatMessage({ id: 'admin.feePolicies.saveSuccess' }),
        variant: 'alert',
        alert: { color: 'success' }
      } as any);
    } catch {
      openSnackbar({
        open: true,
        message: intl.formatMessage({ id: 'admin.feePolicies.saveError' }),
        variant: 'alert',
        alert: { color: 'error' }
      } as any);
    }
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h3">{intl.formatMessage({ id: 'admin.feePolicies.title' })}</Typography>
        <Button
          variant="contained"
          onClick={() => {
            setEditingFeePolicy(null);
            setFormOpen(true);
          }}
        >
          {intl.formatMessage({ id: 'admin.feePolicies.add' })}
        </Button>
      </Stack>

      <AdminCard>
        {loading ? (
          <Typography color="secondary.800" textAlign="center" py={4}>
            {intl.formatMessage({ id: 'admin.common.loading' })}
          </Typography>
        ) : (
          <FeePolicyTable
            feePolicies={feePolicies}
            onEdit={(policy) => {
              setEditingFeePolicy(policy);
              setFormOpen(true);
            }}
          />
        )}
      </AdminCard>

      <FeePolicyForm
        open={formOpen}
        feePolicy={editingFeePolicy}
        onClose={() => {
          setFormOpen(false);
          setEditingFeePolicy(null);
        }}
        onSubmit={handleSubmit}
      />
    </Box>
  );
}
