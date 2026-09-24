import { createTheme } from '@mui/material/styles';

// ==============================|| EVENT THEME ||============================== //
// Public site theme tokens extracted from the Figma Event designs.

export const eventTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#6C5DD3',
      light: '#867BF3',
      dark: '#5549B8',
      contrastText: '#FFFFFF'
    },
    secondary: {
      main: '#FF6B6B',
      light: '#FF8E8E',
      dark: '#E35555',
      contrastText: '#FFFFFF'
    },
    background: {
      default: '#F8F8FA',
      paper: '#FFFFFF'
    },
    text: {
      primary: '#11142D',
      secondary: '#808191'
    },
    divider: '#E4E4E4'
  },
  typography: {
    fontFamily: `"Inter", "Public Sans", sans-serif`,
    h1: {
      fontWeight: 700,
      fontSize: '3rem',
      lineHeight: 1.2,
      letterSpacing: '-0.02em'
    },
    h2: {
      fontWeight: 700,
      fontSize: '2.25rem',
      lineHeight: 1.3,
      letterSpacing: '-0.01em'
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.4
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem'
    },
    button: {
      textTransform: 'none',
      fontWeight: 600
    }
  },
  shape: {
    borderRadius: 12
  }
});

export default eventTheme;
