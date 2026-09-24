import { forwardRef } from 'react';

// material-ui
import InputAdornment from '@mui/material/InputAdornment';
import TextField, { TextFieldProps } from '@mui/material/TextField';

// ==============================|| AUTH INPUT ||============================== //

const AuthInput = forwardRef<HTMLInputElement, TextFieldProps>(({ InputProps, sx, ...others }, ref) => (
  <TextField
    ref={ref}
    fullWidth
    variant="filled"
    InputProps={{
      ...InputProps,
      disableUnderline: true,
      sx: {
        bgcolor: '#1F1F1F',
        borderRadius: 1,
        height: 56,
        px: 1.5,
        color: '#B3B3B3',
        '&:hover': { bgcolor: '#242424' },
        '&.Mui-focused': { bgcolor: '#1F1F1F' },
        '& .MuiInputAdornment-root': { color: '#999', mr: 1 },
        ...InputProps?.sx
      }
    }}
    InputLabelProps={{
      shrink: true,
      sx: {
        color: '#999',
        fontSize: '0.75rem',
        transform: 'translate(12px, 9px) scale(1)',
        '&.Mui-focused': { color: '#999' }
      }
    }}
    sx={{
      '& .MuiFilledInput-root': {
        bgcolor: '#1F1F1F',
        borderRadius: 1,
        '&:before, &:after': { display: 'none' }
      },
      '& .MuiFilledInput-input': {
        pt: 3,
        pb: 1,
        px: 0,
        fontSize: '1rem',
        color: '#FFFFFF'
      },
      ...sx
    }}
    {...others}
  />
));

AuthInput.displayName = 'AuthInput';

export default AuthInput;
