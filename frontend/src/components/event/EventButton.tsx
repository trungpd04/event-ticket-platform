import { forwardRef, ElementType } from 'react';

// material-ui
import Button, { ButtonProps } from '@mui/material/Button';

// ==============================|| EVENT BUTTON ||============================== //

const EventButton = forwardRef<HTMLButtonElement, ButtonProps<ElementType>>(({ children, sx, ...others }, ref) => (
  <Button
    ref={ref}
    disableElevation
    size="large"
    sx={{
      borderRadius: 2,
      textTransform: 'none',
      fontWeight: 600,
      ...sx
    }}
    {...others}
  >
    {children}
  </Button>
));

EventButton.displayName = 'EventButton';

export default EventButton;
