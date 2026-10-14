import { Box, Container, Divider, Grid, Link, Stack, Typography } from '@mui/material';
import { useIntl } from 'react-intl';

// ==============================|| PUBLIC FOOTER ||============================== //

export default function PublicFooter() {
  const intl = useIntl();

  return (
    <Box component="footer" sx={{ bgcolor: '#17131b', py: { xs: 5, md: 8 }, mt: 'auto' }}>
      <Container maxWidth="xl">
        <Grid container spacing={5}>
          <Grid size={{ xs: 12, md: 5 }}>
            <Typography variant="h4" fontWeight={800} letterSpacing="-0.06em">
              <Box component="span" sx={{ color: 'primary.main' }}>even</Box>jo
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 2, maxWidth: 360 }}>
              Find the moments worth remembering. Discover, book and share your next experience.
            </Typography>
          </Grid>
          {['Explore', 'Company'].map((group) => (
            <Grid size={{ xs: 6, md: 2 }} key={group}>
              <Typography fontWeight={700} mb={2}>{group}</Typography>
              <Stack spacing={1.2}>
                <Link href="/events" color="text.secondary" underline="hover">All events</Link>
                <Link href="/events" color="text.secondary" underline="hover">Categories</Link>
                <Link href="/contact-us" color="text.secondary" underline="hover">Contact us</Link>
              </Stack>
            </Grid>
          ))}
        </Grid>
        <Divider sx={{ my: 4, borderColor: 'rgba(255,255,255,0.1)' }} />
        <Typography variant="body2" color="text.secondary">
          {intl.formatMessage({ id: 'footer.copyright', defaultMessage: '© 2026 Event Ticket Platform. All rights reserved.' })}
        </Typography>
      </Container>
    </Box>
  );
}
