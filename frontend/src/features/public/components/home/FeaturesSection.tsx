// material-ui
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

// third-party
import { useIntl } from 'react-intl';

// project-imports
import { TickCircle, Ticket, WalletCheck } from 'iconsax-reactjs';

// ==============================|| FEATURES SECTION ||============================== //

const FEATURES = [
  {
    icon: Ticket,
    titleKey: 'home.features.ticketing.title',
    descKey: 'home.features.ticketing.desc'
  },
  {
    icon: WalletCheck,
    titleKey: 'home.features.payment.title',
    descKey: 'home.features.payment.desc'
  },
  {
    icon: TickCircle,
    titleKey: 'home.features.checkin.title',
    descKey: 'home.features.checkin.desc'
  }
];

export default function FeaturesSection() {
  const intl = useIntl();

  return (
    <Box sx={{ py: 6, bgcolor: 'background.default' }}>
      <Container maxWidth="xl">
        <Typography variant="h4" textAlign="center" mb={4}>
          {intl.formatMessage({ id: 'home.features.title', defaultMessage: 'Why choose us' })}
        </Typography>
        <Grid container spacing={3}>
          {FEATURES.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Grid size={{ xs: 12, md: 4 }} key={index}>
                <Box
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    bgcolor: 'background.paper',
                    boxShadow: 1,
                    textAlign: 'center',
                    height: '100%'
                  }}
                >
                  <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
                    <Icon variant="TwoTone" size={48} color="currentColor" />
                  </Box>
                  <Typography variant="h6" mb={1}>
                    {intl.formatMessage({ id: feature.titleKey })}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {intl.formatMessage({ id: feature.descKey })}
                  </Typography>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Container>
    </Box>
  );
}
