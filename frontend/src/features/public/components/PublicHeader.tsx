import { Link as RouterLink } from 'react-router-dom';

// material-ui
import AppBar from '@mui/material/AppBar';
import Container from '@mui/material/Container';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

// project-imports
import EventButton from 'components/event/EventButton';
import useAuth from 'hooks/useAuth';
import useConfig from 'hooks/useConfig';
import { useIntl } from 'react-intl';

// types
import { I18n } from 'types/config';

// ==============================|| PUBLIC HEADER ||============================== //

const LANGUAGES: { value: I18n; label: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'vi', label: 'Tiếng Việt' },
  { value: 'fr', label: 'Français' },
  { value: 'ro', label: 'Română' },
  { value: 'zh', label: '中文' }
];

export default function PublicHeader() {
  const { isLoggedIn, logout } = useAuth();
  const { i18n, onChangeLocalization } = useConfig();
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
            <FormControl size="small" sx={{ minWidth: { xs: 80, sm: 120 } }}>
              <Select
                value={i18n}
                onChange={(e) => onChangeLocalization(e.target.value as I18n)}
                variant="outlined"
                inputProps={{ 'aria-label': 'Language' }}
                sx={{
                  '& .MuiSelect-select': {
                    py: 0.75,
                    px: 1.5,
                    fontSize: '0.875rem',
                    fontWeight: 600
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'divider'
                  }
                }}
              >
                {LANGUAGES.map((lang) => (
                  <MenuItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {isLoggedIn ? (
              <>
                <EventButton component={RouterLink} to="/organizer/events/create" variant="contained" color="primary">
                  {intl.formatMessage({ id: 'header.addEvent', defaultMessage: 'Add Event' })}
                </EventButton>
                <EventButton variant="outlined" color="primary" onClick={logout}>
                  {intl.formatMessage({ id: 'header.logout', defaultMessage: 'Logout' })}
                </EventButton>
              </>
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
