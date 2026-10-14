// material-ui
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import EventButton from 'components/event/EventButton';
import { ArrowRight2, PlayCircle } from 'iconsax-reactjs';
import { Link as RouterLink } from 'react-router-dom';

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
          py: { xs: 10, md: 16 },
          background: (theme) =>
            `radial-gradient(circle at 70% 10%, ${theme.palette.primary.dark} 0%, transparent 32%), linear-gradient(135deg, #201328 0%, ${theme.palette.background.default} 70%)`,
          overflow: 'hidden'
        }}
      >
        <Container maxWidth="xl">
          <Stack spacing={3} alignItems={{ xs: 'center', md: 'flex-start' }} textAlign={{ xs: 'center', md: 'left' }} maxWidth={760}>
            <Chip label="THE BEST EXPERIENCES, ALL IN ONE PLACE" sx={{ bgcolor: 'rgba(193,79,230,0.16)', color: 'primary.light', fontWeight: 700 }} />
            <Typography variant="h1" color="text.primary" sx={{ fontSize: { xs: '3rem', md: '5.5rem' }, lineHeight: 0.98, letterSpacing: '-0.07em', fontWeight: 800 }}>
              {intl.formatMessage({ id: 'home.hero.title', defaultMessage: 'Discover amazing events' })}
            </Typography>
            <Typography variant="h6" color="text.secondary" maxWidth={600} sx={{ lineHeight: 1.6 }}>
              {intl.formatMessage({ id: 'home.hero.subtitle', defaultMessage: 'Buy tickets easily, experience unforgettable moments.' })}
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <EventButton component={RouterLink} to="/events" variant="contained" endIcon={<ArrowRight2 size={18} />}>Explore events</EventButton>
              <EventButton component={RouterLink} to="/events" variant="outlined" color="inherit" startIcon={<PlayCircle size={18} />}>How it works</EventButton>
            </Stack>
          </Stack>
          <Box sx={{ mt: { xs: 7, md: 10 }, maxWidth: 1100 }}><SearchWidget /></Box>
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
