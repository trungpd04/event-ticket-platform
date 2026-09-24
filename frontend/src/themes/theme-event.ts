import { createTheme } from '@mui/material/styles';

// ==============================|| EVENT THEME ||============================== //
// Public site theme tokens extracted from the Figma Event style guide.

export const eventTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#C14FE6',
      light: '#D580F2',
      dark: '#A62FCA',
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
      primary: '#242424',
      secondary: '#808191'
    },
    divider: '#E4E4E4',
    error: { main: '#F44336' },
    success: { main: '#4CAF50' },
    warning: { main: '#FF9800' },
    info: { main: '#2196F3' }
  },
  typography: {
    fontFamily: `"Inter", sans-serif`,
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
    borderRadius: 16
  }
});

export default eventTheme;
