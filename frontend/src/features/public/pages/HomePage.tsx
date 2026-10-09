// material-ui
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// third-party
import { useIntl } from 'react-intl';

// project-imports
import SearchWidget from 'components/event/SearchWidget';
import CategorySection from '../components/home/CategorySection';
import FAQSection from '../components/home/FAQSection';
import FeaturedEventsSection from '../components/home/FeaturedEventsSection';
import FeaturesSection from '../components/home/FeaturesSection';
import ReviewsSection from '../components/home/ReviewsSection';

// ==============================|| HOME PAGE ||============================== //

export default function HomePage() {
  const intl = useIntl();

  return (
    <Box>
      <Box
        sx={{
          position: 'relative',
          py: 10,
          background: (theme) =>
            `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.primary.lighter || theme.palette.primary.light} 100%)`,
          overflow: 'hidden'
        }}
      >
        <Container maxWidth="xl">
          <Stack spacing={4} alignItems="center" textAlign="center">
            <Typography variant="h1" color="text.primary">
              {intl.formatMessage({ id: 'home.hero.title', defaultMessage: 'Discover amazing events' })}
            </Typography>
            <Typography variant="h6" color="text.secondary" maxWidth={600}>
              {intl.formatMessage({ id: 'home.hero.subtitle', defaultMessage: 'Buy tickets easily, experience unforgettable moments.' })}
            </Typography>
            <Box sx={{ width: '100%', maxWidth: 900 }}>
              <SearchWidget />
            </Box>
          </Stack>
        </Container>
      </Box>

      <CategorySection />
      <FeaturedEventsSection />
      <FeaturesSection />
      <ReviewsSection />
      <FAQSection />
    </Box>
  );
}
