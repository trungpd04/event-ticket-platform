// project-imports
import { ThemeMode } from 'config';

// types
import { PaletteThemeProps } from 'types/theme';

// ==============================|| PRESET THEME - EVENT (FIGMA) ||============================== //
// Color / neutral / semantic tokens extracted from the Evenjo Figma style guide.

export default function EventTheme(mode: ThemeMode): PaletteThemeProps {
  const contrastText = '#fff';

  // Primary: main #C14FE6 with tints and shades.
  let primaryColors = [
    '#F1E3F6', // lighter
    '#EFD2FC', // 100
    '#E4AFF8', // 200
    '#D580F2', // light
    '#C14FE6', // 400
    '#C14FE6', // main
    '#A62FCA', // dark
    '#721D88', // 700
    '#551666', // darker
    '#390E44'  // 900
  ];

  // Neutral scale 100 (#B3B3B3) -> 1000 (#121212). Will be reversed in dark mode.
  let secondaryColors = ['#FFFFFF', '#B3B3B3', '#999999', '#454545', '#363636', '#303030', '#242424', '#1F1F1F', '#191919', '#121212'];

  let errorColors = ['#FDE8E7', '#F4A5A0', '#F44336', '#D32F2F', '#B71C1C'];
  let warningColors = ['#FFF3E0', '#FFCC80', '#FF9800', '#F57C00', '#E65100'];
  let infoColors = ['#E3F2FD', '#90CAF9', '#2196F3', '#1565C0', '#0D47A1'];
  let successColors = ['#E8F5E9', '#A5D6A7', '#4CAF50', '#388E3C', '#1B5E20'];

  if (mode === ThemeMode.DARK) {
    primaryColors = [...primaryColors].reverse();
    secondaryColors = [...secondaryColors].reverse();
    errorColors = [...errorColors].reverse();
    warningColors = [...warningColors].reverse();
    infoColors = [...infoColors].reverse();
    successColors = [...successColors].reverse();
  }

  return {
    primary: {
      lighter: primaryColors[0],
      100: primaryColors[1],
      200: primaryColors[2],
      light: primaryColors[3],
      400: primaryColors[4],
      main: primaryColors[5],
      dark: primaryColors[6],
      700: primaryColors[7],
      darker: primaryColors[8],
      900: primaryColors[9],
      contrastText
    },
    secondary: {
      lighter: secondaryColors[0],
      100: secondaryColors[1],
      200: secondaryColors[2],
      light: secondaryColors[3],
      400: secondaryColors[4],
      500: secondaryColors[5],
      main: secondaryColors[6],
      dark: secondaryColors[7],
      800: secondaryColors[8],
      darker: secondaryColors[9],
      contrastText
    },
    error: {
      lighter: errorColors[0],
      light: errorColors[1],
      main: errorColors[2],
      dark: errorColors[3],
      darker: errorColors[4],
      contrastText
    },
    warning: {
      lighter: warningColors[0],
      light: warningColors[1],
      main: warningColors[2],
      dark: warningColors[3],
      darker: warningColors[4],
      contrastText
    },
    info: {
      lighter: infoColors[0],
      light: infoColors[1],
      main: infoColors[2],
      dark: infoColors[3],
      darker: infoColors[4],
      contrastText
    },
    success: {
      lighter: successColors[0],
      light: successColors[1],
      main: successColors[2],
      dark: successColors[3],
      darker: successColors[4],
      contrastText
    }
  };
}
