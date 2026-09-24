import { forwardRef } from 'react';

// material-ui
import Chip, { ChipProps } from '@mui/material/Chip';

// ==============================|| EVENT CHIP ||============================== //

const EventChip = forwardRef<HTMLDivElement, ChipProps>(({ sx, ...others }, ref) => (
  <Chip
    ref={ref}
    sx={{
      borderRadius: 2,
      fontWeight: 600,
      ...sx
    }}
    {...others}
  />
));

EventChip.displayName = 'EventChip';

export default EventChip;
