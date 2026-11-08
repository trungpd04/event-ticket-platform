import { useState, MouseEvent } from 'react';
import { Link as RouterLink } from 'react-router-dom';

// material-ui
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';

// third-party
import { useIntl } from 'react-intl';

// project-imports
import Avatar from 'components/@extended/Avatar';
import useAuth from 'hooks/useAuth';

// assets
import { CalendarTick, Logout, Profile, Ticket2 } from 'iconsax-reactjs';
import avatar1 from 'assets/images/users/avatar-6.png';

// ==============================|| USER AVATAR MENU ||============================== //

export default function UserAvatarMenu() {
  const intl = useIntl();
  const { logout, user, hasRole } = useAuth();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleOpen = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    logout();
  };

  const menuItems = [
    {
      id: 'header.profile',
      defaultMessage: 'Profile',
      to: '/profile',
      icon: <Profile size={18} variant="Bulk" />,
      show: true
    },
    {
      id: 'header.myEvents',
      defaultMessage: 'My events',
      to: '/organizer/events',
      icon: <CalendarTick size={18} variant="Bulk" />,
      show: hasRole('ORGANIZER')
    },
    {
      id: 'header.myOrders',
      defaultMessage: 'My orders',
      to: '/my-orders',
      icon: <Ticket2 size={18} variant="Bulk" />,
      show: true
    }
  ];

  return (
    <>
      <IconButton
        onClick={handleOpen}
        aria-controls={open ? 'user-avatar-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        sx={{
          p: 0,
          borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.16)',
          '&:hover': { bgcolor: 'rgba(255,255,255,0.12)' }
        }}
      >
        <Avatar alt={user?.name || 'User'} src={avatar1} sx={{ width: 38, height: 38 }} />
      </IconButton>

      <Menu
        id="user-avatar-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        slotProps={{
          paper: {
            sx: {
              mt: 1.5,
              minWidth: 220,
              borderRadius: 2,
              boxShadow: (theme) => theme.shadows[8]
            }
          }
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        disableScrollLock
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography fontWeight={700} noWrap>
            {user?.name || intl.formatMessage({ id: 'header.user', defaultMessage: 'User' })}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {user?.email || ''}
          </Typography>
        </Box>
        <Divider />
        {menuItems
          .filter((item) => item.show)
          .map((item) => (
            <MenuItem
              key={item.to}
              component={RouterLink}
              to={item.to}
              onClick={handleClose}
              sx={{ py: 1, gap: 1.5 }}
            >
              <ListItemIcon sx={{ minWidth: 24, color: 'primary.main' }}>{item.icon}</ListItemIcon>
              <ListItemText primary={intl.formatMessage({ id: item.id, defaultMessage: item.defaultMessage })} />
            </MenuItem>
          ))}
        <Divider />
        <MenuItem onClick={handleLogout} sx={{ py: 1, gap: 1.5, color: 'error.main' }}>
          <ListItemIcon sx={{ minWidth: 24, color: 'error.main' }}>
            <Logout size={18} variant="Bulk" />
          </ListItemIcon>
          <ListItemText primary={intl.formatMessage({ id: 'header.logout', defaultMessage: 'Logout' })} />
        </MenuItem>
      </Menu>
    </>
  );
}
