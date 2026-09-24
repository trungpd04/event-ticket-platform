import { forwardRef } from 'react';

// material-ui
import Select, { SelectProps } from '@mui/material/Select';

// ==============================|| EVENT SELECT ||============================== //

const EventSelect = forwardRef<HTMLSelectElement, SelectProps<unknown>>(({ sx, ...others }, ref) => (
  <Select
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

EventSelect.displayName = 'EventSelect';

export default EventSelect;
