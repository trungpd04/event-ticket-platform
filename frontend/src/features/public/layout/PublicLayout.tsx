import { Outlet } from 'react-router-dom';

// material-ui
import Box from '@mui/material/Box';
import { ThemeProvider } from '@mui/material/styles';

// project-imports
import eventTheme from 'themes/theme-event';
import PublicHeader from './PublicHeader';
import PublicFooter from './PublicFooter';

// ==============================|| PUBLIC LAYOUT ||============================== //

export default function PublicLayout() {
  return (
    <ThemeProvider theme={eventTheme}>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
        <PublicHeader />
        <Box component="main" sx={{ flexGrow: 1 }}>
          <Outlet />
        </Box>
        <PublicFooter />
      </Box>
    </ThemeProvider>
  );
}
