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
import { Category } from 'features/admin/types/admin';

// ==============================|| CATEGORY FORM ||============================== //

interface CategoryFormProps {
  open: boolean;
  category: Category | null;
  onClose: () => void;
  onSubmit: (payload: Omit<Category, 'id'>) => void;
}

export default function CategoryForm({ open, category, onClose, onSubmit }: CategoryFormProps) {
  const intl = useIntl();
  const [form, setForm] = useState({
    name: category?.name || '',
    slug: category?.slug || '',
    iconUrl: category?.iconUrl || '',
    isActive: category?.isActive ?? true
  });

  useEffect(() => {
    setForm({
      name: category?.name || '',
      slug: category?.slug || '',
      iconUrl: category?.iconUrl || '',
      isActive: category?.isActive ?? true
    });
  }, [category, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: 'secondary.100' } }}>
      <DialogTitle>
        {category ? intl.formatMessage({ id: 'admin.categories.edit' }) : intl.formatMessage({ id: 'admin.categories.add' })}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Stack spacing={2}>
            <TextField
              label={intl.formatMessage({ id: 'admin.categories.name' })}
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              required
              fullWidth
            />
            <TextField
              label={intl.formatMessage({ id: 'admin.categories.slug' })}
              value={form.slug}
              onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
              fullWidth
            />
            <TextField
              label={intl.formatMessage({ id: 'admin.categories.iconUrl' })}
              value={form.iconUrl}
              onChange={(e) => setForm((prev) => ({ ...prev, iconUrl: e.target.value }))}
              fullWidth
            />
            <FormControlLabel
              control={<Switch checked={form.isActive} onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))} />}
              label={intl.formatMessage({ id: 'admin.categories.isActive' })}
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
