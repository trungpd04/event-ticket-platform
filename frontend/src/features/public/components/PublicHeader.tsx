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
import Box from '@mui/material/Box';
import { ArrowDown2, Ticket2 } from 'iconsax-reactjs';

// project-imports
import EventButton from 'components/event/EventButton';
import useAuth from 'hooks/useAuth';
import useConfig from 'hooks/useConfig';
import { useIntl } from 'react-intl';

// types
import { I18n } from 'types/config';

// ==============================|| PUBLIC HEADER ||============================== //

const LANGUAGES: { value: I18n; flag: string; labelId: string; defaultMessage: string }[] = [
  { value: 'en', flag: '🇺🇸', labelId: 'language.english', defaultMessage: 'English' },
  { value: 'vi', flag: '🇻🇳', labelId: 'language.vietnamese', defaultMessage: 'Tiếng Việt' }
];

export default function PublicHeader() {
  const { isLoggedIn, logout } = useAuth();
  const { i18n, onChangeLocalization } = useConfig();
  const intl = useIntl();

  return (
    <AppBar
      position="sticky"
      color="transparent"
      elevation={0}
      sx={{ bgcolor: 'background.default', borderBottom: 1, borderColor: 'rgba(255,255,255,0.08)', zIndex: 10 }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ minHeight: { xs: 68, md: 78 }, justifyContent: 'space-between' }}>
          <Stack direction="row" spacing={{ xs: 2, md: 6 }} alignItems="center">
            <Typography
              component={RouterLink}
              to="/"
              variant="h4"
              sx={{
                fontFamily: "'Lobster', cursive",
                fontSize: { xs: '2rem', md: '2.25rem' },
                fontWeight: 400,
                letterSpacing: 0,
                color: 'primary.main',
                textDecoration: 'none'
              }}
            >
              Evenjo
            </Typography>

            <Stack direction="row" spacing={3.5} sx={{ display: { xs: 'none', md: 'flex' } }}>
              <Typography
                component={RouterLink}
                to="/"
                color="text.primary"
                sx={{ textDecoration: 'none', fontWeight: 600, '&:hover': { color: 'primary.main' } }}
              >
                {intl.formatMessage({ id: 'header.home', defaultMessage: 'Home' })}
              </Typography>
              <Typography
                component={RouterLink}
                to="/events"
                color="text.secondary"
                sx={{ textDecoration: 'none', fontWeight: 600, '&:hover': { color: 'primary.main' } }}
              >
                {intl.formatMessage({ id: 'header.events', defaultMessage: 'Events' })}
              </Typography>
              <Typography component={RouterLink} to="/events?category=concerts" color="text.secondary" sx={{ textDecoration: 'none', fontWeight: 600 }}>
                {intl.formatMessage({ id: 'header.concerts', defaultMessage: 'Concerts' })}
              </Typography>
            </Stack>
          </Stack>

          <Stack direction="row" spacing={1.5} alignItems="center">
            <FormControl size="small" sx={{ minWidth: { xs: 80, sm: 120 } }}>
              <Select
                value={i18n}
                onChange={(e) => onChangeLocalization(e.target.value as I18n)}
                renderValue={(value) => {
                  const language = LANGUAGES.find((item) => item.value === value);
                  return language ? `${language.flag} ${language.value === 'en' ? 'Eng' : 'Vie'}` : value;
                }}
                variant="outlined"
                inputProps={{ 'aria-label': 'Language' }}
                IconComponent={ArrowDown2}
                sx={{
                  color: 'text.secondary',
                  borderRadius: 2,
                  bgcolor: 'background.paper',
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
                    <Box component="span" sx={{ mr: 1, fontSize: '1.1rem' }}>{lang.flag}</Box>
                    {intl.formatMessage({ id: lang.labelId, defaultMessage: lang.defaultMessage })}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {isLoggedIn ? (
              <>
                <EventButton component={RouterLink} to="/organizer/events/create" variant="contained" color="primary" startIcon={<Ticket2 size={18} />}>
                  {intl.formatMessage({ id: 'header.addEvent', defaultMessage: 'Add Event' })}
                </EventButton>
                <EventButton variant="outlined" color="primary" onClick={logout}>
                  {intl.formatMessage({ id: 'header.logout', defaultMessage: 'Logout' })}
                </EventButton>
              </>
            ) : (
              <>
                <EventButton component={RouterLink} to="/login" variant="text" color="inherit" sx={{ display: { xs: 'none', sm: 'inline-flex' } }}>
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
