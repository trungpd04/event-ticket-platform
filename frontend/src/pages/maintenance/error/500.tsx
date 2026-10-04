import { Link } from 'react-router-dom';

// material-ui
import useMediaQuery from '@mui/material/useMediaQuery';
import Button from '@mui/material/Button';
import CardMedia from '@mui/material/CardMedia';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// third-party
import { useIntl } from 'react-intl';

// project-imports
import { APP_DEFAULT_PATH } from 'config';

// assets
import error500 from 'assets/images/maintenance/img-error-500.svg';

// ==============================|| ERROR 500 ||============================== //

export default function Error500() {
  const intl = useIntl();
  const downSM = useMediaQuery((theme) => theme.breakpoints.down('sm'));

  return (
    <Grid container direction="column" spacing={3} sx={{ alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <Grid size={12}>
        <Stack sx={{ alignItems: 'center', justifyContent: 'center' }}>
          <Box sx={{ width: 325 }}>
            <CardMedia component="img" src={error500} alt="error 500" sx={{ height: 1 }} />
          </Box>
        </Stack>
      </Grid>
      <Grid size={12}>
        <Stack sx={{ justifyContent: 'center', alignItems: 'center' }}>
          <Typography align="center" variant={downSM ? 'h2' : 'h1'}>
            {intl.formatMessage({ id: 'error500.title' })}
          </Typography>
          <Typography variant="body2" align="center" sx={{ color: 'text.secondary', width: { xs: '73%', sm: '70%' }, mt: 1 }}>
            {intl.formatMessage({ id: 'error500.message' })}
          </Typography>
          <Button component={Link} to={APP_DEFAULT_PATH} variant="contained" sx={{ textTransform: 'none', mt: 4 }}>
            {intl.formatMessage({ id: 'error500.button' })}
          </Button>
        </Stack>
      </Grid>
    </Grid>
  );
}
