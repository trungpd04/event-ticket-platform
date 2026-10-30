import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';

// material-ui
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { ArrowDown2, CloseCircle, Menu, Ticket2 } from 'iconsax-reactjs';

// project-imports
import EventButton from 'components/event/EventButton';
import useAuth from 'hooks/useAuth';
import useI18n from 'hooks/useI18n';
import { useIntl } from 'react-intl';

// types
import { I18n } from 'types/config';

// ==============================|| PUBLIC HEADER ||============================== //

const LANGUAGES: { value: I18n; flag: string; labelId: string; defaultMessage: string }[] = [
  { value: 'en', flag: '🇺🇸', labelId: 'language.english', defaultMessage: 'English' },
  { value: 'vi', flag: '🇻🇳', labelId: 'language.vietnamese', defaultMessage: 'Tiếng Việt' }
];

const NAV_ITEMS = [
  { to: '/', id: 'header.home', defaultMessage: 'Home' },
  { to: '/events', id: 'header.events', defaultMessage: 'Events' },
  { to: '/events?categoryId=1', id: 'header.sports', defaultMessage: 'Sports' },
  { to: '/events?categoryId=2', id: 'header.music', defaultMessage: 'Music' },
  { to: '/events?categoryId=3', id: 'header.theater', defaultMessage: 'Theater' },
  { to: '/events?categoryId=5', id: 'header.exhibitions', defaultMessage: 'Exhibitions' }
];

const DRAWER_WIDTH = 300;

