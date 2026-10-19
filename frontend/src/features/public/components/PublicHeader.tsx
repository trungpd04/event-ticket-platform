import { Link as RouterLink } from 'react-router-dom';

// material-ui
import AppBar from '@mui/material/AppBar';
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
    <AppBar position="absolute" color="transparent" elevation={0} sx={{ top: 0, left: 0, bgcolor: 'transparent', zIndex: 10 }}>
      <Toolbar
        disableGutters
        sx={{
          width: '100%',
          minHeight: { xs: 68, md: 77 },
          px: { xs: 2.5, md: 13.5 },
          display: 'grid',
          gridTemplateColumns: { xs: '1fr auto', md: '1fr auto 1fr' },
          alignItems: 'center'
        }}
      >
        <Typography
          component={RouterLink}
          to="/"
          variant="h4"
          sx={{
            fontFamily: "'Lobster', cursive",
            fontSize: { xs: '2rem', md: '2.25rem' },
            fontWeight: 400,
            letterSpacing: 0,
            color: '#c14fe6',
            textDecoration: 'none',
            justifySelf: 'start'
          }}
        >
          Evenjo
        </Typography>

        <Stack direction="row" spacing={5} sx={{ display: { xs: 'none', md: 'flex' }, justifySelf: 'center' }}>
          <Typography
            component={RouterLink}
            to="/"
            color="common.white"
            sx={{ textDecoration: 'none', fontSize: 18, fontWeight: 400, '&:hover': { color: '#c14fe6' } }}
          >
            {intl.formatMessage({ id: 'header.home', defaultMessage: 'Home' })}
          </Typography>
          <Typography
            component={RouterLink}
            to="/events"
            color="common.white"
            sx={{ textDecoration: 'none', fontSize: 18, fontWeight: 400, '&:hover': { color: '#c14fe6' } }}
          >
            {intl.formatMessage({ id: 'header.events', defaultMessage: 'Events' })}
          </Typography>
          <Typography
            component={RouterLink}
            to="/events?categoryId=1"
            color="common.white"
            sx={{ textDecoration: 'none', fontSize: 18, fontWeight: 400, '&:hover': { color: '#c14fe6' } }}
          >
            {intl.formatMessage({ id: 'header.sports', defaultMessage: 'Sports' })}
          </Typography>
          <Typography
            component={RouterLink}
            to="/events?categoryId=2"
            color="common.white"
            sx={{ textDecoration: 'none', fontSize: 18, fontWeight: 400, '&:hover': { color: '#c14fe6' } }}
          >
            {intl.formatMessage({ id: 'header.music', defaultMessage: 'Music' })}
          </Typography>
          <Typography
            component={RouterLink}
            to="/events?categoryId=3"
            color="common.white"
            sx={{ textDecoration: 'none', fontSize: 18, fontWeight: 400, '&:hover': { color: '#c14fe6' } }}
          >
            {intl.formatMessage({ id: 'header.theater', defaultMessage: 'Theater' })}
          </Typography>
          <Typography
            component={RouterLink}
            to="/events?categoryId=5"
            color="common.white"
            sx={{ textDecoration: 'none', fontSize: 18, fontWeight: 400, '&:hover': { color: '#c14fe6' } }}
          >
            {intl.formatMessage({ id: 'header.exhibitions', defaultMessage: 'Exhibitions' })}
          </Typography>
        </Stack>

        <Stack direction="row" spacing={2} alignItems="center" sx={{ justifySelf: 'end' }}>
          <FormControl size="small" sx={{ minWidth: 89 }}>
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
              MenuProps={{ disableScrollLock: true }}
              sx={{
                color: 'common.white',
                borderRadius: 0,
                bgcolor: 'transparent',
                '& .MuiSelect-select': {
                  py: 0.5,
                  px: 0,
                  fontSize: 18,
                  fontWeight: 500
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  border: 0
                },
                '& .MuiSvgIcon-root': { color: 'common.white' }
              }}
            >
              {LANGUAGES.map((lang) => (
                <MenuItem key={lang.value} value={lang.value}>
                  <Box component="span" sx={{ mr: 1, fontSize: '1.1rem' }}>
                    {lang.flag}
                  </Box>
                  {intl.formatMessage({ id: lang.labelId, defaultMessage: lang.defaultMessage })}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {isLoggedIn ? (
            <>
              <EventButton
                component={RouterLink}
                to="/organizer/events/create"
                variant="contained"
                color="primary"
                startIcon={<Ticket2 size={18} />}
                sx={{ height: 40, px: 2, borderRadius: 1, fontSize: 16 }}
              >
                {intl.formatMessage({ id: 'header.addEvent', defaultMessage: 'Add Event' })}
              </EventButton>
              <EventButton variant="outlined" color="primary" onClick={logout} sx={{ height: 40, px: 2, borderRadius: 1, fontSize: 16 }}>
                {intl.formatMessage({ id: 'header.logout', defaultMessage: 'Logout' })}
              </EventButton>
            </>
          ) : (
            <>
              <EventButton
                component={RouterLink}
                to="/login"
                variant="text"
                color="inherit"
                sx={{ display: { xs: 'none', sm: 'inline-flex' }, color: 'common.white', fontSize: 16, fontWeight: 400 }}
              >
                {intl.formatMessage({ id: 'header.login', defaultMessage: 'Login' })}
              </EventButton>
              <EventButton
                component={RouterLink}
                to="/register"
                variant="contained"
                color="primary"
                sx={{ height: 40, px: 2, borderRadius: 1, fontSize: 16 }}
              >
                {intl.formatMessage({ id: 'header.register', defaultMessage: 'Register' })}
              </EventButton>
            </>
          )}
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
