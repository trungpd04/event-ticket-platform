import { Box, Divider, Typography } from '@mui/material';

// third-party
import { useIntl } from 'react-intl';

// ==============================|| AUTH DIVIDER ||============================== //

interface AuthDividerProps {
  text?: string;
}

export default function AuthDivider({ text }: AuthDividerProps) {
  const intl = useIntl();
  const dividerText = text || intl.formatMessage({ id: 'auth.divider.default' });

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
      <Divider sx={{ flex: 1, borderColor: '#303030' }} />
      <Typography variant="caption" sx={{ color: '#999', whiteSpace: 'nowrap' }}>
        {dividerText}
      </Typography>
      <Divider sx={{ flex: 1, borderColor: '#303030' }} />
    </Box>
  );
}
