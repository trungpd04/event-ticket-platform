import { Link } from 'react-router-dom';

// material-ui
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// third-party
import { useIntl } from 'react-intl';

// project-imports
import AnimateButton from 'components/@extended/AnimateButton';
import useAuth from 'hooks/useAuth';
import AuthWrapper from 'sections/auth/AuthWrapper';

// ================================|| CHECK MAIL ||================================ //

export default function CheckMail() {
  const { isLoggedIn } = useAuth();
  const intl = useIntl();

  return (
    <AuthWrapper>
      <Grid container spacing={3}>
        <Grid size={12}>
          <Box sx={{ mb: { xs: -0.5, sm: 0.5 } }}>
            <Typography variant="h3">{intl.formatMessage({ id: 'auth.checkMail.title' })}</Typography>
            <Typography color="secondary" sx={{ mb: 0.5, mt: 1.25 }}>
              {intl.formatMessage({ id: 'auth.checkMail.subtitle' })}
            </Typography>
          </Box>
        </Grid>
        <Grid size={12}>
          <AnimateButton>
            <Button
              component={Link}
              to={isLoggedIn ? '/auth/login' : '/login'}
              disableElevation
              fullWidth
              size="large"
              type="submit"
              variant="contained"
              color="primary"
            >
              {intl.formatMessage({ id: 'auth.checkMail.button' })}
            </Button>
          </AnimateButton>
        </Grid>
      </Grid>
    </AuthWrapper>
  );
}
