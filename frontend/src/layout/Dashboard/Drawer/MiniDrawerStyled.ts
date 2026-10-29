// material-ui
import { styled, Theme, CSSObject } from '@mui/material/styles';
import Drawer from '@mui/material/Drawer';

// project-imports
import { DRAWER_WIDTH, MINI_DRAWER_WIDTH } from 'config';

const openedMixin = (theme: Theme) =>
  ({
    backgroundColor: theme.palette.secondary.lighter,
    width: DRAWER_WIDTH,
    borderRight: 'none',
    borderRadius: '16px',
    margin: '12px',
    height: 'calc(100vh - 24px)',
    boxShadow: theme.customShadows.z1,
    overflowX: 'hidden',

    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    })
  }) as CSSObject;

const closedMixin = (theme: Theme) =>
  ({
    overflow: 'hidden',
    backgroundColor: theme.palette.secondary.lighter,
    borderRadius: '16px',
    margin: '12px',
    height: 'calc(100vh - 24px)',

    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    }),

    overflowX: 'hidden',
    width: MINI_DRAWER_WIDTH,
    borderRight: 'none',
    boxShadow: theme.customShadows.z1
  }) as CSSObject;

// ==============================|| DRAWER - MINI STYLED ||============================== //

const MiniDrawerStyled = styled(Drawer, { shouldForwardProp: (prop) => prop !== 'open' })(({ theme, open }) => ({
  width: DRAWER_WIDTH,
  flexShrink: 0,
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  ...(open && {
    ...openedMixin(theme),
    '& .MuiDrawer-paper': openedMixin(theme)
  }),
  ...(!open && {
    ...closedMixin(theme),
    '& .MuiDrawer-paper': closedMixin(theme)
  })
}));

export default MiniDrawerStyled;
