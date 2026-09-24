import { forwardRef, ReactNode } from 'react';

// material-ui
import Button, { ButtonProps } from '@mui/material/Button';

// ==============================|| AUTH SOCIAL BUTTON ||============================== //

interface AuthSocialButtonProps extends ButtonProps {
  icon?: ReactNode;
}

const AuthSocialButton = forwardRef<HTMLButtonElement, AuthSocialButtonProps>(({ icon, children, sx, ...others }, ref) => (
  <Button
    ref={ref}
    variant="outlined"
    sx={{
      flex: 1,
      height: 60,
      bgcolor: '#1F1F1F',
      borderColor: '#303030',
      borderRadius: 2,
      color: '#FFFFFF',
      '&:hover': { bgcolor: '#242424', borderColor: '#303030' },
      ...sx
    }}
    {...others}
  >
    {icon}
    {children}
  </Button>
));

AuthSocialButton.displayName = 'AuthSocialButton';

export default AuthSocialButton;
