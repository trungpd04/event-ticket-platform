import { useState } from 'react';

// material-ui
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// ==============================|| AUTH TOGGLE ||============================== //

export default function AuthToggle() {
  const [selected, setSelected] = useState<'email' | 'phone'>('email');

  const itemSx = (active: boolean) => ({
    flex: 1,
    py: 1,
    borderRadius: 1.5,
    bgcolor: active ? '#454545' : 'transparent',
    border: active ? '1px solid #242424' : 'none',
    cursor: 'pointer',
    textAlign: 'center' as const
  });

  return (
    <Stack direction="row" spacing={0.5} sx={{ bgcolor: '#242424', p: 0.5, borderRadius: 1.5 }}>
      <Typography variant="body2" sx={{ ...itemSx(selected === 'email'), color: '#FFFFFF' }} onClick={() => setSelected('email')}>
        Email
      </Typography>
      <Typography variant="body2" sx={{ ...itemSx(selected === 'phone'), color: '#999999' }} onClick={() => setSelected('phone')}>
        Phone number
      </Typography>
    </Stack>
  );
}
