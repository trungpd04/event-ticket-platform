import { ReactElement } from 'react';

// material-ui
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';

interface Props {
  children: ReactElement;
}

// ==============================|| AUTHENTICATION - WRAPPER ||============================== //

export default function AuthWrapper({ children }: Props) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        background: 'radial-gradient(ellipse 80% 50% at 50% 0%, #2B0B33 0%, #0D0D0D 60%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <Container
        maxWidth="sm"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 1
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: 504,
            p: { xs: 3, sm: 5 },
            display: 'flex',
            flexDirection: 'column',
            gap: 5
          }}
        >
          {children}
        </Box>
      </Container>
    </Box>
  );
}
