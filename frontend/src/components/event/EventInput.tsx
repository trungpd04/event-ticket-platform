import { forwardRef } from 'react';

// material-ui
import OutlinedInput, { OutlinedInputProps } from '@mui/material/OutlinedInput';

// ==============================|| EVENT INPUT ||============================== //

const EventInput = forwardRef<HTMLInputElement, OutlinedInputProps>(({ sx, ...others }, ref) => (
  <OutlinedInput
    ref={ref}
    fullWidth
    sx={{
      borderRadius: 2,
      bgcolor: 'background.paper',
      ...sx
    }}
    {...others}
  />
));

EventInput.displayName = 'EventInput';

export default EventInput;
