import { Box, Container, Typography } from '@mui/material';
import { useIntl } from 'react-intl';

// ==============================|| PUBLIC FOOTER ||============================== //

export default function PublicFooter() {
  const intl = useIntl();

  return (
    <Box component="footer" sx={{ bgcolor: 'background.paper', py: 4, mt: 'auto', borderTop: 1, borderColor: 'divider' }}>
      <Container maxWidth="xl">
        <Typography variant="body2" color="text.secondary" align="center">
          {intl.formatMessage({ id: 'footer.copyright', defaultMessage: '© 2026 Event Ticket Platform. All rights reserved.' })}
        </Typography>
      </Container>
    </Box>
  );
}
