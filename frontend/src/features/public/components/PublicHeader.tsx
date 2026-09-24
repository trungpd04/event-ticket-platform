import { Link as RouterLink } from 'react-router-dom';

// material-ui
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

// project-imports
import EventButton from 'components/event/EventButton';
import useAuth from 'hooks/useAuth';
import { useIntl } from 'react-intl';

// ==============================|| PUBLIC HEADER ||============================== //

export default function PublicHeader() {
  const { isLoggedIn, logout } = useAuth();
  const intl = useIntl();

  return (
    <AppBar position="sticky" color="transparent" elevation={0} sx={{ bgcolor: 'background.paper' }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
          <Stack direction="row" spacing={4} alignItems="center">
            <Typography
              component={RouterLink}
              to="/"
              variant="h5"
              sx={{
                fontWeight: 700,
                color: 'text.primary',
                textDecoration: 'none'
              }}
            >
              {intl.formatMessage({ id: 'app.name', defaultMessage: 'Event Ticket Platform' })}
            </Typography>

            <Stack direction="row" spacing={3} sx={{ display: { xs: 'none', md: 'flex' } }}>
              <Typography component={RouterLink} to="/" color="text.secondary" sx={{ textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>
                {intl.formatMessage({ id: 'header.home', defaultMessage: 'Home' })}
              </Typography>
              <Typography component={RouterLink} to="/events" color="text.secondary" sx={{ textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>
                {intl.formatMessage({ id: 'header.events', defaultMessage: 'Events' })}
              </Typography>
            </Stack>
          </Stack>

          <Stack direction="row" spacing={1.5} alignItems="center">
            {isLoggedIn ? (
              <EventButton variant="outlined" color="primary" onClick={logout}>
                {intl.formatMessage({ id: 'header.logout', defaultMessage: 'Logout' })}
              </EventButton>
            ) : (
              <>
                <EventButton component={RouterLink} to="/login" variant="text" color="primary">
                  {intl.formatMessage({ id: 'header.login', defaultMessage: 'Login' })}
                </EventButton>
                <EventButton component={RouterLink} to="/register" variant="contained" color="primary">
                  {intl.formatMessage({ id: 'header.register', defaultMessage: 'Register' })}
                </EventButton>
              </>
            )}
          </Stack>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
