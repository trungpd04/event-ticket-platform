import { useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { useIntl } from 'react-intl';
import { CreateCheckerPayload } from 'features/admin/types/admin';

interface CheckerFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateCheckerPayload) => void;
}

const initialForm: CreateCheckerPayload = { email: '', password: '', fullName: '', phone: '' };

export default function CheckerForm({ open, onClose, onSubmit }: CheckerFormProps) {
  const intl = useIntl();
  const [form, setForm] = useState<CreateCheckerPayload>(initialForm);

  const update = (field: keyof CreateCheckerPayload, value: string) => setForm((previous) => ({ ...previous, [field]: value }));
  const handleClose = () => {
    setForm(initialForm);
    onClose();
  };
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit(form);
    setForm(initialForm);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: 'secondary.100' } }}>
      <DialogTitle>{intl.formatMessage({ id: 'admin.checkers.add' })}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField label={intl.formatMessage({ id: 'admin.checkers.fullName' })} value={form.fullName} onChange={(e) => update('fullName', e.target.value)} required fullWidth />
            <TextField type="email" label={intl.formatMessage({ id: 'admin.checkers.email' })} value={form.email} onChange={(e) => update('email', e.target.value)} required fullWidth />
            <TextField type="password" label={intl.formatMessage({ id: 'admin.checkers.password' })} value={form.password} onChange={(e) => update('password', e.target.value)} inputProps={{ minLength: 8 }} required fullWidth />
            <TextField label={intl.formatMessage({ id: 'admin.checkers.phone' })} value={form.phone} onChange={(e) => update('phone', e.target.value)} fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">{intl.formatMessage({ id: 'admin.common.cancel' })}</Button>
          <Button type="submit" variant="contained">{intl.formatMessage({ id: 'admin.common.save' })}</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
