import { forwardRef } from 'react';

// material-ui
import Checkbox, { CheckboxProps } from '@mui/material/Checkbox';

// ==============================|| AUTH CHECKBOX ||============================== //

const AuthCheckbox = forwardRef<HTMLButtonElement, CheckboxProps>(({ sx, ...others }, ref) => (
  <Checkbox
    ref={ref}
    sx={{
      color: '#303030',
      p: 0,
      '&.Mui-checked': { color: 'primary.main' },
      '& .MuiSvgIcon-root': { borderRadius: 0.75, bgcolor: '#191919' },
      ...sx
    }}
    {...others}
  />
));

AuthCheckbox.displayName = 'AuthCheckbox';

export default AuthCheckbox;
