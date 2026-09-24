// material-ui
import { TypographyVariantsOptions } from '@mui/material/styles';

// types
import { FontFamily } from 'types/config';

// ==============================|| DEFAULT THEME - TYPOGRAPHY  ||============================== //
// Scale based on the Evenjo Figma typography tokens (Inter, sizes 10-62px).

export default function Typography(fontFamily: FontFamily): TypographyVariantsOptions {
  return {
    htmlFontSize: 16,
    fontFamily,
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
    h1: {
      fontWeight: 700,
      fontSize: '3.875rem', // 62px
      lineHeight: 1.16
    },
    h2: {
      fontWeight: 700,
      fontSize: '3.5rem', // 56px
      lineHeight: 1.18
    },
    h3: {
      fontWeight: 700,
      fontSize: '3.125rem', // 50px
      lineHeight: 1.2
    },
    h4: {
      fontWeight: 700,
      fontSize: '2.75rem', // 44px
      lineHeight: 1.22
    },
    h5: {
      fontWeight: 700,
      fontSize: '2.5rem', // 40px
      lineHeight: 1.25
    },
    h6: {
      fontWeight: 600,
      fontSize: '2.25rem', // 36px
      lineHeight: 1.28
    },
    subtitle1: {
      fontWeight: 600,
      fontSize: '2rem', // 32px
      lineHeight: 1.3
    },
    subtitle2: {
      fontWeight: 600,
      fontSize: '1.75rem', // 28px
      lineHeight: 1.32
    },
    body1: {
      fontSize: '1rem', // 16px
      lineHeight: 1.5
    },
    body2: {
      fontSize: '0.875rem', // 14px
      lineHeight: 1.5
    },
    caption: {
      fontWeight: 400,
      fontSize: '0.75rem', // 12px
      lineHeight: 1.66
    },
    overline: {
      fontSize: '0.625rem', // 10px
      lineHeight: 1.66
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      fontSize: '1rem'
    }
  };
}
