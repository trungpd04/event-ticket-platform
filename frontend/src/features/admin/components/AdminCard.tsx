// material-ui
import Paper from '@mui/material/Paper';
import { SxProps, Theme } from '@mui/material/styles';

// ==============================|| ADMIN CARD ||============================== //

interface AdminCardProps {
  children: React.ReactNode;
  sx?: SxProps<Theme>;
}

export default function AdminCard({ children, sx }: AdminCardProps) {
  return (
    <Paper
      sx={{
        bgcolor: 'secondary.100',
        borderRadius: 4,
        p: 3,
        ...sx
      }}
    >
      {children}
    </Paper>
  );
}
