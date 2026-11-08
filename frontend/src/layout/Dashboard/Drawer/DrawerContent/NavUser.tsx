import { useState, MouseEvent } from 'react';
import { useNavigate } from 'react-router';
import { Link } from 'react-router-dom';

// material-ui
import { styled } from '@mui/material/styles';
import IconButton, { IconButtonProps } from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';

// third-party
import { useIntl } from 'react-intl';

// project-imports
import { useGetMenuMaster } from 'api/menu';
import Avatar from 'components/@extended/Avatar';
import useAuth from 'hooks/useAuth';

// assets
import { ArrowRight2, CalendarTick, Logout, Profile, Ticket2 } from 'iconsax-reactjs';
import avatar1 from 'assets/images/users/avatar-6.png';

interface ExpandMoreProps extends IconButtonProps {
  expand: boolean;
  drawerOpen: boolean;
}

const ExpandMore = styled(IconButton, {
  shouldForwardProp: (prop) => prop !== 'theme' && prop !== 'expand' && prop !== 'drawerOpen'
})<ExpandMoreProps>(({ theme, expand, drawerOpen }) => ({
  transform: !expand ? 'rotate(0deg)' : 'rotate(-90deg)',
  marginLeft: 'auto',
  color: theme.palette.secondary.dark,
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest
  }),
  ...(!drawerOpen && { opacity: 0, width: 50, height: 50 })
}));

// ==============================|| LIST - USER ||============================== //

export default function UserList() {
  const navigate = useNavigate();
  const intl = useIntl();

  const { menuMaster } = useGetMenuMaster();
  const drawerOpen = menuMaster.isDashboardDrawerOpened;

  const { logout, user, hasRole } = useAuth();
  const handleLogout = async () => {
    try {
      await logout();
      navigate(`/login`, {
        state: {
          from: ''
        }
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleCloseAndLogout = () => {
    handleClose();
    handleLogout();
  };

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box sx={{ p: 1.25, px: !drawerOpen ? 1.25 : 3, borderTop: '2px solid ', borderTopColor: 'divider' }}>
      <List disablePadding>
        <ListItem
          disablePadding
          secondaryAction={
            <ExpandMore
              expand={open}
              drawerOpen={drawerOpen}
              id="basic-button"
              aria-controls={open ? 'basic-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={open ? 'true' : undefined}
              onClick={handleClick}
              aria-label="show more"
            >
              <ArrowRight2 style={{ fontSize: '0.625rem' }} />
            </ExpandMore>
          }
          sx={{
            ...(!drawerOpen && { display: 'flex', justifyContent: 'flex-end' }),
            '& .MuiListItemSecondaryAction-root': { right: !drawerOpen ? 16 : -16 }
          }}
        >
          <ListItemAvatar>
            <Avatar alt="Avatar" src={avatar1} sx={{ ...(drawerOpen && { width: 46, height: 46 }) }} />
          </ListItemAvatar>
          <ListItemText primary={user?.name} sx={{ ...(!drawerOpen && { display: 'none' }) }} secondary="UI/UX Designer" />
        </ListItem>
      </List>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        slotProps={{ list: { 'aria-labelledby': 'basic-button' } }}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <MenuItem component={Link} to="/profile" onClick={handleClose}>
          <Profile variant="Bulk" size={18} style={{ marginRight: 12 }} />
          {intl.formatMessage({ id: 'header.profile', defaultMessage: 'Profile' })}
        </MenuItem>
        {hasRole('ORGANIZER') && (
          <MenuItem component={Link} to="/organizer/events" onClick={handleClose}>
            <CalendarTick variant="Bulk" size={18} style={{ marginRight: 12 }} />
            {intl.formatMessage({ id: 'header.myEvents', defaultMessage: 'My events' })}
          </MenuItem>
        )}
        <MenuItem component={Link} to="/my-orders" onClick={handleClose}>
          <Ticket2 variant="Bulk" size={18} style={{ marginRight: 12 }} />
          {intl.formatMessage({ id: 'header.myOrders', defaultMessage: 'My orders' })}
        </MenuItem>
        <MenuItem onClick={handleCloseAndLogout}>
          <Logout variant="Bulk" size={18} style={{ marginRight: 12 }} />
          {intl.formatMessage({ id: 'header.logout', defaultMessage: 'Logout' })}
        </MenuItem>
      </Menu>
    </Box>
  );
}
