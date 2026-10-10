import { useEffect, useState } from 'react';

// material-ui
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// third-party
import { useIntl } from 'react-intl';

// project-imports
import { CalendarTick, Category2, ReceiptItem } from 'iconsax-reactjs';
import AdminCard from 'features/admin/components/AdminCard';
import { getCategoriesAdmin, getFeePolicies, searchAdminEvents } from 'features/admin/api/admin';

// ==============================|| ADMIN DASHBOARD PAGE ||============================== //

export default function AdminDashboardPage() {
  const intl = useIntl();
  const [stats, setStats] = useState({
    pendingEvents: 0,
    totalCategories: 0,
    totalFeePolicies: 0,
    loading: true
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [eventsRes, categories, feePolicies] = await Promise.all([
          searchAdminEvents({ status: 'PENDING', size: 1 }),
          getCategoriesAdmin(),
          getFeePolicies()
        ]);
        setStats({
          pendingEvents: eventsRes.totalElements || 0,
          totalCategories: categories.length,
          totalFeePolicies: feePolicies.length,
          loading: false
        });
      } catch {
        setStats((prev) => ({ ...prev, loading: false }));
      }
    };
    loadStats();
  }, []);

  const cards = [
    {
      key: 'pendingEvents',
      label: intl.formatMessage({ id: 'admin.dashboard.pendingEvents' }),
      value: stats.pendingEvents,
      icon: CalendarTick
    },
    {
      key: 'totalCategories',
      label: intl.formatMessage({ id: 'admin.dashboard.totalCategories' }),
      value: stats.totalCategories,
      icon: Category2
    },
    {
      key: 'totalFeePolicies',
      label: intl.formatMessage({ id: 'admin.dashboard.totalFeePolicies' }),
      value: stats.totalFeePolicies,
      icon: ReceiptItem
    }
  ];

  return (
    <Box>
      <Typography variant="h3" mb={3}>
        {intl.formatMessage({ id: 'admin.dashboard.title' })}
      </Typography>

      <Grid container spacing={3}>
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Grid key={card.key} size={{ xs: 12, md: 4 }}>
              <AdminCard>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      bgcolor: 'rgba(193, 79, 230, 0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'primary.main'
                    }}
                  >
                    <Icon variant="Bulk" size={24} />
                  </Box>
                  <Box>
                    <Typography variant="h4">{stats.loading ? '-' : card.value}</Typography>
                    <Typography variant="body2" color="secondary.800">
                      {card.label}
                    </Typography>
                  </Box>
                </Stack>
              </AdminCard>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
