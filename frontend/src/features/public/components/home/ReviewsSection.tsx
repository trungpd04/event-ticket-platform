// material-ui
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

// third-party
import { useIntl } from 'react-intl';

// project-imports
import { Star1 } from 'iconsax-reactjs';

// ==============================|| REVIEWS SECTION ||============================== //

const REVIEWS = [
  { nameKey: 'home.reviews.1.name', textKey: 'home.reviews.1.text' },
  { nameKey: 'home.reviews.2.name', textKey: 'home.reviews.2.text' },
  { nameKey: 'home.reviews.3.name', textKey: 'home.reviews.3.text' }
];

export default function ReviewsSection() {
  const intl = useIntl();

  return (
    <Box sx={{ py: 6 }}>
      <Container maxWidth="xl">
        <Typography variant="h4" textAlign="center" mb={4}>
          {intl.formatMessage({ id: 'home.reviews.title', defaultMessage: 'What our users say' })}
        </Typography>
        <Grid container spacing={3}>
          {REVIEWS.map((review, index) => (
            <Grid size={{ xs: 12, md: 4 }} key={index}>
              <Box
                sx={{
                  p: 3,
                  borderRadius: 2,
                  bgcolor: 'background.paper',
                  boxShadow: 1,
                  height: '100%'
                }}
              >
                <Box sx={{ mb: 2, display: 'flex', gap: 0.5 }}>
                  {[...Array(5)].map((_, i) => (
                    <Star1 key={i} variant="Bold" size={20} color="#FFC107" />
                  ))}
                </Box>
                <Typography variant="body1" mb={2}>
                  {intl.formatMessage({ id: review.textKey })}
                </Typography>
                <Typography variant="subtitle2" color="text.secondary">
                  {intl.formatMessage({ id: review.nameKey })}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
