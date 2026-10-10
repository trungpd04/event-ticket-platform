import { useEffect, useState } from 'react';

// material-ui
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';

// third-party
import { useIntl } from 'react-intl';

// types
import { FeePolicy } from 'features/admin/types/admin';

// ==============================|| FEE POLICY FORM ||============================== //

interface FeePolicyFormProps {
  open: boolean;
  feePolicy: FeePolicy | null;
  onClose: () => void;
  onSubmit: (payload: Omit<FeePolicy, 'id'>) => void;
}

export default function FeePolicyForm({ open, feePolicy, onClose, onSubmit }: FeePolicyFormProps) {
  const intl = useIntl();
  const [form, setForm] = useState({
    name: feePolicy?.name || '',
    organizerCommissionRate: feePolicy?.organizerCommissionRate ?? 0,
    customerFeeRate: feePolicy?.customerFeeRate ?? 0,
    customerFlatFee: feePolicy?.customerFlatFee ?? 0,
    isActive: feePolicy?.isActive ?? true,
    isDefault: feePolicy?.isDefault ?? false
  });

  useEffect(() => {
    setForm({
      name: feePolicy?.name || '',
      organizerCommissionRate: feePolicy?.organizerCommissionRate ?? 0,
      customerFeeRate: feePolicy?.customerFeeRate ?? 0,
      customerFlatFee: feePolicy?.customerFlatFee ?? 0,
      isActive: feePolicy?.isActive ?? true,
      isDefault: feePolicy?.isDefault ?? false
    });
  }, [feePolicy, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: 'secondary.100' } }}>
      <DialogTitle>
        {feePolicy ? intl.formatMessage({ id: 'admin.feePolicies.edit' }) : intl.formatMessage({ id: 'admin.feePolicies.add' })}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Stack spacing={2}>
            <TextField
              label={intl.formatMessage({ id: 'admin.feePolicies.name' })}
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              required
              fullWidth
            />
            <TextField
              label={intl.formatMessage({ id: 'admin.feePolicies.commissionRate' })}
              type="number"
              inputProps={{ step: 0.01, min: 0, max: 1 }}
              value={form.organizerCommissionRate}
              onChange={(e) => setForm((prev) => ({ ...prev, organizerCommissionRate: Number(e.target.value) }))}
              required
              fullWidth
            />
            <TextField
              label={intl.formatMessage({ id: 'admin.feePolicies.customerFeeRate' })}
              type="number"
              inputProps={{ step: 0.01, min: 0, max: 1 }}
              value={form.customerFeeRate}
              onChange={(e) => setForm((prev) => ({ ...prev, customerFeeRate: Number(e.target.value) }))}
              required
              fullWidth
            />
            <TextField
              label={intl.formatMessage({ id: 'admin.feePolicies.customerFlatFee' })}
              type="number"
              inputProps={{ min: 0 }}
              value={form.customerFlatFee}
              onChange={(e) => setForm((prev) => ({ ...prev, customerFlatFee: Number(e.target.value) }))}
              required
              fullWidth
            />
            <FormControlLabel
              control={<Switch checked={form.isActive} onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))} />}
              label={intl.formatMessage({ id: 'admin.feePolicies.isActive' })}
            />
            <FormControlLabel
              control={<Switch checked={form.isDefault} onChange={(e) => setForm((prev) => ({ ...prev, isDefault: e.target.checked }))} />}
              label={intl.formatMessage({ id: 'admin.feePolicies.isDefault' })}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="secondary">
            {intl.formatMessage({ id: 'admin.common.cancel' })}
          </Button>
          <Button type="submit" variant="contained">
            {intl.formatMessage({ id: 'admin.common.save' })}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
