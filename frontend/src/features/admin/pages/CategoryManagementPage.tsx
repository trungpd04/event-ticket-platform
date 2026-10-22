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
import CategoryForm from 'features/admin/components/categories/CategoryForm';
import CategoryTable from 'features/admin/components/categories/CategoryTable';
import { createCategory, getCategoriesAdmin, updateCategory } from 'features/admin/api/admin';

// types
import { Category } from 'features/admin/types/admin';

// ==============================|| CATEGORY MANAGEMENT PAGE ||============================== //

export default function CategoryManagementPage() {
  const intl = useIntl();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCategoriesAdmin();
      setCategories(data);
    } catch {
      openSnackbar({
        open: true,
        message: intl.formatMessage({ id: 'admin.categories.loadError' }),
        variant: 'alert',
        alert: { color: 'error' }
      } as any);
    } finally {
      setLoading(false);
    }
  }, [intl]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleSubmit = async (payload: Omit<Category, 'id'>) => {
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, payload);
      } else {
        await createCategory(payload);
      }
      setFormOpen(false);
      setEditingCategory(null);
      await loadCategories();
      openSnackbar({
        open: true,
        message: intl.formatMessage({ id: 'admin.categories.saveSuccess' }),
        variant: 'alert',
        alert: { color: 'success' }
      } as any);
    } catch {
      openSnackbar({
        open: true,
        message: intl.formatMessage({ id: 'admin.categories.saveError' }),
        variant: 'alert',
        alert: { color: 'error' }
      } as any);
    }
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h3">{intl.formatMessage({ id: 'admin.categories.title' })}</Typography>
        <Button
          variant="contained"
          onClick={() => {
            setEditingCategory(null);
            setFormOpen(true);
          }}
        >
          {intl.formatMessage({ id: 'admin.categories.add' })}
        </Button>
      </Stack>

      <AdminCard>
        {loading ? (
          <Typography color="secondary.800" textAlign="center" py={4}>
            {intl.formatMessage({ id: 'admin.common.loading' })}
          </Typography>
        ) : (
          <CategoryTable
            categories={categories}
            onEdit={(category) => {
              setEditingCategory(category);
              setFormOpen(true);
            }}
          />
        )}
      </AdminCard>

      <CategoryForm
        open={formOpen}
        category={editingCategory}
        onClose={() => {
          setFormOpen(false);
          setEditingCategory(null);
        }}
        onSubmit={handleSubmit}
      />
    </Box>
  );
}
