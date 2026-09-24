import { Box, Container, Stack, Typography } from '@mui/material';
import { useIntl } from 'react-intl';

// project-imports
import SearchWidget from 'components/event/SearchWidget';

// ==============================|| HOME PAGE ||============================== //

export default function HomePage() {
  const intl = useIntl();

  return (
    <Box sx={{ py: 8 }}>
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
  );
}
