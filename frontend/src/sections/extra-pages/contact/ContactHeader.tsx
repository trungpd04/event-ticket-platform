// third-party
import { useIntl } from 'react-intl';

// material-ui
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// assets
import AuthBackground from 'assets/images/auth/AuthBackground';

// ==============================|| CONTACT US - HEADER ||============================== //

export default function ContactHeader() {
  const intl = useIntl();

  return (
    <Box sx={{ position: 'relative', overflow: 'hidden', pt: 9, pb: 2 }}>
      <AuthBackground />
      <Container maxWidth="lg" sx={{ px: { xs: 0, sm: 2 } }}>
        <Box sx={{ width: { xs: '100%', sm: 360, lg: 436 }, px: 2, py: 6, mx: 'auto' }}>
          <Stack sx={{ gap: 1 }}>
            <Typography align="center" variant="h2">
              {intl.formatMessage({ id: 'contact.title' })}
            </Typography>
            <Typography align="center" sx={{ color: 'text.secondary' }}>
              {intl.formatMessage({ id: 'contact.subtitle' })}
            </Typography>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
