import { Box, Divider, Typography } from '@mui/material';

// ==============================|| AUTH DIVIDER ||============================== //

interface AuthDividerProps {
  text?: string;
}

export default function AuthDivider({ text = 'Or continue with' }: AuthDividerProps) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
      <Divider sx={{ flex: 1, borderColor: '#303030' }} />
      <Typography variant="caption" sx={{ color: '#999', whiteSpace: 'nowrap' }}>
        {text}
      </Typography>
      <Divider sx={{ flex: 1, borderColor: '#303030' }} />
    </Box>
  );
}