export default function PublicHeader() {
  const theme = useTheme();
  const { isLoggedIn, logout } = useAuth();
  const { i18n, onChangeLocalization } = useI18n();
  const intl = useIntl();

  const [drawerOpen, setDrawerOpen] = useState(false);

  const openDrawer = () => setDrawerOpen(true);
  const closeDrawer = () => setDrawerOpen(false);

  const languageSelect = (fullWidth = false) => (
    <FormControl size="small" sx={{ minWidth: fullWidth ? '100%' : 89 }}>
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
          color: fullWidth ? 'text.primary' : 'common.white',
          borderRadius: 1,
          bgcolor: fullWidth ? 'action.hover' : 'transparent',
          '& .MuiSelect-select': {
            py: 0.75,
            px: fullWidth ? 1.5 : 0,
            fontSize: 18,
            fontWeight: 500
          },
          '& .MuiOutlinedInput-notchedOutline': {
            border: fullWidth ? `1px solid ${theme.palette.divider}` : 0
          },
          '& .MuiSvgIcon-root': { color: fullWidth ? 'text.primary' : 'common.white' }
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
  );

  return (
    <>
      <AppBar
        position="absolute"
        color="transparent"
        elevation={0}
        sx={{ top: 0, left: 0, bgcolor: 'transparent', zIndex: 10 }}
      >
        <Toolbar
          disableGutters
          sx={{
            width: '100%',
            minHeight: { xs: 60, sm: 68, md: 77 },
            px: { xs: 2, sm: 3, md: 13.5 },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2
          }}
        >
          <Typography
            component={RouterLink}
            to="/"
            variant="h4"
            sx={{
              fontFamily: "'Lobster', cursive",
              fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' },
              fontWeight: 400,
              letterSpacing: 0,
              color: '#c14fe6',
              textDecoration: 'none',
              flexShrink: 0
            }}
          >
            Evenjo
          </Typography>

          <Stack direction="row" spacing={{ sm: 3, md: 5 }} sx={{ display: { xs: 'none', md: 'flex' }, flex: 1, justifyContent: 'center' }}>
            {NAV_ITEMS.map((item) => (
              <Typography
                key={item.to}
                component={RouterLink}
                to={item.to}
                color="common.white"
                sx={{ textDecoration: 'none', fontSize: 18, fontWeight: 400, whiteSpace: 'nowrap', '&:hover': { color: '#c14fe6' } }}
              >
                {intl.formatMessage({ id: item.id, defaultMessage: item.defaultMessage })}
              </Typography>
            ))}
          </Stack>

          <Stack direction="row" spacing={2} alignItems="center" sx={{ ml: 'auto', flexShrink: 0 }}>
            <Box sx={{ display: { xs: 'none', md: 'block' } }}>{languageSelect()}</Box>
            {isLoggedIn ? (
              <Stack direction="row" spacing={2} sx={{ display: { xs: 'none', md: 'flex' } }}>
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
                <EventButton
                  variant="outlined"
                  color="primary"
                  onClick={logout}
                  sx={{ height: 40, px: 2, borderRadius: 1, fontSize: 16 }}
                >
                  {intl.formatMessage({ id: 'header.logout', defaultMessage: 'Logout' })}
                </EventButton>
              </Stack>
            ) : (
              <Stack direction="row" spacing={2} sx={{ display: { xs: 'none', md: 'flex' } }}>
                <EventButton
                  component={RouterLink}
                  to="/login"
                  variant="text"
                  color="inherit"
                  sx={{ color: 'common.white', fontSize: 16, fontWeight: 400 }}
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
              </Stack>
            )}

            <IconButton
              onClick={openDrawer}
              aria-label={intl.formatMessage({ id: 'header.openMenu', defaultMessage: 'Open menu' })}
              sx={{
                display: { md: 'none' },
                color: 'common.white',
                p: 1,
                borderRadius: 1.5,
                bgcolor: 'rgba(255,255,255,0.08)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.16)' }
              }}
            >
              <Menu size={24} variant="Outline" />
            </IconButton>
          </Stack>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={closeDrawer}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { md: 'none' },
          '& .MuiDrawer-paper': {
            width: { xs: '85vw', sm: DRAWER_WIDTH },
            maxWidth: DRAWER_WIDTH,
            bgcolor: 'background.paper',
            backgroundImage: 'none',
            borderRight: 0
          }
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2.5, py: 1.5 }}>
          <Typography
            component={RouterLink}
            to="/"
            onClick={closeDrawer}
            variant="h4"
            sx={{
              fontFamily: "'Lobster', cursive",
              fontSize: '2rem',
              fontWeight: 400,
              letterSpacing: 0,
              color: '#c14fe6',
              textDecoration: 'none'
            }}
          >
            Evenjo
          </Typography>
          <IconButton
            onClick={closeDrawer}
            aria-label={intl.formatMessage({ id: 'header.closeMenu', defaultMessage: 'Close menu' })}
            sx={{ color: 'text.secondary' }}
          >
            <CloseCircle size={24} />
          </IconButton>
        </Stack>

        <Divider />

        <List sx={{ px: 1.5, py: 2 }}>
          {NAV_ITEMS.map((item) => (
            <ListItemButton
              key={item.to}
              component={RouterLink}
              to={item.to}
              onClick={closeDrawer}
              sx={{
                borderRadius: 1.5,
                py: 1.25,
                '&:hover': { bgcolor: 'primary.lighter', color: 'primary.main' }
              }}
            >
              <ListItemText
                primary={intl.formatMessage({ id: item.id, defaultMessage: item.defaultMessage })}
                primaryTypographyProps={{ fontSize: 17, fontWeight: 500 }}
              />
            </ListItemButton>
          ))}
        </List>

        <Divider />

        <Stack spacing={2} sx={{ p: 2.5 }}>
          {languageSelect(true)}
          {isLoggedIn ? (
            <>
              <EventButton
                component={RouterLink}
                to="/organizer/events/create"
                onClick={closeDrawer}
                variant="contained"
                color="primary"
                startIcon={<Ticket2 size={18} />}
                fullWidth
                sx={{ height: 44, borderRadius: 1, fontSize: 16 }}
              >
                {intl.formatMessage({ id: 'header.addEvent', defaultMessage: 'Add Event' })}
              </EventButton>
              <EventButton
                variant="outlined"
                color="primary"
                onClick={() => {
                  closeDrawer();
                  logout();
                }}
                fullWidth
                sx={{ height: 44, borderRadius: 1, fontSize: 16 }}
              >
                {intl.formatMessage({ id: 'header.logout', defaultMessage: 'Logout' })}
              </EventButton>
            </>
          ) : (
            <>
              <EventButton
                component={RouterLink}
                to="/login"
                onClick={closeDrawer}
                variant="outlined"
                color="primary"
                fullWidth
                sx={{ height: 44, borderRadius: 1, fontSize: 16 }}
              >
                {intl.formatMessage({ id: 'header.login', defaultMessage: 'Login' })}
              </EventButton>
              <EventButton
                component={RouterLink}
                to="/register"
                onClick={closeDrawer}
                variant="contained"
                color="primary"
                fullWidth
                sx={{ height: 44, borderRadius: 1, fontSize: 16 }}
              >
                {intl.formatMessage({ id: 'header.register', defaultMessage: 'Register' })}
              </EventButton>
            </>
          )}
        </Stack>
      </Drawer>
    </>
  );
}
