import { useEffect, useState } from 'react';

// material-ui
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

// third-party
import { useIntl } from 'react-intl';

// project-imports
import { getCategories } from 'api/events';
import { Category } from 'types/organizer';

// ==============================|| CATEGORY SECTION ||============================== //

export default function CategorySection() {
  const intl = useIntl();
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  return (
    <Box sx={{ py: 6, bgcolor: 'background.default' }}>
      <Container maxWidth="xl">
        <Typography variant="h4" mb={3}>
          {intl.formatMessage({ id: 'home.categories.title', defaultMessage: 'Browse by category' })}
        </Typography>
        <Grid container spacing={2}>
          {categories.map((category) => (
            <Grid size={{ xs: 6, sm: 4, md: 3, lg: 2 }} key={category.id}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: 'background.paper',
                  boxShadow: 1,
                  textAlign: 'center',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Typography variant="subtitle1" fontWeight={600}>
                  {category.name}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
