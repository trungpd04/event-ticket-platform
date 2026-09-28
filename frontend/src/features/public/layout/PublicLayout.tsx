import { Outlet } from 'react-router-dom';

// material-ui
import Box from '@mui/material/Box';

// project-imports
import PublicHeader from '../components/PublicHeader';
import PublicFooter from '../components/PublicFooter';

// ==============================|| PUBLIC LAYOUT ||============================== //

export default function PublicLayout() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
      <PublicHeader />
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Outlet />
      </Box>
      <PublicFooter />
    </Box>
  );
}
