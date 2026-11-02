// material-ui
import useMediaQuery from '@mui/material/useMediaQuery';

// project-imports
import NavUser from './NavUser';
import Navigation from './Navigation';
import SimpleBar from 'components/third-party/SimpleBar';

// ==============================|| DRAWER CONTENT ||============================== //

export default function DrawerContent() {
  useMediaQuery((theme) => theme.breakpoints.down('lg'));
  return (
    <>
      <SimpleBar sx={{ '& .simplebar-content': { display: 'flex', flexDirection: 'column' } }}>
        <Navigation />
      </SimpleBar>
      <NavUser />
    </>
  );
}
